import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color _navy = Color(0xFF0B1E3B);
  static const Color _navySurface = Color(0xFF102A4C);
  static const Color _lightBackground = Color(0xFFF5F7FB);
  static const Color _lightSurface = Color(0xFFFFFFFF);

  static final ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: Colors.blue,
      brightness: Brightness.light,
      background: _lightBackground,
      surface: _lightSurface,
    ),
    textTheme: GoogleFonts.interTextTheme(),
    appBarTheme: const AppBarTheme(centerTitle: true, elevation: 0),
    scaffoldBackgroundColor: _lightBackground,
    cardColor: _lightSurface,
  );

  static final ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: _navy,
      brightness: Brightness.dark,
      surface: _navySurface,
      background: _navy,
    ),
    textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
    appBarTheme: const AppBarTheme(centerTitle: true, elevation: 0),
    scaffoldBackgroundColor: _navy,
    cardColor: _navySurface,
  );
}
