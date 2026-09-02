import 'package:flutter/material.dart';
import 'package:trustora/core/theme/app_colors.dart';

class MapScreen extends StatelessWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Explore Map'),
        centerTitle: true,
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.layers_outlined),
          ),
        ],
      ),
      body: Stack(
        children: [
          Container(
            color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.map_outlined,
                    size: 80,
                    color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.2),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Map view coming soon',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Using MapLibre & OpenStreetMap',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant
                          .withValues(alpha: 0.6),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: 100,
            right: 16,
            child: Column(
              children: [
                FloatingActionButton.small(
                  heroTag: 'list_view',
                  onPressed: () => Navigator.pop(context),
                  backgroundColor: theme.colorScheme.surface,
                  elevation: 2,
                  child: const Icon(Icons.list, color: AppColors.trustBlue),
                ),
                const SizedBox(height: 8),
                FloatingActionButton.small(
                  heroTag: 'center',
                  onPressed: () {},
                  backgroundColor: theme.colorScheme.surface,
                  elevation: 2,
                  child: const Icon(
                    Icons.my_location,
                    color: AppColors.trustBlue,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
