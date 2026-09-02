enum PriceRange {
  free,
  budget,
  moderate,
  expensive,
  luxury,
}

extension PriceRangeExtension on PriceRange {
  String get displayName {
    switch (this) {
      case PriceRange.free:
        return 'Free';
      case PriceRange.budget:
        return 'Budget';
      case PriceRange.moderate:
        return 'Moderate';
      case PriceRange.expensive:
        return 'Expensive';
      case PriceRange.luxury:
        return 'Luxury';
    }
  }

  String get symbol {
    switch (this) {
      case PriceRange.free:
        return 'Free';
      case PriceRange.budget:
        return '\$';
      case PriceRange.moderate:
        return '\$\$';
      case PriceRange.expensive:
        return '\$\$\$';
      case PriceRange.luxury:
        return '\$\$\$\$';
    }
  }

  static PriceRange fromString(String value) {
    return PriceRange.values.firstWhere(
      (range) => range.name == value,
      orElse: () => PriceRange.moderate,
    );
  }
}
