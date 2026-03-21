'use client';

import { GameState, Player } from './types';
import { categories, getRandomWordFromCategories } from './words';

const STORAGE_KEY = 'imposter_game_state';

export function saveGame(state: GameState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export function loadGame(): GameState | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function clearGame(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

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
  };

  saveGame(state);
  return state;
}
