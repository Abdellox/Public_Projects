-- =============================================================================
-- Trustora Row-Level Security Policies
-- Supabase / PostgreSQL
-- =============================================================================
-- Run after schema.sql.  Assumes auth.uid() returns the Supabase auth user's
-- UUID and that a public.users table stores the app-level user record whose
-- id matches auth.uid().
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helper: check if the current user is an admin or moderator
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin_or_moderator()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
          AND user_type IN ('admin', 'moderator')
          AND NOT is_suspended
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND user_type = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get listing owner for a given listing
CREATE OR REPLACE FUNCTION public.get_listing_owner(p_listing_id UUID)
RETURNS UUID AS $$
    SELECT owner_user_id FROM public.listings WHERE id = p_listing_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---------------------------------------------------------------------------
-- 1. users
-- ---------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_public"
    ON users FOR SELECT
    USING (TRUE);

CREATE POLICY "users_update_own"
    ON users FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "users_delete_admin"
    ON users FOR DELETE
    USING (is_admin());

CREATE POLICY "users_insert_admin"
    ON users FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "users_admin_all"
    ON users FOR ALL
    USING (is_admin());

-- ---------------------------------------------------------------------------
-- 2. profiles
-- ---------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_public"
    ON profiles FOR SELECT
    USING (TRUE);

CREATE POLICY "profiles_insert_own"
    ON profiles FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own"
    ON profiles FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_delete_own"
    ON profiles FOR DELETE
    USING (user_id = auth.uid());

CREATE POLICY "profiles_admin_all"
    ON profiles FOR ALL
    USING (is_admin());

-- ---------------------------------------------------------------------------
-- 3. categories
-- ---------------------------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_public"
    ON categories FOR SELECT
    USING (TRUE);

CREATE POLICY "categories_admin_insert"
    ON categories FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "categories_admin_update"
    ON categories FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "categories_admin_delete"
    ON categories FOR DELETE
    USING (is_admin());

-- ---------------------------------------------------------------------------
-- 4. countries
-- ---------------------------------------------------------------------------
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "countries_select_public"
    ON countries FOR SELECT
    USING (TRUE);

CREATE POLICY "countries_admin_all"
    ON countries FOR ALL
    USING (is_admin());

-- ---------------------------------------------------------------------------
-- 5. cities
-- ---------------------------------------------------------------------------
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cities_select_public"
    ON cities FOR SELECT
    USING (TRUE);

CREATE POLICY "cities_admin_all"
    ON cities FOR ALL
    USING (is_admin());

-- ---------------------------------------------------------------------------
-- 6. listings
-- ---------------------------------------------------------------------------
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listings_select_active"
    ON listings FOR SELECT
    USING (
        (is_active = TRUE AND is_suspended = FALSE)
        OR owner_user_id = auth.uid()
        OR is_admin_or_moderator()
    );

CREATE POLICY "listings_insert_own"
    ON listings FOR INSERT
    WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "listings_update_own"
    ON listings FOR UPDATE
    USING (owner_user_id = auth.uid() OR is_admin_or_moderator())
    WITH CHECK (owner_user_id = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "listings_delete_own"
    ON listings FOR DELETE
    USING (owner_user_id = auth.uid() OR is_admin());

-- ---------------------------------------------------------------------------
-- 7. business_hours
-- ---------------------------------------------------------------------------
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_hours_select_public"
    ON business_hours FOR SELECT
    USING (TRUE);

CREATE POLICY "business_hours_manage_owner"
    ON business_hours FOR ALL
    USING (
        public.get_listing_owner(listing_id) = auth.uid()
        OR is_admin_or_moderator()
    )
    WITH CHECK (
        public.get_listing_owner(listing_id) = auth.uid()
        OR is_admin_or_moderator()
    );

-- ---------------------------------------------------------------------------
-- 8. services
-- ---------------------------------------------------------------------------
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_select_active"
    ON services FOR SELECT
    USING (
        is_active = TRUE
        OR public.get_listing_owner(listing_id) = auth.uid()
        OR is_admin_or_moderator()
    );

CREATE POLICY "services_manage_owner"
    ON services FOR ALL
    USING (
        public.get_listing_owner(listing_id) = auth.uid()
        OR is_admin_or_moderator()
    )
    WITH CHECK (
        public.get_listing_owner(listing_id) = auth.uid()
        OR is_admin_or_moderator()
    );

-- ---------------------------------------------------------------------------
-- 9. products
-- ---------------------------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_active"
    ON products FOR SELECT
    USING (
        is_available = TRUE
        OR public.get_listing_owner(listing_id) = auth.uid()
        OR is_admin_or_moderator()
    );

CREATE POLICY "products_manage_owner"
    ON products FOR ALL
    USING (
        public.get_listing_owner(listing_id) = auth.uid()
        OR is_admin_or_moderator()
    )
    WITH CHECK (
        public.get_listing_owner(listing_id) = auth.uid()
        OR is_admin_or_moderator()
    );

-- ---------------------------------------------------------------------------
-- 10. listing_images
-- ---------------------------------------------------------------------------
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listing_images_select_public"
    ON listing_images FOR SELECT
    USING (TRUE);

CREATE POLICY "listing_images_manage_owner"
    ON listing_images FOR ALL
    USING (
        public.get_listing_owner(listing_id) = auth.uid()
        OR is_admin_or_moderator()
    )
    WITH CHECK (
        public.get_listing_owner(listing_id) = auth.uid()
        OR is_admin_or_moderator()
    );

-- ---------------------------------------------------------------------------
-- 11. reviews
-- ---------------------------------------------------------------------------
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_visible"
    ON reviews FOR SELECT
    USING (
        is_hidden = FALSE
        OR user_id = auth.uid()
        OR public.get_listing_owner(listing_id) = auth.uid()
        OR is_admin_or_moderator()
    );

CREATE POLICY "reviews_insert_authenticated"
    ON reviews FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND NOT is_suspended
        )
    );

CREATE POLICY "reviews_update_own"
    ON reviews FOR UPDATE
    USING (user_id = auth.uid() OR is_admin_or_moderator())
    WITH CHECK (user_id = auth.uid() OR is_admin_or_moderator());

CREATE POLICY "reviews_delete_own_or_admin"
    ON reviews FOR DELETE
    USING (user_id = auth.uid() OR is_admin());

-- ---------------------------------------------------------------------------
-- 12. owner_replies
-- ---------------------------------------------------------------------------
ALTER TABLE owner_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_replies_select_public"
    ON owner_replies FOR SELECT
    USING (TRUE);

CREATE POLICY "owner_replies_insert_owner"
    ON owner_replies FOR INSERT
    WITH CHECK (
        public.get_listing_owner(
            (SELECT listing_id FROM reviews WHERE id = review_id)
        ) = auth.uid()
        OR is_admin_or_moderator()
    );

CREATE POLICY "owner_replies_update_owner"
    ON owner_replies FOR UPDATE
    USING (
        owner_user_id = auth.uid()
        OR is_admin_or_moderator()
    )
    WITH CHECK (
        owner_user_id = auth.uid()
        OR is_admin_or_moderator()
    );

CREATE POLICY "owner_replies_delete_owner_or_admin"
    ON owner_replies FOR DELETE
    USING (
        owner_user_id = auth.uid()
        OR is_admin()
    );

-- ---------------------------------------------------------------------------
-- 13. favorites
-- ---------------------------------------------------------------------------
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites_select_own"
    ON favorites FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "favorites_insert_own"
    ON favorites FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "favorites_delete_own"
    ON favorites FOR DELETE
    USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 14. reports
-- ---------------------------------------------------------------------------
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select_own_or_mod"
    ON reports FOR SELECT
    USING (
        reporter_user_id = auth.uid()
        OR is_admin_or_moderator()
    );

CREATE POLICY "reports_insert_own"
    ON reports FOR INSERT
    WITH CHECK (
        reporter_user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND NOT is_suspended
        )
    );

CREATE POLICY "reports_update_mod"
    ON reports FOR UPDATE
    USING (is_admin_or_moderator())
    WITH CHECK (is_admin_or_moderator());

-- ---------------------------------------------------------------------------
-- 15. verification_requests
-- ---------------------------------------------------------------------------
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verification_requests_select_own_or_mod"
    ON verification_requests FOR SELECT
    USING (
        requester_user_id = auth.uid()
        OR is_admin_or_moderator()
    );

CREATE POLICY "verification_requests_insert_own"
    ON verification_requests FOR INSERT
    WITH CHECK (requester_user_id = auth.uid());

CREATE POLICY "verification_requests_update_mod"
    ON verification_requests FOR UPDATE
    USING (is_admin_or_moderator())
    WITH CHECK (is_admin_or_moderator());

-- ---------------------------------------------------------------------------
-- 16. notifications
-- ---------------------------------------------------------------------------
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_system"
    ON notifications FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "notifications_update_own"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_delete_own"
    ON notifications FOR DELETE
    USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 17. user_follows
-- ---------------------------------------------------------------------------
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_follows_select_own"
    ON user_follows FOR SELECT
    USING (follower_user_id = auth.uid());

CREATE POLICY "user_follows_insert_own"
    ON user_follows FOR INSERT
    WITH CHECK (follower_user_id = auth.uid());

CREATE POLICY "user_follows_delete_own"
    ON user_follows FOR DELETE
    USING (follower_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 18. listing_views
-- ---------------------------------------------------------------------------
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listing_views_insert_system"
    ON listing_views FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "listing_views_select_admin"
    ON listing_views FOR SELECT
    USING (is_admin());

-- ---------------------------------------------------------------------------
-- 19. moderation_actions
-- ---------------------------------------------------------------------------
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "moderation_actions_select_mod"
    ON moderation_actions FOR SELECT
    USING (is_admin_or_moderator());

CREATE POLICY "moderation_actions_insert_mod"
    ON moderation_actions FOR INSERT
    WITH CHECK (
        moderator_user_id = auth.uid()
        AND is_admin_or_moderator()
    );
