export interface Player {
  id: string;
  name: string;
}

export type GamePhase =
  | 'lobby'
  | 'show-word'
  | 'discussion'
  | 'vote'
  | 'results';

export interface GameState {
  gameId: string;
  players: Player[];
  imposterId: string;
  word: string;
  categoryId: string;
  categoryName: string;
  phase: GamePhase;
  currentPlayerIndex: number;
  votes: Record<string, string>; // voterId -> suspectId
  discussionTime: number; // seconds
  selectedCategories: string[];
  revealedPlayers: string[]; // player ids who already saw their word
}
