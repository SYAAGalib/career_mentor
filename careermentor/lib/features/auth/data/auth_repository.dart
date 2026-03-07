import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

abstract class AuthRepository {
  /// Returns the current user's ID or email, or null if not logged in.
  String? get currentUserId;

  /// Helper to check simple status
  bool get isAuthenticated => currentUserId != null;

  Future<void> signInWithEmailAndPassword(String email, String password);
  Future<void> createUserWithEmailAndPassword(String email, String password);
  Future<void> sendPasswordResetEmail(String email);
  Future<void> signOut();
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  throw UnimplementedError('Provider must be overridden');
});

// --- Real Implementation ---
class FirebaseAuthRepository implements AuthRepository {
  final FirebaseAuth _firebaseAuth;

  FirebaseAuthRepository(this._firebaseAuth);

  @override
  String? get currentUserId => _firebaseAuth.currentUser?.uid;

  @override
  bool get isAuthenticated => currentUserId != null;

  @override
  Future<void> signInWithEmailAndPassword(String email, String password) async {
    await _firebaseAuth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
  }

  @override
  Future<void> createUserWithEmailAndPassword(
    String email,
    String password,
  ) async {
    await _firebaseAuth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
  }

  @override
  Future<void> sendPasswordResetEmail(String email) async {
    await _firebaseAuth.sendPasswordResetEmail(email: email);
  }

  @override
  Future<void> signOut() async {
    await _firebaseAuth.signOut();
  }
}

// --- Mock Implementation ---
class MockAuthRepository implements AuthRepository {
  String? _mockUserId;

  MockAuthRepository({bool startSignedIn = false}) {
    if (startSignedIn) _mockUserId = 'mock-user-123';
  }

  @override
  String? get currentUserId => _mockUserId;

  @override
  bool get isAuthenticated => currentUserId != null;

  @override
  Future<void> signInWithEmailAndPassword(String email, String password) async {
    await Future.delayed(const Duration(seconds: 1)); // Simulate network
    if (email == 'fail') throw Exception('Mock Login Error');
    _mockUserId = 'mock-user-id-from-login';
  }

  @override
  Future<void> createUserWithEmailAndPassword(
    String email,
    String password,
  ) async {
    await Future.delayed(const Duration(seconds: 1));
    _mockUserId = 'mock-new-user-id';
  }

  @override
  Future<void> sendPasswordResetEmail(String email) async {
    await Future.delayed(const Duration(seconds: 1));
  }

  @override
  Future<void> signOut() async {
    _mockUserId = null;
  }
}
