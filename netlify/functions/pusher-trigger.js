// Netlify Function to trigger Pusher events
// This acts as a proxy between the frontend and Pusher

const Pusher = require('pusher');

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER || 'us2',
  encrypted: true
});

// In-memory game state (use database in production)
const gameRooms = new Map();

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { event: eventName, data } = JSON.parse(event.body);
    const { roomId } = data;

    // Get or create game state
    let gameState = gameRooms.get(roomId);

    switch (eventName) {
      case 'create-room': {
        const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        gameState = {
          roomId: newRoomId,
          players: [{
            id: data.playerId || `player-${Date.now()}`,
            name: data.playerName,
            score: 0,
            isHost: true
          }],
          currentQuestion: null,
          currentCategory: null,
          buzzerActive: false,
          buzzerWinner: null,
          gameMode: data.gameMode || 'host',
          playerLimit: data.playerLimit || 6,
          questionSet: data.questionSet || null,
          scores: {}
        };
        gameState.scores[data.playerId] = 0;
        gameRooms.set(newRoomId, gameState);
        
        await pusher.trigger(`room-${newRoomId}`, 'room-created', { roomId: newRoomId, gameState });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ roomId: newRoomId, gameState })
        };
      }

      case 'join-room': {
        if (!gameState) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Room not found' })
          };
        }

        if (gameState.players.some((p) => p.name === data.playerName)) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Name already taken' })
          };
        }

        if (gameState.players.length >= gameState.playerLimit) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Room is full' })
          };
        }

        const newPlayer = {
          id: data.playerId || `player-${Date.now()}`,
          name: data.playerName,
          score: 0,
          isHost: false
        };

        gameState.players.push(newPlayer);
        gameState.scores[newPlayer.id] = 0;
        gameRooms.set(roomId, gameState);

        await pusher.trigger(`room-${roomId}`, 'player-joined', { player: newPlayer, gameState });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ roomId, gameState })
        };
      }

      case 'leave-room': {
        if (!gameState) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Room not found' })
          };
        }

        const playerIndex = gameState.players.findIndex((p) => p.id === data.playerId);
        if (playerIndex !== -1) {
          const wasHost = gameState.players[playerIndex].isHost;
          gameState.players.splice(playerIndex, 1);
          delete gameState.scores[data.playerId];

          if (wasHost && gameState.players.length > 0) {
            gameState.players[0].isHost = true;
          }

          if (gameState.players.length === 0) {
            gameRooms.delete(roomId);
          } else {
            gameRooms.set(roomId, gameState);
            await pusher.trigger(`room-${roomId}`, 'player-left', { playerId: data.playerId, gameState });
          }
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true })
        };
      }

      case 'buzz': {
        if (!gameState || !gameState.currentQuestion) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'No question selected' })
          };
        }

        if (gameState.buzzerWinner) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Someone already buzzed in' })
          };
        }

        gameState.buzzerActive = true;
        gameState.buzzerWinner = data.playerId;
        gameRooms.set(roomId, gameState);

        await pusher.trigger(`room-${roomId}`, 'buzzer-pressed', {
          playerId: data.playerId,
          playerName: data.playerName,
          timestamp: Date.now(),
          gameState
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, gameState })
        };
      }

      case 'select-question': {
        if (!gameState) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Room not found' })
          };
        }

        const { categoryId, questionId } = data;
        if (!gameState.questionSet) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'No question set loaded' })
          };
        }

        const category = gameState.questionSet.categories.find((c) => c.id === categoryId);
        if (!category) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Category not found' })
          };
        }

        const question = category.questions.find((q) => q.id === questionId);
        if (!question || question.answered) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Question not available' })
          };
        }

        question.answered = true;
        gameState.currentQuestion = question;
        gameState.currentCategory = category;
        gameState.buzzerActive = false;
        gameState.buzzerWinner = null;
        gameRooms.set(roomId, gameState);

        await pusher.trigger(`room-${roomId}`, 'question-selected', { question, category, gameState });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, gameState })
        };
      }

      case 'reveal-answer': {
        if (!gameState || !gameState.currentQuestion) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'No question selected' })
          };
        }

        await pusher.trigger(`room-${roomId}`, 'answer-revealed', {
          answer: gameState.currentQuestion.answer,
          gameState
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true })
        };
      }

      case 'close-question': {
        if (!gameState) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Room not found' })
          };
        }

        gameState.currentQuestion = null;
        gameState.currentCategory = null;
        gameState.buzzerActive = false;
        gameState.buzzerWinner = null;
        gameRooms.set(roomId, gameState);

        await pusher.trigger(`room-${roomId}`, 'question-closed', { gameState });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, gameState })
        };
      }

      case 'update-score': {
        if (!gameState) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Room not found' })
          };
        }

        const { playerId, points } = data;
        const player = gameState.players.find((p) => p.id === playerId);
        if (player) {
          player.score += points;
          gameState.scores[playerId] = player.score;
          gameRooms.set(roomId, gameState);

          await pusher.trigger(`room-${roomId}`, 'score-updated', {
            playerId,
            score: player.score,
            gameState
          });
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, gameState })
        };
      }

      case 'reset-buzzer': {
        if (!gameState) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Room not found' })
          };
        }

        gameState.buzzerActive = false;
        gameState.buzzerWinner = null;
        gameRooms.set(roomId, gameState);

        await pusher.trigger(`room-${roomId}`, 'buzzer-reset', { gameState });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, gameState })
        };
      }

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Unknown event' })
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

