// Contexto de tempo: liga a animação à narração (tempos.json gerado por ferramentas/voz.py).
import React, { createContext, useContext } from "react";

export type Palavra = { w: string; ini: number; fim: number; fala: string; destaque: boolean };
export type Fala = { id: string; texto: string; ini: number; fim: number };
export type Tempos = {
  fps: number;
  duracao_s: number;
  frames: number;
  falas: Fala[];
  palavras: Palavra[];
  sfx: { som: string; t: number }[];
  boca: number[];
};

const Ctx = createContext<Tempos | null>(null);
export const TemposProvider: React.FC<{ tempos: Tempos; children: React.ReactNode }> = ({ tempos, children }) => (
  <Ctx.Provider value={tempos}>{children}</Ctx.Provider>
);

const limpa = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/**
 * useTempos(): atalhos para sincronizar com a voz. Tudo devolve FRAMES.
 *  T.fala("gancho").ini / .fim      início/fim de uma fala
 *  T.palavra("girar")               frame em que a palavra começa (1ª ocorrência)
 *  T.palavra("girar", 2)            2ª ocorrência
 *  T.sfx("impacto")                 frame do 1º efeito sonoro com esse nome
 *  T.boca(f)                        abertura da boca 0..1 (lip-sync pela energia da voz)
 *  T.falando(f, "gancho")           se a fala está ativa no frame f
 */
export const useTempos = () => {
  const t = useContext(Ctx);
  if (!t) throw new Error("useTempos fora do TemposProvider");
  const fps = t.fps;
  const fr = (s: number) => Math.round(s * fps);
  return {
    raw: t,
    fps,
    total: t.frames,
    fr,
    fala: (id: string) => {
      const x = t.falas.find((a) => a.id === id);
      if (!x) throw new Error(`fala '${id}' não existe`);
      return { ini: fr(x.ini), fim: fr(x.fim), texto: x.texto };
    },
    palavra: (w: string, n = 1) => {
      let c = 0;
      for (const p of t.palavras) if (limpa(p.w) === limpa(w) && ++c === n) return fr(p.ini);
      throw new Error(`palavra '${w}' (#${n}) não existe na narração`);
    },
    sfx: (som: string, n = 1) => {
      const l = t.sfx.filter((s) => s.som === som);
      if (!l[n - 1]) throw new Error(`sfx '${som}' #${n} não existe`);
      return fr(l[n - 1].t);
    },
    boca: (f: number) => t.boca[Math.max(0, Math.min(t.boca.length - 1, f))] ?? 0,
    falando: (f: number, id?: string) =>
      t.falas.some((a) => (!id || a.id === id) && f >= fr(a.ini) && f < fr(a.fim)),
  };
};
