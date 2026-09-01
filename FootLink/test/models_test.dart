import 'package:flutter_test/flutter_test.dart';
import 'package:footlink/core/models/enums.dart';
import 'package:footlink/core/models/football_match.dart';
import 'package:footlink/core/models/user_profile.dart';

void main() {
  group('FootballMatch JSON round trip', () {
    test('parses and serializes defaults', () {
      final json = {
        'id': 'm1',
        'organizer_id': 'o1',
        'title': 'Casablanca friendly',
        'match_type': 'friendly',
        'date_time': '2026-09-01T18:00:00.000Z',
        'status': 'open',
        'team_size': '7',
        'skill_level': 'intermediate',
        'max_players': 14,
        'fee_type': 'free',
      };
      final m = FootballMatch.fromJson(json);
      expect(m.title, 'Casablanca friendly');
      expect(m.format, MatchFormat.sevenASide);
      expect(m.skillLevel, SkillLevel.intermediate);
      expect(m.isFree, isTrue);
    });
  });

  group('UserProfile JSON', () {
    test('parses position and skill', () {
      final json = {
        'id': 'p1',
        'user_id': 'u1',
        'first_name': 'Youssef',
        'position': 'striker',
        'skill_level': 'advanced',
        'city': 'Rabat',
        'matches_count': 3,
      };
      final p = UserProfile.fromJson(json);
      expect(p.firstName, 'Youssef');
      expect(p.position, Position.striker);
      expect(p.skillLevel, SkillLevel.advanced);
      expect(p.matchesCount, 3);
    });
  });
}
