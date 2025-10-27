(function () {
  // lazy import via dynamic import (Vite will serve /src/*)
  async function ensure() {
    if (!window.__ocr_ready) {
      const mod = await import('/src/lib/ocr.ts');
      window.__parseOcrText = mod.parseOcrText;
      window.__guessSport  = mod.guessSport;
      window.__ocr_ready = true;
    }
  }

  // Dispatch to the app: MERGE_LEGS (you already have a listener or can add one)
  async function mergeFromText(text) {
    await ensure();
    const legs  = window.__parseOcrText(text);
    const sport = window.__guessSport(text);
    window.dispatchEvent(new CustomEvent('MERGE_LEGS', { detail: { legs, sport } }));
    return { legs, sport };
  }

  // Expose for console/testing
  window.mergeFromText = mergeFromText;
})();
