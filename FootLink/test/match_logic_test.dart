import 'package:flutter_test/flutter_test.dart';
import 'package:footlink/core/models/enums.dart';
import 'package:footlink/core/models/football_match.dart';

FootballMatch buildMatch({int maxPlayers = 10, int joined = 0}) {
  return FootballMatch(
    id: 'm1',
    organizerId: 'o1',
    title: 'Test match',
    dateTime: DateTime(2026, 9, 1, 18, 0),
    maxPlayers: maxPlayers,
    playersJoined: joined,
  );
}

void main() {
  group('FootballMatch availability', () {
    test('is full when joined == max', () {
      expect(buildMatch(maxPlayers: 10, joined: 10).isFull, isTrue);
      expect(buildMatch(maxPlayers: 10, joined: 10).availableSpots, 0);
    });

    test('is almost full with one spot left', () {
      expect(buildMatch(maxPlayers: 10, joined: 9).isAlmostFull, isTrue);
      expect(buildMatch(maxPlayers: 10, joined: 9).isFull, isFalse);
    });

    test('available spots clamps at zero', () {
      expect(buildMatch(maxPlayers: 5, joined: 5).availableSpots, 0);
    });
  });

  group('MatchStatus enum', () {
    test('statuses are ordered from draft to cancelled', () {
      expect(MatchStatus.values.map((s) => s.name).toList(),
          ['draft', 'open', 'almostFull', 'full', 'started', 'finished', 'cancelled']);
    });
  });
}
