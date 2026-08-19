import { useRef, useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { FormField } from "./FormField";
import { Input } from "./Input";
import { useBrand, LogoMark } from "../../brand/BrandContext";
import { useI18n } from "../../i18n/I18nContext";

export function BrandSettingsModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { logo, name, setLogo, setName, reset } = useBrand();
  const [localName, setLocalName] = useState(name ?? "");
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setErr(t("brand.logoHint"));
      return;
    }
    setErr(null);
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveName = () => setName(localName.trim() || null);

  return (
    <Modal title={t("brand.settings")} onClose={onClose}>
      <div className="space-y-5" data-testid="brand-settings">
        <div>
          <div className="mb-2 text-[13px] font-semibold text-slate-700 dark:text-slate-300">{t("brand.logo")}</div>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <LogoMark className="h-12 w-12" textClassName="text-base" tone="brand" />
            </div>
            <div className="flex flex-col gap-2">
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" data-testid="brand-logo-input" />
              <Button variant="secondary" onClick={() => fileRef.current?.click()} data-testid="brand-upload-button">
                {t("brand.upload")}
              </Button>
              {logo && (
                <button onClick={() => setLogo(null)} className="text-left text-xs font-medium text-red-600 hover:underline dark:text-red-400 cursor-pointer">
                  {t("brand.remove")}
                </button>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t("brand.logoHint")}</p>
          {err && <p className="mt-1 text-xs font-medium text-red-600">{err}</p>}
        </div>

        <FormField label={t("brand.name")}>
          <Input value={localName} onChange={(e) => setLocalName(e.target.value)} onBlur={saveName} placeholder={t("brand.namePlaceholder")} />
        </FormField>

        <div className="flex justify-between gap-2 pt-1">
          <Button variant="ghost" onClick={() => { reset(); setLocalName(""); }}>
            {t("brand.reset")}
          </Button>
          <Button onClick={() => { saveName(); onClose(); }} data-testid="brand-done-button">
            {t("action.save")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
