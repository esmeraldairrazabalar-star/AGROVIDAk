/**
 * AgroVida - Comparador visual de imágenes (sin IA externa)
 * Extrae características de color, distribución y textura de una foto
 * y las compara con las fotos del catálogo de enfermedades.
 *
 * Funciona con píxeles RGBA, por eso se puede probar fuera del navegador.
 */
(function (root) {
  const SIZE = 64; // Las fotos se reducen a 64x64 para compararlas

  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return [h, max === 0 ? 0 : d / max, max];
  }

  // Clasifica cada píxel en una categoría de tejido vegetal
  // 0 verde sano | 1 amarillo/clorosis | 2 marrón/necrosis | 3 oscuro/negro | 4 blanco/gris (moho, hongos) | 5 otros
  function clasificar(h, s, v) {
    if (v < 0.22) return 3;
    if (s < 0.14) return v > 0.62 ? 4 : 3;
    if (h >= 70 && h <= 170) return 0;
    if (h >= 42 && h < 70) return 1;
    if ((h < 42 || h > 330) && v < 0.62) return 2;
    if (h < 42) return 2;
    return 5;
  }

  function extractFeatures(rgba, w, h) {
    const HB = 18, SB = 3, VB = 3;
    const hist = new Float32Array(HB * SB * VB);
    const clases = new Float32Array(6);
    const grid = new Float32Array(4 * 4 * 3);
    const gridCount = new Float32Array(16);
    const gray = new Float32Array(w * h);
    let n = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
        const [hh, ss, vv] = rgbToHsv(r, g, b);
        const hb = Math.min(HB - 1, Math.floor(hh / (360 / HB)));
        const sb = Math.min(SB - 1, Math.floor(ss * SB));
        const vb = Math.min(VB - 1, Math.floor(vv * VB));
        hist[(hb * SB + sb) * VB + vb] += 1;
        clases[clasificar(hh, ss, vv)] += 1;

        const gx = Math.min(3, Math.floor((x / w) * 4));
        const gy = Math.min(3, Math.floor((y / h) * 4));
        const gi = gy * 4 + gx;
        grid[gi * 3] += r; grid[gi * 3 + 1] += g; grid[gi * 3 + 2] += b;
        gridCount[gi] += 1;

        gray[y * w + x] = 0.299 * r + 0.587 * g + 0.114 * b;
        n++;
      }
    }

    for (let k = 0; k < hist.length; k++) hist[k] /= n;
    for (let k = 0; k < clases.length; k++) clases[k] /= n;
    for (let gi = 0; gi < 16; gi++) {
      for (let c = 0; c < 3; c++) grid[gi * 3 + c] /= (gridCount[gi] * 255 || 1);
    }

    // Textura: intensidad media de bordes y proporción de bordes fuertes
    let sumGrad = 0, strong = 0, cnt = 0;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const gx = gray[y * w + x + 1] - gray[y * w + x - 1];
        const gy = gray[(y + 1) * w + x] - gray[(y - 1) * w + x];
        const mag = Math.sqrt(gx * gx + gy * gy) / 255;
        sumGrad += mag;
        if (mag > 0.18) strong++;
        cnt++;
      }
    }
    const textura = [Math.min(1, (sumGrad / cnt) * 4), strong / cnt];

    return {
      hist: Array.from(hist),
      clases: Array.from(clases),
      grid: Array.from(grid),
      textura
    };
  }

  function histIntersection(a, b) {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += Math.min(a[i], b[i]);
    return s; // 0..1
  }

  function clasesSim(a, b) {
    let d = 0;
    for (let i = 0; i < a.length; i++) d += Math.abs(a[i] - b[i]);
    return 1 - d / 2;
  }

  function gridSim(a, b) {
    let d = 0;
    for (let i = 0; i < a.length; i++) d += Math.abs(a[i] - b[i]);
    return 1 - d / a.length;
  }

  function mirrorGrid(g) {
    const out = new Array(g.length);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        for (let c = 0; c < 3; c++) out[(y * 4 + x) * 3 + c] = g[(y * 4 + (3 - x)) * 3 + c];
      }
    }
    return out;
  }

  function texturaSim(a, b) {
    return 1 - (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])) / 2;
  }

  // Devuelve un valor entre 0 y 1 (1 = imágenes casi idénticas)
  function compare(fa, fb) {
    const h = histIntersection(fa.hist, fb.hist);
    const c = clasesSim(fa.clases, fb.clases);
    const g = Math.max(gridSim(fa.grid, fb.grid), gridSim(fa.grid, mirrorGrid(fb.grid)));
    const t = texturaSim(fa.textura, fb.textura);
    return 0.45 * h + 0.25 * c + 0.15 * g + 0.15 * t;
  }

  const api = { SIZE, extractFeatures, compare };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Similitud = api;
})(typeof window !== "undefined" ? window : globalThis);
