-- =============================================================================
-- Trustora Database Schema
-- Supabase / PostgreSQL
-- =============================================================================
-- Run this file first to create all types, tables, indexes, triggers, and
-- functions.  Order matters: types → tables → indexes → triggers → functions.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ---------------------------------------------------------------------------
-- 1. Custom ENUM types
-- ---------------------------------------------------------------------------
CREATE TYPE user_type AS ENUM ('individual', 'business_owner', 'moderator', 'admin');

CREATE TYPE listing_type AS ENUM (
    'business', 'professional', 'organization', 'product',
    'service', 'place', 'online_service'
);

CREATE TYPE price_range AS ENUM ('free', 'budget', 'moderate', 'expensive', 'luxury');

CREATE TYPE verification_badge AS ENUM ('verified', 'community_reviewed', 'not_verified');

CREATE TYPE price_type AS ENUM ('fixed', 'hourly', 'starting_at', 'negotiable');

CREATE TYPE report_entity_type AS ENUM ('listing', 'review', 'user', 'owner_reply');

CREATE TYPE report_reason AS ENUM (
    'spam', 'fake_review', 'harassment', 'discrimination',
    'defamation', 'illegal', 'inappropriate', 'other'
);

CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE notification_type AS ENUM (
    'review_received', 'owner_reply', 'verification_approved',
    'verification_rejected', 'listing_reported', 'review_reported',
    'recommendation', 'system'
);

CREATE TYPE action_type AS ENUM (
    'hide_content', 'remove_content', 'suspend_user', 'unsuspend_user',
    'approve_verification', 'reject_verification', 'warn_user'
);

-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------

-- 2.1 users ---------------------------------------------------------------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           TEXT NOT NULL,
    full_name       TEXT NOT NULL DEFAULT '',
    phone           TEXT,
    avatar_url      TEXT,
    user_type       user_type NOT NULL DEFAULT 'individual',
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    is_suspended    BOOLEAN NOT NULL DEFAULT FALSE,
    preferred_language TEXT NOT NULL DEFAULT 'en',
    preferred_country  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 profiles ------------------------------------------------------------
CREATE TABLE profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name        TEXT,
    bio                 TEXT,
    location_country_id UUID,
    location_city_id    UUID,
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_profiles_user_id ON profiles(user_id);

-- 2.3 categories ----------------------------------------------------------
CREATE TABLE categories (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_key            TEXT NOT NULL,
    icon_name           TEXT,
    parent_category_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order          INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.4 countries -----------------------------------------------------------
CREATE TABLE countries (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    code        TEXT NOT NULL,
    phone_code  TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_countries_code ON countries(code);

-- 2.5 cities --------------------------------------------------------------
CREATE TABLE cities (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    country_id  UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    latitude    DOUBLE PRECISION,
    longitude   DOUBLE PRECISION,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cities_country_id ON cities(country_id);

-- 2.6 listings ------------------------------------------------------------
CREATE TABLE listings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id         UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    listing_type        listing_type NOT NULL,
    name                TEXT NOT NULL,
    slug                TEXT NOT NULL,
    description         TEXT,
    logo_url            TEXT,
    cover_image_url     TEXT,
    phone               TEXT,
    email               TEXT,
    website             TEXT,
    social_links        JSONB DEFAULT '{}'::jsonb,
    address             TEXT,
    country_id          UUID NOT NULL REFERENCES countries(id) ON DELETE RESTRICT,
    city_id             UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    price_range         price_range DEFAULT 'moderate',
    is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
    is_suspended        BOOLEAN NOT NULL DEFAULT FALSE,
    verification_badge  verification_badge NOT NULL DEFAULT 'not_verified',
    trust_score         DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    average_rating      DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    review_count        INT NOT NULL DEFAULT 0,
    save_count          INT NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_listings_slug ON listings(slug);
CREATE INDEX idx_listings_owner_user_id ON listings(owner_user_id);
CREATE INDEX idx_listings_category_id ON listings(category_id);
CREATE INDEX idx_listings_country_id ON listings(country_id);
CREATE INDEX idx_listings_city_id ON listings(city_id);
CREATE INDEX idx_listings_listing_type ON listings(listing_type);
CREATE INDEX idx_listings_is_verified ON listings(is_verified);
CREATE INDEX idx_listings_is_featured ON listings(is_featured);
CREATE INDEX idx_listings_average_rating ON listings(average_rating DESC);
CREATE INDEX idx_listings_trust_score ON listings(trust_score DESC);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_geo ON listings(latitude, longitude);
CREATE INDEX idx_listings_name_trgm ON listings USING gin(name gin_trgm_ops);

-- 2.7 business_hours ------------------------------------------------------
CREATE TABLE business_hours (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time   TIME,
    close_time  TIME,
    is_closed   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_business_hours_listing_id ON business_hours(listing_id);
CREATE UNIQUE INDEX idx_business_hours_listing_day ON business_hours(listing_id, day_of_week);

-- 2.8 services ------------------------------------------------------------
CREATE TABLE services (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    price       DECIMAL(10,2),
    price_type  price_type NOT NULL DEFAULT 'fixed',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_listing_id ON services(listing_id);

-- 2.9 products ------------------------------------------------------------
CREATE TABLE products (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    price       DECIMAL(10,2),
    image_url   TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_listing_id ON products(listing_id);

-- 2.10 listing_images -----------------------------------------------------
CREATE TABLE listing_images (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url   TEXT NOT NULL,
    caption     TEXT,
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);

-- 2.11 reviews ------------------------------------------------------------
CREATE TABLE reviews (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id              UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating                  INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title                   TEXT,
    body                    TEXT,
    experience_date         DATE,
    is_anonymous            BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified_purchase    BOOLEAN NOT NULL DEFAULT FALSE,
    quality_rating          INT CHECK (quality_rating BETWEEN 1 AND 5),
    professionalism_rating  INT CHECK (professionalism_rating BETWEEN 1 AND 5),
    communication_rating    INT CHECK (communication_rating BETWEEN 1 AND 5),
    value_rating            INT CHECK (value_rating BETWEEN 1 AND 5),
    reliability_rating      INT CHECK (reliability_rating BETWEEN 1 AND 5),
    cleanliness_rating      INT CHECK (cleanliness_rating BETWEEN 1 AND 5),
    overall_rating          DECIMAL(3,2),
    report_count            INT NOT NULL DEFAULT 0,
    is_hidden               BOOLEAN NOT NULL DEFAULT FALSE,
    is_flagged              BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- 2.12 owner_replies ------------------------------------------------------
CREATE TABLE owner_replies (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id       UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    owner_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reply_text      TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_owner_replies_review_id ON owner_replies(review_id);

-- 2.13 favorites ----------------------------------------------------------
CREATE TABLE favorites (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_favorites_user_listing ON favorites(user_id, listing_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON favorites(listing_id);

-- 2.14 reports ------------------------------------------------------------
CREATE TABLE reports (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_entity_type    report_entity_type NOT NULL,
    reported_entity_id      UUID NOT NULL,
    reason                  report_reason NOT NULL,
    description             TEXT,
    status                  report_status NOT NULL DEFAULT 'pending',
    moderator_user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    moderator_note          TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reporter_user_id ON reports(reporter_user_id);

-- 2.15 verification_requests ---------------------------------------------
CREATE TABLE verification_requests (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id                  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    requester_user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_registration_url   TEXT,
    notes                       TEXT,
    status                      verification_status NOT NULL DEFAULT 'pending',
    moderator_user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
    moderator_note              TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verification_requests_listing_id ON verification_requests(listing_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);

-- 2.16 notifications ------------------------------------------------------
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    body            TEXT,
    type            notification_type NOT NULL DEFAULT 'system',
    reference_type  TEXT,
    reference_id    UUID,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- 2.17 user_follows -------------------------------------------------------
CREATE TABLE user_follows (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES categories(id) ON DELETE CASCADE,
    city_id         UUID REFERENCES cities(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_follow_has_target CHECK (
        category_id IS NOT NULL OR city_id IS NOT NULL
    )
);

CREATE INDEX idx_user_follows_follower ON user_follows(follower_user_id);
CREATE UNIQUE INDEX idx_user_follows_unique_cat ON user_follows(follower_user_id, category_id)
    WHERE category_id IS NOT NULL;
CREATE UNIQUE INDEX idx_user_follows_unique_city ON user_follows(follower_user_id, city_id)
    WHERE city_id IS NOT NULL;

-- 2.18 listing_views ------------------------------------------------------
CREATE TABLE listing_views (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listing_views_listing_id ON listing_views(listing_id);
CREATE INDEX idx_listing_views_created_at ON listing_views(created_at);

-- 2.19 moderation_actions -------------------------------------------------
CREATE TABLE moderation_actions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moderator_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action_type         action_type NOT NULL,
    target_entity_type  TEXT NOT NULL,
    target_entity_id    UUID NOT NULL,
    reason              TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_moderation_actions_moderator ON moderation_actions(moderator_user_id);
CREATE INDEX idx_moderation_actions_target ON moderation_actions(target_entity_type, target_entity_id);

-- ---------------------------------------------------------------------------
-- 3. updated_at trigger function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 4. Attach updated_at triggers
-- ---------------------------------------------------------------------------
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_owner_replies_updated_at
    BEFORE UPDATE ON owner_replies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_verification_requests_updated_at
    BEFORE UPDATE ON verification_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 5. Helper functions
-- ---------------------------------------------------------------------------

-- Recalculate listing aggregate stats after a review insert/update/delete
CREATE OR REPLACE FUNCTION recalculate_listing_stats()
RETURNS TRIGGER AS $$
DECLARE
    target_listing_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_listing_id := OLD.listing_id;
    ELSE
        target_listing_id := NEW.listing_id;
    END IF;

    UPDATE listings
    SET
        average_rating = COALESCE(
            (SELECT ROUND(AVG(rating)::numeric, 2)
             FROM reviews
             WHERE listing_id = target_listing_id AND NOT is_hidden),
            0
        ),
        review_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE listing_id = target_listing_id AND NOT is_hidden
        )
    WHERE id = target_listing_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_recalculate_stats
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION recalculate_listing_stats();

-- Increment/decrement save_count on favorites
CREATE OR REPLACE FUNCTION update_listing_save_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE listings SET save_count = save_count + 1 WHERE id = NEW.listing_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE listings SET save_count = GREATEST(save_count - 1, 0) WHERE id = OLD.listing_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_favorites_save_count
    AFTER INSERT OR DELETE ON favorites
    FOR EACH ROW EXECUTE FUNCTION update_listing_save_count();
