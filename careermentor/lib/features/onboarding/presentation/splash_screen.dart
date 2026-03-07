import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../../core/services/storage_service.dart';
import '../../auth/data/auth_repository.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  bool _isOffline = false;
  bool _isChecking = true;

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    setState(() {
      _isChecking = true;
      _isOffline = false;
    });

    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) {
      if (mounted) {
        setState(() {
          _isOffline = true;
          _isChecking = false;
        });
      }
      return;
    }

    // Artificial delay for splash effect and to ensure services are ready
    await Future.delayed(const Duration(seconds: 2));

    if (!mounted) return;

    final storage = ref.read(storageServiceProvider);
    final authRepo = ref.read(authRepositoryProvider);

    // 1. Check Agreement
    // Define current agreement version here or in a constant
    const currentAgreementVersion = 'v1.0';
    final hasAccepted = storage.hasAcceptedAgreement(currentAgreementVersion);

    if (!hasAccepted) {
      if (mounted) context.go('/agreement');
      return;
    }

    // 2. Check Auth
    // We listen to the stream, but for splash we just check current state
    final isLoggedIn = authRepo.isAuthenticated;

    if (!isLoggedIn) {
      if (mounted) context.go('/auth');
    } else {
      final stage = storage.getOnboardingStage();
      if (stage == 'onboarding') {
        if (mounted) context.go('/onboarding');
      } else if (stage == 'summary') {
        if (mounted) context.go('/summary');
      } else {
        if (mounted) context.go('/app');
      }
    }

    if (mounted) {
      setState(() => _isChecking = false);
    }
  }

  Future<void> _continueLimited() async {
    final storage = ref.read(storageServiceProvider);
    await storage.setLimitedMode(true);
    if (mounted) context.go('/agreement');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: _isOffline
              ? Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.wifi_off, size: 48),
                    const SizedBox(height: 16),
                    Text(
                      'You are offline',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Retry with an internet connection or continue in limited mode.',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        OutlinedButton(
                          onPressed: _initialize,
                          child: const Text('Retry'),
                        ),
                        const SizedBox(width: 12),
                        FilledButton(
                          onPressed: _continueLimited,
                          child: const Text('Continue Limited'),
                        ),
                      ],
                    ),
                  ],
                )
              : Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (_isChecking) const CircularProgressIndicator(),
                    const SizedBox(height: 16),
                    const Text('CareerMentor'),
                  ],
                ),
        ),
      ),
    );
  }
}
