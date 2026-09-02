import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trustora/core/theme/app_colors.dart';

class ExploreScreen extends ConsumerStatefulWidget {
  const ExploreScreen({super.key});

  @override
  ConsumerState<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends ConsumerState<ExploreScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();
  Timer? _debounce;
  bool _isMapView = false;
  String? _selectedCategory;
  String? _selectedSort;
  double? _minRating;
  bool _verifiedOnly = false;

  static final _mockResults = [
    {
      'id': '1',
      'name': 'Golden Spoon Restaurant',
      'category': 'Restaurants',
      'rating': 4.8,
      'reviews': 234,
      'location': 'Downtown, 0.3 km',
      'verified': true,
    },
    {
      'id': '2',
      'name': 'TrustFix Plumbing',
      'category': 'Services',
      'rating': 4.6,
      'reviews': 89,
      'location': 'Westside, 1.2 km',
      'verified': true,
    },
    {
      'id': '3',
      'name': 'Bright Smile Dental',
      'category': 'Health',
      'rating': 4.9,
      'reviews': 156,
      'location': 'Central, 0.8 km',
      'verified': true,
    },
    {
      'id': '4',
      'name': 'QuickFix Auto Repair',
      'category': 'Services',
      'rating': 4.3,
      'reviews': 67,
      'location': 'Eastside, 2.1 km',
      'verified': false,
    },
    {
      'id': '5',
      'name': 'Paws & Claws Vet',
      'category': 'Pets',
      'rating': 4.7,
      'reviews': 112,
      'location': 'Northend, 1.5 km',
      'verified': true,
    },
  ];

  final _filterCategories = [
    'All',
    'Restaurants',
    'Services',
    'Health',
    'Education',
    'Pets',
    'Shops',
  ];

  List<Map<String, dynamic>> get _filteredResults {
    var results = List<Map<String, dynamic>>.from(_mockResults);
    if (_selectedCategory != null && _selectedCategory != 'All') {
      results = results
          .where((r) => r['category'] == _selectedCategory)
          .toList();
    }
    if (_verifiedOnly) {
      results = results.where((r) => r['verified'] == true).toList();
    }
    if (_minRating != null) {
      results = results
          .where((r) => (r['rating'] as double) >= _minRating!)
          .toList();
    }
    return results;
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      setState(() {});
    });
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => _FilterSheet(
        selectedCategory: _selectedCategory,
        selectedSort: _selectedSort,
        minRating: _minRating,
        verifiedOnly: _verifiedOnly,
        onApply: (category, sort, rating, verified) {
          setState(() {
            _selectedCategory = category;
            _selectedSort = sort;
            _minRating = rating;
            _verifiedOnly = verified;
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final activeFilters = <String>[
      if (_selectedCategory != null && _selectedCategory != 'All')
        _selectedCategory!,
      if (_verifiedOnly) 'Verified Only',
      if (_minRating != null) '${_minRating!.toInt()}+ Stars',
      if (_selectedSort != null) _selectedSort!,
    ];

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: TextField(
                controller: _searchController,
                onChanged: _onSearchChanged,
                decoration: InputDecoration(
                  hintText: 'Search listings...',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (_searchController.text.isNotEmpty)
                        IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            _searchController.clear();
                            setState(() {});
                          },
                        ),
                      IconButton(
                        icon: Icon(
                          _isMapView
                              ? Icons.view_list_rounded
                              : Icons.map_outlined,
                        ),
                        onPressed: () =>
                            setState(() => _isMapView = !_isMapView),
                      ),
                    ],
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                  fillColor: theme.colorScheme.surfaceContainerHighest,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                ),
              ),
            ),
            if (activeFilters.isNotEmpty)
              SizedBox(
                height: 48,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  scrollDirection: Axis.horizontal,
                  itemCount: activeFilters.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    return Chip(
                      label: Text(activeFilters[index]),
                      deleteIcon: const Icon(Icons.close, size: 16),
                      onDeleted: () {
                        setState(() {
                          if (activeFilters[index] == 'Verified Only') {
                            _verifiedOnly = false;
                          } else if (activeFilters[index].contains('Stars')) {
                            _minRating = null;
                          } else if (_selectedSort == activeFilters[index]) {
                            _selectedSort = null;
                          } else {
                            _selectedCategory = null;
                          }
                        });
                      },
                      backgroundColor: AppColors.trustBlue.withValues(alpha: 0.1),
                      labelStyle: const TextStyle(
                        color: AppColors.trustBlue,
                        fontSize: 12,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    );
                  },
                ),
              ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Row(
                children: [
                  TextButton.icon(
                    onPressed: _showFilterSheet,
                    icon: const Icon(Icons.tune, size: 18),
                    label: const Text('Filters'),
                    style: TextButton.styleFrom(
                      foregroundColor: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    '${_filteredResults.length} results',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: _isMapView
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.map_outlined,
                            size: 64,
                            color: theme.colorScheme.onSurfaceVariant
                                .withValues(alpha: 0.3),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Map view coming soon',
                            style: theme.textTheme.bodyLarge?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    )
                  : _filteredResults.isEmpty
                      ? _buildEmptyState(theme)
                      : ListView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          itemCount: _filteredResults.length,
                          itemBuilder: (context, index) {
                            return _SearchResultCard(
                              listing: _filteredResults[index],
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.search_off_rounded,
              size: 72,
              color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.3),
            ),
            const SizedBox(height: 16),
            Text(
              'No results found',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Try adjusting your filters or search terms.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SearchResultCard extends StatelessWidget {
  const _SearchResultCard({required this.listing});

  final Map<String, dynamic> listing;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: () => context.push('/listing/${listing['id']}'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppColors.trustBlue.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                Icons.storefront_rounded,
                color: AppColors.trustBlue.withValues(alpha: 0.5),
                size: 32,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          listing['name'],
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      if (listing['verified'] == true)
                        const Icon(
                          Icons.verified,
                          color: AppColors.trustBlue,
                          size: 18,
                        ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    listing['category'],
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 4),
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
                      const Spacer(),
                      Icon(
                        Icons.location_on_outlined,
                        size: 14,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 2),
                      Text(
                        listing['location'],
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
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

class _FilterSheet extends StatefulWidget {
  const _FilterSheet({
    required this.selectedCategory,
    required this.selectedSort,
    required this.minRating,
    required this.verifiedOnly,
    required this.onApply,
  });

  final String? selectedCategory;
  final String? selectedSort;
  final double? minRating;
  final bool verifiedOnly;
  final Function(String?, String?, double?, bool) onApply;

  @override
  State<_FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends State<_FilterSheet> {
  late String? _category;
  late String? _sort;
  late double? _rating;
  late bool _verified;

  final _categories = ['All', 'Restaurants', 'Services', 'Health', 'Education', 'Pets', 'Shops'];
  final _sortOptions = ['Relevance', 'Rating', 'Distance', 'Newest', 'Most Reviewed'];

  @override
  void initState() {
    super.initState();
    _category = widget.selectedCategory;
    _sort = widget.selectedSort;
    _rating = widget.minRating;
    _verified = widget.verifiedOnly;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DraggableScrollableSheet(
      initialChildSize: 0.75,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: ListView(
            controller: scrollController,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.outlineVariant,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Filters',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Category',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _categories.map((cat) {
                  final selected = _category == cat || (_category == null && cat == 'All');
                  return ChoiceChip(
                    label: Text(cat),
                    selected: selected,
                    onSelected: (_) {
                      setState(() => _category = cat == 'All' ? null : cat);
                    },
                    selectedColor: AppColors.trustBlue.withValues(alpha: 0.15),
                    labelStyle: TextStyle(
                      color: selected ? AppColors.trustBlue : null,
                      fontWeight: selected ? FontWeight.w600 : null,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),
              Text(
                'Minimum Rating',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [1, 2, 3, 4, 5].map((star) {
                  final selected = _rating == star.toDouble();
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _rating = selected ? null : star.toDouble();
                      });
                    },
                    child: Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: Icon(
                        selected ? Icons.star_rounded : Icons.star_outline_rounded,
                        color: Colors.amber,
                        size: 36,
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),
              Text(
                'Sort By',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _sort,
                hint: const Text('Relevance'),
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                ),
                items: _sortOptions.map((opt) {
                  return DropdownMenuItem(value: opt, child: Text(opt));
                }).toList(),
                onChanged: (v) => setState(() => _sort = v),
              ),
              const SizedBox(height: 24),
              SwitchListTile(
                title: const Text('Verified Only'),
                subtitle: const Text('Show only verified listings'),
                value: _verified,
                onChanged: (v) => setState(() => _verified = v),
                activeColor: AppColors.trustBlue,
                contentPadding: EdgeInsets.zero,
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: FilledButton(
                  onPressed: () {
                    widget.onApply(_category, _sort, _rating, _verified);
                    Navigator.pop(context);
                  },
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.trustBlue,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Apply Filters',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: OutlinedButton(
                  onPressed: () {
                    setState(() {
                      _category = null;
                      _sort = null;
                      _rating = null;
                      _verified = false;
                    });
                  },
                  style: OutlinedButton.styleFrom(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Clear All'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
