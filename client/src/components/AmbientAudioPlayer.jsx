import React, { useEffect, useRef } from 'react';

export default function AmbientAudioPlayer({ isPlaying }) {
  const audioCtxRef = useRef(null);
  const osc1Ref = useRef(null);
  const osc2Ref = useRef(null);
  const gainRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        // Master gain node
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
        masterGain.connect(ctx.destination);
        gainRef.current = masterGain;

        // Biquad filter for smooth warm gallery acoustics
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);
        filter.connect(masterGain);

        // Low drone synth 1 (A2 - 110Hz)
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(110, ctx.currentTime);
        osc1.connect(filter);
        osc1.start();
        osc1Ref.current = osc1;

        // Ethereal harmonics synth 2 (E3 - 164.81Hz)
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(164.81, ctx.currentTime);
        const osc2Gain = ctx.createGain();
        osc2Gain.gain.setValueAtTime(0.03, ctx.currentTime);
        osc2.connect(osc2Gain);
        osc2Gain.connect(filter);
        osc2.start();
        osc2Ref.current = osc2;

      } catch (e) {
        console.warn("Web Audio API not allowed without user interaction", e);
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [isPlaying]);

  return null; // pure audio logic engine
}
