import 'package:alumni_pathways/core/constants/colors.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';

class FirebaseNotificationService {
  final _firebaseMessaging = FirebaseMessaging.instance;
  final _firebaseLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();
  
  // Add a global navigator key reference
  static GlobalKey<NavigatorState>? navigatorKey;

  // Static method to handle background messages
  static Future<void> _firebaseMessagingBackgroundHandler(
    RemoteMessage message,
  ) async {
    debugPrint('Background Message: ${message.messageId}');
    debugPrint('Background Title: ${message.notification?.title}');
    debugPrint('Background Body: ${message.notification?.body}');
    debugPrint('Background Data: ${message.data}');
  }

  Future<void> initializeFirebaseMessaging() async {
    // Request permission for notifications
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('User granted permission');
    } else {
      debugPrint('User declined or has not accepted permission');
    }

    // Get the FCM token and save to SharedPreferences
    String? token = await _firebaseMessaging.getToken();
    if (token != null) {
      debugPrint('FCM Token: $token');
      await _saveFCMToken(token);
    }

    // Initialize local notifications
    await _initializeLocalNotifications();

    // Set up message handlers
    await _setupMessageHandlers();
  }

  Future<void> _saveFCMToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('fcm_token', token);
    debugPrint('FCM Token saved to SharedPreferences');
  }

  Future<String?> getFCMToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('fcm_token');
  }

  Future<void> _initializeLocalNotifications() async {
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings(
          '@drawable/ic_launcher_foreground',
        ); // Your custom app logo

    const DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
          requestAlertPermission: true,
          requestBadgePermission: true,
          requestSoundPermission: true,
        );

    const InitializationSettings initializationSettings =
        InitializationSettings(
          android: initializationSettingsAndroid,
          iOS: initializationSettingsIOS,
        );

    await _firebaseLocalNotificationsPlugin.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Create notification channel for Android (high priority)
    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      'high_importance_channel',
      'High Importance Notifications',
      description: 'This channel is used for important notifications.',
      importance: Importance.high,
      ledColor: TAppColors.primary,
    );

    await _firebaseLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >()
        ?.createNotificationChannel(channel);
  }

  Future<void> _setupMessageHandlers() async {
    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('Foreground Message: ${message.messageId}');
      debugPrint('Foreground Title: ${message.notification?.title}');
      debugPrint('Foreground Body: ${message.notification?.body}');
      debugPrint('Foreground Data: ${message.data}');

      _showLocalNotification(message);
    });

    // Handle notification when app is opened from terminated state
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('App opened from notification: ${message.messageId}');
      debugPrint('Opened Title: ${message.notification?.title}');
      debugPrint('Opened Body: ${message.notification?.body}');
      debugPrint('Opened Data: ${message.data}');
      
      // Navigate to notifications screen
      _navigateToNotifications();
    });

    // Check for initial message when app is launched from notification
    RemoteMessage? initialMessage =
        await _firebaseMessaging.getInitialMessage();
    if (initialMessage != null) {
      debugPrint('App launched from notification: ${initialMessage.messageId}');
      debugPrint('Launched Title: ${initialMessage.notification?.title}');
      debugPrint('Launched Body: ${initialMessage.notification?.body}');
      debugPrint('Launched Data: ${initialMessage.data}');
      
      // Navigate to notifications screen after a small delay to ensure app is ready
      Future.delayed(const Duration(milliseconds: 500), () {
        _navigateToNotifications();
      });
    }
  }

  Future<void> _showLocalNotification(RemoteMessage message) async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
          'high_importance_channel',
          'High Importance Notifications',
          channelDescription:
              'This channel is used for important notifications.',
          importance: Importance.high,
          priority: Priority.high,
          icon: '@drawable/ic_launcher_foreground', // Your custom app logo
          showWhen: true,
          color: TAppColors.primary,
        );

    const DarwinNotificationDetails iOSPlatformChannelSpecifics =
        DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        );

    const NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
      iOS: iOSPlatformChannelSpecifics,
    );

    await _firebaseLocalNotificationsPlugin.show(
      message.hashCode,
      message.notification?.title ?? 'New Notification',
      message.notification?.body ?? 'You have a new message',
      platformChannelSpecifics,
      payload: message.data.toString(),
    );
  }

  void _onNotificationTapped(NotificationResponse notificationResponse) {
    debugPrint('Notification tapped!');
    debugPrint('Notification ID: ${notificationResponse.id}');
    debugPrint('Notification Payload: ${notificationResponse.payload}');

    // Parse and print the notification content
    if (notificationResponse.payload != null) {
      debugPrint('Notification Data: ${notificationResponse.payload}');
    }
    
    // Navigate to notifications screen
    _navigateToNotifications();
  }

  void _navigateToNotifications() {
    if (navigatorKey?.currentContext != null) {
      // Clear the entire navigation stack and navigate to the main screen with notifications tab
      Navigator.of(navigatorKey!.currentContext!).pushNamedAndRemoveUntil(
        '/', // Your main route
        (route) => false, // Remove all routes
        arguments: {'initialIndex': 1}, // Pass the notifications tab index
      );
    }
  }

  void dispose() {
    // Dispose any resources if needed
  }
}