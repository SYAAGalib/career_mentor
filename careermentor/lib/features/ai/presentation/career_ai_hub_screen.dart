import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/services/analytics_service.dart';
import '../../../features/onboarding/state/onboarding_controller.dart';
import '../state/career_ai_controller.dart';

class CareerAiHubScreen extends ConsumerStatefulWidget {
  const CareerAiHubScreen({super.key});

  @override
  ConsumerState<CareerAiHubScreen> createState() => _CareerAiHubScreenState();
}

class _CareerAiHubScreenState extends ConsumerState<CareerAiHubScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  final TextEditingController _pathController = TextEditingController();
  final TextEditingController _quizCorrectController = TextEditingController(text: '4');
  final TextEditingController _quizTotalController = TextEditingController(text: '5');
  final TextEditingController _sectionExamScoreController =
      TextEditingController(text: '80');

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final answers = ref.read(onboardingControllerProvider).answers;
      await ref
          .read(careerAiControllerProvider.notifier)
          .initializeRoadmapFromOnboarding(answers);
      final state = ref.read(careerAiControllerProvider);
      _pathController.text = state.selectedCareerPath ?? answers.goal;
      await ref.read(analyticsServiceProvider).logEvent('ai_hub_opened');
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _pathController.dispose();
    _quizCorrectController.dispose();
    _quizTotalController.dispose();
    _sectionExamScoreController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(careerAiControllerProvider);
    final controller = ref.read(careerAiControllerProvider.notifier);
    final currentTopic = state.topics.firstWhere(
      (t) => !t.locked && !t.completed,
      orElse: () => state.topics.isNotEmpty
          ? state.topics.first
          : const TopicNode(
              id: 'none',
              title: 'No topic available',
              section: 'N/A',
              branch: 'N/A',
              locked: true,
              completed: false,
            ),
    );
    final cooldown = currentTopic.id == 'none'
        ? null
        : controller.quizCooldownRemaining(currentTopic.id);
    final cooldownText = cooldown == null
        ? 'Ready'
        : '${cooldown.inHours}h ${cooldown.inMinutes.remainder(60)}m remaining';

    return Scaffold(
      appBar: AppBar(
        title: const Text('CareerMentor AI Hub'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: const [
            Tab(text: 'Roadmap'),
            Tab(text: 'Quiz'),
            Tab(text: 'Mentor'),
            Tab(text: 'Community'),
            Tab(text: 'Resume'),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () => context.go('/app'),
            icon: const Icon(Icons.home_outlined),
            tooltip: 'Back to Canvas',
          ),
        ],
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _RoadmapTab(pathController: _pathController),
          _QuizTab(
            correctController: _quizCorrectController,
            totalController: _quizTotalController,
            sectionExamScoreController: _sectionExamScoreController,
          ),
          const _MentorTab(),
          const _CommunityTab(),
          const _ResumeTab(),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(12),
        color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.35),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Path: ${state.selectedCareerPath ?? 'Not selected'}',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            Text('Lock: ${state.lockUntil?.toLocal().toString().split(' ').first ?? 'None'}'),
            Text('Completion: ${(state.completionRatio * 100).toStringAsFixed(0)}%'),
            Text('Pivot tokens: ${state.pivotTokens}'),
            Text('Quiz cooldown: $cooldownText'),
            Text(
              'Mentor tip: ${state.mentorMessage.isEmpty ? controller.generateMentorTip() : state.mentorMessage}',
            ),
          ],
        ),
      ),
    );
  }
}

class _RoadmapTab extends ConsumerWidget {
  const _RoadmapTab({required this.pathController});

  final TextEditingController pathController;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(careerAiControllerProvider);
    final controller = ref.read(careerAiControllerProvider.notifier);

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(
            controller: pathController,
            decoration: const InputDecoration(
              labelText: 'Career path',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              FilledButton(
                onPressed: () async {
                  await controller.selectCareerPath(pathController.text.trim().isEmpty
                      ? 'Career Exploration'
                      : pathController.text.trim());
                },
                child: const Text('Set Path + Lock'),
              ),
              OutlinedButton(
                onPressed: () => controller.chooseActiveBranch('A'),
                child: const Text('Use Branch A'),
              ),
              OutlinedButton(
                onPressed: () => controller.chooseActiveBranch('B'),
                child: const Text('Use Branch B'),
              ),
              OutlinedButton(
                onPressed: () => controller.chooseActiveBranch('C'),
                child: const Text('Use Branch C'),
              ),
              FilledButton.tonal(
                onPressed: () async {
                  final ok = await controller.requestPivot('UX Research');
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(ok
                            ? 'Pivot approved.'
                            : 'Pivot denied. Need 80% completion or tokens.'),
                      ),
                    );
                  }
                },
                child: const Text('Try Pivot'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text(
            'Roadmap Tree (locked/unlocked)',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: ListView.builder(
              itemCount: state.topics.length,
              itemBuilder: (context, index) {
                final topic = state.topics[index];
                final icon = topic.completed
                    ? Icons.check_circle
                    : topic.locked
                        ? Icons.lock
                        : Icons.radio_button_unchecked;
                final color = topic.completed
                    ? Colors.green
                    : topic.locked
                        ? Colors.grey
                        : Colors.blue;

                return Card(
                  child: ListTile(
                    leading: Icon(icon, color: color),
                    title: Text(topic.title),
                    subtitle: Text(
                      'Section: ${topic.section} • Branch: ${topic.branch} • Quiz: ${topic.quizScore ?? '-'}',
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _QuizTab extends ConsumerWidget {
  const _QuizTab({
    required this.correctController,
    required this.totalController,
    required this.sectionExamScoreController,
  });

  final TextEditingController correctController;
  final TextEditingController totalController;
  final TextEditingController sectionExamScoreController;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(careerAiControllerProvider);
    final controller = ref.read(careerAiControllerProvider.notifier);

    final currentTopic = state.topics.firstWhere(
      (t) => !t.locked && !t.completed,
      orElse: () => state.topics.isNotEmpty
          ? state.topics.first
          : const TopicNode(
              id: 'none',
              title: 'No topic available',
              section: 'N/A',
              branch: 'N/A',
              locked: true,
              completed: false,
            ),
    );

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Mastery Quiz Topic: ${currentTopic.title}',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: correctController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Correct answers',
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: totalController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Total questions',
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: currentTopic.id == 'none'
                ? null
                : () async {
                    final canTake = controller.canTakeQuiz(currentTopic.id);
                    if (!canTake) {
                      final remaining = controller.quizCooldownRemaining(
                        currentTopic.id,
                      );
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              'Quiz locked. Retry in ${remaining?.inHours ?? 0}h ${remaining?.inMinutes.remainder(60) ?? 0}m.',
                            ),
                          ),
                        );
                      }
                      return;
                    }

                    final correct = int.tryParse(correctController.text.trim()) ?? 0;
                    final total = int.tryParse(totalController.text.trim()) ?? 0;
                    final score = await controller.submitMasteryQuiz(
                      topicId: currentTopic.id,
                      correct: correct,
                      total: total,
                    );
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(score < 0
                              ? 'Quiz unavailable during cooldown.'
                              : score >= 80
                              ? 'Passed ($score%). Topic skipped/unlocked.'
                              : 'Failed ($score%). Retry after practice.'),
                        ),
                      );
                    }
                  },
            icon: const Icon(Icons.quiz_outlined),
            label: const Text('Submit Quiz'),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: currentTopic.id == 'none'
                ? null
                : () => controller.generateQuizForTopic(currentTopic.id),
            icon: const Icon(Icons.auto_fix_high_outlined),
            label: const Text('Generate Quiz Questions'),
          ),
          const SizedBox(height: 12),
          const Text('Rule: Topic skipping requires at least 80% score.'),
          const SizedBox(height: 6),
          Text('Active branch: ${state.activeBranch ?? 'None'}'),
          Text('Current completion: ${(state.completionRatio * 100).toStringAsFixed(0)}%'),
          const SizedBox(height: 12),
          TextField(
            controller: sectionExamScoreController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Section exam score',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 8),
          FilledButton.tonalIcon(
            onPressed: () {
              final score = int.tryParse(sectionExamScoreController.text.trim()) ?? 0;
              controller.submitSectionExam(
                currentTopic.section == 'N/A' ? 'Foundations' : currentTopic.section,
                score,
              );
            },
            icon: const Icon(Icons.fact_check_outlined),
            label: const Text('Submit Section Exam'),
          ),
          if (state.sectionExamStatus.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(state.sectionExamStatus),
          ],
          if (state.generatedQuizQuestions.isNotEmpty) ...[
            const SizedBox(height: 12),
            const Text(
              'Generated Questions',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            ...state.generatedQuizQuestions.map(
              (q) => ListTile(
                dense: true,
                leading: const Icon(Icons.help_outline),
                title: Text(q),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _MentorTab extends ConsumerWidget {
  const _MentorTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(careerAiControllerProvider);
    final controller = ref.read(careerAiControllerProvider.notifier);

    Widget personaButton(MentorPersona persona, String label) {
      final selected = state.persona == persona;
      return ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => controller.setMentorPersona(persona),
      );
    }

    Widget emotionButton(EmotionState emotion, String label) {
      final selected = state.emotion == emotion;
      return ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => controller.setEmotion(emotion),
      );
    }

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Mentor Persona', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              personaButton(MentorPersona.wiseElder, 'Wise Elder'),
              personaButton(MentorPersona.careerCoach, 'Career Coach'),
              personaButton(MentorPersona.creativeGuide, 'Creative Guide'),
            ],
          ),
          const SizedBox(height: 16),
          const Text('Emotion Check-in', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              emotionButton(EmotionState.focused, 'Focused'),
              emotionButton(EmotionState.confused, 'Confused'),
              emotionButton(EmotionState.stressed, 'Stressed'),
              emotionButton(EmotionState.motivated, 'Motivated'),
            ],
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Text(
                state.mentorMessage.isEmpty
                    ? controller.generateMentorTip()
                    : state.mentorMessage,
              ),
            ),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: () => controller.refreshMentorMessage(),
            icon: const Icon(Icons.refresh),
            label: const Text('Refresh mentor response'),
          ),
          const SizedBox(height: 12),
          const Text('Career Simulations', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          ...controller.careerSimulations().map(
                (s) => ListTile(
                  dense: true,
                  leading: const Icon(Icons.play_circle_outline),
                  title: Text(s),
                ),
              ),
        ],
      ),
    );
  }
}

class _CommunityTab extends ConsumerWidget {
  const _CommunityTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.watch(careerAiControllerProvider);
    final controller = ref.read(careerAiControllerProvider.notifier);

    return Padding(
      padding: const EdgeInsets.all(16),
      child: ListView(
        children: [
          const Text('Peer Progress Wall', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          FutureBuilder<List<Map<String, dynamic>>>(
            future: controller.getLeaderboard(limit: 5),
            builder: (context, snapshot) {
              final fallback = const [
                ('Anonymous Learner A', 91),
                ('Anonymous Learner B', 87),
                ('Anonymous Learner C', 84),
              ];

              if (!snapshot.hasData || snapshot.data!.isEmpty) {
                return Column(
                  children: fallback
                      .map(
                        (entry) => Card(
                          child: ListTile(
                            leading: const Icon(Icons.emoji_events_outlined),
                            title: Text(entry.$1),
                            subtitle: Text('Progress score: ${entry.$2}%'),
                          ),
                        ),
                      )
                      .toList(),
                );
              }

              return Column(
                children: snapshot.data!
                    .map(
                      (entry) => Card(
                        child: ListTile(
                          leading: const Icon(Icons.emoji_events_outlined),
                          title: Text(entry['user_id']?.toString() ?? 'Anonymous'),
                          subtitle: Text(
                            'Progress score: ${(((entry['completion_ratio'] as num?) ?? 0) * 100).toStringAsFixed(0)}%',
                          ),
                        ),
                      ),
                    )
                    .toList(),
              );
            },
          ),
          const SizedBox(height: 12),
          const Text('Bangladesh Career Spotlight', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          FutureBuilder<List<String>>(
            future: controller.getSpotlight(),
            builder: (context, snapshot) {
              final items = snapshot.data?.isNotEmpty == true
                  ? snapshot.data!
                  : controller.localBangladeshSpotlight();
              return Column(
                children: items
                    .map(
                      (item) => Card(
                        child: ListTile(
                          leading: const Icon(Icons.public),
                          title: Text(item),
                        ),
                      ),
                    )
                    .toList(),
              );
            },
          ),
          const SizedBox(height: 12),
          const Text('Real-world Simulations', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          FutureBuilder<List<String>>(
            future: controller.getSimulations(),
            builder: (context, snapshot) {
              final items = snapshot.data?.isNotEmpty == true
                  ? snapshot.data!
                  : controller.careerSimulations();
              return Column(
                children: items
                    .map(
                      (item) => Card(
                        child: ListTile(
                          leading: const Icon(Icons.play_circle_outline),
                          title: Text(item),
                        ),
                      ),
                    )
                    .toList(),
              );
            },
          ),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: const Icon(Icons.group_add_outlined),
              title: const Text('Study Buddy Match'),
              subtitle: const Text('Matched with a peer on similar roadmap progress.'),
              trailing: FilledButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Study buddy matched.')),
                  );
                },
                child: const Text('Match'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ResumeTab extends ConsumerWidget {
  const _ResumeTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(careerAiControllerProvider);
    final controller = ref.read(careerAiControllerProvider.notifier);

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'AI-Powered Resume Preview',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              state.resumeMarkdown.isEmpty
                  ? controller.generateResumePreview()
                  : state.resumeMarkdown,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: [
              FilledButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Resume exported as PDF (simulated).')),
                  );
                },
                icon: const Icon(Icons.picture_as_pdf_outlined),
                label: const Text('Export PDF'),
              ),
              OutlinedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Resume exported as HTML (simulated).')),
                  );
                },
                icon: const Icon(Icons.html_outlined),
                label: const Text('Export HTML'),
              ),
              OutlinedButton.icon(
                onPressed: () => controller.refreshResumePreview(),
                icon: const Icon(Icons.refresh),
                label: const Text('Refresh from API'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text('Mini-certificates earned: ${state.completedMilestones.length}'),
        ],
      ),
    );
  }
}
