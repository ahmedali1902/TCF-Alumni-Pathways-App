import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/colors.dart';
import '../../../widgets/card.dart';
import '../repository/notification_repository.dart';
import '../domain/notification_model.dart';
import '../../../core/services/http_service.dart';
import '../repository/notification_repository.dart';
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});
  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}
class _NotificationsScreenState extends State<NotificationsScreen> {
  // State variables for API data
  List<AppNotification> _notifications = [];
  bool _isLoading = true;
  String? _errorMessage;
  late NotificationsRepository _notificationsRepository;
  // Consistent icon for all notifications
  final IconData _notificationIcon = LucideIcons.bell;
  @override
  void initState() {
    super.initState();
    _notificationsRepository = NotificationsRepository(ApiHandlerService());
    _fetchNotifications();
  }
  // Fetch notifications from API
  Future<void> _fetchNotifications() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
      final notifications = await _notificationsRepository.getNotifications();
      setState(() {
        _notifications = notifications;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load notifications: ${e.toString()}';
        _isLoading = false;
      });
    }
  }
  // Pull to refresh functionality
  Future<void> _onRefresh() async {
    await _fetchNotifications();
  }
  // Function to format time based on your requirements
  String _formatTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    if (difference.inHours < 24) {
      // Less than 24 hours: "x hours ago"
      if (difference.inMinutes < 60) {
        if (difference.inMinutes == 0) {
          return 'Just now';
        }
        return '${difference.inMinutes} minute${difference.inMinutes != 1 ? 's' : ''} ago';
      }
      return '${difference.inHours} hour${difference.inHours != 1 ? 's' : ''} ago';
    } else if (difference.inDays < 7) {
      // Less than 7 days: "Weekday name + time" (e.g., "Friday 8pm")
      final weekday = _getWeekdayName(dateTime.weekday);
      final hour = dateTime.hour;
      final period = hour >= 12 ? 'pm' : 'am';
      final displayHour = hour > 12
          ? hour - 12
          : hour == 0
          ? 12
          : hour;
      return '$weekday $displayHour$period';
    } else {
      // More than 7 days: Full date (e.g., "Jan 12, 2024")
      final month = _getMonthName(dateTime.month);
      return '$month ${dateTime.day}, ${dateTime.year}';
    }
  }
  String _getWeekdayName(int weekday) {
    switch (weekday) {
      case 1:
        return 'Monday';
      case 2:
        return 'Tuesday';
      case 3:
        return 'Wednesday';
      case 4:
        return 'Thursday';
      case 5:
        return 'Friday';
      case 6:
        return 'Saturday';
      case 7:
        return 'Sunday';
      default:
        return '';
    }
  }
  String _getMonthName(int month) {
    switch (month) {
      case 1:
        return 'Jan';
      case 2:
        return 'Feb';
      case 3:
        return 'Mar';
      case 4:
        return 'Apr';
      case 5:
        return 'May';
      case 6:
        return 'Jun';
      case 7:
        return 'Jul';
      case 8:
        return 'Aug';
      case 9:
        return 'Sep';
      case 10:
        return 'Oct';
      case 11:
        return 'Nov';
      case 12:
        return 'Dec';
      default:
        return '';
    }
  }
  Widget _buildNotificationItem(AppNotification notification) {
    return TCard(
      height: 110,
      leftIcon: CircleAvatar(
        backgroundColor: TAppColors.primary.withOpacity(0.2),
        child: Icon(
          _notificationIcon,
          color: TAppColors.primary,
        ),
      ),
      textWidget: SizedBox(
        height: 100, // Fixed height for vertical centering
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              notification.title,
              style: Theme.of(context).textTheme.titleSmall,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Text(
              '${notification.content} — ${_formatTime(notification.createdAt)}',
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
  Widget _buildContent() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          color: TAppColors.primary,
          strokeWidth: 4,
        ),
      );
    }
    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              LucideIcons.alertCircle,
              size: 48,
              color: Colors.red.shade400,
            ),
            const SizedBox(height: 16),
            Text(
              _errorMessage!,
              style: const TextStyle(
                fontSize: 16,
                color: Colors.red,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _fetchNotifications,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }
    if (_notifications.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              LucideIcons.bell,
              size: 48,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: 16),
            const Text(
              "No notifications yet",
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: _onRefresh,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: _notifications
                .map((notification) => _buildNotificationItem(notification))
                .toList(),
          ),
        ),
      ),
    );
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Notifications",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            fontFamily: 'Inter',
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: _fetchNotifications,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _buildContent(),
    );
  }
}