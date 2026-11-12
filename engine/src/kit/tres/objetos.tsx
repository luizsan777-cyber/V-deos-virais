// Objetos 3D estilizados: planeta com continentes e nuvens procedurais + atmosfera, estrelas,
// sol, terreno ondulado, árvores, casas e prédios com material toon e contorno (casco invertido).
import React, { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { rnd } from "../anim";

// ------------------------------------------------------------------ utilidades
const hash = (x: number, y: number, s: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return h - Math.floor(h);
};
const vnoise = (x: number, y: number, s: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const fbm = (x: number, y: number, s: number, oct = 5) => {
  let t = 0, amp = 0.5, fr = 1;
  for (let i = 0; i < oct; i++) { t += amp * vnoise(x * fr, y * fr, s + i); amp *= 0.5; fr *= 2; }
  return t;
};
/** ruído contínuo na esfera (sem costura): amostra 3 planos */
const ruidoEsfera = (lon: number, lat: number, s: number, esc: number, oct = 5) => {
  const x = Math.cos(lat) * Math.cos(lon), y = Math.sin(lat), z = Math.cos(lat) * Math.sin(lon);
  return (fbm(x * esc + 10, y * esc + 3, s, oct) + fbm(y * esc + 7, z * esc + 1, s + 3, oct) + fbm(z * esc + 2, x * esc + 9, s + 6, oct)) / 3;
};

const gradienteToon = (() => {
  let tex: THREE.DataTexture | null = null;
  return () => {
    if (tex) return tex;
    const d = new Uint8Array([70, 70, 70, 255, 160, 160, 160, 255, 235, 235, 235, 255, 255, 255, 255, 255]);
    tex = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat);
    tex.minFilter = tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  };
})();

/** Material toon (sombreamento em faixas, visual de animação). */
export const Toon: React.FC<{ cor: string; emissivo?: string; intensidade?: number }> = ({ cor, emissivo = "#000000", intensidade = 0 }) => (
  <meshToonMaterial color={cor} gradientMap={gradienteToon()} emissive={emissivo} emissiveIntensity={intensidade} />
);

/** Contorno de tinta por casco invertido: envolva uma geometria. */
export const ComContorno: React.FC<{ geo: React.ReactNode; cor: string; espessura?: number; tinta?: string; position?: [number, number, number]; rotation?: [number, number, number]; scale?: number | [number, number, number]; sombra?: boolean }> = ({
  geo, cor, espessura = 0.04, tinta = "#140c18", position, rotation, scale = 1, sombra = true,
}) => {
  const s = typeof scale === "number" ? [scale, scale, scale] : scale;
  return (
    <group position={position} rotation={rotation} scale={s as [number, number, number]}>
      <mesh castShadow={sombra} receiveShadow>
        {geo}
        <Toon cor={cor} />
      </mesh>
      <mesh scale={1 + espessura}>
        {geo}
        <meshBasicMaterial color={tinta} side={THREE.BackSide} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------ planeta
const texturaPlaneta = (seed: number, tipo: "terra" | "marte" | "lua") => {
  const W = 1024, H = 512;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const img = g.createImageData(W, H);
  for (let j = 0; j < H; j++) {
    const lat = (0.5 - j / H) * Math.PI;
    for (let i = 0; i < W; i++) {
      const lon = (i / W) * Math.PI * 2;
      const n = Math.max(0, Math.min(1, (ruidoEsfera(lon, lat, seed, 2.2) - 0.5) * 3.2 + 0.5));
      const k = (j * W + i) * 4;
      let r = 0, gg = 0, b = 0;
      if (tipo === "terra") {
        const polo = Math.abs(lat) > 1.25 + (n - 0.5) * 0.3;
        if (polo) { r = 236; gg = 244; b = 252; }
        else if (n < 0.5) { const d = n / 0.5; r = 20 + 30 * d; gg = 70 + 70 * d; b = 150 + 60 * d; }
        else if (n < 0.52) { r = 222; gg = 205; b = 140; }
        else { const d = Math.min(1, (n - 0.52) / 0.4); const seco = Math.abs(lat) < 0.45 ? 0.5 : 0; r = 70 + 90 * d * (0.5 + seco); gg = 150 - 30 * d; b = 60 + 10 * d; }
      } else if (tipo === "marte") {
        r = 170 + 70 * n; gg = 80 + 40 * n; b = 50 + 20 * n;
      } else {
        const v = 120 + 110 * n; r = gg = b = v;
      }
      img.data[k] = r; img.data[k + 1] = gg; img.data[k + 2] = b; img.data[k + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const texturaNuvens = (seed: number) => {
  const W = 1024, H = 512;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const img = g.createImageData(W, H);
  for (let j = 0; j < H; j++) {
    const lat = (0.5 - j / H) * Math.PI;
    for (let i = 0; i < W; i++) {
      const n = ruidoEsfera((i / W) * Math.PI * 2, lat, seed + 50, 4, 4);
      const a = Math.max(0, Math.min(1, (n - 0.52) * 5));
      const k = (j * W + i) * 4;
      img.data[k] = img.data[k + 1] = img.data[k + 2] = 255;
      img.data[k + 3] = a * 230;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const atmosferaMat = (cor: string) =>
  new THREE.ShaderMaterial({
    uniforms: { cor: { value: new THREE.Color(cor) } },
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 cor; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 3.0); gl_FragColor = vec4(cor, f); }`,
    transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false,
  });

/** Planeta estilizado. rotacao = graus por segundo (ou valor fixo em "giro"). */
export const Planeta: React.FC<{ raio?: number; tipo?: "terra" | "marte" | "lua"; seed?: number; giro?: number; position?: [number, number, number]; nuvens?: boolean; atmosfera?: string; inclinacao?: number }> = ({
  raio = 3, tipo = "terra", seed = 3, giro, position = [0, 0, 0], nuvens = true, atmosfera = "#6cc6ff", inclinacao = 23.4,
}) => {
  const f = useCurrentFrame();
  const tex = useMemo(() => texturaPlaneta(seed, tipo), [seed, tipo]);
  const nuv = useMemo(() => (nuvens && tipo === "terra" ? texturaNuvens(seed) : null), [seed, nuvens, tipo]);
  const atm = useMemo(() => atmosferaMat(atmosfera), [atmosfera]);
  const ang = giro ?? f * 0.004;
  return (
    <group position={position} rotation={[0, 0, (inclinacao * Math.PI) / 180]}>
      <mesh rotation={[0, ang, 0]} castShadow receiveShadow>
        <sphereGeometry args={[raio, 96, 64]} />
        <meshStandardMaterial map={tex} roughness={0.85} metalness={0} />
      </mesh>
      {nuv && (
        <mesh rotation={[0, ang * 1.25 + 0.4, 0]}>
          <sphereGeometry args={[raio * 1.012, 96, 64]} />
          <meshStandardMaterial map={nuv} transparent depthWrite={false} roughness={1} />
        </mesh>
      )}
      {atmosfera && (
        <mesh scale={1.12}>
          <sphereGeometry args={[raio, 64, 48]} />
          <primitive object={atm} attach="material" />
        </mesh>
      )}
    </group>
  );
};

/** Campo de estrelas (pontos) cintilando. */
export const Estrelas: React.FC<{ n?: number; raio?: number }> = ({ n = 2500, raio = 400 }) => {
  const f = useCurrentFrame();
  const geo = useMemo(() => {
    const p = new Float32Array(n * 3), c = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = rnd(`eu${i}`) * 2 - 1, th = rnd(`et${i}`) * Math.PI * 2, r = raio * (0.7 + 0.3 * rnd(`er${i}`));
      const s = Math.sqrt(1 - u * u);
      p.set([r * s * Math.cos(th), r * u, r * s * Math.sin(th)], i * 3);
      const q = 0.7 + 0.3 * rnd(`ec${i}`);
      c.set([q, q * (0.9 + 0.1 * rnd(`eg${i}`)), 1], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    return g;
  }, [n, raio]);
  return (
    <points geometry={geo}>
      <pointsMaterial size={1.6 + 0.3 * Math.sin(f * 0.2)} sizeAttenuation={false} vertexColors transparent opacity={0.9} />
    </points>
  );
};

/** Sol: esfera emissiva + halo. */
export const Sol: React.FC<{ position?: [number, number, number]; raio?: number; cor?: string }> = ({ position = [30, 10, -60], raio = 4, cor = "#ffd27a" }) => {
  const halo = useMemo(() => atmosferaMat(cor), [cor]);
  return (
    <group position={position}>
      <mesh><sphereGeometry args={[raio, 48, 32]} /><meshBasicMaterial color="#fff6dc" /></mesh>
      <mesh scale={1.8}><sphereGeometry args={[raio, 48, 32]} /><primitive object={halo} attach="material" /></mesh>
      <pointLight color={cor} intensity={3} distance={0} decay={0} />
    </group>
  );
};

// ------------------------------------------------------------------ paisagem
/** Terreno ondulado colorido (toon), recebe sombras. */
export const Terreno: React.FC<{ tamanho?: number; cor?: string; cor2?: string; altura?: number; seed?: number }> = ({ tamanho = 80, cor = "#7cc46b", cor2 = "#4f9a4a", altura = 1.2, seed = 1 }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(tamanho, tamanho, 120, 120);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const cols = new Float32Array(pos.count * 3);
    const c1 = new THREE.Color(cor), c2 = new THREE.Color(cor2);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const d = Math.sqrt(x * x + z * z);
      const h = (fbm(x * 0.06, z * 0.06, seed, 4) - 0.5) * altura * 2 * Math.min(1, d / 8);
      pos.setY(i, h);
      const c = c1.clone().lerp(c2, Math.max(0, Math.min(1, (h / altura + 1) / 2)));
      cols.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    g.computeVertexNormals();
    return g;
  }, [tamanho, cor, cor2, altura, seed]);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshToonMaterial vertexColors gradientMap={gradienteToon()} />
    </mesh>
  );
};

/** Árvore estilizada (tronco + copa em camadas), balançando ao vento. */
export const Arvore: React.FC<{ position: [number, number, number]; escala?: number; cor?: string; seed?: number }> = ({ position, escala = 1, cor = "#3f9a52", seed = 1 }) => {
  const f = useCurrentFrame();
  const bal = Math.sin(f * 0.05 + seed) * 0.04;
  return (
    <group position={position} scale={escala} rotation={[0, seed, bal]}>
      <ComContorno geo={<cylinderGeometry args={[0.12, 0.2, 1.4, 10]} />} cor="#7a4b2c" position={[0, 0.7, 0]} />
      <ComContorno geo={<icosahedronGeometry args={[0.9, 2]} />} cor={cor} position={[0, 1.8, 0]} />
      <ComContorno geo={<icosahedronGeometry args={[0.65, 2]} />} cor={cor} position={[0.35, 2.4, 0.1]} />
      <ComContorno geo={<icosahedronGeometry args={[0.55, 2]} />} cor={cor} position={[-0.4, 2.3, -0.1]} />
    </group>
  );
};

/** Casa simples estilizada com telhado e janelas acesas opcionais. */
export const Casa: React.FC<{ position: [number, number, number]; rot?: number; cor?: string; telhado?: string; luz?: number }> = ({ position, rot = 0, cor = "#f2d6a2", telhado = "#c8553d", luz = 0 }) => (
  <group position={position} rotation={[0, rot, 0]}>
    <ComContorno geo={<boxGeometry args={[2, 1.6, 1.8]} />} cor={cor} position={[0, 0.8, 0]} />
    <ComContorno geo={<coneGeometry args={[1.65, 1.1, 4]} />} cor={telhado} position={[0, 2.15, 0]} rotation={[0, Math.PI / 4, 0]} />
    {[-0.5, 0.5].map((x) => (
      <mesh key={x} position={[x, 0.95, 0.91]}>
        <planeGeometry args={[0.42, 0.42]} />
        <meshBasicMaterial color={luz > 0 ? "#ffd27a" : "#33415e"} />
      </mesh>
    ))}
    <mesh position={[0, 0.45, 0.91]}><planeGeometry args={[0.4, 0.8]} /><meshBasicMaterial color="#5a3424" /></mesh>
  </group>
);

/** Prédio (para cidades). */
export const Predio: React.FC<{ position: [number, number, number]; altura?: number; cor?: string; luz?: number; seed?: number }> = ({ position, altura = 6, cor = "#8fa3c9", luz = 0.5, seed = 1 }) => {
  const janelas = useMemo(() => {
    const l: [number, number, boolean][] = [];
    for (let y = 0.8; y < altura - 0.4; y += 0.8) for (const x of [-0.6, 0, 0.6]) l.push([x, y, rnd(`jan${seed}${x}${y}`) < luz]);
    return l;
  }, [altura, luz, seed]);
  return (
    <group position={position}>
      <ComContorno geo={<boxGeometry args={[2, altura, 2]} />} cor={cor} position={[0, altura / 2, 0]} />
      {janelas.map(([x, y, a], i) => (
        <mesh key={i} position={[x, y, 1.01]}><planeGeometry args={[0.32, 0.45]} /><meshBasicMaterial color={a ? "#ffe08a" : "#2c3550"} /></mesh>
      ))}
    </group>
  );
};

/** Céu em degradê (esfera grande, sem iluminação). */
export const Ceu: React.FC<{ topo?: string; horizonte?: string; raio?: number }> = ({ topo = "#3d8be0", horizonte = "#d6f0ff", raio = 300 }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { a: { value: new THREE.Color(topo) }, b: { value: new THREE.Color(horizonte) } },
        vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 a; uniform vec3 b; varying vec3 vP; void main(){ float t = pow(clamp(vP.y*1.6, 0.0, 1.0), 0.7); gl_FragColor = vec4(mix(b, a, t), 1.0); }`,
        side: THREE.BackSide, depthWrite: false, fog: false,
      }),
    [topo, horizonte],
  );
  return (
    <mesh scale={raio}>
      <sphereGeometry args={[1, 32, 16]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
};
