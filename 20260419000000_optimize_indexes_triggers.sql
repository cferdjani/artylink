-- Standardisation Trigger updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Application aux tables principales
DROP TRIGGER IF EXISTS update_artisans_modtime ON public.artisans;
CREATE TRIGGER update_artisans_modtime BEFORE UPDATE ON public.artisans FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Indexation des clés étrangères pour performances
CREATE INDEX IF NOT EXISTS idx_artisans_city_id ON public.artisans(city_id);
CREATE INDEX IF NOT EXISTS idx_bookings_artisan_id ON public.bookings(artisan_id);
CREATE INDEX IF NOT EXISTS idx_artisan_categories_category_id ON public.artisan_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_rfq_posts_category_id ON public.rfq_posts(category_id);