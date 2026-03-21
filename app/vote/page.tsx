'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadGame, saveGame } from '@/lib/gameStore';
import { GameState } from '@/lib/types';

export default function VotePage() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const g = loadGame();
    if (!g) { router.push('/'); return; }
    setGame(g);
    setSelectedVote(null);
    setConfirmed(false);
  }, [router]);

  if (!game) return null;

  const voter = game.players[game.currentPlayerIndex];
  const candidates = game.players.filter((p) => p.id !== voter.id);
  const totalVoters = game.players.length;
  const votedSoFar = Object.keys(game.votes).length;

  function confirmVote() {
    if (!selectedVote || !game) return;
    const updated: GameState = {
      ...game,
      votes: { ...game.votes, [voter.id]: selectedVote },
    };

    const nextIndex = game.currentPlayerIndex + 1;

    if (nextIndex >= game.players.length) {
      // All voted — go to results
      updated.phase = 'results';
      saveGame(updated);
      router.push('/results');
    } else {
      updated.currentPlayerIndex = nextIndex;
      saveGame(updated);
      setGame(updated);
      setSelectedVote(null);
      setConfirmed(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-purple-300 mb-1">🗳️ دەنگدان</h1>
          <p className="text-white/40 text-sm">
            دەنگ {votedSoFar + 1} لە {totalVoters}
          </p>
        </div>

        {/* Voter */}
        <div
          className="rounded-2xl p-4 mb-5 text-center"
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.4)' }}
        >
          <p className="text-white/50 text-sm mb-1">دەنگدەر</p>
          <p className="text-2xl font-black text-white">{voter.name}</p>
          <p className="text-white/40 text-sm mt-1">کێت گومانت پێیەتی ئیمپۆستەرەکەیە؟</p>
        </div>

        {/* Candidates */}
        <div className="space-y-3 mb-6">
          {candidates.map((p) => {
            const isSelected = selectedVote === p.id;
            return (
              <button
                key={p.id}
                onClick={() => !confirmed && setSelectedVote(p.id)}
                className="w-full py-4 px-5 rounded-2xl font-bold text-lg transition-all active:scale-95 text-right"
                style={{
                  background: isSelected ? 'rgba(220,38,38,0.2)' : 'rgba(255,255,255,0.06)',
                  border: isSelected ? '2px solid rgba(220,38,38,0.6)' : '1px solid rgba(255,255,255,0.1)',
                  color: isSelected ? '#fca5a5' : 'white',
                }}
              >
                {isSelected ? '🎯 ' : '👤 '}{p.name}
              </button>
            );
          })}
        </div>

        <button
          onClick={confirmVote}
          disabled={!selectedVote}
          className="w-full text-white font-black text-xl py-5 rounded-2xl transition-all active:scale-95 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #dc2626, #9f1239)' }}
        >
          ✅ دووپاتکردنەوەی دەنگ
        </button>
      </div>
    </main>
  );
}
