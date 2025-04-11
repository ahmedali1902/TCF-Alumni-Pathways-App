import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/colors.dart';
import '../../../widgets/card.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  // Notifications array in state with MongoDB-style _id and UTC time strings
  final List<Map<String, dynamic>> _notifications = [
    {
      '_id': '65a1b2c3d4e5f6g7h8i9j0k',
      'title':
          'Students, please check updated process to apply for the scholarship',
      'time': '2025-04-11T02:07:00Z', // UTC time string
    },
    {
      '_id': '75b2c3d4e5f6g7h8i9j0k1l',
      'title': 'New assignment posted',
      'time': '2025-01-11T14:15:00Z', // UTC time string
    },
    {
      '_id': '85c3d4e5f6g7h8i9j0k1l2m',
      'title': 'Class schedule updated',
      'time': '2025-01-09T10:45:00Z', // UTC time string
    },
  ];

  // Consistent icon for all notifications
  final IconData _notificationIcon = LucideIcons.bell;

  // Function to format time based on your requirements
  String _formatTime(String utcTimeString) {
    final utcTime = DateTime.parse(utcTimeString);
    final localTime = utcTime.toLocal();
    final now = DateTime.now();
    final difference = now.difference(localTime);

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
      final weekday = _getWeekdayName(localTime.weekday);
      final hour = localTime.hour;
      final period = hour >= 12 ? 'pm' : 'am';
      final displayHour =
          hour > 12
              ? hour - 12
              : hour == 0
              ? 12
              : hour;
      return '$weekday $displayHour$period';
    } else {
      // More than 7 days: Full date (e.g., "Jan 12, 2024")
      final month = _getMonthName(localTime.month);
      return '$month ${localTime.day}, ${localTime.year}';
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
      ),
      body:
          _notifications.isEmpty
              ? const Center(
                child: Text(
                  "No notifications yet",
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
              )
              : SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children:
                        _notifications.map((notification) {
                          return TCard(
                            height: 90,
                            leftIcon: CircleAvatar(
                              backgroundColor: TAppColors.primary.withOpacity(
                                0.2,
                              ),
                              child: Icon(
                                _notificationIcon,
                                color: TAppColors.primary,
                              ),
                            ),
                            textWidget: SizedBox(
                              height: 70, // Fixed height for vertical centering
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    notification['title'],
                                    style:
                                        Theme.of(context).textTheme.titleSmall,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _formatTime(notification['time']),
                                    style: Theme.of(context).textTheme.bodySmall
                                        ?.copyWith(color: Colors.grey),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                  ),
                ),
              ),
    );
  }
}
