-- Execute no SQL Editor do Supabase antes de publicar a integração.
alter table contributions
  add column if not exists payment_provider text not null default 'mercadopago',
  add column if not exists infinitepay_transaction_nsu text,
  add column if not exists infinitepay_slug text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'contributions_payment_provider_check'
  ) then
    alter table contributions
      add constraint contributions_payment_provider_check
      check (payment_provider in ('mercadopago', 'infinitepay'));
  end if;
end $$;
