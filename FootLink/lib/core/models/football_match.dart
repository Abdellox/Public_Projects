import 'enums.dart';

/// A football match created by a player.
class FootballMatch {
  const FootballMatch({
    required this.id,
    required this.organizerId,
    this.title,
    this.type = MatchType.friendly,
    required this.dateTime,
    this.timeZone,
    this.city,
    this.country,
    this.venueName,
    this.venueId,
    this.latitude,
    this.longitude,
    this.status = MatchStatus.open,
    this.format = MatchFormat.fiveASide,
    this.skillLevel,
    this.maxPlayers = 10,
    this.minPlayers = 2,
    this.feeType = FeeType.free,
    this.feeAmount,
    this.isIndoor = false,
    this.joinPolicy = JoinPolicy.open,
    this.requiredPositions = const [],
    this.description,
    this.rules,
    this.isPrivate = false,
    this.playersJoined = 0,
    this.paymentLink,
    this.organizerRating,
  });

  final String id;
  final String organizerId;
  final String? title;
  final MatchType type;
  final DateTime dateTime;
  final String? timeZone;
  final String? city;
  final String? country;
  final String? venueName;
  final String? venueId;
  final double? latitude;
  final double? longitude;
  final MatchStatus status;
  final MatchFormat format;
  final SkillLevel? skillLevel;
  final int maxPlayers;
  final int minPlayers;
  final FeeType feeType;
  final double? feeAmount;
  final bool isIndoor;
  final JoinPolicy joinPolicy;
  final List<Position> requiredPositions;
  final String? description;
  final String? rules;
  final bool isPrivate;
  final int playersJoined;
  final String? paymentLink;
  final double? organizerRating;

  int get availableSpots => (maxPlayers - playersJoined).clamp(0, maxPlayers);
  bool get isFree => feeType == FeeType.free;
  bool get isFull => playersJoined >= maxPlayers;
  bool get isAlmostFull => playersJoined >= maxPlayers - 1 && !isFull;

  double get fillRatio => maxPlayers == 0 ? 0 : playersJoined / maxPlayers;

  factory FootballMatch.fromJson(Map<String, dynamic> json) {
    return FootballMatch(
      id: json['id'] as String,
      organizerId: (json['organizer_id'] ?? json['created_by']) as String,
      title: json['title'] as String?,
      type: _typeFromName(json['match_type'] ?? 'friendly'),
      dateTime: DateTime.parse(json['date_time'] as String).toLocal(),
      timeZone: json['time_zone'] as String?,
      city: json['city'] as String?,
      country: json['country'] as String?,
      venueName: json['venue_name'] as String?,
      venueId: json['venue_id'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      status: _statusFromName(json['status'] ?? 'open'),
      format: _formatFromName(json['team_size'] ?? '5'),
      skillLevel: json['skill_level'] == null ? null : _skillFromName(json['skill_level']),
      maxPlayers: (json['max_players'] as num?)?.toInt() ?? 10,
      minPlayers: (json['min_players'] as num?)?.toInt() ?? 2,
      feeType: (json['fee_type'] == 'paid') ? FeeType.paid : FeeType.free,
      feeAmount: (json['fee_amount'] as num?)?.toDouble(),
      isIndoor: json['is_indoor'] as bool? ?? false,
      joinPolicy: _policyFromName(json['join_policy'] ?? 'open'),
      requiredPositions: (json['required_positions'] as List?)
              ?.map((e) => _positionFromName(e as String))
              .toList() ??
          const [],
      description: json['description'] as String?,
      rules: json['rules'] as String?,
      isPrivate: json['is_private'] as bool? ?? false,
      playersJoined: (json['players_count'] as num?)?.toInt() ?? 0,
      paymentLink: json['payment_link'] as String?,
      organizerRating: (json['organizer_rating'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
        'organizer_id': organizerId,
        'title': title,
        'match_type': type.name,
        'date_time': dateTime.toUtc().toIso8601String(),
        'time_zone': timeZone,
        'city': city,
        'country': country,
        'venue_name': venueName,
        'venue_id': venueId,
        'latitude': latitude,
        'longitude': longitude,
        'status': status.name,
        'team_size': format.label,
        'skill_level': skillLevel?.name,
        'max_players': maxPlayers,
        'min_players': minPlayers,
        'fee_type': feeType.name,
        'fee_amount': feeAmount,
        'is_indoor': isIndoor,
        'join_policy': joinPolicy.name,
        'required_positions': requiredPositions.map((e) => e.name).toList(),
        'description': description,
        'rules': rules,
        'is_private': isPrivate,
      };

  FootballMatch copyWith({MatchStatus? status, int? playersJoined}) {
    return FootballMatch(
      id: id,
      organizerId: organizerId,
      title: title,
      type: type,
      dateTime: dateTime,
      timeZone: timeZone,
      city: city,
      country: country,
      venueName: venueName,
      venueId: venueId,
      latitude: latitude,
      longitude: longitude,
      status: status ?? this.status,
      format: format,
      skillLevel: skillLevel,
      maxPlayers: maxPlayers,
      minPlayers: minPlayers,
      feeType: feeType,
      feeAmount: feeAmount,
      isIndoor: isIndoor,
      joinPolicy: joinPolicy,
      requiredPositions: requiredPositions,
      description: description,
      rules: rules,
      isPrivate: isPrivate,
      playersJoined: playersJoined ?? this.playersJoined,
      paymentLink: paymentLink,
      organizerRating: organizerRating,
    );
  }
}

MatchType _typeFromName(String name) {
  return MatchType.values.firstWhere((t) => t.name == name, orElse: () => MatchType.friendly);
}

MatchStatus _statusFromName(String name) {
  return MatchStatus.values.firstWhere(
    (s) => s.name == name,
    orElse: () => MatchStatus.open,
  );
}

MatchFormat _formatFromName(String name) {
  return MatchFormat.values.firstWhere(
    (f) => f.label == name || f.name == name,
    orElse: () => MatchFormat.fiveASide,
  );
}

SkillLevel _skillFromName(String name) {
  return SkillLevel.values.firstWhere(
    (s) => s.name == name,
    orElse: () => SkillLevel.casual,
  );
}

JoinPolicy _policyFromName(String name) {
  return JoinPolicy.values.firstWhere(
    (p) => p.name == name,
    orElse: () => JoinPolicy.open,
  );
}

Position _positionFromName(String name) {
  return Position.values.firstWhere(
    (p) => p.name == name,
    orElse: () => Position.flexible,
  );
}
