import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:trustora/core/theme/app_colors.dart';
import 'package:trustora/core/widgets/trustora_logo.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            children: [
              const Spacer(flex: 2),
              const TrustoraLogo(height: 80),
              const SizedBox(height: 24),
              Text(
                'Trustora',
                style: theme.textTheme.headlineLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.trustBlue,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Find people, places, products, and services you can trust.',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 48),
              _buildIconGrid(context),
              const Spacer(flex: 2),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: FilledButton(
                  onPressed: () => context.go('/register'),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.trustBlue,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text(
                    'Get Started',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => context.go('/login'),
                child: Text.rich(
                  TextSpan(
                    text: 'I already have an account. ',
                    style: TextStyle(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                    children: const [
                      TextSpan(
                        text: 'Log in',
                        style: TextStyle(
                          color: AppColors.trustBlue,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIconGrid(BuildContext context) {
    final items = [
      (Icons.storefront_rounded, 'Shops'),
      (Icons.restaurant_rounded, 'Food'),
      (Icons.local_hospital_rounded, 'Health'),
      (Icons.build_rounded, 'Services'),
      (Icons.school_rounded, 'Education'),
      (Icons.engineering_rounded, 'Trades'),
      (Icons.pets_rounded, 'Pets'),
      (Icons.more_horiz_rounded, 'More'),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.trustBlue.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(item.$1, color: AppColors.trustBlue, size: 24),
            ),
            const SizedBox(height: 4),
            Text(
              item.$2,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
          ],
        );
      },
    );
  }
}
