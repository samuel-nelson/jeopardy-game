import React, { useState } from 'react';
import { Question, Category } from '../types';

interface QuestionModalProps {
  question: Question | null;
  category: Category | null;
  answer: string | null;
  onRevealAnswer: () => void;
  onClose: () => void;
  isHost: boolean;
  gameMode: 'host' | 'player';
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  category,
  answer,
  onRevealAnswer,
  onClose,
  isHost,
  gameMode
}) => {
  const [showAnswer, setShowAnswer] = useState(false);

  if (!question) return null;

  const handleReveal = () => {
    setShowAnswer(true);
    onRevealAnswer();
  };

  const canControl = gameMode === 'player' || (gameMode === 'host' && isHost);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-jeopardy-blue border-4 border-jeopardy-gold rounded-lg max-w-4xl w-full p-6 md:p-8 text-center animate-reveal">
        {category && (
          <h2 className="text-jeopardy-gold text-xl md:text-2xl font-bold mb-4">
            {category.name} - ${question.value}
          </h2>
        )}
        
        <div className="bg-white rounded-lg p-6 md:p-8 mb-6 min-h-[200px] flex items-center justify-center">
          {!showAnswer ? (
            <p className="text-jeopardy-blue text-2xl md:text-4xl font-bold">
              {question.question}
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-jeopardy-blue text-xl md:text-2xl font-semibold mb-4">
                Answer:
              </p>
              <p className="text-jeopardy-blue text-2xl md:text-3xl font-bold">
                {answer || question.answer}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          {!showAnswer && canControl && (
            <button
              onClick={handleReveal}
              className="bg-jeopardy-gold text-jeopardy-blue px-6 py-3 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors"
            >
              Reveal Answer
            </button>
          )}
          {canControl && (
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;

