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
  final PageController _pageController = PageController();

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onItemTapped(int index) {
    // If tapping the same tab, scroll to top or refresh if needed
    if (_selectedIndex == index) {
      // You could add refresh logic here if needed
      return;
    }

    setState(() {
      _selectedIndex = index;
    });
    _pageController.jumpToPage(index);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView(
        controller: _pageController,
        physics:
            const NeverScrollableScrollPhysics(), // Disable swiping between pages
        onPageChanged: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        children: const [
          HomeScreen(key: ValueKey('Home')),
          NotificationsScreen(key: ValueKey('Notifications')),
          FavoritesScreen(key: ValueKey('Favorites')),
          SettingsScreen(key: ValueKey('Settings')),
        ],
      ),
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
