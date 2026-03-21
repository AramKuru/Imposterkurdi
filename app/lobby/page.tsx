'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Player } from '@/lib/types';
import { categories } from '@/lib/words';
import {
  createNewGame,
  loadPlayers,
  savePlayers,
  clearPlayers,
  clearGame,
  loadSettings,
  saveSettings,
} from '@/lib/gameStore';

export default function LobbyPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);

  // Settings — persisted separately, never auto-reset
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [discussionTime, setDiscussionTime] = useState(180);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    clearGame();
    const savedPlayers = loadPlayers();
    if (savedPlayers.length > 0) setPlayers(savedPlayers);

    const s = loadSettings();
    setSelectedCategories(s.selectedCategories.length > 0 ? s.selectedCategories : categories.map((c) => c.id));
    setDiscussionTime(s.discussionTime);
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
    const next = selectedCategories.includes(id)
      ? selectedCategories.length > 1 ? selectedCategories.filter((c) => c !== id) : selectedCategories
      : [...selectedCategories, id];
    setSelectedCategories(next);
    saveSettings({ selectedCategories: next, discussionTime });
  }

  function setTime(t: number) {
    setDiscussionTime(t);
    saveSettings({ selectedCategories, discussionTime: t });
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

  const ranked = [...players].sort((a, b) => b.score - a.score);
  const hasScores = players.some((p) => p.score !== 0);
  const allSelected = selectedCategories.length === categories.length;

  return (
    <div
      className="flex flex-col min-h-dvh"
      style={{ background: '#0f0a1e' }}
    >
      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-4 pt-5 pb-3">
        <button
          onClick={() => router.push('/')}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-white/50 active:text-white active:bg-white/10 transition-colors text-xl"
        >
          ←
        </button>
        <h1 className="flex-1 text-2xl font-black text-purple-300">🎯 ئامادەکردنی یاری</h1>
        {/* Settings gear */}
        <button
          onClick={() => { setShowSettings(!showSettings); setShowResetConfirm(false); }}
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors text-xl"
          style={{
            background: showSettings ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.07)',
            color: showSettings ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
          }}
        >
          ⚙️
        </button>
      </header>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-36">

        {/* ─ Settings panel (slide-in) ─ */}
        {showSettings && (
          <div
            className="rounded-2xl p-4 mb-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {/* Discussion time */}
            <p className="text-purple-200 font-bold text-base mb-3">⏱️ کاتی باسکردن</p>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[60, 120, 180, 300].map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className="py-3 rounded-xl font-bold text-sm active:scale-95 transition-all"
                  style={{
                    background: discussionTime === t ? '#7c3aed' : 'rgba(255,255,255,0.07)',
                    border: discussionTime === t ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.1)',
                    color: discussionTime === t ? 'white' : 'rgba(255,255,255,0.55)',
                  }}
                >
                  {t / 60}م
                </button>
              ))}
            </div>

            {/* Categories */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-purple-200 font-bold text-base">🗂️ بەکتەکان</p>
              <button
                onClick={() => {
                  const next = allSelected ? [categories[0].id] : categories.map((c) => c.id);
                  setSelectedCategories(next);
                  saveSettings({ selectedCategories: next, discussionTime });
                }}
                className="text-xs px-3 py-1 rounded-lg font-semibold transition-all"
                style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}
              >
                {allSelected ? 'هیچیان نەبژێرە' : 'هەموویان بژێرە'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const active = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className="py-3 px-3 rounded-xl text-sm font-semibold transition-all active:scale-95 text-right"
                    style={{
                      background: active ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)',
                      border: active ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(255,255,255,0.08)',
                      color: active ? '#e9d5ff' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {active ? '✓ ' : ''}{cat.nameKu}
                  </button>
                );
              })}
            </div>
            <p className="text-center text-white/30 text-xs mt-3">
              {selectedCategories.length} / {categories.length} بەکت دیاریکراوە
            </p>

            {/* Reset players */}
            <div
              className="mt-5 pt-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-3 rounded-xl font-semibold text-sm active:scale-95 transition-all"
                  style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: 'rgba(252,165,165,0.8)' }}
                >
                  🗑️ سڕینەوەی یاریزانان و پووینتەکان
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-white/50 text-sm mb-3">دڵنیایت؟ هەموو پووینتەکان سڕاوەتەوە</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 py-3 rounded-xl font-bold text-white/60 text-sm active:scale-95 transition-all"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                      گەڕانەوە
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 py-3 rounded-xl font-bold text-white text-sm active:scale-95 transition-all"
                      style={{ background: 'rgba(220,38,38,0.55)', border: '1px solid rgba(220,38,38,0.6)' }}
                    >
                      بەڵێ، سڕینەوە
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─ Leaderboard / Players ─ */}
        {players.length > 0 && (
          <div
            className="rounded-2xl p-4 mb-4"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <h2 className="text-base font-bold mb-3 text-purple-200">
              {hasScores ? '🏆 پووینتەکان' : '👥 یاریزانان'}
            </h2>
            <div className="space-y-2">
              {ranked.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-3"
                  style={{
                    background: i === 0 && hasScores ? 'rgba(234,179,8,0.1)' : 'rgba(124,58,237,0.1)',
                    border: i === 0 && hasScores ? '1px solid rgba(234,179,8,0.25)' : '1px solid rgba(124,58,237,0.2)',
                  }}
                >
                  <span className="text-base w-7 text-center shrink-0">
                    {hasScores ? (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`) : `${i + 1}`}
                  </span>
                  <span className="flex-1 text-white font-semibold text-base truncate">{p.name}</span>
                  {hasScores && (
                    <span
                      className="font-black text-lg shrink-0"
                      style={{ color: p.score > 0 ? '#4ade80' : p.score < 0 ? '#f87171' : '#9ca3af' }}
                    >
                      {p.score > 0 ? '+' : ''}{p.score}
                    </span>
                  )}
                  <button
                    onClick={() => removePlayer(p.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 active:text-red-400 active:bg-red-400/10 transition-colors text-xl shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─ Add player ─ */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <h2 className="text-base font-bold mb-3 text-purple-200">
            {players.length === 0 ? '👥 زیادکردنی یاریزان' : '➕ یاریزانی تازە'}
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
              placeholder="ناوی یاریزان..."
              className="flex-1 rounded-xl px-4 py-4 text-white text-base focus:outline-none focus:ring-2 focus:ring-purple-400"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.18)',
                fontSize: '16px', // prevents iOS zoom
              }}
              maxLength={20}
              autoComplete="off"
              autoCapitalize="words"
            />
            <button
              onClick={addPlayer}
              disabled={!playerName.trim() || players.length >= 10}
              className="w-14 rounded-xl font-black text-white text-2xl active:scale-95 transition-all disabled:opacity-40"
              style={{ background: '#7c3aed' }}
            >
              +
            </button>
          </div>
          {players.length > 0 && (
            <p className="text-center text-white/25 text-xs mt-2">{players.length} / ١٠</p>
          )}
        </div>
      </div>

      {/* ── Sticky bottom start button ── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3"
        style={{ background: 'linear-gradient(to top, #0f0a1e 70%, transparent)' }}
      >
        {players.length < 3 && players.length > 0 && (
          <p className="text-center text-yellow-400/70 text-sm mb-2">
            ⚠️ کەمی ٣ یاریزان پێویستە
          </p>
        )}
        <button
          onClick={startGame}
          disabled={players.length < 3}
          className="w-full text-white font-black text-xl py-5 rounded-2xl active:scale-95 transition-all shadow-2xl disabled:opacity-35 disabled:cursor-not-allowed"
          style={{ background: players.length >= 3 ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'rgba(255,255,255,0.1)' }}
        >
          {players.length < 3 ? '👥 زیادکردنی یاریزان...' : `🚀 دەستپێکردن — ${players.length} یاریزان`}
        </button>
      </div>
    </div>
  );
}
