import React from 'react';

export const SeatChevronIcon = ({ direction = 'up', size = 12 }) => {
  const path = direction === 'down'
    ? 'M3 4.5 6 7.5 9 4.5'
    : 'M3 7.5 6 4.5 9 7.5';

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 12 12"
      role="img"
      style={{ display: 'block' }}
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
