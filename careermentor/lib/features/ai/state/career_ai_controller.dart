import 'dart:math';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/storage_service.dart';
import '../../auth/data/auth_repository.dart';
import '../data/ai_api_service.dart';
import '../../onboarding/state/onboarding_controller.dart';

enum MentorPersona { wiseElder, careerCoach, creativeGuide }

enum EmotionState { focused, confused, stressed, motivated }

class TopicNode {
  final String id;
  final String title;
  final String section;
  final String branch;
  final bool locked;
  final bool completed;
  final int? quizScore;

  const TopicNode({
    required this.id,
    required this.title,
    required this.section,
    required this.branch,
    required this.locked,
    required this.completed,
    this.quizScore,
  });

  TopicNode copyWith({
    bool? locked,
    bool? completed,
    int? quizScore,
  }) {
    return TopicNode(
      id: id,
      title: title,
      section: section,
      branch: branch,
      locked: locked ?? this.locked,
      completed: completed ?? this.completed,
      quizScore: quizScore ?? this.quizScore,
    );
  }

  Map<String, dynamic> toMap() => {
    'id': id,
    'title': title,
    'section': section,
    'branch': branch,
    'locked': locked,
    'completed': completed,
    'quizScore': quizScore,
  };

  factory TopicNode.fromMap(Map<String, dynamic> map) {
    return TopicNode(
      id: (map['id'] ?? '').toString(),
      title: (map['title'] ?? '').toString(),
      section: (map['section'] ?? '').toString(),
      branch: (map['branch'] ?? '').toString(),
      locked: map['locked'] == true,
      completed: map['completed'] == true,
      quizScore: map['quizScore'] is num ? (map['quizScore'] as num).toInt() : null,
    );
  }
}

class CareerAiState {
  final String? selectedCareerPath;
  final DateTime? lockUntil;
  final MentorPersona persona;
  final EmotionState emotion;
  final int pivotTokens;
  final String? activeBranch;
  final List<TopicNode> topics;
  final List<String> completedMilestones;
  final Map<String, DateTime> quizCooldownUntil;
  final String mentorMessage;
  final String resumeMarkdown;
  final List<String> generatedQuizQuestions;
  final String sectionExamStatus;

  const CareerAiState({
    required this.selectedCareerPath,
    required this.lockUntil,
    required this.persona,
    required this.emotion,
    required this.pivotTokens,
    required this.activeBranch,
    required this.topics,
    required this.completedMilestones,
    required this.quizCooldownUntil,
    required this.mentorMessage,
    required this.resumeMarkdown,
    required this.generatedQuizQuestions,
    required this.sectionExamStatus,
  });

  bool get hasCareerPath => selectedCareerPath != null && selectedCareerPath!.isNotEmpty;

  double get completionRatio {
    if (topics.isEmpty) return 0;
    final done = topics.where((t) => t.completed).length;
    return done / topics.length;
  }

  bool get isPathLocked {
    if (lockUntil == null) return false;
    return DateTime.now().isBefore(lockUntil!);
  }

  bool get canPivot => completionRatio >= 0.8 || pivotTokens > 0;

  CareerAiState copyWith({
    String? selectedCareerPath,
    DateTime? lockUntil,
    MentorPersona? persona,
    EmotionState? emotion,
    int? pivotTokens,
    String? activeBranch,
    List<TopicNode>? topics,
    List<String>? completedMilestones,
    Map<String, DateTime>? quizCooldownUntil,
    String? mentorMessage,
    String? resumeMarkdown,
    List<String>? generatedQuizQuestions,
    String? sectionExamStatus,
    bool clearCareerPath = false,
    bool clearLock = false,
    bool clearActiveBranch = false,
  }) {
    return CareerAiState(
      selectedCareerPath: clearCareerPath
          ? null
          : (selectedCareerPath ?? this.selectedCareerPath),
      lockUntil: clearLock ? null : (lockUntil ?? this.lockUntil),
      persona: persona ?? this.persona,
      emotion: emotion ?? this.emotion,
      pivotTokens: pivotTokens ?? this.pivotTokens,
      activeBranch: clearActiveBranch ? null : (activeBranch ?? this.activeBranch),
      topics: topics ?? this.topics,
      completedMilestones: completedMilestones ?? this.completedMilestones,
      quizCooldownUntil: quizCooldownUntil ?? this.quizCooldownUntil,
      mentorMessage: mentorMessage ?? this.mentorMessage,
      resumeMarkdown: resumeMarkdown ?? this.resumeMarkdown,
      generatedQuizQuestions:
          generatedQuizQuestions ?? this.generatedQuizQuestions,
      sectionExamStatus: sectionExamStatus ?? this.sectionExamStatus,
    );
  }

  Map<String, dynamic> toMap() => {
    'selectedCareerPath': selectedCareerPath,
    'lockUntil': lockUntil?.toIso8601String(),
    'persona': persona.name,
    'emotion': emotion.name,
    'pivotTokens': pivotTokens,
    'activeBranch': activeBranch,
    'topics': topics.map((e) => e.toMap()).toList(),
    'completedMilestones': completedMilestones,
    'quizCooldownUntil': quizCooldownUntil.map(
      (key, value) => MapEntry(key, value.toIso8601String()),
    ),
    'mentorMessage': mentorMessage,
    'resumeMarkdown': resumeMarkdown,
    'generatedQuizQuestions': generatedQuizQuestions,
    'sectionExamStatus': sectionExamStatus,
  };

  factory CareerAiState.fromMap(Map<String, dynamic> map) {
    DateTime? parseDate(dynamic value) {
      if (value == null) return null;
      return DateTime.tryParse(value.toString());
    }

    MentorPersona parsePersona(dynamic value) {
      return MentorPersona.values.firstWhere(
        (e) => e.name == value,
        orElse: () => MentorPersona.careerCoach,
      );
    }

    EmotionState parseEmotion(dynamic value) {
      return EmotionState.values.firstWhere(
        (e) => e.name == value,
        orElse: () => EmotionState.focused,
      );
    }

    final rawTopics = map['topics'];
    final topics = <TopicNode>[];
    if (rawTopics is List) {
      for (final item in rawTopics) {
        if (item is Map) {
          topics.add(TopicNode.fromMap(item.map((k, v) => MapEntry(k.toString(), v))));
        }
      }
    }

    final rawCompleted = map['completedMilestones'];
    final completed = <String>[];
    if (rawCompleted is List) {
      for (final item in rawCompleted) {
        completed.add(item.toString());
      }
    }

    final rawCooldown = map['quizCooldownUntil'];
    final cooldown = <String, DateTime>{};
    if (rawCooldown is Map) {
      for (final entry in rawCooldown.entries) {
        final parsed = DateTime.tryParse(entry.value.toString());
        if (parsed != null) {
          cooldown[entry.key.toString()] = parsed;
        }
      }
    }

    return CareerAiState(
      selectedCareerPath: map['selectedCareerPath']?.toString(),
      lockUntil: parseDate(map['lockUntil']),
      persona: parsePersona(map['persona']),
      emotion: parseEmotion(map['emotion']),
      pivotTokens: (map['pivotTokens'] is num)
          ? (map['pivotTokens'] as num).toInt()
          : 0,
      activeBranch: map['activeBranch']?.toString(),
      topics: topics,
      completedMilestones: completed,
      quizCooldownUntil: cooldown,
      mentorMessage: map['mentorMessage']?.toString() ?? '',
      resumeMarkdown: map['resumeMarkdown']?.toString() ?? '',
      generatedQuizQuestions: (map['generatedQuizQuestions'] is List)
          ? (map['generatedQuizQuestions'] as List)
            .map((e) => e.toString())
            .toList()
          : const [],
      sectionExamStatus: map['sectionExamStatus']?.toString() ?? '',
    );
  }

  static CareerAiState initial() {
    return const CareerAiState(
      selectedCareerPath: null,
      lockUntil: null,
      persona: MentorPersona.careerCoach,
      emotion: EmotionState.focused,
      pivotTokens: 0,
      activeBranch: null,
      topics: [],
      completedMilestones: [],
      quizCooldownUntil: {},
      mentorMessage: '',
      resumeMarkdown: '',
      generatedQuizQuestions: [],
      sectionExamStatus: '',
    );
  }
}

final careerAiControllerProvider =
    NotifierProvider<CareerAiController, CareerAiState>(
  CareerAiController.new,
);

class CareerAiController extends Notifier<CareerAiState> {
  StorageService get _storage => ref.read(storageServiceProvider);
  AiApiService get _api => ref.read(aiApiServiceProvider);
  String get _userId =>
      ref.read(authRepositoryProvider).currentUserId ?? 'local-user';

  @override
  CareerAiState build() {
    final savedToken = _storage.getAiBackendToken();
    if (savedToken != null && savedToken.isNotEmpty) {
      _api.setAuthToken(savedToken);
    }
    final saved = _storage.getAiState();
    if (saved == null) return CareerAiState.initial();
    return CareerAiState.fromMap(saved);
  }

  Future<void> _persist() async {
    await _storage.setAiState(state.toMap());
  }

  Future<void> _ensureBackendAuth() async {
    final existing = _storage.getAiBackendToken();
    if (existing != null && existing.isNotEmpty) {
      _api.setAuthToken(existing);
      return;
    }

    final auth = await _api.authenticateGuest(userId: _userId);
    final token = auth['access_token']?.toString();
    if (token != null && token.isNotEmpty) {
      await _storage.setAiBackendToken(token);
      _api.setAuthToken(token);
    }
  }

  Future<void> initializeRoadmapFromOnboarding(OnboardingAnswers answers) async {
    if (state.topics.isNotEmpty) return;
    try {
      await _ensureBackendAuth();
      final response = await _api.generateRoadmap(
        userId: _userId,
        careerGoal: answers.goal,
        priorKnowledge: [answers.workStyle, answers.learningStyle],
      );
      final topics = _topicsFromApiResponse(response);
      final careerPath =
          (response['career_path'] ?? _inferPathFromGoal(answers.goal))
              .toString();
      final lockDays = response['lock_days'] is num
          ? (response['lock_days'] as num).toInt()
          : 30;

      state = state.copyWith(
        selectedCareerPath: careerPath,
        lockUntil: DateTime.now().add(Duration(days: lockDays)),
        activeBranch: 'A',
        topics: topics,
        completedMilestones: [],
      );
      await _persist();
    } catch (_) {
      final suggestedPath = _inferPathFromGoal(answers.goal);
      await selectCareerPath(suggestedPath);
    }
  }

  List<TopicNode> _topicsFromApiResponse(Map<String, dynamic> response) {
    final raw = response['topics'];
    if (raw is! List) {
      final path = (response['career_path'] ?? 'Career Exploration').toString();
      return _buildRoadmapTree(path);
    }

    final topics = <TopicNode>[];
    for (final item in raw) {
      if (item is Map) {
        final map = item.map((k, v) => MapEntry(k.toString(), v));
        topics.add(TopicNode.fromMap(map));
      }
    }
    if (topics.isEmpty) {
      final path = (response['career_path'] ?? 'Career Exploration').toString();
      return _buildRoadmapTree(path);
    }
    return topics;
  }

  String _inferPathFromGoal(String goal) {
    final value = goal.toLowerCase();
    if (value.contains('data') || value.contains('ai') || value.contains('ml')) {
      return 'Data Science';
    }
    if (value.contains('design') || value.contains('ux')) return 'UX Research';
    if (value.contains('web') || value.contains('flutter') || value.contains('app')) {
      return 'Software Engineering';
    }
    return 'Career Exploration';
  }

  List<TopicNode> _buildRoadmapTree(String path) {
    final base = <TopicNode>[
      TopicNode(
        id: 'f1',
        title: 'Foundations: Core Basics',
        section: 'Foundations',
        branch: 'Core',
        locked: false,
        completed: false,
      ),
      TopicNode(
        id: 'f2',
        title: 'Foundations: Problem Solving',
        section: 'Foundations',
        branch: 'Core',
        locked: false,
        completed: false,
      ),
      TopicNode(
        id: 'b1',
        title: '$path Branch A',
        section: 'Specialization',
        branch: 'A',
        locked: true,
        completed: false,
      ),
      TopicNode(
        id: 'b2',
        title: '$path Branch B',
        section: 'Specialization',
        branch: 'B',
        locked: true,
        completed: false,
      ),
      TopicNode(
        id: 'b3',
        title: '$path Branch C',
        section: 'Specialization',
        branch: 'C',
        locked: true,
        completed: false,
      ),
      TopicNode(
        id: 'adv1',
        title: 'Advanced Project & Portfolio',
        section: 'Advanced',
        branch: 'A',
        locked: true,
        completed: false,
      ),
    ];

    return base;
  }

  Future<void> selectCareerPath(String path, {int lockDays = 30}) async {
    final lockUntil = DateTime.now().add(Duration(days: lockDays));
    state = state.copyWith(
      selectedCareerPath: path,
      lockUntil: lockUntil,
      activeBranch: 'A',
      topics: _buildRoadmapTree(path),
      completedMilestones: [],
    );

    await unlockFirstBranchIfEligible();
    await refreshMentorMessage();
    await refreshResumePreview();
    await _persist();
  }

  Future<void> setMentorPersona(MentorPersona persona) async {
    state = state.copyWith(persona: persona);
    await refreshMentorMessage();
    await _persist();
  }

  Future<void> setEmotion(EmotionState emotion) async {
    state = state.copyWith(emotion: emotion);
    await refreshMentorMessage();
    await _persist();
  }

  Future<void> unlockFirstBranchIfEligible() async {
    final completedFoundations = state.topics
            .where((t) => t.section == 'Foundations')
            .where((t) => t.completed)
            .length >=
        2;
    if (!completedFoundations) return;

    final updated = state.topics.map((topic) {
      if (topic.branch == 'A' && topic.locked) {
        return topic.copyWith(locked: false);
      }
      return topic;
    }).toList();

    state = state.copyWith(topics: updated);
    await _persist();
  }

  Future<void> chooseActiveBranch(String branch) async {
    if (state.activeBranch == branch) return;

    final currentBranchCompleted = state.topics
        .where((t) => t.branch == state.activeBranch)
        .every((t) => t.completed || t.locked);

    if (!currentBranchCompleted) return;

    final branchUnlocked = state.topics.any(
      (t) => t.branch == branch && !t.locked,
    );
    if (!branchUnlocked) return;

    state = state.copyWith(activeBranch: branch);
    await _persist();
  }

  Future<int> submitMasteryQuiz({
    required String topicId,
    required int correct,
    required int total,
  }) async {
    if (!canTakeQuiz(topicId)) {
      return -1;
    }

    final score = total == 0 ? 0 : ((correct / total) * 100).round();
    bool passed = score >= 80;

    try {
      await _ensureBackendAuth();
      final response = await _api.validateQuiz(
        userId: _userId,
        topicId: topicId,
        score: score,
      );
      passed = response['passed'] == true;
    } catch (_) {
      // fallback to local rule
    }

    final updated = state.topics.map((topic) {
      if (topic.id != topicId) return topic;
      return topic.copyWith(
        quizScore: score,
        completed: passed ? true : topic.completed,
      );
    }).toList();

    final current = updated.firstWhere((t) => t.id == topicId);
    final completedMilestones = List<String>.from(state.completedMilestones);
    if (passed && !completedMilestones.contains(current.title)) {
      completedMilestones.add(current.title);
    }

    final branchDone = updated
        .where((t) => t.branch == (state.activeBranch ?? 'A'))
        .every((t) => t.completed || t.locked);

    final tokens = branchDone ? state.pivotTokens + 1 : state.pivotTokens;

    final nextCooldown = Map<String, DateTime>.from(state.quizCooldownUntil);
    if (!passed) {
      nextCooldown[topicId] = DateTime.now().add(const Duration(days: 3));
    } else {
      nextCooldown.remove(topicId);
    }

    state = state.copyWith(
      topics: _unlockNextBranches(updated),
      completedMilestones: completedMilestones,
      pivotTokens: tokens,
      quizCooldownUntil: nextCooldown,
    );

    try {
      await _ensureBackendAuth();
      await _api.updateProgress(
        userId: _userId,
        topicId: topicId,
        completed: passed,
      );
    } catch (_) {
      // best effort
    }

    await unlockFirstBranchIfEligible();
    await refreshMentorMessage();
    await refreshResumePreview();
    await _persist();
    return score;
  }

  bool canTakeQuiz(String topicId) {
    final expiresAt = state.quizCooldownUntil[topicId];
    if (expiresAt == null) return true;
    return DateTime.now().isAfter(expiresAt);
  }

  Duration? quizCooldownRemaining(String topicId) {
    final expiresAt = state.quizCooldownUntil[topicId];
    if (expiresAt == null) return null;
    if (DateTime.now().isAfter(expiresAt)) return null;
    return expiresAt.difference(DateTime.now());
  }

  List<TopicNode> _unlockNextBranches(List<TopicNode> topics) {
    final isBranchACompleted = topics
        .where((t) => t.branch == 'A')
        .every((t) => t.completed || t.locked);

    return topics.map((topic) {
      if (isBranchACompleted && (topic.branch == 'B' || topic.branch == 'C')) {
        return topic.copyWith(locked: false);
      }
      if ((topic.branch == 'A' || topic.branch == 'B' || topic.branch == 'C') &&
          !topic.locked) {
        return topic;
      }
      return topic;
    }).toList();
  }

  Future<bool> requestPivot(String newPath) async {
    if (!state.canPivot) return false;

    var tokens = state.pivotTokens;
    if (state.completionRatio < 0.8) {
      if (tokens <= 0) return false;
      tokens -= 1;
    }

    final lockDays = Random().nextInt(31) + 30;
    state = state.copyWith(pivotTokens: tokens);
    await selectCareerPath(newPath, lockDays: lockDays);
    return true;
  }

  Future<void> refreshMentorMessage() async {
    final local = generateMentorTip();
    try {
      await _ensureBackendAuth();
      final response = await _api.mentorReply(
        userId: _userId,
        persona: state.persona.name,
        emotion: state.emotion.name,
        context:
            'path=${state.selectedCareerPath ?? 'none'}, completion=${(state.completionRatio * 100).toStringAsFixed(0)}',
      );
      final message = (response['message'] ?? local).toString();
      state = state.copyWith(mentorMessage: message);
      await _persist();
      return;
    } catch (_) {
      state = state.copyWith(mentorMessage: local);
      await _persist();
    }
  }

  String generateMentorTip() {
    final tone = switch (state.persona) {
      MentorPersona.wiseElder => 'Slow down and build depth.',
      MentorPersona.careerCoach => 'Focus on execution and measurable progress.',
      MentorPersona.creativeGuide => 'Explore boldly, then validate with practice.',
    };

    final mood = switch (state.emotion) {
      EmotionState.focused => 'You are in a strong flow state.',
      EmotionState.confused => 'Break this topic into smaller wins.',
      EmotionState.stressed => 'Take a short reset and return with clarity.',
      EmotionState.motivated => 'Use this momentum on your hardest milestone.',
    };

    return '$tone $mood';
  }

  String generateResumePreview() {
    final path = state.selectedCareerPath ?? 'Career Track';
    final lines = <String>[
      'Target Path: $path',
      'Completion: ${(state.completionRatio * 100).toStringAsFixed(0)}%',
      'Completed Milestones:',
      ...state.completedMilestones.map((m) => '- $m'),
    ];
    return lines.join('\n');
  }

  Future<void> refreshResumePreview() async {
    final local = generateResumePreview();
    try {
      await _ensureBackendAuth();
      final response = await _api.buildResume(
        userId: _userId,
        targetRole: state.selectedCareerPath ?? 'Career Track',
        completedMilestones: state.completedMilestones,
      );
      final markdown = (response['markdown_resume'] ?? local).toString();
      state = state.copyWith(resumeMarkdown: markdown);
      await _persist();
      return;
    } catch (_) {
      state = state.copyWith(resumeMarkdown: local);
      await _persist();
    }
  }

  Future<void> generateQuizForTopic(String topicId) async {
    try {
      await _ensureBackendAuth();
      final response = await _api.generateQuiz(topicId: topicId);
      final rawQuestions = response['questions'];
      final list = <String>[];
      if (rawQuestions is List) {
        for (final q in rawQuestions) {
          if (q is Map) {
            list.add((q['question'] ?? '').toString());
          }
        }
      }
      state = state.copyWith(generatedQuizQuestions: list);
      await _persist();
    } catch (_) {
      state = state.copyWith(
        generatedQuizQuestions: const [
          'Fallback Quiz: Explain the core concept in your own words.',
          'Fallback Quiz: Apply this concept to one practical task.',
        ],
      );
      await _persist();
    }
  }

  Future<void> submitSectionExam(String section, int score) async {
    try {
      await _ensureBackendAuth();
      final response = await _api.submitSectionExam(
        userId: _userId,
        section: section,
        score: score,
      );
      final passed = response['passed'] == true;
      final cooldown = response['cooldown_until']?.toString();
      state = state.copyWith(
        sectionExamStatus: passed
            ? 'Section exam passed ($score%).'
            : 'Section exam failed ($score%). Cooldown: ${cooldown ?? 'active'}',
      );
      await _persist();
    } catch (_) {
      state = state.copyWith(
        sectionExamStatus:
            score >= 80 ? 'Section exam passed locally.' : 'Section exam failed locally.',
      );
      await _persist();
    }
  }

  List<String> localBangladeshSpotlight() {
    return const [
      'Khulna to Global Product Designer — Case Study',
      'Dhaka Data Analyst to ML Engineer — Interview',
      'Rajshahi Flutter Developer Career Roadmap — Weekly Spotlight',
    ];
  }

  List<String> careerSimulations() {
    final path = state.selectedCareerPath ?? 'General';
    return [
      'Simulation: Handle a real client brief in $path',
      'Simulation: Prioritize tasks under deadline pressure',
      'Simulation: Present your solution to a hiring panel',
    ];
  }

  Future<List<Map<String, dynamic>>> getLeaderboard({int limit = 5}) async {
    try {
      await _ensureBackendAuth();
      return await _api.leaderboard(limit: limit);
    } catch (_) {
      return const [];
    }
  }

  Future<List<String>> getSpotlight() async {
    try {
      await _ensureBackendAuth();
      return await _api.bangladeshSpotlight();
    } catch (_) {
      return localBangladeshSpotlight();
    }
  }

  Future<List<String>> getSimulations() async {
    try {
      await _ensureBackendAuth();
      return await _api.simulations(state.selectedCareerPath ?? 'General Career');
    } catch (_) {
      return careerSimulations();
    }
  }
}
