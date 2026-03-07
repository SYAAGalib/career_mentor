import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/services/analytics_service.dart';
import '../../../core/services/storage_service.dart';
import '../state/onboarding_controller.dart';

class OnboardingFormScreen extends ConsumerStatefulWidget {
  const OnboardingFormScreen({super.key});

  @override
  ConsumerState<OnboardingFormScreen> createState() =>
      _OnboardingFormScreenState();
}

class _OnboardingFormScreenState extends ConsumerState<OnboardingFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _goalController;
  String _workStyle = 'structured';
  String _learningStyle = 'project-based';

  @override
  void initState() {
    super.initState();
    final answers = ref.read(onboardingControllerProvider).answers;
    _nameController = TextEditingController(text: answers.name);
    _goalController = TextEditingController(text: answers.goal);
    _workStyle = answers.workStyle;
    _learningStyle = answers.learningStyle;
    ref.read(onboardingControllerProvider.notifier).setStage(
          OnboardingStage.onboarding,
        );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _goalController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final controller = ref.read(onboardingControllerProvider.notifier);
    await controller.saveAnswers(
      OnboardingAnswers(
        name: _nameController.text.trim(),
        goal: _goalController.text.trim(),
        workStyle: _workStyle,
        learningStyle: _learningStyle,
      ),
    );
    await controller.setStage(OnboardingStage.summary);
    await ref.read(analyticsServiceProvider).logEvent('onboarding_started');

    if (mounted) context.go('/summary');
  }

  Future<void> _backToStart() async {
    await ref.read(storageServiceProvider).clearCanvasTransform();
    await ref.read(onboardingControllerProvider.notifier).reset();
    if (mounted) context.go('/app');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Onboarding'),
        actions: [
          TextButton(
            onPressed: _backToStart,
            child: const Text('Back to Start'),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              Text(
                'Tell us a bit about you',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Your name',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter your name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _goalController,
                decoration: const InputDecoration(
                  labelText: 'Your career goal',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter a goal';
                  }
                  return null;
                },
                maxLines: 2,
              ),
              const SizedBox(height: 24),
              DropdownButtonFormField<String>(
                value: _workStyle,
                decoration: const InputDecoration(
                  labelText: 'Work style',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(value: 'structured', child: Text('Structured planner')),
                  DropdownMenuItem(value: 'autonomous', child: Text('Independent explorer')),
                  DropdownMenuItem(value: 'collaborative', child: Text('Collaborative teammate')),
                ],
                onChanged: (value) {
                  if (value == null) return;
                  setState(() => _workStyle = value);
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _learningStyle,
                decoration: const InputDecoration(
                  labelText: 'Learning style',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(value: 'project-based', child: Text('Project-based learner')),
                  DropdownMenuItem(value: 'theory-first', child: Text('Theory-first learner')),
                  DropdownMenuItem(value: 'mentored', child: Text('Mentor-guided learner')),
                ],
                onChanged: (value) {
                  if (value == null) return;
                  setState(() => _learningStyle = value);
                },
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: FilledButton(
                  onPressed: _submit,
                  child: const Text('Continue'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
