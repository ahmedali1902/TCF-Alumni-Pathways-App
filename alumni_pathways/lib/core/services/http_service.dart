import 'dart:convert';
import 'dart:io';
import 'package:alumni_pathways/core/constants/api_endpoints.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiHandlerService {
  Future<bool> checkInternetConnection() async {
    try {
      final result = await InternetAddress.lookup(
        ApiEndpoints.internetCheckUrl,
      );
      return result.isNotEmpty && result[0].rawAddress.isNotEmpty;
    } on SocketException catch (_) {
      // print error
      return false;
    }
  }

  // GET request
  Future<dynamic> get({
    required String endpointURI,
    bool includeToken = true,
    String? contentType = 'application/json',
    Map<String, String>? additionalHeaders,
    Map<String, String>? queryParams,
  }) async {
    try {
      if (!await checkInternetConnection()) {
        throw Exception('No internet connection!');
      }
      Uri uri = Uri.parse(endpointURI).replace(queryParameters: queryParams);

      Map<String, String> headers = {'Content-Type': contentType!};

      if (includeToken) {
        final prefs = await SharedPreferences.getInstance();
        String? token = prefs.getString('token');
        headers['Authorization'] = 'Bearer $token';
      }

      if (additionalHeaders != null) {
        headers.addAll(additionalHeaders);
      }

      final http.Response response = await http.get(uri, headers: headers);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return jsonDecode(_parseResponse(response));
      } else {
        throw Exception(
          'Error: ${response.statusCode} ${response.reasonPhrase}',
        );
      }
    } catch (e) {
      rethrow;
    }
  }

  // POST request
  Future<dynamic> post({
    required String endpointURI,
    bool includeToken = true,
    String? contentType = 'application/json',
    Map<String, String>? additionalHeaders,
    Map<String, dynamic>? body,
  }) async {
    try {
      if (!await checkInternetConnection()) {
        throw Exception('No internet connection!');
      }
      Map<String, String> headers = {'Content-Type': contentType!};

      if (includeToken) {
        final prefs = await SharedPreferences.getInstance();
        String? token = prefs.getString('token');
        headers['Authorization'] = 'Bearer $token';
      }

      if (additionalHeaders != null) {
        headers.addAll(additionalHeaders);
      }

      final http.Response response = await http.post(
        Uri.parse(endpointURI),
        headers: headers,
        body: jsonEncode(body),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return _parseResponse(response);
      } else {
        throw Exception(
          'Error: ${response.statusCode} ${response.reasonPhrase}',
        );
      }
    } catch (e) {
      rethrow;
    }
  }

  // Parse the response based on the content type
  dynamic _parseResponse(http.Response response) {
    final contentType = response.headers['content-type'];
    if (contentType != null && contentType.contains('application/json')) {
      return response.body; // Assuming JSON response, you may need to parse it
    } else {
      return response.body; // For other content types, return raw body
    }
  }

  void dispose() {
    // Dispose any resources
  }
}
