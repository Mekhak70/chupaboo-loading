alter table public.catalog_products
  add column donut_three_price numeric(12,2) not null default 10000
  check (donut_three_price >= 0);
-- Donut price now means one piece, rather than a fixed six-piece box.
update public.catalog_products set price=3500 where product_kind='DONUT_BOX';
comment on column public.catalog_products.donut_three_price is
  'Base price for each group of three donuts. Remaining pieces use price. Boxes contain two to six pieces.';
