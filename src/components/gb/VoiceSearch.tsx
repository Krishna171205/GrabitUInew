'use client';
/**
 * Voice search mic button (Web Speech API). Drop it next to any search input:
 * tapping it asks for mic access, transcribes speech (with live interim text),
 * and pushes the result to the parent via onResult. Shows a self-dismissing
 * toast for permission denial / no-speech / unsupported browsers.
 *
 * Note: the app's Permissions-Policy header must allow microphone=(self) or the
 * browser rejects the request before it ever prompts (next.config.ts).
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MS } from './kit';

// webkitSpeechRecognition isn't in lib.dom typings — model the bits we use.
interface SR {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; [i: number]: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}
type SRCtor = new () => SR;

function getRecognition(): SRCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function VoiceSearch({ onResult }: { onResult: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const [toast, setToast] = useState('');
  const recRef = useRef<SR | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { recRef.current?.abort(); }, []);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3200);
  }

  function stop() {
    recRef.current?.stop();
    setListening(false);
  }

  function toggle() {
    if (listening) { stop(); return; }
    const Ctor = getRecognition();
    if (!Ctor) { showToast('Voice search isn\'t supported on this browser'); return; }

    const rec = new Ctor();
    rec.lang = 'en-IN';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      const t = transcript.trim();
      if (t) onResult(t);
    };
    rec.onend = () => setListening(false);
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        showToast('Microphone permission is off — enable it in your browser to use voice search');
      } else if (e.error === 'no-speech') {
        showToast('Didn\'t catch that — try speaking again');
      } else if (e.error === 'network') {
        showToast('Voice search needs a connection — try again');
      }
    };
    recRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
      showToast('Voice search isn\'t available right now');
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label={listening ? 'Stop voice search' : 'Search by voice'}
        aria-pressed={listening}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', background: 'none', padding: 4, cursor: 'pointer', flex: 'none',
          color: listening ? 'var(--gb-danger)' : 'var(--gb-primary)',
          animation: listening ? 'pulse-ring 1.2s var(--ease-out) infinite' : 'none',
          borderRadius: '50%',
        }}
      >
        <MS name={listening ? 'graphic_eq' : 'mic'} size={20} fill={listening} color={listening ? 'var(--gb-danger)' : 'var(--gb-primary)'} />
      </button>

      {/* Portaled to document.body: in MenuClient the search bar sits inside a
          grayscale-filtered block, and any CSS filter becomes the containing block
          for position:fixed descendants — the toast would pin to that box (and
          render off-screen) instead of the viewport. createPortal escapes it. */}
      {toast && createPortal(
        <div style={{ position: 'fixed', top: 'calc(16px + env(safe-area-inset-top))', left: 16, right: 16, maxWidth: 448, margin: '0 auto', zIndex: 60, background: 'var(--gb-ink)', color: '#fff', borderRadius: 14, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, boxShadow: 'var(--gb-shadow-bar)', animation: 'fade-in .2s ease' }}>
          <MS name="mic_off" size={18} color="#fff" />
          <span style={{ flex: 1 }}>{toast}</span>
        </div>,
        document.body,
      )}
    </>
  );
}
