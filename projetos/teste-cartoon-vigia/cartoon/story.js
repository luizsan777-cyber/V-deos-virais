// Plano de tomadas (motor cartoon-audio-short) — "O vigia que nunca piscava" (ficção original, pt-BR).
// Tempos vêm da narração Kokoro (web/tempos.js, gerado por ferramentas/cartoon.py): toda reação cai 0–3 frames
// antes da palavra. Cenário: ponte de madeira + portão do kit (sem colapso).
import { TEMPOS } from './tempos.js';

export const FPS = 30, TOTAL = TEMPOS.frames, DECK = 6;
const fr = (s) => Math.round(s * FPS);
const fala = (id) => { const x = TEMPOS.falas.find((a) => a.id === id); return { a: fr(x.ini), b: fr(x.fim) }; };
const limpa = (w) => w.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
const palavra = (w, n = 1) => { let c = 0; for (const p of TEMPOS.palavras) if (limpa(p.w) === limpa(w) && ++c === n) return fr(p.ini); throw new Error('palavra ' + w); };

const F_PISCA = fala('pisca').a, F_FINAL = fala('final').a;
const W_NINGUEM = palavra('ninguém'), W_JURAVA = palavra('jurava'), W_PISCOU = palavra('piscou'), W_ATRAV = palavra('atravessou');

export const SHOTS = [
  { id: 'hook', a: 0, b: F_PISCA - 1, light: 'day' },
  { id: 'blink', a: F_PISCA, b: F_FINAL - 1, light: 'day' },
  { id: 'crowd', a: F_FINAL, b: TOTAL - 1, light: 'golden' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;

// ---------- luz ----------
export const LIGHTS = {
  day: { az: 140, el: 46, sky: '#c4d6f2', ground: '#8a8262', hemi: 1.15, sun: '#fff1dc', sunI: 2.5, fog: '#cadcf0', fogNear: 70, fogFar: 900,
    skyTop: '#3f80d4', skyHor: '#c3daf2', sat: 1.12, waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff', vig: 0.2, shadowExt: 14 },
  golden: { az: 30, el: 14, sky: '#9a90c8', ground: '#6a4c40', hemi: 1.05, sun: '#ffb46c', sunI: 2.8, fog: '#f0b88c', fogNear: 60, fogFar: 760,
    skyTop: '#6f6eb0', skyHor: '#ffc27e', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.12, gain: '#fff2e2', waterDeep: '#3d5a86', waterShal: '#d99a6e',
    glint: '#ffe2a8', vig: 0.24, shadowExt: 26 },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });

// ---------- câmeras ----------
const VIG = [-19.0, DECK, -0.2]; // o vigia, na frente do portão
const CAMS = {
  hook: [
    { f: 0, pos: [-16.2, 7.5, 0.9], look: [-19.0, 7.25, -0.2], fov: 38 },
    { f: W_NINGUEM, pos: [-16.9, 7.45, 0.65], look: [-19.0, 7.3, -0.2], fov: 35 },
    { f: F_PISCA - 1, pos: [-17.2, 7.44, 0.55], look: [-19.0, 7.32, -0.2], fov: 33 },
  ],
  blink: [
    { f: F_PISCA, pos: [-17.6, 7.55, 0.3], look: [-19.0, 7.55, -0.2], fov: 34 },
    { f: F_FINAL - 1, pos: [-17.8, 7.52, 0.24], look: [-19.0, 7.55, -0.2], fov: 31, roll: -3 },
  ],
  crowd: [
    { f: F_FINAL, pos: [-23.7, 8.5, 0.15], look: [-8, 6.6, -0.1], fov: 44 },
    { f: TOTAL - 1, pos: [-23.1, 8.35, 0.1], look: [-9, 6.75, -0.1], fov: 41, roll: 2 },
  ],
};
const KICKS = [{ f: W_NINGUEM - 1, a: 0.03 }, { f: W_ATRAV, a: 0.05 }];
export const camAt = (f) => {
  const S = shotAt(f), K = CAMS[S.id];
  let c;
  if (f <= K[0].f) c = { ...K[0] };
  else if (f >= K[K.length - 1].f) c = { ...K[K.length - 1] };
  else for (let i = 0; i < K.length - 1; i++) if (f >= K[i].f && f <= K[i + 1].f) {
    const t = smooth((f - K[i].f) / (K[i + 1].f - K[i].f)), a = K[i], b = K[i + 1];
    c = { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) };
  }
  for (const k of KICKS) { const d = f - k.f; if (d >= 0 && d < 7) { const s = (d % 2 ? -1 : 1) * k.a * (1 - d / 7); c.look = [c.look[0], c.look[1] + s * 3, c.look[2] + s * 2]; c.roll = (c.roll || 0) + s * 20; } }
  c.flash = f >= F_FINAL && f < F_FINAL + 5 ? (1 - (f - F_FINAL) / 5) * 0.7 : 0; // corte de tempo: flash branco
  c.shadowAt = S.id === 'crowd' ? [-12, DECK, 0] : [VIG[0], DECK, 0];
  return c;
};

// ---------- lente ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f), olhos = [VIG[0], 7.35, VIG[2]];
  if (S.id === 'hook') return { focus: dist(C.pos, olhos), cinf: 11 };
  if (S.id === 'blink') return { focus: dist(C.pos, olhos), cinf: 14 };
  return { focus: dist(C.pos, [-12, 7, 0]), cinf: 3 };
};

// ---------- mundo (sem colapso, bandeira tremulando) ----------
export const worldAt = () => ({ collapse: 0, banner: 'wave', bannerFall: 0, old: false, braceFall: 0, helmet: null });

// ---------- personagens ----------
const VIGIA = { tunic: '#2f6f8f', cape: '#e0a53a', skin: '#c99067', helmet: true, armor: false, spear: true, shield: false, moustache: '#2b211c' };
const POVO = ['civA', 'civB', 'civC', 'toga', 'workA', 'workB'];
const blinkAt = (f, seed) => { const per = 38 + (seed * 17) % 31, ph = (f + seed * 13) % per; return ph < 2 ? 0.5 : ph < 4 ? 1 : 0; };
const R = (T, who, o, pos, extra = {}) => ({ key: (typeof who === 'string' ? who : 'vigia') + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });

// multidão: cada pessoa entra correndo com 2 frames de atraso e atravessa a ponte (+x)
const corredores = (f) => {
  const out = [];
  for (let i = 0; i < 16; i++) {
    const t0 = F_FINAL - 6 + i * 2.2, d = f - t0;
    if (d < 0) continue;
    const x = -20.6 + d * 0.3, z = [0.55, -1.15, 1.0, 0.25, -0.85, 1.35][i % 6] + (i % 2 ? 0.1 : -0.1);
    if (x > 22) continue;
    out.push({ i, x, z, step: q(((f * 0.18 + i * 0.37) % 1), 2) });
  }
  return out;
};

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const tint = S.light === 'golden' ? '#ffe2c8' : '#ffffff';
  // olhar varrendo a ponte, cabeça firme; aponta em "ninguém"
  const varre = q(0.55 * Math.sin(f * 0.11), 2);
  if (S.id === 'hook') {
    const aponta = f >= W_NINGUEM - 2 && f < W_NINGUEM + 26;
    const firme = f >= W_JURAVA - 2;
    out.push(R(T, VIGIA, { seed: 5, expr: firme ? 'stubborn' : 'stern', look: aponta ? 0.5 : varre, L: aponta ? 'point' : 'hip', blink: blinkAt(f, 5),
      headTilt: aponta ? q(4 * Math.sin((f - W_NINGUEM) * 0.5), 1) : 0, bob: aponta && f < W_NINGUEM + 4 ? 0.015 : 0 }, VIG, { tint }));
    // um passante tenta escapar atrás dele (e desiste)
    const w = (f % 20) / 20;
    out.push(R(T, 'civA', { seed: 11, step: q(w), facing: 1, expr: f > W_NINGUEM ? 'nervous' : 'neutral', blink: blinkAt(f, 11) }, [-22.4 + Math.min(f, W_NINGUEM) * 0.01, DECK, 1.7], { tint }));
  }
  if (S.id === 'blink') {
    // piscada longa e satisfeita: fecha os olhos devagar em "piscou"
    const fecha = f >= W_PISCOU - 3 ? 1 : f >= W_PISCOU - 8 ? 0.5 : 0;
    out.push(R(T, VIGIA, { seed: 5, expr: fecha ? 'smile_closed' : 'stern', blink: fecha, look: 0, L: 'hip', headTilt: q(-2 * ramp(f, W_PISCOU, W_PISCOU + 20), 1) }, VIG, { tint }));
  }
  if (S.id === 'crowd') {
    const acorda = f >= W_ATRAV + 6;
    out.push(R(T, VIGIA, { seed: 5, expr: acorda ? 'shock' : 'smile_closed', blink: acorda ? 0 : 1, L: acorda ? 'up' : 'hip', look: acorda ? 0.4 : 0,
      headTilt: acorda ? q(3 * Math.sin(f * 0.9), 1) : 0, bob: acorda && f < W_ATRAV + 10 ? 0.03 : 0 }, [-19.4, DECK, -0.5], { tint, order: 3 }));
    for (const c of corredores(f)) {
      out.push(R(T, POVO[c.i % POVO.length], { seed: 20 + c.i, step: c.step, facing: 1, expr: ['grin', 'laugh', 'whistle', 'smile'][c.i % 4], bob: q(Math.abs(Math.sin(c.step * Math.PI * 2)) * 0.02, 3), blink: blinkAt(f, 20 + c.i) },
        [c.x, DECK, c.z], { tint }));
    }
  }
  return out;
};

// ---------- efeitos 2D ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.id === 'crowd') {
    for (const c of corredores(f)) {
      const t = q(((f * 0.12 + c.i * 0.29) % 1), 2);
      out.push(FX('poeira' + t, (p) => T.fxDust(p, t, '#e8d6b8'), [c.x - 0.6, DECK, c.z], 0.7, { tint: '#ffe2c8' }));
    }
    if (f >= W_ATRAV + 6 && f < W_ATRAV + 22) {
      const t = q((f - W_ATRAV - 6) / 16, 2);
      out.push(FX('susto' + t, (p) => T.fxBurst(p, t), [-19.4, DECK + 2.1, -0.5], 0.8));
    }
  }
  if (S.id === 'blink' && f >= W_PISCOU) {
    const t = q(((f - W_PISCOU) / 30) % 1, 2);
    out.push(FX('brilho' + t, (p) => T.fxStars(p, t), [VIG[0] + 0.1, 7.9, VIG[2] + 0.2], 0.4));
  }
  return out;
};
