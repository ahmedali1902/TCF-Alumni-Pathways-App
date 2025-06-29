import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/constants/colors.dart';
import '../../../widgets/card.dart';
import '../repository/notification_repository.dart';
import '../domain/notification_model.dart';
import '../../../core/services/http_service.dart';

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

  // Notification permission state
  bool _notificationsEnabled = true;

  // Consistent icon for all notifications
  final IconData _notificationIcon = LucideIcons.bell;
  @override
  void initState() {
    super.initState();
    _notificationsRepository = NotificationsRepository(ApiHandlerService());
    _checkNotificationPermissions();
    _fetchNotifications();
  }

  // Check notification permissions
  Future<void> _checkNotificationPermissions() async {
    try {
      final messaging = FirebaseMessaging.instance;
      final settings = await messaging.getNotificationSettings();
      setState(() {
        _notificationsEnabled =
            settings.authorizationStatus == AuthorizationStatus.authorized;
      });
    } catch (e) {
      debugPrint('Error checking notification permissions: $e');
      setState(() {
        _notificationsEnabled = false;
      });
    }
  }

  // Request notification permissions
  Future<void> _requestNotificationPermissions() async {
    try {
      // Open app settings directly for the user to manually enable notifications
      await openAppSettings();

      // After returning from settings, check permissions again
      Future.delayed(const Duration(milliseconds: 500), () {
        _checkNotificationPermissions();
      });
    } catch (e) {
      debugPrint('Error opening app settings: $e');
      // Fallback to Firebase permission request if opening settings fails
      try {
        final messaging = FirebaseMessaging.instance;
        final settings = await messaging.requestPermission(
          alert: true,
          badge: true,
          sound: true,
        );
        debugPrint(
          'Notification permission status: ${settings.authorizationStatus}',
        );
        setState(() {
          _notificationsEnabled =
              settings.authorizationStatus == AuthorizationStatus.authorized;
        });
      } catch (fallbackError) {
        debugPrint('Error with fallback permission request: $fallbackError');
      }
    }
  }

  Widget _buildNotificationPermissionBanner() {
    if (_notificationsEnabled) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      color:
          Theme.of(context).brightness == Brightness.dark
              ? Colors.orange[900]?.withOpacity(0.3)
              : Colors.orange[50],
      child: Row(
        children: [
          Icon(
            LucideIcons.bellOff,
            size: 18,
            color:
                Theme.of(context).brightness == Brightness.dark
                    ? Colors.orange[300]
                    : Colors.orange[700],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Notifications are disabled",
                  style: TextStyle(
                    color:
                        Theme.of(context).brightness == Brightness.dark
                            ? Colors.orange[300]
                            : Colors.orange[700],
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  "Enable notifications to receive important updates about institutes and events.",
                  style: TextStyle(
                    color:
                        Theme.of(context).brightness == Brightness.dark
                            ? Colors.orange[400]
                            : Colors.orange[600],
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          TextButton(
            onPressed: _requestNotificationPermissions,
            style: TextButton.styleFrom(
              foregroundColor:
                  Theme.of(context).brightness == Brightness.dark
                      ? Colors.orange[300]
                      : Colors.orange[700],
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            ),
            child: const Text(
              "Settings",
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
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

  // Function to format time based on current week logic
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
    } else if (_isInCurrentWeek(dateTime, now)) {
      // Within current week: "Weekday name + time" (e.g., "Friday 8pm")
      final weekday = _getWeekdayName(dateTime.weekday);
      final hour = dateTime.hour;
      final period = hour >= 12 ? 'pm' : 'am';
      final displayHour =
          hour > 12
              ? hour - 12
              : hour == 0
              ? 12
              : hour;
      return '$weekday $displayHour$period';
    } else {
      // Outside current week: Full date (e.g., "Jan 12, 2024")
      final month = _getMonthName(dateTime.month);
      return '$month ${dateTime.day}, ${dateTime.year}';
    }
  }

  // Helper function to check if a date is in the current week (Monday to Sunday)
  bool _isInCurrentWeek(DateTime dateTime, DateTime now) {
    // Get the start of current week (Monday)
    final startOfWeek = now.subtract(Duration(days: now.weekday - 1));
    final startOfWeekDate = DateTime(
      startOfWeek.year,
      startOfWeek.month,
      startOfWeek.day,
    );

    // Get the end of current week (Sunday)
    final endOfWeekDate = startOfWeekDate.add(
      Duration(days: 6, hours: 23, minutes: 59, seconds: 59),
    );

    return dateTime.isAfter(
          startOfWeekDate.subtract(Duration(milliseconds: 1)),
        ) &&
        dateTime.isBefore(endOfWeekDate.add(Duration(milliseconds: 1)));
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
      height: 120,
      isDateTimeCard: true, // Enable WhatsApp-style layout
      leftIcon: CircleAvatar(
        backgroundColor: TAppColors.primary.withOpacity(0.2),
        child: Icon(_notificationIcon, color: TAppColors.primary),
      ),
      textWidget: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // First row: Title and Date with space between
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    notification.title,
                    style: Theme.of(context).textTheme.titleSmall,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Text(
                  _formatTime(notification.createdAt),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            // Second row: Body content
            Row(
              children: [
                Expanded(
                  child: Text(
                    notification.content,
                    style: Theme.of(
                      context,
                    ).textTheme.bodySmall?.copyWith(color: Colors.grey),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
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
            Icon(LucideIcons.alertCircle, size: 48, color: Colors.red.shade400),
            const SizedBox(height: 16),
            Text(
              _errorMessage!,
              style: const TextStyle(fontSize: 16, color: Colors.red),
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
            Icon(LucideIcons.bell, size: 48, color: Colors.grey.shade400),
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
            children:
                _notifications
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
            onPressed: () {
              _checkNotificationPermissions();
              _fetchNotifications();
            },
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: Column(
        children: [
          _buildNotificationPermissionBanner(),
          Expanded(child: _buildContent()),
        ],
      ),
    );
  }
}
