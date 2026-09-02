import 'dart:async';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthException implements Exception {
  AuthException(this.message);
  final String message;

  @override
  String toString() => message;
}

class AuthRepository {
  AuthRepository(this._client);

  final SupabaseClient _client;

  GoTrueClient get _auth => _client.auth;

  User? get currentUser => _auth.currentUser;

  bool get isEmailVerified => currentUser?.emailConfirmedAt != null;

  Stream<AuthState> onAuthStateChange() {
    return _auth.onAuthStateChange;
  }

  Future<AuthResponse> signIn({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _auth.signInWithPassword(
        email: email.trim(),
        password: password,
      );
      return response;
    } on AuthException {
      rethrow;
    } on AuthApiException catch (e) {
      throw AuthException(_mapAuthError(e.message));
    } catch (e) {
      throw AuthException('An unexpected error occurred. Please try again.');
    }
  }

  Future<AuthResponse> signUp({
    required String email,
    required String password,
    required String fullName,
  }) async {
    try {
      final response = await _auth.signUp(
        email: email.trim(),
        password: password,
        data: {'full_name': fullName.trim()},
      );
      return response;
    } on AuthException {
      rethrow;
    } on AuthApiException catch (e) {
      throw AuthException(_mapAuthError(e.message));
    } catch (e) {
      throw AuthException('An unexpected error occurred. Please try again.');
    }
  }

  Future<void> signOut() async {
    try {
      await _auth.signOut();
    } catch (e) {
      throw AuthException('Failed to sign out. Please try again.');
    }
  }

  Future<void> resetPassword(String email) async {
    try {
      await _auth.resetPasswordForEmail(email.trim());
    } on AuthApiException catch (e) {
      throw AuthException(_mapAuthError(e.message));
    } catch (e) {
      throw AuthException('Failed to send reset email. Please try again.');
    }
  }

  Future<void> updateProfile({
    String? fullName,
    String? email,
    String? avatarUrl,
    Map<String, dynamic>? data,
  }) async {
    try {
      final updates = <String, dynamic>{};
      if (fullName != null) updates['full_name'] = fullName.trim();
      if (email != null) updates['email'] = email.trim();
      if (data != null) updates['data'] = data;

      await _auth.updateUser(UserAttributes(
        email: updates['email'] as String?,
        data: {
          if (fullName != null) 'full_name': fullName.trim(),
          if (data != null) ...data,
        },
      ));
    } catch (e) {
      throw AuthException('Failed to update profile. Please try again.');
    }
  }

  Future<void> sendEmailVerification() async {
    try {
      await _auth.verifyOTP(
        email: currentUser?.email,
        token: '',
        type: OtpType.signup,
      );
    } catch (e) {
      throw AuthException('Failed to resend verification email.');
    }
  }

  String _mapAuthError(String error) {
    if (error.contains('Invalid login credentials')) {
      return 'Invalid email or password.';
    }
    if (error.contains('User already registered')) {
      return 'An account with this email already exists.';
    }
    if (error.contains('Password should be at least')) {
      return 'Password must be at least 6 characters.';
    }
    if (error.contains('Unable to validate email address')) {
      return 'Please enter a valid email address.';
    }
    return error.isNotEmpty ? error : 'An error occurred. Please try again.';
  }
}
