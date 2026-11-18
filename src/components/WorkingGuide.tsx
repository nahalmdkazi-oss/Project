import React from 'react';
import { Zap } from 'lucide-react';
import { PhaseState } from '../types/simulator';

interface WorkingGuideProps {
  mcbOn: boolean;
  currentPhase: PhaseState;
  cycleCount: number;
}

export const WorkingGuide: React.FC<WorkingGuideProps> = ({
  mcbOn,
  currentPhase,
  cycleCount,
}) => {
  const activeStep = !mcbOn
    ? 1
    : currentPhase === 'IDLE'
      ? 1
      : currentPhase === 'FORWARD'
        ? cycleCount > 0
          ? 4
          : 2
        : 3;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-1">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
          <Zap className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>সার্কিটের কার্যপ্রণালী (Working Principle)</span>
        </h3>
        {cycleCount > 0 && (
          <span className="text-[11px] font-mono-tech text-slate-400 whitespace-nowrap">
            সাইকেল: {cycleCount}
          </span>
        )}
      </div>

      <ol className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
        <li
          className={`p-2 rounded-lg border transition-colors ${
            activeStep === 1 && mcbOn
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-transparent border-transparent'
          }`}
        >
          <span className="font-bold text-white">১. MCB অন করা:</span> ব্রেকারটি অন করলে ফেজ (লাল) ও
          নিউট্রাল (কালো) লাইনে বিদ্যুৎ প্রবাহিত হয়।
        </li>
        <li
          className={`p-2 rounded-lg border transition-colors ${
            activeStep === 2
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-transparent border-transparent'
          }`}
        >
          <span className="font-bold text-emerald-400">২. START ও ফরওয়ার্ড মোড:</span> সবুজ বাটন চাপলে{' '}
          <span className="text-amber-300">কন্ট্রোল রিলে</span> ল্যাচ হয়। ফলে <b>MC-1 (Forward)</b> এবং{' '}
          <b>Timer 1</b> চালু হয়; মোটর ঘড়ির কাঁটার দিকে ঘুরতে থাকে।
        </li>
        <li
          className={`p-2 rounded-lg border transition-colors ${
            activeStep === 3
              ? 'bg-blue-500/10 border-blue-500/30'
              : 'bg-transparent border-transparent'
          }`}
        >
          <span className="font-bold text-blue-400">৩. অটো রিভার্স পরিবর্তন:</span> Timer 1-এর নির্ধারিত
          সময় শেষ হলে ইন্টারলকিংয়ের মাধ্যমে MC-1 বন্ধ হয়ে <b>MC-2 (Reverse)</b> ও <b>Timer 2</b> চালু
          হয়; মোটর উল্টো দিকে ঘুরতে থাকে।
        </li>
        <li
          className={`p-2 rounded-lg border transition-colors ${
            activeStep === 4
              ? 'bg-purple-500/10 border-purple-500/30'
              : 'bg-transparent border-transparent'
          }`}
        >
          <span className="font-bold text-purple-400">৪. অটোমেটিক সাইকেল:</span> Timer 2-এর সময় শেষ
          হলে পুনরায় ফরওয়ার্ড মোড চালু হয়। লাল <b>STOP</b> বাটন না চাপা পর্যন্ত এই চক্র চলতে থাকে।
        </li>
      </ol>
    </div>
  );
};
