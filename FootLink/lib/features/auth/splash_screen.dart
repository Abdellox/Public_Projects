import 'package:flutter/material.dart';

import '../../core/services/auth_service.dart';
import '../../core/theme/app_colors.dart';
import '../../l10n/strings.dart';
import '../home/main_shell.dart';
import 'welcome_screen.dart';

/// Shows the brand splash, restores session state, then routes the user.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    // Small delay so the splash is visible and the brand is shown.
    await Future.delayed(const Duration(milliseconds: 1400));
    if (!mounted) return;
    final loggedIn = AuthService.instance.isSignedIn;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => loggedIn ? const MainShell() : const WelcomeScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 96,
              height: 96,
              decoration: BoxDecoration(
                color: AppColors.accent,
                borderRadius: BorderRadius.circular(28),
              ),
              child: const Icon(Icons.sports_soccer, color: Colors.white, size: 56),
            ),
            const SizedBox(height: 20),
            Text(
              Strings.tr(context, 'appName'),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 34,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              Strings.tr(context, 'tagline'),
              textAlign: TextAlign.center,
              style: const TextStyle(color: Color(0xFF9FB0C0), fontSize: 15),
            ),
          ],
        ),
      ),
    );
  }
}
