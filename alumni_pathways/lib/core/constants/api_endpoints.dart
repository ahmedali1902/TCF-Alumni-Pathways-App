class ApiEndpoints {
  static const String baseUrl = 'http://142.93.63.113/api/';
  static const String internetCheckUrl =
      'google.com'; // URL to check internet connectivity
  static const String register = '$baseUrl/register';
  static const String login = '$baseUrl/auth/login';
  static const String searchInstitute = '$baseUrl/institute';
  static const String getInstituteById = '$baseUrl/institute/';
  static const String getResources = '$baseUrl/resource';
  static const String addInstituteFeedback = '$baseUrl/institute/add-request';
  static const String getNotifications = '$baseUrl/notification';
  static const String addAppFeedback = '$baseUrl/app-feedback';
}
