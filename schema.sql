-- Run this in your Supabase dashboard → SQL Editor

create table if not exists categories (
  id text primary key,
  label text not null,
  icon text not null default 'dots',
  color text not null default 'var(--cat-8)',
  sort_order int default 0
);

create table if not exists fixed_expenses (
  id text primary key,
  label text not null,
  amount numeric(12,2) not null,
  category_id text references categories(id) on delete set null
);

create table if not exists expenses (
  id text primary key,
  date timestamptz not null,
  amount numeric(12,2) not null,
  category_id text references categories(id) on delete set null,
  note text
);

create table if not exists settings (
  id int primary key default 1,
  budget numeric(12,2) default 2400,
  currency text default 'USD',
  currency_symbol text default '$',
  include_fixed_in_total boolean default true,
  dark_mode boolean default false,
  constraint single_row check (id = 1)
);

-- Disable RLS (personal app, single user)
alter table categories disable row level security;
alter table fixed_expenses disable row level security;
alter table expenses disable row level security;
alter table settings disable row level security;

-- Seed categories
insert into categories (id, label, icon, color, sort_order) values
  ('groceries',     'Groceries',     'shop',  'var(--cat-1)', 0),
  ('dining',        'Dining out',    'fork',  'var(--cat-3)', 1),
  ('transport',     'Transport',     'car',   'var(--cat-2)', 2),
  ('shopping',      'Shopping',      'bag',   'var(--cat-4)', 3),
  ('entertainment', 'Entertainment', 'film',  'var(--cat-5)', 4),
  ('health',        'Health',        'heart', 'var(--cat-6)', 5),
  ('bills',         'Bills',         'bolt',  'var(--cat-7)', 6),
  ('other',         'Other',         'dots',  'var(--cat-8)', 7)
on conflict (id) do nothing;

-- Seed fixed expenses
insert into fixed_expenses (id, label, amount, category_id) values
  ('f1', 'Rent',             1850, 'bills'),
  ('f2', 'Internet',         65,   'bills'),
  ('f3', 'Phone plan',       38,   'bills'),
  ('f4', 'Streaming bundle', 24,   'entertainment'),
  ('f5', 'Gym',              42,   'health')
on conflict (id) do nothing;

-- Seed settings
insert into settings (id, budget, currency, currency_symbol, include_fixed_in_total, dark_mode)
values (1, 2400, 'USD', '$', true, false)
on conflict (id) do nothing;
