import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/models/football_match.dart';
import '../../core/models/team.dart';
import '../../core/models/venue.dart';
import '../../core/utils/distance.dart';
import '../../core/services/supabase_service.dart';

/// Filter controls used by the Explore screen. Applied client-side after a
/// coarse fetch — adequate for an MVP with modest data volumes.
class MatchFilters {
  MatchFilters({
    this.maxDistanceKm,
    this.skillLevel,
    this.format,
    this.feeType,
    this.isIndoor,
    this.dateFrom,
    this.cities,
  });

  double? maxDistanceKm;
  String? skillLevel;
  String? format;
  String? feeType;
  bool? isIndoor;
  DateTime? dateFrom;
  List<String>? cities;
}

/// Data access for matches, teams and venues through Supabase.
class MatchRepository {
  MatchRepository._();
  static final MatchRepository instance = MatchRepository._();

  SupabaseClient get _client => SupabaseService.client;

  /// Fetches matches, applying proximity + filters in Dart.
  Future<List<FootballMatch>> fetchMatches({
    double? userLat,
    double? userLng,
    MatchFilters? filters,
    int limit = 50,
  }) async {
    final rows = await _client.from('matches').select('''
        id, organizer_id, title, match_type, date_time, time_zone, city, country,
        venue_name, venue_id, latitude, longitude, status, team_size, skill_level,
        max_players, min_players, fee_type, fee_amount, payment_link, is_indoor,
        join_policy, required_positions, description, rules, is_private,
        players:match_players(id, status)
      ''').limit(500);

    var matches = rows.map(_parseMatch).toList();

    // Filter to active matches by default.
    matches = matches
        .where((m) => ['open', 'almost_full', 'full'].contains(m.status.name))
        .toList();

    final f = filters;
    if (f != null) {
      if (f.skillLevel != null) {
        matches = matches.where((m) => m.skillLevel?.name == f.skillLevel).toList();
      }
      if (f.format != null) {
        matches = matches.where((m) => m.format.label == f.format).toList();
      }
      if (f.feeType != null) {
        matches = matches
            .where((m) => (f.feeType == 'paid') ? m.feeType.name == 'paid' : m.feeType.name == 'free')
            .toList();
      }
      if (f.isIndoor != null) {
        matches = matches.where((m) => m.isIndoor == f.isIndoor).toList();
      }
      if (f.dateFrom != null) {
        matches = matches.where((m) => m.dateTime.isAfter(f.dateFrom!)).toList();
      }
      if (f.cities != null && f.cities!.isNotEmpty) {
        matches = matches.where((m) => f.cities!.contains(m.city)).toList();
      }
    }

    final maxKm = f?.maxDistanceKm ?? (userLat == null ? null : 25.0);
    if (userLat != null && userLng != null && maxKm != null) {
      matches.removeWhere((m) {
        if (m.latitude == null || m.longitude == null) return false;
        return LocationUtils.distanceKm(userLat, userLng, m.latitude!, m.longitude!) > maxKm;
      });
      LocationUtils.sortByDistance(matches, userLat, userLng);
    }

    return matches.take(limit).toList();
  }

  Future<FootballMatch?> fetchMatch(String id) async {
    final row = await _client
        .from('matches')
        .select()
        .eq('id', id)
        .maybeSingle();
    return row == null ? null : _parseMatch(row);
  }

  Future<List<Team>> fetchTeams({int limit = 50}) async {
    final rows = await _client.from('teams').select().limit(limit);
    return rows.map(Team.fromJson).toList();
  }

  Future<List<Venue>> fetchVenues({
    double? userLat,
    double? userLng,
    int limit = 50,
  }) async {
    final rows = await _client.from('venues').select().limit(limit);
    final venues = rows.map(Venue.fromJson).toList();
    if (userLat != null && userLng != null) {
      LocationUtils.sortVenuesByDistance(venues, userLat, userLng);
    }
    return venues.take(limit).toList();
  }

  Future<FootballMatch> createMatch(FootballMatch match) async {
    final row = await _client.from('matches').insert(match.toJson()).select().single();
    return _parseMatch(row);
  }

  Future<Team> createTeam(Map<String, dynamic> data) async {
    final row = await _client.from('teams').insert(data).select().single();
    return Team.fromJson(row);
  }

  Future<void> joinMatch(String matchId) async {
    final profile = await AuthServiceProfile.current();
    if (profile == null) throw StateError('Profile required');
    await _client.from('match_players').insert({
      'match_id': matchId,
      'player_id': profile['id'],
      'status': 'joined',
    });
  }

  Future<void> leaveMatch(String matchId) async {
    final profile = await AuthServiceProfile.current();
    if (profile == null) throw StateError('Profile required');
    await _client
        .from('match_players')
        .delete()
        .eq('match_id', matchId)
        .eq('player_id', profile['id']);
  }

  FootballMatch _parseMatch(Map<String, dynamic> row) {
    final players = (row['players'] as List?) ?? const [];
    final joined = players.where((p) => p is Map && p['status'] == 'joined').length;
    return FootballMatch.fromJson({...row, 'players_count': joined});
  }
}

/// Resolves the current player profile id.
class AuthServiceProfile {
  static Future<Map<String, dynamic>?> current() async {
    final user = SupabaseService.client.auth.currentUser;
    if (user == null) return null;
    return SupabaseService.client
        .from('player_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
  }
}
