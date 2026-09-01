import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/user_profile.dart';
import 'supabase_service.dart';

/// A small typed wrapper around Supabase Auth and player-profile reads/writes.
///
/// All database operations go through the authenticated Supabase client so
/// Row Level Security is enforced server-side.
class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  SupabaseClient get _client => SupabaseService.client;

  User? get currentUser => _client.auth.currentUser;
  bool get isSignedIn => _client.auth.currentUser != null;

  Stream<AuthState> get onAuthStateChange => _client.auth.onAuthStateChange;

  Future<bool> signUp({
    required String email,
    required String password,
    required String firstName,
  }) async {
    await _client.auth.signUp(
      email: email,
      password: password,
      data: {'first_name': firstName},
    );
    return isSignedIn;
  }

  Future<void> signIn({required String email, required String password}) async {
    await _client.auth.signInWithPassword(email: email, password: password);
  }

  Future<void> resetPassword(String email) async {
    await _client.auth.resetPasswordForEmail(email);
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  /// Loads the current user's player profile, or null if not set up yet.
  Future<UserProfile?> currentProfile() async {
    final user = currentUser;
    if (user == null) return null;
    final rows = await _client
        .from('player_profiles')
        .select()
        .eq('user_id', user.id)
        .maybeSingle();
    if (rows == null) return null;
    return UserProfile.fromJson(rows);
  }

  /// Creates the first player profile for the current user.
  Future<UserProfile> createProfile(UserProfile draft) async {
    final user = currentUser;
    if (user == null) throw StateError('Not authenticated');
    final data = draft.toJson()..['user_id'] = user.id;
    data.remove('id');
    final row = await _client
        .from('player_profiles')
        .insert(data)
        .select()
        .single();
    return UserProfile.fromJson(row);
  }

  /// Updates an existing player profile.
  Future<UserProfile> updateProfile(UserProfile profile) async {
    final row = await _client
        .from('player_profiles')
        .update(profile.toJson())
        .eq('id', profile.id)
        .select()
        .single();
    return UserProfile.fromJson(row);
  }
}
