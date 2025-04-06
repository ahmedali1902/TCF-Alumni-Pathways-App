import 'package:alumni_pathways/widgets/bottom_navigation_bar.dart';
import 'package:flutter/material.dart';
import 'config/theme.dart';

void main() {
  runApp(AlumniPathways());
}

class AlumniPathways extends StatelessWidget {
  const AlumniPathways({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: TAppTheme.lightTheme, // Default: Light Theme
      darkTheme: TAppTheme.darkTheme, // Dark Theme
      themeMode: ThemeMode.system, // Auto-switch based on system setting
      home: const TBottomNavigationBar(),
    );
  }
}
