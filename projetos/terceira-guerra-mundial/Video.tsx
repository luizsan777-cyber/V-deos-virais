// Episodio original: terceira guerra mundial, simulacao ficticia em 2D.
// Nao usa imagens de guerra reais e nao transforma hipotese em noticia.
// Reaproveita o RIG de personagens da engine; celular/notificacoes sao
// recriacoes originais baseadas na linguagem de edicao do video de referencia.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useTempos } from "../../engine/src/kit/tempo";
import { Personagem, ESTILOS_PERSONAGEM, Visual } from "../../engine/src/kit/Personagem";
import { comMedo, apontando, pensando, falando, parado } from "../../engine/src/kit/poses";
import { EXPRESSOES } from "../../engine/src/kit/expressoes";
import { Legendas } from "../../engine/src/kit/Legendas";
import { Vinheta, Flash } from "../../engine/src/kit/efeitos";

const IDS = ["gancho","taiwan","ataques","internet","mundo","cadeias","brasil","comercio","diplomacia","escalada","final"];
const LEO: Visual = { pele:"#bc805e", cabelo:"cacheado",corCabelo:"#221b2e",roupa:"moletom",cor:"#eb614f",calca:"#273a59",sapato:"#e8eaef",corOlho:"#292222",corpo:"medio" };
const ANA: Visual = { pele:"#a56e4a", cabelo:"longo",corCabelo:"#171821",roupa:"jaleco",cor:"#e1e7f5",calca:"#23385d",sapato:"#f0e7d9",corOlho:"#392c2c",corpo:"medio" };
const JOAO: Visual = { pele:"#b88c71", cabelo:"curto",corCabelo:"#2c2520",roupa:"camiseta",cor:"#68a6bc",calca:"#3a425e",sapato:"#c6d6e9",corpo:"medio" };
const G = "#080c23", OUT = "#0c0f24", WHITE="#f8f7f2", Y="#ffe36f", RED="#ff666f";
const clip=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
const mix=(a:number,b:number,t:number)=>a+(b-a)*clip(t);
const txt=(s:string,x:number,y:number,size=50,color=WHITE)=>(
  <text x={x} y={y} fontFamily="Arial, sans-serif" fontWeight="900" fontSize={size} fill={color} textAnchor="middle" stroke={OUT} strokeWidth="3" paintOrder="stroke">{s}</text>
);

const Phone: React.FC<{x:number;y:number;zoom?:number;u:number;label:string;detail:string;accent?:string}> = ({x,y,zoom=1,u,label,detail,accent=RED}) => (
 <g transform={`translate(${x} ${y-mix(35,0,u)}) scale(${zoom})`} opacity={clip(u*3)}>
  <rect x="-160" y="-295" width="320" height="590" rx="44" fill="#0c172c" stroke="#a1c5e5" strokeWidth="10"/>
  <rect x="-141" y="-268" width="282" height="535" rx="28" fill="#18233a"/>
  <rect x="-38" y="-274" width="76" height="12" rx="6" fill="#050b17"/>
  <circle cx="-105" cy="-216" r="13" fill={accent} opacity={0.65+Math.sin(u*23)*0.3}/>
  <rect x="-91" y="-243" width="212" height="105" rx="16" fill="#e7eef8"/>
  <rect x="-79" y="-230" width="192" height="31" rx="6" fill={accent}/>
  {txt(label,16,-206,19,"#171b29")}
  <text x="15" y="-165" textAnchor="middle" fill="#16233b" fontWeight="bold" fontFamily="Arial" fontSize="17">{detail}</text>
  <path d="M -96 10 H 96 M -96 38 H 60 M -96 66 H 88" stroke="#566982" strokeWidth="14" strokeLinecap="round"/>
  <circle cx="0" cy="200" r="36" fill="none" stroke="#3f526c" strokeWidth="9"/>
 </g>
);

const Drone: React.FC<{x:number;y:number;s?:number;f:number;phase?:number}> = ({x,y,s=1,f,phase=0}) => (
 <g transform={`translate(${x+Math.sin((f+phase)/16)*10} ${y+Math.cos((f+phase)/21)*8}) scale(${s})`}>
  <path d="M -90 0 L -20 -15 L 15 -52 L 24 -53 L 35 -11 L 98 0 L 34 15 L 14 63 L -1 63 L -18 13 Z" fill="#1d3150" stroke="#91b0c3" strokeWidth="5"/>
  <circle cx="-43" cy="3" r="8" fill="#e36263"/><circle cx="46" cy="3" r="8" fill="#e36263"/>
 </g>
);

const Human: React.FC<{id:string;visual:Visual;x:number;y:number;s?:number;f:number;mood?:"medo"|"fala"|"pensa"|"aponta"|"normal"}> =
 ({id,visual,x,y,s=1,f,mood="normal"}) => (
 <Personagem id={id} x={x} y={y} escala={s} visual={visual} estilo={ESTILOS_PERSONAGEM.noite}
 pose={mood==="medo"?comMedo(f):mood==="fala"?falando(f,4,0.8):mood==="pensa"?pensando(f):mood==="aponta"?apontando(f):parado(f)}
 expr={mood==="medo"?EXPRESSOES.medo:mood==="fala"?EXPRESSOES.pensativo:mood==="pensa"?EXPRESSOES.desconfiado:EXPRESSOES.neutro}
 olhosAbertos={1} boca={0}/>
);

const Skyline: React.FC<{f:number;cor?:string}> = ({f,cor="#1b3656"}) => (
 <g>
  <rect x="0" y="0" width="1080" height="1920" fill="#182f4b"/>
  <circle cx="840" cy="310" r="125" fill="#f4c58a" opacity="0.22"/>
  {Array.from({length:14},(_,i)=>{
    const h=420+(i%4)*105, x=i*84-32;
    return <g key={i}><rect x={x} y={1370-h} width="77" height={h} fill={i%2?cor:"#263f60"} stroke="#111c36" strokeWidth="5"/>
    {Array.from({length:7},(_,k)=><rect key={k} x={x+14+(k%2)*28} y={1400-h+Math.floor(k/2)*76} width="15" height="30" fill="#ffe09a" opacity={0.35+0.4*Math.abs(Math.sin(f/29+i+k))}/>)}</g>
  })}
  <rect x="0" y="1370" width="1080" height="550" fill="#1c273a"/>
  <path d="M0 1490 H1080" stroke="#8090a7" strokeWidth="8" strokeDasharray="70 45" opacity=".28"/>
 </g>
);

const Sea: React.FC<{f:number}> = ({f})=><g>
 <rect width="1080" height="1920" fill="#101f3a"/>
 <circle cx="810" cy="310" r="110" fill="#c5d9f6" opacity=".35"/>
 <path d="M 0 980 C 200 930 280 1010 450 960 C 600 925 830 1020 1080 970 V 1920 H0 Z" fill="#153e60"/>
 {Array.from({length:18},(_,i)=><path key={i} d={`M ${i*75-60+(f%60)*2} ${1050+(i%7)*105} q 32 -18 64 0`} stroke="#4c9dbb" strokeWidth="10" fill="none" opacity=".37"/>)}
 </g>;

const Ship: React.FC<{x:number;y:number;f:number;s?:number}> = ({x,y,f,s=1})=><g transform={`translate(${x+(f%140)*0.35} ${y+Math.sin(f/14)*4}) scale(${s})`}>
 <path d="M -240 22 H235 L 175 120 H -180 Z" fill="#253e53" stroke="#8ab2c4" strokeWidth="8"/>
 <rect x="-130" y="-102" width="260" height="118" rx="6" fill="#527390" stroke="#15223b" strokeWidth="7"/>
 <rect x="-65" y="-192" width="130" height="90" fill="#314b65" stroke="#15223b" strokeWidth="8"/>
 <rect x="-18" y="-265" width="36" height="77" fill="#718d9e"/>
 <path d="M -115 -68 H 112" stroke="#adc3d4" strokeWidth="10" opacity=".6"/>
 </g>;

const Price: React.FC<{x:number;y:number;label:string;value:string;u:number}> = ({x,y,label,value,u})=><g transform={`translate(${x} ${y}) scale(${mix(0.7,1,clip(u*2))})`}>
 <rect x="-187" y="-90" width="374" height="184" rx="20" fill="#f4eddb" stroke="#172a42" strokeWidth="9"/>
 {txt(label,0,-22,36,"#1c3550")}{txt(value,0,57,46,"#b92c3e")}
 </g>;

const Scene: React.FC<{n:number;u:number;f:number}> = ({n,u,f})=>{
 const drift=f*0.9;
 if(n===0 || n===10) return <g>
  <Skyline f={f}/>
  <Human id={`leo-${n}`} visual={LEO} x={560} y={1590} s={1.17} f={f} mood="medo"/>
  <Phone x={220} y={645} zoom={n===0?1.1:0.83} u={clip(u*4)} label="ALERTA GLOBAL" detail="EUA x CHINA" />
  <Phone x={n===0?826:855} y={650} zoom={n===0?1.08:0.86} u={clip(u*3-0.2)} label={n===0?"ÚLTIMA HORA":"ECONOMIA"} detail={n===0?"CONFLITO?":"PREÇOS SOBEM?"} accent={Y}/>
  {n===10 && <g>{txt("E SE FOSSE HOJE?",540,1040,90,Y)}{txt("E O AMANHÃ?",540,1130,54,WHITE)}</g>}
 </g>;
 if(n===1) return <g>
  <Sea f={f}/>
  <ellipse cx="550" cy="760" rx={390+u*100} ry={205+u*80} fill="none" stroke="#70bee0" strokeWidth="10" strokeDasharray="25 26" opacity=".5"/>
  <circle cx="555" cy="760" r="40" fill={RED}/>{txt("TAIWAN",555,852,69,Y)}
  {txt("PACÍFICO",545,330,110,WHITE)}
  <Ship x={360} y={1280} s={1} f={f}/>
  <Ship x={800} y={1540} s={0.85} f={f}/>
  <path d="M 550 800 Q 790 650 1000 850" stroke={RED} strokeWidth="12" fill="none" strokeDasharray="30 24"/>
 </g>;
 if(n===2) return <g>
  <Sea f={f}/><Ship x={490} y={1260} f={f} s={1.45}/>
  {Array.from({length:5},(_,i)=><Drone key={i} x={100+i*200+u*230} y={450+i%2*170} s={0.9+i%3*0.16} f={f} phase={i*15}/>)}
  <circle cx="810" cy="1060" r={55+Math.abs(Math.sin(f/12))*100} fill="#ff8756" opacity=".28"/>
  {txt("ATAQUES E DEFESAS",540,320,74,Y)}
  {txt("RISCO DE ESCALADA",540,1670,57,WHITE)}
 </g>;
 if(n===3) return <g>
  <rect width="1080" height="1920" fill="#0c192c"/>
  {Array.from({length:18},(_,i)=><text key={i} x={25+(i%4)*285} y={80+(i*91+drift)%1720} fontFamily="monospace" fontSize="27" fill="#68d5be" opacity=".19">{["101010","CONEXÃO","INFORMAÇÃO","? VERIFICAR"][i%4]}</text>)}
  <Phone x={330} y={960} zoom={1.35} u={1} label="MENSAGEM VIRAL" detail="FONTE NÃO VERIFICADA" accent={RED}/>
  <Phone x={780} y={1090} zoom={1.15} u={clip(u*4)} label="VAZAMENTO?" detail="CONFIRA A ORIGEM" accent={Y}/>
  {txt("GUERRA DIGITAL",540,330,90,Y)}
 </g>;
 if(n===4) return <g>
  <rect width="1080" height="1920" fill="#122d4b"/>
  <circle cx="540" cy="850" r="435" fill="#2d6d89" stroke="#b7dce4" strokeWidth="14"/>
  {Array.from({length:8},(_,i)=><ellipse key={i} cx="540" cy="850" rx={65+i*52} ry={420} fill="none" stroke="#93d0da" strokeWidth="3" opacity=".24"/>)}
  <path d="M160 700 Q370 450 560 665 Q640 770 795 650 L 910 840 Q720 945 550 810 Q330 1040 220 885Z" fill="#80bc91" stroke="#1a4c54" strokeWidth="12"/>
  {txt("REAÇÕES PELO MUNDO",540,270,72,WHITE)}
  {txt("JAPÃO • COREIA",540,1450,58,Y)}
  {txt("EUROPA • MERCADOS",540,1550,55,WHITE)}
 </g>;
 if(n===5) return <g>
  <Sea f={f}/>
  <Ship x={555} y={1060} s={1.7} f={f}/>
  {Array.from({length:7},(_,i)=><rect key={i} x={170+i*108} y={300+(i%2)*70} width={98} height={170} rx="7" fill={["#e66e54","#dbb86b","#4b93a5"][i%3]} stroke="#122539" strokeWidth="9"/>)}
  {txt("ROTAS ALTERADAS",540,1550,80,Y)}{txt("ENTREGAS ATRASADAS",540,1640,58,WHITE)}
 </g>;
 if(n===6) return <g>
  <Skyline f={f} cor="#315d6d"/>
  {txt("E O BRASIL?",540,255,116,Y)}
  <Human id="br-pessoa" visual={LEO} x={540} y={1500} s={1.12} f={f} mood="pensa"/>
  <Price x={245} y={770} label="DÓLAR" value="PRESSÃO" u={u}/>
  <Price x={835} y={800} label="COMBUSTÍVEL" value="RISCO DE ALTA" u={u}/>
 </g>;
 if(n===7) return <g>
  <rect width="1080" height="1920" fill="#264557"/>
  <Ship x={530} y={1200} f={f} s={1.45}/>
  <path d="M -20 1350 H1100 V1920 H-20 Z" fill="#2b313d"/>
  {Array.from({length:5},(_,i)=><rect key={i} x={115+i*165} y={850+(i%2)*130} width={152} height={140} fill={["#d99351","#b8756b","#549aa4"][i%3]} stroke="#1a2b3f" strokeWidth="9"/>)}
  {txt("BRASIL EXPORTA",540,260,98,Y)}
  {txt("AGRO • MINERAÇÃO",540,1600,70,WHITE)}
  {txt("PORTOS • EMPREGOS",540,1700,61,WHITE)}
 </g>;
 if(n===8) return <g>
  <rect width="1080" height="1920" fill="#213f57"/>
  <rect x={100} y={1050} width={880} height={540} rx={46} fill="#1b273d" stroke="#b1c5d4" strokeWidth="12"/>
  <Human id="diplomat1" visual={ANA} x={320} y={1430} s={0.95} f={f} mood="aponta"/>
  <Human id="diplomat2" visual={JOAO} x={800} y={1430} s={0.95} f={f} mood="pensa"/>
  <path d="M 0 1560 H1080" stroke="#7faeb8" strokeWidth="25"/>
  <rect x="420" y="880" width="250" height="115" rx="12" fill="#c2c9d2"/><rect x="450" y="900" width="190" height="50" fill="#26374d"/>
  {txt("DIPLOMACIA",540,335,94,Y)}
  {txt("NÃO É AUTOMÁTICO",540,460,70,WHITE)}
 </g>;
 if(n===9) return <g>
  <rect width="1080" height="1920" fill="#0e1229"/>
  <circle cx={540} cy={900} r={435} fill="#244d69" stroke="#a1c4d7" strokeWidth="20"/>
  <path d="M 230 720 Q 440 510 570 710 L 760 750 Q 920 1080 600 1200 L 430 1010 Q 230 1040 230 720Z" fill="#5f9b80"/>
  {Array.from({length:7},(_,i)=><circle key={i} cx={540} cy={900} r={470+i*65+Math.sin(f/11+i)*8} fill="none" stroke={RED} strokeWidth="8" opacity={0.24-i*0.026}/>)}
  {txt("RISCO NÃO É DESTINO",540,330,65,Y)}
  {txt("NEGOCIAR É URGENTE",540,1550,69,WHITE)}
 </g>;
 return null;
};

export default function Video() {
 const f=useCurrentFrame(); const T=useTempos();
 const segments=IDS.map(id=>T.fala(id));
 const n=Math.max(0,segments.findIndex((s,i)=>f>=s.ini&&(i===segments.length-1||f<segments[i+1].ini)));
 const current=segments[n];
 const u=clip((f-current.ini)/Math.max(1,current.fim-current.ini));
 return <AbsoluteFill style={{background:"#080d1c",overflow:"hidden"}}>
  <svg width="1080" height="1920" viewBox="0 0 1080 1920">
   <defs>
    <linearGradient id="war-vign" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#060e21" stopOpacity=".25"/><stop offset="1" stopColor="#060e21" stopOpacity=".7"/></linearGradient>
   </defs>
   <Scene n={n} u={u} f={f}/>
   <rect width="1080" height="1920" fill="url(#war-vign)" pointerEvents="none"/>
   <rect x="25" y="38" width="570" height="72" rx="20" fill="#172a43" stroke="#e9d28a" strokeWidth="3"/>
   <text x="310" y="86" textAnchor="middle" fontSize="33" fontWeight="900" fontFamily="Arial" fill="#fff3b3">SIMULAÇÃO FICTÍCIA</text>
   <rect x="25" y="1800" width="680" height="65" rx="20" fill="#0f213a" opacity=".88"/>
   <text x="54" y="1845" fontSize="31" fontFamily="Arial" fontWeight="bold" fill="#e7f1fa">EUA × CHINA  •  CENÁRIO HIPOTÉTICO</text>
  </svg>
  <Flash em={T.sfx("impacto")} dur={6} cor="#ff8c75" forca={0.2}/>
  <Vinheta forca={0.37}/>
  <Legendas estilo="impacto"/>
 </AbsoluteFill>;
}
