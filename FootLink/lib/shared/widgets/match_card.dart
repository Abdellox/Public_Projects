import 'package:flutter/material.dart';

import '../../core/models/enums.dart';
import '../../core/models/football_match.dart';
import '../../core/utils/distance.dart';
import '../../l10n/strings.dart';
import '../utils/format.dart';

/// Card shown for each match in lists, search and home.
class MatchCard extends StatelessWidget {
  const MatchCard({
    super.key,
    required this.match,
    this.userLat,
    this.userLng,
    this.onTap,
    this.onJoin,
  });

  final FootballMatch match;
  final double? userLat;
  final double? userLng;
  final VoidCallback? onTap;
  final VoidCallback? onJoin;

  String _distanceLabel(BuildContext context) {
    if (userLat == null || userLng == null ||
        match.latitude == null || match.longitude == null) {
      return '';
    }
    final km = LocationUtils.distanceKm(userLat!, userLng!, match.latitude!, match.longitude!);
    return Format.distance(km);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final accent = const Color(0xFF21D07A);

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      match.title ?? '${match.format.label}-a-side match',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                    ),
                  ),
                  _StatusPill(status: match.status),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  const Icon(Icons.calendar_today, size: 16, color: Color(0xFF5A6B7B)),
                  const SizedBox(width: 6),
                  Text(Format.dateTime(match.dateTime)),
                  const SizedBox(width: 14),
                  Icon(Icons.schedule, size: 16, color: const Color(0xFF5A6B7B)),
                  const SizedBox(width: 6),
                  Text(Format.time(match.dateTime)),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.place, size: 16, color: Color(0xFF5A6B7B)),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      [match.venueName, match.city].whereType<String>().join(' · '),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Color(0xFF5A6B7B)),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    _distanceLabel(context),
                    style: TextStyle(color: accent, fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _Tag(label: Format.skill(match.skillLevel?.name)),
                  const SizedBox(width: 6),
                  _Tag(label: '${match.format.label}-a-side'),
                  const SizedBox(width: 6),
                  _Tag(label: match.isFree ? Strings.tr(context, 'free') : Format.price(match.feeAmount)),
                  const Spacer(),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: LinearProgressIndicator(
                            value: match.fillRatio,
                            minHeight: 6,
                            backgroundColor: theme.colorScheme.surfaceContainerHighest,
                            color: accent,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '${match.playersJoined}/${match.maxPlayers}',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  if (onJoin != null && !match.isFull)
                    FilledButton.icon(
                      onPressed: onJoin,
                      icon: const Icon(Icons.add, size: 18),
                      label: Text(Strings.tr(context, 'join')),
                      style: FilledButton.styleFrom(
                        minimumSize: const Size(0, 40),
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                      ),
                    )
                  else if (match.isFull)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        Strings.tr(context, 'matchFull'),
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.status});
  final MatchStatus status;

  @override
  Widget build(BuildContext context) {
    final data = switch (status) {
      MatchStatus.open => (const Color(0xFF21D07A), 'Open'),
      MatchStatus.almostFull => (const Color(0xFFFFB020), 'Almost full'),
      MatchStatus.full => (const Color(0xFFE5484D), 'Full'),
      MatchStatus.started => (const Color(0xFF2F6BFF), 'Started'),
      MatchStatus.finished => (const Color(0xFF5A6B7B), 'Finished'),
      MatchStatus.cancelled => (const Color(0xFFE5484D), 'Cancelled'),
      MatchStatus.draft => (const Color(0xFF5A6B7B), 'Draft'),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: data.$1.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        data.$2,
        style: TextStyle(color: data.$1, fontSize: 12, fontWeight: FontWeight.w700),
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  const _Tag({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
    );
  }
}
