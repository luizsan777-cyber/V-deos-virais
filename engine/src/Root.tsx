import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { Video, tempos } from "./projeto.gen";
import { TemposProvider, Tempos } from "./kit/tempo";
import { carregarFontes } from "./kit/fontes";

const Base: React.FC = () => {
  carregarFontes();
  return (
    <TemposProvider tempos={tempos as unknown as Tempos}>
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        <Video />
      </AbsoluteFill>
    </TemposProvider>
  );
};

export const Root: React.FC = () => (
  <Composition id="Video" component={Base} durationInFrames={(tempos as unknown as Tempos).frames} fps={30} width={1080} height={1920} />
);
