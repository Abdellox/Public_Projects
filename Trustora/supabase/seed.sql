-- =============================================================================
-- Trustora Seed Data
-- Supabase / PostgreSQL
-- =============================================================================
-- Run after schema.sql and rls.sql.  Inserts reference data: categories,
-- countries, and cities.  IDs are generated inline so foreign keys resolve
-- correctly.  Uses ON CONFLICT DO NOTHING for idempotent re-runs.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Categories  (19 rows)
-- ---------------------------------------------------------------------------
INSERT INTO categories (id, name_key, icon_name, is_active, sort_order) VALUES
    ('a0000000-0000-4000-a000-000000000001', 'categories.restaurants',          'restaurant',          TRUE,  1),
    ('a0000000-0000-4000-a000-000000000002', 'categories.shops',                'store',               TRUE,  2),
    ('a0000000-0000-4000-a000-000000000003', 'categories.doctors_health',       'local_hospital',      TRUE,  3),
    ('a0000000-0000-4000-a000-000000000004', 'categories.education',            'school',              TRUE,  4),
    ('a0000000-0000-4000-a000-000000000005', 'categories.technology',           'computer',            TRUE,  5),
    ('a0000000-0000-4000-a000-000000000006', 'categories.home_services',        'home_repair_service', TRUE,  6),
    ('a0000000-0000-4000-a000-000000000007', 'categories.automotive',           'directions_car',      TRUE,  7),
    ('a0000000-0000-4000-a000-000000000008', 'categories.beauty_wellness',      'spa',                 TRUE,  8),
    ('a0000000-0000-4000-a000-000000000009', 'categories.hotels_travel',        'hotel',               TRUE,  9),
    ('a0000000-0000-4000-a000-000000000010', 'categories.professionals',        'badge',               TRUE, 10),
    ('a0000000-0000-4000-a000-000000000011', 'categories.freelancers',          'freelance',           TRUE, 11),
    ('a0000000-0000-4000-a000-000000000012', 'categories.companies',            'business',            TRUE, 12),
    ('a0000000-0000-4000-a000-000000000013', 'categories.non_profit',           'volunteer_activism',  TRUE, 13),
    ('a0000000-0000-4000-a000-000000000014', 'categories.government_services',  'account_balance',     TRUE, 14),
    ('a0000000-0000-4000-a000-000000000015', 'categories.products',             'inventory_2',         TRUE, 15),
    ('a0000000-0000-4000-a000-000000000016', 'categories.online_services',      'language',            TRUE, 16),
    ('a0000000-0000-4000-a000-000000000017', 'categories.entertainment',        'celebration',         TRUE, 17),
    ('a0000000-0000-4000-a000-000000000018', 'categories.sports',               'sports_soccer',       TRUE, 18),
    ('a0000000-0000-4000-a000-000000000019', 'categories.other',                'category',            TRUE, 19)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Countries  (30 rows)
-- ---------------------------------------------------------------------------
INSERT INTO countries (id, name, code, phone_code, is_active) VALUES
    ('b0000000-0000-4000-b000-000000000001', 'United States',      'US', '+1',   TRUE),
    ('b0000000-0000-4000-b000-000000000002', 'United Kingdom',     'GB', '+44',  TRUE),
    ('b0000000-0000-4000-b000-000000000003', 'France',             'FR', '+33',  TRUE),
    ('b0000000-0000-4000-b000-000000000004', 'Germany',            'DE', '+49',  TRUE),
    ('b0000000-0000-4000-b000-000000000005', 'Spain',              'ES', '+34',  TRUE),
    ('b0000000-0000-4000-b000-000000000006', 'Canada',             'CA', '+1',   TRUE),
    ('b0000000-0000-4000-b000-000000000007', 'Australia',          'AU', '+61',  TRUE),
    ('b0000000-0000-4000-b000-000000000008', 'Japan',              'JP', '+81',  TRUE),
    ('b0000000-0000-4000-b000-000000000009', 'China',              'CN', '+86',  TRUE),
    ('b0000000-0000-4000-b000-000000000010', 'India',              'IN', '+91',  TRUE),
    ('b0000000-0000-4000-b000-000000000011', 'Brazil',             'BR', '+55',  TRUE),
    ('b0000000-0000-4000-b000-000000000012', 'Mexico',             'MX', '+52',  TRUE),
    ('b0000000-0000-4000-b000-000000000013', 'Egypt',              'EG', '+20',  TRUE),
    ('b0000000-0000-4000-b000-000000000014', 'Saudi Arabia',       'SA', '+966', TRUE),
    ('b0000000-0000-4000-b000-000000000015', 'United Arab Emirates','AE', '+971', TRUE),
    ('b0000000-0000-4000-b000-000000000016', 'Turkey',             'TR', '+90',  TRUE),
    ('b0000000-0000-4000-b000-000000000017', 'Morocco',            'MA', '+212', TRUE),
    ('b0000000-0000-4000-b000-000000000018', 'Nigeria',            'NG', '+234', TRUE),
    ('b0000000-0000-4000-b000-000000000019', 'South Africa',       'ZA', '+27',  TRUE),
    ('b0000000-0000-4000-b000-000000000020', 'Italy',              'IT', '+39',  TRUE),
    ('b0000000-0000-4000-b000-000000000021', 'Netherlands',        'NL', '+31',  TRUE),
    ('b0000000-0000-4000-b000-000000000022', 'Sweden',             'SE', '+46',  TRUE),
    ('b0000000-0000-4000-b000-000000000023', 'Switzerland',        'CH', '+41',  TRUE),
    ('b0000000-0000-4000-b000-000000000024', 'South Korea',        'KR', '+82',  TRUE),
    ('b0000000-0000-4000-b000-000000000025', 'Singapore',          'SG', '+65',  TRUE),
    ('b0000000-0000-4000-b000-000000000026', 'Argentina',          'AR', '+54',  TRUE),
    ('b0000000-0000-4000-b000-000000000027', 'Colombia',           'CO', '+57',  TRUE),
    ('b0000000-0000-4000-b000-000000000028', 'Portugal',           'PT', '+351', TRUE),
    ('b0000000-0000-4000-b000-000000000029', 'Belgium',            'BE', '+32',  TRUE),
    ('b0000000-0000-4000-b000-000000000030', 'Pakistan',           'PK', '+92',  TRUE)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. Cities  (2 per country = 60 rows)
-- ---------------------------------------------------------------------------

-- United States
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000001', 'New York',       'b0000000-0000-4000-b000-000000000001', 40.7128,  -74.0060,  TRUE),
    ('c0000000-0000-4000-c000-000000000002', 'Los Angeles',    'b0000000-0000-4000-b000-000000000001', 34.0522, -118.2437,  TRUE);
-- United Kingdom
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000003', 'London',         'b0000000-0000-4000-b000-000000000002', 51.5074,   -0.1278,  TRUE),
    ('c0000000-0000-4000-c000-000000000004', 'Manchester',     'b0000000-0000-4000-b000-000000000002', 53.4808,   -2.2426,  TRUE);
-- France
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000005', 'Paris',          'b0000000-0000-4000-b000-000000000003', 48.8566,    2.3522,  TRUE),
    ('c0000000-0000-4000-c000-000000000006', 'Lyon',           'b0000000-0000-4000-b000-000000000003', 45.7640,    4.8357,  TRUE);
-- Germany
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000007', 'Berlin',         'b0000000-0000-4000-b000-000000000004', 52.5200,   13.4050,  TRUE),
    ('c0000000-0000-4000-c000-000000000008', 'Munich',         'b0000000-0000-4000-b000-000000000004', 48.1351,   11.5820,  TRUE);
-- Spain
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000009', 'Madrid',         'b0000000-0000-4000-b000-000000000005', 40.4168,   -3.7038,  TRUE),
    ('c0000000-0000-4000-c000-000000000010', 'Barcelona',      'b0000000-0000-4000-b000-000000000005', 41.3874,    2.1686,  TRUE);
-- Canada
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000011', 'Toronto',        'b0000000-0000-4000-b000-000000000006', 43.6532,  -79.3832,  TRUE),
    ('c0000000-0000-4000-c000-000000000012', 'Vancouver',      'b0000000-0000-4000-b000-000000000006', 49.2827, -123.1207,  TRUE);
-- Australia
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000013', 'Sydney',         'b0000000-0000-4000-b000-000000000007', -33.8688,  151.2093, TRUE),
    ('c0000000-0000-4000-c000-000000000014', 'Melbourne',      'b0000000-0000-4000-b000-000000000007', -37.8136,  144.9631, TRUE);
-- Japan
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000015', 'Tokyo',          'b0000000-0000-4000-b000-000000000008', 35.6762,  139.6503, TRUE),
    ('c0000000-0000-4000-c000-000000000016', 'Osaka',          'b0000000-0000-4000-b000-000000000008', 34.6937,  135.5023, TRUE);
-- China
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000017', 'Beijing',        'b0000000-0000-4000-b000-000000000009', 39.9042,  116.4074, TRUE),
    ('c0000000-0000-4000-c000-000000000018', 'Shanghai',       'b0000000-0000-4000-b000-000000000009', 31.2304,  121.4737, TRUE);
-- India
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000019', 'Mumbai',         'b0000000-0000-4000-b000-000000000010', 19.0760,   72.8777, TRUE),
    ('c0000000-0000-4000-c000-000000000020', 'Delhi',          'b0000000-0000-4000-b000-000000000010', 28.7041,   77.1025, TRUE);
-- Brazil
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000021', 'Sao Paulo',      'b0000000-0000-4000-b000-000000000011', -23.5505, -46.6333, TRUE),
    ('c0000000-0000-4000-c000-000000000022', 'Rio de Janeiro', 'b0000000-0000-4000-b000-000000000011', -22.9068, -43.1729, TRUE);
-- Mexico
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000023', 'Mexico City',    'b0000000-0000-4000-b000-000000000012', 19.4326,  -99.1332, TRUE),
    ('c0000000-0000-4000-c000-000000000024', 'Guadalajara',    'b0000000-0000-4000-b000-000000000012', 20.6597, -103.3496, TRUE);
-- Egypt
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000025', 'Cairo',          'b0000000-0000-4000-b000-000000000013', 30.0444,   31.2357, TRUE),
    ('c0000000-0000-4000-c000-000000000026', 'Alexandria',     'b0000000-0000-4000-b000-000000000013', 31.2001,   29.9187, TRUE);
-- Saudi Arabia
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000027', 'Riyadh',         'b0000000-0000-4000-b000-000000000014', 24.7136,   46.6753, TRUE),
    ('c0000000-0000-4000-c000-000000000028', 'Jeddah',         'b0000000-0000-4000-b000-000000000014', 21.4858,   39.1925, TRUE);
-- United Arab Emirates
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000029', 'Dubai',          'b0000000-0000-4000-b000-000000000015', 25.2048,   55.2708, TRUE),
    ('c0000000-0000-4000-c000-000000000030', 'Abu Dhabi',      'b0000000-0000-4000-b000-000000000015', 24.4539,   54.3773, TRUE);
-- Turkey
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000031', 'Istanbul',       'b0000000-0000-4000-b000-000000000016', 41.0082,   28.9784, TRUE),
    ('c0000000-0000-4000-c000-000000000032', 'Ankara',         'b0000000-0000-4000-b000-000000000016', 39.9334,   32.8597, TRUE);
-- Morocco
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000033', 'Casablanca',     'b0000000-0000-4000-b000-000000000017', 33.5731,   -7.5898, TRUE),
    ('c0000000-0000-4000-c000-000000000034', 'Rabat',          'b0000000-0000-4000-b000-000000000017', 34.0209,   -6.8416, TRUE);
-- Nigeria
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000035', 'Lagos',          'b0000000-0000-4000-b000-000000000018',  6.5244,    3.3792, TRUE),
    ('c0000000-0000-4000-c000-000000000036', 'Abuja',          'b0000000-0000-4000-b000-000000000018',  9.0579,    7.4951, TRUE);
-- South Africa
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000037', 'Cape Town',      'b0000000-0000-4000-b000-000000000019', -33.9249,  18.4241, TRUE),
    ('c0000000-0000-4000-c000-000000000038', 'Johannesburg',   'b0000000-0000-4000-b000-000000000019', -26.2041,  28.0473, TRUE);
-- Italy
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000039', 'Rome',           'b0000000-0000-4000-b000-000000000020', 41.9028,  12.4964,  TRUE),
    ('c0000000-0000-4000-c000-000000000040', 'Milan',          'b0000000-0000-4000-b000-000000000020', 45.4642,   9.1900,  TRUE);
-- Netherlands
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000041', 'Amsterdam',      'b0000000-0000-4000-b000-000000000021', 52.3676,   4.9041,  TRUE),
    ('c0000000-0000-4000-c000-000000000042', 'Rotterdam',      'b0000000-0000-4000-b000-000000000021', 51.9244,   4.4777,  TRUE);
-- Sweden
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000043', 'Stockholm',      'b0000000-0000-4000-b000-000000000022', 59.3293,  18.0686,  TRUE),
    ('c0000000-0000-4000-c000-000000000044', 'Gothenburg',     'b0000000-0000-4000-b000-000000000022', 57.7089,  11.9746,  TRUE);
-- Switzerland
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000045', 'Zurich',         'b0000000-0000-4000-b000-000000000023', 47.3769,   8.5417,  TRUE),
    ('c0000000-0000-4000-c000-000000000046', 'Geneva',         'b0000000-0000-4000-b000-000000000023', 46.2044,   6.1432,  TRUE);
-- South Korea
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000047', 'Seoul',          'b0000000-0000-4000-b000-000000000024', 37.5665, 126.9780,  TRUE),
    ('c0000000-0000-4000-c000-000000000048', 'Busan',          'b0000000-0000-4000-b000-000000000024', 35.1796, 129.0756,  TRUE);
-- Singapore
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000049', 'Singapore',      'b0000000-0000-4000-b000-000000000025',  1.3521, 103.8198,  TRUE),
    ('c0000000-0000-4000-c000-000000000050', 'Jurong East',    'b0000000-0000-4000-b000-000000000025',  1.3329, 103.7436,  TRUE);
-- Argentina
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000051', 'Buenos Aires',   'b0000000-0000-4000-b000-000000000026', -34.6037, -58.3816, TRUE),
    ('c0000000-0000-4000-c000-000000000052', 'Cordoba',        'b0000000-0000-4000-b000-000000000026', -31.4201, -64.1888, TRUE);
-- Colombia
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000053', 'Bogota',         'b0000000-0000-4000-b000-000000000027',  4.7110, -74.0721,  TRUE),
    ('c0000000-0000-4000-c000-000000000054', 'Medellin',       'b0000000-0000-4000-b000-000000000027',  6.2476, -75.5658,  TRUE);
-- Portugal
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000055', 'Lisbon',         'b0000000-0000-4000-b000-000000000028', 38.7223,  -9.1393,  TRUE),
    ('c0000000-0000-4000-c000-000000000056', 'Porto',          'b0000000-0000-4000-b000-000000000028', 41.1579,  -8.6291,  TRUE);
-- Belgium
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000057', 'Brussels',       'b0000000-0000-4000-b000-000000000029', 50.8503,   4.3517,  TRUE),
    ('c0000000-0000-4000-c000-000000000058', 'Antwerp',        'b0000000-0000-4000-b000-000000000029', 51.2194,   4.4025,  TRUE);
-- Pakistan
INSERT INTO cities (id, name, country_id, latitude, longitude, is_active) VALUES
    ('c0000000-0000-4000-c000-000000000059', 'Islamabad',      'b0000000-0000-4000-b000-000000000030', 33.6844,  73.0479,  TRUE),
    ('c0000000-0000-4000-c000-000000000060', 'Karachi',        'b0000000-0000-4000-b000-000000000030', 24.8607,  67.0011,  TRUE);

-- Update FK now that cities exist
UPDATE profiles SET location_country_id = location_country_id WHERE location_country_id IS NOT NULL;
