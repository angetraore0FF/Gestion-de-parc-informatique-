import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { translations, type EnumCategory, type Lang } from "./translations";

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  el: (category: EnumCategory, index: number) => string;
  elEntries: (category: EnumCategory) => Array<[number, string]>;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function resolve(obj: unknown, path: string): string | undefined {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj) as string | undefined;
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, k) => (k in params ? String(params[k]) : `{${k}}`));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("lang") as Lang) || "fr");

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem("lang", l);
    document.documentElement.lang = l;
    setLangState(l);
  }, []);

  const toggleLang = useCallback(() => setLang(lang === "fr" ? "en" : "fr"), [lang, setLang]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const value = resolve(translations[lang], key) ?? resolve(translations.fr, key) ?? key;
      return interpolate(String(value), params);
    },
    [lang]
  );

  const el = useCallback(
    (category: EnumCategory, index: number) => {
      const arr = translations[lang].enums[category] as readonly string[];
      return arr[index] ?? String(index);
    },
    [lang]
  );

  const elEntries = useCallback(
    (category: EnumCategory) => {
      const arr = translations[lang].enums[category] as readonly string[];
      return arr.map((label, i) => [i, label] as [number, string]);
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang, t, el, elEntries }}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
