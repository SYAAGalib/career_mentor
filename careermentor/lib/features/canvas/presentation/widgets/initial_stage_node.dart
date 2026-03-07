import 'package:flutter/material.dart';

class InitialStageNode extends StatelessWidget {
  final VoidCallback onStartTap;

  const InitialStageNode({super.key, required this.onStartTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: 300,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.map, size: 48, color: Colors.deepPurple),
            const SizedBox(height: 16),
            Text(
              'CareerMentor — Start Here',
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Commitment-based career guidance to help you start strong.',
              textAlign: TextAlign.center,
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: Colors.grey[600]),
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: onStartTap,
              icon: const Icon(Icons.rocket_launch),
              label: const Text('Start Onboarding'),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () {
                // TODO: Show How It Works modal
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('How it works: Magic!')),
                );
              },
              child: const Text('See How It Works'),
            ),
          ],
        ),
      ),
    );
  }
}
