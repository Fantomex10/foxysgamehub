import { useEffect, useState } from 'react';

const readViewport = () => {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0, dpr: 1 };
  }

  const viewportSource = window.visualViewport ?? window;
  return {
    width: Math.round(viewportSource.width ?? window.innerWidth ?? 0),
    height: Math.round(viewportSource.height ?? window.innerHeight ?? 0),
    dpr: window.devicePixelRatio ?? 1,
  };
};

const useViewportSize = () => {
  const [viewport, setViewport] = useState(readViewport);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return () => {};
    }

    const handleResize = () => setViewport(readViewport());
    const viewportSource = window.visualViewport ?? window;

    handleResize();

    viewportSource.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      viewportSource.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return viewport;
};

export default useViewportSize;
