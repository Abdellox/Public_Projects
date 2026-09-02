import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trustora/core/theme/app_colors.dart';
import 'package:trustora/core/enums/user_role.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ChooseUserTypeScreen extends ConsumerStatefulWidget {
  const ChooseUserTypeScreen({super.key});

  @override
  ConsumerState<ChooseUserTypeScreen> createState() =>
      _ChooseUserTypeScreenState();
}

class _ChooseUserTypeScreenState extends ConsumerState<ChooseUserTypeScreen> {
  UserRole? _selectedRole;

  Future<void> _handleContinue() async {
    if (_selectedRole == null) return;

    try {
      await Supabase.instance.client.from('profiles').upsert({
        'id': Supabase.instance.client.auth.currentUser!.id,
        'role': _selectedRole!.name,
      });

      if (mounted) {
        context.go('/home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save user type: $e'),
            backgroundColor: AppColors.errorRed,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('Choose Your Account Type'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'How will you use Trustora?',
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'This helps us personalize your experience.',
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 32),
              _UserTypeCard(
                icon: Icons.person_outline_rounded,
                title: 'Individual User',
                description:
                    'Discover and review local businesses, services, and products. Save your favorites and share recommendations.',
                isSelected: _selectedRole == UserRole.individual,
                onTap: () =>
                    setState(() => _selectedRole = UserRole.individual),
              ),
              const SizedBox(height: 16),
              _UserTypeCard(
                icon: Icons.business_center_outlined,
                title: 'Business Owner',
                description:
                    'Claim and manage your business listing, respond to reviews, and connect with customers.',
                isSelected: _selectedRole == UserRole.business,
                onTap: () => setState(() => _selectedRole = UserRole.business),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: FilledButton(
                  onPressed: _selectedRole != null ? _handleContinue : null,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.trustBlue,
                    disabledBackgroundColor:
                        AppColors.trustBlue.withValues(alpha: 0.4),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Continue',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}

class _UserTypeCard extends StatelessWidget {
  const _UserTypeCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.isSelected,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String description;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.trustBlue.withValues(alpha: 0.08)
              : theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.trustBlue : theme.colorScheme.outline,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.trustBlue.withValues(alpha: 0.15)
                    : theme.colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: isSelected ? AppColors.trustBlue : theme.colorScheme.onSurfaceVariant,
                size: 28,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: isSelected ? AppColors.trustBlue : null,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check_circle,
                color: AppColors.trustBlue,
                size: 24,
              ),
          ],
        ),
      ),
    );
  }
}
