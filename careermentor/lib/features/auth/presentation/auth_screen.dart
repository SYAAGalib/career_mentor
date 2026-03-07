import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../data/auth_repository.dart';
import '../../../core/services/analytics_service.dart';
import '../../../core/services/database_service.dart';
import '../../../core/services/storage_service.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key});

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLogin = true;
  bool _isLoading = false;

  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final authRepo = ref.read(authRepositoryProvider);
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    try {
      if (_isLogin) {
        await authRepo.signInWithEmailAndPassword(email, password);
      } else {
        await authRepo.createUserWithEmailAndPassword(email, password);
      }

      final userId = authRepo.currentUserId;
      final storage = ref.read(storageServiceProvider);
      final database = ref.read(databaseServiceProvider);

      if (userId != null) {
        final agreementVersion = storage.getAgreementVersion();
        final agreementAcceptedAt = storage.getAgreementTimestamp();

        await database.setDocument(
          collection: 'users',
          docId: userId,
          data: {
            'uid': userId,
            if (!_isLogin) 'createdAt': FieldValue.serverTimestamp(),
            if (_isLogin) 'lastLoginAt': FieldValue.serverTimestamp(),
            if (agreementVersion != null)
              'agreementVersion': agreementVersion,
            if (agreementAcceptedAt != null)
              'agreementAcceptedAt': agreementAcceptedAt,
          },
          merge: true,
        );
      }

      await ref
          .read(analyticsServiceProvider)
          .logEvent(_isLogin ? 'login' : 'sign_up');

      if (mounted) {
        context.go('/app');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: ${e.toString()}')));
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _resetPassword() async {
    if (_emailController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter your email to reset password.')),
      );
      return;
    }
    try {
      await ref
          .read(authRepositoryProvider)
          .sendPasswordResetEmail(_emailController.text.trim());
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Password reset email sent.')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_isLogin ? 'Login' : 'Create Account')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.isEmpty || !value.contains('@')) {
                    return 'Please enter a valid email';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                decoration: const InputDecoration(
                  labelText: 'Password',
                  border: OutlineInputBorder(),
                ),
                obscureText: true,
                validator: (value) {
                  if (value == null || value.length < 6) {
                    return 'Password must be at least 6 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: FilledButton(
                  onPressed: _isLoading ? null : _submit,
                  child: _isLoading
                      ? const CircularProgressIndicator()
                      : Text(_isLogin ? 'Login' : 'Sign Up'),
                ),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () {
                  setState(() => _isLogin = !_isLogin);
                },
                child: Text(
                  _isLogin
                      ? 'Need an account? Sign Up'
                      : 'Have an account? Login',
                ),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: _isLogin ? _resetPassword : null,
                child: const Text('Forgot password?'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
