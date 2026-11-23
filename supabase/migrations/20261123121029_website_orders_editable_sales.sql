-- Website checkout stays pending until the administrator confirms the sale.
create function public.finance_section_amount(p_items jsonb, p_section text)
returns numeric language sql immutable set search_path = '' as $$
  select coalesce(sum(round((entry->>'unit_price')::numeric,2)*(entry->>'quantity')::integer),0)
  from pg_catalog.jsonb_array_elements(p_items) entry where entry->>'section'=p_section;
$$;

alter table public.finance_orders
  add column cake_total numeric generated always as (public.finance_section_amount(items,'cake')) stored,
  add column party_total numeric generated always as (public.finance_section_amount(items,'party')) stored,
  add column available_total numeric generated always as (public.finance_section_amount(items,'available')) stored,
  add column updated_at timestamptz not null default now();

create function public.finance_order_revision() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := clock_timestamp(); return new; end;
$$;
create trigger finance_order_revision before update on public.finance_orders
for each row execute function public.finance_order_revision();

-- Narrow public entry point: anonymous customers can submit a pending order,
-- but cannot read orders, confirm sales, set costs or edit existing orders.
create function public.submit_website_order(p_id uuid, p_payload jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare entry jsonb; phone_value text;
begin
  if p_id is null or jsonb_typeof(p_payload) is distinct from 'object'
    or octet_length(p_payload::text)>250000
    or jsonb_typeof(p_payload->'items') is distinct from 'array'
    or jsonb_typeof(p_payload->'delivery') is distinct from 'object'
    then raise exception 'Invalid checkout'; end if;
  if jsonb_array_length(p_payload->'items') not between 1 and 100 then raise exception 'Invalid items'; end if;
  phone_value := trim(coalesce(p_payload->>'phone',''));
  if length(phone_value) not between 3 and 50 then raise exception 'Invalid phone'; end if;
  for entry in select value from jsonb_array_elements(p_payload->'items') loop
    if length(coalesce(entry->>'id','')) not between 1 and 200
      or length(trim(coalesce(entry->>'name',''))) not between 1 and 200
      or jsonb_typeof(entry->'quantity') is distinct from 'number'
      or jsonb_typeof(entry->'price') is distinct from 'number'
      or (entry->>'quantity')::numeric <> trunc((entry->>'quantity')::numeric)
      then raise exception 'Invalid item'; end if;
  end loop;
  p_payload:=p_payload || jsonb_build_object('delivery',p_payload->'delivery'||jsonb_build_object('source','website'));
  -- Retries keep the same id and payload, even after an administrator edits it.
  if exists(select 1 from public.finance_orders where id=p_id) then
    return public.record_finance_checkout(p_id,p_payload);
  end if;
  perform pg_advisory_xact_lock(hashtextextended(phone_value,0));
  if (select count(*) from public.finance_orders where phone=phone_value and created_at>now()-interval '1 minute')>=5
    then raise exception 'Too many orders. Please try again shortly.'; end if;
  return public.record_finance_checkout(p_id,p_payload);
end;
$$;
revoke all on function public.submit_website_order(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.submit_website_order(uuid,jsonb) to anon,authenticated,service_role;

create function public.edit_finance_order(p_id uuid, p_expected_updated_at timestamptz, p_payload jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare saved public.finance_orders%rowtype; entry jsonb; original jsonb; result_items jsonb:='[]';
  quantity_value integer; price_value numeric; cost_value numeric; fee numeric; total numeric:=0;
  date_value date; ordinal integer:=0;
begin
  if auth.uid() is distinct from '5d86c4c6-a328-47ae-8f8e-4fa97339de14'::uuid then raise exception 'Admin access required'; end if;
  select * into saved from public.finance_orders where id=p_id for update;
  if not found then raise exception 'Order not found'; end if;
  if p_expected_updated_at is null or saved.updated_at is distinct from p_expected_updated_at then
    raise exception 'Պատվերը փոփոխվել է։ Թարմացրու ցուցակը և կրկին փորձիր։'; end if;
  if jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>250000
    or jsonb_typeof(p_payload->'items') is distinct from 'array' then raise exception 'Invalid order'; end if;
  if jsonb_array_length(p_payload->'items')<>jsonb_array_length(saved.items) then raise exception 'Order items changed'; end if;
  if length(coalesce(p_payload->>'phone',''))>50 or length(coalesce(p_payload->>'address',''))>500
    or length(coalesce(p_payload->>'notes',''))>2000 or length(coalesce(p_payload->>'nationality',''))>100
    then raise exception 'Customer details too long'; end if;
  if coalesce(p_payload->>'deliveryDate','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'Invalid delivery date'; end if;
  date_value:=(p_payload->>'deliveryDate')::date;
  if jsonb_typeof(p_payload->'deliveryFee') is distinct from 'number' then raise exception 'Invalid delivery fee'; end if;
  fee:=(p_payload->>'deliveryFee')::numeric;
  if fee<0 or fee>9999999999.99 then raise exception 'Invalid delivery fee'; end if;
  for entry in select value from jsonb_array_elements(p_payload->'items') loop
    original:=saved.items->ordinal;
    if length(trim(coalesce(entry->>'name',''))) not between 1 and 200
      or jsonb_typeof(entry->'quantity') is distinct from 'number'
      or jsonb_typeof(entry->'unit_price') is distinct from 'number'
      or (entry->>'quantity')::numeric<>trunc((entry->>'quantity')::numeric)
      then raise exception 'Invalid item'; end if;
    quantity_value:=(entry->>'quantity')::integer;
    price_value:=(entry->>'unit_price')::numeric;
    if quantity_value not between 1 and 10000 or price_value<0 or price_value>9999999999.99 then raise exception 'Invalid quantity or price'; end if;
    cost_value:=null;
    if original->>'section'='party' then
      cost_value:=nullif(entry->>'unit_cost','')::numeric;
      if cost_value<0 or cost_value>9999999999.99 then raise exception 'Invalid unit cost'; end if;
    end if;
    total:=total+round(price_value,2)*quantity_value;
    if total>999999999999.99 then raise exception 'Order total too large'; end if;
    result_items:=result_items||jsonb_build_array(original||jsonb_build_object(
      'name',trim(entry->>'name'),'quantity',quantity_value,'unit_price',round(price_value,2),'unit_cost',round(cost_value,2)));
    ordinal:=ordinal+1;
  end loop;
  update public.finance_orders set phone=trim(coalesce(p_payload->>'phone','')),
    business_date=date_value,items=result_items,delivery_fee=round(fee,2),product_total=total,
    delivery_info=saved.delivery_info||jsonb_build_object('deliveryDate',date_value::text,
      'deliveryAddress',trim(coalesce(p_payload->>'address','')),'notes',coalesce(p_payload->>'notes',''),
      'nationality',trim(coalesce(p_payload->>'nationality','')),'month',to_char(date_value,'YYYY-MM'))
    where id=p_id;
  return p_id;
end;
$$;
revoke all on function public.edit_finance_order(uuid,timestamptz,jsonb) from public,anon,authenticated;
grant execute on function public.edit_finance_order(uuid,timestamptz,jsonb) to authenticated;
