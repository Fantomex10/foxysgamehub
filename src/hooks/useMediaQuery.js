import { useEffect, useState } from 'react';

const getMatch = (query) => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(query).matches;
};

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => getMatch(query));

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia(query);
      const handler = (event) => setMatches(event.matches);
      setMatches(mediaQuery.matches);

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      }

      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }

    return () => {};
  }, [query]);

  return matches;
};

export default useMediaQuery;
