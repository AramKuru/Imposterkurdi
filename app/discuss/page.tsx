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
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, timeLeft]);

  function goToVote() {
    if (!game) return;
    const updated: GameState = { ...game, phase: 'vote', currentPlayerIndex: 0 };
    saveGame(updated);
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

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-black text-purple-300 mb-2">🗣️ کاتی باس</h1>
        <p className="text-white/50 text-sm mb-8">هەوڵ بدە ئیمپۆستەرەکە بناسیتەوە</p>

        {/* Timer circle */}
        <div className="relative flex items-center justify-center mb-8">
          <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke={urgent ? '#ef4444' : '#7c3aed'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
            />
          </svg>
          <span
            className="absolute font-black text-4xl"
            style={{ color: urgent ? '#ef4444' : 'white' }}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Timer controls */}
        <div className="flex gap-3 mb-8">
          {!running && timeLeft > 0 && (
            <button
              onClick={() => setRunning(true)}
              className="flex-1 py-4 rounded-xl font-bold text-white text-lg active:scale-95 transition-all"
              style={{ background: '#16a34a' }}
            >
              ▶ دەستپێکردن
            </button>
          )}
          {running && (
            <button
              onClick={() => { setRunning(false); if (intervalRef.current) clearInterval(intervalRef.current); }}
              className="flex-1 py-4 rounded-xl font-bold text-white text-lg active:scale-95 transition-all"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              ⏸ وەستان
            </button>
          )}
          {timeLeft === 0 && !running && (
            <div className="flex-1 py-4 rounded-xl font-bold text-red-400 text-lg"
              style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)' }}
            >
              ⏰ کات تەواو بوو!
            </div>
          )}
        </div>

        {/* Player list reminder */}
        <div
          className="rounded-2xl p-4 mb-6"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-white/40 text-sm mb-3">یاریزانان</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {game.players.map((p) => (
              <span
                key={p.id}
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#c4b5fd' }}
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={goToVote}
          className="w-full text-white font-black text-xl py-5 rounded-2xl transition-all active:scale-95 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          🗳️ کاتی دەنگدان
        </button>
      </div>
    </main>
  );
}
