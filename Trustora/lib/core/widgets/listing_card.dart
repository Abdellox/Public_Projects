import 'package:flutter/material.dart';

import '../constants/app_sizes.dart';
import '../enums/verification_badge.dart';
import '../enums/price_range.dart';
import 'star_rating.dart';
import 'trust_badge.dart';

class ListingCard extends StatelessWidget {
  final String name;
  final String? category;
  final double? rating;
  final int? reviewCount;
  final VerificationBadge? verificationBadge;
  final String? imageUrl;
  final String? city;
  final PriceRange? priceRange;
  final bool isSponsored;
  final VoidCallback? onTap;

  const ListingCard({
    super.key,
    required this.name,
    this.category,
    this.rating,
    this.reviewCount,
    this.verificationBadge,
    this.imageUrl,
    this.city,
    this.priceRange,
    this.isSponsored = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildImage(theme),
            _buildContent(theme),
          ],
        ),
      ),
    );
  }

  Widget _buildImage(ThemeData theme) {
    return Stack(
      children: [
        Container(
          height: AppSizes.imageCardHeight,
          width: double.infinity,
          color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
          child: imageUrl != null
              ? Image.network(
                  imageUrl!,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => _buildImagePlaceholder(theme),
                )
              : _buildImagePlaceholder(theme),
        ),
        if (isSponsored)
          Positioned(
            top: AppSizes.paddingSm,
            left: AppSizes.paddingSm,
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSizes.paddingSm,
                vertical: AppSizes.paddingXs,
              ),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary,
                borderRadius: AppSizes.borderRadiusSm,
              ),
              child: Text(
                'Sponsored',
                style: TextStyle(
                  color: theme.colorScheme.onPrimary,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        if (verificationBadge != null && verificationBadge != VerificationBadge.notVerified)
          Positioned(
            top: AppSizes.paddingSm,
            right: AppSizes.paddingSm,
            child: TrustBadge(badge: verificationBadge!),
          ),
      ],
    );
  }

  Widget _buildImagePlaceholder(ThemeData theme) {
    return Center(
      child: Icon(
        Icons.storefront,
        size: AppSizes.iconXl,
        color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.3),
      ),
    );
  }

  Widget _buildContent(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.all(AppSizes.paddingLg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (category != null)
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSizes.paddingSm,
                vertical: AppSizes.paddingXs,
              ),
              decoration: BoxDecoration(
                color: theme.colorScheme.primaryContainer.withValues(alpha: 0.3),
                borderRadius: AppSizes.borderRadiusSm,
              ),
              child: Text(
                category!,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: theme.colorScheme.primary,
                ),
              ),
            ),
          if (category != null) const SizedBox(height: AppSizes.spacingSm),
          Text(
            name,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          if (rating != null) ...[
            const SizedBox(height: AppSizes.spacingXs),
            Row(
              children: [
                StarRating(
                  rating: rating!,
                  size: 16,
                  showNumber: true,
                ),
                if (reviewCount != null) ...[
                  const SizedBox(width: AppSizes.spacingXs),
                  Text(
                    '($reviewCount)',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ],
            ),
          ],
          const SizedBox(height: AppSizes.spacingSm),
          Row(
            children: [
              if (city != null) ...[
                Icon(
                  Icons.location_on_outlined,
                  size: 14,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: AppSizes.spacingXs),
                Expanded(
                  child: Text(
                    city!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
              if (priceRange != null && priceRange != PriceRange.free)
                Text(
                  priceRange!.symbol,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
