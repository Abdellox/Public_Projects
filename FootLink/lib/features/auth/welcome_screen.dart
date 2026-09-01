import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../l10n/strings.dart';
import 'login_screen.dart';
import 'register_screen.dart';

/// The first screen a new user sees, with the two main actions.
class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: Column(
            children: [
              const Spacer(flex: 2),
              Container(
                width: 84,
                height: 84,
                decoration: BoxDecoration(
                  color: AppColors.accent,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: const Icon(Icons.sports_soccer, color: Colors.white, size: 50),
              ),
              const SizedBox(height: 24),
              Text(
                Strings.tr(context, 'appName'),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 38,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                Strings.tr(context, 'welcomeSubtitle'),
                textAlign: TextAlign.center,
                style: const TextStyle(color: Color(0xFF9FB0C0), fontSize: 16),
              ),
              const Spacer(flex: 3),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => _push(context, const RegisterScreen()),
                  child: Text(Strings.tr(context, 'register')),
                ),
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Colors.white38),
                    backgroundColor: Colors.transparent,
                  ),
                  onPressed: () => _push(context, const LoginScreen()),
                  child: Text(Strings.tr(context, 'login')),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  void _push(BuildContext context, Widget screen) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
  }
}
