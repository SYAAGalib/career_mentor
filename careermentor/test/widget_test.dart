import 'package:flutter_test/flutter_test.dart';
import 'package:careermentor/features/onboarding/state/onboarding_controller.dart';

void main() {
  test('Onboarding empty profile has psychometric defaults', () {
    expect(OnboardingAnswers.empty.workStyle, 'structured');
    expect(OnboardingAnswers.empty.learningStyle, 'project-based');
  });
}
