-- Applied to the connected Chupaboo project using Supabase MCP.
alter table public.catalog_products
  add column product_kind text not null default 'CAKE';
alter table public.catalog_products
  add constraint catalog_products_product_kind_check
  check (product_kind in ('CAKE', 'DONUT_BOX')
    and (product_kind <> 'DONUT_BOX' or section = 'cake'));
comment on column public.catalog_products.product_kind is
  'CAKE uses standard cake customization; DONUT_BOX is a fixed-price box of six individually configured donuts.';
