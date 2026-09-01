import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'core/services/settings_controller.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/splash_screen.dart';
import 'l10n/strings.dart';

/// Root widget of FootLink.
class FootLinkApp extends StatelessWidget {
  const FootLinkApp({super.key});

  @override
  Widget build(BuildContext context) {
    final settings = SettingsController.instance;
    return ListenableBuilder(
      listenable: settings,
      builder: (context, _) {
        return MaterialApp(
          title: 'FootLink',
          debugShowCheckedModeBanner: false,
          locale: settings.locale,
          supportedLocales: Strings.supportedLocales,
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          theme: AppTheme.light(),
          darkTheme: AppTheme.dark(),
          themeMode: settings.themeMode,
          home: const SplashScreen(),
        );
      },
    );
  }
}
