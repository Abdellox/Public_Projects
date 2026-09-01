/// Central application configuration.
///
/// FootLink uses Supabase for authentication, database, storage and
/// (optionally) Realtime for chat. These values are injected at build time so
/// no secret keys ever ship inside the mobile binary. For local development,
/// copy `.env.example` to a local environment and provide the values, or set
/// them via `--dart-define`.
///
/// **Important:** Never hard-code your Supabase `anon` key or an `service_role`
/// key into the source code. Use `--dart-define` or an environment file.
class AppConfig {
  AppConfig._();

  /// Supabase project URL, e.g. `https://xyzcompany.supabase.co`.
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://YOUR-PROJECT.supabase.co',
  );

  /// Supabase public (anon) key.
  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'YOUR-SUPABASE-ANON-KEY',
  );

  /// OpenStreetMap tile server used by the map view (MapLibre / flutter_map).
  /// This is free for light, non-commercial use. For production you may use a
  /// commercial tile provider.
  static const String osmTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  /// User agent sent with map tile requests (required by the OSM tile policy).
  static const String mapUserAgent = 'FootLink/1.0 (https://github.com/Abdellox/Public_Projects)';

  /// The default distance options (in kilometres) offered in filters.
  static const List<double> distanceFilters = [2, 5, 10, 25];

  /// Whether the app is running in debug mode.
  static bool get isDebug {
    return const bool.fromEnvironment('dart.vm.product') == false;
  }
}
