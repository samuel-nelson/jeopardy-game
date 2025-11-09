// Buzzer logic is integrated into gameSocket.js
// This file exports buzzer-specific handlers

export function setupBuzzerHandlers(io, gameRooms, socketToRoom) {
  io.on('connection', (socket) => {
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
  });
}

