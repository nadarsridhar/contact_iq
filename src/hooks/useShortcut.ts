import { useEffect } from "react";

type ShortcutOptions = {
  preventDefault?: boolean;
  enabled?: boolean;
};

export function useShortcut(
  keyCombo: string,
  callback: (event: KeyboardEvent) => void,
  options: ShortcutOptions = {}
) {
  const { preventDefault = true, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const keys = keyCombo
      .toLowerCase()
      .split("+")
      .map((k) => k.trim());

    const handler = (event: KeyboardEvent) => {
      const pressedKey = event.key.toLowerCase();

      const isMatch =
        keys.includes(pressedKey) &&
        (!keys.includes("ctrl") || event.ctrlKey) &&
        (!keys.includes("shift") || event.shiftKey) &&
        (!keys.includes("alt") || event.altKey) &&
        (!keys.includes("meta") || event.metaKey);

      if (isMatch) {
        if (preventDefault) event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keyCombo, callback, preventDefault, enabled]);
}
