import 'package:flutter/material.dart';
import '../core/constants/colors.dart';

class TAppTheme {
  static final ThemeData lightTheme = ThemeData(
    brightness: Brightness.light,
    primaryColor: TAppColors.primary,
    scaffoldBackgroundColor: Colors.white,
    fontFamily: 'Inter',
    textTheme: const TextTheme(
      bodyLarge: TextStyle(
        color: TAppColors.lightAccent,
      ), // Dark text for light mode
      bodyMedium: TextStyle(color: TAppColors.lightAccent),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: TAppColors.primary,
      foregroundColor: Colors.white,
    ),
  );

  static final ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,
    primaryColor: TAppColors.primary,
    scaffoldBackgroundColor: Colors.black,
    fontFamily: 'Inter',
    textTheme: const TextTheme(
      bodyLarge: TextStyle(
        color: TAppColors.darkAccent,
      ), // White text for dark mode
      bodyMedium: TextStyle(color: TAppColors.darkAccent),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: TAppColors.primary,
      foregroundColor: Colors.white,
    ),
  );
}
