import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/services/analytics_service.dart';

class AgreementScreen extends ConsumerStatefulWidget {
  const AgreementScreen({super.key});

  @override
  ConsumerState<AgreementScreen> createState() => _AgreementScreenState();
}

class _AgreementScreenState extends ConsumerState<AgreementScreen> {
  bool _isChecked = false;
  bool _isLoading = false;

  // Should match what is checked in Splash
  static const String currentAgreementVersion = 'v1.0';

  Future<void> _handleAgree() async {
    if (!_isChecked) return;

    setState(() => _isLoading = true);

    try {
      final storage = ref.read(storageServiceProvider);
      await storage.setAgreementAccepted(currentAgreementVersion);

      await ref
          .read(analyticsServiceProvider)
          .logEvent('agreement_accepted');

      final isLimited = storage.isLimitedMode();
      if (isLimited) {
        await storage.clearLimitedMode();
      }

      if (mounted) {
        context.go(isLimited ? '/app' : '/auth');
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Spacer(),
              Text(
                'Welcome to\nCareerMentor',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Before we start, please review and accept our terms and privacy policy.',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const Spacer(),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Checkbox(
                    value: _isChecked,
                    onChanged: (val) {
                      setState(() => _isChecked = val == true);
                    },
                  ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 8.0),
                      child: RichText(
                        text: TextSpan(
                          style: Theme.of(context).textTheme.bodyMedium,
                          children: [
                            const TextSpan(text: 'I agree to the '),
                            TextSpan(
                              text: 'Terms of Service',
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.primary,
                                decoration: TextDecoration.underline,
                              ),
                              recognizer: TapGestureRecognizer()
                                ..onTap = () =>
                                    _launchUrl('https://example.com/terms'),
                            ),
                            const TextSpan(text: ' and '),
                            TextSpan(
                              text: 'Privacy Policy',
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.primary,
                                decoration: TextDecoration.underline,
                              ),
                              recognizer: TapGestureRecognizer()
                                ..onTap = () =>
                                    _launchUrl('https://example.com/privacy'),
                            ),
                            const TextSpan(text: '.'),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: FilledButton(
                  onPressed: _isChecked && !_isLoading ? _handleAgree : null,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('I Agree & Continue'),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
