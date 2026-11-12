// Palco 3D: ThreeCanvas + câmera animada por chaves + iluminação estilizada com sombras.
// Personagens 2D podem ser posicionados sobre o 3D com projetar() (estilo "2D em mundo 3D").
import React, { useEffect } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { eio, lerp, ramp, ruido, tremor } from "../anim";

export type V3 = [number, number, number];
/** [frame, posição da câmera, ponto que olha, fov] */
export type ChaveCam3D = [number, V3, V3, number?];

const l3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

export const cam3dEm = (f: number, ks: ChaveCam3D[]) => {
  for (let k = 0; k < ks.length - 1; k++) {
    const [f0, p0, a0, v0 = 40] = ks[k], [f1, p1, a1, v1 = 40] = ks[k + 1];
    if (f <= f1) {
      const t = eio(ramp(f, f0, f1));
      return { pos: l3(p0, p1, t), alvo: l3(a0, a1, t), fov: lerp(v0, v1, t) };
    }
  }
  const [, p, a, v = 40] = ks[ks.length - 1];
  return { pos: p, alvo: a, fov: v };
};

const CameraRig: React.FC<{ chaves: ChaveCam3D[]; tremores: number[]; mao: number }> = ({ chaves, tremores, mao }) => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const c = cam3dEm(f, chaves);
  let [tx, ty] = [0, 0];
  for (const em of tremores) {
    const [a, b] = tremor(f, em, 0.08);
    tx += a; ty += b;
  }
  tx += ruido(f / 45, 2) * 0.03 * mao;
  ty += ruido(f / 52, 5) * 0.02 * mao;
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(c.pos[0] + tx, c.pos[1] + ty, c.pos[2]);
  cam.fov = c.fov;
  cam.near = 0.1;
  cam.far = 2000;
  cam.lookAt(c.alvo[0], c.alvo[1], c.alvo[2]);
  cam.updateProjectionMatrix();
  return null;
};

const Renderizador: React.FC<{ exposicao: number }> = ({ exposicao }) => {
  const { gl } = useThree();
  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = exposicao;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl, exposicao]);
  return null;
};

export const Palco3D: React.FC<{
  chaves: ChaveCam3D[];
  fundo?: string;
  neblina?: [string, number, number];
  tremores?: number[];
  mao?: number;
  exposicao?: number;
  children: React.ReactNode;
}> = ({ chaves, fundo = "#0b1030", neblina, tremores = [], mao = 0.6, exposicao = 1.05, children }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} style={{ backgroundColor: fundo }} camera={{ fov: 40, position: [0, 2, 10] }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <Renderizador exposicao={exposicao} />
      <CameraRig chaves={chaves} tremores={tremores} mao={mao} />
      <color attach="background" args={[fundo]} />
      {neblina && <fog attach="fog" args={neblina} />}
      {children}
    </ThreeCanvas>
  );
};

/** Luz de estúdio estilizada: sol com sombra, preenchimento frio e luz de recorte. */
export const LuzesEstilizadas: React.FC<{ sol?: V3; corSol?: string; intensidade?: number; ambiente?: string; recorte?: string }> = ({
  sol = [6, 9, 5], corSol = "#fff1d6", intensidade = 2.6, ambiente = "#6a7bd1", recorte = "#9fe3ff",
}) => (
  <>
    <hemisphereLight args={[ambiente, "#2a1c2c", 0.9]} />
    <directionalLight position={sol} color={corSol} intensity={intensidade} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}
      shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} shadow-bias={-0.0005} />
    <directionalLight position={[-6, 4, -8]} color={recorte} intensity={1.4} />
  </>
);

/** Projeta um ponto 3D para pixels da tela com a mesma câmera do palco (para sobrepor personagens 2D). */
export const projetar = (f: number, chaves: ChaveCam3D[], p: V3, width: number, height: number) => {
  const c = cam3dEm(f, chaves);
  const cam = new THREE.PerspectiveCamera(c.fov, width / height, 0.1, 2000);
  cam.position.set(...c.pos);
  cam.lookAt(...c.alvo);
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam);
  const dist = cam.position.distanceTo(new THREE.Vector3(...p));
  return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height, escala: 10 / dist, visivel: v.z < 1 };
};
