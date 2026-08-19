# PRD — Gestion de Parc Informatique (Refonte UI/UX)

## Problème initial
"Refais moi l'interface de ce projet Gestion-de-parc-informatique — le dossier frontend contient le frontend du projet."

## Stack
- **Frontend**: React 19 + TypeScript + Vite 8 + Tailwind CSS v4 (dossier `/app/frontend`)
- **Backend**: .NET (C#, Clean Architecture) dans `/app/backend` — NON MODIFIÉ. Non exécutable dans ce pod (dotnet absent). API consommée via `VITE_API_URL` (défaut `http://localhost:5080/api`).
- Données: React Query + Axios (couche `src/api` inchangée).

## Choix utilisateur (ask_human)
- Style: Moderne & épuré
- Portée: Refonte complète avec nouveaux composants
- Backend: ne pas toucher (conservé tel quel)
- Charte: bleu **#00597D** + vert lime **#B4D333**, logo texte "Gestion Parc IT"
- Langue: **Bilingue FR/EN**

## Réalisé (2026-06)
- **Design system** (`index.css`): palette de marque (brand blue + lime), typographies Sora (titres) + Plus Jakarta Sans (corps), animations (fade-up, scale-in), fond mesh de marque, scrollbars custom, respect prefers-reduced-motion.
- **i18n FR/EN** maison (`src/i18n/`): provider + `t()` + libellés d'enums traduits, persistance `localStorage`, sélecteur de langue (topbar + login).
- **Composants UI redesignés**: Button (5 variantes), Input, Select (chevron custom), FormField, Modal (blur + focus trap), Badge, StatCard (tuiles), Table (skeleton, empty state, hover), PageHeader (nouveau), Icons (jeu étendu).
- **Layout** (`AppLayout`): sidebar sombre de marque avec icônes + indicateur actif lime, carte compte + déconnexion, topbar sticky avec titre de page et bascule FR/EN, **responsive** (drawer mobile).
- **LoginPage**: écran split (panneau de marque + formulaire), bilingue.
- **8 pages** retravaillées et traduites: Clients, Parcs, Équipements (stats + filtres + recherche), Contrats, Factures récurrentes, Interventions (multi-sections), Techniciens, Produits.
- **data-testid** ajoutés sur les éléments interactifs clés.
- Infra: ajout du script `start` (Vite) pour supervisor, `vite.config.ts` (host/allowedHosts/HMR wss).

## Vérification
- `yarn build` (tsc -b + vite build) **OK, 0 erreur TypeScript** sur tout le code refondu.
- Page de login rendue et validée visuellement (bascule FR/EN OK).
- Pages authentifiées non capturables ici (backend .NET non exécutable → 401/redirect login). Logique et types validés par le build.

## Backlog / Next
- P2: Graphiques temporels (interventions par mois) sur le tableau de bord.
- P2: Filtres avancés & export CSV des listes.

## Itération 2 (2026-06) — 4 fonctionnalités ajoutées
- **Tableau de bord** (`DashboardPage`, route `/`) : 8 KPIs cliquables (équipements, pannes ouvertes, interventions ouvertes, garanties <30j, contrats actifs, factures impayées, clients, produits) + panneaux « Interventions récentes », « Alertes de garantie », « Statut des factures » (barres). Clients déplacé sur `/clients`.
- **Mode sombre** : `ThemeProvider` (classe `.dark`, persistance localStorage), variante Tailwind v4 `@custom-variant dark`, bouton lune/soleil dans la topbar, variantes `dark:` sur tous les composants et surfaces de pages.
- **Fiche équipement** : clic sur une ligne ouvre un `Drawer` latéral (infos, réseau/système, historique des pannes avec statuts) + actions Imprimer / Rapport PDF / Modifier.
- **Rapports imprimables** : `PrintProvider` + document de marque A4 (`PrintReport`) et CSS `@media print`. Boutons « Imprimer » sur Contrats, Interventions et Fiche équipement (rendu élégant sans dépendre du PDF backend).
- Vérif : `yarn build` (tsc + vite) **0 erreur** ; dev server HTTP 200. Pages authentifiées non capturables ici (backend .NET non exécutable).

## Itération 3 (2026-06) — 3 fonctionnalités ajoutées
- **Personnalisation de la marque** : `BrandProvider` (logo image en dataURL + nom affiché, persistés localStorage), composant `LogoMark`, modale de réglages (bouton engrenage dans la topbar) avec upload/retrait de logo et nom. Le logo/nom s'appliquent à la sidebar, au login et à l'en-tête des rapports imprimés.
- **Recherche globale** : composant `GlobalSearch` dans la topbar (clients, équipements, interventions), résultats groupés avec navigation clavier (↑/↓/Entrée/Échap) et clic → page concernée.
- **Export CSV** : utilitaire `lib/csv.ts` (séparateur `;` + BOM UTF-8 pour Excel), bouton « Exporter CSV » sur toutes les listes (Clients, Parcs, Équipements [vue filtrée], Contrats, Factures, Interventions, Techniciens, Produits).
- Vérif : `yarn build` **0 erreur** ; app démarre correctement (login rendu). Fonctions authentifiées non capturables en aperçu (backend .NET non exécutable).

## Notes
- Aucun compte d'auth créé/modifié par la refonte (auth gérée côté backend .NET). Identifiant par défaut affiché sur le login: `admin@gestionparc.local` (seed backend).
