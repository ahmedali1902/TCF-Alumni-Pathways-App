enum ManagingAuthority {
  public(1),
  private(2);

  const ManagingAuthority(this.value);
  final int value;

  static ManagingAuthority fromValue(int value) {
    return values.firstWhere((e) => e.value == value);
  }

  @override
  String toString() {
    switch (this) {
      case ManagingAuthority.public:
        return 'Public';
      case ManagingAuthority.private:
        return 'Private';
    }
  }
}

enum Gender {
  maleOnly(1),
  femaleOnly(2),
  coeducation(3);

  const Gender(this.value);
  final int value;

  static Gender fromValue(int value) {
    return values.firstWhere((e) => e.value == value);
  }

  @override
  String toString() {
    switch (this) {
      case Gender.maleOnly:
        return 'Male Only';
      case Gender.femaleOnly:
        return 'Female Only';
      case Gender.coeducation:
        return 'Coeducation';
    }
  }
}
