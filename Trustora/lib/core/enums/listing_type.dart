enum ListingType {
  business,
  professional,
  organization,
  product,
  service,
  place,
  onlineService,
}

extension ListingTypeExtension on ListingType {
  String get displayName {
    switch (this) {
      case ListingType.business:
        return 'Business';
      case ListingType.professional:
        return 'Professional';
      case ListingType.organization:
        return 'Organization';
      case ListingType.product:
        return 'Product';
      case ListingType.service:
        return 'Service';
      case ListingType.place:
        return 'Place';
      case ListingType.onlineService:
        return 'Online Service';
    }
  }

  String get iconName {
    switch (this) {
      case ListingType.business:
        return 'business';
      case ListingType.professional:
        return 'person';
      case ListingType.organization:
        return 'groups';
      case ListingType.product:
        return 'inventory_2';
      case ListingType.service:
        return 'handyman';
      case ListingType.place:
        return 'location_on';
      case ListingType.onlineService:
        return 'language';
    }
  }

  static ListingType fromString(String value) {
    return ListingType.values.firstWhere(
      (type) => type.name == value,
      orElse: () => ListingType.business,
    );
  }
}
