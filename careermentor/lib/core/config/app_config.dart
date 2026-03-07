class AppConfig {
  static const String aiApiKey = String.fromEnvironment('AI_API_KEY');
  static const String backendBaseUrl = String.fromEnvironment(
    'BACKEND_BASE_URL',
    defaultValue: 'http://127.0.0.1:8000',
  );
}
