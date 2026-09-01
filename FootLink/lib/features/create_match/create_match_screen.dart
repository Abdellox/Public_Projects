import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../core/models/enums.dart';
import '../../core/models/football_match.dart';
import '../../core/services/auth_service.dart';
import '../../l10n/strings.dart';
import '../explore/match_repository.dart';

/// Multi-step form to create a new match.
class CreateMatchScreen extends StatefulWidget {
  const CreateMatchScreen({super.key});

  @override
  State<CreateMatchScreen> createState() => _CreateMatchScreenState();
}

class _CreateMatchScreenState extends State<CreateMatchScreen> {
  final _repo = MatchRepository.instance;
  final _pageController = PageController();

  int _step = 0;
  bool _saving = false;

  // Step 1: match information
  final _title = TextEditingController();
  MatchFormat _format = MatchFormat.fiveASide;
  SkillLevel _skill = SkillLevel.casual;
  MatchType _type = MatchType.friendly;
  bool _isIndoor = false;

  // Step 2: date & time
  DateTime _dateTime = DateTime.now().add(const Duration(days: 1)).toLocal();
  final _address = TextEditingController();

  // Step 3: player requirements
  int _maxPlayers = 10;
  int _minPlayers = 2;

  // Step 4: price / visibility
  bool _isPrivate = false;
  FeeType _feeType = FeeType.free;
  final _feeAmount = TextEditingController();
  JoinPolicy _joinPolicy = JoinPolicy.open;
  final _description = TextEditingController();
  final _rules = TextEditingController();

  @override
  void dispose() {
    _pageController.dispose();
    _title.dispose();
    _address.dispose();
    _feeAmount.dispose();
    _description.dispose();
    _rules.dispose();
    super.dispose();
  }

  Future<void> _publish() async {
    setState(() => _saving = true);
    try {
      final organizerId = await _currentProfileId();
      final match = FootballMatch(
        id: '',
        organizerId: organizerId ?? '',
        title: _title.text,
        type: _type,
        dateTime: _dateTime,
        city: 'Rabat',
        country: 'Morocco',
        venueName: _address.text,
        format: _format,
        skillLevel: _skill,
        maxPlayers: _maxPlayers,
        minPlayers: _minPlayers,
        feeType: _feeType,
        feeAmount: _feeType == FeeType.paid ? double.tryParse(_feeAmount.text) : null,
        isIndoor: _isIndoor,
        joinPolicy: _joinPolicy,
        isPrivate: _isPrivate,
        description: _description.text,
        rules: _rules.text,
        latitude: 34.0209,
        longitude: -6.8416,
      );
      final created = await _repo.createMatch(match);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Match created!')),
      );
      Navigator.of(context).pop(created);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed: $e')),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<String?> _currentProfileId() async {
    final user = AuthService.instance.currentUser;
    if (user == null) return null;
    try {
      return null; // profile id resolved server-side; keep it simple
    } catch (_) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(Strings.tr(context, 'createMatch')),
        leading: _step > 0
            ? IconButton(onPressed: () => _pageController.previousPage(duration: const Duration(milliseconds: 250), curve: Curves.easeIn), icon: const Icon(Icons.arrow_back))
            : null,
      ),
      body: Column(
        children: [
          LinearProgressIndicator(value: (_step + 1) / 4),
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              onPageChanged: (i) => setState(() => _step = i),
              children: [
                _stepInfo(),
                _stepDateTime(),
                _stepPlayers(),
                _stepPublish(),
              ],
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: FilledButton(
                      onPressed: _saving
                          ? null
                          : _step < 3
                              ? () => _pageController.nextPage(duration: const Duration(milliseconds: 250), curve: Curves.easeIn)
                              : _publish,
                      child: _saving
                          ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : Text(_step < 3 ? Strings.tr(context, 'next') : 'Publish'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _stepInfo() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        TextField(
          controller: _title,
          decoration: const InputDecoration(labelText: 'Match title'),
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<MatchFormat>(
          initialValue: _format,
          decoration: const InputDecoration(labelText: 'Format'),
          items: MatchFormat.values.map((f) => DropdownMenuItem(value: f, child: Text('${f.label}-a-side'))).toList(),
          onChanged: (v) => setState(() => _format = v!),
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<SkillLevel>(
          initialValue: _skill,
          decoration: const InputDecoration(labelText: 'Skill level'),
          items: SkillLevel.values.map((s) => DropdownMenuItem(value: s, child: Text(FormatEnum.skill(s.name)))).toList(),
          onChanged: (v) => setState(() => _skill = v!),
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<MatchType>(
          initialValue: _type,
          decoration: const InputDecoration(labelText: 'Match type'),
          items: MatchType.values.map((t) => DropdownMenuItem(value: t, child: Text(t.name))).toList(),
          onChanged: (v) => setState(() => _type = v!),
        ),
        const SizedBox(height: 16),
        SwitchListTile(
          title: const Text('Indoor field'),
          value: _isIndoor,
          onChanged: (v) => setState(() => _isIndoor = v),
          contentPadding: EdgeInsets.zero,
        ),
      ],
    );
  }

  Widget _stepDateTime() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        ListTile(
          contentPadding: EdgeInsets.zero,
          leading: const Icon(Icons.calendar_today),
          title: const Text('Date & time'),
          subtitle: Text(DateFormat('EEE, d MMM yyyy · HH:mm').format(_dateTime)),
          trailing: const Icon(Icons.edit),
          onTap: () async {
            final d = await showDatePicker(
              context: context,
              initialDate: _dateTime,
              firstDate: DateTime.now(),
              lastDate: DateTime.now().add(const Duration(days: 365)),
            );
            if (d == null) return;
            final t = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(_dateTime));
            if (t == null) return;
            setState(() {
              _dateTime = DateTime(d.year, d.month, d.day, t.hour, t.minute);
            });
          },
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _address,
          decoration: const InputDecoration(labelText: 'Venue / meeting point', hintText: 'Public venue only'),
        ),
      ],
    );
  }

  Widget _stepPlayers() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        _slider(title: 'Max players', value: _maxPlayers.toDouble(), min: 2, max: 32, onChanged: (v) => setState(() => _maxPlayers = v.round())),
        _slider(title: 'Min players', value: _minPlayers.toDouble(), min: 2, max: 32, onChanged: (v) => setState(() => _minPlayers = v.round())),
        Text('Max players: $_maxPlayers · Min players: $_minPlayers'),
      ],
    );
  }

  Widget _stepPublish() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Private match'),
          value: _isPrivate,
          onChanged: (v) => setState(() => _isPrivate = v),
        ),
        DropdownButtonFormField<FeeType>(
          initialValue: _feeType,
          decoration: const InputDecoration(labelText: 'Price'),
          items: FeeType.values.map((f) => DropdownMenuItem(value: f, child: Text(f.name))).toList(),
          onChanged: (v) => setState(() => _feeType = v!),
        ),
        if (_feeType == FeeType.paid) ...[
          const SizedBox(height: 16),
          TextField(
            controller: _feeAmount,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Fee amount'),
          ),
        ],
        const SizedBox(height: 16),
        DropdownButtonFormField<JoinPolicy>(
          initialValue: _joinPolicy,
          decoration: const InputDecoration(labelText: 'Joining'),
          items: JoinPolicy.values.map((j) => DropdownMenuItem(value: j, child: Text(j.name))).toList(),
          onChanged: (v) => setState(() => _joinPolicy = v!),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _description,
          maxLines: 3,
          decoration: const InputDecoration(labelText: 'Description'),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _rules,
          maxLines: 3,
          decoration: const InputDecoration(labelText: 'Rules'),
        ),
      ],
    );
  }

  Widget _slider({required String title, required double value, required double min, required double max, required ValueChanged<double> onChanged}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        Slider(value: value, min: min, max: max, divisions: (max - min).round(), label: value.round().toString(), onChanged: onChanged),
      ],
    );
  }
}

/// Small helper to render skill labels without importing Format twice.
class FormatEnum {
  static String skill(String name) => switch (name) {
        'beginner' => 'Beginner',
        'casual' => 'Casual',
        'intermediate' => 'Intermediate',
        'advanced' => 'Advanced',
        _ => 'Casual',
      };
}
