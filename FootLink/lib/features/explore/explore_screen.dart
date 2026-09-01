import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../../core/config/app_config.dart';
import '../../core/models/football_match.dart';
import '../../l10n/strings.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/match_card.dart';
import '../match_details/match_details_screen.dart';
import 'match_repository.dart';

/// Explore: search nearby matches with list/map views and filters.
class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  final _repo = MatchRepository.instance;
  final _search = TextEditingController();

  List<FootballMatch> _matches = const [];
  bool _loading = true;
  bool _mapView = false;
  MatchFilters _filters = MatchFilters();
  final double _lat = 34.0209;
  final double _lng = -6.8416;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final matches = await _repo.fetchMatches(
        userLat: _lat,
        userLng: _lng,
        filters: _filters,
        limit: 50,
      );
      if (!mounted) return;
      setState(() {
        _matches = matches;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(Strings.tr(context, 'explore')),
        actions: [
          IconButton(
            onPressed: _showFilters,
            icon: const Icon(Icons.tune),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _search,
              decoration: InputDecoration(
                hintText: Strings.tr(context, 'searchPlaceholder'),
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _search.clear();
                    _load();
                  },
                ),
              ),
              onChanged: (_) => {},
            ),
          ),
          _viewToggle(),
          const SizedBox(height: 4),
          Expanded(child: _buildBody()),
        ],
      ),
    );
  }

  Widget _viewToggle() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: SegmentedButton<bool>(
        segments: const [
          ButtonSegment(value: false, icon: Icon(Icons.view_list), label: Text('List')),
          ButtonSegment(value: true, icon: Icon(Icons.map_outlined), label: Text('Map')),
        ],
        selected: {_mapView},
        onSelectionChanged: (s) => setState(() => _mapView = s.first),
      ),
    );
  }

  Widget _buildBody() {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_matches.isEmpty) {
      return EmptyState(
        icon: Icons.event_busy,
        message: Strings.tr(context, 'emptyState'),
      );
    }
    if (_mapView) return _buildMap();
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _matches.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, i) {
        final m = _matches[i];
        return MatchCard(
          match: m,
          userLat: _lat,
          userLng: _lng,
          onTap: () => _open(m),
        );
      },
    );
  }

  Widget _buildMap() {
    final located = _matches
        .where((m) => m.latitude != null && m.longitude != null)
        .toList();
    return FlutterMap(
      options: MapOptions(
        initialCenter: LatLng(_lat, _lng),
        initialZoom: 11,
      ),
      children: [
        TileLayer(
          urlTemplate: AppConfig.osmTileUrl,
          userAgentPackageName: 'com.footlink',
        ),
        MarkerLayer(
          markers: located.map((m) {
            return Marker(
              point: LatLng(m.latitude!, m.longitude!),
              width: 40,
              height: 40,
              child: GestureDetector(
                onTap: () => _open(m),
                child: const Icon(Icons.location_pin, color: Color(0xFF21D07A), size: 40),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  void _showFilters() async {
    final result = await showModalBottomSheet<MatchFilters>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _FilterSheet(filters: _filters),
    );
    if (result != null) {
      setState(() => _filters = result);
      _load();
    }
  }

  void _open(FootballMatch m) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => MatchDetailsScreen(matchId: m.id)));
  }
}

/// Bottom sheet with match filters.
class _FilterSheet extends StatefulWidget {
  const _FilterSheet({required this.filters});
  final MatchFilters filters;

  @override
  State<_FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends State<_FilterSheet> {
  late double _distance;
  String? _skill;
  String _format = 'all';
  String _fee = 'all';
  String _indoor = 'all';

  @override
  void initState() {
    super.initState();
    _distance = widget.filters.maxDistanceKm ?? 25;
    _skill = widget.filters.skillLevel;
    _format = widget.filters.format ?? 'all';
    _fee = widget.filters.feeType ?? 'all';
    _indoor = widget.filters.isIndoor == null ? 'all' : (widget.filters.isIndoor! ? 'indoor' : 'outdoor');
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Distance', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            Slider(
              value: _distance,
              min: 2,
              max: 25,
              divisions: 4,
              label: '${_distance.round()} km',
              onChanged: (v) => setState(() => _distance = v),
            ),
            const Text('Skill level', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            Wrap(
              children: ['all', 'beginner', 'casual', 'intermediate', 'advanced']
                  .map((s) => ChoiceChip(
                        label: Text(s),
                        selected: _skill == s,
                        onSelected: (_) => setState(() => _skill = s),
                      ))
                  .toList(),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _format,
              items: const [
                DropdownMenuItem(value: 'all', child: Text('Any format')),
                DropdownMenuItem(value: '5', child: Text('5-a-side')),
                DropdownMenuItem(value: '7', child: Text('7-a-side')),
                DropdownMenuItem(value: '9', child: Text('9-a-side')),
                DropdownMenuItem(value: '11', child: Text('11-a-side')),
              ],
              onChanged: (v) => setState(() => _format = v!),
              decoration: const InputDecoration(labelText: 'Format'),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _fee,
              items: const [
                DropdownMenuItem(value: 'all', child: Text('Free & paid')),
                DropdownMenuItem(value: 'free', child: Text('Free only')),
                DropdownMenuItem(value: 'paid', child: Text('Paid only')),
              ],
              onChanged: (v) => setState(() => _fee = v!),
              decoration: const InputDecoration(labelText: 'Price'),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _indoor,
              items: const [
                DropdownMenuItem(value: 'all', child: Text('Any field')),
                DropdownMenuItem(value: 'indoor', child: Text('Indoor')),
                DropdownMenuItem(value: 'outdoor', child: Text('Outdoor')),
              ],
              onChanged: (v) => setState(() => _indoor = v!),
              decoration: const InputDecoration(labelText: 'Field type'),
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: () {
                final f = MatchFilters(
                  maxDistanceKm: _distance,
                  skillLevel: _skill == 'all' ? null : _skill,
                  format: _format == 'all' ? null : _format,
                  feeType: _fee == 'all' ? null : _fee,
                  isIndoor: _indoor == 'all' ? null : _indoor == 'indoor',
                );
                Navigator.pop(context, f);
              },
              child: const Text('Apply filters'),
            ),
          ],
        ),
      ),
    );
  }
}
