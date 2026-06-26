alter table public.digital_products add column if not exists protected_storage_path text;

update public.digital_products set protected_storage_path = 'paid/7-day-body-ritual-guide.pdf' where id = '7-day-body-ritual-guide';
update public.digital_products set protected_storage_path = 'paid/bathroom-reset-cards.pdf' where id = 'bathroom-reset-cards';
update public.digital_products set protected_storage_path = 'paid/ritual-journal.pdf' where id = 'ritual-journal';
update public.digital_products set protected_storage_path = 'paid/self-care-planner.pdf' where id = 'self-care-planner';
update public.digital_products set protected_storage_path = 'paid/glow-scent-bundle.zip' where id = 'glow-scent-bundle';
update public.digital_products set protected_storage_path = 'paid/ritual-vault.zip' where id = 'ritual-vault';
