# MISSION : Implémentation UI/UX ArtyLink (Hero, Premium Marquee & Catégories)  
  
## 1. Contexte du Projet & Objectif  
- **Projet :** ArtyLink (Plateforme premium de mise en relation client/artisan en Algérie).  
- **Stack probable :** React / Next.js, Tailwind CSS. Backend : Supabase.  
- **Design System visé :** "Apple 2026". Ultra-minimaliste, fond gris très clair (`#F5F5F7`), ombres extrêmement douces, typographie géométrique lisible (Inter/San Francisco), focus sur l'espace blanc (whitespace).  
- **Objectif Global :** Reproduire fidèlement la maquette visuelle fournie, comprenant le Hero Header épuré, le bandeau de défilement horizontal infini (Marquee) pour les artisans/sponsors, et la grille des catégories en dessous.  
  
## 2. Maquette de Référence  
*(Assurez-vous que l'agent IA a accès à la capture d'écran `image_08aebe.png` pour cibler l'espacement et les proportions exactes).*  
![Maquette de référence ArtyLink](image_08aebe.png)  
  
## 3. Contraintes UX/UI Strictes (Ne pas dévier)  
- **Fluidité absolue du Marquee :** L'animation doit être gérée à 100% par CSS (`@keyframes`, `transform: translateX`) pour garantir 60fps. Aucun calcul de position en JavaScript.  
- **Seamless Loop :** La liste des éléments du bandeau doit être dupliquée au moins une fois dans le DOM pour que la boucle soit infinie sans "saut" visuel.  
- **Interaction :** L'animation doit se mettre en pause lorsque l'utilisateur survole le bandeau (`pause-on-hover`).  
- **Masques de fondu :** Appliquer un dégradé transparent (CSS `mask-image` ou pseudo-éléments `::before`/`::after`) à gauche et à droite du conteneur parent du Marquee pour que les cartes apparaissent et disparaissent en douceur.  
  
## 4. Structure des Données (Mock JSON)  
Prépare les composants pour accepter des données dynamiques. Voici le schéma attendu pour le Marquee :  
  
```json  
[  
  {  
    "id": "art-001",  
    "type": "artisan",  
    "name": "Kamel R.",  
    "profession": "Plomberie & Chauffage",  
    "rating": 4.9,  
    "is_verified": true,  
    "avatar_url": "/images/kamel.jpg"  
  },  
  {  
    "id": "ad-001",  
    "type": "sponsor",  
    "brand_name": "Céramique El Djazaïr",  
    "product_desc": "Revêtements Premium",  
    "logo_url": "/images/ceramique.png"  
  }  
]  
