import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trustora/core/theme/app_colors.dart';
import 'package:trustora/features/auth/presentation/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              const SizedBox(height: 20),
              _buildProfileHeader(theme, user),
              const SizedBox(height: 20),
              _buildStatsRow(theme),
              const SizedBox(height: 20),
              _buildMenuSection(context, ref, theme),
              const SizedBox(height: 20),
              Text(
                'Version 1.0.0',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileHeader(ThemeData theme, dynamic user) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          CircleAvatar(
            radius: 45,
            backgroundColor: AppColors.trustBlue.withValues(alpha: 0.1),
            child: Text(
              (user?.email?[0] ?? 'U').toUpperCase(),
              style: const TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.bold,
                color: AppColors.trustBlue,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            user?.userMetadata?['full_name'] ?? 'User',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            user?.email ?? '',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Member since ${DateTime.now().year}',
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsRow(ThemeData theme) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _StatItem(count: '12', label: 'Reviews', theme: theme),
          Container(width: 1, height: 30, color: theme.colorScheme.outlineVariant),
          _StatItem(count: '5', label: 'Favorites', theme: theme),
          Container(width: 1, height: 30, color: theme.colorScheme.outlineVariant),
          _StatItem(count: '3', label: 'Following', theme: theme),
        ],
      ),
    );
  }

  Widget _buildMenuSection(
    BuildContext context,
    WidgetRef ref,
    ThemeData theme,
  ) {
    final items = <_MenuItem>[
      _MenuItem(Icons.person_outline, 'Edit Profile', () {}),
      _MenuItem(Icons.rate_review_outlined, 'My Reviews', () {}),
      _MenuItem(Icons.favorite_outline, 'Saved Listings', () {}),
      const _MenuItem.divider(),
      _MenuItem(Icons.language, 'Language', () {}),
      _MenuItem(Icons.dark_mode_outlined, 'Dark Mode', null, isToggle: true),
      _MenuItem(Icons.notifications_outlined, 'Notifications', null,
          isToggle: true),
      const _MenuItem.divider(),
      _MenuItem(Icons.help_outline, 'Help & Support', () {}),
      _MenuItem(Icons.privacy_tip_outlined, 'Privacy Policy', () {}),
      _MenuItem(Icons.description_outlined, 'Terms of Service', () {}),
      _MenuItem(Icons.info_outline, 'About', () {}),
      const _MenuItem.divider(),
      _MenuItem(Icons.logout, 'Logout', () async {
        await ref.read(authRepositoryProvider).signOut();
        if (context.mounted) context.go('/welcome');
      }, isDestructive: true),
    ];

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: items.map((item) {
          if (item.isDivider) {
            return Divider(
              height: 1,
              indent: 20,
              endIndent: 20,
              color: theme.colorScheme.outlineVariant.withValues(alpha: 0.5),
            );
          }
          return _buildMenuItem(context, theme, item);
        }).toList(),
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context,
    ThemeData theme,
    _MenuItem item,
  ) {
    if (item.isToggle) {
      return ListTile(
        leading: Icon(item.icon, color: theme.colorScheme.onSurfaceVariant),
        title: Text(item.title),
        trailing: Switch(
          value: false,
          onChanged: (v) {},
          activeColor: AppColors.trustBlue,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      );
    }

    return ListTile(
      leading: Icon(
        item.icon,
        color: item.isDestructive
            ? AppColors.errorRed
            : theme.colorScheme.onSurfaceVariant,
      ),
      title: Text(
        item.title,
        style: TextStyle(
          color: item.isDestructive ? AppColors.errorRed : null,
        ),
      ),
      trailing: Icon(
        Icons.chevron_right,
        color: theme.colorScheme.onSurfaceVariant,
        size: 20,
      ),
      onTap: item.onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    );
  }
}

class _StatItem extends StatelessWidget {
  const _StatItem({
    required this.count,
    required this.label,
    required this.theme,
  });

  final String count;
  final String label;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          count,
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.trustBlue,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

class _MenuItem {
  final IconData icon;
  final String title;
  final VoidCallback? onTap;
  final bool isDestructive;
  final bool isToggle;
  final bool isDivider;

  const _MenuItem(this.icon, this.title, this.onTap,
      {this.isDestructive = false, this.isToggle = false})
      : isDivider = false;

  const _MenuItem.divider()
      : icon = Icons.add,
        title = '',
        onTap = null,
        isDestructive = false,
        isToggle = false,
        isDivider = true;
}
