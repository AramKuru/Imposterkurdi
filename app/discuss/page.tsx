'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadGame, saveGame } from '@/lib/gameStore';
import { GameState } from '@/lib/types';

export default function DiscussPage() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const g = loadGame();
    if (!g) { router.push('/'); return; }
    setGame(g);
    setTimeLeft(g.discussionTime);
  }, [router]);

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { clearInterval(intervalRef.current!); setRunning(false); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, timeLeft]);

  function goToVote() {
    if (!game) return;
    saveGame({ ...game, phase: 'vote', currentPlayerIndex: 0 });
    router.push('/vote');
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  if (!game) return null;

  const pct = (timeLeft / game.discussionTime) * 100;
  const urgent = timeLeft <= 30 && timeLeft > 0;
  const timerColor = urgent ? '#ef4444' : '#7c3aed';

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: '#0f0a1e' }}>
      <div className="flex-1 flex flex-col items-center justify-between px-5 py-8">

        {/* Top section */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-purple-300 mb-1">🗣️ کاتی باس</h1>
          <p className="text-white/40 text-sm">هەوڵ بدە ئیمپۆستەرەکە بناسیتەوە</p>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            <svg className="w-52 h-52 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
              <circle
                cx="50" cy="50" r="44"
                fill="none"
                stroke={timerColor}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
              />
            </svg>
            <span
              className="absolute font-black text-5xl tabular-nums"
              style={{ color: urgent ? '#ef4444' : 'white' }}
            >
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex gap-3 w-full max-w-xs">
            {timeLeft > 0 && !running && (
              <button
                onClick={() => setRunning(true)}
                className="flex-1 py-4 rounded-2xl font-black text-white text-lg active:scale-95 transition-all"
                style={{ background: '#16a34a' }}
              >
                ▶ دەستپێکردن
              </button>
            )}
            {running && (
              <button
                onClick={() => { setRunning(false); clearInterval(intervalRef.current!); }}
                className="flex-1 py-4 rounded-2xl font-bold text-white/70 text-lg active:scale-95 transition-all"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}
              >
                ⏸ وەستان
              </button>
            )}
            {timeLeft === 0 && (
              <div
                className="flex-1 py-4 rounded-2xl font-bold text-red-400 text-center text-lg"
                style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)' }}
              >
                ⏰ تەواو بوو!
              </div>
            )}
          </div>
        </div>

        {/* Players chips */}
        <div className="w-full max-w-sm">
          <p className="text-white/30 text-xs text-center mb-2">یاریزانان</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {game.players.map((p) => (
              <span
                key={p.id}
                className="px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)', color: '#c4b5fd' }}
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Sticky vote button */}
      <div
        className="px-5 pb-8 pt-3"
        style={{ background: 'linear-gradient(to top, #0f0a1e 70%, transparent)' }}
      >
        <button
          onClick={goToVote}
          className="w-full text-white font-black text-xl py-5 rounded-2xl active:scale-95 transition-all shadow-lg"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          🗳️ کاتی دەنگدان
        </button>
      </div>
    </div>
  );
}
