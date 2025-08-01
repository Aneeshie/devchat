create table users (
  id uuid primary key references auth.users (id) not null,
  email text unique not null,
  name text,
  avatar_url text not null,
  is_away boolean default false not null, 
  type text default 'user' check (
    type in ('user', 'admin', 'moderator')
  ),
  phone_number text,
  workspaces  text[],
  channels text[],
  created_at timestamp default current_timestamp
);

alter table users enable row level security;

create policy "Can view own user data" on users
for select
using (auth.uid() = id);

create policy "Can update own user data" on users
for update
using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  if new.raw_user_meta_data->>'avatar_url' is null or new.raw_user_meta_data->>'avatar_url' = '' then
    new.raw_user_meta_data := jsonb_set(new.raw_user_meta_data, '{avatar_url}', '"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"'::jsonb);
  end if;

  insert into public.users (id, name, type, email, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'user',
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();
