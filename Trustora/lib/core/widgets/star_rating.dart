import 'package:flutter/material.dart';

import '../constants/app_sizes.dart';

class StarRating extends StatelessWidget {
  final double rating;
  final int maxRating;
  final double size;
  final Color? color;
  final Color? inactiveColor;
  final bool showNumber;
  final bool interactive;
  final ValueChanged<double>? onRatingChanged;

  const StarRating({
    super.key,
    required this.rating,
    this.maxRating = 5,
    this.size = AppSizes.iconMd,
    this.color,
    this.inactiveColor,
    this.showNumber = false,
    this.interactive = false,
    this.onRatingChanged,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final starColor = color ?? Colors.amber;
    final inactiveStarColor = inactiveColor ?? theme.colorScheme.outlineVariant;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...List.generate(maxRating, (index) {
          final starValue = index + 1;
          return GestureDetector(
            onTap: interactive ? () => onRatingChanged?.call(starValue.toDouble()) : null,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 1),
              child: Icon(
                _getStarIcon(starValue),
                size: size,
                color: _getStarColor(starValue, starColor, inactiveStarColor),
              ),
            ),
          );
        }),
        if (showNumber) ...[
          SizedBox(width: size * 0.3),
          Text(
            rating.toStringAsFixed(1),
            style: TextStyle(
              fontSize: size * 0.7,
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.onSurface,
            ),
          ),
        ],
      ],
    );
  }

  IconData _getStarIcon(int starValue) {
    if (rating >= starValue) {
      return Icons.star;
    } else if (rating >= starValue - 0.5) {
      return Icons.star_half;
    }
    return Icons.star_border;
  }

  Color _getStarColor(int starValue, Color activeColor, Color inactiveColor) {
    if (rating >= starValue) {
      return activeColor;
    } else if (rating >= starValue - 0.5) {
      return activeColor;
    }
    return inactiveColor;
  }
}
