import React, { useState, useEffect } from 'react';
import { Plus, X, Clock, Trash2 } from 'lucide-react';

// ── FDI tooth numbering (ISO standard used in Italy) ──────────────────────
// Upper: right→center: 18-11, center→left: 21-28
// Lower: left←center: 48-41, center→right: 31-38
const UPPER_NUMS = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const LOWER_NUMS = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

const SURFACES = [
  { code:'V', label:'Vestibolare' },
  { code:'L', label:'Linguale/Palatale' },
  { code:'M', label:'Mesiale' },
  { code:'D', label:'Distale' },
  { code:'O', label:'Occlusale' },
];

const TREATMENT_TYPES = [
  { id:'caries',     label:'Carie',           color:'#ef4444', icon:'🔴' },
  { id:'filling',    label:'Otturazione',      color:'#3b82f6', icon:'🔵' },
  { id:'crown',      label:'Corona',           color:'#f59e0b', icon:'👑' },
  { id:'implant',    label:'Impianto',         color:'#8b5cf6', icon:'🔩' },
  { id:'extraction', label:'Estrazione',       color:'#374151', icon:'❌' },
  { id:'rct',        label:'Devitalizzazione', color:'#dc2626', icon:'⚕️' },
  { id:'bridge',     label:'Ponte',            color:'#d97706', icon:'🌉' },
  { id:'veneer',     label:'Faccetta',         color:'#ec4899', icon:'✨' },
];

const STATUS_COLORS = Object.fromEntries(TREATMENT_TYPES.map(t => [t.id, t.color]));

function getToothName(num) {
  const n = num % 10;
  if (n <= 2) return 'Incisivo';
  if (n === 3) return 'Canino';
  if (n <= 5) return 'Premolare';
  return 'Molare';
}

// ── Arch builder ────────────────────────────────────────────────────────────
// VW=420, VH=280 — generous padding so end teeth never clip
function buildArch(nums, isUpper, W, H) {
  const cx   = W / 2;
  const rx   = W * 0.38;           // horizontal radius
  const ry   = H * 0.68;           // vertical radius
  // Leave 40px top/bottom padding for tooth bodies + labels
  const baseY = isUpper ? H - 40 : 40;
  const sign  = isUpper ? -1 : 1;
  const n = nums.length - 1;

  return nums.map((num, i) => {
    const t  = Math.PI - (i / n) * Math.PI;
    const x  = cx + rx * Math.cos(t);
    const y  = baseY + sign * ry * Math.sin(t);
    
    // Normal to the ellipse points outward. We want local -Y to point outward.
    const vx = -rx * Math.cos(t);
    const vy = -sign * ry * Math.sin(t);
    const angle = (Math.atan2(vy, vx) * 180) / Math.PI - 90;
    
    return { num, x, y, angle };
  });
}

// ── SVG Tooth ────────────────────────────────────────────────────────────────
const TW = 22, TH = 28; // tooth size in SVG units

function SvgTooth({ tooth, isActive, toothData, onClick }) {
  const { x, y, angle, num } = tooth;
  const surfaceEntries = toothData?.surfaces || {};
  const mainTx = Object.values(surfaceEntries)[0] || null;
  const isFront = [11,12,13,21,22,23,31,32,33,41,42,43].includes(num);

  // Label outward direction: local -Y is already pointing outward radially.
  const labelOffset = TH / 2 + 14;

  // Clinically accurate Mesial/Distal placement:
  // Mesial is towards the midline. 
  // Q1 (10s) and Q3 (30s) have Mesial on local +X (Right).
  // Q2 (20s) and Q4 (40s) have Mesial on local -X (Left).
  const quadrant = Math.floor(num / 10);
  const isMesialRight = (quadrant === 1 || quadrant === 3);
  const mX = isMesialRight ? (TW/2 - 10) : (-TW/2 + 1);
  const dX = isMesialRight ? (-TW/2 + 1) : (TW/2 - 10);

  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`} onClick={onClick} style={{ cursor:'pointer' }}>
      {/* Tooth body */}
      <rect x={-TW/2} y={-TH/2} width={TW} height={TH} rx={isFront ? 8 : 5}
        fill={mainTx ? STATUS_COLORS[mainTx] : 'url(#tGrad)'}
        fillOpacity={mainTx ? 0.28 : 1}
        stroke={isActive ? '#14b8a6' : (mainTx ? STATUS_COLORS[mainTx] : '#cbd5e1')}
        strokeWidth={isActive ? 2.8 : 1}
        filter="url(#tShadow)"
      />
      {/* Active ring */}
      {isActive && (
        <rect x={-TW/2-2} y={-TH/2-2} width={TW+4} height={TH+4} rx={isFront ? 10 : 7}
          fill="none" stroke="#14b8a6" strokeWidth={2} strokeOpacity={0.5} strokeDasharray="3 2" />
      )}

      {/* Surfaces mini-map inside the tooth! */}
      {/* V - Vestibular (top, pointing outward radially) */}
      <rect x={-4} y={-TH/2+2} width={8} height={5} rx={2}
        fill={surfaceEntries['V'] ? STATUS_COLORS[surfaceEntries['V']] : '#f8fafc'}
        stroke={surfaceEntries['V'] ? '#ffffff' : '#cbd5e1'} strokeWidth={0.5} />
      {/* L - Lingual (bottom, pointing inward) */}
      <rect x={-4} y={TH/2-7} width={8} height={5} rx={2}
        fill={surfaceEntries['L'] ? STATUS_COLORS[surfaceEntries['L']] : '#f8fafc'}
        stroke={surfaceEntries['L'] ? '#ffffff' : '#cbd5e1'} strokeWidth={0.5} />
      {/* M - Mesial (towards midline) */}
      <rect x={mX} y={-4} width={5} height={8} rx={2}
        fill={surfaceEntries['M'] ? STATUS_COLORS[surfaceEntries['M']] : '#f8fafc'}
        stroke={surfaceEntries['M'] ? '#ffffff' : '#cbd5e1'} strokeWidth={0.5} />
      {/* D - Distal (away from midline) */}
      <rect x={dX} y={-4} width={5} height={8} rx={2}
        fill={surfaceEntries['D'] ? STATUS_COLORS[surfaceEntries['D']] : '#f8fafc'}
        stroke={surfaceEntries['D'] ? '#ffffff' : '#cbd5e1'} strokeWidth={0.5} />
      {/* O - Occlusal (center) */}
      <circle cx={0} cy={0} r={3.5}
        fill={surfaceEntries['O'] ? STATUS_COLORS[surfaceEntries['O']] : '#f8fafc'}
        stroke={surfaceEntries['O'] ? '#ffffff' : '#cbd5e1'} strokeWidth={0.5} />

      {/* Number label — translates along outward axis, then counter-rotates to stay upright */}
      <g transform={`translate(0, ${-labelOffset}) rotate(${-angle})`}>
        <rect x={-11} y={-7} width={22} height={14} rx={4}
          fill="white" fillOpacity={0.95}
          stroke={isActive ? '#14b8a6' : '#dde6f0'} strokeWidth={1} />
        <text textAnchor="middle" y={3}
          fontSize={8.5} fontWeight="900"
          fill={isActive ? '#0d9488' : '#64748b'}>
          {num}
        </text>
      </g>
    </g>
  );
}

// ── Smooth scrollbar style ──────────────────────────────────────────────────
const scrollStyle = {
  scrollbarWidth: 'thin',
  scrollbarColor: '#e2e8f0 transparent',
};

// ── Main ────────────────────────────────────────────────────────────────────
const VW = 420, VH = 280;  // generous padding so all teeth + labels fit

export default function HybridOdontogram({ data, onChange }) {
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [toothData,     setToothData]     = useState(data || {});
  const [activeTab,     setActiveTab]     = useState('Dentale');
  const [detailTab,     setDetailTab]     = useState('stato'); // 'stato' | 'storico'

  // Update internal state if props change (e.g. on patient load)
  useEffect(() => {
    if (data) setToothData(data);
  }, [data]);

  // Form
  const [fSurface,   setFSurface]   = useState('O');
  const [fTreatment, setFTreatment] = useState('filling');
  const [fNote,      setFNote]      = useState('');
  const [fDate,      setFDate]      = useState(new Date().toISOString().split('T')[0]);

  const tabs = ['Dentale', 'Ortodont.', 'Parodontale', 'Gnatolog.'];
  const upperArch = buildArch(UPPER_NUMS, true,  VW, VH);
  const lowerArch = buildArch(LOWER_NUMS, false, VW, VH);

  const current = selectedTooth
    ? (toothData[selectedTooth] || { surfaces:{}, history:[] })
    : null;

  const addRecord = () => {
    if (!selectedTooth) return;
    const newData = { ...toothData };
    const ex = newData[selectedTooth] || { surfaces:{}, history:[] };
    
    newData[selectedTooth] = {
      surfaces: { ...ex.surfaces, [fSurface]: fTreatment },
      history: [{ date:fDate, surface:fSurface, treatment:fTreatment, note:fNote }, ...(ex.history||[])],
    };

    setToothData(newData);
    if (onChange) onChange(newData);
    
    setFNote('');
    setDetailTab('storico');
  };

  const removeRecord = (idx) => {
    const newData = { ...toothData };
    const ex = newData[selectedTooth];
    newData[selectedTooth] = { ...ex, history: ex.history.filter((_,i)=>i!==idx) };
    
    setToothData(newData);
    if (onChange) onChange(newData);
  };

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">

      {/* Odontogram type tabs */}
      <div className="flex shrink-0 border-b border-gray-200 bg-gray-50/80 px-4">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-5 py-3 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-colors ${
              activeTab === t ? 'border-dental-500 text-dental-700 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}>{t}
          </button>
        ))}
      </div>

      {/* Body */}
      {activeTab === 'Dentale' ? (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* ... existing odontogram code ... */}
          {/* Note: I'm keeping the original code structure but wrapping it in the condition */}
          <div className="flex-[3] flex flex-col min-h-0 border-r border-gray-100 overflow-hidden">
            {!selectedTooth ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-3">🦷</div>
                  <p className="text-sm font-semibold text-gray-400">Seleziona un dente dall'odontogramma</p>
                  <p className="text-xs text-gray-300 mt-1">Clicca su qualsiasi dente per vedere e registrare i dati clinici</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white shrink-0">
                  <div className="w-11 h-11 rounded-xl bg-dental-50 text-dental-700 flex items-center justify-center text-lg font-black border border-dental-200">
                    {selectedTooth}
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-gray-800">{getToothName(selectedTooth)}</div>
                    <div className="text-[11px] text-gray-400">
                      FDI {selectedTooth} · {selectedTooth >= 10 && selectedTooth < 30 ? 'Arcata Superiore' : 'Arcata Inferiore'} · {selectedTooth < 20 || (selectedTooth >= 40 && selectedTooth < 50) ? 'Destra' : 'Sinistra'}
                    </div>
                  </div>
                  <button onClick={() => setSelectedTooth(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex shrink-0 border-b border-gray-100 bg-gray-50/50 px-4">
                  {[['stato','📋 Stato & Aggiungi'],['storico','🕒 Storico (' + (current?.history?.length||0) + ')']].map(([id,label]) => (
                    <button key={id} onClick={() => setDetailTab(id)}
                      className={`px-4 py-2.5 text-[11px] font-bold border-b-2 transition-colors ${
                        detailTab === id ? 'border-dental-500 text-dental-700 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}>{label}
                    </button>
                  ))}
                </div>
                {detailTab === 'stato' && (
                  <div className="flex-1 overflow-y-auto flex flex-col p-4 gap-4 scrollbar-thin">
                    <div className="bg-white rounded-xl border border-gray-100 p-4 shrink-0 shadow-sm">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Stato Superfici</div>
                      <div className="grid grid-cols-5 gap-2">
                        {SURFACES.map(s => {
                          const tx = current?.surfaces?.[s.code];
                          const col = tx ? STATUS_COLORS[tx] : null;
                          return (
                            <div key={s.code} className="flex flex-col items-center gap-1">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border-2 transition-all"
                                style={{
                                  backgroundColor: col ? col+'22' : '#f8fafc',
                                  borderColor: col || '#e2e8f0',
                                  color: col || '#94a3b8',
                                }}>{s.code}
                              </div>
                              <span className="text-[7px] text-gray-400 text-center uppercase">{s.label.split('/')[0]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4 shrink-0 shadow-sm">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Registra Trattamento</div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-gray-500 uppercase">Superficie</label>
                          <select value={fSurface} onChange={e=>setFSurface(e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 outline-none focus:ring-2 focus:ring-dental-400">
                            {SURFACES.map(s=><option key={s.code} value={s.code}>{s.code} – {s.label}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-gray-500 uppercase">Trattamento</label>
                          <select value={fTreatment} onChange={e=>setFTreatment(e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 outline-none focus:ring-2 focus:ring-dental-400">
                            {TREATMENT_TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-gray-500 uppercase">Data</label>
                          <input type="date" value={fDate} onChange={e=>setFDate(e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 outline-none focus:ring-2 focus:ring-dental-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-gray-500 uppercase">Note</label>
                          <input type="text" value={fNote} onChange={e=>setFNote(e.target.value)}
                            placeholder="Note..."
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 outline-none focus:ring-2 focus:ring-dental-400" />
                        </div>
                      </div>
                      <button onClick={addRecord}
                        className="w-full bg-dental-600 hover:bg-dental-700 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md">
                        <Plus className="w-3.5 h-3.5" /> Aggiungi Trattamento
                      </button>
                    </div>
                  </div>
                )}
                {detailTab === 'storico' && (
                  <div className="flex-1 min-h-0 overflow-y-auto" style={scrollStyle}>
                    {(!current?.history?.length) ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-300 py-12">
                        <Clock className="w-8 h-8 mb-2" />
                        <p className="text-sm">Nessun trattamento registrato</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {current.history.map((rec, idx) => {
                          const type = TREATMENT_TYPES.find(t=>t.id===rec.treatment);
                          return (
                            <div key={idx} className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50/80 group transition-colors">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                                style={{ backgroundColor: STATUS_COLORS[rec.treatment]+'20' }}>
                                {type?.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold text-gray-800">{type?.label}</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                                    style={{ background: STATUS_COLORS[rec.treatment]+'20', color: STATUS_COLORS[rec.treatment] }}>
                                    Sup. {rec.surface}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />{rec.date}
                                  </span>
                                  {rec.note && <span className="text-[11px] text-gray-500 truncate">{rec.note}</span>}
                                </div>
                              </div>
                              <button onClick={()=>removeRecord(idx)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-all shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex-[2] flex flex-col min-h-0 bg-white p-3 gap-1">
            <div className="flex-1 flex flex-col min-h-0">
              <p className="text-center text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 mb-1">Arcata Superiore</p>
              <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet"
                className="flex-1 w-full min-h-0" style={{ overflow: 'visible' }}>
                <defs>
                  <radialGradient id="tGrad" cx="30%" cy="30%" r="70%">
                    <stop offset="0%"   stopColor="#ffffff"/>
                    <stop offset="45%"  stopColor="#f0f4f8"/>
                    <stop offset="80%"  stopColor="#dde6f0"/>
                    <stop offset="100%" stopColor="#c8d8e8"/>
                  </radialGradient>
                  <filter id="tShadow" x="-25%" y="-25%" width="150%" height="150%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.1"/>
                  </filter>
                </defs>
                {upperArch.map(tooth => (
                  <SvgTooth key={tooth.num} tooth={tooth}
                    isActive={selectedTooth === tooth.num}
                    toothData={toothData[tooth.num]}
                    onClick={() => setSelectedTooth(tooth.num === selectedTooth ? null : tooth.num)}
                  />
                ))}
              </svg>
            </div>
            <div className="shrink-0 h-px bg-gray-100 mx-6" />
            <div className="flex-1 flex flex-col min-h-0">
              <p className="text-center text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 mb-1">Arcata Inferiore</p>
              <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet"
                className="flex-1 w-full min-h-0" style={{ overflow: 'visible' }}>
                {lowerArch.map(tooth => (
                  <SvgTooth key={tooth.num} tooth={tooth}
                    isActive={selectedTooth === tooth.num}
                    toothData={toothData[tooth.num]}
                    onClick={() => setSelectedTooth(tooth.num === selectedTooth ? null : tooth.num)}
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>
      ) : (
        /* Under Development View */
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 p-8">
          <div className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 text-center max-w-lg w-full transform transition-all hover:scale-[1.02]">
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 bg-dental-50 text-dental-600 rounded-3xl flex items-center justify-center text-4xl shadow-inner animate-bounce">
                🚀
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center text-xl border border-gray-50">
                ⚙️
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-4 tracking-tight uppercase">Modulo in Sviluppo</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 text-center">
              Il modulo <span className="text-dental-600 font-bold px-2 py-1 bg-dental-50 rounded-lg">{activeTab.toUpperCase()}</span> è attualmente in fase di progettazione e implementazione.<br/>
              Sarà disponibile nei prossimi aggiornamenti del سیستم.
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="h-1.5 w-12 bg-dental-100 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-dental-500 rounded-full"></div>
              </div>
              <span className="text-[10px] font-black text-dental-500 uppercase tracking-widest">Progress: 65%</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
