import React from 'react';
import { Play, Square, RotateCw, RotateCcw, PowerOff, CheckCircle2 } from 'lucide-react';
import { MotorPhaseType, PhaseState } from '../types/simulator';

interface MotorVisualizerProps {
  mcbOn: boolean;
  currentPhase: PhaseState;
  motorPhase: MotorPhaseType;
  elapsed: number;
  t1Duration: number;
  t2Duration: number;
  onChangeMotorPhase: (phase: MotorPhaseType) => void;
  onPressStart: () => void;
  onPressStop: () => void;
}

export const MotorVisualizer: React.FC<MotorVisualizerProps> = ({
  mcbOn,
  currentPhase,
  motorPhase,
  elapsed,
  t1Duration,
  t2Duration,
  onChangeMotorPhase,
  onPressStart,
  onPressStop,
}) => {
  const rotorClass =
    mcbOn && currentPhase === 'FORWARD'
      ? 'motor-cw'
      : mcbOn && currentPhase === 'REVERSE'
        ? 'motor-ccw'
        : '';

  const activeDuration = currentPhase === 'REVERSE' ? t2Duration : t1Duration;
  const progressPct =
    mcbOn && (currentPhase === 'FORWARD' || currentPhase === 'REVERSE')
      ? Math.min(100, (elapsed / activeDuration) * 100)
      : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center">
      <div className="flex items-center justify-between w-full gap-2 mb-1">
        <h2 className="text-base font-bold text-white">ইন্ডাকশন মোটর (Motor)</h2>
        <select
          id="motorPhaseSelect"
          aria-label="মোটর ফেজ নির্বাচন"
          value={motorPhase}
          onChange={(e) => onChangeMotorPhase(e.target.value as MotorPhaseType)}
          className="bg-slate-950 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
        >
          <option value="3-Phase">৩-ফেজ (3-Phase)</option>
          <option value="1-Phase">১-ফেজ (1-Phase)</option>
        </select>
      </div>

      <p className="text-xs text-slate-400 mb-4 w-full text-left">
        {motorPhase === '3-Phase'
          ? '৩-ফেজ মোটরের Forward / Reverse ঘূর্ণন'
          : '১-ফেজ মোটরের Forward / Reverse ঘূর্ণন'}
      </p>

      {/* Motor Rotor Visual */}
      <div className="relative w-44 h-44 flex items-center justify-center bg-slate-950 rounded-full border-4 border-slate-800 shadow-inner mb-4">
        <svg viewBox="0 0 160 160" className="w-36 h-36" aria-hidden="true">
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="#334155"
            strokeWidth="10"
            strokeDasharray="14 6"
          />
          <g className={rotorClass} style={{ transformOrigin: '80px 80px' }}>
            <circle cx="80" cy="80" r="46" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
            <line x1="80" y1="34" x2="80" y2="126" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            <line x1="34" y1="80" x2="126" y2="80" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            <line x1="48" y1="48" x2="112" y2="112" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            <line x1="112" y1="48" x2="48" y2="112" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            <circle
              cx="80"
              cy="44"
              r="6"
              fill={
                mcbOn && currentPhase === 'FORWARD'
                  ? '#10b981'
                  : mcbOn && currentPhase === 'REVERSE'
                    ? '#3b82f6'
                    : '#ef4444'
              }
            />
            <circle cx="80" cy="80" r="14" fill="#cbd5e1" stroke="#0f172a" strokeWidth="3" />
          </g>
        </svg>
      </div>

      {/* Direction Status Box (Dual-coded: icon + explicit Bengali/English text) */}
      {!mcbOn ? (
        <div className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 font-bold text-sm text-slate-400 flex items-center justify-center gap-2">
          <PowerOff className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>মোটর বন্ধ আছে (STOPPED)</span>
        </div>
      ) : currentPhase === 'IDLE' ? (
        <div className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-amber-500/30 font-bold text-sm text-amber-400 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>মোটর প্রস্তুত (READY)</span>
        </div>
      ) : currentPhase === 'FORWARD' ? (
        <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 font-bold text-sm text-emerald-400 flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2">
            <RotateCw className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>FORWARD (ঘড়ির কাঁটার দিকে)</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-100"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="w-full py-2.5 px-3 rounded-xl bg-blue-950/60 border border-blue-500/50 font-bold text-sm text-blue-400 flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>REVERSE (ঘড়ির কাঁটার বিপরীতে)</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 transition-all duration-100"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick Control Buttons */}
      <div className="grid grid-cols-2 gap-2.5 w-full mt-4">
        <button
          type="button"
          onClick={onPressStart}
          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <Play className="w-3.5 h-3.5 fill-current shrink-0" aria-hidden="true" />
          <span>START (চালু)</span>
        </button>
        <button
          type="button"
          onClick={onPressStop}
          className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-rose-950 transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          <Square className="w-3.5 h-3.5 fill-current shrink-0" aria-hidden="true" />
          <span>STOP (বন্ধ)</span>
        </button>
      </div>
    </div>
  );
};
