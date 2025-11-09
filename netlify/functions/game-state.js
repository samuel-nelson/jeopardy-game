// Netlify Function for game state management (using in-memory storage)
// Note: In production, use a database like Fauna, MongoDB, or Supabase

// In-memory game rooms (will reset on function cold start)
// For production, use a database
const gameRooms = new Map();

// Generate room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    const body = event.body ? JSON.parse(event.body) : {};
    const { action, roomId, ...data } = body;

    // Create room
    if (action === 'create-room') {
      const newRoomId = generateRoomId();
      const gameState = {
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

      gameRooms.set(newRoomId, gameState);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ roomId: newRoomId, gameState })
      };
    }

    // Get room state
    if (action === 'get-room' && roomId) {
      const gameState = gameRooms.get(roomId);
      if (gameState) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ gameState })
        };
      }
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Room not found' })
      };
    }

    // Update room state
    if (action === 'update-room' && roomId) {
      const gameState = gameRooms.get(roomId);
      if (!gameState) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Room not found' })
        };
      }

      // Merge updates
      Object.assign(gameState, data.updates || {});
      gameRooms.set(roomId, gameState);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ gameState })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

