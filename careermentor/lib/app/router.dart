import 'package:go_router/go_router.dart';
import '../../features/onboarding/presentation/splash_screen.dart';
import '../../features/onboarding/presentation/agreement_screen.dart';
import '../../features/onboarding/presentation/onboarding_form_screen.dart';
import '../../features/onboarding/presentation/onboarding_summary_screen.dart';
import '../../features/auth/presentation/auth_screen.dart';
import '../../features/canvas/presentation/canvas_screen.dart';
import '../../features/ai/presentation/career_ai_hub_screen.dart';

final goRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (context, state) => const SplashScreen()),
    GoRoute(
      path: '/agreement',
      builder: (context, state) => const AgreementScreen(),
    ),
    GoRoute(
      path: '/onboarding',
      builder: (context, state) => const OnboardingFormScreen(),
    ),
    GoRoute(
      path: '/summary',
      builder: (context, state) => const OnboardingSummaryScreen(),
    ),
    GoRoute(path: '/auth', builder: (context, state) => const AuthScreen()),

    GoRoute(path: '/app', builder: (context, state) => const CanvasScreen()),
    GoRoute(path: '/ai-hub', builder: (context, state) => const CareerAiHubScreen()),
  ],
);
