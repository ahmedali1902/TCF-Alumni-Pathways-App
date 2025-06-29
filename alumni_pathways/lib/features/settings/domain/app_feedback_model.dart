class AppFeedbackModel {
  final String userName;
  final int reasonType;
  final String reasonIfOther;
  final int experienceRating;
  final bool isTcfAlumni;
  final String whatsappNumber;
  final String feedbackText;

  AppFeedbackModel({
    required this.userName,
    required this.reasonType,
    required this.reasonIfOther,
    required this.experienceRating,
    required this.isTcfAlumni,
    required this.whatsappNumber,
    required this.feedbackText,
  });

  // Factory constructor to create an instance from JSON
  factory AppFeedbackModel.fromJson(Map<String, dynamic> json) {
    return AppFeedbackModel(
      userName: json['user_name'] ?? '',
      reasonType: json['reason_type'] ?? 0,
      reasonIfOther: json['reason_if_other'] ?? '',
      experienceRating: json['experience_rating'] ?? 0,
      isTcfAlumni: json['is_tcf_alumni'] ?? false,
      whatsappNumber: json['whatsapp_number'] ?? '',
      feedbackText: json['feedback_text'] ?? '',
    );
  }

  // Method to convert the instance to JSON
  Map<String, dynamic> toJson() {
    return {
      'user_name': userName,
      'reason_type': reasonType,
      'reason_if_other': reasonIfOther,
      'experience_rating': experienceRating,
      'is_tcf_alumni': isTcfAlumni,
      'whatsapp_number': whatsappNumber,
      'feedback_text': feedbackText,
    };
  }

  // Method to create a copy of the instance with updated values
  AppFeedbackModel copyWith({
    String? userName,
    int? reasonType,
    String? reasonIfOther,
    int? experienceRating,
    bool? isTcfAlumni,
    String? whatsappNumber,
    String? feedbackText,
  }) {
    return AppFeedbackModel(
      userName: userName ?? this.userName,
      reasonType: reasonType ?? this.reasonType,
      reasonIfOther: reasonIfOther ?? this.reasonIfOther,
      experienceRating: experienceRating ?? this.experienceRating,
      isTcfAlumni: isTcfAlumni ?? this.isTcfAlumni,
      whatsappNumber: whatsappNumber ?? this.whatsappNumber,
      feedbackText: feedbackText ?? this.feedbackText,
    );
  }

  // Override toString for better debugging
  @override
  String toString() {
    return 'AppFeedbackModel(userName: $userName, reasonType: $reasonType, reasonIfOther: $reasonIfOther, experienceRating: $experienceRating, isTcfAlumni: $isTcfAlumni, whatsappNumber: $whatsappNumber, feedbackText: $feedbackText)';
  }

  // Override equality operators
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AppFeedbackModel &&
        other.userName == userName &&
        other.reasonType == reasonType &&
        other.reasonIfOther == reasonIfOther &&
        other.experienceRating == experienceRating &&
        other.isTcfAlumni == isTcfAlumni &&
        other.whatsappNumber == whatsappNumber &&
        other.feedbackText == feedbackText;
  }

  @override
  int get hashCode {
    return userName.hashCode ^
        reasonType.hashCode ^
        reasonIfOther.hashCode ^
        experienceRating.hashCode ^
        isTcfAlumni.hashCode ^
        whatsappNumber.hashCode ^
        feedbackText.hashCode;
  }
}
