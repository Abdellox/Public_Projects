import 'package:flutter/material.dart';

import '../../core/services/auth_service.dart';
import '../../l10n/strings.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/match_card.dart';
import '../../shared/widgets/section_header.dart';
import '../../core/models/football_match.dart';
import '../../core/models/team.dart';
import '../../core/models/venue.dart';
import '../explore/match_repository.dart';
import '../match_details/match_details_screen.dart';
import '../explore/explore_screen.dart';
import 'home_sections.dart';

/// Home screen: current city, nearby matches, teams and venues.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _repo = MatchRepository.instance;
  List<FootballMatch> _matches = const [];
  List<Team> _teams = const [];
  List<Venue> _venues = const [];
  double? _userLat;
  double? _userLng;
  bool _loading = true;
  bool _error = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = false;
    });
    try {
      // Demo anchor so the app works without live GPS (Rabat, Morocco).
      final lat = _userLat ?? 34.0209;
      final lng = _userLng ?? -6.8416;
      final results = await Future.wait([
        _repo.fetchMatches(userLat: lat, userLng: lng, limit: 20),
        _repo.fetchTeams(limit: 10),
        _repo.fetchVenues(userLat: lat, userLng: lng, limit: 10),
      ]);
      if (!mounted) return;
      setState(() {
        _matches = results[0] as List<FootballMatch>;
        _teams = results[1] as List<Team>;
        _venues = results[2] as List<Venue>;
        _userLat = lat;
        _userLng = lng;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.sports_soccer, color: Color(0xFF21D07A)),
            const SizedBox(width: 8),
            Text(Strings.tr(context, 'appName')),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () async {
              await AuthService.instance.signOut();
              if (!mounted) return;
              Navigator.of(context).pushNamedAndRemoveUntil('/', (r) => false);
            },
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.only(bottom: 24),
          children: [
            const QuickActions(),
            const SizedBox(height: 8),
            _buildCityHeader(),
            if (_loading)
              const Padding(
                padding: EdgeInsets.all(32),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (_error)
              Padding(
                padding: const EdgeInsets.all(24),
                child: EmptyState(
                  icon: Icons.wifi_off,
                  message: Strings.tr(context, 'error'),
                  action: FilledButton(onPressed: _load, child: Text(Strings.tr(context, 'retry'))),
                ),
              )
            else ...[
              SectionHeader(
                title: Strings.tr(context, 'nearbyMatches'),
                onSeeAll: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ExploreScreen()),
                ),
              ),
              if (_matches.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: EmptyState(icon: Icons.event_available, message: 'No matches nearby yet'),
                )
              else
                ..._matches.take(5).map(
                      (m) => Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
                        child: MatchCard(
                          match: m,
                          userLat: _userLat,
                          userLng: _userLng,
                          onTap: () => _openMatch(m),
                        ),
                      ),
                    ),
              if (_teams.isNotEmpty) ...[
                SectionHeader(title: Strings.tr(context, 'recommendedTeams')),
                TeamsRow(teams: _teams),
              ],
              if (_venues.isNotEmpty) ...[
                SectionHeader(title: Strings.tr(context, 'nearbyVenues')),
                VenuesRow(venues: _venues),
              ],
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildCityHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          const Icon(Icons.location_on, color: Color(0xFF21D07A)),
          const SizedBox(width: 6),
          Text(
            '${Strings.tr(context, 'currentCity')}: Rabat',
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
          ),
        ],
      ),
    );
  }

  void _openMatch(FootballMatch match) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => MatchDetailsScreen(matchId: match.id)),
    );
  }
}

class QuickActions extends StatelessWidget {
  const QuickActions({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(child: _button(context, Icons.search, Strings.tr(context, 'findMatch'), _noop)),
          const SizedBox(width: 12),
          Expanded(child: _button(context, Icons.add, Strings.tr(context, 'createMatch'), _noop)),
        ],
      ),
    );
  }

  Widget _button(BuildContext context, IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 18),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.primaryContainer,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            Icon(icon, size: 28, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 8),
            Text(label, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  static void _noop() {}
}
