import 'package:intl/intl.dart';

import '../../core/models/enums.dart';

/// Formatting helpers for dates, distances, prices and skill labels.
class Format {
  Format._();

  static final DateFormat _date = DateFormat('EEE, d MMM');
  static final DateFormat _time = DateFormat('HH:mm');
  static final DateFormat _full = DateFormat('EEE, d MMM yyyy · HH:mm');

  static String dateTime(DateTime d) => _date.format(d);
  static String time(DateTime d) => _time.format(d);
  static String full(DateTime d) => _full.format(d);

  static String distance(double km) {
    if (km < 1) return '${(km * 1000).round()} m';
    return '${km.toStringAsFixed(km < 10 ? 1 : 0)} km';
  }

  static String price(double? amount) {
    if (amount == null) return 'Paid';
    return '${NumberFormat.currency(symbol: '\$').format(amount)}';
  }

  static String skill(String? name) {
    if (name == null) return 'Any';
    return switch (name) {
      'beginner' => 'Beginner',
      'casual' => 'Casual',
      'intermediate' => 'Intermediate',
      'advanced' => 'Advanced',
      _ => 'Any',
    };
  }

  static String position(String? name) {
    if (name == null) return 'Flexible';
    final pos = Position.values.firstWhere(
      (p) => p.name == name,
      orElse: () => Position.flexible,
    );
    return switch (pos) {
      Position.goalkeeper => 'Goalkeeper',
      Position.defender => 'Defender',
      Position.midfielder => 'Midfielder',
      Position.winger => 'Winger',
      Position.striker => 'Striker',
      Position.flexible => 'Flexible',
    };
  }
}
