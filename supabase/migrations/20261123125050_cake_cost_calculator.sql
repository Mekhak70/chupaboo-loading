create table public.finance_cake_cost_settings (
  id boolean primary key default true check(id),
  settings jsonb not null check(jsonb_typeof(settings)='object' and jsonb_typeof(settings->'ingredients')='array' and jsonb_typeof(settings->'profiles')='object' and octet_length(settings::text)<=300000),
  version bigint not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.finance_cake_cost_settings enable row level security;
revoke all on public.finance_cake_cost_settings from anon,authenticated;
grant select,update on public.finance_cake_cost_settings to authenticated;
create policy cake_cost_settings_admin_read on public.finance_cake_cost_settings for select to authenticated
  using ((select auth.uid())='5d86c4c6-a328-47ae-8f8e-4fa97339de14'::uuid);
create policy cake_cost_settings_admin_update on public.finance_cake_cost_settings for update to authenticated
  using ((select auth.uid())='5d86c4c6-a328-47ae-8f8e-4fa97339de14'::uuid)
  with check ((select auth.uid())='5d86c4c6-a328-47ae-8f8e-4fa97339de14'::uuid);
create function public.cake_cost_settings_revision() returns trigger language plpgsql set search_path='' as $$
begin new.version:=old.version+1; new.updated_at:=clock_timestamp(); return new; end;
$$;
create trigger cake_cost_settings_revision before update on public.finance_cake_cost_settings
for each row execute function public.cake_cost_settings_revision();

-- User-provided costs; unprovided material prices and donut costs stay blank.
insert into public.finance_cake_cost_settings(id,settings) values(true,'{"ingredients":[{"id":"CHICKEN","name":"Հավ","category":"meat","pricePerKg":null},{"id":"BEEF","name":"Տավար","category":"meat","pricePerKg":null},{"id":"LAMB","name":"Գառ","category":"meat","pricePerKg":null},{"id":"TURKEY","name":"Հնդկահավ","category":"meat","pricePerKg":null},{"id":"SALMON","name":"Սաղմոն","category":"meat","pricePerKg":null},{"id":"POTATO","name":"Կարտոֆիլ","category":"other","pricePerKg":null},{"id":"CARROT","name":"Գազար","category":"other","pricePerKg":null},{"id":"BROCCOLI","name":"Բրոկոլի","category":"other","pricePerKg":null},{"id":"PUMPKIN","name":"Դդում","category":"other","pricePerKg":null},{"id":"PEPPER","name":"Կանաչ պղպեղ","category":"other","pricePerKg":null},{"id":"ZUCCHINI","name":"Դդմիկ","category":"other","pricePerKg":null},{"id":"CAULIFLOWER","name":"Ծաղկակաղամբ","category":"other","pricePerKg":null},{"id":"SWEET_POTATO","name":"Բատատ","category":"other","pricePerKg":null},{"id":"SPINACH","name":"Սպանախ","category":"other","pricePerKg":null},{"id":"RICE","name":"Բրինձ","category":"other","pricePerKg":null},{"id":"WHEAT","name":"Հնդկաձավար","category":"other","pricePerKg":null},{"id":"OATS","name":"Վարսակ","category":"other","pricePerKg":null},{"id":"APPLE","name":"Խնձոր","category":"other","pricePerKg":null},{"id":"BANANA","name":"Բանան","category":"other","pricePerKg":null},{"id":"PEAR","name":"Տանձ","category":"other","pricePerKg":null},{"id":"ELDERBERRY","name":"Հապալաս","category":"other","pricePerKg":null},{"id":"STRAWBERRY","name":"Ելակ","category":"other","pricePerKg":null},{"id":"MANGO","name":"Մանգո","category":"other","pricePerKg":null},{"id":"DAIRY","name":"Կաթնային","category":"other","pricePerKg":null},{"id":"PLANTBASEDMILK","name":"Բուսական կաթով","category":"other","pricePerKg":null},{"id":"PLANTBASED","name":"Բուսական","category":"other","pricePerKg":null}],"photoMode":"replace","profiles":{"MINI":{"fixed":{"box":70,"candle":50,"bag":100,"sticker":70,"cream":100,"baking":500,"advertising":1000},"meatId":"CHICKEN","meatGrams":50,"grams":{},"photoPreparation":5000},"MIDI":{"fixed":{"box":170,"candle":50,"bag":0,"sticker":70,"cream":200,"baking":1000,"advertising":1000},"meatId":"CHICKEN","meatGrams":100,"grams":{},"photoPreparation":5000},"STANDARD":{"fixed":{"box":400,"candle":70,"bag":0,"sticker":100,"cream":300,"baking":2000,"advertising":1000},"meatId":"CHICKEN","meatGrams":250,"grams":{},"photoPreparation":5000},"DONUT":{"fixed":{"box":null,"candle":null,"bag":null,"sticker":null,"cream":null,"baking":null,"advertising":null},"meatId":"CHICKEN","meatGrams":null,"grams":{},"photoPreparation":5000}}}'::jsonb);
