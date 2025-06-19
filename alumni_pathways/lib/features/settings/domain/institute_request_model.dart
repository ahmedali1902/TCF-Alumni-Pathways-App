class InstituteRequest {
  final String instituteName;
  final String facultyName;
  final String instituteAddress;
  final String instituteMapLink;

  InstituteRequest({
    required this.instituteName,
    required this.facultyName,
    required this.instituteAddress,
    required this.instituteMapLink,
  });

  /// Factory constructor to create an object from JSON
  factory InstituteRequest.fromJson(Map<String, dynamic> json) {
    return InstituteRequest(
      instituteName: json['institute_name'] as String,
      facultyName: json['faculty_name'] as String,
      instituteAddress: json['institute_address'] as String,
      instituteMapLink: json['institute_map_link'] as String,
    );
  }

  /// Converts object to JSON
  Map<String, dynamic> toJson() {
    return {
      'institute_name': instituteName,
      'faculty_name': facultyName,
      'institute_address': instituteAddress,
      'institute_map_link': instituteMapLink,
    };
  }

  @override
  String toString() {
    return 'InstituteRequest(instituteName: $instituteName, facultyName: $facultyName, instituteAddress: $instituteAddress, instituteMapLink: $instituteMapLink)';
  }
}
