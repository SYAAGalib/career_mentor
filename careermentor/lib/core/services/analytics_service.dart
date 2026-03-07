import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final analyticsServiceProvider = Provider<AnalyticsService>((ref) {
  throw UnimplementedError('AnalyticsService must be overridden in main.dart');
});

abstract class AnalyticsService {
  Future<void> logEvent(String name, {Map<String, Object?>? parameters});
}

class FirebaseAnalyticsService implements AnalyticsService {
  FirebaseAnalyticsService(this._analytics);

  final FirebaseAnalytics _analytics;

  @override
  Future<void> logEvent(
    String name, {
    Map<String, Object?>? parameters,
  }) async {
    final safeParams = parameters
        ?.entries
        .where((entry) => entry.value != null)
        .map((entry) => MapEntry(entry.key, entry.value as Object))
        .toMap();
    await _analytics.logEvent(name: name, parameters: safeParams);
  }
}

class NoopAnalyticsService implements AnalyticsService {
  @override
  Future<void> logEvent(
    String name, {
    Map<String, Object?>? parameters,
  }) async {
    // no-op
  }
}

extension<K, V> on Iterable<MapEntry<K, V>> {
  Map<K, V> toMap() => Map<K, V>.fromEntries(this);
}
