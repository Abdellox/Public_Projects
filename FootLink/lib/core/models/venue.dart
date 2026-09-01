/// A football venue registered by a venue owner.
class Venue {
  const Venue({
    required this.id,
    this.ownerId,
    this.name,
    this.photoUrl,
    this.address,
    this.latitude,
    this.longitude,
    this.city,
    this.country,
    this.openingHours,
    this.price,
    this.numberOfFields = 1,
    this.isIndoor = false,
    this.facilities = const [],
    this.contactPhone,
    this.rating,
    this.distanceKm,
  });

  final String id;
  final String? ownerId;
  final String? name;
  final String? photoUrl;
  final String? address;
  final double? latitude;
  final double? longitude;
  final String? city;
  final String? country;
  final String? openingHours;
  final double? price;
  final int numberOfFields;
  final bool isIndoor;
  final List<String> facilities;
  final String? contactPhone;
  final double? rating;
  final double? distanceKm;

  factory Venue.fromJson(Map<String, dynamic> json) {
    return Venue(
      id: json['id'] as String,
      ownerId: json['owner_id'] as String?,
      name: json['name'] as String?,
      photoUrl: json['photo_url'] as String?,
      address: json['address'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      city: json['city'] as String?,
      country: json['country'] as String?,
      openingHours: json['opening_hours'] as String?,
      price: (json['price'] as num?)?.toDouble(),
      numberOfFields: (json['number_of_fields'] as num?)?.toInt() ?? 1,
      isIndoor: json['is_indoor'] as bool? ?? false,
      facilities: (json['facilities'] as List?)?.cast<String>() ?? const [],
      contactPhone: json['contact_phone'] as String?,
      rating: (json['rating'] as num?)?.toDouble(),
    );
  }

  Venue copyWith({double? distanceKm}) {
    return Venue(
      id: id,
      ownerId: ownerId,
      name: name,
      photoUrl: photoUrl,
      address: address,
      latitude: latitude,
      longitude: longitude,
      city: city,
      country: country,
      openingHours: openingHours,
      price: price,
      numberOfFields: numberOfFields,
      isIndoor: isIndoor,
      facilities: facilities,
      contactPhone: contactPhone,
      rating: rating,
      distanceKm: distanceKm ?? this.distanceKm,
    );
  }
}
