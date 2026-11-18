import { useState, useEffect, useRef } from 'react';
import { Power, AlertTriangle, RotateCw, RotateCcw, CircleDot } from 'lucide-react';
import { DinRailPanel } from './components/DinRailPanel';
import { MotorVisualizer } from './components/MotorVisualizer';
import { WorkingGuide } from './components/WorkingGuide';
import { MotorPhaseType, PhaseState, WireFilterMode } from './types/simulator';

const FILTER_OPTIONS: { id: WireFilterMode; label: string }[] = [
  { id: 'all', label: 'সম্পূর্ণ ওয়্যারিং (Full Panel)' },
  { id: 'phase', label: 'মেইন ফেজ ও ল্যাচিং (Red)' },
  { id: 'forward', label: 'ফরওয়ার্ড কন্ট্রোল (Green)' },
  { id: 'reverse', label: 'রিভার্স কন্ট্রোল (Blue)' },
  { id: 'neutral', label: 'নিউট্রাল লাইন (Black)' },
];

export default function App() {
  const [mcbOn, setMcbOn] = useState(false);
  const [mcbAlert, setMcbAlert] = useState(false);
  const [systemRunning, setSystemRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<PhaseState>('IDLE');
  const [t1Duration, setT1Duration] = useState(5);
  const [t2Duration, setT2Duration] = useState(5);
  const [elapsed, setElapsed] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [wireFilter, setWireFilter] = useState<WireFilterMode>('all');
  const [showPins, setShowPins] = useState(true);
  const [motorPhase, setMotorPhase] = useState<MotorPhaseType>('3-Phase');

  const alertTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mcbOn || !systemRunning) return;

    const interval = window.setInterval(() => {
      setElapsed((prev) => {
        const next = Number((prev + 0.1).toFixed(1));
        if (currentPhase === 'FORWARD' && next >= t1Duration) {
          setCurrentPhase('REVERSE');
          return 0;
        }
        if (currentPhase === 'REVERSE' && next >= t2Duration) {
          setCurrentPhase('FORWARD');
          setCycleCount((c) => c + 1);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [mcbOn, systemRunning, currentPhase, t1Duration, t2Duration]);

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current !== null) {
        window.clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  const stopSimulation = () => {
    setSystemRunning(false);
    setCurrentPhase('IDLE');
    setElapsed(0);
    setCycleCount(0);
  };

  const handleToggleMCB = () => {
    setMcbOn((prev) => {
      const next = !prev;
      if (!next) {
        stopSimulation();
      } else {
        setMcbAlert(false);
      }
      return next;
    });
  };

  const handlePressStart = () => {
    if (!mcbOn) {
      setMcbAlert(true);
      if (alertTimeoutRef.current !== null) {
        window.clearTimeout(alertTimeoutRef.current);
      }
      alertTimeoutRef.current = window.setTimeout(() => {
        setMcbAlert(false);
      }, 1100);
      return;
    }
    if (systemRunning) return;
    setSystemRunning(true);
    setCurrentPhase('FORWARD');
    setElapsed(0);
    setCycleCount(0);
  };

  const handlePressStop = () => {
    stopSimulation();
  };

  const handleTimerChange = (which: 't1' | 't2', rawValue: string) => {
    const parsed = parseInt(rawValue, 10);
    const clamped = Number.isNaN(parsed) ? 5 : Math.max(2, Math.min(60, parsed));
    if (which === 't1') {
      setT1Duration(clamped);
    } else {
      setT2Duration(clamped);
    }
  };

  // Dual-coded system status indicator
  const renderSystemStatus = () => {
    if (mcbAlert && !mcbOn) {
      return {
        icon: <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />,
        text: 'আগে MCB ব্রেকার অন করুন!',
        textClass: 'text-rose-400',
        borderClass: 'border-rose-500/40',
      };
    }
    if (!mcbOn) {
      return {
        icon: <Power className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />,
        text: 'পাওয়ার অফ (MCB OFF)',
        textClass: 'text-slate-300',
        borderClass: 'border-slate-800',
      };
    }
    if (currentPhase === 'IDLE') {
      return {
        icon: <CircleDot className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />,
        text: 'স্ট্যান্ডবাই (START বাটন চাপুন)',
        textClass: 'text-amber-400',
        borderClass: 'border-amber-500/30',
      };
    }
    if (currentPhase === 'FORWARD') {
      return {
        icon: <RotateCw className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />,
        text: 'চলমান: ফরওয়ার্ড (FORWARD CW)',
        textClass: 'text-emerald-400',
        borderClass: 'border-emerald-500/40',
      };
    }
    return {
      icon: <RotateCcw className="w-4 h-4 text-blue-400 shrink-0" aria-hidden="true" />,
      text: 'চলমান: রিভার্স (REVERSE CCW)',
      textClass: 'text-blue-400',
      borderClass: 'border-blue-500/40',
    };
  };

  const statusInfo = renderSystemStatus();

  return (
    <div className="min-h-screen p-3 md:p-6 flex flex-col items-center">
      {/* Header Section */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 mb-5 bg-slate-900 border border-slate-800 p-4 md:p-5 rounded-2xl">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-amber-400">
            <span>ইন্ডাস্ট্রিয়াল কন্ট্রোল প্যানেল</span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="text-blue-400">ইন্টারঅ্যাক্টিভ সার্কিট সিমুলেটর</span>
          </div>
          <h1 className="text-xl md:text-3xl font-bold text-white mt-1 text-balance">
            অটোমেটিক ফরওয়ার্ড-রিভার্স মোটর স্টার্টার (Timer Control)
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            CHNT MCB, ২টি ANLY টাইমার, ২টি ম্যাগনেটিক কন্টাক্টর এবং ৮-পিন কন্ট্রোল রিলে সমন্বিত পূর্ণাঙ্গ ওয়্যারিং ডায়াগ্রাম
          </p>
        </div>

        {/* Live System Status Indicator */}
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center gap-3 bg-slate-950 px-4 py-3 rounded-xl border ${statusInfo.borderClass} w-full md:w-auto justify-center md:justify-start shrink-0 transition-colors`}
        >
          {statusInfo.icon}
          <div>
            <div className="text-[11px] text-slate-400 tracking-wide">বর্তমান অবস্থা (System Status)</div>
            <div className={`text-sm md:text-base font-bold ${statusInfo.textClass}`}>
              {statusInfo.text}
            </div>
          </div>
        </div>
      </header>

      {/* Controls & Timer Adjustment Bar */}
      <section className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">
        {/* Wiring Trace Filter & Pinout Toggle */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-400">
              ওয়্যারিং ট্রেস ফিল্টার (তারের সংযোগ আলাদা করে দেখুন):
            </span>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPins}
                onChange={(e) => setShowPins(e.target.checked)}
                className="accent-blue-500 w-4 h-4 rounded cursor-pointer"
              />
              <span>পিন নাম্বার দেখান (A1, A2, NO, NC, 2, 7, 8, 6, 5...)</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="ওয়্যারিং ট্রেস ফিল্টার">
            {FILTER_OPTIONS.map((opt) => {
              const active = wireFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setWireFilter(opt.id)}
                  aria-pressed={active}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timer 1 & Timer 2 Delay Adjustment */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-around gap-3">
          <div className="flex flex-col items-center">
            <label htmlFor="t1Input" className="text-xs text-emerald-400 font-semibold mb-1.5">
              টাইমার ১ (Forward সময়)
            </label>
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 focus-within:border-emerald-500">
              <input
                id="t1Input"
                type="number"
                value={t1Duration}
                min={2}
                max={60}
                onChange={(e) => handleTimerChange('t1', e.target.value)}
                className="w-12 bg-transparent text-center font-mono-tech font-bold text-white focus:outline-none"
              />
              <span className="text-xs text-slate-400">সেকেন্ড</span>
            </div>
          </div>

          <div className="h-10 w-px bg-slate-800" aria-hidden="true" />

          <div className="flex flex-col items-center">
            <label htmlFor="t2Input" className="text-xs text-blue-400 font-semibold mb-1.5">
              টাইমার ২ (Reverse সময়)
            </label>
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 focus-within:border-blue-500">
              <input
                id="t2Input"
                type="number"
                value={t2Duration}
                min={2}
                max={60}
                onChange={(e) => handleTimerChange('t2', e.target.value)}
                className="w-12 bg-transparent text-center font-mono-tech font-bold text-white focus:outline-none"
              />
              <span className="text-xs text-slate-400">সেকেন্ড</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive DIN-Rail Panel + Motor Simulation */}
      <main className="w-full max-w-7xl grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-9">
          <DinRailPanel
            mcbOn={mcbOn}
            mcbAlert={mcbAlert}
            systemRunning={systemRunning}
            currentPhase={currentPhase}
            elapsed={elapsed}
            t1Duration={t1Duration}
            t2Duration={t2Duration}
            wireFilter={wireFilter}
            showPins={showPins}
            onToggleMCB={handleToggleMCB}
            onPressStart={handlePressStart}
            onPressStop={handlePressStop}
          />
        </div>

        <aside className="xl:col-span-3 flex flex-col gap-5">
          <MotorVisualizer
            mcbOn={mcbOn}
            currentPhase={currentPhase}
            motorPhase={motorPhase}
            elapsed={elapsed}
            t1Duration={t1Duration}
            t2Duration={t2Duration}
            onChangeMotorPhase={setMotorPhase}
            onPressStart={handlePressStart}
            onPressStop={handlePressStop}
          />
          <WorkingGuide
            mcbOn={mcbOn}
            currentPhase={currentPhase}
            cycleCount={cycleCount}
          />
        </aside>
      </main>
    </div>
  );
}
