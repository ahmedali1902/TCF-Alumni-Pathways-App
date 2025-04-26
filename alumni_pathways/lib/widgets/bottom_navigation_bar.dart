import 'package:alumni_pathways/features/settings/presentation/settings_screen.dart';
import 'package:flutter/material.dart';
import '../features/favorites/presentation/favorites_screen.dart';
import '../features/home/presentation/home_screen.dart';
import '../features/notifications/presentation/notifications_screen.dart';

class TBottomNavigationBar extends StatefulWidget {
  const TBottomNavigationBar({super.key});

  @override
  State<TBottomNavigationBar> createState() => _TBottomNavigationBarState();
}

class _TBottomNavigationBarState extends State<TBottomNavigationBar> {
  int _selectedIndex = 0;
  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      const HomeScreen(key: ValueKey('Home')),
      const NotificationsScreen(key: ValueKey('Notifications')),
      const FavoritesScreen(key: ValueKey('Favorites')),
      const SettingsScreen(key: ValueKey('Settings')),
    ];
  }

  void _onItemTapped(int index) {
    if (_selectedIndex == index) return; // Prevent redundant rebuilds
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _selectedIndex, children: _screens),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        selectedItemColor: Theme.of(context).primaryColor,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "Home"),
          BottomNavigationBarItem(
            icon: Icon(Icons.notifications),
            label: "Notifications",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.favorite),
            label: "Favorites",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: "Settings",
          ),
        ],
      ),
    );
  }
}
