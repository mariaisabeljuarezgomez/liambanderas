/* ════════════════════════════════════════════════════════════════
   data.js — ALL 50 FLAGS as structured data + SVG generator.
   This is the heart of v2: 50 flags live HERE, not in 50 folders.
   One change here upgrades every flag instantly.
   ════════════════════════════════════════════════════════════════ */

// ── Canonical bilingual color vocabulary (kept small for a 4yo) ──
const COLOR_NAMES = {
  azul:     { es: 'Azul',     en: 'Blue'       },
  celeste:  { es: 'Celeste',  en: 'Light Blue' },
  rojo:     { es: 'Rojo',     en: 'Red'        },
  blanco:   { es: 'Blanco',   en: 'White'      },
  verde:    { es: 'Verde',    en: 'Green'      },
  amarillo: { es: 'Amarillo', en: 'Yellow'     },
  negro:    { es: 'Negro',    en: 'Black'      },
  naranja:  { es: 'Naranja',  en: 'Orange'     },
};

// ── Ranks earned per level ──
const RANKS = [
  { es: 'Explorador',       en: 'Explorer'      },
  { es: 'Aventurero',       en: 'Adventurer'    },
  { es: 'Capitán',          en: 'Captain'       },
  { es: 'Navegante',        en: 'Navigator'     },
  { es: 'Experto Mundial',  en: 'World Expert'  },
];

// ── SVG geometry helpers (viewBox is 0 0 300 200, standard 3:2) ──
const GHOST = '#dfe6ee';   // unpainted placeholder
const GHOST_STROKE = '#b4c1cf';

function starPoints(cx, cy, outer, inner, points = 5, rot = -90) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (rot + (i * 180) / points) * Math.PI / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

// Crescent (opens right) — outer arc + offset inner arc
function crescentPath(cx, cy, r) {
  const k = r * 0.35;
  return `M ${cx + k},${cy - r} A ${r},${r} 0 1 0 ${cx + k},${cy + r} A ${r * 0.82},${r * 0.82} 0 1 1 ${cx + k},${cy - r} Z`;
}

// Simplified maple leaf (Canada)
const MAPLE_LEAF = 'M150,32 L160,72 L186,62 L174,90 L210,84 L188,110 L220,118 L192,134 L210,160 L178,152 L182,182 L150,164 L118,182 L122,152 L90,160 L108,134 L80,118 L112,110 L90,84 L126,90 L114,62 L140,72 Z';

// Star of David (two triangles) as a group of two polygons
const MAGEN_DAVID = [
  { type: 'polygon', points: '150,68 176,114 124,114' },
  { type: 'polygon', points: '150,150 124,104 176,104' },
];

// ════════════════════════════════════════════════════════════════
//  THE 50 FLAGS — 5 levels × 10 flags, ordered by simplicity.
//  palette: [ {key, hex} ]   key references COLOR_NAMES
//  parts:   paintable regions   (region = id, correct = palette key)
//  deco:    static pre-drawn decoration (always shown, not paintable)
// ════════════════════════════════════════════════════════════════
const FLAGS = [

  /* ───────────── LEVEL 1 — Explorador (simple stripes) ───────────── */
  { id:'francia', es:'Francia', en:'France', level:1, alarm_audio: 'music/alarms/france.webm',
    palette:[{key:'azul',hex:'#0055A4'},{key:'blanco',hex:'#ffffff'},{key:'rojo',hex:'#EF4135'}],
    parts:[
      {type:'rect',region:'a',correct:'azul',x:0,y:0,w:100,h:200},
      {type:'rect',region:'b',correct:'blanco',x:100,y:0,w:100,h:200},
      {type:'rect',region:'c',correct:'rojo',x:200,y:0,w:100,h:200},
    ]},

  { id:'italia', es:'Italia', en:'Italy', level:1, alarm_audio: 'music/alarms/italy.webm',
    palette:[{key:'verde',hex:'#008C45'},{key:'blanco',hex:'#ffffff'},{key:'rojo',hex:'#CD212A'}],
    parts:[
      {type:'rect',region:'a',correct:'verde',x:0,y:0,w:100,h:200},
      {type:'rect',region:'b',correct:'blanco',x:100,y:0,w:100,h:200},
      {type:'rect',region:'c',correct:'rojo',x:200,y:0,w:100,h:200},
    ]},

  { id:'alemania', es:'Alemania', en:'Germany', level:1, alarm_audio: 'music/alarms/germany.webm',
    palette:[{key:'negro',hex:'#000000'},{key:'rojo',hex:'#DD0000'},{key:'amarillo',hex:'#FFCE00'}],
    parts:[
      {type:'rect',region:'a',correct:'negro',x:0,y:0,w:300,h:67},
      {type:'rect',region:'b',correct:'rojo',x:0,y:67,w:300,h:66},
      {type:'rect',region:'c',correct:'amarillo',x:0,y:133,w:300,h:67},
    ]},

  { id:'belgica', es:'Bélgica', en:'Belgium', level:1, alarm_audio: 'music/alarms/belgium.webm',
    palette:[{key:'negro',hex:'#000000'},{key:'amarillo',hex:'#FAE042'},{key:'rojo',hex:'#ED2939'}],
    parts:[
      {type:'rect',region:'a',correct:'negro',x:0,y:0,w:100,h:200},
      {type:'rect',region:'b',correct:'amarillo',x:100,y:0,w:100,h:200},
      {type:'rect',region:'c',correct:'rojo',x:200,y:0,w:100,h:200},
    ]},

  { id:'rusia', es:'Rusia', en:'Russia', level:1, alarm_audio: 'music/alarms/russia.webm',
    palette:[{key:'blanco',hex:'#ffffff'},{key:'azul',hex:'#0039A6'},{key:'rojo',hex:'#D52B1E'}],
    parts:[
      {type:'rect',region:'a',correct:'blanco',x:0,y:0,w:300,h:67},
      {type:'rect',region:'b',correct:'azul',x:0,y:67,w:300,h:66},
      {type:'rect',region:'c',correct:'rojo',x:0,y:133,w:300,h:67},
    ]},

  { id:'paises_bajos', es:'Países Bajos', en:'Netherlands', level:1, alarm_audio: 'music/alarms/netherlands.webm',
    palette:[{key:'rojo',hex:'#AE1C28'},{key:'blanco',hex:'#ffffff'},{key:'azul',hex:'#21468B'}],
    parts:[
      {type:'rect',region:'a',correct:'rojo',x:0,y:0,w:300,h:67},
      {type:'rect',region:'b',correct:'blanco',x:0,y:67,w:300,h:66},
      {type:'rect',region:'c',correct:'azul',x:0,y:133,w:300,h:67},
    ]},

  { id:'polonia', es:'Polonia', en:'Poland', level:1,
    palette:[{key:'blanco',hex:'#ffffff'},{key:'rojo',hex:'#DC143C'}],
    parts:[
      {type:'rect',region:'a',correct:'blanco',x:0,y:0,w:300,h:100},
      {type:'rect',region:'b',correct:'rojo',x:0,y:100,w:300,h:100},
    ]},

  { id:'indonesia', es:'Indonesia', en:'Indonesia', level:1,
    palette:[{key:'rojo',hex:'#FF0000'},{key:'blanco',hex:'#ffffff'}],
    parts:[
      {type:'rect',region:'a',correct:'rojo',x:0,y:0,w:300,h:100},
      {type:'rect',region:'b',correct:'blanco',x:0,y:100,w:300,h:100},
    ]},

  { id:'austria', es:'Austria', en:'Austria', level:1, alarm_audio: 'music/alarms/austria.webm',
    palette:[{key:'rojo',hex:'#ED2939'},{key:'blanco',hex:'#ffffff'}],
    parts:[
      {type:'rect',region:'a',correct:'rojo',x:0,y:0,w:300,h:60},
      {type:'rect',region:'b',correct:'blanco',x:0,y:60,w:300,h:80},
      {type:'rect',region:'c',correct:'rojo',x:0,y:140,w:300,h:60},
    ]},

  { id:'japon', es:'Japón', en:'Japan', level:1,
    palette:[{key:'blanco',hex:'#ffffff'},{key:'rojo',hex:'#BC002D'}],
    parts:[
      {type:'rect',region:'a',correct:'blanco',x:0,y:0,w:300,h:200},
      {type:'circle',region:'b',correct:'rojo',cx:150,cy:100,r:60},
    ]},

  /* ───────────── LEVEL 2 — Aventurero (emblems & crosses) ───────────── */
  { id:'espana', es:'España', en:'Spain', level:2,
    palette:[{key:'rojo',hex:'#AA151B'},{key:'amarillo',hex:'#F1BF00'}],
    parts:[
      {type:'rect',region:'a',correct:'rojo',x:0,y:0,w:300,h:50},
      {type:'rect',region:'b',correct:'amarillo',x:0,y:50,w:300,h:100},
      {type:'rect',region:'c',correct:'rojo',x:0,y:150,w:300,h:50},
    ],
    deco:[{type:'rect',fill:'#AA151B',x:112,y:70,w:76,h:60,rx:4,stroke:'#7a0e12'}]},

  { id:'mexico', es:'México', en:'Mexico', level:2, alarm_audio: 'music/alarms/mexico.webm',
    palette:[{key:'verde',hex:'#006847'},{key:'blanco',hex:'#ffffff'},{key:'rojo',hex:'#CE1126'}],
    parts:[
      {type:'rect',region:'a',correct:'verde',x:0,y:0,w:100,h:200},
      {type:'rect',region:'b',correct:'blanco',x:100,y:0,w:100,h:200},
      {type:'rect',region:'c',correct:'rojo',x:200,y:0,w:100,h:200},
    ],
    deco:[{type:'circle',fill:'#006847',cx:150,cy:100,r:26,stroke:'#00452e'}]},

  { id:'peru', es:'Perú', en:'Peru', level:2, alarm_audio: 'music/alarms/peru.webm',
    palette:[{key:'rojo',hex:'#D91023'},{key:'blanco',hex:'#ffffff'}],
    parts:[
      {type:'rect',region:'a',correct:'rojo',x:0,y:0,w:100,h:200},
      {type:'rect',region:'b',correct:'blanco',x:100,y:0,w:100,h:200},
      {type:'rect',region:'c',correct:'rojo',x:200,y:0,w:100,h:200},
    ]},

  { id:'canada', es:'Canadá', en:'Canada', level:2,
    palette:[{key:'rojo',hex:'#FF0000'},{key:'blanco',hex:'#ffffff'}],
    parts:[
      {type:'rect',region:'a',correct:'rojo',x:0,y:0,w:75,h:200},
      {type:'rect',region:'b',correct:'blanco',x:75,y:0,w:150,h:200},
      {type:'rect',region:'c',correct:'rojo',x:225,y:0,w:75,h:200},
    ],
    deco:[{type:'path',fill:'#FF0000',d:MAPLE_LEAF}]},

  { id:'colombia', es:'Colombia', en:'Colombia', level:2,
    palette:[{key:'amarillo',hex:'#FCD116'},{key:'azul',hex:'#003893'},{key:'rojo',hex:'#CE1126'}],
    parts:[
      {type:'rect',region:'a',correct:'amarillo',x:0,y:0,w:300,h:100},
      {type:'rect',region:'b',correct:'azul',x:0,y:100,w:300,h:50},
      {type:'rect',region:'c',correct:'rojo',x:0,y:150,w:300,h:50},
    ]},

  { id:'argentina', es:'Argentina', en:'Argentina', level:2,
    palette:[{key:'celeste',hex:'#74ACDF'},{key:'blanco',hex:'#ffffff'},{key:'amarillo',hex:'#FCBF49'}],
    parts:[
      {type:'rect',region:'a',correct:'celeste',x:0,y:0,w:300,h:67},
      {type:'rect',region:'b',correct:'blanco',x:0,y:67,w:300,h:66},
      {type:'rect',region:'c',correct:'celeste',x:0,y:133,w:300,h:67},
      {type:'star',region:'d',correct:'amarillo',cx:150,cy:100,outer:24,inner:9,points:16,rot:0},
    ]},

  { id:'brasil', es:'Brasil', en:'Brazil', level:2,
    palette:[{key:'verde',hex:'#009C3B'},{key:'amarillo',hex:'#FFDF00'},{key:'azul',hex:'#002776'}],
    parts:[
      {type:'rect',region:'a',correct:'verde',x:0,y:0,w:300,h:200},
      {type:'polygon',region:'b',correct:'amarillo',points:'150,18 282,100 150,182 18,100'},
      {type:'circle',region:'c',correct:'azul',cx:150,cy:100,r:48},
    ],
    deco:[{type:'path',fill:'#ffffff',d:'M108,96 Q150,80 192,96',stroke:'#ffffff',strokeWidth:7}]},

  { id:'suecia', es:'Suecia', en:'Sweden', level:2, alarm_audio: 'music/alarms/sweden.webm',
    palette:[{key:'azul',hex:'#006AA7'},{key:'amarillo',hex:'#FECC00'}],
    parts:[
      {type:'rect',region:'a',correct:'azul',x:0,y:0,w:300,h:200},
      {type:'group',region:'b',correct:'amarillo',children:[
        {type:'rect',x:80,y:0,w:40,h:200},
        {type:'rect',x:0,y:80,w:300,h:40},
      ]},
    ]},

  { id:'dinamarca', es:'Dinamarca', en:'Denmark', level:2, alarm_audio: 'music/alarms/denmark.webm',
    palette:[{key:'rojo',hex:'#C8102E'},{key:'blanco',hex:'#ffffff'}],
    parts:[
      {type:'rect',region:'a',correct:'rojo',x:0,y:0,w:300,h:200},
      {type:'group',region:'b',correct:'blanco',children:[
        {type:'rect',x:84,y:0,w:40,h:200},
        {type:'rect',x:0,y:80,w:300,h:40},
      ]},
    ]},

  { id:'suiza', es:'Suiza', en:'Switzerland', level:2, alarm_audio: 'music/alarms/switzerland.webm',
    palette:[{key:'rojo',hex:'#DA291C'},{key:'blanco',hex:'#ffffff'}],
    parts:[
      {type:'rect',region:'a',correct:'rojo',x:0,y:0,w:300,h:200},
      {type:'group',region:'b',correct:'blanco',children:[
        {type:'rect',x:124,y:60,w:52,h:80,rx:6},
        {type:'rect',x:110,y:74,w:80,h:52,rx:6},
      ]},
    ]},

  /* ───────────── LEVEL 3 — Capitán (complex crosses & stars) ───────────── */
  { id:'noruega', es:'Noruega', en:'Norway', level:3, alarm_audio: 'music/alarms/norway.webm',
    palette:[{key:'rojo',hex:'#BA0C2F'},{key:'blanco',hex:'#ffffff'},{key:'azul',hex:'#00205B'}],
    parts:[
      {type:'rect',region:'a',correct:'rojo',x:0,y:0,w:300,h:200},
      {type:'group',region:'b',correct:'blanco',children:[
        {type:'rect',x:78,y:0,w:54,h:200},
        {type:'rect',x:0,y:73,w:300,h:54},
      ]},
      {type:'group',region:'c',correct:'azul',children:[
        {type:'rect',x:90,y:0,w:30,h:200},
        {type:'rect',x:0,y:85,w:300,h:30},
      ]},
    ]},

  { id:'finlandia', es:'Finlandia', en:'Finland', level:3, alarm_audio: 'music/alarms/finland.webm',
    palette:[{key:'blanco',hex:'#ffffff'},{key:'azul',hex:'#003580'}],
    parts:[
      {type:'rect',region:'a',correct:'blanco',x:0,y:0,w:300,h:200},
      {type:'group',region:'b',correct:'azul',children:[
        {type:'rect',x:84,y:0,w:44,h:200},
        {type:'rect',x:0,y:78,w:300,h:44},
      ]},
    ]},

  { id:'islandia', es:'Islandia', en:'Iceland', level:3,
    palette:[{key:'azul',hex:'#02529C'},{key:'blanco',hex:'#ffffff'},{key:'rojo',hex:'#DC1E35'}],
    parts:[
      {type:'rect',region:'a',correct:'azul',x:0,y:0,w:300,h:200},
      {type:'group',region:'b',correct:'blanco',children:[
        {type:'rect',x:80,y:0,w:52,h:200},
        {type:'rect',x:0,y:74,w:300,h:52},
      ]},
      {type:'group',region:'c',correct:'rojo',children:[
        {type:'rect',x:92,y:0,w:28,h:200},
        {type:'rect',x:0,y:86,w:300,h:28},
      ]},
    ]},

  { id:'chile', es:'Chile', en:'Chile', level:3,
    palette:[{key:'blanco',hex:'#ffffff'},{key:'rojo',hex:'#D52B1E'},{key:'azul',hex:'#0039A6'}],
    parts:[
      {type:'rect',region:'a',correct:'blanco',x:0,y:0,w:300,h:100},
      {type:'rect',region:'b',correct:'rojo',x:0,y:100,w:300,h:100},
      {type:'rect',region:'c',correct:'azul',x:0,y:0,w:150,h:100},
      {type:'star',region:'d',correct:'blanco',cx:75,cy:50,outer:26,inner:10},
    ]},

  { id:'grecia', es:'Grecia', en:'Greece', level:3, alarm_audio: 'music/alarms/greece.webm',
    palette:[{key:'azul',hex:'#0D5EAF'},{key:'blanco',hex:'#ffffff'}],
    parts:[
      {type:'rect',region:'a',correct:'azul',x:0,y:0,w:300,h:200},
      {type:'group',region:'b',correct:'blanco',children:[
        {type:'rect',x:0,y:28,w:300,h:22},
        {type:'rect',x:0,y:72,w:300,h:22},
        {type:'rect',x:0,y:116,w:300,h:22},
        {type:'rect',x:0,y:160,w:300,h:22},
      ]},
      {type:'group',region:'c',correct:'azul',children:[
        {type:'rect',x:0,y:0,w:100,h:100,override:true,fill:'#0D5EAF'},
        {type:'rect',x:42,y:0,w:18,h:100},
        {type:'rect',x:0,y:42,w:100,h:18},
      ]},
    ]},

  { id:'eeuu', es:'Estados Unidos', en:'United States', level:3,
    palette:[{key:'rojo',hex:'#B22234'},{key:'blanco',hex:'#ffffff'},{key:'azul',hex:'#3C3B6E'}],
    parts:[
      {type:'group',region:'a',correct:'rojo',children:[
        {type:'rect',x:0,y:0,w:300,h:15},{type:'rect',x:0,y:30,w:300,h:15},
        {type:'rect',x:0,y:60,w:300,h:15},{type:'rect',x:0,y:90,w:300,h:15},
        {type:'rect',x:0,y:120,w:300,h:15},{type:'rect',x:0,y:150,w:300,h:15},
        {type:'rect',x:0,y:180,w:300,h:15},
      ]},
      {type:'group',region:'b',correct:'blanco',children:[
        {type:'rect',x:0,y:15,w:300,h:15},{type:'rect',x:0,y:45,w:300,h:15},
        {type:'rect',x:0,y:75,w:300,h:15},{type:'rect',x:0,y:105,w:300,h:15},
        {type:'rect',x:0,y:135,w:300,h:15},{type:'rect',x:0,y:165,w:300,h:15},
      ]},
      {type:'rect',region:'c',correct:'azul',x:0,y:0,w:140,h:108},
    ],
    deco:(()=>{const s=[];for(let i=0;i<5;i++)for(let j=0;j<6;j++)s.push({type:'circle',fill:'#ffffff',cx:14+i*26,cy:14+j*18,r:2.6});return s;})()},

  { id:'reinounido', es:'Reino Unido', en:'United Kingdom', level:3,
    palette:[{key:'azul',hex:'#012169'},{key:'blanco',hex:'#ffffff'},{key:'rojo',hex:'#C8102E'}],
    parts:[
      {type:'rect',region:'a',correct:'azul',x:0,y:0,w:300,h:200},
      {type:'group',region:'b',correct:'blanco',children:[
        {type:'polygon',points:'0,0 36,0 300,164 300,200 264,200 0,36'},
        {type:'polygon',points:'264,0 300,0 300,36 36,200 0,200 0,164'},
        {type:'rect',x:124,y:0,w:52,h:200},
        {type:'rect',x:0,y:74,w:300,h:52},
      ]},
      {type:'group',region:'c',correct:'rojo',children:[
        {type:'polygon',points:'0,0 22,0 150,85 150,115 22,200 0,200 0,178 112,100 0,22'},
        {type:'polygon',points:'278,0 300,0 300,22 188,100 300,178 300,200 278,200 150,115 150,85'},
        {type:'rect',x:136,y:0,w:28,h:200},
        {type:'rect',x:0,y:86,w:300,h:28},
      ]},
    ]},

  { id:'china', es:'China', en:'China', level:3,
    palette:[{key:'rojo',hex:'#DE2910'},{key:'amarillo',hex:'#FFDE00'}],
    parts:[
      {type:'rect',region:'a',correct:'rojo',x:0,y:0,w:300,h:200},
      {type:'star',region:'b',correct:'amarillo',cx:78,cy:62,outer:30,inner:12},
    ],
    deco:[
      {type:'star',fill:'#FFDE00',cx:128,cy:34,outer:10,inner:4,rot:-90+22},
      {type:'star',fill:'#FFDE00',cx:150,cy:58,outer:10,inner:4,rot:-90+41},
      {type:'star',fill:'#FFDE00',cx:150,cy:90,outer:10,inner:4,rot:-90+12},
      {type:'star',fill:'#FFDE00',cx:128,cy:114,outer:10,inner:4,rot:-90+35},
    ]},

  { id:'vietnam', es:'Vietnam', en:'Vietnam', level:3,
    palette:[{key:'rojo',hex:'#DA251D'},{key:'amarillo',hex:'#FFFF00'}],
    parts:[
      {type:'rect',region:'a',correct:'rojo',x:0,y:0,w:300,h:200},
      {type:'star',region:'b',correct:'amarillo',cx:150,cy:100,outer:50,inner:20},
    ]},

  { id:'turquia', es:'Turquía', en:'Turkey', level:3,
    palette:[{key:'rojo',hex:'#E30A17'},{key:'blanco',hex:'#ffffff'}],
    parts:[
      {type:'rect',region:'a',correct:'rojo',x:0,y:0,w:300,h:200},
      {type:'path',region:'b',correct:'blanco',d:crescentPath(134,100,56)},
      {type:'star',region:'c',correct:'blanco',cx:180,cy:100,outer:22,inner:9,rot:-90+18},
    ]},

  /* ───────────── LEVEL 4 — Navegante ───────────── */
  { id:'india', es:'India', en:'India', level:4,
    palette:[{key:'naranja',hex:'#FF9933'},{key:'blanco',hex:'#ffffff'},{key:'verde',hex:'#138808'},{key:'azul',hex:'#000080'}],
    parts:[
      {type:'rect',region:'a',correct:'naranja',x:0,y:0,w:300,h:67},
      {type:'rect',region:'b',correct:'blanco',x:0,y:67,w:300,h:66},
      {type:'rect',region:'c',correct:'verde',x:0,y:133,w:300,h:67},
      {type:'circle',region:'d',correct:'azul',cx:150,cy:100,r:26},
    ]},

  { id:'sudafrica', es:'Sudáfrica', en:'South Africa', level:4,
    palette:[{key:'rojo',hex:'#DE3831'},{key:'blanco',hex:'#ffffff'},{key:'azul',hex:'#002395'},{key:'verde',hex:'#007A4D'}],
    parts:[
      {type:'rect',region:'a',correct:'rojo',x:0,y:0,w:300,h:100},
      {type:'rect',region:'b',correct:'blanco',x:0,y:100,w:300,h:100},
      {type:'rect',region:'c',correct:'azul',x:0,y:150,w:300,h:50},
      {type:'polygon',region:'d',correct:'verde',points:'0,0 110,100 0,200'},
    ]},

  { id:'portugal', es:'Portugal', en:'Portugal', level:4, alarm_audio: 'music/alarms/portugal.webm',
    palette:[{key:'verde',hex:'#006600'},{key:'rojo',hex:'#FF0000'},{key:'amarillo',hex:'#FFD700'}],
    parts:[
      {type:'rect',region:'a',correct:'verde',x:0,y:0,w:120,h:200},
      {type:'rect',region:'b',correct:'rojo',x:120,y:0,w:180,h:200},
      {type:'circle',region:'c',correct:'amarillo',cx:120,cy:100,r:30},
    ]},

  { id:'marruecos', es:'Marruecos', en:'Morocco', level:4,
    palette:[{key:'rojo',hex:'#C1272D'},{key:'verde',hex:'#006233'}],
    parts:[
      {type:'rect',region:'a',correct:'rojo',x:0,y:0,w:300,h:200},
      {type:'star',region:'b',correct:'verde',cx:150,cy:100,outer:48,inner:22,rot:0},
    ]},

  { id:'tailandia', es:'Tailandia', en:'Thailand', level:4,
    palette:[{key:'rojo',hex:'#A51931'},{key:'blanco',hex:'#ffffff'},{key:'azul',hex:'#2D2A4A'}],
    parts:[
      {type:'rect',region:'a',correct:'rojo',x:0,y:0,w:300,h:30},
      {type:'rect',region:'b',correct:'blanco',x:0,y:30,w:300,h:30},
      {type:'rect',region:'c',correct:'azul',x:0,y:60,w:300,h:80},
      {type:'group',region:'d',correct:'blanco',children:[{type:'rect',x:0,y:140,w:300,h:30}]},
      {type:'group',region:'e',correct:'rojo',children:[{type:'rect',x:0,y:170,w:300,h:30}]},
    ]},

  { id:'israel', es:'Israel', en:'Israel', level:4, alarm_audio: 'music/alarms/israel.webm',
    palette:[{key:'blanco',hex:'#ffffff'},{key:'azul',hex:'#0038B8'}],
    parts:[
      {type:'rect',region:'a',correct:'blanco',x:0,y:0,w:300,h:200},
      {type:'group',region:'b',correct:'azul',children:[
        {type:'rect',x:0,y:20,w:300,h:14},
        {type:'rect',x:0,y:166,w:300,h:14},
      ]},
      {type:'group',region:'c',correct:'azul',children:MAGEN_DAVID},
    ]},

  { id:'nigeria', es:'Nigeria', en:'Nigeria', level:4,
    palette:[{key:'verde',hex:'#008751'},{key:'blanco',hex:'#ffffff'}],
    parts:[
      {type:'rect',region:'a',correct:'verde',x:0,y:0,w:100,h:200},
      {type:'rect',region:'b',correct:'blanco',x:100,y:0,w:100,h:200},
      {type:'rect',region:'c',correct:'verde',x:200,y:0,w:100,h:200},
    ]},

  { id:'irlanda', es:'Irlanda', en:'Ireland', level:4,
    palette:[{key:'verde',hex:'#169B62'},{key:'blanco',hex:'#ffffff'},{key:'naranja',hex:'#FF883E'}],
    parts:[
      {type:'rect',region:'a',correct:'verde',x:0,y:0,w:100,h:200},
      {type:'rect',region:'b',correct:'blanco',x:100,y:0,w:100,h:200},
      {type:'rect',region:'c',correct:'naranja',x:200,y:0,w:100,h:200},
    ]},

  { id:'nuevazelanda', es:'Nueva Zelanda', en:'New Zealand', level:4, alarm_audio: 'music/alarms/new_zealand.webm',
    palette:[{key:'azul',hex:'#012169'},{key:'rojo',hex:'#C8102E'},{key:'blanco',hex:'#ffffff'}],
    parts:[
      {type:'rect',region:'a',correct:'azul',x:0,y:0,w:300,h:200},
      {type:'group',region:'b',correct:'rojo',children:[
        {type:'rect',x:196,y:130,w:34,h:34,rx:3},
        {type:'rect',x:240,y:130,w:34,h:34,rx:3},
        {type:'rect',x:218,y:152,w:34,h:34,rx:3},
      ]},
    ]},

  { id:'rumania', es:'Rumania', en:'Romania', level:4, alarm_audio: 'music/alarms/romania.webm',
    palette:[{key:'azul',hex:'#002B7F'},{key:'amarillo',hex:'#FCD116'},{key:'rojo',hex:'#CE1126'}],
    parts:[
      {type:'rect',region:'a',correct:'azul',x:0,y:0,w:100,h:200},
      {type:'rect',region:'b',correct:'amarillo',x:100,y:0,w:100,h:200},
      {type:'rect',region:'c',correct:'rojo',x:200,y:0,w:100,h:200},
    ]},

  /* ───────────── LEVEL 5 — Experto Mundial (mastery) ───────────── */
  { id:'filipinas', es:'Filipinas', en:'Philippines', level:5, alarm_audio: 'music/alarms/philippines.webm',
    palette:[{key:'azul',hex:'#0038A8'},{key:'rojo',hex:'#CE1126'},{key:'blanco',hex:'#ffffff'},{key:'amarillo',hex:'#FCD116'}],
    parts:[
      {type:'polygon',region:'a',correct:'azul',points:'0,0 300,100 0,100'},
      {type:'polygon',region:'b',correct:'rojo',points:'0,200 300,100 0,100'},
      {type:'star',region:'c',correct:'amarillo',cx:60,cy:52,outer:16,inner:6},
      {type:'star',region:'d',correct:'amarillo',cx:60,cy:148,outer:16,inner:6},
      {type:'star',region:'e',correct:'amarillo',cx:118,cy:100,outer:16,inner:6},
    ]},

  { id:'arabia', es:'Arabia Saudita', en:'Saudi Arabia', level:5, alarm_audio: 'music/alarms/saudi_arabia.webm',
    palette:[{key:'verde',hex:'#006C35'},{key:'blanco',hex:'#ffffff'}],
    parts:[
      {type:'rect',region:'a',correct:'verde',x:0,y:0,w:300,h:200},
      {type:'rect',region:'b',correct:'blanco',x:130,y:80,w:90,h:40,rx:6},
    ]},

  { id:'egipto', es:'Egipto', en:'Egypt', level:5,
    palette:[{key:'rojo',hex:'#CE1126'},{key:'blanco',hex:'#ffffff'},{key:'negro',hex:'#000000'},{key:'amarillo',hex:'#C09300'}],
    parts:[
      {type:'rect',region:'a',correct:'rojo',x:0,y:0,w:300,h:67},
      {type:'rect',region:'b',correct:'blanco',x:0,y:67,w:300,h:66},
      {type:'rect',region:'c',correct:'negro',x:0,y:133,w:300,h:67},
      {type:'star',region:'d',correct:'amarillo',cx:150,cy:100,outer:18,inner:7},
    ]},

  { id:'corea', es:'Corea del Sur', en:'South Korea', level:5,
    palette:[{key:'blanco',hex:'#ffffff'},{key:'azul',hex:'#003478'},{key:'rojo',hex:'#CD2E3A'}],
    parts:[
      {type:'rect',region:'a',correct:'blanco',x:0,y:0,w:300,h:200},
      {type:'circle',region:'b',correct:'azul',cx:150,cy:78,r:42},
      {type:'circle',region:'c',correct:'rojo',cx:150,cy:118,r:42},
    ]},

  { id:'australia', es:'Australia', en:'Australia', level:5, alarm_audio: 'music/alarms/australia.webm',
    palette:[{key:'azul',hex:'#00247D'},{key:'blanco',hex:'#ffffff'},{key:'rojo',hex:'#CF142B'}],
    parts:[
      {type:'rect',region:'a',correct:'azul',x:0,y:0,w:300,h:200},
      {type:'group',region:'b',correct:'blanco',children:[
        {type:'star',cx:78,cy:44,outer:24,inner:10,points:7},
        {type:'star',cx:230,cy:60,outer:14,inner:6,points:5},
        {type:'star',cx:260,cy:120,outer:14,inner:6,points:5},
        {type:'star',cx:205,cy:150,outer:14,inner:6,points:5},
        {type:'star',cx:235,cy:170,outer:9,inner:4,points:5},
      ]},
    ],
    deco:[{type:'rect',fill:'#00247D',x:0,y:0,w:120,h:80},{type:'polygon',fill:'#ffffff',points:'0,0 120,80 0,80',opacity:0}]},

  { id:'lituania', es:'Lituania', en:'Lithuania', level:5, alarm_audio: 'music/alarms/lithuania.webm',
    palette:[{key:'amarillo',hex:'#FDB913'},{key:'verde',hex:'#006A44'},{key:'rojo',hex:'#C1272D'}],
    parts:[
      {type:'rect',region:'a',correct:'amarillo',x:0,y:0,w:300,h:67},
      {type:'rect',region:'b',correct:'verde',x:0,y:67,w:300,h:66},
      {type:'rect',region:'c',correct:'rojo',x:0,y:133,w:300,h:67},
    ]},

  { id:'estonia', es:'Estonia', en:'Estonia', level:5, alarm_audio: 'music/alarms/estonia.webm',
    palette:[{key:'azul',hex:'#0072CE'},{key:'negro',hex:'#000000'},{key:'blanco',hex:'#ffffff'}],
    parts:[
      {type:'rect',region:'a',correct:'azul',x:0,y:0,w:300,h:67},
      {type:'rect',region:'b',correct:'negro',x:0,y:67,w:300,h:66},
      {type:'rect',region:'c',correct:'blanco',x:0,y:133,w:300,h:67},
    ]},

  { id:'costarica', es:'Costa Rica', en:'Costa Rica', level:5,
    palette:[{key:'azul',hex:'#002B7F'},{key:'blanco',hex:'#ffffff'},{key:'rojo',hex:'#CE1126'}],
    parts:[
      {type:'rect',region:'a',correct:'azul',x:0,y:0,w:300,h:40},
      {type:'rect',region:'b',correct:'blanco',x:0,y:40,w:300,h:40},
      {type:'rect',region:'c',correct:'rojo',x:0,y:80,w:300,h:40},
      {type:'group',region:'d',correct:'blanco',children:[{type:'rect',x:0,y:120,w:300,h:40}]},
      {type:'group',region:'e',correct:'azul',children:[{type:'rect',x:0,y:160,w:300,h:40}]},
    ]},

  { id:'honduras', es:'Honduras', en:'Honduras', level:5,
    palette:[{key:'azul',hex:'#0073CF'},{key:'blanco',hex:'#ffffff'}],
    parts:[
      {type:'rect',region:'a',correct:'azul',x:0,y:0,w:300,h:67},
      {type:'rect',region:'b',correct:'blanco',x:0,y:67,w:300,h:66},
      {type:'rect',region:'c',correct:'azul',x:0,y:133,w:300,h:67},
      {type:'star',region:'d',correct:'azul',cx:110,cy:100,outer:14,inner:6},
      {type:'star',region:'e',correct:'azul',cx:190,cy:100,outer:14,inner:6},
    ]},

  { id:'ucrania', es:'Ucrania', en:'Ukraine', level:5, alarm_audio: 'music/alarms/ukraine.webm',
    palette:[{key:'azul',hex:'#0057B7'},{key:'amarillo',hex:'#FFD700'}],
    parts:[
      {type:'rect',region:'a',correct:'azul',x:0,y:0,w:300,h:100},
      {type:'rect',region:'b',correct:'amarillo',x:0,y:100,w:300,h:100},
    ]},

];

// ── Derived lookups ──
const FLAG_BY_ID = Object.fromEntries(FLAGS.map(f => [f.id, f]));
function flagsByLevel(level) { return FLAGS.filter(f => f.level === level); }
function getFlag(id) { return FLAG_BY_ID[id]; }
const LEVELS = [...new Set(FLAGS.map(f => f.level))].sort((a, b) => a - b);

/* ════════════════════════════════════════════════════════════════
   SVG GENERATOR — turns a flag's data into a paintable SVG string.
   Paintable parts get data-region + ghost fill; deco is static.
   ════════════════════════════════════════════════════════════════ */
function partToSVG(part, paintable = true) {
  const fill = paintable ? GHOST : (part.fill || '#888');
  const stroke = paintable ? GHOST_STROKE : (part.stroke || 'none');
  const sw = paintable ? 1.5 : (part.strokeWidth || 0);
  const regionAttr = paintable && part.region ? `data-region="${part.region}" class="region"` : '';

  // override lets a part inside a group carry its own fill (e.g., Greece canton bg)
  if (part.override) {
    return partToSVG({ ...part, override: false }, paintable).replace(`fill="${GHOST}"`, `fill="${part.fill}"`);
  }

  switch (part.type) {
    case 'rect':
      return `<rect ${regionAttr} x="${part.x}" y="${part.y}" width="${part.w}" height="${part.h}" rx="${part.rx || 0}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    case 'circle':
      return `<circle ${regionAttr} cx="${part.cx}" cy="${part.cy}" r="${part.r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    case 'polygon':
      return `<polygon ${regionAttr} points="${part.points}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    case 'star':
      return `<polygon ${regionAttr} points="${starPoints(part.cx, part.cy, part.outer, part.inner, part.points || 5, part.rot ?? -90)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    case 'path':
      return `<path ${regionAttr} d="${part.d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    case 'group': {
      const inner = part.children.map(c => partToSVG(c, paintable)).join('');
      const cls = paintable && part.region ? `data-region="${part.region}" class="region"` : '';
      return `<g ${cls}>${inner}</g>`;
    }
    default: return '';
  }
}

// Returns the full SVG + a map of region → correct color key
function getFlagSVG(flag) {
  const parts = flag.parts.map(p => partToSVG(p, true)).join('');
  const deco = (flag.deco || []).map(d => partToSVG({ ...d, region: null }, false)).join('');
  const svg = `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" class="flag-svg" preserveAspectRatio="xMidYMid meet">
    <defs>
      <filter id="soft" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.15"/>
      </filter>
    </defs>
    <rect x="0" y="0" width="300" height="200" fill="#ffffff" rx="6"/>
    ${parts}${deco}
    <rect x="1" y="1" width="298" height="198" fill="none" stroke="#cdd7e0" stroke-width="2" rx="6" pointer-events="none"/>
  </svg>`;
  return { svg, regions: flag.parts };
}


