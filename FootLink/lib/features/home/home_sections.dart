import 'package:flutter/material.dart';

import '../../core/models/team.dart';
import '../../core/models/venue.dart';
import '../../shared/widgets/profile_avatar.dart';
import '../../shared/utils/format.dart';

/// Horizontal scrolling list of recommended teams.
class TeamsRow extends StatelessWidget {
  const TeamsRow({super.key, required this.teams});

  final List<Team> teams;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 150,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: teams.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, i) {
          final t = teams[i];
          return SizedBox(
            width: 220,
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        ProfileAvatar(imageUrl: t.logoUrl, name: t.name ?? 'T', radius: 22),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            t.name ?? 'Team',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    Text(t.city ?? '', style: const TextStyle(color: Color(0xFF5A6B7B), fontSize: 13)),
                    const SizedBox(height: 4),
                    Text(
                      '${t.memberCount} members · ${Format.skill(t.skillLevel?.name)}',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF5A6B7B)),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

/// Horizontal scrolling list of nearby venues.
class VenuesRow extends StatelessWidget {
  const VenuesRow({super.key, required this.venues});

  final List<Venue> venues;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 160,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: venues.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, i) {
          final v = venues[i];
          return SizedBox(
            width: 240,
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: v.isIndoor ? Colors.indigo.shade50 : Colors.green.shade50,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(v.isIndoor ? Icons.meeting_room : Icons.park, color: v.isIndoor ? Colors.indigo : Colors.green),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            v.name ?? 'Venue',
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.place, size: 14, color: Color(0xFF5A6B7B)),
                        const SizedBox(width: 4),
                        Text(v.city ?? '', style: const TextStyle(fontSize: 12, color: Color(0xFF5A6B7B))),
                        const Spacer(),
                        if (v.distanceKm != null)
                          Text(
                            Format.distance(v.distanceKm!),
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
