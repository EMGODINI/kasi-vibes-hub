-- Insert initial forum entries for RollUp and Stance
INSERT INTO public.forums (name, slug, description, page_slug)
VALUES
  (
    'RollUp Discussions',
    'roll-up-discussions',
    'Discuss all things related to cannabis culture, strains, and experiences.',
    'roll-up'
  ),
  (
    'Stance Community',
    'stance-community',
    'Share your rides, discuss modifications, and connect with fellow car and bike enthusiasts.',
    'stance'
  )
ON CONFLICT (slug) DO NOTHING; -- Prevents re-insertion if migration is run again

