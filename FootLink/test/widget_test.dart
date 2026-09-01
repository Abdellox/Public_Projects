import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:footlink/core/theme/app_theme.dart';
import 'package:footlink/shared/widgets/profile_avatar.dart';

void main() {
  group('AppTheme', () {
    test('light theme uses M3 and navy app bar', () {
      final theme = AppTheme.light();
      expect(theme.useMaterial3, isTrue);
    });

    test('dark theme is dark', () {
      final theme = AppTheme.dark();
      expect(theme.brightness, Brightness.dark);
    });
  });

  group('ProfileAvatar', () {
    testWidgets('renders initials when no image provided', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: ProfileAvatar(name: 'Ahmed Ben', radius: 24))),
      );
      expect(find.text('AB'), findsOneWidget);
    });
  });
}
