import 'package:flutter_test/flutter_test.dart';
import 'package:footlink/core/utils/validators.dart';

void main() {
  group('Validators.email', () {
    test('accepts a valid email', () {
      expect(Validators.email('player@example.com'), isNull);
    });

    test('rejects empty email', () {
      expect(Validators.email(''), isNotNull);
      expect(Validators.email(null), isNotNull);
    });

    test('rejects malformed email', () {
      expect(Validators.email('not-an-email'), isNotNull);
      expect(Validators.email('a@b'), isNotNull);
    });
  });

  group('Validators.password', () {
    test('requires at least 8 characters', () {
      expect(Validators.password('short'), isNotNull);
      expect(Validators.password('password123'), isNull);
    });

    test('rejects empty password', () {
      expect(Validators.password(''), isNotNull);
      expect(Validators.password(null), isNotNull);
    });
  });
}
