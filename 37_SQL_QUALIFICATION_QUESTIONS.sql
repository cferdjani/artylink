-- =========================================================================
-- SPRINT 2 : FILTRE DE QUALIFICATIONS MÉTIER 
-- =========================================================================

CREATE TABLE
IF NOT EXISTS public.qualification_templates
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
    category_slug TEXT UNIQUE NOT NULL,
    schema_json JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE
IF NOT EXISTS public.qualification_answers
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
    artisan_id UUID NOT NULL REFERENCES public.artisans
(id) ON
DELETE CASCADE,
    answers_json JSONB
NOT NULL DEFAULT '{}'::jsonb,
    UNIQUE
(artisan_id)
);

-- Insertion de données de test pour 'plomberie-gaz'
INSERT INTO public.qualification_templates
    (category_slug, schema_json)
VALUES
    (
        'plomberie-gaz',
        '[
        {
            "id": "q_type_intervention",
            "label": "Type d''intervention",
            "type": "select",
            "options": ["Urgence (fuite, panne)", "Installation neuve", "Entretien régulier"]
        },
        {
            "id": "q_certifications",
            "label": "Certifications requises",
            "type": "checkbox",
            "options": ["Agréé Sonelgaz", "Normes sécurité ISO"]
        }
    ]'
::jsonb
) ON CONFLICT
(category_slug) DO
UPDATE SET schema_json = EXCLUDED.schema_json;

-- RLS Polices rapides
ALTER TABLE public.qualification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualification_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY
IF EXISTS "Public can view templates" ON public.qualification_templates;
CREATE POLICY "Public can view templates" ON public.qualification_templates FOR
SELECT USING (true);

DROP POLICY
IF EXISTS "Public can view answers" ON public.qualification_answers;
CREATE POLICY "Public can view answers" ON public.qualification_answers FOR
SELECT USING (true);
