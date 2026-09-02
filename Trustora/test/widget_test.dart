import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:trustora/core/theme/app_colors.dart';
import 'package:trustora/core/enums/verification_badge.dart';
import 'package:trustora/core/enums/listing_type.dart';
import 'package:trustora/core/enums/price_range.dart';
import 'package:trustora/core/utils/validators.dart';
import 'package:trustora/core/utils/formatters.dart';

void main() {
  group('AppColors', () {
    test('light color scheme has correct primary', () {
      final scheme = AppColors.lightColorScheme;
      expect(scheme.primary, AppColors.trustBlue);
    });

    test('dark color scheme has correct primary', () {
      final scheme = AppColors.darkColorScheme;
      expect(scheme.brightness, Brightness.dark);
    });
  });

  group('VerificationBadge', () {
    test('verified has correct display name', () {
      expect(VerificationBadge.verified.displayName, 'Verified');
    });

    test('communityReviewed has correct display name', () {
      expect(VerificationBadge.communityReviewed.displayName, 'Community Reviewed');
    });

    test('notVerified has correct display name', () {
      expect(VerificationBadge.notVerified.displayName, 'Not Verified');
    });

    test('fromString returns correct badge', () {
      expect(VerificationBadgeExtension.fromString('verified'), VerificationBadge.verified);
    });

    test('fromString returns notVerified for unknown', () {
      expect(VerificationBadgeExtension.fromString('unknown'), VerificationBadge.notVerified);
    });
  });

  group('ListingType', () {
    test('displayName returns correct values', () {
      expect(ListingType.business.displayName, 'Business');
      expect(ListingType.professional.displayName, 'Professional');
      expect(ListingType.organization.displayName, 'Organization');
      expect(ListingType.product.displayName, 'Product');
      expect(ListingType.service.displayName, 'Service');
      expect(ListingType.place.displayName, 'Place');
      expect(ListingType.onlineService.displayName, 'Online Service');
    });
  });

  group('PriceRange', () {
    test('symbol returns correct values', () {
      expect(PriceRange.free.symbol, 'Free');
      expect(PriceRange.budget.symbol, r'$');
      expect(PriceRange.moderate.symbol, r'$$');
      expect(PriceRange.expensive.symbol, r'$$$');
      expect(PriceRange.luxury.symbol, r'$$$$');
    });
  });

  group('Validators', () {
    test('email validator rejects empty', () {
      expect(Validators.email(null), isNotNull);
      expect(Validators.email(''), isNotNull);
    });

    test('email validator rejects invalid', () {
      expect(Validators.email('notanemail'), isNotNull);
      expect(Validators.email('test@'), isNotNull);
    });

    test('email validator accepts valid', () {
      expect(Validators.email('test@example.com'), isNull);
      expect(Validators.email('user.name@domain.co'), isNull);
    });

    test('password validator rejects empty', () {
      expect(Validators.password(null), isNotNull);
      expect(Validators.password(''), isNotNull);
    });

    test('password validator rejects short', () {
      expect(Validators.password('1234567'), isNotNull);
    });

    test('password validator accepts valid', () {
      expect(Validators.password('password123'), isNull);
    });

    test('name validator rejects empty', () {
      expect(Validators.name(null), isNotNull);
      expect(Validators.name(''), isNotNull);
    });

    test('name validator rejects single char', () {
      expect(Validators.name('A'), isNotNull);
    });

    test('name validator accepts valid', () {
      expect(Validators.name('John'), isNull);
    });

    test('phone validator rejects empty', () {
      expect(Validators.phone(null), isNotNull);
      expect(Validators.phone(''), isNotNull);
    });

    test('phone validator accepts valid', () {
      expect(Validators.phone('+1234567890'), isNull);
      expect(Validators.phone('123-456-7890'), isNull);
    });
  });

  group('Formatters', () {
    test('formatDate returns non-empty string', () {
      final result = Formatters.formatDate(DateTime(2025, 6, 15));
      expect(result, isNotEmpty);
    });

    test('formatRelativeTime returns Just now for recent', () {
      final result = Formatters.formatRelativeTime(DateTime.now());
      expect(result, 'Just now');
    });

    test('formatRelativeTime returns minutes ago', () {
      final result = Formatters.formatRelativeTime(
        DateTime.now().subtract(const Duration(minutes: 5)),
      );
      expect(result, '5 minutes ago');
    });

    test('formatRelativeTime returns hours ago', () {
      final result = Formatters.formatRelativeTime(
        DateTime.now().subtract(const Duration(hours: 3)),
      );
      expect(result, '3 hours ago');
    });

    test('formatRelativeTime returns days ago', () {
      final result = Formatters.formatRelativeTime(
        DateTime.now().subtract(const Duration(days: 2)),
      );
      expect(result, '2 days ago');
    });

    test('formatRating returns string', () {
      final result = Formatters.formatRating(4.5);
      expect(result, contains('4'));
    });

    test('truncateText truncates long text', () {
      final result = Formatters.truncateText('Hello World', 5);
      expect(result.length, lessThanOrEqualTo(8));
      expect(result, endsWith('...'));
    });

    test('truncateText does not truncate short text', () {
      final result = Formatters.truncateText('Hi', 10);
      expect(result, 'Hi');
    });

    test('formatReviewCount formats thousands', () {
      expect(Formatters.formatReviewCount(0), '0');
      expect(Formatters.formatReviewCount(1500), '1.5K');
      expect(Formatters.formatReviewCount(1500000), '1.5M');
    });
  });
}
