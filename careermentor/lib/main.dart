import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:careermentor/app/app.dart';
import 'package:careermentor/core/services/analytics_service.dart';
import 'package:careermentor/core/services/cache_service.dart';
import 'package:careermentor/core/services/database_service.dart';
import 'package:careermentor/core/services/storage_service.dart';
import 'package:careermentor/features/auth/data/auth_repository.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  bool firebaseInitialized = false;
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    firebaseInitialized = true;
    await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(true);
    FlutterError.onError =
        FirebaseCrashlytics.instance.recordFlutterFatalError;
    PlatformDispatcher.instance.onError = (error, stack) {
      FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
      return true;
    };
  } catch (e) {
    debugPrint("Firebase init failed: $e. SWITCHING TO MOCK MODE.");
  }

  final prefs = await SharedPreferences.getInstance();
  final cacheService = CacheServiceFactory.createFromEnvironment();
  final databaseService = firebaseInitialized
      ? FirestoreDatabaseService(FirebaseFirestore.instance)
      : MockDatabaseService();
    final analyticsService = firebaseInitialized
      ? FirebaseAnalyticsService(FirebaseAnalytics.instance)
      : NoopAnalyticsService();

  runApp(
    ProviderScope(
      overrides: [
        storageServiceProvider.overrideWithValue(StorageService(prefs)),
        cacheServiceProvider.overrideWithValue(cacheService),
        databaseServiceProvider.overrideWithValue(databaseService),
        analyticsServiceProvider.overrideWithValue(analyticsService),
        authRepositoryProvider.overrideWithValue(
          firebaseInitialized
              ? FirebaseAuthRepository(FirebaseAuth.instance)
              : MockAuthRepository(startSignedIn: false),
        ),
      ],
      child: const CareerMentorApp(),
    ),
  );
}
