import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:trustora/features/auth/data/auth_repository.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(Supabase.instance.client);
});

final authStateProvider = StreamProvider<AuthState>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return repository.onAuthStateChange();
});

final currentUserProvider = Provider<User?>((ref) {
  ref.watch(authStateProvider);
  final repository = ref.watch(authRepositoryProvider);
  return repository.currentUser;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(currentUserProvider) != null;
});

class AuthLoadingNotifier extends Notifier<bool> {
  @override
  bool build() => false;

  set value(bool v) => state = v;

  void setLoading(bool value) => state = value;
}

final authLoadingProvider =
    NotifierProvider<AuthLoadingNotifier, bool>(AuthLoadingNotifier.new);
