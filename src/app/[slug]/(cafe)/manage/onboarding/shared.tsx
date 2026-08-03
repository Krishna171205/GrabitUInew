import type { CSSProperties } from 'react';

const STEPS = ['Business', 'KYC', 'Bank', 'Documents', 'Review'];

/**
 * Cashfree accepts any ONE of these as proof the business exists, and requires one.
 * Udyam leads because it is the only one a cafe without paperwork can get today:
 * free, online, issued instantly against Aadhaar and PAN.
 */
export const BUSINESS_PROOFS = [
  { value: 'udyam_certificate', label: 'Udyam registration certificate (all 4 pages)' },
  { value: 'shop_establishment', label: 'Shops & Establishment licence (Gumasta)' },
  { value: 'municipal_licence', label: 'Municipal or trade licence' },
  { value: 'utility_bill', label: 'Utility bill (electricity, water, landline)' },
  { value: 'gst_cert', label: 'GST, VAT or CST certificate' },
  { value: 'income_tax_return_full', label: 'Complete income tax return (not the acknowledgement)' },
  { value: 'tax_return', label: 'Sales tax return' },
  { value: 'registration_proof', label: 'Sales, service or professional tax registration' },
  { value: 'roc_certificate', label: 'Registrar of Companies certificate' },
] as const;

/**
 * Cashfree validates the registered state on the business address, so this is a
 * fixed list rather than free text — a typo here fails KYC two days later.
 */
export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

/** Step progress header shared by every onboarding wizard screen. */
export function OnboardingSteps({ current }: { current: number }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 6 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i < current ? 'var(--gb-primary)' : 'var(--gb-line-2)' }} />
        ))}
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--gb-muted)', marginTop: 8 }}>
        Step {current} of {STEPS.length} · {STEPS[current - 1]}
      </div>
    </div>
  );
}

export const fieldWrap: CSSProperties = { marginTop: 16 };

export const labelStyle: CSSProperties = {
  fontSize: 12.5, fontWeight: 700, color: 'var(--gb-muted)', marginBottom: 8, display: 'block',
};

export const inputStyle: CSSProperties = {
  width: '100%', height: 56, padding: '0 16px', border: '1.5px solid var(--gb-line-2)', borderRadius: 14,
  fontSize: 15, fontWeight: 600, fontFamily: 'var(--gb-sans)', color: 'var(--gb-text)', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
};

export const primaryButtonStyle: CSSProperties = {
  width: '100%', marginTop: 26, background: 'var(--gb-primary)', color: '#fff', border: 'none', borderRadius: 14,
  height: 56, fontSize: 16, fontWeight: 800, boxShadow: '0 12px 24px -10px rgba(177,90,50,.6)',
};

export const secondaryButtonStyle: CSSProperties = {
  width: '100%', marginTop: 10, background: 'none', color: 'var(--gb-muted)', border: 'none',
  height: 44, fontSize: 14, fontWeight: 700, cursor: 'pointer',
};
