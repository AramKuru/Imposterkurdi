'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  loadGame,
  clearGame,
  computeScoreDeltas,
  applyScoresAndSave,
  saveGame,
} from '@/lib/gameStore';
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
  const [deltas, setDeltas] = useState<Record<string, number>>({});
  const scoresApplied = useRef(false);

  useEffect(() => {
    const g = loadGame();
    if (!g) { router.push('/'); return; }
    setGame(g);
  }, [router]);

  function handleReveal() {
    if (!game || scoresApplied.current) { setRevealed(true); return; }
    scoresApplied.current = true;

    const d = computeScoreDeltas(game);
    applyScoresAndSave(game, d);

    // Persist deltas into game state so they survive re-renders
    const updated: GameState = { ...game, scoreDeltas: d, phase: 'results' };
    saveGame(updated);
    setGame(updated);
    setDeltas(d);
    setRevealed(true);
  }

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

  // Use stored deltas if already applied (e.g. on re-render)
  const activeDeltaMap = Object.keys(deltas).length > 0 ? deltas : game.scoreDeltas;

  function deltaLabel(playerId: string): string {
    const d = activeDeltaMap[playerId];
    if (d === undefined || d === 0) return '';
    return d > 0 ? `+${d}` : `${d}`;
  }
  function deltaColor(playerId: string): string {
    const d = activeDeltaMap[playerId] ?? 0;
    if (d > 0) return '#4ade80';
    if (d < 0) return '#f87171';
    return '#9ca3af';
  }

  return (
    <main className="flex flex-col items-center min-h-screen px-4 py-10">
      <div className="w-full max-w-sm">

        {!revealed ? (
          /* Pre-reveal */
          <div className="text-center mt-20">
            <div className="text-7xl mb-6 animate-bounce">🎭</div>
            <h1 className="text-4xl font-black text-purple-300 mb-4">ئامادەیت؟</h1>
            <p className="text-white/50 mb-10 text-lg">نتیجەکان ئامادەن...</p>
            <button
              onClick={handleReveal}
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
              className="rounded-2xl p-6 mb-5 text-center"
              style={{
                background: impostorCaught ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
                border: impostorCaught ? '2px solid rgba(22,163,74,0.5)' : '2px solid rgba(220,38,38,0.5)',
              }}
            >
              <div className="text-6xl mb-3">{impostorCaught ? '🏆' : '😈'}</div>
              <h2 className="text-3xl font-black mb-2" style={{ color: impostorCaught ? '#4ade80' : '#f87171' }}>
                {impostorCaught ? 'هاوشارەکان بردن!' : 'ئیمپۆستەر بردی!'}
              </h2>
            </div>

            {/* Imposter reveal */}
            <div
              className="rounded-2xl p-5 mb-5 text-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <p className="text-white/40 text-sm mb-1">ئیمپۆستەرەکە بووە</p>
              <div className="flex items-center justify-center gap-3 mb-2">
                <p className="text-3xl font-black text-red-400">{imposter.name} 🎭</p>
                {deltaLabel(imposter.id) && (
                  <span className="font-black text-xl" style={{ color: deltaColor(imposter.id) }}>
                    {deltaLabel(imposter.id)}
                  </span>
                )}
              </div>
              <p className="text-white/50 text-sm">
                پەیامەکە:{' '}
                <span className="text-purple-300 font-bold">{game.word}</span>
                {' '}· بەکت:{' '}
                <span className="text-purple-300 font-bold">{game.categoryName}</span>
              </p>
            </div>

            {/* Vote breakdown with score deltas */}
            <div
              className="rounded-2xl p-5 mb-5"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <h3 className="text-purple-200 font-bold mb-3">🗳️ دەنگەکان و پووینتەکان</h3>
              <div className="space-y-3">
                {voteCounts.map((vc) => {
                  const isImposter = vc.player.id === game.imposterId;
                  const dl = deltaLabel(vc.player.id);
                  return (
                    <div key={vc.player.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-semibold text-sm"
                            style={{ color: isImposter ? '#f87171' : 'white' }}
                          >
                            {vc.player.name} {isImposter ? '🎭' : ''}
                          </span>
                          {dl && (
                            <span className="font-black text-sm" style={{ color: deltaColor(vc.player.id) }}>
                              {dl}
                            </span>
                          )}
                        </div>
                        <span className="text-white/60 text-sm">{vc.count} دەنگ</span>
                      </div>
                      {/* Bar */}
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${game.players.length > 1 ? (vc.count / (game.players.length - 1)) * 100 : 0}%`,
                            background: isImposter ? '#ef4444' : '#7c3aed',
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

            {/* Scoring legend */}
            <div
              className="rounded-2xl p-4 mb-5 text-sm"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-white/40 text-xs mb-2 text-center">سیستەمی پووینت</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-white/50">
                <span>✅ دەنگی دروست</span><span className="text-green-400 font-bold text-left">+٢</span>
                <span>❌ دەنگی هەڵە</span><span className="text-red-400 font-bold text-left">−١</span>
                <span>🎭 ئیمپۆستەر بربێت</span><span className="text-green-400 font-bold text-left">+٣</span>
                <span>🎭 ئیمپۆستەر دەردەکەوێت</span><span className="text-white/40 font-bold text-left">٠</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => { clearGame(); router.push('/'); }}
                className="flex-1 py-4 rounded-xl font-bold text-white/70 transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                🏠 سەرەتا
              </button>
              <button
                onClick={() => { clearGame(); router.push('/lobby'); }}
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
