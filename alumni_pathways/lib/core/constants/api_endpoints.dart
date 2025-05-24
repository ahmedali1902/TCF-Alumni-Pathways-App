class ApiEndpoints {
  static const String baseUrl = 'http://104.248.233.145/api';
  static const String internetCheckUrl =
      'google.com'; // URL to check internet connectivity
  static const String register = '$baseUrl/register';
  static const String login = '$baseUrl/auth/login';
  static const String searchInstitute = '$baseUrl/institute';
  static const String getInstituteById = '$baseUrl/institute/';
}
