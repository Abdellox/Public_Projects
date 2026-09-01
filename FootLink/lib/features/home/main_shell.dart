import 'package:flutter/material.dart';

import '../../features/home/home_screen.dart';
import '../../features/explore/explore_screen.dart';
import '../create_match/create_match_screen.dart';
import '../teams/teams_screen.dart';
import '../profile/profile_screen.dart';
import '../../l10n/strings.dart';

/// Bottom-navigation shell hosting the five main tabs.
class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final screens = [
      const HomeScreen(),
      const ExploreScreen(),
      const CreateMatchScreen(),
      const TeamsScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: IndexedStack(index: _index, children: screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.home_outlined),
            selectedIcon: const Icon(Icons.home),
            label: Strings.tr(context, 'home'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.explore_outlined),
            selectedIcon: const Icon(Icons.explore),
            label: Strings.tr(context, 'explore'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.add_circle_outline),
            selectedIcon: const Icon(Icons.add_circle),
            label: Strings.tr(context, 'create'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.groups_outlined),
            selectedIcon: const Icon(Icons.groups),
            label: Strings.tr(context, 'teams'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.person_outline),
            selectedIcon: const Icon(Icons.person),
            label: Strings.tr(context, 'profile'),
          ),
        ],
      ),
    );
  }
}
