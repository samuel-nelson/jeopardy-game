import React, { useEffect, useState } from 'react';

interface BuzzerProps {
  onBuzz: () => void;
  disabled: boolean;
  buzzerWinner: string | null;
  playerId: string;
  playerName: string;
}

const Buzzer: React.FC<BuzzerProps> = ({
  onBuzz,
  disabled,
  buzzerWinner,
  playerId,
  playerName
}) => {
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !disabled && !buzzerWinner) {
        e.preventDefault();
        handleBuzz();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [disabled, buzzerWinner]);

  const handleBuzz = () => {
    if (disabled || buzzerWinner) return;
    
    setIsPressed(true);
    onBuzz();
    
    setTimeout(() => setIsPressed(false), 300);
  };

  const isWinner = buzzerWinner === playerId;
  const canBuzz = !disabled && !buzzerWinner;

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleBuzz}
        disabled={!canBuzz}
        className={`
          w-32 h-32 md:w-40 md:h-40 rounded-full
          font-bold text-xl md:text-2xl
          transition-all duration-200 transform
          ${canBuzz 
            ? 'bg-red-600 hover:bg-red-700 active:scale-95 cursor-pointer shadow-lg hover:shadow-xl' 
            : 'bg-gray-500 cursor-not-allowed'
          }
          ${isPressed ? 'scale-90 animate-buzz' : ''}
          ${isWinner ? 'ring-4 ring-jeopardy-gold ring-opacity-75 bg-green-600' : ''}
          text-white
        `}
      >
        {isWinner ? '✓' : canBuzz ? 'BUZZ' : 'LOCKED'}
      </button>
      {buzzerWinner && !isWinner && (
        <p className="text-white text-sm md:text-base">
          {buzzerWinner ? 'Someone else buzzed in!' : ''}
        </p>
      )}
      {isWinner && (
        <p className="text-jeopardy-gold font-bold text-lg md:text-xl animate-pulse">
          You buzzed in!
        </p>
      )}
      {canBuzz && (
        <p className="text-white text-xs md:text-sm opacity-75">
          Press SPACEBAR or click to buzz
        </p>
      )}
    </div>
  );
};

export default Buzzer;

