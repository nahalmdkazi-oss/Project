import React from 'react';
import { PhaseState, WireFilterMode } from '../types/simulator';

interface DinRailPanelProps {
  mcbOn: boolean;
  mcbAlert: boolean;
  systemRunning: boolean;
  currentPhase: PhaseState;
  elapsed: number;
  t1Duration: number;
  t2Duration: number;
  wireFilter: WireFilterMode;
  showPins: boolean;
  onToggleMCB: () => void;
  onPressStart: () => void;
  onPressStop: () => void;
}

export const DinRailPanel: React.FC<DinRailPanelProps> = ({
  mcbOn,
  mcbAlert,
  systemRunning,
  currentPhase,
  elapsed,
  t1Duration,
  t2Duration,
  wireFilter,
  showPins,
  onToggleMCB,
  onPressStart,
  onPressStop,
}) => {
  const getWireOpacity = (group: Exclude<WireFilterMode, 'all'>): number => {
    return wireFilter === 'all' || wireFilter === group ? 1 : 0.12;
  };

  const isPhaseStandbyActive = mcbOn;
  const isLatchActive = mcbOn && systemRunning;
  const isForwardActive = mcbOn && currentPhase === 'FORWARD';
  const isReverseActive = mcbOn && currentPhase === 'REVERSE';
  const isNeutralActive = mcbOn;

  // Timer 1 & Timer 2 needle & text calculations
  const t1Angle =
    currentPhase === 'FORWARD'
      ? Math.min(1, elapsed / t1Duration) * 270 - 135
      : currentPhase === 'REVERSE'
        ? 135
        : -135;

  const t2Angle =
    currentPhase === 'REVERSE'
      ? Math.min(1, elapsed / t2Duration) * 270 - 135
      : -135;

  const t1Text =
    currentPhase === 'FORWARD'
      ? `${elapsed.toFixed(1)}s / ${t1Duration}s`
      : currentPhase === 'REVERSE'
        ? `DONE (${t1Duration}s)`
        : `0.0s / ${t1Duration}s`;

  const t2Text =
    currentPhase === 'REVERSE'
      ? `${elapsed.toFixed(1)}s / ${t2Duration}s`
      : `0.0s / ${t2Duration}s`;

  const handleKeyActivate = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // Dial tick marks for ANLY timers (-135° to +135° in 6 intervals)
  const dialTicks = [-135, -90, -45, 0, 45, 90, 135];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col">
      {/* Top Instructional & Color Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5 text-xs text-slate-300 bg-slate-950/80 px-3.5 py-2.5 rounded-xl border border-slate-800">
        <span>
          <strong className="text-amber-300 font-semibold">ব্যবহারবিধি:</strong> প্রথমে বামের{' '}
          <strong className="text-white">CHNT MCB সুইচটিতে</strong> ক্লিক করে পাওয়ার অন করুন, এরপর নিচের{' '}
          <strong className="text-emerald-400">সবুজ START বাটন</strong> চাপুন।
        </span>
        <div className="flex flex-wrap items-center gap-3.5 shrink-0">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-3.5 h-1 bg-red-600 rounded-full inline-block" aria-hidden="true" />
            <span>ফেজ (Red)</span>
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span
              className="w-3.5 h-1 bg-slate-950 border border-slate-500 rounded-full inline-block"
              aria-hidden="true"
            />
            <span>নিউট্রাল (Black)</span>
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-3.5 h-1 bg-emerald-500 rounded-full inline-block" aria-hidden="true" />
            <span>ফরওয়ার্ড (Green)</span>
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-3.5 h-1 bg-blue-500 rounded-full inline-block" aria-hidden="true" />
            <span>রিভার্স (Blue)</span>
          </span>
        </div>
      </div>

      {/* Industrial Backplate Board SVG Container */}
      <div className="w-full overflow-x-auto bg-[#e2e8f0] rounded-xl border-4 border-slate-700 shadow-inner">
        <svg
          id="panelSvg"
          viewBox="0 0 1080 630"
          className="w-full min-w-[920px] h-auto select-none block"
          role="img"
          aria-label="ইন্ডাস্ট্রিয়াল অটোমেটিক ফরওয়ার্ড-রিভার্স মোটর স্টার্টার ডায়াগ্রাম"
        >
          <defs>
            <pattern id="boardTex" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.8" fill="#cbd5e1" />
              <circle cx="8" cy="7" r="0.6" fill="#94a3b8" />
            </pattern>
            <linearGradient id="dinRailGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>

          {/* Textured Panel Background */}
          <rect width="1080" height="630" fill="#f1f5f9" />
          <rect width="1080" height="630" fill="url(#boardTex)" />

          {/* Metallic DIN Rail */}
          <rect
            x="40"
            y="210"
            width="1000"
            height="44"
            rx="3"
            fill="url(#dinRailGrad)"
            stroke="#475569"
            strokeWidth="1.5"
          />
          <rect x="40" y="220" width="1000" height="24" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />

          {/* ========================================================= */}
          {/* COMPONENT 1: 1-POLE MCB (CHNT)                            */}
          {/* ========================================================= */}
          <g
            id="comp-mcb"
            transform="translate(65, 130)"
            className="cursor-pointer focus:outline-none"
            role="button"
            tabIndex={0}
            aria-pressed={mcbOn}
            aria-label={`CHNT MCB ব্রেকার, বর্তমান অবস্থা ${mcbOn ? 'ON' : 'OFF'}`}
            onClick={onToggleMCB}
            onKeyDown={(e) => handleKeyActivate(e, onToggleMCB)}
            style={{
              filter: mcbAlert ? 'drop-shadow(0 0 12px #ef4444)' : 'none',
              transition: 'filter 180ms ease',
            }}
          >
            <rect x="0" y="0" width="76" height="190" rx="6" fill="#ffffff" stroke="#334155" strokeWidth="2" />
            <rect x="0" y="55" width="76" height="80" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />

            {/* Brand Header */}
            <rect x="8" y="10" width="60" height="22" rx="3" fill="#1d4ed8" />
            <text
              x="38"
              y="25"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12"
              fontWeight="bold"
              className="font-mono-tech"
            >
              CHNT
            </text>
            <text x="38" y="45" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="bold">
              DZ47-63 C16
            </text>

            {/* Breaker Toggle Switch */}
            <rect x="20" y="70" width="36" height="50" rx="4" fill="#1e293b" />
            <rect
              x="23"
              y={mcbOn ? 73 : 95}
              width="30"
              height="22"
              rx="3"
              fill={mcbOn ? '#10b981' : '#ef4444'}
              style={{ transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
            <text
              x="38"
              y="132"
              textAnchor="middle"
              fill={mcbOn ? '#059669' : '#dc2626'}
              fontSize="10"
              fontWeight="bold"
            >
              {mcbOn ? 'ON' : 'OFF'}
            </text>

            {/* Terminals */}
            <circle cx="38" cy="12" r="5" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5" />
            {showPins && (
              <text x="54" y="16" fill="#dc2626" fontSize="9" fontWeight="bold">
                IN
              </text>
            )}
            <circle cx="38" cy="176" r="6" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5" />
            {showPins && (
              <text x="56" y="180" fill="#dc2626" fontSize="9" fontWeight="bold">
                OUT
              </text>
            )}

            <text x="38" y="-10" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">
              ১. MCB ব্রেকার
            </text>
            <text x="38" y="206" textAnchor="middle" fill="#1d4ed8" fontSize="10" fontWeight="bold">
              (ক্লিক করে ON/OFF)
            </text>
          </g>

          {/* ========================================================= */}
          {/* COMPONENT 2: TIMER 1 (ANLY ON-DELAY TIMER)                */}
          {/* ========================================================= */}
          <g id="comp-t1" transform="translate(175, 115)">
            {/* Socket Base */}
            <rect x="2" y="180" width="112" height="34" rx="4" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
            {/* Timer Body */}
            <rect x="0" y="0" width="116" height="185" rx="8" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
            <rect x="10" y="12" width="96" height="125" rx="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />

            {/* Dial */}
            <circle cx="58" cy="68" r="36" fill="#1e293b" stroke="#475569" strokeWidth="3" />
            {dialTicks.map((deg) => (
              <line
                key={deg}
                x1="58"
                y1="35"
                x2="58"
                y2="40"
                stroke="#94a3b8"
                strokeWidth="1.5"
                transform={`rotate(${deg} 58 68)`}
              />
            ))}
            <circle cx="58" cy="68" r="24" fill="#cbd5e1" />

            {/* Dial Pointer */}
            <line
              x1="58"
              y1="68"
              x2="58"
              y2="46"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${t1Angle} 58 68)`}
            />
            <circle cx="58" cy="68" r="5" fill="#0f172a" />

            {/* Live Countdown Readout */}
            <rect x="18" y="110" width="80" height="20" rx="4" fill="#0f172a" />
            <text
              x="58"
              y="124"
              textAnchor="middle"
              fill="#34d399"
              fontSize="10.5"
              fontWeight="bold"
              className="font-mono-tech"
            >
              {t1Text}
            </text>

            {/* Status LEDs */}
            <circle cx="26" cy="148" r="4.5" fill={mcbOn && systemRunning ? '#10b981' : '#64748b'} />
            <text x="35" y="151" fill="#1e293b" fontSize="9" fontWeight="bold">
              ON
            </text>
            <circle cx="72" cy="148" r="4.5" fill={mcbOn && currentPhase === 'REVERSE' ? '#ef4444' : '#64748b'} />
            <text x="81" y="151" fill="#1e293b" fontSize="9" fontWeight="bold">
              UP
            </text>

            <rect x="12" y="160" width="92" height="18" rx="3" fill="#1e293b" />
            <text x="58" y="172" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">
              ANLY TIMER 1
            </text>

            {/* Socket Pin Terminals (2, 7, 8, 6) */}
            <circle cx="18" cy="197" r="5" fill="#cbd5e1" stroke="#000" />
            <circle cx="44" cy="197" r="5" fill="#cbd5e1" stroke="#000" />
            <circle cx="71" cy="197" r="5" fill="#cbd5e1" stroke="#000" />
            <circle cx="98" cy="197" r="5" fill="#cbd5e1" stroke="#000" />
            {showPins && (
              <g>
                <text x="18" y="226" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="bold">
                  2(N)
                </text>
                <text x="44" y="226" textAnchor="middle" fill="#059669" fontSize="10" fontWeight="bold">
                  7(L)
                </text>
                <text x="71" y="226" textAnchor="middle" fill="#059669" fontSize="10" fontWeight="bold">
                  8(C)
                </text>
                <text x="98" y="226" textAnchor="middle" fill="#2563eb" fontSize="10" fontWeight="bold">
                  6(NO)
                </text>
              </g>
            )}
            <text x="58" y="-10" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">
              ২. টাইমার ১ (Forward)
            </text>
          </g>

          {/* ========================================================= */}
          {/* COMPONENT 3: MAGNETIC CONTACTOR 1 (FORWARD MC - LS)       */}
          {/* ========================================================= */}
          <g id="comp-mc1" transform="translate(325, 110)">
            <rect x="0" y="0" width="130" height="205" rx="6" fill="#f8fafc" stroke="#334155" strokeWidth="2" />

            {/* Top Terminals */}
            <rect x="8" y="4" width="114" height="26" rx="3" fill="#e2e8f0" stroke="#94a3b8" />
            <circle cx="24" cy="17" r="5" fill="#64748b" />
            <circle cx="50" cy="17" r="5" fill="#64748b" />
            <circle cx="76" cy="17" r="5" fill="#64748b" />
            <circle cx="106" cy="17" r="5" fill="#10b981" />
            {showPins && (
              <g>
                <text x="24" y="40" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="bold">
                  L1
                </text>
                <text x="50" y="40" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="bold">
                  L2
                </text>
                <text x="76" y="40" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="bold">
                  L3
                </text>
                <text x="106" y="40" textAnchor="middle" fill="#059669" fontSize="9" fontWeight="bold">
                  A1
                </text>
              </g>
            )}

            {/* Middle Plunger Window */}
            <rect x="15" y="55" width="100" height="85" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
            <text x="30" y="75" fill="#1d4ed8" fontSize="13" fontWeight="bold">
              LS
            </text>
            <text x="88" y="75" fill="#059669" fontSize="10" fontWeight="bold">
              MC-1
            </text>

            {/* Moving Plunger Indicator */}
            <rect
              x="49"
              y={isForwardActive ? 84 : 78}
              width="32"
              height="32"
              rx="4"
              fill={isForwardActive ? '#10b981' : '#f97316'}
              stroke={isForwardActive ? '#047857' : '#c2410c'}
              strokeWidth="2"
              style={{ transition: 'all 140ms ease' }}
            />
            <text
              x="65"
              y="128"
              textAnchor="middle"
              fill={isForwardActive ? '#059669' : '#475569'}
              fontSize="10"
              fontWeight="bold"
            >
              {isForwardActive ? 'ENERGIZED' : 'RELEASED'}
            </text>

            {/* Bottom Terminals (NO, NC, A2) */}
            <rect x="8" y="172" width="114" height="28" rx="3" fill="#e2e8f0" stroke="#94a3b8" />
            <circle cx="24" cy="186" r="5" fill="#10b981" />
            <circle cx="52" cy="186" r="5" fill="#2563eb" />
            <circle cx="80" cy="186" r="5" fill="#2563eb" />
            <circle cx="108" cy="186" r="5" fill="#0f172a" />
            {showPins && (
              <g>
                <text x="24" y="167" textAnchor="middle" fill="#059669" fontSize="9" fontWeight="bold">
                  NO(13)
                </text>
                <text x="52" y="167" textAnchor="middle" fill="#2563eb" fontSize="9" fontWeight="bold">
                  NC(21)
                </text>
                <text x="80" y="167" textAnchor="middle" fill="#2563eb" fontSize="9" fontWeight="bold">
                  NC(22)
                </text>
                <text x="108" y="167" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">
                  A2
                </text>
              </g>
            )}
            <text x="65" y="-10" textAnchor="middle" fill="#047857" fontSize="12" fontWeight="bold">
              ৩. কন্টাক্টর ১ (Forward)
            </text>
          </g>

          {/* ========================================================= */}
          {/* COMPONENT 4: 8-PIN / 11-PIN GLASS CONTROL RELAY           */}
          {/* ========================================================= */}
          <g id="comp-relay" transform="translate(490, 125)">
            {/* Socket Base */}
            <rect x="0" y="155" width="98" height="36" rx="4" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
            {/* Clear Glass Housing */}
            <rect
              x="8"
              y="0"
              width="82"
              height="156"
              rx="6"
              fill="#cbd5e1"
              fillOpacity="0.65"
              stroke="#475569"
              strokeWidth="2"
            />
            {/* Copper Coil Inside */}
            <rect x="28" y="45" width="42" height="55" rx="4" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
            <line x1="28" y1="55" x2="70" y2="55" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="28" y1="65" x2="70" y2="65" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="28" y1="75" x2="70" y2="75" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="28" y1="85" x2="70" y2="85" stroke="#f59e0b" strokeWidth="1.5" />

            {/* Relay Status LED */}
            <circle
              cx="49"
              cy="24"
              r="6"
              fill={mcbOn && systemRunning ? '#ef4444' : '#64748b'}
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            <text x="49" y="124" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="bold">
              8/11-PIN RELAY
            </text>

            {/* Relay Terminals */}
            <circle cx="14" cy="173" r="4.5" fill="#cbd5e1" />
            <circle cx="32" cy="173" r="4.5" fill="#cbd5e1" />
            <circle cx="50" cy="173" r="4.5" fill="#cbd5e1" />
            <circle cx="68" cy="173" r="4.5" fill="#cbd5e1" />
            <circle cx="86" cy="173" r="4.5" fill="#cbd5e1" />
            {showPins && (
              <g>
                <text x="14" y="203" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">
                  2(N)
                </text>
                <text x="32" y="203" textAnchor="middle" fill="#dc2626" fontSize="9" fontWeight="bold">
                  7(L)
                </text>
                <text x="50" y="203" textAnchor="middle" fill="#dc2626" fontSize="9" fontWeight="bold">
                  1(C)
                </text>
                <text x="68" y="203" textAnchor="middle" fill="#059669" fontSize="9" fontWeight="bold">
                  3(NO)
                </text>
                <text x="86" y="203" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="bold">
                  4(NC)
                </text>
              </g>
            )}
            <text x="49" y="-10" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">
              ৪. কন্ট্রোল রিলে
            </text>
          </g>

          {/* ========================================================= */}
          {/* COMPONENT 5: MAGNETIC CONTACTOR 2 (REVERSE MC - LS)       */}
          {/* ========================================================= */}
          <g id="comp-mc2" transform="translate(625, 110)">
            <rect x="0" y="0" width="130" height="205" rx="6" fill="#f8fafc" stroke="#334155" strokeWidth="2" />

            {/* Top Terminals */}
            <rect x="8" y="4" width="114" height="26" rx="3" fill="#e2e8f0" stroke="#94a3b8" />
            <circle cx="24" cy="17" r="5" fill="#64748b" />
            <circle cx="50" cy="17" r="5" fill="#64748b" />
            <circle cx="76" cy="17" r="5" fill="#64748b" />
            <circle cx="106" cy="17" r="5" fill="#2563eb" />
            {showPins && (
              <g>
                <text x="24" y="40" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="bold">
                  L1
                </text>
                <text x="50" y="40" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="bold">
                  L2
                </text>
                <text x="76" y="40" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="bold">
                  L3
                </text>
                <text x="106" y="40" textAnchor="middle" fill="#2563eb" fontSize="9" fontWeight="bold">
                  A1
                </text>
              </g>
            )}

            {/* Middle Plunger Window */}
            <rect x="15" y="55" width="100" height="85" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
            <text x="30" y="75" fill="#1d4ed8" fontSize="13" fontWeight="bold">
              LS
            </text>
            <text x="88" y="75" fill="#2563eb" fontSize="10" fontWeight="bold">
              MC-2
            </text>

            {/* Moving Plunger Indicator */}
            <rect
              x="49"
              y={isReverseActive ? 84 : 78}
              width="32"
              height="32"
              rx="4"
              fill={isReverseActive ? '#3b82f6' : '#f97316'}
              stroke={isReverseActive ? '#1d4ed8' : '#c2410c'}
              strokeWidth="2"
              style={{ transition: 'all 140ms ease' }}
            />
            <text
              x="65"
              y="128"
              textAnchor="middle"
              fill={isReverseActive ? '#2563eb' : '#475569'}
              fontSize="10"
              fontWeight="bold"
            >
              {isReverseActive ? 'ENERGIZED' : 'RELEASED'}
            </text>

            {/* Bottom Terminals */}
            <rect x="8" y="172" width="114" height="28" rx="3" fill="#e2e8f0" stroke="#94a3b8" />
            <circle cx="24" cy="186" r="5" fill="#2563eb" />
            <circle cx="52" cy="186" r="5" fill="#10b981" />
            <circle cx="80" cy="186" r="5" fill="#10b981" />
            <circle cx="108" cy="186" r="5" fill="#0f172a" />
            {showPins && (
              <g>
                <text x="24" y="167" textAnchor="middle" fill="#2563eb" fontSize="9" fontWeight="bold">
                  NO(13)
                </text>
                <text x="52" y="167" textAnchor="middle" fill="#059669" fontSize="9" fontWeight="bold">
                  NC(21)
                </text>
                <text x="80" y="167" textAnchor="middle" fill="#059669" fontSize="9" fontWeight="bold">
                  NC(22)
                </text>
                <text x="108" y="167" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">
                  A2
                </text>
              </g>
            )}
            <text x="65" y="-10" textAnchor="middle" fill="#1d4ed8" fontSize="12" fontWeight="bold">
              ৫. কন্টাক্টর ২ (Reverse)
            </text>
          </g>

          {/* ========================================================= */}
          {/* COMPONENT 6: TIMER 2 (ANLY ON-DELAY TIMER)                */}
          {/* ========================================================= */}
          <g id="comp-t2" transform="translate(790, 115)">
            {/* Socket Base */}
            <rect x="2" y="180" width="112" height="34" rx="4" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
            {/* Timer Body */}
            <rect x="0" y="0" width="116" height="185" rx="8" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
            <rect x="10" y="12" width="96" height="125" rx="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />

            {/* Dial */}
            <circle cx="58" cy="68" r="36" fill="#1e293b" stroke="#475569" strokeWidth="3" />
            {dialTicks.map((deg) => (
              <line
                key={deg}
                x1="58"
                y1="35"
                x2="58"
                y2="40"
                stroke="#94a3b8"
                strokeWidth="1.5"
                transform={`rotate(${deg} 58 68)`}
              />
            ))}
            <circle cx="58" cy="68" r="24" fill="#cbd5e1" />

            {/* Dial Pointer */}
            <line
              x1="58"
              y1="68"
              x2="58"
              y2="46"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${t2Angle} 58 68)`}
            />
            <circle cx="58" cy="68" r="5" fill="#0f172a" />

            {/* Live Countdown Readout */}
            <rect x="18" y="110" width="80" height="20" rx="4" fill="#0f172a" />
            <text
              x="58"
              y="124"
              textAnchor="middle"
              fill="#60a5fa"
              fontSize="10.5"
              fontWeight="bold"
              className="font-mono-tech"
            >
              {t2Text}
            </text>

            {/* Status LEDs */}
            <circle cx="26" cy="148" r="4.5" fill={mcbOn && currentPhase === 'REVERSE' ? '#10b981' : '#64748b'} />
            <text x="35" y="151" fill="#1e293b" fontSize="9" fontWeight="bold">
              ON
            </text>
            <circle cx="72" cy="148" r="4.5" fill="#64748b" />
            <text x="81" y="151" fill="#1e293b" fontSize="9" fontWeight="bold">
              UP
            </text>

            <rect x="12" y="160" width="92" height="18" rx="3" fill="#1e293b" />
            <text x="58" y="172" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">
              ANLY TIMER 2
            </text>

            {/* Socket Pin Terminals (2, 7, 8, 5) */}
            <circle cx="18" cy="197" r="5" fill="#cbd5e1" stroke="#000" />
            <circle cx="44" cy="197" r="5" fill="#cbd5e1" stroke="#000" />
            <circle cx="71" cy="197" r="5" fill="#cbd5e1" stroke="#000" />
            <circle cx="98" cy="197" r="5" fill="#cbd5e1" stroke="#000" />
            {showPins && (
              <g>
                <text x="18" y="226" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="bold">
                  2(N)
                </text>
                <text x="44" y="226" textAnchor="middle" fill="#2563eb" fontSize="10" fontWeight="bold">
                  7(L)
                </text>
                <text x="71" y="226" textAnchor="middle" fill="#059669" fontSize="10" fontWeight="bold">
                  8(C)
                </text>
                <text x="98" y="226" textAnchor="middle" fill="#059669" fontSize="10" fontWeight="bold">
                  5(NC)
                </text>
              </g>
            )}
            <text x="58" y="-10" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">
              ৬. টাইমার ২ (Reverse)
            </text>
          </g>

          {/* ========================================================= */}
          {/* COMPONENT 7: PUSH BUTTONS (RED STOP & GREEN START)        */}
          {/* ========================================================= */}
          {/* Red STOP Push Button (NC) */}
          <g
            id="btn-stop-svg"
            transform="translate(220, 445)"
            className="cursor-pointer active:scale-95 transition-transform focus:outline-none"
            style={{ transformOrigin: '262px 502px' }}
            role="button"
            tabIndex={0}
            aria-label="STOP বন্ধ বাটন (NC)"
            onClick={onPressStop}
            onKeyDown={(e) => handleKeyActivate(e, onPressStop)}
          >
            <rect x="0" y="0" width="84" height="115" rx="8" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            <rect x="10" y="6" width="64" height="28" rx="4" fill="#334155" />
            <circle cx="24" cy="20" r="5" fill="#ef4444" />
            <circle cx="60" cy="20" r="5" fill="#ef4444" />
            {showPins && (
              <g>
                <text x="24" y="45" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">
                  NC 1
                </text>
                <text x="60" y="45" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">
                  NC 2
                </text>
              </g>
            )}
            <circle cx="42" cy="78" r="26" fill="#991b1b" stroke="#cbd5e1" strokeWidth="3" />
            <circle cx="42" cy="76" r="21" fill="#ef4444" />
            <text x="42" y="80" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
              STOP
            </text>
            <text x="42" y="132" textAnchor="middle" fill="#b91c1c" fontSize="12" fontWeight="bold">
              বন্ধ বাটন (NC)
            </text>
          </g>

          {/* Green START Push Button (NO) */}
          <g
            id="btn-start-svg"
            transform="translate(335, 445)"
            className="cursor-pointer active:scale-95 transition-transform focus:outline-none"
            style={{ transformOrigin: '377px 502px' }}
            role="button"
            tabIndex={0}
            aria-label="START চালু বাটন (NO)"
            onClick={onPressStart}
            onKeyDown={(e) => handleKeyActivate(e, onPressStart)}
          >
            <rect x="0" y="0" width="84" height="115" rx="8" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            <rect x="10" y="6" width="64" height="28" rx="4" fill="#334155" />
            <circle cx="24" cy="20" r="5" fill="#10b981" />
            <circle cx="60" cy="20" r="5" fill="#10b981" />
            {showPins && (
              <g>
                <text x="24" y="45" textAnchor="middle" fill="#6ee7b7" fontSize="9" fontWeight="bold">
                  NO 3
                </text>
                <text x="60" y="45" textAnchor="middle" fill="#6ee7b7" fontSize="9" fontWeight="bold">
                  NO 4
                </text>
              </g>
            )}
            <circle cx="42" cy="78" r="26" fill="#065f46" stroke="#cbd5e1" strokeWidth="3" />
            <circle cx="42" cy="76" r="21" fill="#10b981" />
            <text x="42" y="80" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
              START
            </text>
            <text x="42" y="132" textAnchor="middle" fill="#047857" fontSize="12" fontWeight="bold">
              চালু বাটন (NO)
            </text>
          </g>

          {/* ========================================================= */}
          {/* COLOR-CODED WIRING LAYER                                  */}
          {/* ========================================================= */}
          <g id="wiring-layer" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* 1. RED WIRES: MAIN PHASE & RELAY LATCHING */}
            <g style={{ opacity: getWireOpacity('phase'), transition: 'opacity 150ms ease' }}>
              <path
                d="M 103 22 L 103 142"
                stroke="#dc2626"
                strokeWidth="4"
                className={isPhaseStandbyActive ? 'wire-active' : undefined}
              />
              <text x="103" y="15" textAnchor="middle" fill="#dc2626" fontSize="11" fontWeight="bold">
                220V AC PHASE (L)
              </text>
              <path
                d="M 103 306 L 103 465 L 244 465"
                stroke="#dc2626"
                strokeWidth="3.5"
                className={isPhaseStandbyActive ? 'wire-active' : undefined}
              />
              <path
                d="M 280 465 L 359 465"
                stroke="#dc2626"
                strokeWidth="3.5"
                className={isPhaseStandbyActive ? 'wire-active' : undefined}
              />
              <path
                d="M 315 465 L 315 395 L 540 395 L 540 298"
                stroke="#dc2626"
                strokeWidth="3"
                className={isPhaseStandbyActive ? 'wire-active' : undefined}
              />
              <path
                d="M 395 465 L 395 375 L 522 375 L 522 298"
                stroke="#ef4444"
                strokeWidth="3.5"
                className={isLatchActive ? 'wire-active' : undefined}
              />
              <path
                d="M 558 298 L 558 358 L 418 358 L 418 465 L 395 465"
                stroke="#dc2626"
                strokeWidth="3"
                className={isLatchActive ? 'wire-active' : undefined}
              />
            </g>

            {/* 2. GREEN WIRES: FORWARD CONTROL PATH */}
            <g style={{ opacity: getWireOpacity('forward'), transition: 'opacity 150ms ease' }}>
              <path
                d="M 558 358 L 219 358 L 219 312"
                stroke="#10b981"
                strokeWidth="3.5"
                className={isLatchActive ? 'wire-active' : undefined}
              />
              <path
                d="M 219 342 L 246 342 L 246 312"
                stroke="#10b981"
                strokeWidth="3"
                className={isLatchActive ? 'wire-active' : undefined}
              />
              <path
                d="M 246 342 L 246 65 L 861 65 L 861 312"
                stroke="#10b981"
                strokeWidth="3"
                className={isForwardActive ? 'wire-active' : undefined}
              />
              <path
                d="M 888 312 L 888 345 L 677 345 L 677 296"
                stroke="#10b981"
                strokeWidth="3"
                className={isForwardActive ? 'wire-active' : undefined}
              />
              <path
                d="M 705 296 L 705 332 L 472 332 L 472 82 L 431 82 L 431 127"
                stroke="#059669"
                strokeWidth="3.5"
                className={isForwardActive ? 'wire-active' : undefined}
              />
            </g>

            {/* 3. BLUE WIRES: REVERSE CONTROL PATH */}
            <g style={{ opacity: getWireOpacity('reverse'), transition: 'opacity 150ms ease' }}>
              <path
                d="M 273 312 L 273 382 L 377 382 L 377 296"
                stroke="#2563eb"
                strokeWidth="3.5"
                className={isReverseActive ? 'wire-active' : undefined}
              />
              <path
                d="M 405 296 L 405 368 L 768 368 L 768 82 L 731 82 L 731 127"
                stroke="#3b82f6"
                strokeWidth="3.5"
                className={isReverseActive ? 'wire-active' : undefined}
              />
              <path
                d="M 768 368 L 834 368 L 834 312"
                stroke="#2563eb"
                strokeWidth="3"
                className={isReverseActive ? 'wire-active' : undefined}
              />
            </g>

            {/* 4. BLACK WIRES: COMMON NEUTRAL BUS (N) */}
            <g style={{ opacity: getWireOpacity('neutral'), transition: 'opacity 150ms ease' }}>
              <path
                d="M 985 22 L 985 415 L 193 415"
                stroke="#0f172a"
                strokeWidth="3.5"
                className={isNeutralActive ? 'wire-active' : undefined}
              />
              <text x="985" y="15" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="bold">
                NEUTRAL (N)
              </text>
              <path
                d="M 193 415 L 193 312"
                stroke="#0f172a"
                strokeWidth="3"
                className={isNeutralActive ? 'wire-active' : undefined}
              />
              <path
                d="M 433 415 L 433 296"
                stroke="#0f172a"
                strokeWidth="3"
                className={isNeutralActive ? 'wire-active' : undefined}
              />
              <path
                d="M 504 415 L 504 298"
                stroke="#0f172a"
                strokeWidth="3"
                className={isNeutralActive ? 'wire-active' : undefined}
              />
              <path
                d="M 733 415 L 733 296"
                stroke="#0f172a"
                strokeWidth="3"
                className={isNeutralActive ? 'wire-active' : undefined}
              />
              <path
                d="M 808 415 L 808 312"
                stroke="#0f172a"
                strokeWidth="3"
                className={isNeutralActive ? 'wire-active' : undefined}
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
