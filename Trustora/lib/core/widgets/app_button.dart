import 'package:flutter/material.dart';

import '../constants/app_sizes.dart';

enum ButtonVariant { filled, outlined, text }

class AppButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final bool isLoading;
  final bool isFullWidth;
  final IconData? icon;
  final Color? color;
  final Color? textColor;
  final double? height;
  final EdgeInsetsGeometry? padding;

  const AppButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = ButtonVariant.filled,
    this.isLoading = false,
    this.isFullWidth = true,
    this.icon,
    this.color,
    this.textColor,
    this.height,
    this.padding,
  });

  const AppButton.outlined({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.isFullWidth = true,
    this.icon,
    this.color,
    this.textColor,
    this.height,
    this.padding,
  }) : variant = ButtonVariant.outlined;

  const AppButton.text({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.isFullWidth = true,
    this.icon,
    this.color,
    this.textColor,
    this.height,
    this.padding,
  }) : variant = ButtonVariant.text;

  @override
  Widget build(BuildContext context) {
    final effectiveHeight = height ?? AppSizes.buttonHeight;
    final effectiveColor = color ?? Theme.of(context).colorScheme.primary;
    final effectiveTextColor = textColor ??
        (variant == ButtonVariant.filled
            ? Theme.of(context).colorScheme.onPrimary
            : effectiveColor);

    final child = isLoading
        ? SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(effectiveTextColor),
            ),
          )
        : _buildContent(effectiveTextColor);

    final style = _buildStyle(effectiveHeight, effectiveColor, effectiveTextColor);

    return SizedBox(
      width: isFullWidth ? double.infinity : null,
      child: _buildButton(style, child),
    );
  }

  Widget _buildContent(Color effectiveTextColor) {
    if (icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: AppSizes.iconMd, color: effectiveTextColor),
          const SizedBox(width: AppSizes.spacingSm),
          Text(text),
        ],
      );
    }
    return Text(text);
  }

  ButtonStyle? _buildStyle(double height, Color color, Color textColor) {
    final shape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(AppSizes.radiusMd),
    );

    switch (variant) {
      case ButtonVariant.filled:
        return ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: textColor,
          minimumSize: Size(0, height),
          shape: shape,
          elevation: 0,
          padding: padding ?? const EdgeInsets.symmetric(horizontal: AppSizes.paddingLg),
        );
      case ButtonVariant.outlined:
        return OutlinedButton.styleFrom(
          foregroundColor: color,
          minimumSize: Size(0, height),
          shape: shape,
          side: BorderSide(color: color),
          padding: padding ?? const EdgeInsets.symmetric(horizontal: AppSizes.paddingLg),
        );
      case ButtonVariant.text:
        return TextButton.styleFrom(
          foregroundColor: color,
          minimumSize: Size(0, height),
          shape: shape,
          padding: padding ?? const EdgeInsets.symmetric(horizontal: AppSizes.paddingLg),
        );
    }
  }

  Widget _buildButton(ButtonStyle? style, Widget child) {
    final enabled = onPressed != null && !isLoading;

    switch (variant) {
      case ButtonVariant.filled:
        return ElevatedButton(
          onPressed: enabled ? onPressed : null,
          style: style,
          child: child,
        );
      case ButtonVariant.outlined:
        return OutlinedButton(
          onPressed: enabled ? onPressed : null,
          style: style,
          child: child,
        );
      case ButtonVariant.text:
        return TextButton(
          onPressed: enabled ? onPressed : null,
          style: style,
          child: child,
        );
    }
  }
}
