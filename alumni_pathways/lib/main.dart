import 'dart:io';

import 'package:alumni_pathways/config/theme.dart';
import 'package:alumni_pathways/widgets/bottom_navigation_bar.dart';
import 'package:flutter/material.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import 'package:alumni_pathways/core/constants/api_endpoints.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    // Load environment variables and initialize Mapbox
    await dotenv.load(fileName: ".env");
    MapboxOptions.setAccessToken(dotenv.env['MAPBOX_ACCESS_TOKEN']!);

    // Check authentication status
    final authSuccess = await checkAndHandleAuthentication();

    if (authSuccess) {
      runApp(const AlumniPathways());
    } else {
      runApp(const ErrorApp());
    }
  } catch (e) {
    print(e);
    runApp(const ErrorApp());
  }
}

Future<bool> checkAndHandleAuthentication() async {
  final prefs = await SharedPreferences.getInstance();

  // Check if token and user ID exist
  final token = prefs.getString('token');
  final userId = prefs.getString('user_id');

  if (token != null && userId != null) {
    return true; // User is already authenticated
  }

  // If not authenticated, proceed with device ID check and login
  try {
    // Get or create device ID
    String deviceId = prefs.getString('device_id') ?? const Uuid().v4();
    await prefs.setString('device_id', deviceId);

    // Make login request
    final response = await http.post(
      Uri.parse(ApiEndpoints.login),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'device_id': deviceId}),
    );
    print(response.statusCode);
    if (response.statusCode == 200) {
      final responseData = jsonDecode(response.body);

      // Save token and user ID
      await prefs.setString('token', responseData['data']['token']);
      await prefs.setString('user_id', responseData['data']['user_id']);

      debugPrint('User ID: ${responseData['data']['user_id']}');
      debugPrint('Token: ${responseData['data']['token']}');
      debugPrint('Device ID: $deviceId');

      return true;
    } else {
      return false;
    }
  } catch (e) {
    print(e);
    return false;
  }
}

class ErrorApp extends StatelessWidget {
  const ErrorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 50, color: Colors.red),
                const SizedBox(height: 20),
                const Text(
                  'Something went wrong',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Please try reinstalling the app or contact the administrators.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () => exit(0),
                  child: const Text('Exit App'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
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
