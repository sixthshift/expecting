import { replaceEqualDeep } from "@tanstack/react-query";
import { useRef } from "react";

/**
 * `value`, with every part equal to the last render's kept as the last
 * render's object, as the query cache keeps its data: so a `memo` child given
 * a part that didn't change sees it as unchanged, and skips drawing it again.
 */
export function useKeepSame<T>(value: T): T {
  const last = useRef(value);
  last.current = replaceEqualDeep(last.current, value);
  return last.current;
}
