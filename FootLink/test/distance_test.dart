import 'package:flutter_test/flutter_test.dart';
import 'package:footlink/core/utils/distance.dart';

void main() {
  group('LocationUtils.distanceKm', () {
    test('distance from a point to itself is zero', () {
      expect(LocationUtils.distanceKm(34.0, -6.0, 34.0, -6.0), lessThan(0.001));
    });

    test('roughly 111 km per degree of latitude', () {
      final km = LocationUtils.distanceKm(0, 0, 1, 0);
      expect(km, closeTo(111.2, 1.5));
    });

    test('Rabat to Casablanca is roughly 90 km', () {
      final km = LocationUtils.distanceKm(34.0209, -6.8416, 33.5731, -7.5898);
      expect(km, greaterThan(70));
      expect(km, lessThan(120));
    });
  });

  group('LocationUtils.boundingBox', () {
    test('box around a point includes points within range', () {
      final box = LocationUtils.boundingBox(34.0209, -6.8416, 25);
      expect(box.minLat, lessThan(box.maxLat));
      expect(box.minLng, lessThan(box.maxLng));
      expect(box.maxLat - box.minLat, closeTo(2 * 25 / 110.574, 0.5));
    });
  });

  group('LocationUtils.jitter', () {
    test('returns coordinates within ~1 km of origin', () {
      final p = LocationUtils.jitter(34.0, -6.0, maxKm: 1.0);
      final km = LocationUtils.distanceKm(34.0, -6.0, p.lat, p.lng);
      expect(km, lessThanOrEqualTo(1.2));
    });
  });
}
