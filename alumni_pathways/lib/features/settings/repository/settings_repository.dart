import 'package:alumni_pathways/features/home/domain/resources_model.dart';
import 'package:flutter/material.dart';

import '../../../core/constants/api_endpoints.dart';
import '../../../core/services/http_service.dart';
import '../domain/institute_request_model.dart';

class SettingsRepository {
  final ApiHandlerService _apiHandlerService;
  SettingsRepository(this._apiHandlerService);
  // Constructor

  Future<void> addInstituteFeedback(InstituteRequest instituteRequest) async {
    try {
      await _apiHandlerService.post(
        includeToken: true,
        endpointURI: ApiEndpoints.addInstituteFeedback,
        body: instituteRequest.toJson(),
      );
    } catch (e) {
      rethrow;
    }
  }
}
