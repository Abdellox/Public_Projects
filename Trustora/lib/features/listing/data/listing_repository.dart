import 'package:supabase_flutter/supabase_flutter.dart';

class ListingRepository {
  ListingRepository(this._client);

  final SupabaseClient _client;

  Future<List<Map<String, dynamic>>> getListings({
    String? categoryId,
    String? countryId,
    String? cityId,
    String? search,
    double? rating,
    int? priceRange,
    bool? verified,
    String? sort,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      var query = _client.from('listings').select();

      if (categoryId != null) query = query.eq('category_id', categoryId);
      if (countryId != null) query = query.eq('country_id', countryId);
      if (cityId != null) query = query.eq('city_id', cityId);
      if (verified == true) query = query.eq('is_verified', true);
      if (rating != null) query = query.gte('rating', rating);
      if (priceRange != null) query = query.eq('price_range', priceRange);
      if (search != null && search.isNotEmpty) {
        query = query.textSearch('name', search, type: TextSearchType.websearch);
      }

      var ordered = query.order('created_at', ascending: false);

      final from = (page - 1) * limit;
      final to = from + limit - 1;

      final data = await ordered.range(from, to);
      return List<Map<String, dynamic>>.from(data);
    } catch (e) {
      throw Exception('Failed to load listings: $e');
    }
  }

  Future<Map<String, dynamic>> getListingById(String id) async {
    try {
      final data = await _client
          .from('listings')
          .select('*, categories(*), cities(*, countries(*))')
          .eq('id', id)
          .single();
      return data;
    } catch (e) {
      throw Exception('Failed to load listing: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getListingReviews(
    String listingId, {
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final from = (page - 1) * limit;
      final to = from + limit - 1;

      final data = await _client
          .from('reviews')
          .select('*, profiles(id, full_name, avatar_url)')
          .eq('listing_id', listingId)
          .order('created_at', ascending: false)
          .range(from, to);

      return List<Map<String, dynamic>>.from(data);
    } catch (e) {
      throw Exception('Failed to load reviews: $e');
    }
  }

  Future<void> createReview({
    required String listingId,
    required double rating,
    required String title,
    required String body,
    Map<String, double>? criteria,
    List<String>? imageUrls,
  }) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) throw Exception('User not authenticated');

      await _client.from('reviews').insert({
        'listing_id': listingId,
        'user_id': userId,
        'rating': rating,
        'title': title,
        'body': body,
        'criteria': criteria,
        'image_urls': imageUrls,
      });
    } catch (e) {
      throw Exception('Failed to create review: $e');
    }
  }

  Future<bool> toggleFavorite(String listingId) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) throw Exception('User not authenticated');

      final existing = await _client
          .from('favorites')
          .select('id')
          .eq('user_id', userId)
          .eq('listing_id', listingId)
          .maybeSingle();

      if (existing != null) {
        await _client.from('favorites').delete().eq('id', existing['id']);
        return false;
      } else {
        await _client.from('favorites').insert({
          'user_id': userId,
          'listing_id': listingId,
        });
        return true;
      }
    } catch (e) {
      throw Exception('Failed to toggle favorite: $e');
    }
  }

  Future<bool> isFavorited(String listingId) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) return false;

      final existing = await _client
          .from('favorites')
          .select('id')
          .eq('user_id', userId)
          .eq('listing_id', listingId)
          .maybeSingle();

      return existing != null;
    } catch (e) {
      return false;
    }
  }

  Future<List<Map<String, dynamic>>> getPopularListings() async {
    try {
      final data = await _client
          .from('listings')
          .select()
          .order('review_count', ascending: false)
          .limit(10);
      return List<Map<String, dynamic>>.from(data);
    } catch (e) {
      throw Exception('Failed to load popular listings: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getNearbyListings(
    double lat,
    double lng, {
    double radiusKm = 10,
  }) async {
    try {
      final data = await _client.rpc('get_nearby_listings', params: {
        'lat': lat,
        'lng': lng,
        'radius_km': radiusKm,
      });
      return List<Map<String, dynamic>>.from(data);
    } catch (e) {
      throw Exception('Failed to load nearby listings: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getVerifiedListings() async {
    try {
      final data = await _client
          .from('listings')
          .select()
          .eq('is_verified', true)
          .order('rating', ascending: false)
          .limit(10);
      return List<Map<String, dynamic>>.from(data);
    } catch (e) {
      throw Exception('Failed to load verified listings: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getRecentListings() async {
    try {
      final data = await _client
          .from('listings')
          .select()
          .order('created_at', ascending: false)
          .limit(10);
      return List<Map<String, dynamic>>.from(data);
    } catch (e) {
      throw Exception('Failed to load recent listings: $e');
    }
  }
}
