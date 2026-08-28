import { resolveDefaultLanguage } from "@/lib/languages";

/**
 * Default admin UI language. Practice-level overrides return in a later step
 * once site settings exist.
 */
export function useDefaultLanguage() {
  return resolveDefaultLanguage(undefined);
}
