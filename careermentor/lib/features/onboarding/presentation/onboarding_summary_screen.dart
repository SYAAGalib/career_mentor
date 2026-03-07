import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/services/analytics_service.dart';
import '../../../core/services/storage_service.dart';
import '../state/onboarding_controller.dart';

class OnboardingSummaryScreen extends ConsumerWidget {
  const OnboardingSummaryScreen({super.key});

  Future<void> _backToStart(WidgetRef ref, BuildContext context) async {
    await ref.read(storageServiceProvider).clearCanvasTransform();
    await ref.read(onboardingControllerProvider.notifier).reset();
    if (context.mounted) context.go('/app');
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(onboardingControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Summary'),
        actions: [
          TextButton(
            onPressed: () => _backToStart(ref, context),
            child: const Text('Back to Start'),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Great! Here’s what we captured:',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 16),
            Card(
              child: ListTile(
                title: const Text('Name'),
                subtitle: Text(state.answers.name),
              ),
            ),
            const SizedBox(height: 8),
            Card(
              child: ListTile(
                title: const Text('Career Goal'),
                subtitle: Text(state.answers.goal),
              ),
            ),
            const SizedBox(height: 8),
            Card(
              child: ListTile(
                title: const Text('Work Style'),
                subtitle: Text(state.answers.workStyle),
              ),
            ),
            const SizedBox(height: 8),
            Card(
              child: ListTile(
                title: const Text('Learning Style'),
                subtitle: Text(state.answers.learningStyle),
              ),
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: FilledButton(
                onPressed: () async {
                  await ref
                      .read(analyticsServiceProvider)
                      .logEvent('onboarding_completed');
                  await ref
                      .read(storageServiceProvider)
                      .setOnboardingCompleted();
                  await ref
                      .read(onboardingControllerProvider.notifier)
                      .setStage(OnboardingStage.initial);
                  if (context.mounted) context.go('/ai-hub');
                },
                child: const Text('Finish'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
