import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useI18n } from "../../i18n/I18nContext";

export interface ReportField {
  label: string;
  value: string;
}
export interface ReportSection {
  heading: string;
  fields?: ReportField[];
  items?: string[];
}
export interface Report {
  title: string;
  reference?: string;
  meta?: ReportField[];
  sections: ReportSection[];
}

interface PrintContextValue {
  printReport: (report: Report) => void;
}

const PrintContext = createContext<PrintContextValue | undefined>(undefined);

export function PrintProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [report, setReport] = useState<Report | null>(null);

  const printReport = useCallback((r: Report) => {
    setReport(r);
    requestAnimationFrame(() => {
      setTimeout(() => window.print(), 60);
    });
  }, []);

  return (
    <PrintContext.Provider value={{ printReport }}>
      {children}
      <div className="print-area" aria-hidden="true">
        {report && (
          <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", maxWidth: 720, margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "3px solid #00597d",
                paddingBottom: 16,
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "#b4d333",
                    color: "#01293a",
                    fontWeight: 800,
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  GP
                </span>
                <div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, color: "#01293a" }}>
                    {t("app.name")}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{t("app.tagline")}</div>
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: 11, color: "#64748b" }}>
                {t("report.generatedOn")} {new Date().toLocaleDateString()}
              </div>
            </div>

            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "#0e2733", margin: "0 0 4px" }}>
              {report.title}
            </h1>
            {report.reference && (
              <div style={{ fontSize: 13, color: "#00597d", fontWeight: 600, marginBottom: 20 }}>
                {t("report.reference")}: {report.reference}
              </div>
            )}

            {report.meta && report.meta.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px 24px",
                  background: "#f3f6f8",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 24,
                }}
              >
                {report.meta.map((f, i) => (
                  <div key={i} style={{ fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>{f.label}: </span>
                    <span style={{ color: "#0e2733", fontWeight: 600 }}>{f.value}</span>
                  </div>
                ))}
              </div>
            )}

            {report.sections.map((s, si) => (
              <section key={si} style={{ marginBottom: 22 }}>
                <h2
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#00597d",
                    borderBottom: "1px solid #cfe2eb",
                    paddingBottom: 6,
                    margin: "0 0 12px",
                  }}
                >
                  {s.heading}
                </h2>
                {s.fields && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
                    {s.fields.map((f, i) => (
                      <div key={i} style={{ fontSize: 13 }}>
                        <div style={{ color: "#64748b", fontSize: 11 }}>{f.label}</div>
                        <div style={{ color: "#0e2733", fontWeight: 600 }}>{f.value || "—"}</div>
                      </div>
                    ))}
                  </div>
                )}
                {s.items && (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {s.items.length === 0 && <li style={{ color: "#94a3b8", listStyle: "none", marginLeft: -18 }}>—</li>}
                    {s.items.map((it, i) => (
                      <li key={i} style={{ fontSize: 13, color: "#0e2733", marginBottom: 4 }}>
                        {it}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </PrintContext.Provider>
  );
}

export function usePrint() {
  const ctx = useContext(PrintContext);
  if (!ctx) throw new Error("usePrint must be used within PrintProvider");
  return ctx;
}
