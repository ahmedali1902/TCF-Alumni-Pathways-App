import 'package:flutter/material.dart';

import '../../../core/constants/api_endpoints.dart';
import '../../../core/services/http_service.dart';
import '../domain/institute_details.dart';

class InstituteSearchRepository {
  final ApiHandlerService _apiHandlerService;
  InstituteSearchRepository(this._apiHandlerService);
  // Constructor

  Future<List<Institute>> searchInstitutes(
    double longitude,
    double latitude,
    int distance,
  ) async {
    try {
      final response = await _apiHandlerService.get(
        includeToken: true,
        endpointURI: ApiEndpoints.searchInstitute,
        queryParams: {
          'longitude': longitude.toStringAsFixed(10),
          'latitude': latitude.toStringAsFixed(10),
          'distance_radius': distance.toString(),
        },
      );
      debugPrint({
        'longitude': longitude.toStringAsFixed(10),
        'latitude': latitude.toStringAsFixed(10),
        'distance_radius': distance.toString(),
      }.toString());
      if (response['data']['data'] is List) {
        final List<dynamic> dataList = response['data']['data'];
        return dataList.map((e) => Institute.fromJson(e)).toList();
      } else {
        throw Exception('Failed to load institutes');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<InstituteDetails> getInstituteById(String id) async {
    try {
      final response = await _apiHandlerService.get(
        includeToken: true,
        endpointURI: '${ApiEndpoints.getInstituteById}$id',
      );
      if (response['data'] is Map<String, dynamic>) {
        return InstituteDetails.fromJson(response['data']);
      } else {
        throw Exception('Failed to load institute details');
      }
    } catch (e) {
      rethrow;
    }
  }
}
