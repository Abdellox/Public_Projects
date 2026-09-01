import 'package:flutter/material.dart';

import '../../core/models/team.dart';
import '../../l10n/strings.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/profile_avatar.dart';
import '../../shared/utils/format.dart';
import '../explore/match_repository.dart';

/// Browse and create teams.
class TeamsScreen extends StatefulWidget {
  const TeamsScreen({super.key});

  @override
  State<TeamsScreen> createState() => _TeamsScreenState();
}

class _TeamsScreenState extends State<TeamsScreen> {
  final _repo = MatchRepository.instance;
  List<Team> _teams = const [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final teams = await _repo.fetchTeams(limit: 50);
      if (!mounted) return;
      setState(() {
        _teams = teams;
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
        title: Text(Strings.tr(context, 'teams')),
        actions: [
          IconButton(onPressed: () => _createTeam(), icon: const Icon(Icons.add)),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _teams.isEmpty
              ? EmptyState(
                  icon: Icons.groups,
                  message: Strings.tr(context, 'emptyState'),
                  action: FilledButton(onPressed: _createTeam, child: Text(Strings.tr(context, 'createTeam'))),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _teams.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, i) {
                      final t = _teams[i];
                      return Card(
                        child: ListTile(
                          leading: ProfileAvatar(imageUrl: t.logoUrl, name: t.name ?? 'T', radius: 24),
                          title: Text(t.name ?? 'Team', style: const TextStyle(fontWeight: FontWeight.w700)),
                          subtitle: Text('${t.city ?? ''} · ${t.memberCount} members'),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () => _openTeam(t),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  void _openTeam(Team t) {
    showModalBottomSheet(context: context, builder: (_) => _TeamSheet(team: t));
  }

  void _createTeam() async {
    final name = await _promptName();
    if (name == null || name.trim().isEmpty) return;
    try {
      await _repo.createTeam({
        'name': name.trim(),
        'city': 'Rabat',
        'country': 'Morocco',
        'skill_level': 'casual',
      });
      _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<String?> _promptName() {
    final ctrl = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(Strings.tr(context, 'createTeam')),
        content: TextField(
          controller: ctrl,
          autofocus: true,
          decoration: InputDecoration(labelText: Strings.tr(context, 'teamName')),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: Text(Strings.tr(context, 'cancel'))),
          FilledButton(onPressed: () => Navigator.pop(context, ctrl.text), child: Text(Strings.tr(context, 'save'))),
        ],
      ),
    );
  }
}

class _TeamSheet extends StatelessWidget {
  const _TeamSheet({required this.team});
  final Team team;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                ProfileAvatar(imageUrl: team.logoUrl, name: team.name ?? 'T', radius: 28),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(team.name ?? '', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(children: [
              const Icon(Icons.place, size: 16, color: Color(0xFF5A6B7B)),
              const SizedBox(width: 4),
              Text(team.city ?? '', style: const TextStyle(color: Color(0xFF5A6B7B))),
            ]),
            const SizedBox(height: 8),
            Text(team.description ?? 'No description yet.'),
            const SizedBox(height: 12),
            Text('${Format.skill(team.skillLevel?.name)} · ${team.memberCount} members'),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.person_add),
                label: Text('Request to join'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
