'use client';

import { useState } from 'react';

export default function InteractiveStarRating({ 
  rating, 
  onRatingChange, 
  readOnly = false, 
  size = 30,
  activeColor = '#5591DC',
  inactiveColor = '#C7C7CC'
}) {
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleStarClick = (starRating) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating) => {
    if (!readOnly) {
      setHoveredStar(starRating);
    }
  };

  const handleStarLeave = () => {
    if (!readOnly) {
      setHoveredStar(0);
    }
  };

  const getStarColor = (starIndex) => {
    const currentRating = readOnly ? rating : (hoveredStar || rating);
    return starIndex <= currentRating ? activeColor : inactiveColor;
  };

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <button
        key={i}
        type="button"
        onClick={() => handleStarClick(i)}
        onMouseEnter={() => handleStarHover(i)}
        onMouseLeave={handleStarLeave}
        disabled={readOnly}
        className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform duration-150 focus:outline-none`}
        style={{ 
          fontSize: `${size}px`,
          color: getStarColor(i),
          background: 'none',
          border: 'none',
          padding: '2px',
        }}
      >
        ★
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {stars}
    </div>
  );
}
