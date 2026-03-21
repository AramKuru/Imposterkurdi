'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadGame, saveGame } from '@/lib/gameStore';
import { GameState } from '@/lib/types';

export default function ShowWordPage() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const g = loadGame();
    if (!g) { router.push('/'); return; }
    setGame(g);
  }, [router]);

  if (!game) return null;

  const currentPlayer = game.players[game.currentPlayerIndex];
  const isImposter = currentPlayer.id === game.imposterId;
  const total = game.players.length;

  function handleReveal() { setRevealed(true); }
  function handleHide() { setRevealed(false); setDone(true); }

  function handleNext() {
    if (!game) return;
    const nextIndex = game.currentPlayerIndex + 1;
    if (nextIndex >= game.players.length) {
      saveGame({ ...game, phase: 'discussion', currentPlayerIndex: 0 });
      router.push('/discuss');
    } else {
      const updated: GameState = {
        ...game,
        currentPlayerIndex: nextIndex,
        revealedPlayers: [...game.revealedPlayers, currentPlayer.id],
      };
      saveGame(updated);
      setGame(updated);
      setRevealed(false);
      setDone(false);
    }
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: '#0f0a1e' }}>
      {/* Progress bar */}
      <div className="h-1 w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${((game.currentPlayerIndex) / total) * 100}%`,
            background: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
          }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        {/* Step indicator */}
        <p className="text-white/35 text-sm mb-8 tracking-wide">
          {game.currentPlayerIndex + 1} / {total}
        </p>

        {/* Player name */}
        <div className="text-center mb-10">
          <p className="text-white/50 text-lg mb-1">دووری</p>
          <h2 className="text-5xl font-black text-white">{currentPlayer.name}</h2>
        </div>

        {/* ── Not yet revealed ── */}
        {!revealed && !done && (
          <div className="w-full max-w-sm flex flex-col items-center gap-6">
            <div
              className="w-full rounded-2xl p-6 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="text-4xl mb-3">🤫</div>
              <p className="text-white/55 text-base leading-relaxed">
                مۆبایلەکە بگرە، دوورگرەوە لە کەسانی تر، دوگمەی خوارەوە دابگرە
              </p>
            </div>
            <button
              onPointerDown={handleReveal}
              className="w-full text-white font-black text-xl py-6 rounded-2xl active:scale-95 transition-all shadow-xl"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              👁️ پەیامەکەم ببینم
            </button>
          </div>
        )}

        {/* ── Revealed ── */}
        {revealed && !done && (
          <div className="w-full max-w-sm flex flex-col items-center gap-5">
            <div
              className="w-full rounded-2xl p-7 text-center"
              style={{
                background: isImposter ? 'rgba(220,38,38,0.12)' : 'rgba(22,163,74,0.12)',
                border: isImposter ? '2px solid rgba(220,38,38,0.45)' : '2px solid rgba(22,163,74,0.45)',
              }}
            >
              {isImposter ? (
                <>
                  <div className="text-5xl mb-3">🎭</div>
                  <p className="text-red-400 font-bold text-lg mb-4">تۆ ئیمپۆستەریت!</p>
                  <p className="text-white/40 text-sm mb-2">تەنیا بەکت دەزانیت:</p>
                  <p className="text-yellow-300 font-black text-4xl">{game.categoryName}</p>
                  <p className="text-white/35 text-sm mt-4">پەیامی ڕاستەقینە نازانیت — خۆت بشارێتەوە</p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-3">🔑</div>
                  <p className="text-green-400 font-bold text-lg mb-4">پەیامەکەت:</p>
                  <p className="text-white font-black text-5xl leading-tight">{game.word}</p>
                  <p className="text-white/35 text-sm mt-4">بەکت: {game.categoryName}</p>
                </>
              )}
            </div>
            <button
              onClick={handleHide}
              className="w-full text-white/80 font-bold text-lg py-5 rounded-2xl active:scale-95 transition-all"
              style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              ✅ تێگەیشتم، داخستن
            </button>
          </div>
        )}

        {/* ── Done, pass phone ── */}
        {done && (
          <div className="w-full max-w-sm flex flex-col items-center gap-5">
            <div
              className="w-full rounded-2xl p-6 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="text-4xl mb-2">📱</div>
              <p className="text-white/65 text-lg leading-relaxed">
                {game.currentPlayerIndex + 1 < total
                  ? 'مۆبایلەکە بدە بە یاریزانی داهاتوو'
                  : 'هەموو یاریزانان پەیامیان بینی!'}
              </p>
            </div>
            <button
              onClick={handleNext}
              className="w-full text-white font-black text-xl py-6 rounded-2xl active:scale-95 transition-all shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              {game.currentPlayerIndex + 1 < total ? '➡️ یاریزانی داهاتوو' : '🗣️ دەستپێکردنی باس'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
