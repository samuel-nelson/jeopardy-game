import { v4 as uuidv4 } from 'uuid';

// Store game rooms
const gameRooms = new Map();

// Store socket to room mapping
const socketToRoom = new Map();

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Create a new game room
    socket.on('create-room', (data) => {
      const { playerName, gameMode, playerLimit, questionSet } = data;
      const roomId = uuidv4().substring(0, 6).toUpperCase();
      
      const gameState = {
        roomId,
        players: [{
          id: socket.id,
          name: playerName,
          score: 0,
          isHost: true
        }],
        currentQuestion: null,
        currentCategory: null,
        buzzerActive: false,
        buzzerWinner: null,
        gameMode: gameMode || 'host',
        playerLimit: playerLimit || 6,
        questionSet: questionSet || null,
        scores: {},
        revealedQuestions: new Set()
      };

      gameRooms.set(roomId, gameState);
      socketToRoom.set(socket.id, roomId);
      socket.join(roomId);

      socket.emit('room-created', { roomId, gameState });
      console.log(`Room created: ${roomId} by ${playerName}`);
    });

    // Join an existing room
    socket.on('join-room', (data) => {
      const { roomId, playerName } = data;
      const gameState = gameRooms.get(roomId);

      if (!gameState) {
        socket.emit('room-error', { error: 'Room not found' });
        return;
      }

      if (gameState.players.length >= gameState.playerLimit) {
        socket.emit('room-error', { error: 'Room is full' });
        return;
      }

      if (gameState.players.some(p => p.name === playerName)) {
        socket.emit('room-error', { error: 'Name already taken' });
        return;
      }

      const newPlayer = {
        id: socket.id,
        name: playerName,
        score: 0,
        isHost: false
      };

      gameState.players.push(newPlayer);
      gameState.scores[socket.id] = 0;
      socketToRoom.set(socket.id, roomId);
      socket.join(roomId);

      io.to(roomId).emit('player-joined', { player: newPlayer, gameState });
      socket.emit('room-joined', { roomId, gameState });
      console.log(`${playerName} joined room ${roomId}`);
    });

    // Leave room
    socket.on('leave-room', () => {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId) return;

      const gameState = gameRooms.get(roomId);
      if (!gameState) return;

      const playerIndex = gameState.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const wasHost = gameState.players[playerIndex].isHost;
        gameState.players.splice(playerIndex, 1);
        delete gameState.scores[socket.id];

        // If host left, assign new host
        if (wasHost && gameState.players.length > 0) {
          gameState.players[0].isHost = true;
        }

        socketToRoom.delete(socket.id);
        socket.leave(roomId);

        if (gameState.players.length === 0) {
          gameRooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty)`);
        } else {
          io.to(roomId).emit('player-left', { playerId: socket.id, gameState });
        }
      }
    });

    // Select question
    socket.on('select-question', (data) => {
      const { categoryId, questionId } = data;
      const roomId = socketToRoom.get(socket.id);
      if (!roomId) return;

      const gameState = gameRooms.get(roomId);
      if (!gameState) return;

      const player = gameState.players.find(p => p.id === socket.id);
      if (!player || (!player.isHost && gameState.gameMode === 'host')) {
        return;
      }

      if (!gameState.questionSet) return;

      const category = gameState.questionSet.categories.find(c => c.id === categoryId);
      if (!category) return;

      const question = category.questions.find(q => q.id === questionId);
      if (!question || question.answered) return;

      question.answered = true;
      gameState.currentQuestion = question;
      gameState.currentCategory = category;
      gameState.buzzerActive = false;
      gameState.buzzerWinner = null;

      io.to(roomId).emit('question-selected', { question, category, gameState });
    });

    // Reveal answer
    socket.on('reveal-answer', () => {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId) return;

      const gameState = gameRooms.get(roomId);
      if (!gameState || !gameState.currentQuestion) return;

      io.to(roomId).emit('answer-revealed', { 
        answer: gameState.currentQuestion.answer,
        gameState 
      });
    });

    // Close question
    socket.on('close-question', () => {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId) return;

      const gameState = gameRooms.get(roomId);
      if (!gameState) return;

      const player = gameState.players.find(p => p.id === socket.id);
      if (gameState.gameMode === 'host' && !player?.isHost) {
        return;
      }

      gameState.currentQuestion = null;
      gameState.currentCategory = null;
      gameState.buzzerActive = false;
      gameState.buzzerWinner = null;

      io.to(roomId).emit('question-closed', { gameState });
    });

    // Update score
    socket.on('update-score', (data) => {
      const { playerId, points } = data;
      const roomId = socketToRoom.get(socket.id);
      if (!roomId) return;

      const gameState = gameRooms.get(roomId);
      if (!gameState) return;

      const player = gameState.players.find(p => p.id === socket.id);
      if (gameState.gameMode === 'host' && !player?.isHost) {
        return;
      }

      const targetPlayer = gameState.players.find(p => p.id === playerId);
      if (targetPlayer) {
        targetPlayer.score += points;
        gameState.scores[playerId] = targetPlayer.score;
        io.to(roomId).emit('score-updated', { playerId, score: targetPlayer.score, gameState });
      }
    });

    // Buzzer press
    socket.on('buzz', () => {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId) return;

      const gameState = gameRooms.get(roomId);
      if (!gameState) return;

      // Check if buzzer is active and question is selected
      if (!gameState.currentQuestion) {
        socket.emit('buzz-error', { error: 'No question selected' });
        return;
      }

      // If buzzer already has a winner, ignore
      if (gameState.buzzerWinner) {
        socket.emit('buzz-error', { error: 'Someone already buzzed in' });
        return;
      }

      // Check if player is in the room
      const player = gameState.players.find(p => p.id === socket.id);
      if (!player) {
        socket.emit('buzz-error', { error: 'You are not in this game' });
        return;
      }

      // Set buzzer winner (first press wins)
      gameState.buzzerActive = true;
      gameState.buzzerWinner = socket.id;

      // Broadcast to all players
      io.to(roomId).emit('buzzer-pressed', {
        playerId: socket.id,
        playerName: player.name,
        timestamp: Date.now(),
        gameState
      });

      console.log(`${player.name} buzzed in for room ${roomId}`);
    });

    // Reset buzzer (host only in host mode)
    socket.on('reset-buzzer', () => {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId) return;

      const gameState = gameRooms.get(roomId);
      if (!gameState) return;

      const player = gameState.players.find(p => p.id === socket.id);
      if (gameState.gameMode === 'host' && !player?.isHost) {
        return;
      }

      gameState.buzzerActive = false;
      gameState.buzzerWinner = null;

      io.to(roomId).emit('buzzer-reset', { gameState });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const roomId = socketToRoom.get(socket.id);
      if (roomId) {
        const gameState = gameRooms.get(roomId);
        if (gameState) {
          const playerIndex = gameState.players.findIndex(p => p.id === socket.id);
          if (playerIndex !== -1) {
            const wasHost = gameState.players[playerIndex].isHost;
            gameState.players.splice(playerIndex, 1);
            delete gameState.scores[socket.id];

            if (wasHost && gameState.players.length > 0) {
              gameState.players[0].isHost = true;
            }

            if (gameState.players.length === 0) {
              gameRooms.delete(roomId);
            } else {
              io.to(roomId).emit('player-left', { playerId: socket.id, gameState });
            }
          }
        }
        socketToRoom.delete(socket.id);
      }
      console.log('Client disconnected:', socket.id);
    });
  });
}

