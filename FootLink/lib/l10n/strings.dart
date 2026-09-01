import 'package:flutter/material.dart';

/// Localization keys for FootLink (English, French, Arabic).
///
/// A single compact map keeps the app easily maintainable without code
/// generation. Arabic is rendered right-to-left automatically.
class Strings {
  Strings._();

  static const List<Locale> supportedLocales = [
    Locale('en'),
    Locale('fr'),
    Locale('ar'),
  ];

  static const String en = 'en';
  static const String fr = 'fr';
  static const String ar = 'ar';

  /// Returns the current locale stored in the app, falling back to system.
  static String current(BuildContext context) {
    final loc = Localizations.localeOf(context).languageCode;
    return contains(loc) ? loc : 'en';
  }

  static bool contains(String code) => code == en || code == fr || code == ar;

  static String tr(BuildContext context, String key, {List<String> args = const []}) {
    final lang = current(context);
    var value = _map[key]?[lang] ?? _map[key]?[en] ?? key;
    for (var i = 0; i < args.length; i++) {
      value = value.replaceAll('{$i}', args[i]);
    }
    return value;
  }

  /// Localized translations: key -> {lang: text}.
  static const Map<String, Map<String, String>> _map = {
    'appName': {en: 'FootLink', fr: 'FootLink', ar: 'فوت لينك'},
    'tagline': {en: 'Find your team. Play nearby.', fr: 'Trouvez votre équipe. Jouez près de chez vous.', ar: 'اعثر على فريقك. العب قريباً.'},

    // Auth
    'welcome': {en: 'Welcome', fr: 'Bienvenue', ar: 'مرحباً'},
    'login': {en: 'Log in', fr: 'Se connecter', ar: 'تسجيل الدخول'},
    'register': {en: 'Create account', fr: 'Créer un compte', ar: 'إنشاء حساب'},
    'logout': {en: 'Log out', fr: 'Se déconnecter', ar: 'تسجيل الخروج'},
    'forgotPassword': {en: 'Forgot password?', fr: 'Mot de passe oublié ?', ar: 'نسيت كلمة المرور؟'},
    'resetPassword': {en: 'Reset password', fr: 'Réinitialiser le mot de passe', ar: 'إعادة تعيين كلمة المرور'},
    'email': {en: 'Email', fr: 'E-mail', ar: 'البريد الإلكتروني'},
    'password': {en: 'Password', fr: 'Mot de passe', ar: 'كلمة المرور'},
    'firstName': {en: 'First name / nickname', fr: 'Prénom / pseudo', ar: 'الاسم الأول / اللقب'},
    'confirmPassword': {en: 'Confirm password', fr: 'Confirmer le mot de passe', ar: 'تأكيد كلمة المرور'},
    'signUpSubtitle': {en: 'Join thousands of players nearby', fr: 'Rejoignez des milliers de joueurs près de chez vous', ar: 'انضم إلى آلاف اللاعبين القريبين منك'},
    'welcomeSubtitle': {en: 'Play football with people in your city.', fr: 'Jouez au football avec des gens de votre ville.', ar: 'العب كرة القدم مع أشخاص في مدينتك.'},
    'haveAccount': {en: 'Already have an account?', fr: 'Vous avez déjà un compte ?', ar: 'لديك حساب بالفعل؟'},

    // Navigation
    'home': {en: 'Home', fr: 'Accueil', ar: 'الرئيسية'},
    'explore': {en: 'Explore', fr: 'Explorer', ar: 'استكشف'},
    'create': {en: 'Create', fr: 'Créer', ar: 'إنشاء'},
    'teams': {en: 'Teams', fr: 'Équipes', ar: 'الفرق'},
    'profile': {en: 'Profile', fr: 'Profil', ar: 'الملف الشخصي'},

    // Home
    'nearbyMatches': {en: 'Nearby matches', fr: 'Matchs à proximité', ar: 'المباريات القريبة'},
    'matchesToday': {en: 'Happening today', fr: 'Aujourd\'hui', ar: 'اليوم'},
    'thisWeek': {en: 'This week', fr: 'Cette semaine', ar: 'هذا الأسبوع'},
    'recommendedTeams': {en: 'Recommended teams', fr: 'Équipes recommandées', ar: 'الفرق المقترحة'},
    'nearbyVenues': {en: 'Nearby venues', fr: 'Terrain à proximité', ar: 'الملاعب القريبة'},
    'findMatch': {en: 'Find a Match', fr: 'Trouver un match', ar: 'ابحث عن مباراة'},
    'createMatch': {en: 'Create Match', fr: 'Créer un match', ar: 'إنشاء مباراة'},
    'joinTeam': {en: 'Join a Team', fr: 'Rejoindre une équipe', ar: 'انضم إلى فريق'},
    'searchPlaceholder': {en: 'Search city or venue…', fr: 'Rechercher une ville ou un terrain…', ar: 'ابحث عن مدينة أو ملعب…'},
    'currentCity': {en: 'Current city', fr: 'Ville actuelle', ar: 'المدينة الحالية'},

    // Match
    'join': {en: 'Join', fr: 'Rejoindre', ar: 'انضمام'},
    'joined': {en: 'Joined', fr: 'Rejoint', ar: 'منضم'},
    'leave': {en: 'Leave', fr: 'Quitter', ar: 'مغادرة'},
    'report': {en: 'Report', fr: 'Signaler', ar: 'إبلاغ'},
    'block': {en: 'Block', fr: 'Bloquer', ar: 'حظر'},
    'share': {en: 'Share', fr: 'Partager', ar: 'مشاركة'},
    'distance': {en: 'Distance', fr: 'Distance', ar: 'المسافة'},
    'skillLevel': {en: 'Skill level', fr: 'Niveau', ar: 'مستوى المهارة'},
    'format': {en: 'Format', fr: 'Format', ar: 'النظام'},
    'playersJoined': {en: '{0}/{1} players', fr: '{0}/{1} joueurs', ar: '{0}/{1} لاعب'},
    'availableSpots': {en: '{0} spots left', fr: '{0} places restantes', ar: '{0} أماكن متبقية'},
    'status': {en: 'Status', fr: 'Statut', ar: 'الحالة'},
    'price': {en: 'Price', fr: 'Prix', ar: 'السعر'},
    'free': {en: 'Free', fr: 'Gratuit', ar: 'مجاني'},
    'paid': {en: 'Paid', fr: 'Payant', ar: 'مدفوع'},
    'indoor': {en: 'Indoor', fr: 'Intérieur', ar: 'داخلي'},
    'outdoor': {en: 'Outdoor', fr: 'Extérieur', ar: 'خارجي'},
    'organizer': {en: 'Organizer', fr: 'Organisateur', ar: 'المنظم'},
    'chat': {en: 'Chat', fr: 'Discussion', ar: 'الدردشة'},
    'rules': {en: 'Rules', fr: 'Règles', ar: 'القواعد'},
    'description': {en: 'Description', fr: 'Description', ar: 'الوصف'},
    'matchDetails': {en: 'Match details', fr: 'Détails du match', ar: 'تفاصيل المباراة'},
    'joinRequestSent': {en: 'Join request sent', fr: 'Demande envoyée', ar: 'تم إرسال طلب الانضمام'},
    'matchFull': {en: 'Match is full', fr: 'Match complet', ar: 'المباراة ممتلئة'},
    'approximate': {en: 'Approximate', fr: 'Approximatif', ar: 'تقريبي'},
    'timeZone': {en: 'Time zone', fr: 'Fuseau horaire', ar: 'المنطقة الزمنية'},
    'countdown': {en: 'Countdown', fr: 'Compte à rebours', ar: 'العد التنازلي'},
    'venue': {en: 'Venue', fr: 'Terrain', ar: 'الملعب'},
    'date': {en: 'Date', fr: 'Date', ar: 'التاريخ'},
    'time': {en: 'Time', fr: 'Heure', ar: 'الوقت'},

    // Profile
    'myProfile': {en: 'My profile', fr: 'Mon profil', ar: 'ملفي الشخصي'},
    'position': {en: 'Position', fr: 'Position', ar: 'المركز'},
    'matchesPlayed': {en: 'Matches', fr: 'Matchs', ar: 'المباريات'},
    'rating': {en: 'Rating', fr: 'Note', ar: 'التقييم'},
    'badges': {en: 'Badges', fr: 'Badges', ar: 'الشارات'},
    'languages': {en: 'Languages', fr: 'Langues', ar: 'اللغات'},
    'availability': {en: 'Availability', fr: 'Disponibilité', ar: 'التوفر'},
    'bio': {en: 'Bio', fr: 'Bio', ar: 'نبذة'},
    'editProfile': {en: 'Edit profile', fr: 'Modifier le profil', ar: 'تعديل الملف'},
    'city': {en: 'City', fr: 'Ville', ar: 'المدينة'},
    'country': {en: 'Country', fr: 'Pays', ar: 'البلد'},
    'preferredDistance': {en: 'Preferred distance', fr: 'Distance préférée', ar: 'المسافة المفضلة'},
    'age': {en: 'Age', fr: 'Âge', ar: 'العمر'},

    // Teams
    'createTeam': {en: 'Create team', fr: 'Créer une équipe', ar: 'إنشاء فريق'},
    'teamName': {en: 'Team name', fr: 'Nom de l\'équipe', ar: 'اسم الفريق'},
    'teamMembers': {en: 'Members', fr: 'Membres', ar: 'الأعضاء'},
    'teamDescription': {en: 'Team description', fr: 'Description de l\'équipe', ar: 'وصف الفريق'},
    'joinTeamRequest': {en: 'Join team', fr: 'Rejoindre l\'équipe', ar: 'انضم للفريق'},
    'requestToJoin': {en: 'Request to join', fr: 'Demander à rejoindre', ar: 'طلب الانضمام'},
    'teamRules': {en: 'Team rules', fr: 'Règles de l\'équipe', ar: 'قواعد الفريق'},
    'captain': {en: 'Captain', fr: 'Capitaine', ar: 'القائد'},

    // Misc
    'loading': {en: 'Loading…', fr: 'Chargement…', ar: 'جارٍ التحميل…'},
    'error': {en: 'Something went wrong', fr: 'Une erreur est survenue', ar: 'حدث خطأ ما'},
    'retry': {en: 'Retry', fr: 'Réessayer', ar: 'إعادة المحاولة'},
    'cancel': {en: 'Cancel', fr: 'Annuler', ar: 'إلغاء'},
    'save': {en: 'Save', fr: 'Enregistrer', ar: 'حفظ'},
    'next': {en: 'Next', fr: 'Suivant', ar: 'التالي'},
    'back': {en: 'Back', fr: 'Retour', ar: 'رجوع'},
    'submit': {en: 'Submit', fr: 'Envoyer', ar: 'إرسال'},
    'confirm': {en: 'Confirm', fr: 'Confirmer', ar: 'تأكيد'},
    'notifications': {en: 'Notifications', fr: 'Notifications', ar: 'الإشعارات'},
    'search': {en: 'Search', fr: 'Rechercher', ar: 'بحث'},
    'filters': {en: 'Filters', fr: 'Filtres', ar: 'التصفية'},
    'map': {en: 'Map', fr: 'Carte', ar: 'الخريطة'},
    'list': {en: 'List', fr: 'Liste', ar: 'قائمة'},
    'messages': {en: 'Messages', fr: 'Messages', ar: 'الرسائل'},
    'emptyState': {en: 'Nothing here yet', fr: 'Rien ici pour le moment', ar: 'لا يوجد شيء هنا بعد'},
    'darkMode': {en: 'Dark mode', fr: 'Mode sombre', ar: 'الوضع الداكن'},
    'lightMode': {en: 'Light mode', fr: 'Mode clair', ar: 'الوضع الفاتح'},
    'language': {en: 'Language', fr: 'Langue', ar: 'اللغة'},
    'settings': {en: 'Settings', fr: 'Paramètres', ar: 'الإعدادات'},
  };
}
