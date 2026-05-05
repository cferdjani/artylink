Le site utilise désormais `public/hero-bg-tools.png` comme image d'arrière-plan de la page (appliquée sur le `body`).

Emplacement attendu : `public/hero-bg-tools.png`.

Si vous voulez la remplacer :

- Copier un fichier local :

  cp ~/Downloads/mon-image.png public/hero-bg-tools.png

- Télécharger depuis une URL :

  curl -L -o public/hero-bg-tools.png "https://example.com/path/to/image.png"

Remarque : la classe `home-hero-bg` conserve un léger overlay translucide pour améliorer la lisibilité des éléments glass au-dessus du background.

Recommandation : taille max ~ 1920×1080, format PNG ou WebP pour de meilleures performances.