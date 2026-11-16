alter table public.catalog_products
  add column additional_image_paths text[] not null default '{}';
alter table public.catalog_products
  add constraint catalog_product_gallery_check check (
    cardinality(additional_image_paths) <= 9
    and array_position(additional_image_paths, null) is null
    and array_to_string(additional_image_paths, ',') !~ '(^|,)(?!catalog/)[^,]+'
  );

-- Keep the existing admin authorization and atomic product/cost save.
-- Older clients omit this field, so their edits preserve the gallery.
do $migration$
declare definition text;
begin
  select pg_get_functiondef('public.save_party_catalog_product(jsonb,numeric,boolean)'::regprocedure) into definition;
  if position('if p_cost is null then' in definition) = 0 then
    raise exception 'Unexpected PartyShop save function';
  end if;
  definition := replace(definition, 'if p_cost is null then', $body$
  if p_product ? 'additional_image_paths' then
    if jsonb_typeof(p_product->'additional_image_paths') <> 'array' then
      raise exception 'Invalid gallery';
    end if;
    update public.catalog_products
    set additional_image_paths = array(select jsonb_array_elements_text(p_product->'additional_image_paths'))
    where id::text=v_product_id and section='party';
  end if;
  if p_cost is null then
  $body$);
  execute definition;
end $migration$;
