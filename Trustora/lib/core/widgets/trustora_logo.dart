import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class TrustoraLogo extends StatelessWidget {
  final double? size;
  final double? height;
  final Color? color;

  const TrustoraLogo({super.key, this.size = 40, this.height, this.color});

  const TrustoraLogo.small({super.key})
      : size = 24,
        height = null,
        color = null;

  const TrustoraLogo.large({super.key})
      : size = 64,
        height = null,
        color = null;

  @override
  Widget build(BuildContext context) {
    final effectiveSize = height ?? size ?? 40;
    final logoColor = color ?? AppColors.trustBlue;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          Icons.shield_rounded,
          size: effectiveSize,
          color: logoColor,
        ),
        if (effectiveSize >= 32) ...[
          SizedBox(width: effectiveSize * 0.2),
          Text(
            'Trustora',
            style: TextStyle(
              fontSize: effectiveSize * 0.55,
              fontWeight: FontWeight.w700,
              color: logoColor,
              letterSpacing: -0.5,
            ),
          ),
        ],
      ],
    );
  }
}
