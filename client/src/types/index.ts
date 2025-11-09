export interface Question {
  id: string;
  question: string;
  answer: string;
  value: number;
  answered: boolean;
}

export interface Category {
  id: string;
  name: string;
  questions: Question[];
}

export interface QuestionSet {
  id: string;
  name: string;
  categories: Category[];
  createdAt?: string;
  isDefault?: boolean;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost?: boolean;
}

export interface GameState {
  roomId: string;
  players: Player[];
  currentQuestion: Question | null;
  currentCategory: Category | null;
  buzzerActive: boolean;
  buzzerWinner: string | null;
  gameMode: 'host' | 'player';
  playerLimit: number;
  questionSet: QuestionSet | null;
  scores: Record<string, number>;
}

export interface BuzzerEvent {
  playerId: string;
  playerName: string;
  timestamp: number;
}

