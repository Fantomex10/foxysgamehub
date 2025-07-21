// =================================================================================
// FILE: src/components/ui/GlobalStyles.jsx
// =================================================================================
import React from 'react';

const GlobalStyles = () => (
  <style>{`
    html, body, #root { /* Ensure html, body, and root div take full height */
      height: 100%;
      /*/ overflow: hidden; /* Prevent scrolling on the main page */
    }

    /* ADD THIS NEW CLASS */
    .no-scroll {
      overflow: hidden;
    }
    :root {
      /* Normal Scale */
      --card-width: 5rem; /* 80px */
      --card-height: 7rem; /* 112px */
      --card-font-rank: 1.125rem; /* text-lg */
      --card-font-suit: 0.875rem; /* text-sm */
      --card-font-symbol: 3rem; /* text-5xl */
      --base-font-size: 0.875rem; /* text-sm */
    }

    .large-ui {
      /* Large Scale for PC users */
      --card-width: 7rem; /* 112px */
      --card-height: 9.8rem; /* ~157px */
      --card-font-rank: 1.5rem; /* text-2xl */
      --card-font-suit: 1.125rem; /* text-lg */
      --card-font-symbol: 4.5rem; /* text-7xl */
      --base-font-size: 1rem; /* text-base */
    }

    @media (min-width: 640px) { /* sm breakpoint */
      :root {
        --card-width: 5.5rem;
        --card-height: 7.7rem;
      }
    }

    @media (min-width: 768px) { /* md breakpoint */
       :root {
        --card-width: 6rem;
        --card-height: 8.4rem;
      }
      .large-ui {
        --card-width: 8rem;
        --card-height: 11.2rem;
      }
    }

    @keyframes pulse-border {
      0%, 100% { border-color: rgba(250, 204, 21, 1); }
      50% { border-color: transparent; }
    }
    .animate-pulse-border { animation: pulse-border 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  `}</style>
);

export default GlobalStyles;