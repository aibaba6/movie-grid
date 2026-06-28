import { useState, useRef, useCallback, useEffect } from "react";

const RATIOS = [
  { id: "9:16", label: "9:16", w: 9,  h: 16 },
  { id: "2:3",  label: "2:3",  w: 2,  h: 3  },
  { id: "3:4",  label: "3:4",  w: 3,  h: 4  },
  { id: "4:5",  label: "4:5",  w: 4,  h: 5  },
  { id: "1:1",  label: "1:1",  w: 1,  h: 1  },
  { id: "5:4",  label: "5:4",  w: 5,  h: 4  },
  { id: "4:3",  label: "4:3",  w: 4,  h: 3  },
  { id: "3:2",  label: "3:2",  w: 3,  h: 2  },
  { id: "16:9", label: "16:9", w: 16, h: 9  },
];

// ── フォーマット（配色＋タイポ＋雰囲気の完成テンプレート）──
// titleFont: 書き出し見出しのフォント / titleTransform: 大文字化など
const FORMATS = [
  {
    id:"editorial", name:"Editorial", tag:"余白と極細見出し",
    bg:"#0d0d0d", bg2:"#0d0d0d", bg3:"#0d0d0d", bgType:"solid", tx:"#f2f0ea", accent:"#f2f0ea",
    titleColor:"#f2f0ea", weight:300, titleFont:"'Space Grotesk', sans-serif",
    transform:"none", letter:"-0.02em",
  },
  {
    id:"prism", name:"Prism", tag:"虹色フィルム",
    bg:"#ff7a3d", bg2:"#48d6d2", bg3:"#7c5cff", bgType:"mesh", tx:"#1a1a1a", accent:"#ff4d8d",
    titleColor:"#ffffff", weight:500, titleFont:"'Space Grotesk', sans-serif",
    transform:"uppercase", letter:"-0.03em",
  },
  {
    id:"brutalist", name:"Brutalist", tag:"オレンジ単色×白抜き",
    bg:"#ff4d1c", bg2:"#ff4d1c", bg3:"#ff4d1c", bgType:"solid", tx:"#ffffff", accent:"#ffffff",
    titleColor:"#ffffff", weight:700, titleFont:"'Space Grotesk', sans-serif",
    transform:"uppercase", letter:"-0.03em",
  },
  {
    id:"soft", name:"Soft", tag:"パステル混色",
    bg:"#ffd9c0", bg2:"#ff9ec7", bg3:"#c4b5fd", bgType:"mesh", tx:"#3d2817", accent:"#ff7a4d",
    titleColor:"#5a2747", weight:400, titleFont:"'Space Grotesk', sans-serif",
    transform:"none", letter:"-0.01em",
  },
  {
    id:"retro", name:"Retro", tag:"70sフィルム粒状",
    bg:"#e8b84b", bg2:"#d97706", bg3:"#b45309", bgType:"film", tx:"#2b1700", accent:"#a63d00",
    titleColor:"#2b1700", weight:500, titleFont:"'DM Serif Display', serif",
    transform:"none", letter:"0",
  },
  {
    id:"mono", name:"Mono", tag:"完全モノクロ",
    bg:"#ffffff", bg2:"#ffffff", bg3:"#ffffff", bgType:"solid", tx:"#111111", accent:"#111111",
    titleColor:"#111111", weight:500, titleFont:"'Space Grotesk', sans-serif",
    transform:"uppercase", letter:"0.02em",
  },
  {
    id:"aurora", name:"Aurora", tag:"オーロラ混色",
    bg:"#1a1042", bg2:"#ff4d8d", bg3:"#22d3ee", bgType:"mesh", tx:"#e9d5ff", accent:"#c084fc",
    titleColor:"#ffffff", weight:300, titleFont:"'Space Grotesk', sans-serif",
    transform:"none", letter:"-0.02em",
  },
  {
    id:"sunset", name:"Sunset", tag:"夕焼けグラデ",
    bg:"#ff6b35", bg2:"#ffd23f", bg3:"#ff8fa3", bgType:"gradient", tx:"#2b0a00", accent:"#c1121f",
    titleColor:"#2b0a00", weight:500, titleFont:"'Space Grotesk', sans-serif",
    transform:"uppercase", letter:"-0.03em",
  },
  {
    id:"grain", name:"Grain", tag:"ダークフィルム",
    bg:"#1a1530", bg2:"#3d2b56", bg3:"#0f3460", bgType:"film", tx:"#e8e8e8", accent:"#ff4d1c",
    titleColor:"#f5f5f5", weight:400, titleFont:"'Space Grotesk', sans-serif",
    transform:"uppercase", letter:"0.01em",
  },
  {
    id:"vapor", name:"Vapor", tag:"ベイパーウェイブ",
    bg:"#ff6ec7", bg2:"#7c5cff", bg3:"#42e6f5", bgType:"mesh", tx:"#1a0a2e", accent:"#fde047",
    titleColor:"#ffffff", weight:700, titleFont:"'Space Grotesk', sans-serif",
    transform:"uppercase", letter:"-0.02em",
  },
  {
    id:"noir", name:"Noir", tag:"クラシック黒",
    bg:"#0a0a0a", bg2:"#0a0a0a", bg3:"#0a0a0a", bgType:"solid", tx:"#ffffff", accent:"#ffffff",
    titleColor:"#ffffff", weight:300, titleFont:"'Space Grotesk', sans-serif",
    transform:"none", letter:"-0.01em",
  },
  {
    id:"night", name:"Night", tag:"ディープブルー混色",
    bg:"#0f1729", bg2:"#3b2f6e", bg3:"#1e5f8c", bgType:"mesh", tx:"#a5b4fc", accent:"#818cf8",
    titleColor:"#e0e7ff", weight:300, titleFont:"'Space Grotesk', sans-serif",
    transform:"none", letter:"-0.01em",
  },
];

// ── カラーパレット（背景/下地/文字をワンタップ）──
const PALETTES = [
  { id:"noir",    bg:"#0a0a0a", tx:"#ffffff", title:"#ffffff" },
  { id:"paper",   bg:"#ffffff", tx:"#111111", title:"#111111" },
  { id:"cream",   bg:"#f5f0e8", tx:"#1a1a1a", title:"#1a1a1a" },
  { id:"mustard", bg:"#e8b84b", tx:"#2b1700", title:"#2b1700" },
  { id:"orange",  bg:"#ff4d1c", tx:"#ffffff", title:"#ffffff" },
  { id:"coral",   bg:"#ffe8d6", tx:"#3d2817", title:"#ff6b35" },
  { id:"lime",    bg:"#c4f000", tx:"#0a0a0a", title:"#0a0a0a" },
  { id:"forest",  bg:"#0d1f17", tx:"#9ae6b4", title:"#d4f5e2" },
  { id:"navy",    bg:"#0f1729", tx:"#a5b4fc", title:"#e0e7ff" },
  { id:"rose",    bg:"#1a0a12", tx:"#ffd6e8", title:"#ff8fc7" },
  { id:"sky",     bg:"#dbeafe", tx:"#1e3a5f", title:"#2563eb" },
  { id:"sand",    bg:"#3d2817", tx:"#f5dcc8", title:"#ffb380" },
];

const LAYOUT_MODES = [
  { id:"grid",  name:"均等グリッド", desc:"すべて同じ大きさ" },
  { id:"best3", name:"ベスト3",      desc:"上段に大きく3枚" },
  { id:"top1",  name:"TOP1",        desc:"1枚を主役に大きく" },
];

const STORAGE_KEY = "movie-grid-v4";
const DEFAULT = {
  formatId:"editorial", layoutMode:"grid",
  cols:3, rows:2, ratioId:"4:5",
  gap:10, padding:24,
  bgColor:"#0d0d0d", bg2Color:"#0d0d0d", bg3Color:"#0d0d0d", bgType:"solid", textColor:"#f2f0ea",
  showTitle:true, titleText:"MY FAVORITE FILMS",
  titleSize:30, titleWeight:300, titleColor:"#f2f0ea",
  titleFont:"'Space Grotesk', sans-serif", titleTransform:"none", titleLetter:"-0.02em",
};
const DEFAULT_RATIO = RATIOS.find(r => r.id === DEFAULT.ratioId) || RATIOS[3];

// グリッド構成から最適なキャンバス比率(RATIOSの中から最も近いもの)を返す
function bestRatioFor(mode, cols, rows, gapRatio, padRatio, titleRatio) {
  const AR = 2 / 3; // ポスター 2:3
  // マス幅を1とした時のグリッド全体の幅・高さ（相対値）
  let gridW, gridH;
  const cw = 1, ch = cw / AR; // 1マス: 幅1, 高さ1.5
  if (mode === "best3") {
    // 上段3枚 + 下段cols×rows（上段も下段も同じマス基準で近似）
    gridW = Math.max(3, cols) * cw + gapRatio * (Math.max(3, cols) - 1);
    gridH = ch + gapRatio + ch * rows + gapRatio * (rows - 1);
  } else if (mode === "top1") {
    // 大1枚(下段マスの1.3倍) + 下段cols×rows
    const fullW = cols * cw + gapRatio * (cols - 1);
    const heroW = Math.min(fullW, cw * 1.3), heroH = heroW / AR;
    gridW = fullW;
    gridH = heroH + gapRatio * 1.4 + ch * rows + gapRatio * (rows - 1);
  } else {
    gridW = cols * cw + gapRatio * (cols - 1);
    gridH = rows * ch + gapRatio * (rows - 1);
  }
  // 余白とタイトル分を加える
  const totalW = gridW + padRatio * 2;
  const totalH = gridH + padRatio * 2 + titleRatio;
  const target = totalW / totalH; // 目標の w/h
  // RATIOSから最も近い比率を選ぶ
  let best = RATIOS[0], bestDiff = Infinity;
  for (const r of RATIOS) {
    const rr = r.w / r.h;
    const diff = Math.abs(Math.log(rr) - Math.log(target));
    if (diff < bestDiff) { bestDiff = diff; best = r; }
  }
  return best;
}

function useDebounce(v, d) {
  const [val, setVal] = useState(v);
  useEffect(() => { const t = setTimeout(() => setVal(v), d); return () => clearTimeout(t); }, [v, d]);
  return val;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600&family=DM+Serif+Display&family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Serif+JP:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --ink:#0a0a0a;--paper:#ffffff;
    --g50:#fafafa;--g100:#f4f4f5;--g200:#e4e4e7;--g300:#d4d4d8;
    --g400:#a1a1aa;--g500:#71717a;--g600:#52525b;--g700:#3f3f46;
    --accent:#ff4d1c;
    --disp:'Space Grotesk',sans-serif;
    --body:'Inter','Noto Sans JP',sans-serif;
    --jp:'Noto Sans JP',sans-serif;
    --r-sm:12px;--r-md:18px;--r-lg:24px;--r-pill:100px;
    --bd:1px solid var(--g200);
    --soft:0 2px 8px rgba(0,0,0,0.04),0 8px 24px rgba(0,0,0,0.05);
    --soft-accent:0 4px 16px rgba(255,77,28,0.18);
  }
  body{font-family:var(--body);background:var(--paper);color:var(--ink);-webkit-font-smoothing:antialiased;}

  .visitor{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--g400);font-weight:500;
    padding:6px 12px;background:var(--g100);border-radius:100px;margin-bottom:24px;}
  .visitor-num{font-family:var(--disp);font-size:13px;font-weight:600;color:var(--ink);}

  .page{padding:0 0 120px;max-width:1320px;margin:0 auto;}

  /* HERO */
  .hero{padding:40px 24px 36px;}
  .hero-h1{font-family:var(--disp);font-weight:500;font-size:clamp(40px,8vw,84px);line-height:0.92;
    letter-spacing:-0.04em;color:var(--ink);}
  .hero-h1 .out{color:transparent;-webkit-text-stroke:1.5px var(--ink);}
  .hero-sub{font-size:14px;color:var(--g500);margin-top:18px;max-width:600px;line-height:1.7;}

  .wrap{padding:32px 24px 0;}
  .layout{display:flex;flex-direction:column;gap:32px;}
  .col-preview{order:2;display:flex;flex-direction:column;gap:14px;}
  .input-area{order:1;display:flex;flex-direction:column;gap:0;}
  .controls{order:3;display:flex;flex-direction:column;gap:28px;}
  @media(min-width:900px){
    .layout{flex-direction:row;align-items:start;gap:48px;}
    .col-preview{order:1;flex:0 0 42%;max-width:42%;position:sticky;top:88px;}
    .input-area{order:0;} .controls{order:0;}
    .col-right-wrap{order:2;flex:1;min-width:0;display:flex;flex-direction:column;gap:28px;}
  }
  .col-right-wrap{display:contents;}
  @media(min-width:900px){ .col-right-wrap{display:flex;} }

  /* STEP */
  .step{margin-bottom:28px;}
  .step-hd{display:flex;align-items:baseline;gap:10px;margin-bottom:14px;}
  .step-n{font-family:var(--disp);font-size:13px;font-weight:600;color:var(--accent);}
  .step-t{font-family:var(--disp);font-size:17px;font-weight:600;letter-spacing:-0.02em;color:var(--ink);}
  .step-hint{font-size:12px;color:var(--g400);margin-left:auto;}

  /* TITLE INPUT */
  .title-inp{width:100%;background:var(--g50);border:var(--bd);border-radius:var(--r-md);
    font-family:var(--disp);font-size:20px;font-weight:500;letter-spacing:-0.02em;color:var(--ink);
    padding:16px 20px;outline:none;transition:all .15s;}
  .title-inp:focus{background:var(--paper);box-shadow:var(--soft);}
  .title-inp::placeholder{color:var(--g300);}
  .title-inp:disabled{opacity:0.35;}
  .cb{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--g600);cursor:pointer;margin-top:12px;
    font-weight:500;}
  input[type=checkbox]{accent-color:var(--accent);width:16px;height:16px;}

  /* SEARCH */
  .lang-toggle{display:inline-flex;gap:0;margin-bottom:12px;border:var(--bd);border-radius:var(--r-pill);overflow:hidden;}
  .lang-btn{padding:8px 18px;border:none;background:transparent;font-family:var(--disp);font-size:12px;
    font-weight:500;color:var(--g500);cursor:pointer;transition:all .12s;}
  .lang-btn.on{background:var(--ink);color:var(--paper);}
  .search-inp{width:100%;padding:16px 20px;border:var(--bd);border-radius:var(--r-md);background:var(--g50);
    font-family:var(--body);font-size:16px;color:var(--ink);outline:none;-webkit-appearance:none;transition:all .15s;}
  .search-inp:focus{background:var(--paper);box-shadow:var(--soft);}
  .search-inp::placeholder{color:var(--g400);}
  .results-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px;}
  @media(min-width:600px){.results-grid{grid-template-columns:repeat(4,1fr);}}
  @media(min-width:900px){.results-grid{grid-template-columns:repeat(6,1fr);}}
  .res-card{position:relative;aspect-ratio:2/3;overflow:hidden;border-radius:var(--r-sm);cursor:pointer;
    transition:transform .12s,box-shadow .15s;-webkit-tap-highlight-color:transparent;background:var(--g100);}
  .res-card:active{transform:scale(0.95);}
  .res-card.selected{box-shadow:0 0 0 2.5px var(--accent);}
  .res-card img{width:100%;height:100%;object-fit:cover;display:block;}
  .res-card-check{position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;background:var(--accent);
    color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;}
  .res-card-title{position:absolute;bottom:0;left:0;right:0;background:rgba(10,10,10,0.82);
    color:#fff;font-size:8px;padding:6px 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500;}
  .searching-msg{font-size:13px;color:var(--g400);text-align:center;padding:18px 0;font-weight:500;}

  .divider{display:flex;align-items:center;gap:14px;margin:24px 0 16px;}
  .divider-line{flex:1;height:1px;background:var(--g200);}
  .divider-lbl{font-family:var(--disp);font-size:11px;color:var(--g400);letter-spacing:0.12em;text-transform:uppercase;white-space:nowrap;font-weight:500;}

  .drop{border:1.5px dashed var(--g300);border-radius:var(--r-md);padding:24px;text-align:center;cursor:pointer;
    display:flex;flex-direction:column;gap:6px;transition:all .15s;margin-bottom:24px;background:var(--g50);}
  .drop:active,.drop.over{border-color:var(--accent);background:var(--paper);}
  .drop-main{font-size:13px;color:var(--ink);font-weight:500;}
  .drop-sub{font-family:var(--disp);font-size:11px;color:var(--g400);letter-spacing:0.08em;text-transform:uppercase;}

  /* TRAY */
  .lbl{font-family:var(--disp);font-size:11px;color:var(--g500);letter-spacing:0.1em;text-transform:uppercase;font-weight:600;}
  .tray-hd{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px;}
  .tray-ct{font-size:11px;color:var(--g400);font-weight:500;}
  .tray-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(58px,1fr));gap:8px;margin-bottom:24px;}
  .tc{position:relative;aspect-ratio:2/3;overflow:hidden;border-radius:var(--r-sm);cursor:grab;
    transition:transform .12s,opacity .15s,box-shadow .15s;user-select:none;touch-action:none;background:var(--g100);}
  .tc:active{cursor:grabbing;}
  .tc.dragging{opacity:0.85;box-shadow:var(--soft-accent),0 0 0 2.5px var(--accent);transform:scale(1.08);z-index:3;}
  .tc.excl{opacity:0.25;}
  .tc img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;}
  .tc-rm{position:absolute;top:4px;right:4px;width:18px;height:18px;border-radius:50%;background:rgba(10,10,10,0.7);
    color:#fff;font-size:9px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2;}

  /* FORMAT CARDS */
  .fmt-row{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
  @media(min-width:480px){.fmt-row{grid-template-columns:repeat(4,1fr);}}
  .fmt-card{cursor:pointer;border-radius:var(--r-md);overflow:hidden;transition:transform .12s,box-shadow .15s;
    -webkit-tap-highlight-color:transparent;background:var(--paper);box-shadow:var(--soft);}
  .fmt-card:active{transform:scale(0.96);}
  .fmt-card.on{box-shadow:0 0 0 2.5px var(--accent),var(--soft-accent);}
  .fmt-prev{height:64px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}
  .fmt-prev-t{font-family:var(--disp);font-size:16px;font-weight:700;letter-spacing:-0.03em;z-index:1;}
  .fmt-meta{padding:9px 12px;background:var(--paper);}
  .fmt-name{font-family:var(--disp);font-size:13px;font-weight:600;color:var(--ink);letter-spacing:-0.01em;}
  .fmt-tag{font-size:10px;color:var(--g400);margin-top:1px;}

  /* MODE */
  .mode-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .mode-card{padding:16px;border-radius:var(--r-md);border:var(--bd);background:var(--paper);cursor:pointer;text-align:left;
    transition:all .12s;-webkit-tap-highlight-color:transparent;}
  .mode-card.on{background:var(--ink);border-color:var(--ink);box-shadow:var(--soft);}
  .mode-card.on .mode-name{color:var(--paper);} .mode-card.on .mode-desc{color:var(--g400);}
  .mode-name{font-family:var(--disp);font-size:14px;font-weight:600;color:var(--ink);letter-spacing:-0.01em;}
  .mode-desc{font-size:11px;color:var(--g500);margin-top:3px;}

  /* SLIDERS */
  .sl{display:flex;flex-direction:column;gap:6px;}
  .sl-row{display:flex;justify-content:space-between;align-items:baseline;}
  .sl-lbl{font-size:12px;color:var(--g600);font-weight:500;}
  .sl-val{font-family:var(--disp);font-size:14px;color:var(--ink);font-weight:600;}
  input[type=range]{width:100%;accent-color:var(--ink);cursor:pointer;height:20px;}

  /* PALETTE */
  .pal-row{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:16px;}
  .pal{aspect-ratio:1;border-radius:12px;cursor:pointer;position:relative;overflow:hidden;
    border:var(--bd);transition:transform .12s,box-shadow .15s;-webkit-tap-highlight-color:transparent;
    display:flex;flex-direction:column;}
  .pal:active{transform:scale(0.92);}
  .pal.on{box-shadow:0 0 0 2.5px var(--accent);}
  .pal-bg{flex:1;display:flex;align-items:center;justify-content:center;}
  .pal-aa{font-family:var(--disp);font-size:13px;font-weight:700;letter-spacing:-0.02em;}
  .pal-strip{height:7px;display:flex;}
  .pal-strip span{flex:1;}

  /* COLOR */
  .ci{display:flex;align-items:center;gap:10px;}
  .ci-lbl{font-size:12px;color:var(--g600);width:34px;flex-shrink:0;font-weight:500;}
  .swatch{width:32px;height:32px;border-radius:10px;border:var(--bd);position:relative;overflow:hidden;flex-shrink:0;cursor:pointer;}
  .swatch input[type=color]{position:absolute;inset:-4px;width:calc(100% + 8px);height:calc(100% + 8px);opacity:0;cursor:pointer;border:none;}
  .hex-inp{font-family:var(--disp);font-size:12px;color:var(--ink);background:transparent;border:none;
    border-bottom:1px solid var(--g300);width:84px;outline:none;padding:3px 0;font-weight:500;}
  .hex-inp:focus{border-color:var(--ink);}
  .chips{display:flex;gap:8px;flex-wrap:wrap;}
  .chip{font-family:var(--disp);font-size:11px;padding:7px 14px;border:var(--bd);border-radius:var(--r-pill);
    background:var(--paper);color:var(--ink);cursor:pointer;transition:all .12s;font-weight:500;
    -webkit-tap-highlight-color:transparent;}
  .chip.on{background:var(--ink);color:var(--paper);border-color:var(--ink);}

  /* ACCORDION */
  .acc{border:var(--bd);border-radius:var(--r-md);overflow:hidden;background:var(--paper);}
  .acc-hd{width:100%;padding:16px 18px;background:transparent;border:none;cursor:pointer;
    display:flex;align-items:center;justify-content:space-between;font-family:var(--disp);font-size:13px;
    font-weight:600;color:var(--ink);letter-spacing:-0.01em;}
  .acc-arrow{transition:transform .2s;font-size:10px;}
  .acc-arrow.open{transform:rotate(180deg);}
  .acc-body{padding:6px 18px 22px;display:flex;flex-direction:column;gap:0;border-top:var(--bd);}
  .acc-body > div{padding:20px 0;}
  .acc-body > div:first-child{padding-top:14px;}
  .acc-body > div + div{border-top:var(--bd);}
  .sect-t{font-family:var(--disp);font-size:14px;color:var(--ink);letter-spacing:0.04em;text-transform:uppercase;
    margin-bottom:12px;font-weight:700;}

  /* EXPORT */
  .exp{width:100%;padding:18px 0;border:none;border-radius:var(--r-pill);background:var(--ink);color:var(--paper);
    font-family:var(--disp);font-size:15px;font-weight:600;letter-spacing:-0.01em;cursor:pointer;
    transition:all .15s;-webkit-tap-highlight-color:transparent;box-shadow:var(--soft);}
  .exp:active{transform:scale(0.98);}
  .exp:hover:not(:disabled){box-shadow:var(--soft-accent);}
  .exp:disabled{background:var(--g200);color:var(--g400);cursor:default;box-shadow:none;}
  .save-row{display:flex;gap:10px;}
  .save-btn{flex:1;padding:13px 0;border:var(--bd);border-radius:var(--r-pill);background:var(--paper);color:var(--ink);
    font-family:var(--disp);font-size:12px;font-weight:500;cursor:pointer;transition:all .12s;}
  .save-btn:active{transform:scale(0.97);}
  .reset-btn{padding:13px 20px;border:var(--bd);border-radius:var(--r-pill);background:var(--paper);color:var(--g500);
    font-family:var(--disp);font-size:12px;font-weight:500;cursor:pointer;}
  .st{font-size:11px;color:var(--accent);text-align:center;min-height:14px;font-weight:600;
    font-family:var(--disp);letter-spacing:0.04em;}
  .prev-hd{display:flex;justify-content:space-between;align-items:baseline;}
  .prev-ct{font-size:11px;color:var(--g400);font-weight:500;}
  .hint{font-size:11px;color:var(--g400);line-height:1.6;}
`;

function SliderRow({ label, value, min, max, step, onChange, unit = "" }) {
  return (
    <div className="sl">
      <div className="sl-row"><span className="sl-lbl">{label}</span><span className="sl-val">{value}{unit}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} />
    </div>
  );
}
function ColorInput({ label, value, onChange }) {
  return (
    <div className="ci">
      <span className="ci-lbl">{label}</span>
      <div className="swatch" style={{ background: value }}>
        <input type="color" value={value} onChange={e => onChange(e.target.value)} />
      </div>
      <input type="text" className="hex-inp" value={value}
        onChange={e => { const v = e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v); }}
        onBlur={e => { if (!/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(value); }}
        maxLength={7} spellCheck={false} />
    </div>
  );
}

export default function App() {
  const [images, setImages]           = useState([]);
  const [formatId, setFormatId]       = useState(DEFAULT.formatId);
  const [layoutMode, setLayoutMode]   = useState(DEFAULT.layoutMode);
  const [cols, setCols]               = useState(DEFAULT.cols);
  const [rows, setRows]               = useState(DEFAULT.rows);
  const [ratio, setRatio]             = useState(DEFAULT_RATIO);
  const [autoRatio, setAutoRatio]     = useState(true);
  const [gap, setGap]                 = useState(DEFAULT.gap);
  const [padding, setPadding]         = useState(DEFAULT.padding);
  const [bgColor, setBgColor]         = useState(DEFAULT.bgColor);
  const [bg2Color, setBg2Color]       = useState(DEFAULT.bg2Color);
  const [bg3Color, setBg3Color]       = useState(DEFAULT.bg3Color);
  const [bgType, setBgType]           = useState(DEFAULT.bgType);
  const [textColor, setTextColor]     = useState(DEFAULT.textColor);
  const [showTitle, setShowTitle]     = useState(DEFAULT.showTitle);
  const [titleText, setTitleText]     = useState(DEFAULT.titleText);
  const [titleSize, setTitleSize]     = useState(DEFAULT.titleSize);
  const [titleWeight, setTitleWeight] = useState(DEFAULT.titleWeight);
  const [titleColor, setTitleColor]   = useState(DEFAULT.titleColor);
  const [titleFont, setTitleFont]     = useState(DEFAULT.titleFont);
  const [jpSerif, setJpSerif]         = useState(false);
  const [titleTransform, setTitleTransform] = useState(DEFAULT.titleTransform);
  const [titleLetter, setTitleLetter] = useState(DEFAULT.titleLetter);
  const [showDetail, setShowDetail]   = useState(false);
  const [dropOver, setDropOver]       = useState(false);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [saveStatus, setSaveStatus]   = useState("");
  const [exporting, setExporting]     = useState(false);
  const [visitors, setVisitors]       = useState(null);
  const [previewW, setPreviewW]       = useState(420);

  const [query, setQuery]             = useState("");
  const [lang, setLang]               = useState("ja-JP");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]     = useState(false);
  const debouncedQ                    = useDebounce(query, 450);

  const fileInputRef  = useRef(null);
  const previewBoxRef = useRef(null);
  const dragState     = useRef({ active:false, current:null, scope:null });

  const totalSlots    = layoutMode === "best3" ? 3 + cols * rows
                      : layoutMode === "top1"  ? 1 + cols * rows
                      : cols * rows;
  const usableImages  = images.slice(0, totalSlots);
  const n             = usableImages.length;

  useEffect(() => {
    fetch("/api/visitors", { method:"POST" }).then(r => r.json()).then(d => setVisitors(d.count)).catch(() => {});
  }, []);
  useEffect(() => {
    if (!previewBoxRef.current) return;
    const ro = new ResizeObserver(es => { const w = es[0]?.contentRect?.width; if (w) setPreviewW(Math.round(w)); });
    ro.observe(previewBoxRef.current);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (s.formatId)    setFormatId(s.formatId);
      if (s.layoutMode)  setLayoutMode(s.layoutMode);
      if (s.cols)        setCols(s.cols);
      if (s.rows)        setRows(s.rows);
      if (s.ratioId)     setRatio(RATIOS.find(r => r.id === s.ratioId) || DEFAULT_RATIO);
      if (s.autoRatio != null) setAutoRatio(s.autoRatio);
      if (s.gap != null) setGap(s.gap);
      if (s.padding != null) setPadding(s.padding);
      if (s.bgColor)     setBgColor(s.bgColor);
      if (s.bg2Color)    setBg2Color(s.bg2Color);
      if (s.bg3Color)    setBg3Color(s.bg3Color);
      if (s.bgType)      setBgType(s.bgType);
      if (s.textColor)   setTextColor(s.textColor);
      if (s.showTitle != null) setShowTitle(s.showTitle);
      if (s.titleText)   setTitleText(s.titleText);
      if (s.titleSize != null) setTitleSize(s.titleSize);
      if (s.titleWeight != null) setTitleWeight(s.titleWeight);
      if (s.titleColor)  setTitleColor(s.titleColor);
      if (s.titleFont)   setTitleFont(s.titleFont);
      if (s.jpSerif != null) setJpSerif(s.jpSerif);
      if (s.titleTransform) setTitleTransform(s.titleTransform);
      if (s.titleLetter) setTitleLetter(s.titleLetter);
    } catch (_) {}
  }, []);

  // ── autoRatio: グリッド数から最適比率を自動適用 ──
  useEffect(() => {
    if (!autoRatio) return;
    // gap/paddingをマス幅基準の相対値に。マス幅の実寸は可変なので、
    // 600px幅キャンバスで cols 並ぶときの1マス幅を基準に近似
    const approxCellW = (600 - padding * 2 - gap * (cols - 1)) / Math.max(1, cols);
    const gapR = approxCellW > 0 ? gap / approxCellW : 0.04;
    const padR = approxCellW > 0 ? padding / approxCellW : 0.08;
    const titleR = showTitle ? (titleSize * 1.5 + gap) / Math.max(1, approxCellW) : 0;
    const best = bestRatioFor(layoutMode, cols, rows, gapR, padR, titleR);
    setRatio(prev => prev.id === best.id ? prev : best);
  }, [autoRatio, layoutMode, cols, rows, gap, padding, showTitle, titleSize]);

  // ── 枚数クイック選択（TOP N をきれいな行×列に）──
  const COUNT_PRESETS = [
    { n:3,  mode:"grid",  cols:3, rows:1, label:"TOP3" },
    { n:5,  mode:"top1",  cols:2, rows:2, label:"TOP5" },
    { n:6,  mode:"grid",  cols:3, rows:2, label:"TOP6" },
    { n:9,  mode:"grid",  cols:3, rows:3, label:"TOP9" },
    { n:10, mode:"top1",  cols:3, rows:3, label:"TOP10" },
    { n:12, mode:"grid",  cols:3, rows:4, label:"TOP12" },
  ];
  const applyCount = (p) => { setLayoutMode(p.mode); setCols(p.cols); setRows(p.rows); };

  const applyFormat = (f) => {
    setFormatId(f.id);
    setBgColor(f.bg); setBg2Color(f.bg2 || f.bg); setBg3Color(f.bg3 || f.bg2 || f.bg); setBgType(f.bgType || "solid");
    setTextColor(f.tx);
    setTitleColor(f.titleColor); setTitleWeight(f.weight);
    setTitleFont(f.titleFont); setTitleTransform(f.transform); setTitleLetter(f.letter);
  };

  useEffect(() => {
    if (!debouncedQ.trim()) { setSearchResults([]); return; }
    setSearching(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQ)}&lang=${lang}`)
      .then(r => r.json()).then(d => setSearchResults(d.results || []))
      .catch(() => setSearchResults([])).finally(() => setSearching(false));
  }, [debouncedQ, lang]);

  const addFromSearch = async (movie) => {
    if (images.some(i => i.tmdbId === movie.id)) return;
    try {
      const res = await fetch(movie.poster);
      const blob = await res.blob();
      const src = await new Promise(r => { const fr = new FileReader(); fr.onload = e => r(e.target.result); fr.readAsDataURL(blob); });
      setImages(prev => [...prev, { id:Date.now()+Math.random(), tmdbId:movie.id, src, thumb:movie.posterSmall, title:movie.title, year:movie.year }]);
    } catch (_) {}
  };

  const showSt = msg => { setSaveStatus(msg); setTimeout(() => setSaveStatus(""), 2200); };
  const saveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        formatId, layoutMode, cols, rows, ratioId:ratio.id, autoRatio, gap, padding,
        bgColor, bg2Color, bg3Color, bgType, textColor, showTitle, titleText, titleSize, titleWeight, titleColor,
        titleFont, titleTransform, titleLetter, jpSerif,
      }));
      showSt("SAVED");
    } catch (_) { showSt("ERROR"); }
  };
  const resetSettings = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    const d = DEFAULT;
    setFormatId(d.formatId); setLayoutMode(d.layoutMode);
    setCols(d.cols); setRows(d.rows); setRatio(DEFAULT_RATIO); setAutoRatio(true);
    setGap(d.gap); setPadding(d.padding);
    setBgColor(d.bgColor); setBg2Color(d.bg2Color); setBg3Color(d.bg3Color); setBgType(d.bgType); setTextColor(d.textColor);
    setShowTitle(d.showTitle); setTitleText(d.titleText);
    setTitleSize(d.titleSize); setTitleWeight(d.titleWeight); setTitleColor(d.titleColor);
    setTitleFont(d.titleFont); setTitleTransform(d.titleTransform); setTitleLetter(d.titleLetter); setJpSerif(false);
    showSt("RESET");
  };

  const handleFiles = useCallback((files) => {
    Array.from(files).filter(f => f.type.startsWith("image/")).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => setImages(prev => [...prev, { id:Date.now()+Math.random(), src:e.target.result, title:file.name.replace(/\.[^.]+$/, "").replace(/[-_.]/g, " ") }]);
      reader.readAsDataURL(file);
    });
  }, []);
  const removeImage = id => setImages(prev => prev.filter(i => i.id !== id));

  const onPointerDown = (i) => (e) => {
    if (e.target.closest(".tc-rm")) return;
    e.preventDefault();
    const scope = e.currentTarget.getAttribute("data-scope");
    dragState.current = { active:true, current:i, scope };
    setDraggingIdx(i);
    const handleMove = (ev) => {
      if (!dragState.current.active) return;
      const px = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const py = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const el = document.elementFromPoint(px, py);
      const cell = el?.closest("[data-idx]");
      if (!cell || cell.getAttribute("data-scope") !== dragState.current.scope) return;
      const over = parseInt(cell.getAttribute("data-idx"), 10);
      const cur = dragState.current.current;
      if (!isNaN(over) && over !== cur) {
        setImages(prev => { const a = [...prev]; const [x] = a.splice(cur, 1); a.splice(over, 0, x); return a; });
        dragState.current.current = over; setDraggingIdx(over);
      }
    };
    const handleUp = () => {
      dragState.current = { active:false, current:null, scope:null };
      setDraggingIdx(null);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
    window.addEventListener("pointermove", handleMove, { passive:false });
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive:false });
    window.addEventListener("touchend", handleUp);
  };

  const PW = previewW || 420;
  const PH = Math.round(PW * ratio.h / ratio.w);
  const vPad = padding * (PW / 600);
  const vGap = gap * (PW / 600);
  const vTS  = titleSize * (PW / 600);
  const wLabel = { 100:"Thin",200:"ExtraLight",300:"Light",400:"Regular",500:"Medium",600:"SemiBold",700:"Bold" };

  // ── プレビュー用CSS背景（ポスター背後に見える）──
  function previewBgStyle() {
    if (bgType === "gradient") {
      return { backgroundImage:`linear-gradient(135deg, ${bgColor} 0%, ${bg2Color} 50%, ${bg3Color} 100%)` };
    }
    if (bgType === "mesh") {
      // 多色メッシュ：4つのソフトなradialを混ぜる
      return { backgroundColor:bgColor, backgroundImage:
        `radial-gradient(circle at 18% 22%, ${bg2Color}ee 0%, transparent 50%),`
        + `radial-gradient(circle at 82% 18%, ${bg3Color}dd 0%, transparent 50%),`
        + `radial-gradient(circle at 72% 78%, ${bg2Color}cc 0%, transparent 52%),`
        + `radial-gradient(circle at 22% 82%, ${bg3Color}bb 0%, transparent 50%),`
        + `radial-gradient(circle at 50% 50%, ${bgColor}88 0%, transparent 60%)` };
    }
    if (bgType === "film") {
      // フィルム：グラデ + 粒子ノイズを重ねる
      const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`;
      return { backgroundColor:bgColor, backgroundImage:
        `${noise},`
        + `radial-gradient(ellipse at 30% 30%, ${bg2Color} 0%, transparent 60%),`
        + `radial-gradient(ellipse at 75% 70%, ${bg3Color} 0%, transparent 60%),`
        + `linear-gradient(135deg, ${bgColor} 0%, ${bg2Color} 100%)`,
        backgroundBlendMode:"overlay, normal, normal, normal" };
    }
    if (bgType === "noise") {
      const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
      return { backgroundColor:bgColor, backgroundImage:`${noise}`, backgroundBlendMode:"overlay" };
    }
    return { background:bgColor };
  }

  const PW2 = PW;

  function layoutRects(W, H, pad, g, tH) {
    const availW = W - pad * 2;
    const availH = H - pad * 2 - tH;
    const AR = 2 / 3; // ポスター比率 w:h = 2:3
    const rects = [];
    if (layoutMode === "best3") {
      // 上段3枚 + 下段グリッド。各マスを2:3に固定し、全体を中央配置
      // 上段マス幅: 横3枚で availW を分割
      const topCellW = (availW - g * 2) / 3;
      const topCellH = topCellW / AR;
      // 下段マス: cols×rows
      const botCellW = (availW - g * (cols - 1)) / cols;
      const botCellH = botCellW / AR;
      // 全体の高さ
      const totalH = topCellH + g + botCellH * rows + g * (rows - 1);
      // 高さが収まらなければ全体をスケールダウン
      const scale = totalH > availH ? availH / totalH : 1;
      const tcw = topCellW * scale, tch = topCellH * scale;
      const bcw = botCellW * scale, bch = botCellH * scale;
      const gg = g * scale;
      const usedH = tch + gg + bch * rows + gg * (rows - 1);
      const offY = pad + tH + (availH - usedH) / 2;
      // 上段（3枚を中央寄せ）
      const topRowW = tcw * 3 + gg * 2;
      const topOffX = pad + (availW - topRowW) / 2;
      for (let i = 0; i < 3; i++)
        rects.push({ x: topOffX + i * (tcw + gg), y: offY, w: tcw, h: tch, slot: i });
      // 下段
      const botRowW = bcw * cols + gg * (cols - 1);
      const botOffX = pad + (availW - botRowW) / 2;
      const botTop = offY + tch + gg;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
        rects.push({ x: botOffX + c * (bcw + gg), y: botTop + r * (bch + gg), w: bcw, h: bch, slot: 3 + r * cols + c });
    } else if (layoutMode === "top1") {
      // TOP1：大きな1枚を中央上に、その下にcols×rowsの小グリッド
      // 大1枚は下段マスの約1.3倍（他より少し大きい程度）。2:3固定
      const botCellW = (availW - g * (cols - 1)) / cols;
      const botCellH = botCellW / AR;
      const heroW = Math.min(availW, botCellW * 1.3);
      const heroH = heroW / AR;
      const totalH = heroH + g * 1.4 + botCellH * rows + g * (rows - 1);
      const scale = totalH > availH ? availH / totalH : 1;
      const hw = heroW * scale, hh = heroH * scale;
      const bcw = botCellW * scale, bch = botCellH * scale;
      const gg = g * scale;
      const usedH = hh + gg * 1.4 + bch * rows + gg * (rows - 1);
      const offY = pad + tH + (availH - usedH) / 2;
      // 大1枚（中央）
      rects.push({ x: pad + (availW - hw) / 2, y: offY, w: hw, h: hh, slot: 0 });
      // 下段グリッド
      const botRowW = bcw * cols + gg * (cols - 1);
      const botOffX = pad + (availW - botRowW) / 2;
      const botTop = offY + hh + gg * 1.4;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
        rects.push({ x: botOffX + c * (bcw + gg), y: botTop + r * (bch + gg), w: bcw, h: bch, slot: 1 + r * cols + c });
    } else {
      // 均等グリッド：各マスを2:3に固定し、グリッド全体を中央配置
      // 幅基準のマスサイズ
      const cellWByW = (availW - g * (cols - 1)) / cols;
      const cellHByW = cellWByW / AR;
      const gridHByW = cellHByW * rows + g * (rows - 1);
      // 高さ基準のマスサイズ
      const cellHByH = (availH - g * (rows - 1)) / rows;
      const cellWByH = cellHByH * AR;
      const gridWByH = cellWByH * cols + g * (cols - 1);
      // 収まる方を採用
      let cellW, cellH;
      if (gridHByW <= availH) { cellW = cellWByW; cellH = cellHByW; }
      else { cellW = cellWByH; cellH = cellHByH; }
      const gridW = cellW * cols + g * (cols - 1);
      const gridH = cellH * rows + g * (rows - 1);
      const offX = pad + (availW - gridW) / 2;
      const offY = pad + tH + (availH - gridH) / 2;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
        rects.push({ x: offX + c * (cellW + g), y: offY + r * (cellH + g), w: cellW, h: cellH, slot: r * cols + c });
    }
    return rects;
  }
  const titleBlockH = showTitle ? vTS * 1.5 + vGap : 0;
  const previewRects = layoutRects(PW, PH, vPad, vGap, titleBlockH);

  // ── canvas背景描画（書き出し用、プレビューと一致）──
  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const v = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
    return { r:parseInt(v.slice(0,2),16), g:parseInt(v.slice(2,4),16), b:parseInt(v.slice(4,6),16) };
  }
  function drawCanvasBg(ctx, W, H) {
    ctx.fillStyle = bgColor; ctx.fillRect(0, 0, W, H);
    if (bgType === "gradient") {
      const gr = ctx.createLinearGradient(0, 0, W, H);
      gr.addColorStop(0, bgColor); gr.addColorStop(0.5, bg2Color); gr.addColorStop(1, bg3Color);
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    } else if (bgType === "mesh") {
      const blobs = [
        { x:W*0.18, y:H*0.22, r:W*0.55, c:bg2Color, a:0.95 },
        { x:W*0.82, y:H*0.18, r:W*0.5,  c:bg3Color, a:0.9 },
        { x:W*0.72, y:H*0.78, r:W*0.6,  c:bg2Color, a:0.75 },
        { x:W*0.22, y:H*0.82, r:W*0.5,  c:bg3Color, a:0.7 },
        { x:W*0.5,  y:H*0.5,  r:W*0.65, c:bgColor,  a:0.5 },
      ];
      for (const b of blobs) {
        const { r:rr, g:gg, b:bb } = hexToRgb(b.c);
        const rg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        rg.addColorStop(0, `rgba(${rr},${gg},${bb},${b.a})`);
        rg.addColorStop(1, `rgba(${rr},${gg},${bb},0)`);
        ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
      }
    } else if (bgType === "film") {
      // グラデ下地
      const gr = ctx.createLinearGradient(0, 0, W, H);
      gr.addColorStop(0, bgColor); gr.addColorStop(1, bg2Color);
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
      // カラーにじみ
      for (const b of [{x:W*0.3,y:H*0.3,c:bg2Color,a:0.6},{x:W*0.75,y:H*0.7,c:bg3Color,a:0.6}]) {
        const { r:rr, g:gg, b:bb } = hexToRgb(b.c);
        const rg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, W*0.55);
        rg.addColorStop(0, `rgba(${rr},${gg},${bb},${b.a})`);
        rg.addColorStop(1, `rgba(${rr},${gg},${bb},0)`);
        ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
      }
      // フィルムグレイン（強め）
      const id = ctx.getImageData(0, 0, W, H);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (Math.random() - 0.5) * 55;
        d[i] = Math.max(0, Math.min(255, d[i] + n));
        d[i+1] = Math.max(0, Math.min(255, d[i+1] + n));
        d[i+2] = Math.max(0, Math.min(255, d[i+2] + n));
      }
      ctx.putImageData(id, 0, 0);
    } else if (bgType === "noise") {
      const id = ctx.getImageData(0, 0, W, H);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (Math.random() - 0.5) * 42;
        d[i] = Math.max(0, Math.min(255, d[i] + n));
        d[i+1] = Math.max(0, Math.min(255, d[i+1] + n));
        d[i+2] = Math.max(0, Math.min(255, d[i+2] + n));
      }
      ctx.putImageData(id, 0, 0);
    }
  }

  const exportImage = async () => {
    if (n === 0) return;
    if (exporting) return;
    setExporting(true);
    try {
      const OUT = 1440;
      const cW = OUT, cH = Math.round(OUT * ratio.h / ratio.w);
      const cv = document.createElement("canvas");
      cv.width = cW; cv.height = cH;
      const ctx = cv.getContext("2d");
      drawCanvasBg(ctx, cW, cH);
      const SC = cW / 600;
      const pad = padding * SC, g = gap * SC, tFS = titleSize * SC;
      const tH = showTitle ? tFS * 1.5 + g : 0;

      await new Promise(resolve => {
        const probe = document.createElement("div");
        probe.style.cssText = "position:fixed;top:-999px;left:-999px;visibility:hidden;"
          + `font-family:${effectiveFont};font-weight:${titleWeight};font-size:32px;`;
        probe.textContent = titleText || "A";
        document.body.appendChild(probe);
        document.fonts.ready.then(() => { document.body.removeChild(probe); resolve(); });
      });

      if (showTitle && titleText) {
        ctx.fillStyle = titleColor;
        ctx.font = `${titleWeight} ${Math.round(tFS)}px ${effectiveFont}`;
        ctx.textBaseline = "alphabetic";
        const disp = titleTransform === "uppercase" ? titleText.toUpperCase() : titleText;
        ctx.save();
        if (titleLetter && titleLetter !== "0") {
          // letter-spacing emulation, centered
          const ls = parseFloat(titleLetter) * tFS;
          let total = 0;
          for (const ch of disp) total += ctx.measureText(ch).width + ls;
          total -= ls; // 末尾の余白を除く
          ctx.textAlign = "left";
          let x = (cW - total) / 2;
          for (const ch of disp) { ctx.fillText(ch, x, pad + tFS); x += ctx.measureText(ch).width + ls; }
        } else {
          ctx.textAlign = "center";
          ctx.fillText(disp, cW / 2, pad + tFS, cW - pad * 2);
        }
        ctx.restore();
      }

      const rects = layoutRects(cW, cH, pad, g, tH);
      for (const rect of rects) {
        const img = usableImages[rect.slot];
        if (img) {
          await new Promise(resolve => {
            const el = new Image();
            el.onload = () => {
              const s = Math.max(rect.w / el.width, rect.h / el.height);
              const dw = el.width * s, dh = el.height * s;
              ctx.save(); ctx.beginPath(); ctx.roundRect(rect.x, rect.y, rect.w, rect.h, Math.max(6, Math.min(rect.w,rect.h)*0.06)); ctx.clip();
              ctx.drawImage(el, rect.x + (rect.w - dw) / 2, rect.y + (rect.h - dh) / 2, dw, dh);
              ctx.restore(); resolve();
            };
            el.onerror = () => resolve();
            el.src = img.src;
          });
        }
      }

      const dataURL = cv.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataURL; a.download = `moviegrid-${Date.now()}.png`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (err) {
      alert("書き出し失敗: " + err.message);
    } finally { setExporting(false); }
  };

  const dispTitle = titleTransform === "uppercase" ? (titleText || "").toUpperCase() : titleText;
  // 英語書体に日本語フォールバックを足す。jpSerifでセリフ/サンセリフを切替
  const jpFontFamily = jpSerif ? "'Noto Serif JP', serif" : "'Noto Sans JP', sans-serif";
  const effectiveFont = `${titleFont.replace(/,?\s*(sans-serif|serif)\s*$/,"")}, ${jpFontFamily}`;

  return (
    <>
      <style>{css}</style>

      <div className="page">
        <div className="hero">
          {visitors !== null && <div className="visitor"><span>VISITORS</span><span className="visitor-num">{visitors.toLocaleString()}</span></div>}
          <h1 className="hero-h1">MOVIE<span className="out">GRID.</span></h1>
          <p className="hero-sub">映画を検索してポスターを選ぶ。<br/>フォーマットを選ぶだけで、雑誌のようなSNS画像が完成する。</p>
        </div>

        <div className="wrap">
          <div className="layout">

            {/* PREVIEW */}
            <div className="col-preview">
              <div className="prev-hd">
                <span className="lbl">Preview</span>
                <span className="prev-ct">{n} 枚</span>
              </div>
              <div ref={previewBoxRef} style={{ width:"100%" }}>
                <div style={{ width:"100%", height:PH, ...previewBgStyle(), overflow:"hidden", position:"relative", borderRadius:"var(--r-lg)", boxShadow:"var(--soft)" }}>
                  {showTitle && (
                    <div style={{ position:"absolute", top:vPad, left:vPad, right:vPad, height:vTS*1.5,
                      display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                      <span style={{ color:titleColor, fontSize:vTS, fontFamily:effectiveFont, fontWeight:titleWeight,
                        textTransform:titleTransform, letterSpacing:titleLetter, whiteSpace:"nowrap", overflow:"hidden",
                        textOverflow:"ellipsis", lineHeight:1.1, textAlign:"center" }}>{dispTitle}</span>
                    </div>
                  )}
                  {previewRects.map((rect) => {
                    const img = usableImages[rect.slot];
                    return (
                      <div key={rect.slot}
                        data-idx={img ? rect.slot : undefined}
                        data-scope={img ? "preview" : undefined}
                        onPointerDown={img ? onPointerDown(rect.slot) : undefined}
                        style={{ position:"absolute", left:rect.x, top:rect.y, width:rect.w, height:rect.h,
                          overflow:"hidden", borderRadius:Math.max(4, Math.min(rect.w,rect.h)*0.06),
                          background: img ? "transparent" : `${textColor}0d`,
                          cursor: img ? "grab" : "default", touchAction: img ? "none" : "auto",
                          opacity: draggingIdx===rect.slot ? 0.7 : 1,
                          outline: draggingIdx===rect.slot ? "2px solid var(--accent)" : "none",
                          display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {img && <img src={img.thumb||img.src} alt="" draggable={false} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", pointerEvents:"none" }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
              <button className="exp" onClick={exportImage} disabled={n===0 || exporting}>
                {exporting ? "EXPORTING…" : "EXPORT PNG · 1440px"}
              </button>
              <div className="save-row">
                <button className="save-btn" onClick={saveSettings}>SAVE</button>
                <button className="reset-btn" onClick={resetSettings}>RESET</button>
              </div>
              <p className="st">{saveStatus}</p>
            </div>

            {/* RIGHT */}
            <div className="col-right-wrap">
              <div className="input-area">
                {/* 1 TITLE */}
                <div className="step">
                  <div className="step-hd"><span className="step-n">01</span><span className="step-t">Title</span></div>
                  <input type="text" className="title-inp" value={titleText} onChange={e => setTitleText(e.target.value)}
                    placeholder="MY FAVORITE FILMS" disabled={!showTitle} />
                  <label className="cb"><input type="checkbox" checked={showTitle} onChange={e => setShowTitle(e.target.checked)} />画像にタイトルを表示</label>
                </div>

                {/* 2 SEARCH */}
                <div className="step">
                  <div className="step-hd"><span className="step-n">02</span><span className="step-t">Find Films</span></div>
                  <div className="lang-toggle">
                    {[["ja-JP","日本語"],["en-US","EN"]].map(([v,l]) => (
                      <button key={v} className={`lang-btn${lang===v?" on":""}`} onClick={() => setLang(v)}>{l}</button>
                    ))}
                  </div>
                  <input type="search" className="search-inp" placeholder="映画タイトルを検索…" value={query} onChange={e => setQuery(e.target.value)} autoComplete="off" />
                  {searching && <p className="searching-msg">SEARCHING…</p>}
                  {searchResults.length > 0 && (
                    <div className="results-grid">
                      {searchResults.map(m => {
                        const added = images.some(i => i.tmdbId === m.id);
                        return (
                          <div key={m.id} className={`res-card${added?" selected":""}`} onClick={() => !added && addFromSearch(m)}>
                            <img src={m.posterSmall} alt={m.title} loading="lazy" />
                            {added && <div className="res-card-check">✓</div>}
                            <div className="res-card-title">{m.title}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {!searching && query && searchResults.length===0 && <p className="searching-msg">NO RESULTS</p>}

                  {images.length > 0 && (
                    <>
                      <div className="tray-hd" style={{ marginTop:20 }}><span className="lbl">Selected</span><span className="tray-ct">{n}/{totalSlots} · ドラッグで並替</span></div>
                      <div className="tray-grid">
                        {images.map((img, i) => (
                          <div key={img.id} data-idx={i} data-scope="tray"
                            className={`tc${draggingIdx===i?" dragging":""}${i>=totalSlots?" excl":""}`} onPointerDown={onPointerDown(i)}>
                            <img src={img.thumb || img.src} alt={img.title} draggable={false} />
                            <button className="tc-rm" onClick={() => removeImage(img.id)} aria-label="削除">✕</button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="controls">
                {/* 3 FORMAT */}
                <div className="step">
                  <div className="step-hd"><span className="step-n">03</span><span className="step-t">Format</span><span className="step-hint">選ぶだけで完成</span></div>
                  <div className="fmt-row">
                    {FORMATS.map(f => (
                      <div key={f.id} className={`fmt-card${formatId===f.id?" on":""}`} onClick={() => applyFormat(f)}>
                        <div className="fmt-prev" style={{ background:f.bg }}>
                          <span className="fmt-prev-t" style={{ color:f.titleColor, fontFamily:f.titleFont, fontWeight:f.weight, textTransform:f.transform, letterSpacing:f.letter }}>Aa</span>
                        </div>
                        <div className="fmt-meta"><div className="fmt-name">{f.name}</div><div className="fmt-tag">{f.tag}</div></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4 LAYOUT */}
                <div className="step">
                  <div className="step-hd"><span className="step-n">04</span><span className="step-t">Layout</span></div>
                  <div className="mode-row" style={{ gridTemplateColumns:"1fr 1fr 1fr" }}>
                    {LAYOUT_MODES.map(m => (
                      <button key={m.id} className={`mode-card${layoutMode===m.id?" on":""}`} onClick={() => setLayoutMode(m.id)}>
                        <div className="mode-name">{m.name}</div><div className="mode-desc">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                  <p className="sect-t" style={{ marginTop:18, marginBottom:8 }}>枚数で選ぶ</p>
                  <div className="chips">
                    {COUNT_PRESETS.map(p => {
                      const on = layoutMode===p.mode && cols===p.cols && rows===p.rows;
                      return <button key={p.label} className={`chip${on?" on":""}`} onClick={() => applyCount(p)}>{p.label}</button>;
                    })}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:16 }}>
                    <SliderRow label={layoutMode==="grid"?"列":"下段の列"} value={cols} min={1} max={8} step={1} onChange={setCols} />
                    <SliderRow label={layoutMode==="grid"?"行":"下段の行"} value={rows} min={1} max={8} step={1} onChange={setRows} />
                  </div>
                  <p className="hint" style={{ marginTop:8 }}>
                    {layoutMode==="best3" ? `大3枚 + 小${cols*rows}枚 = 計${totalSlots}枚`
                      : layoutMode==="top1" ? `大1枚 + 小${cols*rows}枚 = 計${totalSlots}枚`
                      : `最大 ${totalSlots} 枚`}
                  </p>
                </div>

                {/* DETAIL */}
                <div className="acc">
                  <button className="acc-hd" onClick={() => setShowDetail(v => !v)}>
                    <span>DETAILS — 色・比率・余白・文字</span>
                    <span className={`acc-arrow${showDetail?" open":""}`}>▼</span>
                  </button>
                  {showDetail && (
                    <div className="acc-body">
                      <div>
                        <p className="sect-t">Colors</p>
                        <div className="pal-row">
                          {PALETTES.map(p => {
                            const on = bgColor===p.bg && textColor===p.tx;
                            return (
                              <div key={p.id} className={`pal${on?" on":""}`}
                                onClick={() => { setBgColor(p.bg); setTextColor(p.tx); setTitleColor(p.title); }}
                                title={p.id}>
                                <div className="pal-bg" style={{ background:p.bg }}>
                                  <span className="pal-aa" style={{ color:p.title }}>Aa</span>
                                </div>
                                <div className="pal-strip">
                                  <span style={{ background:p.tx }} />
                                  <span style={{ background:p.title }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                          <ColorInput label="背景" value={bgColor} onChange={setBgColor} />
                          {(bgType === "gradient" || bgType === "mesh" || bgType === "film") && (
                            <ColorInput label="背景2" value={bg2Color} onChange={setBg2Color} />
                          )}
                          {(bgType === "gradient" || bgType === "mesh" || bgType === "film") && (
                            <ColorInput label="背景3" value={bg3Color} onChange={setBg3Color} />
                          )}
                          <ColorInput label="下地" value={textColor} onChange={setTextColor} />
                          <ColorInput label="文字" value={titleColor} onChange={setTitleColor} />
                        </div>
                        <p className="sect-t" style={{ marginTop:20, paddingTop:20, borderTop:"var(--bd)" }}>Texture</p>
                        <div className="chips">
                          {[["solid","単色"],["gradient","グラデ"],["mesh","メッシュ"],["film","フィルム"],["noise","ノイズ"]].map(([v,l]) => (
                            <button key={v} className={`chip${bgType===v?" on":""}`} onClick={() => setBgType(v)}>{l}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="sect-t">Ratio {autoRatio && <span style={{ color:"var(--accent)", fontSize:10 }}>· AUTO</span>}</p>
                        <div className="chips">
                          <button className={`chip${autoRatio?" on":""}`} onClick={() => setAutoRatio(true)}>AUTO</button>
                          {RATIOS.map(r => <button key={r.id} className={`chip${(!autoRatio && ratio.id===r.id)?" on":""}`} onClick={() => { setAutoRatio(false); setRatio(r); }}>{r.label}</button>)}
                        </div>
                        {autoRatio && <p className="hint" style={{ marginTop:8 }}>グリッド数に合わせて自動調整中（現在 {ratio.label}）</p>}
                      </div>
                      <div>
                        <p className="sect-t">Spacing</p>
                        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                          <SliderRow label="隙間" value={gap} min={0} max={24} step={1} onChange={setGap} unit="px" />
                          <SliderRow label="余白" value={padding} min={0} max={64} step={1} onChange={setPadding} unit="px" />
                        </div>
                      </div>
                      {showTitle && (
                        <div>
                          <p className="sect-t">Title Type</p>
                          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                            <SliderRow label="サイズ" value={titleSize} min={10} max={72} step={1} onChange={setTitleSize} unit="px" />
                            <SliderRow label="ウェイト" value={titleWeight} min={300} max={700} step={100} onChange={setTitleWeight} />
                          </div>
                          <p className="sect-t" style={{ marginTop:20, paddingTop:20, borderTop:"var(--bd)", marginBottom:8 }}>日本語書体</p>
                          <div className="chips">
                            <button className={`chip${!jpSerif?" on":""}`} onClick={() => setJpSerif(false)} style={{ fontFamily:"'Noto Sans JP', sans-serif" }}>ゴシック体</button>
                            <button className={`chip${jpSerif?" on":""}`} onClick={() => setJpSerif(true)} style={{ fontFamily:"'Noto Serif JP', serif" }}>明朝体</button>
                          </div>
                          <p className="hint" style={{ marginTop:8 }}>{wLabel[titleWeight]} · {jpSerif?"明朝 (Serif)":"ゴシック (Sans)"}</p>
                        </div>
                      )}
                      <div>
                        <p className="sect-t">Upload</p>
                        <div className={`drop${dropOver?" over":""}`}
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={e => { e.preventDefault(); setDropOver(true); }}
                          onDragLeave={() => setDropOver(false)}
                          onDrop={e => { e.preventDefault(); setDropOver(false); handleFiles(e.dataTransfer.files); }}
                          style={{ marginBottom:0 }}>
                          <p className="drop-main">↓ 自分の画像をドロップ / タップ</p>
                          <p className="drop-sub">JPG · PNG · WEBP</p>
                          <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display:"none" }} onChange={e => handleFiles(e.target.files)} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
