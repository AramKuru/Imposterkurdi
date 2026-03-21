'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Player } from '@/lib/types';
import { categories } from '@/lib/words';
import { createNewGame } from '@/lib/gameStore';

export default function LobbyPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categories.map((c) => c.id)
  );
  const [discussionTime, setDiscussionTime] = useState(180);
  const [showCategories, setShowCategories] = useState(false);

  function addPlayer() {
    const name = playerName.trim();
    if (!name || players.length >= 10) return;
    if (players.find((p) => p.name === name)) return;
    setPlayers([...players, { id: Math.random().toString(36).slice(2), name }]);
    setPlayerName('');
  }

  function removePlayer(id: string) {
    setPlayers(players.filter((p) => p.id !== id));
  }

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((c) => c !== id) : prev) : [...prev, id]
    );
  }

  function startGame() {
    if (players.length < 3) return;
    const game = createNewGame(players, selectedCategories, discussionTime);
    router.push('/show-word');
    void game;
  }

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

        {/* Add player */}
        <div
          className="rounded-2xl p-5 mb-5"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <h2 className="text-lg font-bold mb-3 text-purple-200">👥 زیادکردنی یاریزان</h2>
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

          {/* Player list */}
          {players.length > 0 && (
            <div className="mt-4 space-y-2">
              {players.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl px-4 py-2"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}
                >
                  <span className="text-white/40 text-sm">{i + 1}</span>
                  <span className="text-white font-semibold flex-1 text-center">{p.name}</span>
                  <button
                    onClick={() => removePlayer(p.id)}
                    className="text-red-400 hover:text-red-300 text-xl leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
              <p className="text-center text-white/40 text-sm mt-1">
                {players.length} / ١٠ یاریزان
              </p>
            </div>
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
          className="w-full text-white font-black text-2xl py-5 rounded-2xl transition-all duration-150 active:scale-95 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          🚀 دەستپێکردن
        </button>
      </div>
    </main>
  );
}
