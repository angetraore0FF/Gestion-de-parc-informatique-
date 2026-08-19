import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "./i18n/I18nContext";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppLayout } from "./layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { ClientsPage } from "./pages/ClientsPage";
import { ParcsPage } from "./pages/ParcsPage";
import { EquipementsPage } from "./pages/EquipementsPage";
import { ContratsPage } from "./pages/ContratsPage";
import { FacturesRecurrentesPage } from "./pages/FacturesRecurrentesPage";
import { InterventionsPage } from "./pages/InterventionsPage";
import { TechniciensPage } from "./pages/TechniciensPage";
import { ProduitsPage } from "./pages/ProduitsPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<ClientsPage />} />
                  <Route path="/parcs" element={<ParcsPage />} />
                  <Route path="/equipements" element={<EquipementsPage />} />
                  <Route path="/contrats" element={<ContratsPage />} />
                  <Route path="/factures-recurrentes" element={<FacturesRecurrentesPage />} />
                  <Route path="/interventions" element={<InterventionsPage />} />
                  <Route
                    path="/techniciens"
                    element={
                      <ProtectedRoute
                        roles={["Admin", "GestionnaireParc", "GestionnaireIntervention", "Technicien"]}
                      />
                    }
                  >
                    <Route index element={<TechniciensPage />} />
                  </Route>
                  <Route
                    path="/produits"
                    element={
                      <ProtectedRoute
                        roles={["Admin", "GestionnaireParc", "GestionnaireIntervention", "Technicien"]}
                      />
                    }
                  >
                    <Route index element={<ProduitsPage />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}
