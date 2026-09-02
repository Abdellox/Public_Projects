class AppConstants {
  AppConstants._();

  static const String appName = 'Trustora';

  static const int defaultPageSize = 20;
  static const int maxReviewLength = 5000;
  static const int minReviewLength = 10;
  static const int maxImageSizeMb = 5;
  static const int cacheDurationMinutes = 5;
  static const Duration cacheDuration = Duration(minutes: cacheDurationMinutes);

  static const String supabaseStorageBucket = 'listings';
  static const double defaultMapZoom = 13.0;
  static const double minMapZoom = 3.0;
  static const double maxMapZoom = 20.0;

  static const int maxImagesPerListing = 10;
  static const int maxNameLength = 100;
  static const int maxDescriptionLength = 2000;
  static const int minPasswordLength = 8;

  static const double minRating = 1.0;
  static const double maxRating = 5.0;
}
