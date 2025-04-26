import 'package:alumni_pathways/widgets/bottom_navigation_bar.dart';
import 'package:flutter/material.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import 'config/theme.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

void main() {
  // Load environment variables
  // and initialize Mapbox
  WidgetsFlutterBinding.ensureInitialized();
  setupMapbox().then((_) {
    runApp(const AlumniPathways());
  });
  //runApp(AlumniPathways());
}

Future<void> setupMapbox() async {
  await dotenv.load(fileName: ".env");
  MapboxOptions.setAccessToken(dotenv.env['MAPBOX_ACCESS_TOKEN']!);
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
