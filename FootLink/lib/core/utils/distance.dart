import 'dart:math' as math;

import '../models/venue.dart';
import '../models/football_match.dart';

/// Location helpers. Only approximate distances are computed — FootLink never
/// stores or displays a player's exact home address.
class LocationUtils {
  LocationUtils._();

  /// Distance in kilometres between two coordinates using the haversine formula.
  static double distanceKm(double lat1, double lng1, double lat2, double lng2) {
    const r = 6371.0; // Earth radius in km
    final dLat = _rad(lat2 - lat1);
    final dLng = _rad(lng2 - lng1);
    final a = math.pow(math.sin(dLat / 2), 2) +
        math.cos(_rad(lat1)) * math.cos(_rad(lat2)) * math.pow(math.sin(dLng / 2), 2);
    return 2 * r * math.asin(math.sqrt(a));
  }

  /// Rounds a coordinate to ~N km precision to protect exact location privacy.
  static double _rad(num deg) => deg * math.pi / 180;

  /// Applies a privacy "jitter" so home locations are never exact.
  static ({double lat, double lng}) jitter(double lat, double lng, {double maxKm = 1.0}) {
    final theta = math.Random().nextDouble() * 2 * math.pi;
    final d = maxKm * math.Random().nextDouble();
    final latKm = d * math.cos(theta);
    final lngKm = d * math.sin(theta);
    const kmPerLat = 110.574;
    final kmPerLng = 111.320 * math.cos(_rad(lat));
    return (
      lat: lat + (latKm / kmPerLat),
      lng: lng + (lngKm / kmPerLng),
    );
  }

  /// Builds a rough "bounding box" filter (in degrees) for a max distance.
  static ({double minLat, double maxLat, double minLng, double maxLng, double kmPerLng})
      boundingBox(double lat, double lng, double maxKm) {
    const kmPerLat = 110.574;
    final kmPerLng = 111.320 * math.cos(_rad(lat));
    final dLat = maxKm / kmPerLat;
    final dLng = maxKm / kmPerLng;
    return (
      minLat: lat - dLat,
      maxLat: lat + dLat,
      minLng: lng - dLng,
      maxLng: lng + dLng,
      kmPerLng: kmPerLng,
    );
  }

  /// Sorts matches by distance from the user's position.
  static void sortByDistance(List<FootballMatch> matches, double userLat, double userLng) {
    matches.sort((a, b) {
      final da = (a.latitude != null && a.longitude != null)
          ? distanceKm(userLat, userLng, a.latitude!, a.longitude!)
          : double.infinity;
      final db = (b.latitude != null && b.longitude != null)
          ? distanceKm(userLat, userLng, b.latitude!, b.longitude!)
          : double.infinity;
      return da.compareTo(db);
    });
  }

  /// Sorts venues by distance from the user's position.
  static void sortVenuesByDistance(List<Venue> venues, double userLat, double userLng) {
    for (var v in venues) {
      if (v.latitude != null && v.longitude != null) {
        v = v.copyWith(distanceKm: distanceKm(userLat, userLng, v.latitude!, v.longitude!));
      }
    }
    venues.sort((a, b) => (a.distanceKm ?? double.infinity).compareTo(b.distanceKm ?? double.infinity));
  }
}
