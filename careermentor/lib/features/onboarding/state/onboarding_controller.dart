import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/storage_service.dart';

enum OnboardingStage { initial, onboarding, summary }

class OnboardingAnswers {
  final String name;
  final String goal;
  final String workStyle;
  final String learningStyle;

  const OnboardingAnswers({
    required this.name,
    required this.goal,
    required this.workStyle,
    required this.learningStyle,
  });

  Map<String, dynamic> toMap() => {
        'name': name,
        'goal': goal,
        'workStyle': workStyle,
        'learningStyle': learningStyle,
      };

  factory OnboardingAnswers.fromMap(Map<String, dynamic> map) {
    return OnboardingAnswers(
      name: (map['name'] ?? '').toString(),
      goal: (map['goal'] ?? '').toString(),
      workStyle: (map['workStyle'] ?? '').toString(),
      learningStyle: (map['learningStyle'] ?? '').toString(),
    );
  }

  static const empty = OnboardingAnswers(
    name: '',
    goal: '',
    workStyle: 'structured',
    learningStyle: 'project-based',
  );
}

class OnboardingState {
  final OnboardingStage stage;
  final OnboardingAnswers answers;

  const OnboardingState({required this.stage, required this.answers});

  OnboardingState copyWith({
    OnboardingStage? stage,
    OnboardingAnswers? answers,
  }) {
    return OnboardingState(
      stage: stage ?? this.stage,
      answers: answers ?? this.answers,
    );
  }
}

final onboardingControllerProvider =
    NotifierProvider<OnboardingController, OnboardingState>(
  OnboardingController.new,
);

class OnboardingController extends Notifier<OnboardingState> {
  StorageService get _storage => ref.read(storageServiceProvider);

  @override
  OnboardingState build() {
    return OnboardingState(
      stage: _loadStage(_storage),
      answers: _loadAnswers(_storage),
    );
  }

  static OnboardingStage _loadStage(StorageService storage) {
    final raw = storage.getOnboardingStage();
    switch (raw) {
      case 'onboarding':
        return OnboardingStage.onboarding;
      case 'summary':
        return OnboardingStage.summary;
      case 'initial':
      default:
        return OnboardingStage.initial;
    }
  }

  static OnboardingAnswers _loadAnswers(StorageService storage) {
    final raw = storage.getOnboardingAnswers();
    if (raw == null) return OnboardingAnswers.empty;
    return OnboardingAnswers.fromMap(raw);
  }

  Future<void> setStage(OnboardingStage stage) async {
    state = state.copyWith(stage: stage);
    await _storage.setOnboardingStage(stage.name);
  }

  Future<void> saveAnswers(OnboardingAnswers answers) async {
    state = state.copyWith(answers: answers);
    await _storage.setOnboardingAnswers(answers.toMap());
  }

  Future<void> reset() async {
    state = const OnboardingState(
      stage: OnboardingStage.initial,
      answers: OnboardingAnswers.empty,
    );
    await _storage.setOnboardingStage(OnboardingStage.initial.name);
    await _storage.setOnboardingAnswers(OnboardingAnswers.empty.toMap());
  }
}
