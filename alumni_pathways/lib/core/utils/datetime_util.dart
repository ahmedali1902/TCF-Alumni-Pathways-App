class DatetimeUtil {
  static DateTime parseDateTimeWithTimezone(String dateTimeString) {
    try {
      final hasTimezone =
          dateTimeString.endsWith('Z') ||
          dateTimeString.contains('+') ||
          dateTimeString.contains('-', 10); // skip year-month-day dash

      String processed = dateTimeString;

      if (!hasTimezone) {
        // Remove milliseconds and append Z
        processed = '${processed.replaceAll(RegExp(r'(\.\d{3,6})?$'), '')}Z';
      }

      return DateTime.parse(processed).toLocal();
    } catch (e) {
      // Fallback to raw parsing (may still fail)
      return DateTime.parse(dateTimeString).toLocal();
    }
  }
}
