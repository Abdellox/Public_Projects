/// Simple input validators used across forms.
class Validators {
  Validators._();

  static String? email(String? value) {
    if (value == null || value.trim().isEmpty) return 'Email is required';
    final ok = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value.trim());
    return ok ? null : 'Enter a valid email address';
  }

  static String? password(String? value) {
    if (value == null || value.isEmpty) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return null;
  }

  static String? required(String? value, {String label = 'This field'}) {
    if (value == null || value.trim().isEmpty) return '$label is required';
    return null;
  }

  static String? name(String? value) {
    if (value == null || value.trim().isEmpty) return 'Name is required';
    return null;
  }

  static String? url(String? value) {
    if (value == null || value.trim().isEmpty) return null; // optional
    final ok = Uri.tryParse(value.trim())?.hasScheme ?? false;
    return ok ? null : 'Enter a valid URL';
  }

  static String? phone(String? value) {
    if (value == null || value.trim().isEmpty) return null; // optional
    final ok = RegExp(r'^[+\d][\d\s\-()]{6,20}$').hasMatch(value.trim());
    return ok ? null : 'Enter a valid phone number';
  }
}
