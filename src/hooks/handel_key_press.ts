import { useEffect } from 'react';

// Define the allowed modifier keys based on standard KeyboardEvent properties
type ModifierKey = 'ctrl' | 'meta' | 'alt' | 'shift';

export const useKeyPress = (
  targetKey: string,
  modifierKey: ModifierKey | null,
  callback: () => void
): void => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Safely check if the modifier key is pressed by constructing the property name (e.g., 'ctrlKey')
      const modifierPressed = modifierKey
        ? (event[`${modifierKey}Key` as keyof KeyboardEvent] as boolean)
        : true;

      if (modifierPressed && event.key.toLowerCase() === targetKey.toLowerCase()) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [targetKey, modifierKey, callback]);
};