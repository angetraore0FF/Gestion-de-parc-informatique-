import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface BrandState {
  logo: string | null;
  name: string | null;
}

interface BrandContextValue extends BrandState {
  setLogo: (dataUrl: string | null) => void;
  setName: (name: string | null) => void;
  reset: () => void;
}

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

function load(): BrandState {
  return {
    logo: localStorage.getItem("brand_logo") || null,
    name: localStorage.getItem("brand_name") || null,
  };
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BrandState>(load);

  const setLogo = useCallback((dataUrl: string | null) => {
    if (dataUrl) localStorage.setItem("brand_logo", dataUrl);
    else localStorage.removeItem("brand_logo");
    setState((s) => ({ ...s, logo: dataUrl }));
  }, []);

  const setName = useCallback((name: string | null) => {
    if (name) localStorage.setItem("brand_name", name);
    else localStorage.removeItem("brand_name");
    setState((s) => ({ ...s, name }));
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem("brand_logo");
    localStorage.removeItem("brand_name");
    setState({ logo: null, name: null });
  }, []);

  return <BrandContext.Provider value={{ ...state, setLogo, setName, reset }}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used within BrandProvider");
  return ctx;
}

export function LogoMark({
  className = "h-9 w-9",
  textClassName = "text-sm",
  tone = "lime",
}: {
  className?: string;
  textClassName?: string;
  tone?: "lime" | "brand";
}) {
  const { logo } = useBrand();
  if (logo) {
    return (
      <img
        src={logo}
        alt="Logo"
        className={`${className} rounded-xl bg-white object-contain p-0.5 shadow-sm`}
      />
    );
  }
  const toneClass = tone === "brand" ? "bg-brand text-white" : "bg-lime text-brand-darker";
  return (
    <span className={`flex items-center justify-center rounded-xl font-heading font-extrabold ${toneClass} ${className} ${textClassName}`}>
      GP
    </span>
  );
}
