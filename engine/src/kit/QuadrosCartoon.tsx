// Fundo vindo do motor 2D "cartoon-audio-short" (three.js + cards desenhados): um JPG por frame,
// gerado por ferramentas/cartoon.py em projetos/<slug>/build/cartoon/quadros/ (servido como public dir).
// O Remotion continua sendo o compositor: legendas pt-BR, TextoPop, vinheta etc. vão por cima.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";

export const QuadrosCartoon: React.FC<{ total?: number }> = ({ total }) => {
  const f = useCurrentFrame();
  const n = total ? Math.min(f, total - 1) : f;
  return (
    <AbsoluteFill>
      <Img src={staticFile(`f${String(n).padStart(4, "0")}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  );
};
