alter table public.catalog_products
  add column donut_variants jsonb not null default '[]'::jsonb
  check (jsonb_typeof(donut_variants) = 'array' and jsonb_array_length(donut_variants) <= 15);
comment on column public.catalog_products.donut_variants is
  'Up to 15 selectable donut types: stable id, name, and catalog image_path. Each box slot stores its selected type.';
