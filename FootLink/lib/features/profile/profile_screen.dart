import 'package:flutter/material.dart';

import '../../core/models/user_profile.dart';
import '../../core/services/auth_service.dart';
import '../../core/services/settings_controller.dart';
import '../../core/theme/app_colors.dart';
import '../../l10n/strings.dart';
import '../../shared/utils/format.dart';
import '../../shared/widgets/profile_avatar.dart';

/// Player profile tab with settings for language and theme.
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  UserProfile? _profile;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final profile = await AuthService.instance.currentProfile();
      if (!mounted) return;
      setState(() {
        _profile = profile;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final settings = SettingsController.instance;
    return Scaffold(
      appBar: AppBar(title: Text(Strings.tr(context, 'myProfile'))),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _header(),
                const SizedBox(height: 20),
                _statsRow(),
                const SizedBox(height: 20),
                _sectionTitle(Strings.tr(context, 'position')),
                Text(_profile?.position?.name ?? 'Not set', style: const TextStyle(color: Color(0xFF5A6B7B))),
                const SizedBox(height: 12),
                _sectionTitle(Strings.tr(context, 'skillLevel')),
                Text(Format.skill(_profile?.skillLevel?.name), style: const TextStyle(color: Color(0xFF5A6B7B))),
                const SizedBox(height: 12),
                _sectionTitle(Strings.tr(context, 'availability')),
                Text('${_profile?.preferredTimes.join(', ') ?? 'Not set'}'),
                const SizedBox(height: 20),
                const Divider(),
                _sectionTitle(Strings.tr(context, 'settings')),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.language),
                  title: Text(Strings.tr(context, 'language')),
                  subtitle: Text(settings.locale.languageCode.toUpperCase()),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _languageDialog(settings),
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  secondary: const Icon(Icons.dark_mode_outlined),
                  title: Text(Strings.tr(context, 'darkMode')),
                  value: settings.isDark,
                  onChanged: (_) => settings.toggleTheme(),
                ),
                const Divider(),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.logout, color: AppColors.danger),
                  title: Text(Strings.tr(context, 'logout'), style: const TextStyle(color: AppColors.danger)),
                  onTap: () async {
                    await AuthService.instance.signOut();
                    if (!mounted) return;
                    Navigator.of(context).pushNamedAndRemoveUntil('/', (r) => false);
                  },
                ),
              ],
            ),
    );
  }

  Widget _header() {
    final p = _profile;
    final name = p?.firstName ?? 'Player';
    return Column(
      children: [
        ProfileAvatar(imageUrl: p?.photoUrl, name: name, radius: 42),
        const SizedBox(height: 12),
        Text(name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
        const SizedBox(height: 4),
        Text(
          '${p?.city ?? ''}${p?.city != null ? ', ' : ''}${p?.country ?? ''}',
          style: const TextStyle(color: Color(0xFF5A6B7B)),
        ),
      ],
    );
  }

  Widget _statsRow() {
    return Row(
      children: [
        _stat('${_profile?.matchesCount ?? 0}', Strings.tr(context, 'matchesPlayed')),
        const SizedBox(width: 12),
        _stat((_profile?.rating ?? 0).toStringAsFixed(1), Strings.tr(context, 'rating')),
        const SizedBox(width: 12),
        _stat('${_profile?.badges.length ?? 0}', Strings.tr(context, 'badges')),
      ],
    );
  }

  Widget _stat(String value, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          children: [
            Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF5A6B7B))),
          ],
        ),
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15));
  }

  void _languageDialog(SettingsController settings) {
    showDialog(
      context: context,
      builder: (ctx) => SimpleDialog(
        title: Text(Strings.tr(context, 'language')),
        children: [
          for (final code in ['en', 'fr', 'ar'])
            SimpleDialogOption(
              onPressed: () {
                settings.setLanguage(code);
                Navigator.pop(ctx);
              },
              child: Text(_langName(code)),
            ),
        ],
      ),
    );
  }

  String _langName(String code) => switch (code) {
        'en' => 'English',
        'fr' => 'Français',
        'ar' => 'العربية',
        _ => code,
      };
}
