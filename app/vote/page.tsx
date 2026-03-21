'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadGame, saveGame } from '@/lib/gameStore';
import { GameState } from '@/lib/types';

export default function VotePage() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);

  useEffect(() => {
    const g = loadGame();
    if (!g) { router.push('/'); return; }
    setGame(g);
    setSelectedVote(null);
  }, [router]);

  if (!game) return null;

  const voter = game.players[game.currentPlayerIndex];
  const candidates = game.players.filter((p) => p.id !== voter.id);
  const votedSoFar = Object.keys(game.votes).length;
  const total = game.players.length;

  function confirmVote() {
    if (!selectedVote || !game) return;
    const updated: GameState = {
      ...game,
      votes: { ...game.votes, [voter.id]: selectedVote },
    };
    const nextIndex = game.currentPlayerIndex + 1;
    if (nextIndex >= game.players.length) {
      updated.phase = 'results';
      saveGame(updated);
      router.push('/results');
    } else {
      updated.currentPlayerIndex = nextIndex;
      saveGame(updated);
      setGame(updated);
      setSelectedVote(null);
    }
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: '#0f0a1e' }}>
      {/* Progress bar */}
      <div className="h-1 w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${(votedSoFar / total) * 100}%`,
            background: 'linear-gradient(90deg, #dc2626, #9f1239)',
          }}
        />
      </div>

      <div className="flex-1 flex flex-col px-5 py-6 overflow-y-auto pb-36">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-purple-300 mb-1">🗳️ دەنگدان</h1>
          <p className="text-white/35 text-sm">{votedSoFar + 1} / {total}</p>
        </div>

        {/* Voter card */}
        <div
          className="rounded-2xl p-4 mb-6 text-center"
          style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.35)' }}
        >
          <p className="text-white/40 text-sm mb-0.5">دەنگدەر</p>
          <p className="text-2xl font-black text-white">{voter.name}</p>
          <p className="text-white/40 text-sm mt-1">کێت گومانت پێیەتی ئیمپۆستەرەکەیە؟</p>
        </div>

        {/* Candidates */}
        <div className="space-y-3">
          {candidates.map((p) => {
            const sel = selectedVote === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedVote(sel ? null : p.id)}
                className="w-full py-5 px-5 rounded-2xl font-bold text-lg active:scale-95 transition-all text-right"
                style={{
                  background: sel ? 'rgba(220,38,38,0.18)' : 'rgba(255,255,255,0.05)',
                  border: sel ? '2px solid rgba(220,38,38,0.55)' : '1px solid rgba(255,255,255,0.1)',
                  color: sel ? '#fca5a5' : 'rgba(255,255,255,0.85)',
                }}
              >
                <span className="ml-2">{sel ? '🎯' : '👤'}</span>
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky confirm */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-3"
        style={{ background: 'linear-gradient(to top, #0f0a1e 70%, transparent)' }}
      >
        <button
          onClick={confirmVote}
          disabled={!selectedVote}
          className="w-full text-white font-black text-xl py-5 rounded-2xl active:scale-95 transition-all shadow-lg disabled:opacity-35 disabled:cursor-not-allowed"
          style={{ background: selectedVote ? 'linear-gradient(135deg, #dc2626, #9f1239)' : 'rgba(255,255,255,0.1)' }}
        >
          {selectedVote ? '✅ دووپاتکردنەوەی دەنگ' : 'یەکێک دیاری بکە...'}
        </button>
      </div>
    </div>
  );
}
