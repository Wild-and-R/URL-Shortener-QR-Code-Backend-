-- Enable RLS
alter table profiles enable row level security;
alter table links enable row level security;
alter table clicks enable row level security;

-- Profiles
create policy "Users can view own profile"
on profiles for select
using (auth.uid() = id);

-- Links
create policy "Users can manage own links"
on links for all
using (auth.uid() = user_id);

-- Clicks (insert only)
create policy "Anyone can insert clicks"
on clicks for insert
with check (true);
