import { io, Socket } from 'socket.io-client';
import { GameState, Player, Question, Category } from '../types';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io(SOCKET_URL);
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Room management
  createRoom(data: { playerName: string; gameMode: 'host' | 'player'; playerLimit: number; questionSet: any }) {
    this.socket?.emit('create-room', data);
  }

  joinRoom(data: { roomId: string; playerName: string }) {
    this.socket?.emit('join-room', data);
  }

  leaveRoom() {
    this.socket?.emit('leave-room');
  }

  // Game actions
  selectQuestion(data: { categoryId: string; questionId: string }) {
    this.socket?.emit('select-question', data);
  }

  revealAnswer() {
    this.socket?.emit('reveal-answer');
  }

  closeQuestion() {
    this.socket?.emit('close-question');
  }

  updateScore(data: { playerId: string; points: number }) {
    this.socket?.emit('update-score', data);
  }

  // Buzzer
  buzz() {
    this.socket?.emit('buzz');
  }

  resetBuzzer() {
    this.socket?.emit('reset-buzzer');
  }

  // Event listeners
  onRoomCreated(callback: (data: { roomId: string; gameState: GameState }) => void) {
    this.socket?.on('room-created', callback);
  }

  onRoomJoined(callback: (data: { roomId: string; gameState: GameState }) => void) {
    this.socket?.on('room-joined', callback);
  }

  onRoomError(callback: (data: { error: string }) => void) {
    this.socket?.on('room-error', callback);
  }

  onPlayerJoined(callback: (data: { player: Player; gameState: GameState }) => void) {
    this.socket?.on('player-joined', callback);
  }

  onPlayerLeft(callback: (data: { playerId: string; gameState: GameState }) => void) {
    this.socket?.on('player-left', callback);
  }

  onQuestionSelected(callback: (data: { question: Question; category: Category; gameState: GameState }) => void) {
    this.socket?.on('question-selected', callback);
  }

  onAnswerRevealed(callback: (data: { answer: string; gameState: GameState }) => void) {
    this.socket?.on('answer-revealed', callback);
  }

  onQuestionClosed(callback: (data: { gameState: GameState }) => void) {
    this.socket?.on('question-closed', callback);
  }

  onScoreUpdated(callback: (data: { playerId: string; score: number; gameState: GameState }) => void) {
    this.socket?.on('score-updated', callback);
  }

  onBuzzerPressed(callback: (data: { playerId: string; playerName: string; timestamp: number; gameState: GameState }) => void) {
    this.socket?.on('buzzer-pressed', callback);
  }

  onBuzzerReset(callback: (data: { gameState: GameState }) => void) {
    this.socket?.on('buzzer-reset', callback);
  }

  onBuzzError(callback: (data: { error: string }) => void) {
    this.socket?.on('buzz-error', callback);
  }

  // Remove listeners
  off(event: string, callback?: any) {
    this.socket?.off(event, callback);
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();

