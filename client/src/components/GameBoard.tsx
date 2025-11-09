import React from 'react';
import { QuestionSet, Question, Category } from '../types';

interface GameBoardProps {
  questionSet: QuestionSet | null;
  onSelectQuestion: (categoryId: string, questionId: string) => void;
  currentQuestion: Question | null;
  currentCategory: Category | null;
}

const GameBoard: React.FC<GameBoardProps> = ({
  questionSet,
  onSelectQuestion,
  currentQuestion,
  currentCategory
}) => {
  if (!questionSet || !questionSet.categories) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-2xl">
        No question set loaded
      </div>
    );
  }

  const values = [200, 400, 600, 800, 1000];

  const formatValue = (value: number) => {
    return `$${value}`;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-6 gap-2 md:gap-4">
        {/* Category headers */}
        <div className="col-span-1"></div>
        {questionSet.categories.map((category) => (
          <div
            key={category.id}
            className="bg-jeopardy-blue border-2 border-jeopardy-gold rounded-lg p-2 md:p-4 text-center flex items-center justify-center min-h-[80px] md:min-h-[120px]"
          >
            <h3 className="text-white font-bold text-xs md:text-lg lg:text-xl break-words">
              {category.name}
            </h3>
          </div>
        ))}

        {/* Question cells */}
        {values.map((value) => (
          <React.Fragment key={value}>
            <div className="bg-jeopardy-blue border-2 border-jeopardy-gold rounded-lg p-2 md:p-4 text-center flex items-center justify-center min-h-[60px] md:min-h-[100px]">
              <span className="text-jeopardy-gold font-bold text-lg md:text-2xl">
                {formatValue(value)}
              </span>
            </div>
            {questionSet.categories.map((category) => {
              const question = category.questions.find(q => q.value === value);
              const isAnswered = question?.answered || false;
              const isCurrent = currentQuestion?.id === question?.id;

              return (
                <button
                  key={`${category.id}-${value}`}
                  onClick={() => {
                    if (question && !isAnswered) {
                      onSelectQuestion(category.id, question.id);
                    }
                  }}
                  disabled={isAnswered}
                  className={`
                    bg-jeopardy-blue border-2 border-jeopardy-gold rounded-lg p-2 md:p-4 
                    text-center flex items-center justify-center min-h-[60px] md:min-h-[100px]
                    transition-all duration-300 transform hover:scale-105
                    ${isAnswered ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-jeopardy-dark-blue'}
                    ${isCurrent ? 'ring-4 ring-jeopardy-gold ring-opacity-75' : ''}
                    animate-reveal
                  `}
                >
                  {!isAnswered ? (
                    <span className="text-jeopardy-gold font-bold text-lg md:text-2xl">
                      {formatValue(value)}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs md:text-sm">✓</span>
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;

