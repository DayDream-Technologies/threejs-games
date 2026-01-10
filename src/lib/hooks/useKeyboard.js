/**
 * useKeyboard Hook
 * 
 * Provides keyboard input handling for games.
 */

import { useEffect, useCallback, useRef } from 'react';

/**
 * @typedef {Object} KeyboardConfig
 * @property {Object} keyMap - Map of key names to handler functions
 * @property {boolean} [preventDefault] - Whether to prevent default for handled keys
 * @property {boolean} [enabled] - Whether keyboard handling is enabled
 */

/**
 * Custom hook for handling keyboard input
 * @param {KeyboardConfig} config
 */
export const useKeyboard = (config = {}) => {
  const { keyMap = {}, preventDefault = true, enabled = true } = config;
  
  const keyMapRef = useRef(keyMap);
  keyMapRef.current = keyMap;
  
  useEffect(() => {
    if (!enabled) return;
    
    const handleKeyDown = (e) => {
      const handler = keyMapRef.current[e.key] || keyMapRef.current[e.key.toLowerCase()];
      
      if (handler) {
        if (preventDefault) {
          e.preventDefault();
        }
        handler(e);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, preventDefault]);
};

/**
 * Hook for detecting held keys
 * @param {string[]} keys - Keys to track
 * @returns {Object} - Object with key states
 */
export const useHeldKeys = (keys) => {
  const heldKeys = useRef({});
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (keys.includes(e.key) || keys.includes(e.key.toLowerCase())) {
        heldKeys.current[e.key.toLowerCase()] = true;
      }
    };
    
    const handleKeyUp = (e) => {
      if (keys.includes(e.key) || keys.includes(e.key.toLowerCase())) {
        heldKeys.current[e.key.toLowerCase()] = false;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keys]);
  
  const isHeld = useCallback((key) => {
    return !!heldKeys.current[key.toLowerCase()];
  }, []);
  
  return { isHeld, heldKeys: heldKeys.current };
};

/**
 * Hook for arrow key navigation
 * @param {Object} handlers - Object with up, down, left, right handlers
 * @param {boolean} enabled - Whether navigation is enabled
 */
export const useArrowKeys = (handlers, enabled = true) => {
  useKeyboard({
    enabled,
    keyMap: {
      'ArrowUp': handlers.up,
      'ArrowDown': handlers.down,
      'ArrowLeft': handlers.left,
      'ArrowRight': handlers.right
    }
  });
};

export default useKeyboard;

