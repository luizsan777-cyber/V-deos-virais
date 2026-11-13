// Substitui o pacote "remotion" no bundle do HyperFrames: o kit só usa random(seed) (determinístico).
// Mesmo algoritmo do Remotion (mulberry32 sobre o hash da semente), para os mesmos "acasos" nos dois motores.
const mulberry32 = (a: number) => {
  let t = a + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const hashCode = (str: string) => {
  let i = 0, chr = 0, hash = 0;
  for (i = 0; i < str.length; i++) { chr = str.charCodeAt(i); hash = (hash << 5) - hash + chr; hash |= 0; }
  return hash;
};
export const random = (seed: number | string | null): number => {
  if (seed === null) throw new Error("random(null) não é determinístico");
  if (typeof seed === "string") return mulberry32(hashCode(seed));
  return mulberry32(seed * 10000000000);
};
