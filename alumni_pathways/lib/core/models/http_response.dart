class HttpResponse {
  final bool success;
  final String message;
  final Map<String, dynamic> data;

  HttpResponse({
    required this.success,
    required this.message,
    required this.data,
  });

  @override
  String toString() {
    return 'HttpResponse(success: $success, message: $message, data: $data)';
  }

  factory HttpResponse.fromJson(Map<String, dynamic> json) {
    return HttpResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] ?? {},
    );
  }
}