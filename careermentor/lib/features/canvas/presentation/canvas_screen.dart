import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../auth/data/auth_repository.dart';
import '../../../core/services/analytics_service.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/theme/theme_controller.dart';
import '../../../core/config/app_config.dart';
import '../../onboarding/state/onboarding_controller.dart';
import 'widgets/initial_stage_node.dart';

class CanvasScreen extends ConsumerStatefulWidget {
  const CanvasScreen({super.key});

  @override
  ConsumerState<CanvasScreen> createState() => _CanvasScreenState();
}

class _CanvasScreenState extends ConsumerState<CanvasScreen> {
  final TransformationController _transformationController =
      TransformationController();

  // Canvas config
  // We use a large coordinate system but center everything at (0,0) conceptually
  // InteractiveViewer uses a viewport.
  // To simulate "infinite" in v1, we can just give it a large constraint or use unbounded if careful.
  // For simplicity and performance in v1, we will use a large sized container.

  static const double _canvasSize = 5000.0;
  static const double _centerOffset = _canvasSize / 2;

  @override
  void initState() {
    super.initState();
    ref.read(analyticsServiceProvider).logEvent('canvas_opened');
    // Center the view on the Initial Node (which is at center of our large canvas)
    // We need to do this after build to get screen size, so we use postFrameCallback
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _restoreOrCenterCanvas();
    });
  }

  void _restoreOrCenterCanvas() {
    final storage = ref.read(storageServiceProvider);
    final stored = storage.getCanvasTransform();
    if (stored != null && stored.length == 16) {
      _transformationController.value = Matrix4.fromList(stored);
      return;
    }
    _centerCanvas();
  }

  Future<void> _centerCanvas() async {
    final size = MediaQuery.of(context).size;
    final viewportWidth = size.width;
    final viewportHeight = size.height;

    // We want the center of the canvas (_centerOffset, _centerOffset) to be at the center of the viewport
    final x = _centerOffset - viewportWidth / 2;
    final y = _centerOffset - viewportHeight / 2;

    _transformationController.value = Matrix4.identity()
      ..translate(-x, -y); // Negative because we move the content

    await _persistTransform();
  }

  Future<void> _persistTransform() async {
    final storage = ref.read(storageServiceProvider);
    final values = _transformationController.value.storage.toList();
    await storage.setCanvasTransform(values);
  }

  @override
  void dispose() {
    _transformationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('CareerMentor'),
        actions: [
          IconButton(
            icon: const Icon(Icons.psychology_alt_outlined),
            onPressed: () {
              context.go('/ai-hub');
            },
            tooltip: 'Open AI Hub',
          ),
          IconButton(
            icon: const Icon(Icons.key),
            onPressed: _showApiKeyDialog,
            tooltip: 'Set AI API Key',
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authRepositoryProvider).signOut();
              // Router will/should handle redirect if using stream redirect,
              // but we are manual for v1 splash:
              // Actually we should navigate manually to be safe for now
              if (mounted) {
                context.go('/auth');
              }
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          Positioned.fill(
            child: Container(
              color: Theme.of(context).colorScheme.background,
            ),
          ),
          Positioned.fill(
            child: GridPaper(
              color: Theme.of(context).brightness == Brightness.dark
                  ? Colors.white.withOpacity(0.08)
                  : Colors.black.withOpacity(0.06),
              interval: 100,
              subdivisions: 2,
            ),
          ),
          InteractiveViewer(
            transformationController: _transformationController,
            boundaryMargin: const EdgeInsets.all(
              double.infinity,
            ), // Truly infinite pan
            minScale: 0.1,
            maxScale: 2.0,
            constrained: false, // Allows child to be as big as it wants
            onInteractionEnd: (_) => _persistTransform(),
            child: SizedBox(
              width: _canvasSize,
              height: _canvasSize,
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  // Grid background (optional, simple one)
                  /*
                  Positioned.fill(
                    child: GridPaper(
                      color: Colors.grey.withOpacity(0.2),
                      interval: 100,
                    ),
                  ),
                  */

                  // The Content
                  // We position the Initial Node at the center
                  Positioned(
                    left:
                        _centerOffset -
                        150, // 150 is half of card width (approx)
                    top:
                        _centerOffset - 150, // Adjust center based on card size
                    child: InitialStageNode(
                      onStartTap: () {
                        ref
                            .read(onboardingControllerProvider.notifier)
                            .setStage(OnboardingStage.onboarding);
                        context.go('/onboarding');
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Back to Start overlay
          Positioned(
            bottom: 32,
            right: 32,
            child: FloatingActionButton.extended(
              onPressed: () async {
                await ref.read(storageServiceProvider).clearCanvasTransform();
                await ref
                    .read(onboardingControllerProvider.notifier)
                    .reset();
                await _centerCanvas();
              },
              icon: const Icon(Icons.center_focus_strong),
              label: const Text('Back to Start'),
            ),
          ),
          Positioned(
            bottom: 32,
            left: 32,
            child: FloatingActionButton(
              heroTag: 'theme-toggle',
              onPressed: () => ref.read(themeModeProvider.notifier).toggle(),
              child: Icon(
                Theme.of(context).brightness == Brightness.dark
                    ? Icons.light_mode
                    : Icons.dark_mode,
              ),
            ),
          ),
          Positioned(
            bottom: 32,
            child: SizedBox(
              width: MediaQuery.of(context).size.width,
              child: Align(
                alignment: Alignment.bottomCenter,
                child: FloatingActionButton.extended(
                  heroTag: 'open-ai-hub',
                  onPressed: () => context.go('/ai-hub'),
                  icon: const Icon(Icons.auto_awesome),
                  label: const Text('AI Hub'),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _showApiKeyDialog() async {
    final storage = ref.read(storageServiceProvider);
    final current = storage.getAiApiKey() ?? AppConfig.aiApiKey;
    final controller = TextEditingController(text: current);

    await showDialog<void>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('AI API Key'),
          content: TextField(
            controller: controller,
            decoration: const InputDecoration(
              labelText: 'Paste your API key',
            ),
            obscureText: true,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () async {
                await storage.setAiApiKey(controller.text.trim());
                if (mounted) Navigator.of(context).pop();
              },
              child: const Text('Save'),
            ),
          ],
        );
      },
    );
  }
}
