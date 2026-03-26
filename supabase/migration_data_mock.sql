-- Seed data for NetUp Supabase demo
-- Run this after schema.sql

begin;

insert into public.profiles (
  id,
  role,
  full_name,
  city,
  district,
  age,
  favorite_sports,
  skill_level,
  joined_at
)
values
  (
    '99999999-9999-9999-9999-999999999999',
    'admin',
    'NetUp Admin',
    'Ha Noi',
    'Nam Tu Liem',
    30,
    array['Badminton']::public.sport_type[],
    'Advanced',
    '2026-01-01T08:00:00+07'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'owner',
    'Chu San Hoa Lac',
    'Ha Noi',
    'Thach That',
    34,
    array['Badminton','Football','Tennis']::public.sport_type[],
    'Advanced',
    '2026-01-01T08:00:00+07'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'player',
    'Nguoi Choi Demo',
    'Ha Noi',
    'Thach That',
    22,
    array['Badminton','Football']::public.sport_type[],
    'Intermediate',
    '2026-01-10T08:00:00+07'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'player',
    'Tran Quoc Bao',
    'Ha Noi',
    'Quoc Oai',
    24,
    array['Badminton']::public.sport_type[],
    'Advanced',
    '2026-01-15T08:00:00+07'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'player',
    'Le Khanh Linh',
    'Ha Noi',
    'Thach That',
    21,
    array['Tennis']::public.sport_type[],
    'Intermediate',
    '2026-01-20T08:00:00+07'
  )
on conflict (id) do update
set
  role = excluded.role,
  full_name = excluded.full_name,
  city = excluded.city,
  district = excluded.district,
  age = excluded.age,
  favorite_sports = excluded.favorite_sports,
  skill_level = excluded.skill_level,
  joined_at = excluded.joined_at;

insert into public.court_complexes (
  id,
  owner_id,
  name,
  district,
  address,
  latitude,
  longitude
)
values
  (
    'a1111111-1111-4111-8111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'To hop the thao Hoa Lac Arena',
    'Thach That',
    'Lo TT-02, Khu CNC Hoa Lac, Thach Hoa, Thach That, Ha Noi',
    21.0209,
    105.5288
  ),
  (
    'b2222222-2222-4222-8222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'Hoa Lac Sports Park',
    'Quoc Oai',
    'Duong 21A, Phu Cat, Quoc Oai, Ha Noi',
    21.0302,
    105.5431
  )
on conflict (id) do update
set
  owner_id = excluded.owner_id,
  name = excluded.name,
  district = excluded.district,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude;

insert into public.courts (
  id,
  complex_id,
  owner_id,
  name,
  sub_court_name,
  sport,
  rating,
  is_pickup_enabled,
  status,
  amenities,
  base_price_vnd,
  max_rental_duration_minutes
)
values
  (
    'c0011111-1111-4111-8111-111111111111',
    'a1111111-1111-4111-8111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'San Cau Long A1',
    'San Cau Long A1',
    'Badminton',
    4.8,
    true,
    'active',
    array['Parking','Shower','Drinking Water'],
    190000,
    120
  ),
  (
    'c0022222-2222-4222-8222-222222222222',
    'a1111111-1111-4111-8111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'San Cau Long A2',
    'San Cau Long A2',
    'Badminton',
    4.7,
    true,
    'active',
    array['Night Lighting','Parking','Locker'],
    185000,
    120
  ),
  (
    'c0033333-3333-4333-8333-333333333333',
    'b2222222-2222-4222-8222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'San Bong F7-01',
    'San Bong F7-01',
    'Football',
    4.6,
    true,
    'active',
    array['Night Lighting','Parking','Cafe'],
    720000,
    90
  ),
  (
    'c0044444-4444-4444-8444-444444444444',
    'b2222222-2222-4222-8222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'San Tennis T1',
    'San Tennis T1',
    'Tennis',
    4.7,
    false,
    'active',
    array['Coach Desk','Water','Cafe'],
    450000,
    120
  )
on conflict (id) do update
set
  complex_id = excluded.complex_id,
  owner_id = excluded.owner_id,
  name = excluded.name,
  sub_court_name = excluded.sub_court_name,
  sport = excluded.sport,
  rating = excluded.rating,
  is_pickup_enabled = excluded.is_pickup_enabled,
  status = excluded.status,
  amenities = excluded.amenities,
  base_price_vnd = excluded.base_price_vnd,
  max_rental_duration_minutes = excluded.max_rental_duration_minutes;

insert into public.sessions (
  id,
  court_id,
  title,
  post_type,
  starts_at,
  duration_minutes,
  open_slots,
  max_slots,
  required_skill_min,
  required_skill_max,
  slot_price_vnd,
  full_court_price_vnd,
  is_peak_hour,
  allows_solo_join,
  created_by
)
values
  (
    'd0011111-1111-4111-8111-111111111111',
    'c0011111-1111-4111-8111-111111111111',
    'San Cau Long A1',
    'pool',
    '2026-03-27T11:00:00+07',
    90,
    5,
    6,
    'Beginner',
    'Advanced',
    100000,
    420000,
    true,
    true,
    null
  ),
  (
    'd0022222-2222-4222-8222-222222222222',
    'c0011111-1111-4111-8111-111111111111',
    'San Cau Long A1',
    'rental',
    '2026-03-27T15:00:00+07',
    60,
    6,
    6,
    'Beginner',
    'Intermediate',
    85000,
    360000,
    false,
    false,
    null
  ),
  (
    'd0033333-3333-4333-8333-333333333333',
    'c0022222-2222-4222-8222-222222222222',
    'San Cau Long A2',
    'pool',
    '2026-03-27T18:30:00+07',
    90,
    4,
    6,
    'Intermediate',
    'Advanced',
    105000,
    430000,
    true,
    true,
    null
  ),
  (
    'd0044444-4444-4444-8444-444444444444',
    'c0033333-3333-4333-8333-333333333333',
    'San Bong F7-01',
    'pool',
    '2026-03-28T19:00:00+07',
    90,
    0,
    14,
    'Beginner',
    'Intermediate',
    130000,
    820000,
    true,
    true,
    null
  ),
  (
    'd0055555-5555-4555-8555-555555555555',
    'c0033333-3333-4333-8333-333333333333',
    'San Bong F7-01',
    'rental',
    '2026-03-29T07:00:00+07',
    60,
    12,
    12,
    'Intermediate',
    'Advanced',
    120000,
    760000,
    false,
    false,
    null
  ),
  (
    'd0066666-6666-4666-8666-666666666666',
    'c0044444-4444-4444-8444-444444444444',
    'San Tennis T1',
    'rental',
    '2026-03-28T08:00:00+07',
    120,
    4,
    4,
    'Intermediate',
    'Advanced',
    170000,
    590000,
    false,
    false,
    null
  )
on conflict (id) do update
set
  court_id = excluded.court_id,
  title = excluded.title,
  post_type = excluded.post_type,
  starts_at = excluded.starts_at,
  duration_minutes = excluded.duration_minutes,
  open_slots = excluded.open_slots,
  max_slots = excluded.max_slots,
  required_skill_min = excluded.required_skill_min,
  required_skill_max = excluded.required_skill_max,
  slot_price_vnd = excluded.slot_price_vnd,
  full_court_price_vnd = excluded.full_court_price_vnd,
  is_peak_hour = excluded.is_peak_hour,
  allows_solo_join = excluded.allows_solo_join,
  created_by = excluded.created_by;

insert into public.pool_posts (
  id,
  session_id,
  created_by_player_id,
  total_slots,
  host_slots,
  status,
  created_at
)
values
  (
    'e0011111-1111-4111-8111-111111111111',
    'd0011111-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    6,
    1,
    'open',
    '2026-03-26T08:00:00+07'
  ),
  (
    'e0033333-3333-4333-8333-333333333333',
    'd0033333-3333-4333-8333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    6,
    2,
    'open',
    '2026-03-26T09:00:00+07'
  ),
  (
    'e0044444-4444-4444-8444-444444444444',
    'd0044444-4444-4444-8444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    14,
    14,
    'open',
    '2026-03-26T10:00:00+07'
  )
on conflict (session_id) do update
set
  id = excluded.id,
  session_id = excluded.session_id,
  created_by_player_id = excluded.created_by_player_id,
  total_slots = excluded.total_slots,
  host_slots = excluded.host_slots,
  status = excluded.status,
  created_at = excluded.created_at;

insert into public.bookings (
  id,
  booking_code,
  session_id,
  court_id,
  player_id,
  mode,
  seats_booked,
  status,
  created_at,
  base_price_vnd,
  floor_fee_vnd,
  platform_fee_vnd,
  total_price_vnd,
  qr_payload
)
values
  (
    'f0011111-1111-4111-8111-111111111111',
    'NTP2401',
    'd0011111-1111-4111-8111-111111111111',
    'c0011111-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'solo',
    1,
    'confirmed',
    '2026-03-26T09:10:00+07',
    100000,
    3000,
    10000,
    113000,
    'NETUP|NTP2401|d0011111-1111-4111-8111-111111111111|113000'
  ),
  (
    'f0022222-2222-4222-8222-222222222222',
    'NTP2402',
    'd0044444-4444-4444-8444-444444444444',
    'c0033333-3333-4333-8333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    'full_court',
    14,
    'checked_in',
    '2026-03-26T12:00:00+07',
    820000,
    0,
    82000,
    902000,
    'NETUP|NTP2402|d0044444-4444-4444-8444-444444444444|902000'
  )
on conflict (id) do update
set
  booking_code = excluded.booking_code,
  session_id = excluded.session_id,
  court_id = excluded.court_id,
  player_id = excluded.player_id,
  mode = excluded.mode,
  seats_booked = excluded.seats_booked,
  status = excluded.status,
  created_at = excluded.created_at,
  base_price_vnd = excluded.base_price_vnd,
  floor_fee_vnd = excluded.floor_fee_vnd,
  platform_fee_vnd = excluded.platform_fee_vnd,
  total_price_vnd = excluded.total_price_vnd,
  qr_payload = excluded.qr_payload;

insert into public.player_assessments (
  player_id,
  preferred_sport,
  preferred_district,
  budget_per_session_vnd,
  sessions_per_week,
  experience_years,
  stamina_score,
  technique_score,
  tactical_score,
  calculated_level,
  updated_at
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Badminton',
    'Thach That',
    130000,
    3,
    2,
    3,
    3,
    3,
    'Intermediate',
    '2026-03-26T08:00:00+07'
  )
on conflict (player_id) do update
set
  preferred_sport = excluded.preferred_sport,
  preferred_district = excluded.preferred_district,
  budget_per_session_vnd = excluded.budget_per_session_vnd,
  sessions_per_week = excluded.sessions_per_week,
  experience_years = excluded.experience_years,
  stamina_score = excluded.stamina_score,
  technique_score = excluded.technique_score,
  tactical_score = excluded.tactical_score,
  calculated_level = excluded.calculated_level,
  updated_at = excluded.updated_at;

insert into public.admin_configs (
  id,
  platform_fee_rate,
  floor_fee_vnd,
  matching_radius_km,
  no_show_strike_limit,
  auto_release_minutes,
  support_hotline_enabled,
  deposit_percent
)
values
  (
    1,
    0.10,
    3000,
    5,
    3,
    15,
    true,
    30
  )
on conflict (id) do update
set
  platform_fee_rate = excluded.platform_fee_rate,
  floor_fee_vnd = excluded.floor_fee_vnd,
  matching_radius_km = excluded.matching_radius_km,
  no_show_strike_limit = excluded.no_show_strike_limit,
  auto_release_minutes = excluded.auto_release_minutes,
  support_hotline_enabled = excluded.support_hotline_enabled,
  deposit_percent = excluded.deposit_percent;

commit;
