import 'enums.dart';
import 'user_profile.dart';

/// A football team that a captain manages.
class Team {
  const Team({
    required this.id,
    this.captainId,
    this.name,
    this.logoUrl,
    this.city,
    this.country,
    this.description,
    this.skillLevel,
    this.rules,
    this.rating,
    this.memberCount = 0,
    this.members = const [],
  });

  final String id;
  final String? captainId;
  final String? name;
  final String? logoUrl;
  final String? city;
  final String? country;
  final String? description;
  final SkillLevel? skillLevel;
  final String? rules;
  final double? rating;
  final int memberCount;
  final List<UserProfile> members;

  factory Team.fromJson(Map<String, dynamic> json) {
    return Team(
      id: json['id'] as String,
      captainId: json['captain_id'] as String?,
      name: json['name'] as String?,
      logoUrl: json['logo_url'] as String?,
      city: json['city'] as String?,
      country: json['country'] as String?,
      description: json['description'] as String?,
      skillLevel: json['skill_level'] == null
          ? null
          : SkillLevel.values.firstWhere(
              (s) => s.name == json['skill_level'],
              orElse: () => SkillLevel.casual,
            ),
      rules: json['rules'] as String?,
      rating: (json['rating'] as num?)?.toDouble(),
      memberCount: (json['member_count'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'captain_id': captainId,
        'name': name,
        'logo_url': logoUrl,
        'city': city,
        'country': country,
        'description': description,
        'skill_level': skillLevel?.name,
        'rules': rules,
        'rating': rating,
      };
}
