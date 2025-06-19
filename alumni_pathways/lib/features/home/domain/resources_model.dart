class Resource {
  final String id;
  final String title;
  final String? content;
  final String? link;
  final int educationLevel;
  final int category;

  Resource({
    required this.id,
    required this.title,
    this.content,
    this.link,
    required this.educationLevel,
    required this.category,
  });

  /// Factory constructor to create a Resource from a JSON map
  factory Resource.fromJson(Map<String, dynamic> json) {
    return Resource(
      id: json['id'] as String,
      title: json['title'] as String,
      content: json['content'] as String?,
      link: json['link'] as String?,
      educationLevel: json['education_level'] as int,
      category: json['category'] as int,
    );
  }

  /// Converts a Resource object to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'link': link,
      'education_level': educationLevel,
      'category': category,
    };
  }

  /// Optional: Clone with updated fields
  Resource copyWith({
    String? id,
    String? title,
    String? content,
    String? link,
    int? educationLevel,
    int? category,
  }) {
    return Resource(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      link: link ?? this.link,
      educationLevel: educationLevel ?? this.educationLevel,
      category: category ?? this.category,
    );
  }

  @override
  String toString() {
    return 'Resource(id: $id, title: $title, content: $content, link: $link, educationLevel: $educationLevel, category: $category)';
  }
}
