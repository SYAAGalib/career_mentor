import 'dart:async';
import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:redis/redis.dart';

final cacheServiceProvider = Provider<CacheService>((ref) {
  throw UnimplementedError('CacheService must be overridden in main.dart');
});

abstract class CacheService {
  Future<void> setString(String key, String value, {Duration? ttl});
  Future<String?> getString(String key);
  Future<void> remove(String key);
  Future<void> clear();
}

class InMemoryCacheService implements CacheService {
  final Map<String, _CacheEntry> _cache = {};

  @override
  Future<void> setString(String key, String value, {Duration? ttl}) async {
    _cache[key] = _CacheEntry(value, ttl);
  }

  @override
  Future<String?> getString(String key) async {
    final entry = _cache[key];
    if (entry == null) return null;
    if (entry.isExpired) {
      _cache.remove(key);
      return null;
    }
    return entry.value;
  }

  @override
  Future<void> remove(String key) async {
    _cache.remove(key);
  }

  @override
  Future<void> clear() async {
    _cache.clear();
  }
}

class RedisCacheService implements CacheService {
  RedisCacheService(this._url);

  final String _url;
  Command? _command;

  Future<Command> _getCommand() async {
    if (_command != null) return _command!;
    final uri = Uri.parse(_url);
    final host = uri.host.isEmpty ? _url : uri.host;
    final port = uri.port == 0 ? 6379 : uri.port;

    final connection = RedisConnection();
    final command = await connection.connect(host, port);

    if (uri.userInfo.isNotEmpty) {
      final password = uri.userInfo.split(':').last;
      await command.send_object(['AUTH', password]);
    }

    _command = command;
    return command;
  }

  @override
  Future<void> setString(String key, String value, {Duration? ttl}) async {
    final command = await _getCommand();
    if (ttl == null) {
      await command.send_object(['SET', key, value]);
      return;
    }
    await command.send_object(['SET', key, value, 'EX', ttl.inSeconds]);
  }

  @override
  Future<String?> getString(String key) async {
    final command = await _getCommand();
    final result = await command.send_object(['GET', key]);
    if (result == null) return null;
    return result.toString();
  }

  @override
  Future<void> remove(String key) async {
    final command = await _getCommand();
    await command.send_object(['DEL', key]);
  }

  @override
  Future<void> clear() async {
    final command = await _getCommand();
    await command.send_object(['FLUSHDB']);
  }
}

class _CacheEntry {
  _CacheEntry(this.value, Duration? ttl)
      : expiresAt = ttl == null ? null : DateTime.now().add(ttl);

  final String value;
  final DateTime? expiresAt;

  bool get isExpired => expiresAt != null && DateTime.now().isAfter(expiresAt!);
}

class CacheServiceFactory {
  static CacheService createFromEnvironment() {
    final url = Platform.environment['REDIS_URL'];
    if (url == null || url.trim().isEmpty) {
      return InMemoryCacheService();
    }
    return RedisCacheService(url.trim());
  }
}
