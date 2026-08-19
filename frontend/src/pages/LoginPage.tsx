import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { Input } from "../components/ui/Input";
import { AlertIcon, CheckIcon, GlobeIcon } from "../components/ui/Icons";

export function LoginPage() {
  const { login } = useAuth();
  const { t, lang, toggleLang } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@gestionparc.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      navigate("/");
    } catch {
      setError(t("login.error"));
    } finally {
      setLoading(false);
    }
  };

  const features = [t("login.f1"), t("login.f2"), t("login.f3")];

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden mesh-brand p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime font-heading text-base font-extrabold text-brand-darker">
            GP
          </span>
          <span className="font-heading text-lg font-bold">{t("app.name")}</span>
        </div>

        <div className="max-w-md">
          <h2 className="font-heading text-4xl font-extrabold leading-tight">{t("login.heroTitle")}</h2>
          <p className="mt-4 text-base text-slate-300">{t("login.heroSubtitle")}</p>
          <ul className="mt-8 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-slate-200">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime/20 text-lime">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-xs text-slate-400">© {new Date().getFullYear()} {t("app.name")}</div>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen items-center justify-center px-4 py-10 lg:min-h-0">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand font-heading text-sm font-extrabold text-white">
                GP
              </span>
              <span className="font-heading text-sm font-bold text-slate-800">{t("app.name")}</span>
            </div>
            <button
              onClick={toggleLang}
              data-testid="language-toggle"
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-brand/40 hover:text-brand cursor-pointer"
            >
              <GlobeIcon className="h-4 w-4" />
              {lang === "fr" ? "FR" : "EN"}
            </button>
          </div>

          <h1 className="font-heading text-2xl font-bold text-slate-900">{t("login.title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("login.subtitle")}</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5" data-testid="login-form">
            <FormField label={t("login.email")}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                data-testid="login-email-input"
              />
            </FormField>

            <FormField label={t("login.password")}>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                data-testid="login-password-input"
              />
            </FormField>

            {error && (
              <div
                role="alert"
                data-testid="login-error"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full" data-testid="login-submit-button">
              {loading ? t("login.submitting") : t("login.submit")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
