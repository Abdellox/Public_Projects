import 'enums.dart';

/// A lightweight geographic coordinate.
class GeoPoint {
  const GeoPoint(this.latitude, this.longitude);

  final double latitude;
  final double longitude;

  factory GeoPoint.fromJson(Map<String, dynamic> json) {
    final lat = (json['latitude'] ?? json['lat'] ?? json['y']);
    final lng = (json['longitude'] ?? json['lon'] ?? json['x']);
    return GeoPoint(
      (lat as num).toDouble(),
      (lng as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {'latitude': latitude, 'longitude': longitude};
}

/// A player profile associated with a user account.
class UserProfile {
  const UserProfile({
    required this.id,
    this.userId,
    this.username,
    this.firstName,
    this.photoUrl,
    this.ageRangeMin,
    this.ageRangeMax,
    this.country,
    this.city,
    this.latitude,
    this.longitude,
    this.position,
    this.skillLevel,
    this.availableDays = const [],
    this.preferredTimes = const [],
    this.preferredDistanceKm,
    this.bio,
    this.rating,
    this.matchesCount = 0,
    this.badges = const [],
    this.languages = const [],
    this.showLocation = true,
  });

  final String id;
  final String? userId;
  final String? username;
  final String? firstName;
  final String? photoUrl;
  final int? ageRangeMin;
  final int? ageRangeMax;
  final String? country;
  final String? city;
  final double? latitude;
  final double? longitude;
  final Position? position;
  final SkillLevel? skillLevel;
  final List<int> availableDays;
  final List<String> preferredTimes;
  final double? preferredDistanceKm;
  final String? bio;
  final double? rating;
  final int matchesCount;
  final List<String> badges;
  final List<String> languages;

  /// Whether the approximate location may be shared publicly.
  final bool showLocation;

  bool get isComplete => firstName != null && city != null && position != null && skillLevel != null;

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    String? posStr = json['position'];
    String? skillStr = json['skill_level'];
    return UserProfile(
      id: json['id'] as String,
      userId: json['user_id'] as String?,
      username: json['username'] as String?,
      firstName: json['first_name'] as String?,
      photoUrl: json['photo_url'] as String?,
      ageRangeMin: (json['age_range_min'] as num?)?.toInt(),
      ageRangeMax: (json['age_range_max'] as num?)?.toInt(),
      country: json['country'] as String?,
      city: json['city'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      position: posStr == null ? null : _positionFromName(posStr),
      skillLevel: skillStr == null ? null : _skillFromName(skillStr),
      availableDays: (json['available_days'] as List?)?.map((e) => (e as num).toInt()).toList() ?? const [],
      preferredTimes: (json['preferred_times'] as List?)?.cast<String>() ?? const [],
      preferredDistanceKm: (json['preferred_distance_km'] as num?)?.toDouble(),
      bio: json['bio'] as String?,
      rating: (json['rating'] as num?)?.toDouble(),
      matchesCount: (json['matches_count'] as num?)?.toInt() ?? 0,
      badges: (json['badges'] as List?)?.cast<String>() ?? const [],
      languages: (json['languages'] as List?)?.cast<String>() ?? const [],
      showLocation: json['show_location'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
        'user_id': userId,
        'username': username,
        'first_name': firstName,
        'photo_url': photoUrl,
        'age_range_min': ageRangeMin,
        'age_range_max': ageRangeMax,
        'country': country,
        'city': city,
        'latitude': latitude,
        'longitude': longitude,
        'position': position?.name,
        'skill_level': skillLevel?.name,
        'available_days': availableDays,
        'preferred_times': preferredTimes,
        'preferred_distance_km': preferredDistanceKm,
        'bio': bio,
        'rating': rating,
        'matches_count': matchesCount,
        'badges': badges,
        'languages': languages,
        'show_location': showLocation,
      };

  UserProfile copyWith({
    String? username,
    String? firstName,
    String? photoUrl,
    int? ageRangeMin,
    int? ageRangeMax,
    String? country,
    String? city,
    double? latitude,
    double? longitude,
    Position? position,
    SkillLevel? skillLevel,
    List<int>? availableDays,
    List<String>? preferredTimes,
    double? preferredDistanceKm,
    String? bio,
    bool? showLocation,
  }) {
    return UserProfile(
      id: id,
      userId: userId,
      username: username ?? this.username,
      firstName: firstName ?? this.firstName,
      photoUrl: photoUrl ?? this.photoUrl,
      ageRangeMin: ageRangeMin ?? this.ageRangeMin,
      ageRangeMax: ageRangeMax ?? this.ageRangeMax,
      country: country ?? this.country,
      city: city ?? this.city,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      position: position ?? this.position,
      skillLevel: skillLevel ?? this.skillLevel,
      availableDays: availableDays ?? this.availableDays,
      preferredTimes: preferredTimes ?? this.preferredTimes,
      preferredDistanceKm: preferredDistanceKm ?? this.preferredDistanceKm,
      bio: bio ?? this.bio,
      rating: rating,
      matchesCount: matchesCount,
      badges: badges,
      languages: languages,
      showLocation: showLocation ?? this.showLocation,
    );
  }
}

Position _positionFromName(String name) {
  return Position.values.firstWhere(
    (p) => p.name == name || p.code == name,
    orElse: () => Position.flexible,
  );
}

SkillLevel _skillFromName(String name) {
  return SkillLevel.values.firstWhere(
    (s) => s.name == name,
    orElse: () => SkillLevel.casual,
  );
}
