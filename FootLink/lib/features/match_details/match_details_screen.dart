import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../../core/config/app_config.dart';
import '../../core/models/football_match.dart';
import '../../l10n/strings.dart';
import '../../shared/utils/format.dart';
import '../chat/chat_screen.dart';
import '../explore/match_repository.dart';

/// Detailed view of a single match.
class MatchDetailsScreen extends StatefulWidget {
  const MatchDetailsScreen({super.key, required this.matchId});

  final String matchId;

  @override
  State<MatchDetailsScreen> createState() => _MatchDetailsScreenState();
}

class _MatchDetailsScreenState extends State<MatchDetailsScreen> {
  final _repo = MatchRepository.instance;
  FootballMatch? _match;
  bool _busy = false;
  bool _joined = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final match = await _repo.fetchMatch(widget.matchId);
      if (!mounted) return;
      setState(() {
        _match = match;
        _joined = match != null;
      });
    } catch (_) {
      // leave empty
    }
  }

  Future<void> _join() async {
    if (_match == null) return;
    setState(() => _busy = true);
    try {
      await _repo.joinMatch(_match!.id);
      if (!mounted) return;
      setState(() {
        _joined = true;
        _busy = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _busy = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final m = _match;
    return Scaffold(
      appBar: AppBar(title: Text(Strings.tr(context, 'matchDetails'))),
      body: m == null
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text(
                  m.title ?? '${m.format.label}-a-side match',
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 6),
                Text(Format.full(m.dateTime), style: const TextStyle(color: Color(0xFF5A6B7B))),
                const SizedBox(height: 16),
                _map(m),
                const SizedBox(height: 16),
                Row(children: [
                  _info(Icons.sports_soccer, Format.skill(m.skillLevel?.name)),
                  const SizedBox(width: 12),
                  _info(Icons.groups, '${m.format.label}-a-side'),
                  const SizedBox(width: 12),
                  _info(m.isFree ? Icons.card_giftcard : Icons.payments, m.isFree ? Strings.tr(context, 'free') : Format.price(m.feeAmount)),
                ]),
                const SizedBox(height: 12),
                Row(children: [
                  _info(Icons.people_alt, '${m.playersJoined}/${m.maxPlayers}'),
                  const SizedBox(width: 12),
                  _info(m.isIndoor ? Icons.meeting_room : Icons.park, Strings.tr(context, m.isIndoor ? 'indoor' : 'outdoor')),
                  const SizedBox(width: 12),
                  _info(Icons.place, m.city ?? ''),
                ]),
                const SizedBox(height: 20),
                _section(Strings.tr(context, 'venue'), m.venueName ?? m.city ?? '-'),
                _section(Strings.tr(context, 'description'), m.description ?? '-'),
                _section(Strings.tr(context, 'rules'), m.rules ?? '-'),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: _busy || _joined ? null : _join,
                        icon: Icon(_joined ? Icons.check : Icons.add),
                        label: Text(_joined ? Strings.tr(context, 'joined') : Strings.tr(context, 'join')),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.chat_bubble_outline),
                        label: Text(Strings.tr(context, 'chat')),
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => ChatScreen(matchId: m.id, matchTitle: m.title ?? 'Match')),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    IconButton(
                      tooltip: Strings.tr(context, 'report'),
                      onPressed: () => _reportDialog(),
                      icon: const Icon(Icons.flag_outlined),
                    ),
                    IconButton(
                      tooltip: Strings.tr(context, 'share'),
                      onPressed: () {},
                      icon: const Icon(Icons.share_outlined),
                    ),
                  ],
                ),
              ],
            ),
    );
  }

  Widget _map(FootballMatch m) {
    if (m.latitude == null || m.longitude == null) {
      return const SizedBox.shrink();
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: SizedBox(
        height: 180,
        child: FlutterMap(
          options: MapOptions(
            initialCenter: LatLng(m.latitude!, m.longitude!),
            initialZoom: 14,
          ),
          children: [
            TileLayer(urlTemplate: AppConfig.osmTileUrl, userAgentPackageName: 'com.footlink'),
            MarkerLayer(
              markers: [
                Marker(
                  point: LatLng(m.latitude!, m.longitude!),
                  width: 40,
                  height: 40,
                  child: const Icon(Icons.location_pin, color: Color(0xFF21D07A), size: 40),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _info(IconData icon, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, size: 22, color: const Color(0xFF21D07A)),
            const SizedBox(height: 6),
            Text(label, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
          ],
        ),
      ),
    );
  }

  Widget _section(String title, String body) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text(body, style: const TextStyle(color: Color(0xFF5A6B7B), height: 1.4)),
        ],
      ),
    );
  }

  void _reportDialog() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(Strings.tr(context, 'report')),
        content: const Text('Describe the issue. Our moderation team will review it.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: () { Navigator.pop(context); }, child: const Text('Submit')),
        ],
      ),
    );
  }
}
