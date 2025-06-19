import 'package:alumni_pathways/features/home/domain/resources_model.dart';
import 'package:flutter/material.dart';

import '../../../core/constants/api_endpoints.dart';
import '../../../core/services/http_service.dart';

class HomeRepository {
  final ApiHandlerService _apiHandlerService;
  HomeRepository(this._apiHandlerService);
  // Constructor

  Future<List<Resource>> getResources(int educationLevel, int category) async {
    try {
      final response = await _apiHandlerService.get(
        includeToken: true,
        endpointURI: ApiEndpoints.getResources,
        queryParams: {
          'category': category.toString(),
          'education_level': educationLevel.toString()
        },
      );
      if (response['data']['data'] is List) {
        final List<dynamic> dataList = response['data']['data'];
        return dataList.map((e) => Resource.fromJson(e)).toList();
      } else {
        throw Exception('Failed to load resources');
      }
    } catch (e) {
      rethrow;
    }
  }
}
