import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameService } from '../services/gameService';
import { api } from '../services/api';
import { QuestionSet } from '../types';

const USE_PUSHER = process.env.REACT_APP_USE_PUSHER === 'true' || 
                   (process.env.NODE_ENV === 'production' && process.env.REACT_APP_PUSHER_KEY);

const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [gameMode, setGameMode] = useState<'host' | 'player'>('host');
  const [playerLimit, setPlayerLimit] = useState(6);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState<QuestionSet | null>(null);
  const [customQuestionSets, setCustomQuestionSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuestionSets();
    gameService.connect();
    return () => {
      gameService.disconnect();
    };
  }, []);

  const loadQuestionSets = async () => {
    try {
      const defaultSet = await api.getDefaultQuestions();
      const customSets = await api.getCustomQuestionSets();
      
      // Load full custom sets
      const loadedCustomSets = await Promise.all(
        customSets.map((set: any) => api.getCustomQuestionSet(set.id))
      );
      
      setQuestionSets(defaultSet ? [defaultSet] : []);
      setCustomQuestionSets(loadedCustomSets);
      
      if (defaultSet) {
        setSelectedQuestionSet(defaultSet);
      }
    } catch (err) {
      console.error('Error loading question sets:', err);
    }
  };

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!selectedQuestionSet) {
      setError('Please select a question set');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const playerId = gameService.generatePlayerId();
      
      if (USE_PUSHER) {
        // Pusher mode
        const result: any = await gameService.createRoom({
          playerName: playerName.trim(),
          playerId,
          gameMode,
          playerLimit,
          questionSet: selectedQuestionSet
        });

        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }

        const { roomId: newRoomId, gameState } = result;
        
        // Subscribe to room events
        gameService.subscribeToRoom(newRoomId, {
          onPlayerJoined: (data) => {
            localStorage.setItem('gameState', JSON.stringify(data.gameState));
          },
          onPlayerLeft: (data) => {
            localStorage.setItem('gameState', JSON.stringify(data.gameState));
          },
          onQuestionSelected: (data) => {
            localStorage.setItem('gameState', JSON.stringify(data.gameState));
          },
          onAnswerRevealed: (data) => {
            localStorage.setItem('gameState', JSON.stringify(data.gameState));
          },
          onQuestionClosed: (data) => {
            localStorage.setItem('gameState', JSON.stringify(data.gameState));
          },
          onScoreUpdated: (data) => {
            localStorage.setItem('gameState', JSON.stringify(data.gameState));
          },
          onBuzzerPressed: (data) => {
            localStorage.setItem('gameState', JSON.stringify(data.gameState));
          },
          onBuzzerReset: (data) => {
            localStorage.setItem('gameState', JSON.stringify(data.gameState));
          }
        });

        localStorage.setItem('gameState', JSON.stringify(gameState));
        localStorage.setItem('playerId', playerId);
        localStorage.setItem('playerName', playerName);
        localStorage.setItem('roomId', newRoomId);
        localStorage.setItem('questionSet', JSON.stringify(selectedQuestionSet));
        navigate('/game');
      } else {
        // Socket.io mode (local development)
        const socket = gameService.getSocket();
        
        gameService.onRoomCreated((data) => {
          localStorage.setItem('gameState', JSON.stringify(data.gameState));
          localStorage.setItem('playerId', socket?.id || playerId);
          localStorage.setItem('playerName', playerName);
          localStorage.setItem('questionSet', JSON.stringify(selectedQuestionSet));
          navigate('/game');
        });

        gameService.onRoomError((data) => {
          setError(data.error);
          setLoading(false);
        });

        gameService.createRoom({
          playerName: playerName.trim(),
          gameMode,
          playerLimit,
          questionSet: selectedQuestionSet
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const playerId = gameService.generatePlayerId();
      
      if (USE_PUSHER) {
        // Pusher mode
        const result: any = await gameService.joinRoom({
          roomId: roomId.trim().toUpperCase(),
          playerName: playerName.trim(),
          playerId
        });

        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }

        const { gameState } = result;
        const joinedRoomId = roomId.trim().toUpperCase();

        // Subscribe to room events
        gameService.subscribeToRoom(joinedRoomId, {
          onPlayerJoined: (data) => {
            localStorage.setItem('gameState', JSON.stringify(data.gameState));
          },
          onPlayerLeft: (data) => {
            localStorage.setItem('gameState', JSON.stringify(data.gameState));
          },
          onQuestionSelected: (data) => {
            localStorage.setItem('gameState', JSON.stringify(data.gameState));
          },
          onAnswerRevealed: (data) => {
            localStorage.setItem('gameState', JSON.stringify(data.gameState));
          },
          onQuestionClosed: (data) => {
            localStorage.setItem('gameState', JSON.stringify(data.gameState));
          },
          onScoreUpdated: (data) => {
            localStorage.setItem('gameState', JSON.stringify(data.gameState));
          },
          onBuzzerPressed: (data) => {
            localStorage.setItem('gameState', JSON.stringify(data.gameState));
          },
          onBuzzerReset: (data) => {
            localStorage.setItem('gameState', JSON.stringify(data.gameState));
          }
        });

        localStorage.setItem('gameState', JSON.stringify(gameState));
        localStorage.setItem('playerId', playerId);
        localStorage.setItem('playerName', playerName);
        localStorage.setItem('roomId', joinedRoomId);
        if (gameState.questionSet) {
          localStorage.setItem('questionSet', JSON.stringify(gameState.questionSet));
        }
        navigate('/game');
      } else {
        // Socket.io mode (local development)
        const socket = gameService.getSocket();
        
        gameService.onRoomJoined((data) => {
          localStorage.setItem('gameState', JSON.stringify(data.gameState));
          localStorage.setItem('playerId', socket?.id || playerId);
          localStorage.setItem('playerName', playerName);
          if (data.gameState.questionSet) {
            localStorage.setItem('questionSet', JSON.stringify(data.gameState.questionSet));
          }
          navigate('/game');
        });

        gameService.onRoomError((data) => {
          setError(data.error);
          setLoading(false);
        });

        gameService.joinRoom({
          roomId: roomId.trim().toUpperCase(),
          playerName: playerName.trim()
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-jeopardy-blue border-4 border-jeopardy-gold rounded-lg p-6 md:p-8 max-w-2xl w-full">
        <h1 className="text-jeopardy-gold text-4xl md:text-6xl font-bold text-center mb-8">
          JEOPARDY!
        </h1>

        <div className="space-y-6">
          {/* Player Name */}
          <div>
            <label className="block text-white font-semibold mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg text-jeopardy-blue font-semibold"
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>

          {/* Game Mode */}
          <div>
            <label className="block text-white font-semibold mb-2">Game Mode</label>
            <div className="flex gap-4">
              <button
                onClick={() => setGameMode('host')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  gameMode === 'host'
                    ? 'bg-jeopardy-gold text-jeopardy-blue'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Host Mode
              </button>
              <button
                onClick={() => setGameMode('player')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  gameMode === 'player'
                    ? 'bg-jeopardy-gold text-jeopardy-blue'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Player Mode
              </button>
            </div>
          </div>

          {/* Player Limit (for creating room) */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Player Limit: {playerLimit}
            </label>
            <input
              type="range"
              min="2"
              max="10"
              value={playerLimit}
              onChange={(e) => setPlayerLimit(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Question Set Selection */}
          <div>
            <label className="block text-white font-semibold mb-2">Question Set</label>
            <select
              value={selectedQuestionSet?.id || ''}
              onChange={(e) => {
                const set = [...questionSets, ...customQuestionSets].find(s => s.id === e.target.value);
                setSelectedQuestionSet(set || null);
              }}
              className="w-full px-4 py-2 rounded-lg text-jeopardy-blue font-semibold"
            >
              <option value="">Select a question set</option>
              {questionSets.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.name} (Default)
                </option>
              ))}
              {customQuestionSets.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.name}
                </option>
              ))}
            </select>
          </div>

          {/* Create Room */}
          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full bg-jeopardy-gold text-jeopardy-blue px-6 py-3 rounded-lg font-bold text-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-jeopardy-gold"></div>
            <span className="text-jeopardy-gold font-semibold">OR</span>
            <div className="flex-1 h-px bg-jeopardy-gold"></div>
          </div>

          {/* Join Room */}
          <div>
            <label className="block text-white font-semibold mb-2">Room ID</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 rounded-lg text-jeopardy-blue font-semibold mb-4"
              placeholder="Enter room ID"
              maxLength={6}
            />
            <button
              onClick={handleJoinRoom}
              disabled={loading}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Admin Link */}
          <div className="text-center">
            <button
              onClick={() => navigate('/admin')}
              className="text-jeopardy-gold hover:underline"
            >
              Admin Panel (Create Custom Questions)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
