import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const Color trustBlue = Color(0xFF1565C0);
  static const Color trustBlueLight = Color(0xFF42A5F5);
  static const Color trustBlueDark = Color(0xFF0D47A1);
  static const Color trustGreen = Color(0xFF2E7D32);
  static const Color trustGreenLight = Color(0xFF66BB6A);
  static const Color trustGreenDark = Color(0xFF1B5E20);
  static const Color darkNavy = Color(0xFF1A237E);
  static const Color errorRed = Color(0xFFD32F2F);
  static const Color errorRedLight = Color(0xFFEF5350);
  static const Color warningOrange = Color(0xFFF57C00);
  static const Color warmGray = Color(0xFF9E9E9E);
  static const Color warmGrayLight = Color(0xFFE0E0E0);
  static const Color warmGrayDark = Color(0xFF616161);

  static const Color surfaceWhite = Color(0xFFFAFAFA);
  static const Color surfaceDark = Color(0xFF121212);
  static const Color cardWhite = Color(0xFFFFFFFF);
  static const Color cardDark = Color(0xFF1E1E1E);

  static ColorScheme get lightColorScheme => ColorScheme.fromSeed(
        seedColor: trustBlue,
        brightness: Brightness.light,
        primary: trustBlue,
        onPrimary: Colors.white,
        primaryContainer: const Color(0xFFD1E4FF),
        onPrimaryContainer: trustBlueDark,
        secondary: trustGreen,
        onSecondary: Colors.white,
        secondaryContainer: const Color(0xFFB8F0B8),
        onSecondaryContainer: trustGreenDark,
        error: errorRed,
        onError: Colors.white,
        errorContainer: const Color(0xFFFFDAD6),
        onErrorContainer: const Color(0xFF410002),
        surface: surfaceWhite,
        onSurface: const Color(0xFF1C1B1F),
        onSurfaceVariant: const Color(0xFF49454F),
        outline: const Color(0xFF79747E),
        outlineVariant: const Color(0xFFCAC4D0),
      );

  static ColorScheme get darkColorScheme => ColorScheme.fromSeed(
        seedColor: trustBlue,
        brightness: Brightness.dark,
        primary: trustBlueLight,
        onPrimary: Colors.white,
        primaryContainer: const Color(0xFF004A8D),
        onPrimaryContainer: const Color(0xFFD1E4FF),
        secondary: trustGreenLight,
        onSecondary: Colors.black,
        secondaryContainer: const Color(0xFF005314),
        onSecondaryContainer: const Color(0xFFB8F0B8),
        error: errorRedLight,
        onError: Colors.black,
        errorContainer: const Color(0xFF93000A),
        onErrorContainer: const Color(0xFFFFDAD6),
        surface: surfaceDark,
        onSurface: const Color(0xFFE6E1E5),
        onSurfaceVariant: const Color(0xFFCAC4D0),
        outline: const Color(0xFF938F99),
        outlineVariant: const Color(0xFF49454F),
      );
}
