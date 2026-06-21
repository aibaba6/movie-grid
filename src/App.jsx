import { useState, useRef, useCallback, useEffect } from "react";

const RATIOS = [
  { id: "3:4",  label: "3:4",  w: 3, h: 4  },
  { id: "4:5",  label: "4:5",  w: 4, h: 5  },
  { id: "1:1",  label: "1:1",  w: 1, h: 1  },
  { id: "16:9", label: "16:9", w: 16, h: 9 },
];

const PRESETS = [
  { bg:"#0a0a0a", tx:"#ffffff", name:"Black" },
  { bg:"#fafffa", tx:"#121613", name:"Linen" },
  { bg:"#121613", tx:"#fafffa", name:"Ink"   },
  { bg:"#2bee4b", tx:"#121613", name:"Volt"  },
  { bg:"#1a1a2e", tx:"#e8eaf6", name:"Night" },
  { bg:"#2c1810", tx:"#f5dcc8", name:"Warm"  },
];

const STORAGE_KEY = "movie-grid-v2";
const PW = 260;

const DEFAULT = {
  cols:3, rows:3, ratioId:"3:4",
  gap:3, padding:8,
  bgColor:"#0a0a0a", textColor:"#ffffff",
  showTitle:true, titleText:"2025年6月 鑑賞記録",
  titleSize:18, titleWeight:300, titleColor:"#ffffff",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --sage:#516254;--mist:#c8d2c8;--volt:#2bee4b;
    --sh1:rgba(16,94,29,0.45) 1px 8px 20px 0px;
    --sh2:rgba(18,146,39,0.25) 1px 8px 20px 0px;
    --fu:'Noto Sans JP',ui-sans-serif,system-ui,sans-serif;
    --bg:#fafffa;--ink:#121613;
  }
  body{font-family:var(--fu);background:var(--bg);}
  .nav{display:flex;align-items:center;justify-content:space-between;
    padding:0 28px;height:50px;border-bottom:0.5px solid var(--mist);
    background:var(--bg);position:sticky;top:0;z-index:10;}
  .wm{font-size:14px;font-weight:500;}
  .wm b{color:var(--ink);}
  .wm em{color:var(--volt);font-style:normal;}
  .visitor{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--sage);letter-spacing:0.06em;}
  .visitor-num{font-size:13px;font-weight:500;color:var(--ink);}
  .page{padding:32px 28px 80px;}
  .tick{display:block;width:40px;height:2px;background:var(--volt);margin-bottom:12px;}
  .hl{font-weight:300;font-size:48px;line-height:1.0;letter-spacing:-1px;color:var(--ink);}
  .hl em{color:var(--volt);font-style:normal;}
  .sub{font-size:12px;color:var(--sage);margin-top:8px;line-height:1.5;}
  .drop-area{border:1px dashed var(--mist);border-radius:14px;padding:28px 20px;
    text-align:center;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px;
    transition:border-color .2s,background .2s;margin:24px 0 28px;}
  .drop-area:hover,.drop-area.over{border-color:var(--ink);background:rgba(18,22,19,0.02);}
  .drop-icon{width:38px;height:38px;border:1px solid var(--mist);border-radius:50%;
    display:flex;align-items:center;justify-content:center;color:var(--sage);font-size:16px;}
  .drop-main{font-size:13px;color:var(--ink);}
  .drop-sub{font-size:11px;color:var(--mist);letter-spacing:0.06em;text-transform:uppercase;}
  .lbl{font-size:11px;color:var(--sage);letter-spacing:0.1em;text-transform:uppercase;}
  .tray-hd{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:8px;}
  .tray-ct{font-size:11px;color:var(--mist);}
  .tray-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(60px,1fr));gap:6px;margin-bottom:36px;}
  .tc{position:relative;aspect-ratio:2/3;border-radius:7px;overflow:hidden;
    border:0.5px solid var(--mist);cursor:grab;transition:border-color .15s,transform .12s;user-select:none;}
  .tc:hover{transform:translateY(-2px);border-color:var(--sage);}
  .tc.dt{border-color:var(--volt);border-width:1.5px;}
  .tc.excl{opacity:0.2;}
  .tc img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;}
  .tc-rm{position:absolute;top:3px;right:3px;width:16px;height:16px;border-radius:50%;
    background:rgba(18,22,19,0.82);color:#fff;font-size:8px;border:none;cursor:pointer;
    display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .15s;}
  .tc:hover .tc-rm{opacity:1;}
  .tc-name{position:absolute;bottom:0;left:0;right:0;
    background:linear-gradient(transparent,rgba(18,22,19,0.72));
    color:#fff;font-size:7px;padding:10px 4px 3px;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;}
  .bottom{display:flex;gap:32px;align-items:start;}
  .settings{flex:1;display:flex;flex-direction:column;gap:18px;min-width:0;}
  .sect-title{font-size:11px;color:var(--sage);letter-spacing:0.1em;text-transform:uppercase;
    margin-bottom:10px;padding-bottom:7px;border-bottom:0.5px solid var(--mist);}
  .sl{display:flex;flex-direction:column;gap:4px;}
  .sl-row{display:flex;justify-content:space-between;align-items:center;}
  .sl-lbl{font-size:12px;color:var(--sage);}
  .sl-val{font-size:13px;color:var(--ink);font-weight:500;min-width:32px;text-align:right;}
  input[type=range]{width:100%;accent-color:var(--ink);cursor:pointer;margin-top:1px;}
  .ci{display:flex;align-items:center;gap:8px;}
  .ci-lbl{font-size:12px;color:var(--sage);width:26px;flex-shrink:0;}
  .swatch{width:24px;height:24px;border-radius:4px;border:0.5px solid var(--mist);
    position:relative;overflow:hidden;flex-shrink:0;cursor:pointer;}
  .swatch input[type=color]{position:absolute;inset:-4px;width:calc(100% + 8px);height:calc(100% + 8px);
    opacity:0;cursor:pointer;border:none;}
  .hex-inp{font-size:12px;color:var(--ink);font-family:var(--fu);
    background:transparent;border:none;border-bottom:0.5px solid var(--mist);
    width:76px;outline:none;padding:2px 0;}
  .hex-inp:focus{border-color:var(--ink);}
  .presets{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px;}
  .preset-dot{width:20px;height:20px;border-radius:4px;cursor:pointer;
    border:0.5px solid rgba(0,0,0,0.1);flex-shrink:0;transition:transform .12s;}
  .preset-dot:hover{transform:scale(1.15);}
  .chips{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px;}
  .chip{font-size:11px;font-family:var(--fu);padding:3px 9px;border-radius:4px;
    border:0.5px solid var(--mist);background:transparent;color:var(--ink);
    cursor:pointer;transition:all .15s;}
  .chip.on{background:var(--ink);color:var(--bg);border-color:var(--ink);}
  .chip:hover:not(.on){border-color:var(--ink);}
  .cb{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--ink);
    letter-spacing:0.05em;text-transform:uppercase;cursor:pointer;}
  input[type=checkbox]{accent-color:var(--ink);}
  .title-inp{width:100%;background:transparent;border:none;border-bottom:1px solid var(--mist);
    font-size:13px;font-family:var(--fu);font-weight:300;color:var(--ink);
    padding:5px 0;outline:none;margin-top:7px;transition:border-color .2s;}
  .title-inp:focus{border-color:var(--ink);}
  .preview-col{flex-shrink:0;display:flex;flex-direction:column;gap:12px;position:sticky;top:66px;}
  .prev-hd{display:flex;justify-content:space-between;align-items:baseline;}
  .prev-ct{font-size:11px;color:var(--mist);}
  .exp{width:100%;padding:12px 0;border-radius:9px;border:none;
    background:var(--volt);color:var(--ink);font-size:13px;font-weight:500;
    font-family:var(--fu);cursor:pointer;
    box-shadow:var(--sh1),var(--sh2);transition:opacity .15s,transform .1s;}
  .exp:hover{opacity:.88;transform:translateY(-1px);}
  .exp:disabled{background:var(--mist);color:var(--sage);box-shadow:none;cursor:default;transform:none;opacity:1;}
  .exp.loading{opacity:.6;cursor:wait;}
  .save-row{display:flex;gap:7px;}
  .save-btn{flex:1;padding:8px 0;border-radius:7px;border:0.5px solid var(--mist);
    background:transparent;color:var(--ink);font-size:11px;font-family:var(--fu);cursor:pointer;}
  .reset-btn{padding:8px 12px;border-radius:7px;border:0.5px solid var(--mist);
    background:transparent;color:var(--sage);font-size:11px;font-family:var(--fu);cursor:pointer;}
  .st{font-size:11px;color:var(--volt);text-align:center;min-height:14px;}
  .hint{font-size:11px;color:var(--mist);line-height:1.65;}
`;

function SliderRow({ label, value, min, max, step, onChange, unit = "" }) {
  return (
    <div className="sl">
      <div className="sl-row">
        <span className="sl-lbl">{label}</span>
        <span className="sl-val">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)} />
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
        onChange={e => {
          const v = e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value;
          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
        }}
        onBlur={e => { if (!/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(value); }}
        maxLength={7} spellCheck={false} />
    </div>
  );
}

export default function App() {
  const [images, setImages]           = useState([]);
  const [cols, setCols]               = useState(DEFAULT.cols);
  const [rows, setRows]               = useState(DEFAULT.rows);
  const [ratio, setRatio]             = useState(RATIOS[0]);
  const [gap, setGap]                 = useState(DEFAULT.gap);
  const [padding, setPadding]         = useState(DEFAULT.padding);
  const [bgColor, setBgColor]         = useState(DEFAULT.bgColor);
  const [textColor, setTextColor]     = useState(DEFAULT.textColor);
  const [showTitle, setShowTitle]     = useState(DEFAULT.showTitle);
  const [titleText, setTitleText]     = useState(DEFAULT.titleText);
  const [titleSize, setTitleSize]     = useState(DEFAULT.titleSize);
  const [titleWeight, setTitleWeight] = useState(DEFAULT.titleWeight);
  const [titleColor, setTitleColor]   = useState(DEFAULT.titleColor);
  const [dropOver, setDropOver]       = useState(false);
  const [dragging, setDragging]       = useState(null);
  const [dragTarget, setDragTarget]   = useState(null);
  const [saveStatus, setSaveStatus]   = useState("");
  const [exporting, setExporting]     = useState(false);
  const [visitors, setVisitors]       = useState(null);

  const fileInputRef = useRef(null);

  const maxSlots      = cols * rows;
  const visibleImages = images.slice(0, maxSlots);
  const n             = visibleImages.length;

  // 訪問者カウンター（ページ読み込み時に一度だけ）
  useEffect(() => {
    fetch("/api/visitors", { method: "POST" })
      .then(r => r.json())
      .then(d => setVisitors(d.count))
      .catch(() => setVisitors(null));
  }, []);

  // 設定をlocalStorageから復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const s = JSON.parse(saved);
      if (s.cols)          setCols(s.cols);
      if (s.rows)          setRows(s.rows);
      if (s.ratioId)       setRatio(RATIOS.find(r => r.id === s.ratioId) || RATIOS[0]);
      if (s.gap        != null) setGap(s.gap);
      if (s.padding    != null) setPadding(s.padding);
      if (s.bgColor)       setBgColor(s.bgColor);
      if (s.textColor)     setTextColor(s.textColor);
      if (s.showTitle  != null) setShowTitle(s.showTitle);
      if (s.titleText)     setTitleText(s.titleText);
      if (s.titleSize  != null) setTitleSize(s.titleSize);
      if (s.titleWeight!= null) setTitleWeight(s.titleWeight);
      if (s.titleColor)    setTitleColor(s.titleColor);
    } catch (_) {}
  }, []);

  const showSt = msg => { setSaveStatus(msg); setTimeout(() => setSaveStatus(""), 2200); };

  const saveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        cols, rows, ratioId: ratio.id, gap, padding,
        bgColor, textColor, showTitle, titleText,
        titleSize, titleWeight, titleColor,
      }));
      showSt("saved");
    } catch (_) { showSt("error"); }
  };

  const resetSettings = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    const d = DEFAULT;
    setCols(d.cols); setRows(d.rows); setRatio(RATIOS[0]);
    setGap(d.gap); setPadding(d.padding);
    setBgColor(d.bgColor); setTextColor(d.textColor);
    setShowTitle(d.showTitle); setTitleText(d.titleText);
    setTitleSize(d.titleSize); setTitleWeight(d.titleWeight);
    setTitleColor(d.titleColor);
    showSt("reset");
  };

  const handleFiles = useCallback((files) => {
    Array.from(files).filter(f => f.type.startsWith("image/")).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => setImages(prev => [...prev, {
        id: Date.now() + Math.random(), src: e.target.result,
        title: file.name.replace(/\.[^.]+$/, "").replace(/[-_.]/g, " "),
      }]);
      reader.readAsDataURL(file);
    });
  }, []);

  const onFileDrop = useCallback(e => {
    e.preventDefault(); setDropOver(false); handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeImage = id => setImages(prev => prev.filter(i => i.id !== id));
  const moveImage = (from, to) => setImages(prev => {
    const a = [...prev]; const [x] = a.splice(from, 1); a.splice(to, 0, x); return a;
  });

  const exportImage = async () => {
    if (n === 0 || exporting) return;
    setExporting(true);
    try {
      const OUT = 1440;
      const cW  = OUT;
      const cH  = Math.round(OUT * ratio.h / ratio.w);
      const cv  = document.createElement("canvas");
      cv.width  = cW; cv.height = cH;
      const ctx = cv.getContext("2d");
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, cW, cH);

      const SC       = cW / 400;
      const pad      = padding * SC;
      const g        = gap * SC;
      const useCols  = Math.min(cols, n);
      const availW   = cW - pad * 2;
      const cellW    = (availW - g * (useCols - 1)) / useCols;
      const cellH    = cellW * 3 / 2;
      const usedW    = cellW * useCols + g * (useCols - 1);
      const tFS      = titleSize * SC;
      const titleGap = tFS * 0.8 + g;
      const tH       = showTitle ? tFS * 1.4 + titleGap : 0;
      const gLeft    = pad + (availW - usedW) / 2;
      const gTop     = pad + tH;

      if (showTitle) {
        // フォントをcanvasに認識させる
        await new Promise(resolve => {
          const probe = document.createElement("div");
          probe.style.cssText = [
            "position:fixed","top:-999px","left:-999px",
            "visibility:hidden","pointer-events:none",
            `font-family:'Noto Sans JP',sans-serif`,
            `font-weight:${titleWeight}`,
            "font-size:32px",
          ].join(";");
          probe.textContent = titleText || "あ";
          document.body.appendChild(probe);
          document.fonts.ready.then(() => {
            document.body.removeChild(probe);
            resolve();
          });
        });
        ctx.fillStyle    = titleColor;
        ctx.font         = `${titleWeight} ${Math.round(tFS)}px 'Noto Sans JP', sans-serif`;
        ctx.textAlign    = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(titleText, cW / 2, pad + tFS * 1.1, availW);
      }

      for (let i = 0; i < visibleImages.length; i++) {
        const img = visibleImages[i];
        const ci  = i % useCols;
        const ri  = Math.floor(i / useCols);
        const x   = gLeft + ci * (cellW + g);
        const y   = gTop  + ri * (cellH + g);
        await new Promise(resolve => {
          const el  = new Image();
          el.onload = () => {
            const s  = Math.max(cellW / el.width, cellH / el.height);
            const dw = el.width * s, dh = el.height * s;
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y, cellW, cellH, 10);
            ctx.clip();
            ctx.drawImage(el, x + (cellW - dw) / 2, y + (cellH - dh) / 2, dw, dh);
            ctx.restore();
            resolve();
          };
          el.onerror = () => resolve();
          el.src = img.src;
        });
      }

      const dataURL = cv.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataURL;
      a.download = `movie-grid-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert("書き出しに失敗しました: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  // プレビュー計算
  const PH    = Math.round(PW * ratio.h / ratio.w);
  const pCols = n > 0 ? Math.min(cols, n) : cols;
  const pRows = n > 0 ? Math.ceil(n / pCols) : rows;
  const vPad  = padding * (PW / 400);
  const vGap  = gap     * (PW / 400);
  const vTS   = titleSize * (PW / 400);
  const vTG   = vTS * 0.8 + vGap;
  const vAW   = PW - vPad * 2;
  const vCW   = (vAW - vGap * (pCols - 1)) / pCols;
  const vCH   = vCW * 3 / 2;

  const wLabel = { 100:"Thin",200:"ExtraLight",300:"Light",400:"Regular",500:"Medium",600:"SemiBold",700:"Bold" };

  return (
    <>
      <style>{css}</style>

      <nav className="nav">
        <div className="wm"><b>MOVIE</b><em>GRID</em></div>
        {visitors !== null && (
          <div className="visitor">
            <span>訪問者</span>
            <span className="visitor-num">{visitors.toLocaleString()}</span>
          </div>
        )}
      </nav>

      <div className="page">
        <div style={{ marginBottom:4 }}>
          <span className="tick" />
          <h1 className="hl">映画を<em>並べる。</em></h1>
          <p className="sub">ポスターをドロップしてグリッドを組む。トレイ上でドラッグして順番を変える。</p>
        </div>

        <div className={`drop-area${dropOver ? " over" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDropOver(true); }}
          onDragLeave={() => setDropOver(false)}
          onDrop={onFileDrop}>
          <div className="drop-icon">↓</div>
          <p className="drop-main">ポスター画像をここにドロップ</p>
          <p className="drop-sub">JPG · PNG · WEBP · 複数同時OK</p>
          <input ref={fileInputRef} type="file" multiple accept="image/*"
            style={{ display:"none" }} onChange={e => handleFiles(e.target.files)} />
        </div>

        {images.length > 0 && (
          <>
            <div className="tray-hd">
              <span className="lbl">追加済み</span>
              <span className="tray-ct">{n}/{maxSlots} 使用{images.length > maxSlots && ` · ${images.length - maxSlots}枚除外`}</span>
            </div>
            <div className="tray-grid">
              {images.map((img, i) => (
                <div key={img.id}
                  className={`tc${dragTarget===i?" dt":""}${i>=maxSlots?" excl":""}`}
                  draggable
                  onDragStart={e => { e.dataTransfer.effectAllowed="move"; setDragging(i); }}
                  onDragOver={e => { e.preventDefault(); setDragTarget(i); }}
                  onDragEnd={() => { setDragging(null); setDragTarget(null); }}
                  onDrop={e => {
                    e.preventDefault();
                    if (dragging !== null && dragging !== i) moveImage(dragging, i);
                    setDragging(null); setDragTarget(null);
                  }}>
                  <img src={img.src} alt={img.title} />
                  <button className="tc-rm" onClick={() => removeImage(img.id)} aria-label="削除">✕</button>
                  <span className="tc-name">{img.title}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="bottom">
          <div className="settings">

            <div>
              <p className="sect-title">グリッド</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <SliderRow label="列" value={cols} min={1} max={8} step={1} onChange={setCols} />
                <SliderRow label="行" value={rows} min={1} max={8} step={1} onChange={setRows} />
              </div>
              <p style={{ fontSize:11, color:"var(--mist)", marginTop:7 }}>最大 {maxSlots} 枚</p>
            </div>

            <div>
              <p className="sect-title">テーマカラー</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:2 }}>
                <ColorInput label="背景" value={bgColor}   onChange={setBgColor}   />
                <ColorInput label="文字" value={textColor} onChange={setTextColor} />
              </div>
              <div className="presets">
                {PRESETS.map(p => (
                  <button key={p.name} className="preset-dot"
                    onClick={() => { setBgColor(p.bg); setTextColor(p.tx); }}
                    style={{ background:p.bg, boxShadow: bgColor===p.bg ? `0 0 0 2px ${p.tx}` : "none" }}
                    title={p.name} />
                ))}
              </div>
            </div>

            <div>
              <p className="sect-title">出力比率</p>
              <div className="chips">
                {RATIOS.map(r => (
                  <button key={r.id} className={`chip${ratio.id===r.id?" on":""}`}
                    onClick={() => setRatio(r)}>{r.label}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="sect-title">間隔・余白</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <SliderRow label="隙間" value={gap}     min={0} max={20} step={1} onChange={setGap}     unit="px" />
                <SliderRow label="余白" value={padding} min={0} max={40} step={1} onChange={setPadding} unit="px" />
              </div>
            </div>

            <div>
              <p className="sect-title">タイトル</p>
              <label className="cb">
                <input type="checkbox" checked={showTitle} onChange={e => setShowTitle(e.target.checked)} />
                表示する
              </label>
              {showTitle && (
                <>
                  <input type="text" className="title-inp" value={titleText}
                    onChange={e => setTitleText(e.target.value)} placeholder="2025年6月 鑑賞記録" />
                  <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:12 }}>
                    <SliderRow label="サイズ"   value={titleSize}   min={8}   max={48}  step={1}   onChange={setTitleSize}   unit="px" />
                    <SliderRow label="ウェイト" value={titleWeight} min={100} max={700} step={100} onChange={setTitleWeight} />
                    <ColorInput label="色" value={titleColor} onChange={setTitleColor} />
                  </div>
                  <p style={{ fontSize:11, color:"var(--mist)", marginTop:5 }}>{wLabel[titleWeight]}</p>
                </>
              )}
            </div>

          </div>

          <div className="preview-col">
            <div className="prev-hd">
              <span className="lbl">プレビュー</span>
              <span className="prev-ct">{n} 枚</span>
            </div>

            <div style={{
              width: PW, height: PH,
              background: bgColor,
              borderRadius: 10,
              border: "0.5px solid #c8d2c8",
              overflow: "hidden",
              flexShrink: 0,
              position: "relative",
            }}>
              <div style={{
                position:"absolute", inset:0,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                  {showTitle && (
                    <div style={{ marginBottom:vTG, width:vAW, textAlign:"center", overflow:"hidden" }}>
                      <span style={{
                        display:"block", color:titleColor, fontSize:vTS,
                        fontFamily:"'Noto Sans JP', sans-serif",
                        fontWeight:titleWeight, whiteSpace:"nowrap",
                        overflow:"hidden", textOverflow:"ellipsis", lineHeight:1.4,
                      }}>{titleText}</span>
                    </div>
                  )}
                  <div style={{ display:"flex", flexDirection:"column", gap:vGap }}>
                    {Array.from({ length: pRows }, (_, ri) => (
                      <div key={ri} style={{ display:"flex", gap:vGap }}>
                        {Array.from({ length: pCols }, (_, ci) => {
                          const img = visibleImages[ri * pCols + ci];
                          return (
                            <div key={ci} style={{
                              width:vCW, height:vCH, borderRadius:3,
                              overflow:"hidden", flexShrink:0,
                              background: img ? "transparent" : `${textColor}18`,
                            }}>
                              {img && <img src={img.src} alt=""
                                style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button className={`exp${exporting ? " loading" : ""}`}
              onClick={exportImage} disabled={n === 0 || exporting}>
              {exporting ? "書き出し中…" : "PNG書き出し (1440px) →"}
            </button>

            <div className="save-row">
              <button className="save-btn" onClick={saveSettings}>↓ 設定を保存</button>
              <button className="reset-btn" onClick={resetSettings}>リセット</button>
            </div>

            <p className="st">
              {saveStatus === "saved" && "✓ 設定を保存しました"}
              {saveStatus === "reset" && "✓ デフォルトに戻しました"}
              {saveStatus === "error" && "保存に失敗しました"}
            </p>

            <p className="hint">
              セル比率はポスター標準の 2:3 固定。<br />
              出力 1440px · Noto Sans JP
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
