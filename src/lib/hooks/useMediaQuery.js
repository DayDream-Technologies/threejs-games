/**
 * Match media queries with subscription to changes (resize, pointer type, etc.)
 */

import { useState, useEffect } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    media.addEventListener('change', onChange);
    setMatches(media.matches);
    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** True when viewport is narrow OR primary pointer is coarse (touch). */
export function useMobileTouchUi() {
  const narrow = useMediaQuery('(max-width: 768px)');
  const coarse = useMediaQuery('(pointer: coarse)');
  return narrow || coarse;
}
