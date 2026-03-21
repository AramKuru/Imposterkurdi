'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadGame, clearGame } from '@/lib/gameStore';
import { GameState, Player } from '@/lib/types';

interface VoteCount {
  player: Player;
  count: number;
  voters: string[];
}

export default function ResultsPage() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const g = loadGame();
    if (!g) { router.push('/'); return; }
    setGame(g);
  }, [router]);

  if (!game) return null;

  // Tally votes
  const voteCounts: VoteCount[] = game.players.map((p) => {
    const voters = Object.entries(game.votes)
      .filter(([, suspect]) => suspect === p.id)
      .map(([voterId]) => game.players.find((pl) => pl.id === voterId)?.name ?? '');
    return { player: p, count: voters.length, voters };
  });

  voteCounts.sort((a, b) => b.count - a.count);

  const topVoted = voteCounts[0];
  const imposter = game.players.find((p) => p.id === game.imposterId)!;
  const impostorCaught = topVoted.player.id === game.imposterId;

  function playAgain() {
    clearGame();
    router.push('/lobby');
  }

  function goHome() {
    clearGame();
    router.push('/');
  }

  return (
    <main className="flex flex-col items-center min-h-screen px-4 py-10">
      <div className="w-full max-w-sm">

        {!revealed ? (
          /* Pre-reveal dramatic screen */
          <div className="text-center mt-20">
            <div className="text-7xl mb-6 animate-bounce">🎭</div>
            <h1 className="text-4xl font-black text-purple-300 mb-4">ئامادەیت؟</h1>
            <p className="text-white/50 mb-10 text-lg">نتیجەکان ئامادەن...</p>
            <button
              onClick={() => setRevealed(true)}
              className="w-full text-white font-black text-2xl py-5 rounded-2xl transition-all active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              🔍 ئیمپۆستەرەکە ئاشکرابکە!
            </button>
          </div>
        ) : (
          <>
            {/* Win/Lose banner */}
            <div
              className="rounded-2xl p-6 mb-6 text-center"
              style={{
                background: impostorCaught
                  ? 'rgba(22,163,74,0.15)'
                  : 'rgba(220,38,38,0.15)',
                border: impostorCaught
                  ? '2px solid rgba(22,163,74,0.5)'
                  : '2px solid rgba(220,38,38,0.5)',
              }}
            >
              <div className="text-6xl mb-3">{impostorCaught ? '🏆' : '😈'}</div>
              <h2 className="text-3xl font-black mb-2" style={{ color: impostorCaught ? '#4ade80' : '#f87171' }}>
                {impostorCaught ? 'هاوشارەکان بردن!' : 'ئیمپۆستەر بردی!'}
              </h2>
              <p className="text-white/60 text-sm">
                {impostorCaught
                  ? 'ئیمپۆستەرەکە دەرکەوت!'
                  : 'ئیمپۆستەر خۆی شارد'}
              </p>
            </div>

            {/* Imposter reveal */}
            <div
              className="rounded-2xl p-5 mb-5 text-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <p className="text-white/40 text-sm mb-1">ئیمپۆستەرەکە بووە</p>
              <p className="text-3xl font-black text-red-400 mb-2">{imposter.name} 🎭</p>
              <p className="text-white/50 text-sm">
                پەیامەکە:{' '}
                <span className="text-purple-300 font-bold">{game.word}</span>
                {' '}· بەکت:{' '}
                <span className="text-purple-300 font-bold">{game.categoryName}</span>
              </p>
            </div>

            {/* Vote breakdown */}
            <div
              className="rounded-2xl p-5 mb-6"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <h3 className="text-purple-200 font-bold mb-3">🗳️ دەنگەکان</h3>
              <div className="space-y-3">
                {voteCounts.map((vc) => {
                  const isImposter = vc.player.id === game.imposterId;
                  return (
                    <div key={vc.player.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="font-semibold text-sm"
                          style={{ color: isImposter ? '#f87171' : 'white' }}
                        >
                          {vc.player.name} {isImposter ? '🎭' : ''}
                        </span>
                        <span className="text-white/60 text-sm">{vc.count} دەنگ</span>
                      </div>
                      {/* Bar */}
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${game.players.length > 0 ? (vc.count / (game.players.length - 1)) * 100 : 0}%`,
                            background: isImposter ? '#ef4444' : '#7c3aed',
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                      {vc.voters.length > 0 && (
                        <p className="text-white/30 text-xs mt-1">
                          دەنگی: {vc.voters.join('، ')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={goHome}
                className="flex-1 py-4 rounded-xl font-bold text-white/70 transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                🏠 سەرەتا
              </button>
              <button
                onClick={playAgain}
                className="flex-1 py-4 rounded-xl font-bold text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                🔄 یاری تازە
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
