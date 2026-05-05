# Continuité — Exécution migrations SQL (traces pour prochaine conversation)

Fichier ajouté le 2026-04-08 pour garder une trace des modifications et faciliter la reprise par un autre contributeur ou lors d'une nouvelle conversation.

Fichiers créés:

- `migrations/2026_04_08_add_indexes.sql` — création d'indexes recommandés (FK, colonnes filtrées, index partiel pour notifications non-lues, suggestions trigram).
- `migrations/2026_04_08_set_updated_at_trigger.sql` — fonction `set_updated_at()` et triggers conditionnels pour tables possédant `updated_at`.

Commandes suggérées pour appliquer localement (depuis la racine du repo):

```bash
# Démarrer Postgres (docker)
docker run --name artisans-db -e POSTGRES_PASSWORD=postgres -v "/Users/mac/Downloads/file copie 17":/workspace -p 5432:5432 -d postgres:15

# Appliquer migrations (exemples)
docker exec -i artisans-db psql -U postgres -f /workspace/migrations/2026_04_08_add_indexes.sql
docker exec -i artisans-db psql -U postgres -f /workspace/migrations/2026_04_08_set_updated_at_trigger.sql

# Pour tester pleinement, exécuter d'abord les scripts de schema/seed nécessaires
# (voir artisans_platform_docs/README.md et les fichiers .sql dans artisans_platform_docs/)
```

Points d'attention pour la reprise:
- Certains migrations supposent l'existence des tables ; si vous exécutez les migrations d'indexes avant la création des tables, psql signalera des erreurs — appliquer les migrations dans l'ordre attendu.
- Vérifier la présence des extensions : `pg_trgm` (pour trigram indexes) et `pgcrypto`/`uuid-ossp` si vous souhaitez standardiser UUID.
- Les triggers sont créés conditionnellement en vérifiant l'existence des colonnes; néanmoins, valider leur présence sur la base cible.

Si tu veux, je peux lancer ces commandes et rapporter les erreurs rencontrées dans le conteneur Docker. Dis-moi si je dois exécuter maintenant.
