import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, TargetPlatform;

// TODO: Replace the placeholder values with your Firebase project configuration.
// You can generate this file automatically with: flutterfire configure
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        return windows;
      case TargetPlatform.linux:
        return linux;
      case TargetPlatform.fuchsia:
        return android;
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyB_eBBEkt9hSFQQqlC9hfl6uqyhmfatyc8',
    appId: '1:1005282274454:android:0507fc0ae2b6dcefefe6b7',
    messagingSenderId: '1005282274454',
    projectId: 'career-mentor-ai-2026',
    storageBucket: 'career-mentor-ai-2026.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAJ-_Khj2Yv_dAIzsqvvMOiJX1sYgC3Ydw',
    appId: '1:1005282274454:ios:ab880464f212ae6defe6b7',
    messagingSenderId: '1005282274454',
    projectId: 'career-mentor-ai-2026',
    storageBucket: 'career-mentor-ai-2026.firebasestorage.app',
    iosBundleId: 'com.example.careermentor',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyAJ-_Khj2Yv_dAIzsqvvMOiJX1sYgC3Ydw',
    appId: '1:1005282274454:ios:ab880464f212ae6defe6b7',
    messagingSenderId: '1005282274454',
    projectId: 'career-mentor-ai-2026',
    storageBucket: 'career-mentor-ai-2026.firebasestorage.app',
    iosBundleId: 'com.example.careermentor',
  );

  static const FirebaseOptions windows = FirebaseOptions(
    apiKey: 'AIzaSyBMmBgnHbjCBLHmjNyOcJPgTRqKPIhihjE',
    appId: '1:1005282274454:web:bcf4fccdf4b58d91efe6b7',
    messagingSenderId: '1005282274454',
    projectId: 'career-mentor-ai-2026',
    authDomain: 'career-mentor-ai-2026.firebaseapp.com',
    storageBucket: 'career-mentor-ai-2026.firebasestorage.app',
  );

  static const FirebaseOptions linux = FirebaseOptions(
    apiKey: 'REPLACE_ME',
    appId: 'REPLACE_ME',
    messagingSenderId: 'REPLACE_ME',
    projectId: 'REPLACE_ME',
    storageBucket: 'REPLACE_ME',
  );
}