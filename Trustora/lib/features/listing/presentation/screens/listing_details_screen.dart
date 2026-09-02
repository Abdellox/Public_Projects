import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trustora/core/theme/app_colors.dart';
import 'package:trustora/features/listing/presentation/widgets/review_card.dart';

class ListingDetailsScreen extends ConsumerStatefulWidget {
  const ListingDetailsScreen({super.key, required this.listingId});

  final String listingId;

  @override
  ConsumerState<ListingDetailsScreen> createState() =>
      _ListingDetailsScreenState();
}

class _ListingDetailsScreenState extends ConsumerState<ListingDetailsScreen> {
  bool _isFavorited = false;
  final _scrollController = ScrollController();

  static final _mockListing = {
    'id': '1',
    'name': 'Golden Spoon Restaurant',
    'category': 'Restaurants',
    'rating': 4.8,
    'reviewCount': 234,
    'location': '123 Main St, Downtown',
    'phone': '+1 234 567 8900',
    'email': 'info@goldenspoon.com',
    'website': 'www.goldenspoon.com',
    'verified': true,
    'description':
        'Award-winning family restaurant serving authentic Mediterranean cuisine since 2005. Fresh ingredients, warm atmosphere.',
    'openingHours': {
      'Mon-Fri': '11:00 AM - 10:00 PM',
      'Saturday': '10:00 AM - 11:00 PM',
      'Sunday': '10:00 AM - 9:00 PM',
    },
    'services': [
      'Dine-In',
      'Takeaway',
      'Delivery',
      'Private Events',
      'Catering',
    ],
    'products': [
      {'name': 'Chef\'s Special Menu', 'price': '\$45'},
      {'name': 'Family Bundle', 'price': '\$89'},
      {'name': 'Lunch Combo', 'price': '\$18'},
    ],
  };

  static final _mockReviews = [
    {
      'id': '1',
      'userName': 'Sarah M.',
      'avatarUrl': null,
      'date': '2 days ago',
      'rating': 5.0,
      'title': 'Absolutely amazing!',
      'body':
          'The food was incredible and the service was top-notch. The lamb dish was perfectly cooked. Will definitely come back!',
      'helpful': 12,
      'ownerReply': 'Thank you so much, Sarah! We\'re thrilled you enjoyed your visit.',
    },
    {
      'id': '2',
      'userName': 'John D.',
      'avatarUrl': null,
      'date': '1 week ago',
      'rating': 4.0,
      'title': 'Great food, slightly slow service',
      'body':
          'The food quality is excellent but we waited about 20 minutes for our main course. The ambiance makes up for it though.',
      'helpful': 8,
      'ownerReply': null,
    },
    {
      'id': '3',
      'userName': 'Anonymous',
      'avatarUrl': null,
      'date': '2 weeks ago',
      'rating': 5.0,
      'title': 'Best restaurant in town',
      'body':
          'From start to finish, everything was perfect. The pasta was fresh and the desserts were heavenly.',
      'helpful': 15,
      'ownerReply': null,
    },
  ];

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final listing = _mockListing;

    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          _buildAppBar(theme),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(theme, listing),
                  const SizedBox(height: 20),
                  _buildActionButtons(theme),
                  const SizedBox(height: 24),
                  _buildInfoSection(theme, listing),
                  const SizedBox(height: 24),
                  _buildOpeningHours(theme, listing),
                  const SizedBox(height: 24),
                  _buildServicesSection(theme, listing),
                  const SizedBox(height: 24),
                  _buildProductsSection(theme, listing),
                  const SizedBox(height: 24),
                  _buildPhotoGallery(theme),
                  const SizedBox(height: 24),
                  _buildMapPreview(theme),
                  const SizedBox(height: 24),
                  _buildReviewsSection(theme),
                  const SizedBox(height: 24),
                  _buildReportButton(theme),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        backgroundColor: AppColors.trustBlue,
        icon: const Icon(Icons.edit, color: Colors.white),
        label: const Text(
          'Write Review',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }

  Widget _buildAppBar(ThemeData theme) {
    return SliverAppBar(
      expandedHeight: 250,
      pinned: true,
      stretch: true,
      backgroundColor: AppColors.trustBlue,
      leading: GestureDetector(
        onTap: () => context.pop(),
        child: Container(
          margin: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.3),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.arrow_back, color: Colors.white),
        ),
      ),
      actions: [
        GestureDetector(
          onTap: () {},
          child: Container(
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.3),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.share, color: Colors.white),
          ),
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                AppColors.trustBlue.withValues(alpha: 0.8),
                AppColors.darkNavy.withValues(alpha: 0.9),
              ],
            ),
          ),
          child: Stack(
            children: [
              Center(
                child: Icon(
                  Icons.storefront_rounded,
                  size: 80,
                  color: Colors.white.withValues(alpha: 0.2),
                ),
              ),
              Positioned(
                bottom: 16,
                left: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.trustGreen,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'Verified',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(ThemeData theme, Map<String, dynamic> listing) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.trustBlue.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                listing['category'],
                style: const TextStyle(
                  color: AppColors.trustBlue,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          listing['name'],
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            const Icon(Icons.star_rounded, color: Colors.amber, size: 22),
            const SizedBox(width: 4),
            Text(
              '${listing['rating']}',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(width: 4),
            Text(
              '(${listing['reviewCount']} reviews)',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Icon(
              Icons.location_on_outlined,
              size: 16,
              color: theme.colorScheme.onSurfaceVariant,
            ),
            const SizedBox(width: 4),
            Expanded(
              child: Text(
                listing['location'],
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Text(
          listing['description'],
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
            height: 1.5,
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(ThemeData theme) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () => setState(() => _isFavorited = !_isFavorited),
            icon: Icon(
              _isFavorited ? Icons.favorite : Icons.favorite_border,
              color: _isFavorited ? AppColors.errorRed : null,
            ),
            label: Text(_isFavorited ? 'Saved' : 'Save'),
            style: OutlinedButton.styleFrom(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.flag_outlined),
            label: const Text('Report'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.errorRed,
              side: const BorderSide(color: AppColors.errorRed),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoSection(ThemeData theme, Map<String, dynamic> listing) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _InfoRow(
              icon: Icons.phone_outlined,
              label: listing['phone'],
              onTap: () {},
            ),
            const Divider(height: 24),
            _InfoRow(
              icon: Icons.email_outlined,
              label: listing['email'],
              onTap: () {},
            ),
            const Divider(height: 24),
            _InfoRow(
              icon: Icons.language_outlined,
              label: listing['website'],
              onTap: () {},
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOpeningHours(ThemeData theme, Map<String, dynamic> listing) {
    final hours = listing['openingHours'] as Map<String, String>;

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Opening Hours',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ...hours.entries.map(
              (entry) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      entry.key,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Text(
                      entry.value,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: AppColors.trustGreen,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServicesSection(ThemeData theme, Map<String, dynamic> listing) {
    final services = List<String>.from(listing['services']);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Services',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: services
              .map(
                (s) => Chip(
                  label: Text(s),
                  backgroundColor: AppColors.trustBlue.withValues(alpha: 0.08),
                  labelStyle: const TextStyle(
                    color: AppColors.trustBlue,
                    fontSize: 13,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
              )
              .toList(),
        ),
      ],
    );
  }

  Widget _buildProductsSection(ThemeData theme, Map<String, dynamic> listing) {
    final products = List<Map<String, dynamic>>.from(listing['products']);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Popular Products',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 100,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: products.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final product = products[index];
              return Container(
                width: 160,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceContainerHighest
                      .withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      product['name'],
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      product['price'],
                      style: theme.textTheme.titleSmall?.copyWith(
                        color: AppColors.trustBlue,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildPhotoGallery(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Photos',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 120,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: 5,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              return Container(
                width: 160,
                decoration: BoxDecoration(
                  color: AppColors.trustBlue.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Icon(
                    Icons.photo_outlined,
                    color: AppColors.trustBlue.withValues(alpha: 0.3),
                    size: 36,
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildMapPreview(ThemeData theme) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        height: 150,
        decoration: BoxDecoration(
          color: theme.colorScheme.surfaceContainerHighest
              .withValues(alpha: 0.3),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Stack(
          children: [
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.map_outlined,
                    size: 36,
                    color: theme.colorScheme.onSurfaceVariant
                        .withValues(alpha: 0.3),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Map preview',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            Positioned(
              bottom: 8,
              right: 8,
              child: FilledButton(
                onPressed: () {},
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.trustBlue,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  minimumSize: const Size(0, 0),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Text('Open Map'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewsSection(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Reviews (${_mockReviews.length})',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: () {},
              child: const Text('See All'),
            ),
          ],
        ),
        ..._mockReviews.map(
          (review) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: ReviewCard(review: review),
          ),
        ),
      ],
    );
  }

  Widget _buildReportButton(ThemeData theme) {
    return Center(
      child: TextButton.icon(
        onPressed: () {},
        icon: const Icon(Icons.flag_outlined, size: 16),
        label: const Text('Report this listing'),
        style: TextButton.styleFrom(
          foregroundColor: theme.colorScheme.onSurfaceVariant,
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.trustBlue),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.trustBlue,
                    decoration: TextDecoration.underline,
                    decorationColor: AppColors.trustBlue,
                  ),
            ),
          ),
          Icon(
            Icons.open_in_new,
            size: 16,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ],
      ),
    );
  }
}
