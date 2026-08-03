'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MS } from '@/components/gb/kit';
import { OnboardingSteps, labelStyle, primaryButtonStyle, fieldWrap, BUSINESS_PROOFS } from '../shared';

interface UploadedDocument { type: string; original_name: string | null }
interface View { business_type: string | null; documents: UploadedDocument[] }

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,application/pdf';

/**
 * A slot the owner has to fill. `choices` means Cashfree accepts any one of
 * several documents here, so the owner picks which one they actually have.
 */
interface Slot {
  id: string;
  label: string;
  help: string;
  fixedType?: string;
  choices?: readonly { value: string; label: string }[];
}

const PAN: Slot = {
  id: 'pan',
  label: 'PAN card',
  help: 'The business PAN, or your own if the cafe trades under your name.',
  fixedType: 'pan_card',
};

const FSSAI: Slot = {
  id: 'fssai',
  label: 'FSSAI licence',
  help: 'The food licence certificate, not just the number.',
  fixedType: 'fssai_license',
};

const CHEQUE: Slot = {
  id: 'cheque',
  label: 'Cancelled cheque',
  help: 'Or a bank statement page showing the account number, IFSC and your name.',
  fixedType: 'cancelled_cheque',
};

const BUSINESS_PROOF: Slot = {
  id: 'business_proof',
  label: 'Proof your business exists',
  help: 'Any one of these. If you have none, Udyam registration is free and issued instantly online.',
  choices: BUSINESS_PROOFS,
};

const PARTNERSHIP_PROOF: Slot = {
  id: 'entity_proof',
  label: 'Partnership deed',
  help: 'Your partnership deed, or the Registrar of Firms certificate.',
  fixedType: 'partnership_deed',
};

function slotsFor(businessType: string | null): Slot[] {
  const proof = businessType === 'partnership' ? PARTNERSHIP_PROOF : BUSINESS_PROOF;
  return [PAN, FSSAI, proof, CHEQUE];
}

export default function DocumentsStep() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [view, setView] = useState<View | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  // Which document the owner picked, for slots that accept several.
  const [choice, setChoice] = useState<Record<string, string>>({});
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(
    () => fetch('/api/proxy/grabit/vendor/onboarding')
      .then((r) => r.json())
      .then((d: View) => setView({ business_type: d.business_type, documents: d.documents ?? [] })),
    [],
  );

  useEffect(() => { load(); }, [load]);

  const uploadedTypes = new Set((view?.documents ?? []).map((d) => d.type));
  const slots = slotsFor(view?.business_type ?? null);

  function typeFor(slot: Slot): string | null {
    if (slot.fixedType) return slot.fixedType;
    return choice[slot.id] ?? null;
  }

  function filledType(slot: Slot): string | null {
    if (slot.fixedType) return uploadedTypes.has(slot.fixedType) ? slot.fixedType : null;
    return slot.choices?.find((c) => uploadedTypes.has(c.value))?.value ?? null;
  }

  async function upload(slot: Slot, file: File) {
    const type = typeFor(slot);
    if (!type) { setError('Choose which document you are uploading first'); return; }
    if (file.size > MAX_BYTES) { setError('That file is over 8 MB. Try a photo instead of a scan.'); return; }

    setBusy(slot.id);
    setError('');
    try {
      // Presign, PUT straight to S3, then tell the backend where it landed. The file
      // never passes through our server.
      const presignRes = await fetch('/api/proxy/grabit/vendor/documents/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original_name: file.name, content_type: file.type }),
      });
      const presign = await presignRes.json();
      if (!presignRes.ok) throw new Error(presign.error || 'Could not start the upload');

      const put = await fetch(presign.url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      if (!put.ok) throw new Error('Upload failed, please try again');

      const registerRes = await fetch('/api/proxy/grabit/vendor/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          s3_key: presign.key,
          original_name: file.name,
          mime: file.type,
          size: file.size,
        }),
      });
      const registered = await registerRes.json();
      if (!registerRes.ok) throw new Error(registered.error || 'Could not save the document');

      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(null);
    }
  }

  if (!view) return null;

  const allFilled = slots.every((s) => filledType(s) !== null);

  return (
    <div className="gb-app">
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', padding: '32px 26px 40px' }}>
        <OnboardingSteps current={4} />
        <div className="gb-serif" style={{ fontSize: 24, fontWeight: 500, marginTop: 18 }}>Your documents</div>
        <div style={{ fontSize: 14, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 4, marginBottom: 22 }}>
          Photos from your phone are fine, as long as all four corners and the text are clear.
          We send these to our payment partner for you.
        </div>

        {slots.map((slot) => {
          const filled = filledType(slot);
          const existing = view.documents.find((d) => d.type === filled);
          const uploading = busy === slot.id;

          return (
            <div key={slot.id} style={fieldWrap}>
              <label style={labelStyle}>{slot.label}</label>

              {slot.choices && !filled && (
                <select
                  value={choice[slot.id] ?? ''}
                  onChange={(e) => setChoice({ ...choice, [slot.id]: e.target.value })}
                  style={{
                    width: '100%', height: 48, padding: '0 14px', border: '1.5px solid var(--gb-line-2)',
                    borderRadius: 12, fontSize: 14.5, fontWeight: 600, fontFamily: 'var(--gb-sans)',
                    color: 'var(--gb-text)', background: '#fff', marginBottom: 10, boxSizing: 'border-box',
                    appearance: 'auto',
                  }}
                >
                  <option value="">Which one do you have?</option>
                  {slot.choices.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              )}

              <input
                ref={(el) => { inputs.current[slot.id] = el; }}
                type="file"
                accept={ACCEPT}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) upload(slot, file);
                }}
              />

              <button
                type="button"
                onClick={() => inputs.current[slot.id]?.click()}
                disabled={uploading}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                  border: `1.5px ${filled ? 'solid' : 'dashed'} ${filled ? 'var(--gb-green)' : 'var(--gb-line-2)'}`,
                  borderRadius: 14, background: filled ? 'rgba(45,138,86,.06)' : '#fff',
                  cursor: uploading ? 'wait' : 'pointer', textAlign: 'left',
                }}
              >
                <MS
                  name={filled ? 'check_circle' : 'upload_file'}
                  size={22}
                  fill={!!filled}
                  color={filled ? 'var(--gb-green)' : 'var(--gb-muted)'}
                />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--gb-text)' }}>
                    {uploading ? 'Uploading…' : filled ? (existing?.original_name ?? 'Uploaded') : 'Take a photo or choose a file'}
                  </span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 2 }}>
                    {filled ? 'Tap to replace' : slot.help}
                  </span>
                </span>
              </button>
            </div>
          );
        })}

        <button
          onClick={() => router.push(`/${slug}/manage/onboarding/review`)}
          disabled={!allFilled}
          style={{ ...primaryButtonStyle, opacity: allFilled ? 1 : 0.55, cursor: allFilled ? 'pointer' : 'not-allowed' }}
        >
          Continue
        </button>
        {!allFilled && (
          <p style={{ fontSize: 12.5, color: 'var(--gb-muted)', fontWeight: 500, marginTop: 10, textAlign: 'center' }}>
            All four are needed before we can submit you for verification.
          </p>
        )}
        {error && <p style={{ color: 'var(--gb-danger)', fontSize: 14, marginTop: 12, textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
}
