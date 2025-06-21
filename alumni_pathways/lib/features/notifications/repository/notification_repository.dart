import 'package:alumni_pathways/features/notifications/domain/notification_model.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/services/http_service.dart';
class NotificationsRepository {
  final ApiHandlerService _apiHandlerService;
  NotificationsRepository(this._apiHandlerService);
  // Constructor
  Future<List<AppNotification>> getNotifications() async {
    try {
      final response = await _apiHandlerService.get(
          includeToken: true,
          endpointURI: ApiEndpoints.getNotifications
      );
      if (response['data']['data'] is List) {
        final List<dynamic> dataList = response['data']['data'];
        return dataList.map((e) => AppNotification.fromJson(e)).toList();
      } else {
        throw Exception('Failed to load resources');
      }
    } catch (e) {
      rethrow;
    }
  }
}