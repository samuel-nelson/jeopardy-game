// Unified game service that switches between Socket.io (local) and Pusher (production)
import { socketService } from './socketService';
import { pusherService } from './pusherService';
import { GameState, Player, Question, Category } from '../types';

const USE_PUSHER = process.env.REACT_APP_USE_PUSHER === 'true' || 
                   (process.env.NODE_ENV === 'production' && process.env.REACT_APP_PUSHER_KEY);

class GameService {
  private currentService: any;

  constructor() {
    this.currentService = USE_PUSHER ? pusherService : socketService;
  }

  connect() {
    if (USE_PUSHER) {
      return pusherService.connect();
    } else {
      return socketService.connect();
    }
  }

  disconnect() {
    if (USE_PUSHER) {
      pusherService.disconnect();
    } else {
      socketService.disconnect();
    }
  }

  generatePlayerId(): string {
    if (USE_PUSHER) {
      return pusherService.generatePlayerId();
    }
    // For Socket.io, the ID comes from the socket
    return `player-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // Room management
  async createRoom(data: { playerName: string; gameMode: 'host' | 'player'; playerLimit: number; questionSet: any; playerId?: string }) {
    if (USE_PUSHER) {
      const playerId = data.playerId || this.generatePlayerId();
      return pusherService.createRoom({ ...data, playerId });
    } else {
      socketService.createRoom(data);
      // Socket.io is event-based, so we return a promise that resolves when room-created event fires
      return new Promise((resolve, reject) => {
        socketService.onRoomCreated((result) => resolve(result));
        socketService.onRoomError((error) => reject(error));
      });
    }
  }

  async joinRoom(data: { roomId: string; playerName: string; playerId?: string }) {
    if (USE_PUSHER) {
      const playerId = data.playerId || this.generatePlayerId();
      return pusherService.joinRoom({ ...data, playerId });
    } else {
      socketService.joinRoom(data);
      return new Promise((resolve, reject) => {
        socketService.onRoomJoined((result) => resolve(result));
        socketService.onRoomError((error) => reject(error));
      });
    }
  }

  async leaveRoom(data?: { roomId?: string; playerId?: string }) {
    if (USE_PUSHER && data) {
      return pusherService.leaveRoom(data);
    } else {
      socketService.leaveRoom();
    }
  }

  // Game actions
  async selectQuestion(data: { categoryId: string; questionId: string; roomId?: string }) {
    if (USE_PUSHER && data.roomId) {
      return pusherService.selectQuestion({ roomId: data.roomId, categoryId: data.categoryId, questionId: data.questionId });
    } else {
      socketService.selectQuestion({ categoryId: data.categoryId, questionId: data.questionId });
    }
  }

  async revealAnswer(data?: { roomId?: string }) {
    if (USE_PUSHER && data?.roomId) {
      return pusherService.revealAnswer(data);
    } else {
      socketService.revealAnswer();
    }
  }

  async closeQuestion(data?: { roomId?: string }) {
    if (USE_PUSHER && data?.roomId) {
      return pusherService.closeQuestion(data);
    } else {
      socketService.closeQuestion();
    }
  }

  async updateScore(data: { playerId: string; points: number; roomId?: string }) {
    if (USE_PUSHER && data.roomId) {
      return pusherService.updateScore({ roomId: data.roomId, playerId: data.playerId, points: data.points });
    } else {
      socketService.updateScore({ playerId: data.playerId, points: data.points });
    }
  }

  // Buzzer
  async buzz(data?: { roomId?: string; playerId?: string; playerName?: string }) {
    if (USE_PUSHER && data?.roomId && data?.playerId && data?.playerName) {
      return pusherService.buzz(data);
    } else {
      socketService.buzz();
    }
  }

  async resetBuzzer(data?: { roomId?: string }) {
    if (USE_PUSHER && data?.roomId) {
      return pusherService.resetBuzzer(data);
    } else {
      socketService.resetBuzzer();
    }
  }

  // Event listeners (Socket.io only - Pusher uses subscribeToRoom)
  onRoomCreated(callback: (data: { roomId: string; gameState: GameState }) => void) {
    if (!USE_PUSHER) {
      socketService.onRoomCreated(callback);
    }
  }

  onRoomJoined(callback: (data: { roomId: string; gameState: GameState }) => void) {
    if (!USE_PUSHER) {
      socketService.onRoomJoined(callback);
    }
  }

  onRoomError(callback: (data: { error: string }) => void) {
    if (!USE_PUSHER) {
      socketService.onRoomError(callback);
    }
  }

  onPlayerJoined(callback: (data: { player: Player; gameState: GameState }) => void) {
    if (!USE_PUSHER) {
      socketService.onPlayerJoined(callback);
    }
  }

  onPlayerLeft(callback: (data: { playerId: string; gameState: GameState }) => void) {
    if (!USE_PUSHER) {
      socketService.onPlayerLeft(callback);
    }
  }

  onQuestionSelected(callback: (data: { question: Question; category: Category; gameState: GameState }) => void) {
    if (!USE_PUSHER) {
      socketService.onQuestionSelected(callback);
    }
  }

  onAnswerRevealed(callback: (data: { answer: string; gameState: GameState }) => void) {
    if (!USE_PUSHER) {
      socketService.onAnswerRevealed(callback);
    }
  }

  onQuestionClosed(callback: (data: { gameState: GameState }) => void) {
    if (!USE_PUSHER) {
      socketService.onQuestionClosed(callback);
    }
  }

  onScoreUpdated(callback: (data: { playerId: string; score: number; gameState: GameState }) => void) {
    if (!USE_PUSHER) {
      socketService.onScoreUpdated(callback);
    }
  }

  onBuzzerPressed(callback: (data: { playerId: string; playerName: string; timestamp: number; gameState: GameState }) => void) {
    if (!USE_PUSHER) {
      socketService.onBuzzerPressed(callback);
    }
  }

  onBuzzerReset(callback: (data: { gameState: GameState }) => void) {
    if (!USE_PUSHER) {
      socketService.onBuzzerReset(callback);
    }
  }

  onBuzzError(callback: (data: { error: string }) => void) {
    if (!USE_PUSHER) {
      socketService.onBuzzError(callback);
    }
  }

  // Subscribe to room (Pusher only)
  subscribeToRoom(roomId: string, callbacks: {
    onRoomCreated?: (data: { roomId: string; gameState: GameState }) => void;
    onRoomJoined?: (data: { roomId: string; gameState: GameState }) => void;
    onPlayerJoined?: (data: { player: Player; gameState: GameState }) => void;
    onPlayerLeft?: (data: { playerId: string; gameState: GameState }) => void;
    onQuestionSelected?: (data: { question: Question; category: Category; gameState: GameState }) => void;
    onAnswerRevealed?: (data: { answer: string; gameState: GameState }) => void;
    onQuestionClosed?: (data: { gameState: GameState }) => void;
    onScoreUpdated?: (data: { playerId: string; score: number; gameState: GameState }) => void;
    onBuzzerPressed?: (data: { playerId: string; playerName: string; timestamp: number; gameState: GameState }) => void;
    onBuzzerReset?: (data: { gameState: GameState }) => void;
    onRoomError?: (data: { error: string }) => void;
  }) {
    if (USE_PUSHER) {
      pusherService.subscribeToRoom(roomId, callbacks);
    }
  }

  getSocket() {
    if (!USE_PUSHER) {
      return socketService.getSocket();
    }
    return null;
  }
}

export const gameService = new GameService();

