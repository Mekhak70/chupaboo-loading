alter table public.catalog_products add column ingredient_prices jsonb;
alter table public.catalog_products add constraint catalog_ingredient_prices_valid check (
  ingredient_prices is null or (
    section = 'cake' and product_kind = 'CAKE'
    and jsonb_typeof(ingredient_prices) = 'object'
    and ingredient_prices ?& array['CHICKEN','BEEF','LAMB','TURKEY','SALMON','POTATO','CARROT','BROCCOLI','PUMPKIN','PEPPER','ZUCCHINI','CAULIFLOWER','SWEET_POTATO','SPINACH','RICE','WHEAT','OATS','APPLE','BANANA','PEAR','ELDERBERRY','STRAWBERRY','MANGO','DAIRY','PLANTBASEDMILK','PLANTBASED']
    and not jsonb_path_exists(ingredient_prices, '$.* ? (@.type() != "number" || @ < 0 || @ > 100000000)')
  )
);
comment on column public.catalog_products.ingredient_prices is
  'Per-cake ingredient amounts for this exact size. NULL preserves legacy pricing. Configured cakes sum selected meat, produce/grains and cream; no base price or size scaling is added.';
