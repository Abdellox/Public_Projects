import 'package:flutter/material.dart';
import 'package:trustora/core/theme/app_colors.dart';

class ReviewCard extends StatelessWidget {
  const ReviewCard({super.key, required this.review});

  final Map<String, dynamic> review;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(theme),
            const SizedBox(height: 8),
            _buildStarRow(),
            if (review['criteria'] != null) ...[
              const SizedBox(height: 8),
              _buildCriteriaRatings(theme),
            ],
            const SizedBox(height: 8),
            Text(
              review['title'],
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              review['body'],
              style: theme.textTheme.bodyMedium?.copyWith(
                height: 1.5,
              ),
            ),
            if (review['imageUrl'] != null) ...[
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  height: 120,
                  width: double.infinity,
                  color: AppColors.trustBlue.withValues(alpha: 0.08),
                  child: Center(
                    child: Icon(
                      Icons.image_outlined,
                      color: AppColors.trustBlue.withValues(alpha: 0.3),
                    ),
                  ),
                ),
              ),
            ],
            const SizedBox(height: 12),
            _buildActions(theme),
            if (review['ownerReply'] != null) ...[
              const SizedBox(height: 12),
              _buildOwnerReply(theme),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(ThemeData theme) {
    return Row(
      children: [
        CircleAvatar(
          radius: 18,
          backgroundColor: AppColors.trustBlue.withValues(alpha: 0.1),
          child: review['avatarUrl'] != null
              ? ClipOval(
                  child: Image.network(
                    review['avatarUrl'],
                    width: 36,
                    height: 36,
                    fit: BoxFit.cover,
                  ),
                )
              : Text(
                  review['userName'][0],
                  style: const TextStyle(
                    color: AppColors.trustBlue,
                    fontWeight: FontWeight.w600,
                  ),
                ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                review['userName'],
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                review['date'],
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStarRow() {
    final rating = (review['rating'] as double).toInt();

    return Row(
      children: List.generate(5, (index) {
        return Icon(
          index < rating ? Icons.star_rounded : Icons.star_outline_rounded,
          color: Colors.amber,
          size: 20,
        );
      }),
    );
  }

  Widget _buildCriteriaRatings(ThemeData theme) {
    final criteria = Map<String, double>.from(review['criteria']);

    return ExpansionTile(
      tilePadding: EdgeInsets.zero,
      childrenPadding: EdgeInsets.zero,
      dense: true,
      title: Text(
        'Detailed Ratings',
        style: theme.textTheme.bodySmall?.copyWith(
          color: theme.colorScheme.onSurfaceVariant,
        ),
      ),
      children: criteria.entries.map((entry) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 2),
          child: Row(
            children: [
              Expanded(
                flex: 3,
                child: Text(
                  entry.key,
                  style: theme.textTheme.bodySmall,
                ),
              ),
              Expanded(
                flex: 5,
                child: LinearProgressIndicator(
                  value: entry.value / 5.0,
                  backgroundColor: theme.colorScheme.surfaceContainerHighest,
                  valueColor: const AlwaysStoppedAnimation(AppColors.trustBlue),
                  minHeight: 6,
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                flex: 1,
                child: Text(
                  '${entry.value.toStringAsFixed(1)}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  textAlign: TextAlign.end,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildActions(ThemeData theme) {
    return Row(
      children: [
        GestureDetector(
          onTap: () {},
          child: Row(
            children: [
              Icon(
                Icons.thumb_up_outlined,
                size: 16,
                color: theme.colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 4),
              Text(
                'Helpful (${review['helpful']})',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 16),
        GestureDetector(
          onTap: () {},
          child: Row(
            children: [
              Icon(
                Icons.flag_outlined,
                size: 16,
                color: theme.colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 4),
              Text(
                'Report',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildOwnerReply(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.trustGreen.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border(
          left: BorderSide(
            color: AppColors.trustGreen.withValues(alpha: 0.5),
            width: 3,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.business_center_outlined,
                size: 14,
                color: AppColors.trustGreen,
              ),
              const SizedBox(width: 4),
              Text(
                'Owner Reply',
                style: theme.textTheme.labelMedium?.copyWith(
                  color: AppColors.trustGreen,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            review['ownerReply'],
            style: theme.textTheme.bodySmall?.copyWith(
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
