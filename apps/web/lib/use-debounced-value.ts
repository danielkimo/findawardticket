import { useEffect, useState } from "react";

/** 簡易 debounce hook，用於自動完成輸入框避免每次按鍵都送出請求 */
export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
