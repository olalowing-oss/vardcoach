import { useState, useEffect } from 'react';
import { breakpoints } from '../styles/styles';

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width <= breakpoints.mobile;
  const isTablet = windowSize.width > breakpoints.mobile && windowSize.width <= breakpoints.tablet;
  const isDesktop = windowSize.width > breakpoints.tablet;

  return {
    ...windowSize,
    isMobile,
    isTablet,
    isDesktop,
  };
}
