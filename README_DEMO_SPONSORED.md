Démo : Sponsorisé / Marquee

1) Créer la table (supabase SQL ou psql):

psql <sql/001_create_sponsored_items.sql

ou via Supabase SQL editor: collez le contenu de `sql/001_create_sponsored_items.sql` et exécutez.

2) Uploader les images de démo dans un bucket `demos` (public):

- Placez images dans `public/images` (ex: mock-artisan1.jpg, mock-artisan2.jpg, mock-brand1.png)
- Utilisez `scripts/upload-demo-images.sh` (nécessite `supabase` CLI authentifié) :

```
chmod +x scripts/upload-demo-images.sh
./scripts/upload-demo-images.sh public/images
```

3) Assurez-vous que les URLs publiques fonctionnent: `https://<PROJECT>.supabase.co/storage/v1/object/public/demos/mock-artisan1.jpg`

4) Build and run:

```
cd artisans_web
npm install
npm run build
npm run dev
```

Notes
- Le helper server `src/lib/sponsored-server.ts` convertit `image_path` en URL publique en utilisant `NEXT_PUBLIC_SUPABASE_URL`.
- Si vous ne souhaitez pas utiliser Supabase, le composant `PremiumMarqueeExample` utilise des `MOCK_ITEMS` en fallback.

Extras: appliquer policies, seeds et upload

1) Appliquer les policies RLS recommandées (ex: `sql/002_sponsored_and_rls.sql`)

	- Ouvrez Supabase → SQL Editor → collez et exécutez le contenu de `sql/002_sponsored_and_rls.sql`.

2) Uploader les images de démo

	- Placez vos images dans `public/images` en respectant ces noms (ou ajustez les `image_path` de `sql/003_extended_sponsored_seeds.sql`):
	  - artisans: `artisan-01.jpg` ... `artisan-10.jpg`
	  - sponsors: `sponsor-01.png` ... `sponsor-05.png`

	- Utilisez le script fourni (supabase CLI authentifié) :

```
chmod +x scripts/upload-demo-images.sh
./scripts/upload-demo-images.sh public/images
```

3) Insérer les seeds étendus

	- Dans Supabase SQL Editor, exécutez :

```
psql < sql/001_create_sponsored_items.sql
psql < sql/003_extended_sponsored_seeds.sql
```

	- Ou collez les contenus directement dans l'éditeur SQL de Supabase et exécutez.

4) Vérifier

	- Accédez à l'URL: `https://<PROJECT>.supabase.co/storage/v1/object/public/demos/artisan-01.jpg` pour vérifier l'upload.

Notes de sécurité

- Si vous activez la lecture publique (`GRANT SELECT TO anon;`) pour `sponsored_items`, les items seront visibles sans authentification.
- Pour un contrôle plus fin, lisez via le serveur (Server Component) avec la policy désactivant l'accès anonyme.


Security
- Pour uploads automatisés via API, utilisez une clé de service côté serveur; évitez d'exposer la clé publique pour uploads sensibles.
