import React from 'react';
import { Player } from '../types';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
  gameMode: 'host' | 'player';
  currentQuestionValue?: number;
  onUpdateScore?: (playerId: string, points: number) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentPlayerId,
  gameMode,
  currentQuestionValue = 0,
  onUpdateScore
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const isHost = players.find(p => p.id === currentPlayerId)?.isHost || false;
  const canControlScore = gameMode === 'player' || (gameMode === 'host' && isHost);

  return (
    <div className="bg-jeopardy-blue border-2 border-jeopardy-gold rounded-lg p-4 md:p-6">
      <h3 className="text-jeopardy-gold text-xl md:text-2xl font-bold mb-4 text-center">
        Players
      </h3>
      <div className="space-y-2">
        {sortedPlayers.map((player) => {
          const isCurrentPlayer = player.id === currentPlayerId;
          return (
            <div
              key={player.id}
              className={`
                bg-jeopardy-dark-blue rounded-lg p-3 md:p-4 flex items-center justify-between
                ${isCurrentPlayer ? 'ring-2 ring-jeopardy-gold' : ''}
              `}
            >
              <div className="flex items-center gap-2 md:gap-3">
                {player.isHost && (
                  <span className="text-jeopardy-gold text-xs md:text-sm font-semibold">
                    👑
                  </span>
                )}
                <span className={`text-white font-semibold text-sm md:text-base ${isCurrentPlayer ? 'text-jeopardy-gold' : ''}`}>
                  {player.name}
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <span className="text-jeopardy-gold font-bold text-lg md:text-xl">
                  ${player.score}
                </span>
                {canControlScore && !isCurrentPlayer && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => onUpdateScore?.(player.id, -currentQuestionValue)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-red-700"
                    >
                      -
                    </button>
                    <button
                      onClick={() => onUpdateScore?.(player.id, currentQuestionValue)}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs md:text-sm hover:bg-green-700"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerList;

