import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

final storageServiceProvider = Provider<StorageService>((ref) {
  throw UnimplementedError('StorageService must be overridden in main.dart');
});

class StorageService {
  final SharedPreferences _prefs;

  StorageService(this._prefs);

  static const String keyAgreementVersion = 'agreement_version';
  static const String keyAgreementTimestamp = 'agreement_timestamp';
  static const String keyOnboardingCompleted = 'onboarding_completed';
  static const String keyOnboardingStage = 'onboarding_stage';
  static const String keyOnboardingAnswers = 'onboarding_answers';
  static const String keyCanvasTransform = 'canvas_transform';
  static const String keyLimitedMode = 'limited_mode';
  static const String keyThemeMode = 'theme_mode';
  static const String keyAiApiKey = 'ai_api_key';
  static const String keyAiState = 'ai_state';

  // Agreement
  Future<void> setAgreementAccepted(String version) async {
    await _prefs.setString(keyAgreementVersion, version);
    await _prefs.setString(
      keyAgreementTimestamp,
      DateTime.now().toIso8601String(),
    );
  }

  String? getAgreementVersion() {
    return _prefs.getString(keyAgreementVersion);
  }

  String? getAgreementTimestamp() {
    return _prefs.getString(keyAgreementTimestamp);
  }

  bool hasAcceptedAgreement(String currentVersion) {
    final acceptedVersion = getAgreementVersion();
    return acceptedVersion == currentVersion;
  }

  // Onboarding
  Future<void> setOnboardingCompleted() async {
    await _prefs.setBool(keyOnboardingCompleted, true);
  }

  bool isOnboardingCompleted() {
    return _prefs.getBool(keyOnboardingCompleted) ?? false;
  }

  // Onboarding Stage
  Future<void> setOnboardingStage(String stage) async {
    await _prefs.setString(keyOnboardingStage, stage);
  }

  String? getOnboardingStage() {
    return _prefs.getString(keyOnboardingStage);
  }

  // Onboarding Answers
  Future<void> setOnboardingAnswers(Map<String, dynamic> answers) async {
    await _prefs.setString(keyOnboardingAnswers, jsonEncode(answers));
  }

  Map<String, dynamic>? getOnboardingAnswers() {
    final raw = _prefs.getString(keyOnboardingAnswers);
    if (raw == null || raw.isEmpty) return null;
    try {
      final decoded = jsonDecode(raw);
      if (decoded is Map<String, dynamic>) return decoded;
      if (decoded is Map) {
        return decoded.map((key, value) => MapEntry(key.toString(), value));
      }
    } catch (_) {
      return null;
    }
    return null;
  }

  // Canvas Transform
  Future<void> setCanvasTransform(List<double> values) async {
    await _prefs.setString(keyCanvasTransform, jsonEncode(values));
  }

  List<double>? getCanvasTransform() {
    final raw = _prefs.getString(keyCanvasTransform);
    if (raw == null || raw.isEmpty) return null;
    try {
      final decoded = jsonDecode(raw);
      if (decoded is List) {
        return decoded.map((e) => (e as num).toDouble()).toList();
      }
    } catch (_) {
      return null;
    }
    return null;
  }

  Future<void> clearCanvasTransform() async {
    await _prefs.remove(keyCanvasTransform);
  }

  // Limited Mode
  Future<void> setLimitedMode(bool enabled) async {
    await _prefs.setBool(keyLimitedMode, enabled);
  }

  bool isLimitedMode() {
    return _prefs.getBool(keyLimitedMode) ?? false;
  }

  Future<void> clearLimitedMode() async {
    await _prefs.remove(keyLimitedMode);
  }

  // Theme Mode
  Future<void> setThemeMode(String mode) async {
    await _prefs.setString(keyThemeMode, mode);
  }

  String? getThemeMode() {
    return _prefs.getString(keyThemeMode);
  }

  // AI API Key (local only for now)
  Future<void> setAiApiKey(String key) async {
    await _prefs.setString(keyAiApiKey, key);
  }

  String? getAiApiKey() {
    return _prefs.getString(keyAiApiKey);
  }

  // Career AI state
  Future<void> setAiState(Map<String, dynamic> state) async {
    await _prefs.setString(keyAiState, jsonEncode(state));
  }

  Map<String, dynamic>? getAiState() {
    final raw = _prefs.getString(keyAiState);
    if (raw == null || raw.isEmpty) return null;
    try {
      final decoded = jsonDecode(raw);
      if (decoded is Map<String, dynamic>) return decoded;
      if (decoded is Map) {
        return decoded.map((key, value) => MapEntry(key.toString(), value));
      }
    } catch (_) {
      return null;
    }
    return null;
  }

  // Generic Clear (for Logout/Reset)
  Future<void> clearAll() async {
    await _prefs.clear();
  }
}
