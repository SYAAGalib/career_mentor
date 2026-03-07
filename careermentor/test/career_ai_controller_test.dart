import 'package:careermentor/core/services/storage_service.dart';
import 'package:careermentor/features/ai/data/ai_api_service.dart';
import 'package:careermentor/features/ai/state/career_ai_controller.dart';
import 'package:careermentor/features/auth/data/auth_repository.dart';
import 'package:careermentor/features/onboarding/state/onboarding_controller.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

class _FakeApi extends AiApiService {
  _FakeApi() : super(baseUrl: 'http://localhost');

  @override
  Future<Map<String, dynamic>> generateRoadmap({
    required String userId,
    required String careerGoal,
    List<String> priorKnowledge = const [],
    List<String> masteredTopics = const [],
  }) async {
    return {
      'career_path': 'Data Science',
      'lock_days': 30,
      'topics': [
        {
          'id': 'f1',
          'title': 'Core Foundations',
          'section': 'Foundations',
          'branch': 'Core',
          'locked': false,
          'completed': false,
        },
        {
          'id': 'f2',
          'title': 'Problem Solving',
          'section': 'Foundations',
          'branch': 'Core',
          'locked': false,
          'completed': false,
        },
      ],
    };
  }

  @override
  Future<Map<String, dynamic>> validateQuiz({
    required String userId,
    required String topicId,
    required int score,
  }) async {
    return {'passed': score >= 80, 'score': score, 'required_score': 80};
  }

  @override
  Future<Map<String, dynamic>> mentorReply({
    required String userId,
    required String persona,
    required String emotion,
    required String context,
  }) async {
    return {'message': 'Mentor($persona/$emotion): $context'};
  }

  @override
  Future<Map<String, dynamic>> updateProgress({
    required String userId,
    required String topicId,
    required bool completed,
  }) async {
    return {
      'user_id': userId,
      'completion_ratio': completed ? 0.9 : 0.3,
      'pivot_tokens': completed ? 1 : 0,
      'can_pivot': completed,
    };
  }

  @override
  Future<Map<String, dynamic>> buildResume({
    required String userId,
    required String targetRole,
    required List<String> completedMilestones,
  }) async {
    return {
      'markdown_resume': '# Resume for $targetRole\n- ${completedMilestones.join('\n- ')}',
      'html_resume': '<h1>Resume</h1>',
    };
  }
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  Future<ProviderContainer> _container() async {
    final prefs = await SharedPreferences.getInstance();
    return ProviderContainer(
      overrides: [
        storageServiceProvider.overrideWithValue(StorageService(prefs)),
        authRepositoryProvider.overrideWithValue(MockAuthRepository(startSignedIn: true)),
        aiApiServiceProvider.overrideWithValue(_FakeApi()),
      ],
    );
  }

  test('initializes roadmap from onboarding', () async {
    final container = await _container();
    addTearDown(container.dispose);

    await container
        .read(careerAiControllerProvider.notifier)
        .initializeRoadmapFromOnboarding(
          const OnboardingAnswers(
            name: 'A',
            goal: 'I want data science',
            workStyle: 'structured',
            learningStyle: 'project-based',
          ),
        );

    final state = container.read(careerAiControllerProvider);
    expect(state.selectedCareerPath, 'Data Science');
    expect(state.topics, isNotEmpty);
  });

  test('failed quiz creates cooldown', () async {
    final container = await _container();
    addTearDown(container.dispose);

    final notifier = container.read(careerAiControllerProvider.notifier);
    await notifier.selectCareerPath('Data Science');

    final score = await notifier.submitMasteryQuiz(
      topicId: 'f1',
      correct: 2,
      total: 5,
    );

    expect(score, 40);
    expect(notifier.canTakeQuiz('f1'), isFalse);
    expect(notifier.quizCooldownRemaining('f1'), isNotNull);
  });
}
