import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameService } from '../services/gameService';
import { GameState, Player, Question, Category, QuestionSet } from '../types';
import GameBoard from '../components/GameBoard';
import Buzzer from '../components/Buzzer';
import QuestionModal from '../components/QuestionModal';
import PlayerList from '../components/PlayerList';

const USE_PUSHER = process.env.REACT_APP_USE_PUSHER === 'true' || 
                   (process.env.NODE_ENV === 'production' && process.env.REACT_APP_PUSHER_KEY);

const Game: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);

  useEffect(() => {
    const storedState = localStorage.getItem('gameState');
    const storedPlayerId = localStorage.getItem('playerId');
    const storedPlayerName = localStorage.getItem('playerName');
    const storedRoomId = localStorage.getItem('roomId');
    const storedQuestionSet = localStorage.getItem('questionSet');

    if (!storedState || !storedPlayerId || !storedPlayerName) {
      navigate('/');
      return;
    }

    setPlayerId(storedPlayerId);
    setPlayerName(storedPlayerName);
    
    if (storedRoomId) {
      setRoomId(storedRoomId);
    }
    
    const parsedState = JSON.parse(storedState);
    setGameState(parsedState);
    
    if (storedQuestionSet) {
      setQuestionSet(JSON.parse(storedQuestionSet));
    }

    // Connect and set up event listeners
    gameService.connect();

    if (USE_PUSHER && storedRoomId) {
      // Pusher mode - subscribe to room
      gameService.subscribeToRoom(storedRoomId, {
        onPlayerJoined: (data) => {
          setGameState(data.gameState);
          localStorage.setItem('gameState', JSON.stringify(data.gameState));
        },
        onPlayerLeft: (data) => {
          setGameState(data.gameState);
          localStorage.setItem('gameState', JSON.stringify(data.gameState));
        },
        onQuestionSelected: (data) => {
          setCurrentQuestion(data.question);
          setCurrentCategory(data.category);
          setAnswer(null);
          setGameState(data.gameState);
          localStorage.setItem('gameState', JSON.stringify(data.gameState));
        },
        onAnswerRevealed: (data) => {
          setAnswer(data.answer);
          setGameState(data.gameState);
          localStorage.setItem('gameState', JSON.stringify(data.gameState));
        },
        onQuestionClosed: (data) => {
          setCurrentQuestion(null);
          setCurrentCategory(null);
          setAnswer(null);
          setGameState(data.gameState);
          localStorage.setItem('gameState', JSON.stringify(data.gameState));
        },
        onScoreUpdated: (data) => {
          setGameState(data.gameState);
          localStorage.setItem('gameState', JSON.stringify(data.gameState));
        },
        onBuzzerPressed: (data) => {
          setGameState(data.gameState);
          localStorage.setItem('gameState', JSON.stringify(data.gameState));
        },
        onBuzzerReset: (data) => {
          setGameState(data.gameState);
          localStorage.setItem('gameState', JSON.stringify(data.gameState));
        }
      });
    } else {
      // Socket.io mode (local development)
      gameService.onPlayerJoined((data) => {
        setGameState(data.gameState);
        localStorage.setItem('gameState', JSON.stringify(data.gameState));
      });

      gameService.onPlayerLeft((data) => {
        setGameState(data.gameState);
        localStorage.setItem('gameState', JSON.stringify(data.gameState));
      });

      gameService.onQuestionSelected((data) => {
        setCurrentQuestion(data.question);
        setCurrentCategory(data.category);
        setAnswer(null);
        setGameState(data.gameState);
        localStorage.setItem('gameState', JSON.stringify(data.gameState));
      });

      gameService.onAnswerRevealed((data) => {
        setAnswer(data.answer);
        setGameState(data.gameState);
        localStorage.setItem('gameState', JSON.stringify(data.gameState));
      });

      gameService.onQuestionClosed((data) => {
        setCurrentQuestion(null);
        setCurrentCategory(null);
        setAnswer(null);
        setGameState(data.gameState);
        localStorage.setItem('gameState', JSON.stringify(data.gameState));
      });

      gameService.onScoreUpdated((data) => {
        setGameState(data.gameState);
        localStorage.setItem('gameState', JSON.stringify(data.gameState));
      });

      gameService.onBuzzerPressed((data) => {
        setGameState(data.gameState);
        localStorage.setItem('gameState', JSON.stringify(data.gameState));
      });

      gameService.onBuzzerReset((data) => {
        setGameState(data.gameState);
        localStorage.setItem('gameState', JSON.stringify(data.gameState));
      });
    }

    return () => {
      gameService.disconnect();
    };
  }, [navigate]);

  const handleSelectQuestion = async (categoryId: string, questionId: string) => {
    if (USE_PUSHER && roomId) {
      await gameService.selectQuestion({ roomId, categoryId, questionId });
    } else {
      gameService.selectQuestion({ categoryId, questionId });
    }
  };

  const handleRevealAnswer = async () => {
    if (USE_PUSHER && roomId) {
      await gameService.revealAnswer({ roomId });
    } else {
      gameService.revealAnswer();
    }
  };

  const handleCloseQuestion = async () => {
    if (USE_PUSHER && roomId) {
      await gameService.closeQuestion({ roomId });
    } else {
      gameService.closeQuestion();
    }
  };

  const handleBuzz = async () => {
    if (USE_PUSHER && roomId) {
      await gameService.buzz({ roomId, playerId, playerName });
    } else {
      gameService.buzz();
    }
  };

  const handleUpdateScore = async (targetPlayerId: string, points: number) => {
    if (USE_PUSHER && roomId) {
      await gameService.updateScore({ roomId, playerId: targetPlayerId, points });
    } else {
      gameService.updateScore({ playerId: targetPlayerId, points });
    }
  };

  const handleLeaveGame = async () => {
    if (USE_PUSHER && roomId) {
      await gameService.leaveRoom({ roomId, playerId });
    } else {
      gameService.leaveRoom();
    }
    gameService.disconnect();
    localStorage.removeItem('gameState');
    localStorage.removeItem('playerId');
    localStorage.removeItem('playerName');
    localStorage.removeItem('roomId');
    localStorage.removeItem('questionSet');
    navigate('/');
  };

  if (!gameState || !questionSet) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-2xl">
        Loading game...
      </div>
    );
  }

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const isHost = currentPlayer?.isHost || false;
  const buzzerDisabled = !currentQuestion || !!gameState.buzzerWinner;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-jeopardy-gold text-3xl md:text-5xl font-bold mb-2">
              JEOPARDY!
            </h1>
            <p className="text-white text-sm md:text-base">
              Room: <span className="font-bold">{gameState.roomId}</span>
            </p>
          </div>
          <button
            onClick={handleLeaveGame}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Leave Game
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <GameBoard
              questionSet={questionSet}
              onSelectQuestion={handleSelectQuestion}
              currentQuestion={currentQuestion}
              currentCategory={currentCategory}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Buzzer */}
            {currentQuestion && (
              <div className="bg-jeopardy-blue border-2 border-jeopardy-gold rounded-lg p-4 md:p-6">
                <Buzzer
                  onBuzz={handleBuzz}
                  disabled={buzzerDisabled}
                  buzzerWinner={gameState.buzzerWinner}
                  playerId={playerId}
                  playerName={playerName}
                />
              </div>
            )}

            {/* Player List */}
            <PlayerList
              players={gameState.players}
              currentPlayerId={playerId}
              gameMode={gameState.gameMode}
              currentQuestionValue={currentQuestion?.value || 0}
              onUpdateScore={handleUpdateScore}
            />

            {/* Host Controls */}
            {isHost && gameState.gameMode === 'host' && gameState.buzzerWinner && (
              <div className="bg-jeopardy-blue border-2 border-jeopardy-gold rounded-lg p-4">
                <h3 className="text-jeopardy-gold font-bold mb-2">Host Controls</h3>
                <button
                  onClick={() => gameService.resetBuzzer(roomId ? { roomId } : undefined)}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors mb-2"
                >
                  Reset Buzzer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Question Modal */}
        {currentQuestion && (
          <QuestionModal
            question={currentQuestion}
            category={currentCategory}
            answer={answer}
            onRevealAnswer={handleRevealAnswer}
            onClose={handleCloseQuestion}
            isHost={isHost}
            gameMode={gameState.gameMode}
          />
        )}
      </div>
    </div>
  );
};

export default Game;
