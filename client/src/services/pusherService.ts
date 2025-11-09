// Pusher service for real-time WebSocket functionality
// Alternative to Socket.io for Netlify deployment

import Pusher from 'pusher-js';
import { GameState, Player, Question, Category } from '../types';

const PUSHER_KEY = process.env.REACT_APP_PUSHER_KEY || '';
const PUSHER_CLUSTER = process.env.REACT_APP_PUSHER_CLUSTER || 'us2';

class PusherService {
  private pusher: Pusher | null = null;
  private channel: any = null;

  connect() {
    if (!PUSHER_KEY) {
      console.error('Pusher key not configured');
      return null;
    }

    this.pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: true
    });

    return this.pusher;
  }

  disconnect() {
    if (this.channel) {
      this.channel.unbind_all();
      this.pusher?.unsubscribe(this.channel.name);
    }
    this.pusher?.disconnect();
    this.pusher = null;
    this.channel = null;
  }

  // Subscribe to room channel
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
    if (!this.pusher) {
      this.connect();
    }

    this.channel = this.pusher?.subscribe(`room-${roomId}`);

    if (callbacks.onPlayerJoined) {
      this.channel?.bind('player-joined', callbacks.onPlayerJoined);
    }
    if (callbacks.onPlayerLeft) {
      this.channel?.bind('player-left', callbacks.onPlayerLeft);
    }
    if (callbacks.onQuestionSelected) {
      this.channel?.bind('question-selected', callbacks.onQuestionSelected);
    }
    if (callbacks.onAnswerRevealed) {
      this.channel?.bind('answer-revealed', callbacks.onAnswerRevealed);
    }
    if (callbacks.onQuestionClosed) {
      this.channel?.bind('question-closed', callbacks.onQuestionClosed);
    }
    if (callbacks.onScoreUpdated) {
      this.channel?.bind('score-updated', callbacks.onScoreUpdated);
    }
    if (callbacks.onBuzzerPressed) {
      this.channel?.bind('buzzer-pressed', callbacks.onBuzzerPressed);
    }
    if (callbacks.onBuzzerReset) {
      this.channel?.bind('buzzer-reset', callbacks.onBuzzerReset);
    }
  }

  // Generate a unique player ID
  generatePlayerId(): string {
    return `player-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // Trigger events via Netlify Function
  async triggerEvent(event: string, data: any) {
    const response = await fetch('/.netlify/functions/pusher-trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data })
    });
    return response.json();
  }

  // Room management
  async createRoom(data: { playerName: string; gameMode: 'host' | 'player'; playerLimit: number; questionSet: any }) {
    return this.triggerEvent('create-room', data);
  }

  async joinRoom(data: { roomId: string; playerName: string }) {
    return this.triggerEvent('join-room', data);
  }

  async leaveRoom(data: { roomId: string; playerId: string }) {
    return this.triggerEvent('leave-room', data);
  }

  // Game actions
  async selectQuestion(data: { roomId: string; categoryId: string; questionId: string }) {
    return this.triggerEvent('select-question', data);
  }

  async revealAnswer(data: { roomId: string }) {
    return this.triggerEvent('reveal-answer', data);
  }

  async closeQuestion(data: { roomId: string }) {
    return this.triggerEvent('close-question', data);
  }

  async updateScore(data: { roomId: string; playerId: string; points: number }) {
    return this.triggerEvent('update-score', data);
  }

  // Buzzer
  async buzz(data: { roomId: string; playerId: string; playerName: string }) {
    return this.triggerEvent('buzz', data);
  }

  async resetBuzzer(data: { roomId: string }) {
    return this.triggerEvent('reset-buzzer', data);
  }
}

export const pusherService = new PusherService();

