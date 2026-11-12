// Elenco fixo do episódio (definido UMA vez para manter consistência entre cenas) + helpers de tempo por cena.
import React from "react";
import { useCurrentFrame } from "remotion";
import { useTempos } from "../../engine/src/kit/tempo";
import { Visual, ESTILOS_PERSONAGEM, Estilo } from "../../engine/src/kit/Personagem";
import { Celular } from "./pecas";

export const LEO: Visual = { pele: "#bc805e", cabelo: "cacheado", corCabelo: "#221b2e", roupa: "moletom", cor: "#e53935", cor2: "#ffd2c4", calca: "#273a59", sapato: "#e8eaef", corOlho: "#3b2416", corpo: "medio" };
export const JORNALISTA: Visual = { pele: "#8d5a3b", cabelo: "longo", corCabelo: "#1b1210", roupa: "terno", cor: "#2e4a7d", cor2: "#e4572e", calca: "#2b2d42", sapato: "#2a2220", corOlho: "#2a1a10", corpo: "medio" };
export const TRABALHADORA: Visual = { pele: "#c98e62", cabelo: "rabo", corCabelo: "#3a2416", roupa: "camiseta", cor: "#ff8c1a", calca: "#2d3b66", sapato: "#3a2a20", corOlho: "#3b2416", corpo: "medio" };
export const MILITAR_A: Visual = { pele: "#e0b18e", cabelo: "curto", corCabelo: "#2c2520", roupa: "camiseta", cor: "#5b6b3a", calca: "#465230", sapato: "#1f1f1f", corpo: "forte" };
export const MILITAR_B: Visual = { pele: "#7a4a2c", cabelo: "careca", corCabelo: "#1a1410", roupa: "camiseta", cor: "#4f5d33", calca: "#465230", sapato: "#1f1f1f", barba: "bigode", corpo: "medio" };
export const TOQUIO: Visual = { pele: "#f1c7a3", cabelo: "curto", corCabelo: "#151515", roupa: "terno", cor: "#4a5568", cor2: "#c53030", calca: "#2d3748", corpo: "magro", oculos: true };
export const EUROPA: Visual = { pele: "#f3d6bb", cabelo: "coque", corCabelo: "#b5532a", roupa: "moletom", cor: "#2f855a", cor2: "#c6f6d5", calca: "#2a4365", corpo: "medio" };
export const EUA: Visual = { pele: "#6b4026", cabelo: "espetado", corCabelo: "#151010", roupa: "camiseta", cor: "#f6c343", calca: "#2b3a67", corpo: "medio" };
export const DIPLOMATA_BR: Visual = { pele: "#a56e4a", cabelo: "coque", corCabelo: "#24160f", roupa: "terno", cor: "#1e3a5f", cor2: "#1f9d55", calca: "#1a2236", sapato: "#1a1a1a", corpo: "medio" };
export const DIPLOMATA_B: Visual = { pele: "#e0b18e", cabelo: "careca", corCabelo: "#8a8a8a", roupa: "terno", cor: "#4a5568", cor2: "#2b6cb0", calca: "#2d3748", barba: "curta", corpo: "idoso" };
export const DIPLOMATA_C: Visual = { pele: "#5a3825", cabelo: "curto", corCabelo: "#111", roupa: "terno", cor: "#1a202c", cor2: "#d69e2e", calca: "#1a202c", corpo: "medio" };

export const EST = ESTILOS_PERSONAGEM.conto;
export const EST_NOITE: Estilo = { ...ESTILOS_PERSONAGEM.noite, brilho: 0.35 };
export const EST_DRAMA: Estilo = { ...ESTILOS_PERSONAGEM.terror, sombra: 0.42, brilho: 0.45, corBrilho: "#ff9a6b" };

/** Tempo local da cena: lf = frame dentro da cena; P("palavra", n) = frame local da palavra. */
export const useCena = (inicio: number) => {
  const f = useCurrentFrame();
  const T = useTempos();
  const limpa = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  // n-ésima ocorrência da palavra A PARTIR do início desta cena (palavras repetidas em outras falas não confundem)
  const P = (w: string, n = 1) => {
    let c = 0;
    for (const p of T.raw.palavras) if (T.fr(p.ini) >= inicio && limpa(p.w) === limpa(w) && ++c === n) return T.fr(p.ini) - inicio;
    throw new Error(`palavra '${w}' (#${n}) não existe depois do frame ${inicio}`);
  };
  return { lf: f - inicio, f, T, P, F: (id: string) => ({ ini: T.fala(id).ini - inicio, fim: T.fala(id).fim - inicio }) };
};

/** Celular pequeno para segurar na mão do personagem (item da mão), tela acesa. */
export const CelularMao: React.FC<{ f: number; tela?: React.ReactNode; escala?: number; rot?: number }> = ({ f, tela, escala = 0.24, rot = -8 }) => (
  <g transform="translate(4 -30)">
    <Celular f={f} escala={escala} rot={rot} luz={0.6}>{tela ?? <rect width={300} height={600} fill="#4a6fd1" />}</Celular>
  </g>
);
