# Politique de Dévelopement et de Sécurité
## Plateforme Artisans V1

### 1. Cycle de Développement
- **Branches** : `main` (production), `develop` (intégration continue), `feature/*` pour tout nouveau développement.
- **Code Review** : Toute `Pull Request` vers `develop` doit être revue par un Pair. Tests unitaires exigés sur la logique critique (Authentification, Modération, Sponsoring).
- **Versioning** : SemVer (Majeur.Mineur.Correctif).
- **Mises à jour dépendances** : Audit mensuel via `dart pub outdated`.

### 2. Sécurité Applicative (Row-Level Security - RLS)
- Les profils (`profiles`) et professionnels (`artisans`) sont publics en lecture pour les utilisateurs actifs, mais l'édition est strictement réservée à l'ID authentifié.
- **Modération** : Les avis (`reviews`) sont soumis au statut `is_visible` avant affichage public (pré-modération V1).
- **Audit Logs** : Activité réécrite automatiquement de Supabase vers la table `audit_logs` locale (immuable, accès Admin uniquement).
- **Données Sensibles (PII)** : Masquage par défaut. Les adresses complètes et téléphones ne sont affichés qu'aux professionnels lors d'un booking confirmé.

### 3. Modération et Gouvernance Marketing
- La publicité (bannière auto) et les sections sponsorisées n'acceptent que des formats pré-approuvés.
- Le ciblage marketing est autorisé sans tracker tiers, uniquement sur données first-party.
- Les professionnels certifiés sont favorisés dans la recherche.
- Procédure de plainte et d'appel disponible pour tous les avis masqués.

### 4. Maintenance / Continuité Métier (BCP/DRP)
- **Objectif de Continuité (RTO)** : 4 heures en cas de crash majeur de l'API.
- **Backups** : Auto PIRT/PITR (Point-in-Time-Recovery) via Supabase quotidien.
- Incident Runbook disponible pour l'équipe DevOps.
