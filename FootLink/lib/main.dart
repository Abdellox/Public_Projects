import 'package:flutter/material.dart';

import 'app.dart';
import 'core/services/settings_controller.dart';
import 'core/services/supabase_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialise the shared settings (locale + theme) from local storage.
  await SettingsController.instance.load();

  // Initialise Supabase (auth + PostgREST + storage).
  // Throwing here surfaces a clear "check your Supabase URL/anon key" error
  // during development. In production, the config values must be injected.
  await SupabaseService.init();

  runApp(const FootLinkApp());
}
