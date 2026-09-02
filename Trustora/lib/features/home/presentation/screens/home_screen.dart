import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trustora/core/theme/app_colors.dart';
import 'package:trustora/core/widgets/trustora_logo.dart';

class CategoryItem {
  final IconData icon;
  final String label;
  final Color color;

  const CategoryItem(this.icon, this.label, this.color);
}

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  static const _categories = [
    CategoryItem(Icons.storefront_rounded, 'Shops', Color(0xFFE91E63)),
    CategoryItem(Icons.restaurant_rounded, 'Restaurants', Color(0xFFFF9800)),
    CategoryItem(Icons.local_hospital_rounded, 'Health', Color(0xFFF44336)),
    CategoryItem(Icons.build_rounded, 'Services', Color(0xFF9C27B0)),
    CategoryItem(Icons.school_rounded, 'Education', Color(0xFF2196F3)),
    CategoryItem(Icons.engineering_rounded, 'Trades', Color(0xFF607D8B)),
    CategoryItem(Icons.pets_rounded, 'Pets', Color(0xFF795548)),
    CategoryItem(Icons.hotel_rounded, 'Hotels', Color(0xFF009688)),
    CategoryItem(Icons.fitness_center_rounded, 'Fitness', Color(0xFF4CAF50)),
    CategoryItem(Icons.local_grocery_store_rounded, 'Grocery', Color(0xFF8BC34A)),
    CategoryItem(Icons.medical_services_rounded, 'Medical', Color(0xFF00BCD4)),
    CategoryItem(Icons.carpenter_rounded, 'Artisans', Color(0xFF3F51B5)),
  ];

  static final _mockListings = [
    {
      'id': '1',
      'name': 'Golden Spoon Restaurant',
      'category': 'Restaurants',
      'rating': 4.8,
      'reviews': 234,
      'location': 'Downtown',
      'verified': true,
      'image': null,
      'badge': 'Top Rated',
    },
    {
      'id': '2',
      'name': 'TrustFix Plumbing',
      'category': 'Services',
      'rating': 4.6,
      'reviews': 89,
      'location': 'Westside',
      'verified': true,
      'image': null,
      'badge': 'Verified',
    },
    {
      'id': '3',
      'name': 'Bright Smile Dental',
      'category': 'Health',
      'rating': 4.9,
      'reviews': 156,
      'location': 'Central',
      'verified': true,
      'image': null,
      'badge': 'Premium',
    },
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {},
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(child: _buildHeader(context)),
              SliverToBoxAdapter(child: _buildSearchBar(context)),
              SliverToBoxAdapter(child: _buildCategories(context)),
              SliverToBoxAdapter(
                child: _buildSection(
                  context,
                  'Highly Rated Nearby',
                  _mockListings,
                ),
              ),
              SliverToBoxAdapter(
                child: _buildSection(
                  context,
                  'Verified & Trusted',
                  _mockListings.reversed.toList(),
                ),
              ),
              SliverToBoxAdapter(
                child: _buildSection(
                  context,
                  'Recently Added',
                  _mockListings,
                ),
              ),
              SliverToBoxAdapter(
                child: _buildSection(
                  context,
                  'Popular Services',
                  _mockListings.reversed.toList(),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 80)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Row(
        children: [
          const TrustoraLogo(height: 32),
          const SizedBox(width: 8),
          Text(
            'Trustora',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.trustBlue,
            ),
          ),
          const Spacer(),
          _buildCitySelector(context),
          const SizedBox(width: 8),
          IconButton(
            onPressed: () {},
            icon: Badge(
              isLabelVisible: true,
              label: const Text('3', style: TextStyle(fontSize: 10)),
              child: Icon(
                Icons.notifications_outlined,
                color: theme.colorScheme.onSurface,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCitySelector(BuildContext context) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: () {},
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: theme.colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.location_on_outlined,
              size: 16,
              color: AppColors.trustBlue,
            ),
            const SizedBox(width: 4),
            Text(
              'Any City',
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(width: 2),
            Icon(Icons.expand_more, size: 16, color: theme.colorScheme.onSurfaceVariant),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: GestureDetector(
        onTap: () => context.push('/search'),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: theme.colorScheme.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              Icon(Icons.search, color: theme.colorScheme.onSurfaceVariant),
              const SizedBox(width: 12),
              Text(
                'Search people, places, services...',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategories(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
          child: Text(
            'Categories',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        SizedBox(
          height: 100,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            scrollDirection: Axis.horizontal,
            itemCount: _categories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final cat = _categories[index];
              return GestureDetector(
                onTap: () => context.push('/search?category=${cat.label}'),
                child: SizedBox(
                  width: 72,
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: cat.color.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Icon(cat.icon, color: cat.color, size: 26),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        cat.label,
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.labelSmall,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSection(
    BuildContext context,
    String title,
    List<Map<String, dynamic>> listings,
  ) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton(
                onPressed: () => context.push('/search'),
                child: const Text('See All'),
              ),
            ],
          ),
        ),
        SizedBox(
          height: 210,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            scrollDirection: Axis.horizontal,
            itemCount: listings.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final listing = listings[index];
              return _ListingCard(listing: listing);
            },
          ),
        ),
      ],
    );
  }
}

class _ListingCard extends StatelessWidget {
  const _ListingCard({required this.listing});

  final Map<String, dynamic> listing;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: () => context.push('/listing/${listing['id']}'),
      child: Container(
        width: 220,
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 100,
              decoration: BoxDecoration(
                color: AppColors.trustBlue.withValues(alpha: 0.1),
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(16),
                ),
              ),
              child: Stack(
                children: [
                  Center(
                    child: Icon(
                      Icons.storefront_rounded,
                      size: 40,
                      color: AppColors.trustBlue.withValues(alpha: 0.4),
                    ),
                  ),
                  if (listing['verified'] == true)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.trustGreen,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'Verified',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    listing['name'],
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    listing['category'],
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.star_rounded, color: Colors.amber, size: 16),
                      const SizedBox(width: 2),
                      Text(
                        '${listing['rating']}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '(${listing['reviews']})',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        Icons.location_on_outlined,
                        size: 14,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 2),
                      Expanded(
                        child: Text(
                          listing['location'],
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
