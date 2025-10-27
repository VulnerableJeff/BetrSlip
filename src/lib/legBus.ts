export type Leg = { label: string; odds: number; market?: string; line?: string };

export const ADD_LEG_EVT = 'BETRSLIP_ADD_LEG';

export function emitAddLeg(leg: Leg) {
  try {
    window.dispatchEvent(new CustomEvent(ADD_LEG_EVT, { detail: leg }));
  } catch (e) {
    console.error('emitAddLeg failed', e);
  }
}

// expose globally so you can call from console or non-React code
;(globalThis as any).addLeg = emitAddLeg;
;(window as any).addLeg = emitAddLeg;
