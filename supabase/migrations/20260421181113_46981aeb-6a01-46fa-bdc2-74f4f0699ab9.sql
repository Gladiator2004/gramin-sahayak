
CREATE TABLE public.bulletin_translations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bulletin_id uuid NOT NULL REFERENCES public.bulletin_items(id) ON DELETE CASCADE,
  language text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_bulletin_translations_unique ON public.bulletin_translations (bulletin_id, language);
CREATE INDEX idx_bulletin_translations_lang ON public.bulletin_translations (language);

ALTER TABLE public.bulletin_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read bulletin translations"
  ON public.bulletin_translations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service can insert translations"
  ON public.bulletin_translations
  FOR INSERT
  TO public
  WITH CHECK (true);
