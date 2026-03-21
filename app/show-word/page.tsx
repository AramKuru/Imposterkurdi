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
  const progress = game.currentPlayerIndex + 1;

  function handleReveal() {
    setRevealed(true);
  }

  function handleHide() {
    setRevealed(false);
    setDone(true);
  }

  function handleNext() {
    if (!game) return;
    const nextIndex = game.currentPlayerIndex + 1;

    if (nextIndex >= game.players.length) {
      // All players have seen their word
      const updated: GameState = { ...game, phase: 'discussion', currentPlayerIndex: 0 };
      saveGame(updated);
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
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm text-center">
        {/* Progress */}
        <p className="text-white/40 text-sm mb-6">
          یاریزان {progress} لە {total}
        </p>

        {/* Player name */}
        <div className="mb-8">
          <p className="text-white/60 text-lg mb-1">ئێستا دووری</p>
          <h2 className="text-4xl font-black text-purple-300">{currentPlayer.name}</h2>
        </div>

        {!revealed && !done && (
          <>
            <div
              className="rounded-2xl p-8 mb-8"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <p className="text-white/60 text-base leading-relaxed">
                مۆبایلەکە بگرە و دووگمەی خوارەوە دابگرە بۆ دیتنی پەیامەکەت
              </p>
              <p className="text-white/40 text-sm mt-2">هیچ کەسی تر نەبینێتەوە</p>
            </div>
            <button
              onPointerDown={handleReveal}
              className="w-full text-white font-black text-2xl py-6 rounded-2xl transition-all active:scale-95 shadow-xl"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              👁️ پەیامەکەم ببینم
            </button>
          </>
        )}

        {revealed && !done && (
          <>
            <div
              className="rounded-2xl p-8 mb-8 text-center"
              style={{
                background: isImposter
                  ? 'rgba(220,38,38,0.15)'
                  : 'rgba(22,163,74,0.15)',
                border: isImposter
                  ? '2px solid rgba(220,38,38,0.5)'
                  : '2px solid rgba(22,163,74,0.5)',
              }}
            >
              {isImposter ? (
                <>
                  <div className="text-5xl mb-3">🎭</div>
                  <p className="text-red-400 font-bold text-lg mb-1">تۆ ئیمپۆستەریت!</p>
                  <p className="text-white/50 text-sm mb-3">بەکتی پەیامەکە:</p>
                  <p className="text-yellow-300 font-black text-4xl">{game.categoryName}</p>
                  <p className="text-white/40 text-sm mt-3">خۆت بشارێتەوە — پەیامەکە نازانیت</p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-3">🔑</div>
                  <p className="text-green-400 font-bold text-lg mb-1">پەیامەکەت:</p>
                  <p className="text-white font-black text-5xl mt-2">{game.word}</p>
                  <p className="text-white/40 text-sm mt-3">بەکت: {game.categoryName}</p>
                </>
              )}
            </div>
            <button
              onClick={handleHide}
              className="w-full text-white font-black text-xl py-5 rounded-2xl transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              ✅ تێگەیشتم، داخستن
            </button>
          </>
        )}

        {done && (
          <>
            <div
              className="rounded-2xl p-6 mb-8"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="text-4xl mb-2">👍</div>
              <p className="text-white/70 text-lg">
                {game.currentPlayerIndex + 1 < total
                  ? 'مۆبایلەکە بدە بە یاریزانی داهاتوو'
                  : 'هەموو یاریزانان پەیامیان بینی!'}
              </p>
            </div>
            <button
              onClick={handleNext}
              className="w-full text-white font-black text-2xl py-5 rounded-2xl transition-all active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              {game.currentPlayerIndex + 1 < total ? '➡️ یاریزانی داهاتوو' : '🗣️ دەستپێکردنی باس'}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
