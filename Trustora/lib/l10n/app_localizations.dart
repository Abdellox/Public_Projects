import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';
import 'app_localizations_fr.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en'),
    Locale('fr'),
  ];

  /// The application name
  ///
  /// In en, this message translates to:
  /// **'Trustora'**
  String get appName;

  /// The application tagline shown on welcome screen
  ///
  /// In en, this message translates to:
  /// **'Find people, places, products, and services you can trust.'**
  String get appTagline;

  /// Navigation label for home tab
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get home;

  /// Navigation label for explore tab
  ///
  /// In en, this message translates to:
  /// **'Explore'**
  String get explore;

  /// Navigation label for map tab
  ///
  /// In en, this message translates to:
  /// **'Map'**
  String get map;

  /// Navigation label for favorites tab
  ///
  /// In en, this message translates to:
  /// **'Favorites'**
  String get favorites;

  /// Navigation label for profile tab
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// Button label for logging in
  ///
  /// In en, this message translates to:
  /// **'Log In'**
  String get login;

  /// Button label for signing up
  ///
  /// In en, this message translates to:
  /// **'Sign Up'**
  String get register;

  /// Link to reset password
  ///
  /// In en, this message translates to:
  /// **'Forgot Password?'**
  String get forgotPassword;

  /// Label for email input field
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get email;

  /// Label for password input field
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// Label for full name input field
  ///
  /// In en, this message translates to:
  /// **'Full Name'**
  String get fullName;

  /// Label for confirm password input field
  ///
  /// In en, this message translates to:
  /// **'Confirm Password'**
  String get confirmPassword;

  /// Button label for logging out
  ///
  /// In en, this message translates to:
  /// **'Log Out'**
  String get logout;

  /// Search button and placeholder label
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get search;

  /// Filter button label
  ///
  /// In en, this message translates to:
  /// **'Filter'**
  String get filter;

  /// Sort button label
  ///
  /// In en, this message translates to:
  /// **'Sort'**
  String get sort;

  /// Save button label
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// Share button label
  ///
  /// In en, this message translates to:
  /// **'Share'**
  String get share;

  /// Report button label
  ///
  /// In en, this message translates to:
  /// **'Report'**
  String get report;

  /// Edit button label
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get edit;

  /// Delete button label
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get delete;

  /// Submit button label
  ///
  /// In en, this message translates to:
  /// **'Submit'**
  String get submit;

  /// Cancel button label
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// Confirm button label
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get confirm;

  /// Back navigation label
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get back;

  /// Next step button label
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get next;

  /// Badge indicating a verified listing
  ///
  /// In en, this message translates to:
  /// **'Verified'**
  String get verified;

  /// Badge indicating an unverified listing
  ///
  /// In en, this message translates to:
  /// **'Not Verified'**
  String get notVerified;

  /// Label for community reviewed listings
  ///
  /// In en, this message translates to:
  /// **'Community Reviewed'**
  String get communityReviewed;

  /// Section heading for reviews
  ///
  /// In en, this message translates to:
  /// **'Reviews'**
  String get reviews;

  /// Label for rating display
  ///
  /// In en, this message translates to:
  /// **'Rating'**
  String get rating;

  /// Label for distance display
  ///
  /// In en, this message translates to:
  /// **'Distance'**
  String get distance;

  /// Label for price display
  ///
  /// In en, this message translates to:
  /// **'Price'**
  String get price;

  /// Label for category filter or display
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get category;

  /// Label for location display
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get location;

  /// Section heading for categories
  ///
  /// In en, this message translates to:
  /// **'Categories'**
  String get categories;

  /// Section heading for highly rated nearby listings
  ///
  /// In en, this message translates to:
  /// **'Highly Rated Nearby'**
  String get highlyRatedNearby;

  /// Section heading for verified listings
  ///
  /// In en, this message translates to:
  /// **'Verified & Trusted'**
  String get verifiedTrusted;

  /// Section heading for recently added listings
  ///
  /// In en, this message translates to:
  /// **'Recently Added'**
  String get recentlyAdded;

  /// Section heading for popular services
  ///
  /// In en, this message translates to:
  /// **'Popular Services'**
  String get popularServices;

  /// Tab or section label for services
  ///
  /// In en, this message translates to:
  /// **'Services'**
  String get services;

  /// Tab or section label for products
  ///
  /// In en, this message translates to:
  /// **'Products'**
  String get products;

  /// Label for business opening hours
  ///
  /// In en, this message translates to:
  /// **'Opening Hours'**
  String get openingHours;

  /// Label for phone number
  ///
  /// In en, this message translates to:
  /// **'Phone'**
  String get phone;

  /// Label for website link
  ///
  /// In en, this message translates to:
  /// **'Website'**
  String get website;

  /// Label for physical address
  ///
  /// In en, this message translates to:
  /// **'Address'**
  String get address;

  /// Button to write a new review
  ///
  /// In en, this message translates to:
  /// **'Write a Review'**
  String get writeReview;

  /// Link to view all items in a section
  ///
  /// In en, this message translates to:
  /// **'View All'**
  String get viewAll;

  /// Prompt to write an honest review
  ///
  /// In en, this message translates to:
  /// **'Write an Honest Review'**
  String get writeHonestReview;

  /// Label for star rating selector
  ///
  /// In en, this message translates to:
  /// **'Star Rating'**
  String get starRating;

  /// Label for the user's own review
  ///
  /// In en, this message translates to:
  /// **'Your Review'**
  String get yourReview;

  /// Option to post a review anonymously
  ///
  /// In en, this message translates to:
  /// **'Anonymous'**
  String get anonymous;

  /// Button to submit a review
  ///
  /// In en, this message translates to:
  /// **'Submit Review'**
  String get submitReview;

  /// Button to edit user profile
  ///
  /// In en, this message translates to:
  /// **'Edit Profile'**
  String get editProfile;

  /// Section showing user's own reviews
  ///
  /// In en, this message translates to:
  /// **'My Reviews'**
  String get myReviews;

  /// Section showing user's saved listings
  ///
  /// In en, this message translates to:
  /// **'Saved Listings'**
  String get savedListings;

  /// Navigation label for settings
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// Settings option for language
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// Settings option for dark mode toggle
  ///
  /// In en, this message translates to:
  /// **'Dark Mode'**
  String get darkMode;

  /// Settings option for notifications
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notifications;

  /// Settings section for about information
  ///
  /// In en, this message translates to:
  /// **'About'**
  String get about;

  /// App version label
  ///
  /// In en, this message translates to:
  /// **'Version'**
  String get version;

  /// Message when search returns no results
  ///
  /// In en, this message translates to:
  /// **'No results found'**
  String get noResults;

  /// Message when user has no saved favorites
  ///
  /// In en, this message translates to:
  /// **'No favorites yet'**
  String get noFavorites;

  /// Generic loading indicator text
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get loading;

  /// Generic error message
  ///
  /// In en, this message translates to:
  /// **'Something went wrong'**
  String get error;

  /// Generic success message
  ///
  /// In en, this message translates to:
  /// **'Success!'**
  String get success;

  /// Button to retry a failed action
  ///
  /// In en, this message translates to:
  /// **'Try Again'**
  String get tryAgain;

  /// Instruction to pull down to refresh content
  ///
  /// In en, this message translates to:
  /// **'Pull to refresh'**
  String get pullToRefresh;

  /// Filter option to show all categories
  ///
  /// In en, this message translates to:
  /// **'All Categories'**
  String get allCategories;

  /// Filter option for minimum rating threshold
  ///
  /// In en, this message translates to:
  /// **'Minimum Rating'**
  String get minRating;

  /// Filter option to show only verified listings
  ///
  /// In en, this message translates to:
  /// **'Verified Only'**
  String get verifiedOnly;

  /// Label for sort options
  ///
  /// In en, this message translates to:
  /// **'Sort By'**
  String get sortBy;

  /// Sort option for best rated listings
  ///
  /// In en, this message translates to:
  /// **'Best Rated'**
  String get bestRated;

  /// Sort option for most reviewed listings
  ///
  /// In en, this message translates to:
  /// **'Most Reviewed'**
  String get mostReviewed;

  /// Sort option for nearest listings
  ///
  /// In en, this message translates to:
  /// **'Nearest'**
  String get nearest;

  /// Sort option for lowest price first
  ///
  /// In en, this message translates to:
  /// **'Lowest Price'**
  String get lowestPrice;

  /// Sort option for highest price first
  ///
  /// In en, this message translates to:
  /// **'Highest Price'**
  String get highestPrice;

  /// Dashboard stat for total listing views
  ///
  /// In en, this message translates to:
  /// **'Total Views'**
  String get totalViews;

  /// Dashboard stat for total reviews received
  ///
  /// In en, this message translates to:
  /// **'Total Reviews'**
  String get totalReviews;

  /// Dashboard stat for average rating
  ///
  /// In en, this message translates to:
  /// **'Average Rating'**
  String get averageRating;

  /// Button to edit a listing
  ///
  /// In en, this message translates to:
  /// **'Edit Listing'**
  String get editListing;

  /// Button to add a new service
  ///
  /// In en, this message translates to:
  /// **'Add Service'**
  String get addService;

  /// Button to manage listing photos
  ///
  /// In en, this message translates to:
  /// **'Manage Photos'**
  String get managePhotos;

  /// Label for the trust score metric
  ///
  /// In en, this message translates to:
  /// **'Trust Score'**
  String get trustScore;

  /// Link explaining trust score calculation
  ///
  /// In en, this message translates to:
  /// **'How is this calculated?'**
  String get howCalculated;

  /// Label for the verification badge
  ///
  /// In en, this message translates to:
  /// **'Verification Badge'**
  String get verificationBadge;

  /// Label for sponsored/promoted listings
  ///
  /// In en, this message translates to:
  /// **'Sponsored Listing'**
  String get sponsoredListing;

  /// Validation message for missing email
  ///
  /// In en, this message translates to:
  /// **'Email is required'**
  String get emailRequired;

  /// Validation message for invalid email format
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid email address'**
  String get invalidEmail;

  /// Validation message for short password
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 8 characters'**
  String get passwordTooShort;

  /// Validation message when passwords do not match
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match'**
  String get passwordsDoNotMatch;

  /// Validation message for missing name
  ///
  /// In en, this message translates to:
  /// **'Name is required'**
  String get nameRequired;

  /// Title on the welcome/onboarding screen
  ///
  /// In en, this message translates to:
  /// **'Welcome to Trustora'**
  String get welcomeTitle;

  /// Subtitle on the welcome/onboarding screen
  ///
  /// In en, this message translates to:
  /// **'Discover trusted people, places, products, and services around you.'**
  String get welcomeSubtitle;

  /// Button to begin onboarding
  ///
  /// In en, this message translates to:
  /// **'Get Started'**
  String get getStarted;

  /// Prompt for users who already have an account
  ///
  /// In en, this message translates to:
  /// **'Already have an account?'**
  String get alreadyHaveAccount;

  /// Prompt for users who need to create an account
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account?'**
  String get dontHaveAccount;

  /// Prompt to select account type during registration
  ///
  /// In en, this message translates to:
  /// **'Choose Your Account Type'**
  String get chooseUserType;

  /// Account type for individual/personal users
  ///
  /// In en, this message translates to:
  /// **'Individual'**
  String get individualUser;

  /// Account type for business owners
  ///
  /// In en, this message translates to:
  /// **'Business Owner'**
  String get businessOwner;

  /// Divider text before social login options
  ///
  /// In en, this message translates to:
  /// **'Or continue with'**
  String get orContinueWith;

  /// Button for Google sign-in
  ///
  /// In en, this message translates to:
  /// **'Continue with Google'**
  String get continueWithGoogle;

  /// Button for Apple sign-in
  ///
  /// In en, this message translates to:
  /// **'Continue with Apple'**
  String get continueWithApple;

  /// Button to initiate password reset
  ///
  /// In en, this message translates to:
  /// **'Reset Password'**
  String get resetPassword;

  /// Confirmation message after password reset email
  ///
  /// In en, this message translates to:
  /// **'Password reset email sent. Check your inbox.'**
  String get resetPasswordSent;

  /// Button to change password
  ///
  /// In en, this message translates to:
  /// **'Change Password'**
  String get changePassword;

  /// Label for current password input
  ///
  /// In en, this message translates to:
  /// **'Current Password'**
  String get currentPassword;

  /// Label for new password input
  ///
  /// In en, this message translates to:
  /// **'New Password'**
  String get newPassword;

  /// Button to save profile changes
  ///
  /// In en, this message translates to:
  /// **'Save Changes'**
  String get saveChanges;

  /// Title of discard changes dialog
  ///
  /// In en, this message translates to:
  /// **'Discard Changes?'**
  String get discardChanges;

  /// Body of discard changes dialog
  ///
  /// In en, this message translates to:
  /// **'You have unsaved changes. Are you sure you want to discard them?'**
  String get discardChangesMessage;

  /// Affirmative button label
  ///
  /// In en, this message translates to:
  /// **'Yes'**
  String get yes;

  /// Negative button label
  ///
  /// In en, this message translates to:
  /// **'No'**
  String get no;

  /// Label indicating business is currently open
  ///
  /// In en, this message translates to:
  /// **'Open Now'**
  String get openNow;

  /// Label indicating business is currently closed
  ///
  /// In en, this message translates to:
  /// **'Closed'**
  String get closed;

  /// Label showing when a business opens
  ///
  /// In en, this message translates to:
  /// **'Opens at {time}'**
  String opensAt(String time);

  /// Label showing when a business closes
  ///
  /// In en, this message translates to:
  /// **'Closes at {time}'**
  String closesAt(String time);

  /// Section heading for listing photos
  ///
  /// In en, this message translates to:
  /// **'Photos'**
  String get photos;

  /// Button to add a new photo
  ///
  /// In en, this message translates to:
  /// **'Add Photo'**
  String get addPhoto;

  /// Button to remove a photo
  ///
  /// In en, this message translates to:
  /// **'Remove Photo'**
  String get removePhoto;

  /// Button to report a listing
  ///
  /// In en, this message translates to:
  /// **'Report Listing'**
  String get reportListing;

  /// Label for report reason field
  ///
  /// In en, this message translates to:
  /// **'Reason for Report'**
  String get reportReason;

  /// Button to submit a report
  ///
  /// In en, this message translates to:
  /// **'Submit Report'**
  String get submitReport;

  /// Confirmation message after submitting a report
  ///
  /// In en, this message translates to:
  /// **'Report submitted. Thank you!'**
  String get reportSubmitted;

  /// Title of share listing dialog
  ///
  /// In en, this message translates to:
  /// **'Share Listing'**
  String get shareListing;

  /// Button to get directions to a location
  ///
  /// In en, this message translates to:
  /// **'Directions'**
  String get directions;

  /// Button to call a phone number
  ///
  /// In en, this message translates to:
  /// **'Call'**
  String get call;

  /// Button to visit listing website
  ///
  /// In en, this message translates to:
  /// **'Visit Website'**
  String get visitWebsite;

  /// Button to send an email
  ///
  /// In en, this message translates to:
  /// **'Send Email'**
  String get sendEmail;

  /// Label for user's current location
  ///
  /// In en, this message translates to:
  /// **'Your Location'**
  String get yourLocation;

  /// Prompt to enable location services
  ///
  /// In en, this message translates to:
  /// **'Enable Location Services'**
  String get enableLocation;

  /// Error message when location permission is denied
  ///
  /// In en, this message translates to:
  /// **'Location permission denied. Please enable it in settings.'**
  String get locationPermissionDenied;

  /// Message when device is offline
  ///
  /// In en, this message translates to:
  /// **'You are offline'**
  String get offline;

  /// Error message for network issues
  ///
  /// In en, this message translates to:
  /// **'Network error. Please check your connection.'**
  String get networkError;

  /// Error message for server issues
  ///
  /// In en, this message translates to:
  /// **'Server error. Please try again later.'**
  String get serverError;

  /// Button to delete user account
  ///
  /// In en, this message translates to:
  /// **'Delete Account'**
  String get deleteAccount;

  /// Confirmation message for account deletion
  ///
  /// In en, this message translates to:
  /// **'Are you sure? This action cannot be undone.'**
  String get deleteAccountConfirm;

  /// Link to privacy policy
  ///
  /// In en, this message translates to:
  /// **'Privacy Policy'**
  String get privacyPolicy;

  /// Link to terms of service
  ///
  /// In en, this message translates to:
  /// **'Terms of Service'**
  String get termsOfService;

  /// Button or section for contacting support
  ///
  /// In en, this message translates to:
  /// **'Contact Us'**
  String get contactUs;

  /// Section heading for recent activity
  ///
  /// In en, this message translates to:
  /// **'Recent Activity'**
  String get recentActivity;

  /// Link to see more content
  ///
  /// In en, this message translates to:
  /// **'See More'**
  String get seeMore;

  /// Link to see less content
  ///
  /// In en, this message translates to:
  /// **'See Less'**
  String get seeLess;

  /// Toast message when text is copied
  ///
  /// In en, this message translates to:
  /// **'Copied to clipboard'**
  String get copiedToClipboard;

  /// Prompt to write a review for a specific listing
  ///
  /// In en, this message translates to:
  /// **'Write a review for {name}'**
  String writeReviewFor(String name);

  /// Formatted review count
  ///
  /// In en, this message translates to:
  /// **'{count,plural, =0{No reviews} other{{count} reviews}}'**
  String reviewsCount(int count);

  /// Distance in meters
  ///
  /// In en, this message translates to:
  /// **'{distance} m away'**
  String metersAway(String distance);

  /// Distance in kilometers
  ///
  /// In en, this message translates to:
  /// **'{distance} km away'**
  String kilometersAway(String distance);

  /// Label for followers count
  ///
  /// In en, this message translates to:
  /// **'Followers'**
  String get followers;

  /// Label for following count
  ///
  /// In en, this message translates to:
  /// **'Following'**
  String get following;

  /// Button to follow a user or business
  ///
  /// In en, this message translates to:
  /// **'Follow'**
  String get follow;

  /// Button to unfollow a user or business
  ///
  /// In en, this message translates to:
  /// **'Unfollow'**
  String get unfollow;

  /// Label indicating an app update is available
  ///
  /// In en, this message translates to:
  /// **'Update Available'**
  String get updateAvailable;

  /// Button to rate the app on the store
  ///
  /// In en, this message translates to:
  /// **'Rate This App'**
  String get rateApp;

  /// Button to share the app with others
  ///
  /// In en, this message translates to:
  /// **'Share This App'**
  String get shareApp;

  /// Title of language selection dialog
  ///
  /// In en, this message translates to:
  /// **'Select Language'**
  String get selectLanguage;

  /// Report reason option for spam
  ///
  /// In en, this message translates to:
  /// **'Spam'**
  String get reportReasonSpam;

  /// Report reason option for inaccurate information
  ///
  /// In en, this message translates to:
  /// **'Inaccurate Information'**
  String get reportReasonInaccurate;

  /// Report reason option for offensive content
  ///
  /// In en, this message translates to:
  /// **'Offensive Content'**
  String get reportReasonOffensive;

  /// Report reason option for fake/fraudulent content
  ///
  /// In en, this message translates to:
  /// **'Fake or Fraudulent'**
  String get reportReasonFake;

  /// Report reason option for other reasons
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get reportReasonOther;

  /// Message when no reviews exist for a listing
  ///
  /// In en, this message translates to:
  /// **'No reviews yet. Be the first to review!'**
  String get noReviewsYet;

  /// Formatted listing count
  ///
  /// In en, this message translates to:
  /// **'{count,plural, =0{No listings} other{{count} listings}}'**
  String listingsCount(int count);

  /// Label showing member registration date
  ///
  /// In en, this message translates to:
  /// **'Member since {date}'**
  String memberSince(String date);
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en', 'fr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
    case 'fr':
      return AppLocalizationsFr();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
