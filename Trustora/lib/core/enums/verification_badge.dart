import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

enum VerificationBadge {
  verified,
  communityReviewed,
  notVerified,
}

extension VerificationBadgeExtension on VerificationBadge {
  String get displayName {
    switch (this) {
      case VerificationBadge.verified:
        return 'Verified';
      case VerificationBadge.communityReviewed:
        return 'Community Reviewed';
      case VerificationBadge.notVerified:
        return 'Not Verified';
    }
  }

  Color get color {
    switch (this) {
      case VerificationBadge.verified:
        return AppColors.trustGreen;
      case VerificationBadge.communityReviewed:
        return AppColors.trustBlue;
      case VerificationBadge.notVerified:
        return AppColors.warmGray;
    }
  }

  String get iconName {
    switch (this) {
      case VerificationBadge.verified:
        return 'verified';
      case VerificationBadge.communityReviewed:
        return 'groups';
      case VerificationBadge.notVerified:
        return 'help_outline';
    }
  }

  static VerificationBadge fromString(String value) {
    return VerificationBadge.values.firstWhere(
      (badge) => badge.name == value,
      orElse: () => VerificationBadge.notVerified,
    );
  }
}
