import 'package:flutter/material.dart';

import '../constants/app_sizes.dart';
import '../enums/verification_badge.dart';

class TrustBadge extends StatelessWidget {
  final VerificationBadge badge;
  final double? iconSize;
  final double? fontSize;

  const TrustBadge({
    super.key,
    required this.badge,
    this.iconSize,
    this.fontSize,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSizes.paddingSm,
        vertical: AppSizes.paddingXs,
      ),
      decoration: BoxDecoration(
        color: badge.color.withValues(alpha: 0.15),
        borderRadius: AppSizes.borderRadiusSm,
        border: Border.all(
          color: badge.color.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _getIconData(),
            size: iconSize ?? 14,
            color: badge.color,
          ),
          if (badge != VerificationBadge.notVerified) ...[
            const SizedBox(width: 4),
            Text(
              badge.displayName,
              style: TextStyle(
                fontSize: fontSize ?? 11,
                fontWeight: FontWeight.w600,
                color: badge.color,
              ),
            ),
          ],
        ],
      ),
    );
  }

  IconData _getIconData() {
    switch (badge) {
      case VerificationBadge.verified:
        return Icons.verified;
      case VerificationBadge.communityReviewed:
        return Icons.groups;
      case VerificationBadge.notVerified:
        return Icons.help_outline;
    }
  }
}
