'use client';

import { GameState, Player } from './types';
import { categories, getRandomWordFromCategories } from './words';

const GAME_KEY = 'imposter_game_state';
const PLAYERS_KEY = 'imposter_players';
const SETTINGS_KEY = 'imposter_settings';

export interface GameSettings {
  selectedCategories: string[];
  discussionTime: number;
}

const DEFAULT_SETTINGS: GameSettings = {
  selectedCategories: [], // empty = all categories
  discussionTime: 180,
};

export function saveSettings(settings: GameSettings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
}

export function loadSettings(): GameSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<GameSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// ── Per-round game state ──────────────────────────────────────────────────────

export function saveGame(state: GameState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GAME_KEY, JSON.stringify(state));
  }
}

export function loadGame(): GameState | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(GAME_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function clearGame(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GAME_KEY);
  }
}

// ── Persistent players (cross-round) ─────────────────────────────────────────

export function savePlayers(players: Player[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
  }
}

export function loadPlayers(): Player[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(PLAYERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Player[];
  } catch {
    return [];
  }
}

export function clearPlayers(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PLAYERS_KEY);
  }
}

// ── Score computation ─────────────────────────────────────────────────────────

/**
 * Scoring rules:
 *  - Civilian voted for the imposter  → +2
 *  - Civilian voted for someone else  → -1
 *  - Imposter wins (not top-voted)    → +3
 *  - Imposter loses (top-voted)       →  0
 */
export function computeScoreDeltas(game: GameState): Record<string, number> {
  const deltas: Record<string, number> = {};
  game.players.forEach((p) => { deltas[p.id] = 0; });

  // Who got the most votes?
  const voteCounts: Record<string, number> = {};
  Object.values(game.votes).forEach((suspect) => {
    voteCounts[suspect] = (voteCounts[suspect] ?? 0) + 1;
  });
  const maxVotes = Math.max(0, ...Object.values(voteCounts));
  const topVotedIds = Object.entries(voteCounts)
    .filter(([, c]) => c === maxVotes)
    .map(([id]) => id);

  const imposterCaught = topVotedIds.includes(game.imposterId);

  // Score civilians
  game.players.forEach((p) => {
    if (p.id === game.imposterId) return;
    const votedFor = game.votes[p.id];
    if (votedFor === game.imposterId) {
      deltas[p.id] = 2;
    } else {
      deltas[p.id] = -1;
    }
  });

  // Score imposter
  deltas[game.imposterId] = imposterCaught ? 0 : 3;

  return deltas;
}

/** Apply score deltas to the persistent player list and save. Returns updated players. */
export function applyScoresAndSave(
  game: GameState,
  deltas: Record<string, number>
): Player[] {
  const persisted = loadPlayers();
  const updated = persisted.map((p) => ({
    ...p,
    score: p.score + (deltas[p.id] ?? 0),
  }));
  savePlayers(updated);
  return updated;
}

// ── Game factory ──────────────────────────────────────────────────────────────

export function createNewGame(
  players: Player[],
  selectedCategories: string[],
  discussionTime: number
): GameState {
  const cats = selectedCategories.length > 0 ? selectedCategories : categories.map((c) => c.id);
  const { word, category } = getRandomWordFromCategories(cats);

  const imposterIndex = Math.floor(Math.random() * players.length);
  const imposterId = players[imposterIndex].id;

  const state: GameState = {
    gameId: Math.random().toString(36).slice(2, 10),
    players,
    imposterId,
    word,
    categoryId: category.id,
    categoryName: category.nameKu,
    phase: 'show-word',
    currentPlayerIndex: 0,
    votes: {},
    discussionTime,
    selectedCategories: cats,
    revealedPlayers: [],
    scoreDeltas: {},
  };

  saveGame(state);
  return state;
}
