class Faculty {
  final String id;
  final String name;
  final double averageResultPercentageRequired;
  final int gender;
  final bool isDeleted;

  Faculty({
    required this.id,
    required this.name,
    required this.averageResultPercentageRequired,
    required this.gender,
    required this.isDeleted,
  });

  factory Faculty.fromJson(Map<String, dynamic> json) {
    return Faculty(
      id: json['id'],
      name: json['name'],
      // averageResultPercentageRequired: (json['average_result_percentage_required'] as num).toDouble(),
      averageResultPercentageRequired:
          json['average_result_percentage_required'] != null
              ? (json['average_result_percentage_required'] as num).toDouble()
              : 0.0,
      gender: json['gender'],
      isDeleted: json['is_deleted'],
    );
  }
}

class LocationPoint {
  final String type;
  final List<double> coordinates;

  LocationPoint({required this.type, required this.coordinates});

  factory LocationPoint.fromJson(Map<String, dynamic> json) {
    return LocationPoint(
      type: json['type'],
      coordinates: List<double>.from(
        json['coordinates'].map((x) => (x as num).toDouble()),
      ),
    );
  }
}

class InstituteDetails {
  final String id;
  final String name;
  final int managingAuthority;
  final LocationPoint location;
  final String description;
  final List<Faculty> faculties;
  final List<dynamic> userRatings;
  final double tcfRating;
  final bool isDeleted;
  final DateTime createdAt;
  final DateTime updatedAt;
  final double averageUserRating;

  InstituteDetails({
    required this.id,
    required this.name,
    required this.managingAuthority,
    required this.location,
    required this.description,
    required this.faculties,
    required this.userRatings,
    required this.tcfRating,
    required this.isDeleted,
    required this.createdAt,
    required this.updatedAt,
    required this.averageUserRating,
  });

  factory InstituteDetails.fromJson(Map<String, dynamic> json) {
    return InstituteDetails(
      id: json['id'],
      name: json['name'],
      managingAuthority: json['managing_authority'],
      location: LocationPoint.fromJson(json['location']),
      description: json['description'],
      faculties: List<Faculty>.from(
        json['faculties'].map((x) => Faculty.fromJson(x)),
      ),
      userRatings: List<dynamic>.from(json['user_ratings']),
      tcfRating: (json['tcf_rating'] as num).toDouble(),
      isDeleted: json['is_deleted'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      // averageUserRating: (json['average_user_rating'] as num).toDouble(),
      averageUserRating:
          json['average_user_rating'] != null
              ? (json['average_user_rating'] as num).toDouble()
              : 0.0,
    );
  }
}

class Institute {
  final String id;
  final String name;
  final int managingAuthority;
  final LocationPoint location;
  final String description;
  final double approxDistance;

  Institute({
    required this.id,
    required this.name,
    required this.managingAuthority,
    required this.location,
    required this.description,
    required this.approxDistance,
  });

  factory Institute.fromJson(Map<String, dynamic> json) {
    return Institute(
      id: json['id'],
      name: json['name'],
      managingAuthority: json['managing_authority'],
      location: LocationPoint.fromJson(json['location']),
      description: json['description'],
      approxDistance: (json['approx_distance'] as num).toDouble(),
    );
  }
}
