import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

import '../../../core/config/app_config.dart';

final aiApiServiceProvider = Provider<AiApiService>((ref) {
  return AiApiService(baseUrl: AppConfig.backendBaseUrl);
});

class AiApiService {
  AiApiService({required this.baseUrl, http.Client? client})
      : _client = client ?? http.Client();

  final String baseUrl;
  final http.Client _client;

  Uri _uri(String path) => Uri.parse('$baseUrl$path');

  Future<Map<String, dynamic>> generateRoadmap({
    required String userId,
    required String careerGoal,
    List<String> priorKnowledge = const [],
    List<String> masteredTopics = const [],
  }) async {
    final response = await _client.post(
      _uri('/roadmap/generate'),
      headers: {'content-type': 'application/json'},
      body: jsonEncode({
        'user_id': userId,
        'career_goal': careerGoal,
        'prior_knowledge': priorKnowledge,
        'mastered_topics': masteredTopics,
      }),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Roadmap API failed: ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw Exception('Invalid roadmap response');
    }
    return decoded;
  }

  Future<Map<String, dynamic>> validateQuiz({
    required String userId,
    required String topicId,
    required int score,
  }) async {
    final response = await _client.post(
      _uri('/validation/quiz'),
      headers: {'content-type': 'application/json'},
      body: jsonEncode({
        'user_id': userId,
        'topic_id': topicId,
        'score': score,
      }),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Validation API failed: ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw Exception('Invalid validation response');
    }
    return decoded;
  }

  Future<Map<String, dynamic>> generateQuiz({required String topicId}) async {
    final response = await _client.get(
      _uri('/validation/generate?topic_id=$topicId'),
      headers: {'content-type': 'application/json'},
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Quiz generation API failed: ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw Exception('Invalid quiz generation response');
    }
    return decoded;
  }

  Future<Map<String, dynamic>> mentorReply({
    required String userId,
    required String persona,
    required String emotion,
    required String context,
  }) async {
    final response = await _client.post(
      _uri('/mentor/reply'),
      headers: {'content-type': 'application/json'},
      body: jsonEncode({
        'user_id': userId,
        'persona': persona,
        'emotion': emotion,
        'context': context,
      }),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Mentor API failed: ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw Exception('Invalid mentor response');
    }
    return decoded;
  }

  Future<Map<String, dynamic>> updateProgress({
    required String userId,
    required String topicId,
    required bool completed,
  }) async {
    final response = await _client.post(
      _uri('/progress/update'),
      headers: {'content-type': 'application/json'},
      body: jsonEncode({
        'user_id': userId,
        'topic_id': topicId,
        'completed': completed,
      }),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Progress API failed: ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw Exception('Invalid progress response');
    }
    return decoded;
  }

  Future<Map<String, dynamic>> buildResume({
    required String userId,
    required String targetRole,
    required List<String> completedMilestones,
  }) async {
    final response = await _client.post(
      _uri('/resume/build'),
      headers: {'content-type': 'application/json'},
      body: jsonEncode({
        'user_id': userId,
        'target_role': targetRole,
        'completed_milestones': completedMilestones,
      }),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Resume API failed: ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw Exception('Invalid resume response');
    }
    return decoded;
  }

  Future<List<Map<String, dynamic>>> leaderboard({int limit = 10}) async {
    final response = await _client.get(
      _uri('/progress/leaderboard?limit=$limit'),
      headers: {'content-type': 'application/json'},
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Leaderboard API failed: ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw Exception('Invalid leaderboard response');
    }
    final entries = decoded['entries'];
    if (entries is! List) return const [];

    return entries
        .whereType<Map>()
        .map((e) => e.map((k, v) => MapEntry(k.toString(), v)))
        .toList();
  }

  Future<List<String>> bangladeshSpotlight() async {
    final response = await _client.get(
      _uri('/content/spotlight'),
      headers: {'content-type': 'application/json'},
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Spotlight API failed: ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw Exception('Invalid spotlight response');
    }
    final items = decoded['items'];
    if (items is! List) return const [];
    return items.map((e) => e.toString()).toList();
  }

  Future<List<String>> simulations(String careerPath) async {
    final encoded = Uri.encodeQueryComponent(careerPath);
    final response = await _client.get(
      _uri('/content/simulations?career_path=$encoded'),
      headers: {'content-type': 'application/json'},
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Simulations API failed: ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw Exception('Invalid simulations response');
    }
    final items = decoded['items'];
    if (items is! List) return const [];
    return items.map((e) => e.toString()).toList();
  }

  Future<Map<String, dynamic>> submitSectionExam({
    required String userId,
    required String section,
    required int score,
  }) async {
    final response = await _client.post(
      _uri('/exams/submit'),
      headers: {'content-type': 'application/json'},
      body: jsonEncode({
        'user_id': userId,
        'section': section,
        'score': score,
      }),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Exam submit API failed: ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw Exception('Invalid exam response');
    }
    return decoded;
  }
}
