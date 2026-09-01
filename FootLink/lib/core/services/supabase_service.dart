import 'package:supabase_flutter/supabase_flutter.dart';

import '../config/app_config.dart';

/// Initialises and exposes the shared Supabase client.
class SupabaseService {
  SupabaseService._();

  static Future<void> init() async {
    await Supabase.initialize(
      url: AppConfig.supabaseUrl,
      publishableKey: AppConfig.supabaseAnonKey,
    );
  }

  static SupabaseClient get client => Supabase.instance.client;
}
