'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Player } from '@/lib/types';
import { categories } from '@/lib/words';
import { createNewGame, loadPlayers, savePlayers, clearPlayers, clearGame } from '@/lib/gameStore';

export default function LobbyPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categories.map((c) => c.id)
  );
  const [discussionTime, setDiscussionTime] = useState(180);
  const [showCategories, setShowCategories] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load persisted players on mount
  useEffect(() => {
    clearGame();
    const saved = loadPlayers();
    if (saved.length > 0) setPlayers(saved);
  }, []);

  function addPlayer() {
    const name = playerName.trim();
    if (!name || players.length >= 10) return;
    if (players.find((p) => p.name === name)) return;
    const updated = [...players, { id: Math.random().toString(36).slice(2), name, score: 0 }];
    setPlayers(updated);
    savePlayers(updated);
    setPlayerName('');
  }

  function removePlayer(id: string) {
    const updated = players.filter((p) => p.id !== id);
    setPlayers(updated);
    savePlayers(updated);
  }

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((c) => c !== id) : prev) : [...prev, id]
    );
  }

  function startGame() {
    if (players.length < 3) return;
    createNewGame(players, selectedCategories, discussionTime);
    router.push('/show-word');
  }

  function handleReset() {
    clearPlayers();
    clearGame();
    setPlayers([]);
    setShowResetConfirm(false);
  }

  // Sorted for leaderboard display
  const ranked = [...players].sort((a, b) => b.score - a.score);
  const hasScores = players.some((p) => p.score !== 0);

  return (
    <main className="flex flex-col items-center min-h-screen px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button onClick={() => router.push('/')} className="text-white/50 hover:text-white text-2xl ml-3">
            ←
          </button>
          <h1 className="text-3xl font-black text-purple-300">🎯 ئامادەکردنی یاری</h1>
        </div>

        {/* Leaderboard — only shown once there are scores */}
        {players.length > 0 && (
          <div
            className="rounded-2xl p-5 mb-5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <h2 className="text-lg font-bold mb-3 text-purple-200">
              {hasScores ? '🏆 لیستی پووینتەکان' : '👥 یاریزانان'}
            </h2>
            <div className="space-y-2">
              {ranked.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-2"
                  style={{
                    background: i === 0 && hasScores ? 'rgba(234,179,8,0.12)' : 'rgba(124,58,237,0.12)',
                    border: i === 0 && hasScores ? '1px solid rgba(234,179,8,0.3)' : '1px solid rgba(124,58,237,0.25)',
                  }}
                >
                  {/* Rank medal */}
                  <span className="text-base w-6 text-center">
                    {hasScores ? (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`) : `${i + 1}`}
                  </span>
                  <span className="flex-1 text-white font-semibold">{p.name}</span>
                  {hasScores && (
                    <span
                      className="font-black text-lg"
                      style={{ color: p.score > 0 ? '#4ade80' : p.score < 0 ? '#f87171' : '#9ca3af' }}
                    >
                      {p.score > 0 ? '+' : ''}{p.score}
                    </span>
                  )}
                  <button
                    onClick={() => removePlayer(p.id)}
                    className="text-white/30 hover:text-red-400 text-xl leading-none transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add player */}
        <div
          className="rounded-2xl p-5 mb-5"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <h2 className="text-lg font-bold mb-3 text-purple-200">
            {players.length === 0 ? '👥 زیادکردنی یاریزان' : '➕ زیادکردنی یاریزانی تازە'}
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
              placeholder="ناوی یاریزان..."
              className="flex-1 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              maxLength={20}
            />
            <button
              onClick={addPlayer}
              disabled={!playerName.trim() || players.length >= 10}
              className="px-5 py-3 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-40"
              style={{ background: '#7c3aed' }}
            >
              +
            </button>
          </div>
          {players.length > 0 && (
            <p className="text-center text-white/30 text-xs mt-2">{players.length} / ١٠ یاریزان</p>
          )}
        </div>

        {/* Discussion time */}
        <div
          className="rounded-2xl p-5 mb-5"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <h2 className="text-lg font-bold mb-3 text-purple-200">⏱️ کاتی باسکردن</h2>
          <div className="flex gap-2 justify-center">
            {[60, 120, 180, 300].map((t) => (
              <button
                key={t}
                onClick={() => setDiscussionTime(t)}
                className="flex-1 py-2 rounded-xl font-bold transition-all text-sm"
                style={{
                  background: discussionTime === t ? '#7c3aed' : 'rgba(255,255,255,0.08)',
                  border: discussionTime === t ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.1)',
                  color: discussionTime === t ? 'white' : 'rgba(255,255,255,0.6)',
                }}
              >
                {t / 60} خولەک
              </button>
            ))}
          </div>
        </div>

        {/* Categories toggle */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="w-full flex items-center justify-between text-purple-200 font-bold text-lg"
          >
            <span>{showCategories ? '▲' : '▼'}</span>
            <span>🗂️ دیاریکردنی بەکتەکان ({selectedCategories.length}/{categories.length})</span>
          </button>

          {showCategories && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const active = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className="py-2 px-3 rounded-xl text-sm font-semibold transition-all text-right"
                    style={{
                      background: active ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
                      border: active ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.1)',
                      color: active ? 'white' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {active ? '✓ ' : ''}{cat.nameKu}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Start */}
        {players.length < 3 && (
          <p className="text-center text-yellow-400/70 text-sm mb-3">
            ⚠️ کەمی ٣ یاریزان پێویستە
          </p>
        )}
        <button
          onClick={startGame}
          disabled={players.length < 3}
          className="w-full text-white font-black text-2xl py-5 rounded-2xl transition-all duration-150 active:scale-95 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed mb-4"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          🚀 دەستپێکردن
        </button>

        {/* Settings / Reset */}
        {players.length > 0 && (
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 className="text-white/40 text-sm font-bold mb-3 text-center">⚙️ ڕیکخستن</h3>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-3 rounded-xl text-red-400/70 hover:text-red-400 font-semibold text-sm transition-colors"
                style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}
              >
                🗑️ سڕینەوەی هەموو یاریزانان و پووینتەکان
              </button>
            ) : (
              <div className="text-center">
                <p className="text-white/60 text-sm mb-3">دڵنیایت؟ هەموو پووینتەکان سڕاوەتەوە</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-white/60 text-sm transition-all active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    گەڕانەوە
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95"
                    style={{ background: 'rgba(220,38,38,0.5)', border: '1px solid rgba(220,38,38,0.6)' }}
                  >
                    بەڵێ، سڕینەوە
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
