-- Extended demo seeds: 10 artisans + 5 sponsors
-- Ensure images are uploaded to 'demos' bucket with matching filenames before running.

INSERT INTO public.sponsored_items
    (type, payload, image_path, start_at, end_at, duration_seconds, link)
VALUES
    ('artisan', jsonb_build_object('name','Kamel R.','profession','Plomberie & Chauffage'), 'artisan-01.jpg', now(), now()+interval
'30 days', 28, '/artisan/kamel-r'),
('artisan', jsonb_build_object
('name','Nassima A.','profession','Couture & Réparation'), 'artisan-02.jpg', now
(), now
()+interval '30 days', 28, '/artisan/nassima-a'),
('artisan', jsonb_build_object
('name','Omar B.','profession','Jardinage & Aménagement'), 'artisan-03.jpg', now
(), now
()+interval '20 days', 26, '/artisan/omar-b'),
('artisan', jsonb_build_object
('name','Fatima Z.','profession','Électricité & Domotique'), 'artisan-04.jpg', now
(), now
()+interval '25 days', 30, '/artisan/fatima-z'),
('artisan', jsonb_build_object
('name','Mohamed L.','profession','Peinture & Décoration'), 'artisan-05.jpg', now
(), now
()+interval '18 days', 24, '/artisan/mohamed-l'),
('artisan', jsonb_build_object
('name','Amina S.','profession','Nettoyage & Ménage'), 'artisan-06.jpg', now
(), now
()+interval '22 days', 26, '/artisan/amina-s'),
('artisan', jsonb_build_object
('name','Youssef T.','profession','Mécanique & Carrosserie'), 'artisan-07.jpg', now
(), now
()+interval '16 days', 28, '/artisan/youssef-t'),
('artisan', jsonb_build_object
('name','Rania G.','profession','Céramique & Revêtements'), 'artisan-08.jpg', now
(), now
()+interval '40 days', 30, '/artisan/rania-g'),
('artisan', jsonb_build_object
('name','Salah M.','profession','Bâtiment & Rénovation'), 'artisan-09.jpg', now
(), now
()+interval '34 days', 30, '/artisan/salah-m'),
('artisan', jsonb_build_object
('name','Leila B.','profession','Serrurerie & Sécurité'), 'artisan-10.jpg', now
(), now
()+interval '12 days', 22, '/artisan/leila-b'),

('sponsor', jsonb_build_object
('brand_name','Outils Pro Alger','product_desc','Outillage Expert 2026'), 'sponsor-01.png', now
(), now
()+interval '60 days', 28, 'https://outillage.example'),
('sponsor', jsonb_build_object
('brand_name','Céramique El Djazaïr','product_desc','Revêtements Premium'), 'sponsor-02.png', now
(), now
()+interval '45 days', 30, 'https://ceramique.example'),
('sponsor', jsonb_build_object
('brand_name','ElectroMart DZ','product_desc','Appareils & Équipements'), 'sponsor-03.png', now
(), now
()+interval '50 days', 32, 'https://electromart.example'),
('sponsor', jsonb_build_object
('brand_name','JardinsPro','product_desc','Solutions d’aménagement'), 'sponsor-04.png', now
(), now
()+interval '20 days', 26, 'https://jardinspro.example'),
('sponsor', jsonb_build_object
('brand_name','Mobilier DZ','product_desc','Mobilier & Décoration'), 'sponsor-05.png', now
(), now
()+interval '40 days', 30, 'https://mobilier.example')
ON CONFLICT DO NOTHING;
