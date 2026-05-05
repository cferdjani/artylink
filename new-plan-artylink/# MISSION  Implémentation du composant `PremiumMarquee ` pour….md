# MISSION : Implémentation du composant `<PremiumMarquee />` pour ArtyLink  
  
## 1. Contexte du Projet & Objectif  
- **Projet :** ArtyLink (Plateforme premium de mise en relation client/artisan en Algérie).  
- **Stack probable :** React / Next.js, Tailwind CSS. Backend : Supabase.  
- **Design System visé :** "Apple 2026". Ultra-minimaliste, fond gris très clair (`#F5F5F7`), ombres extrêmement douces, typographie géométrique lisible (Inter/San Francisco), focus sur l'espace blanc (whitespace).  
- **Objectif :** Créer un bandeau de défilement horizontal infini (Marquee) situé sous le Hero Header. Il fera défiler des artisans Premium et des publicités de partenaires B2B (matériel, services).  
  
## 2. Contraintes UX/UI Strictes (Ne pas dévier)  
- **Fluidité absolue :** L'animation doit être gérée à 100% par CSS (`@keyframes`, `transform: translateX`) pour garantir 60fps. Aucun calcul de position en JavaScript.  
- **Seamless Loop :** La liste des éléments doit être dupliquée au moins une fois dans le DOM pour que la boucle soit infinie sans "saut" visuel.  
- **Interaction :** L'animation doit se mettre en pause lorsque l'utilisateur survole le bandeau (`pause-on-hover`).  
- **Masques de fondu :** Appliquer un dégradé transparent (CSS `mask-image` ou pseudo-éléments `::before`/`::after`) à gauche et à droite du conteneur parent pour que les cartes apparaissent et disparaissent en douceur, sans bord net.  
  
## 3. Structure des Données (Mock JSON)  
Prépare le composant pour accepter un tableau d'objets mixtes (Artisans et Pubs). Voici le schéma attendu :  
  
```json  
[  
  {  
    "id": "art-001",  
    "type": "artisan",  
    "name": "Kamel R.",  
    "profession": "Plomberie & Chauffage",  
    "rating": 4.9,  
    "reviews_count": 124,  
    "is_verified": true,  
    "avatar_url": "/images/mock-artisan1.jpg"  
  },  
  {  
    "id": "ad-001",  
    "type": "sponsor",  
    "brand_name": "Céramique El Djazaïr",  
    "product_desc": "Revêtements Premium 2026",  
    "logo_url": "/images/mock-brand1.png"  
  }  
]  
