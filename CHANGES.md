2026-04-06 — UI tweaks

- Réduit taille des polices des `ItemCard` (`src/components/features/artisan-list.tsx`): nom, titre de service, notes et localisation légèrement diminués pour compacter l'affichage.
- Rendu le bouton "Vue filtres classique" moins opaque (`src/app/recherche/[category]/[wilaya]/[commune]/page.tsx`): classe `bg-primary/80`.
- Amélioré la visibilité du texte de tri ("Tri: profils verifies...") en le passant en `font-medium` et `text-text-primary`.
- Rendu le compteur de résultats cliquable et plus visible : `totalCount` est maintenant un lien vers l'ancre `#results` et met en évidence la bulle de résultat.
- Ajout de l'identifiant `#results` autour de la liste des artisans afin que le lien fasse défiler vers les résultats (page locale de recherche).
- Ajustements CSS pour background et glass déjà appliqués (voir `src/app/globals.css`).

Ces changements sont committés localement dans les fichiers ci-dessus.

2026-04-06 — Réduction police catégories

- Réduit la taille des icônes et du texte dans les item cards des catégories (`src/components/features/category-grid.tsx`): icônes passées à `h-6 w-6`, textes des catégories à `text-[13px]` pour un affichage plus compact.

Fichiers modifiés:
- `src/components/features/category-grid.tsx`

