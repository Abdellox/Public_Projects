// Domain enums used across FootLink.
//
// These mirror the values that can be stored in the database. Keeping them in
// Dart makes validation and filtering simple and type-safe.

/// A player's primary football position.
enum Position {
  goalkeeper('GK'),
  defender('DEF'),
  midfielder('MID'),
  winger('WNG'),
  striker('ST'),
  flexible('FLEX');

  final String code;
  const Position(this.code);
}

/// A player's self-declared skill level.
enum SkillLevel {
  beginner,
  casual,
  intermediate,
  advanced;

  int get order => index;
}

/// Preferred football format (team size).
enum MatchFormat {
  fiveASide('5', 5),
  sevenASide('7', 7),
  nineASide('9', 9),
  elevenASide('11', 11);

  final String label;
  final int teamSize;
  const MatchFormat(this.label, this.teamSize);
}

/// The current lifecycle status of a match.
enum MatchStatus {
  draft,
  open,
  almostFull,
  full,
  started,
  finished,
  cancelled,
}

/// A match can be open to everyone or by approval only.
enum JoinPolicy {
  open,
  approval,
  inviteOnly,
}

/// Whether a match costs money to join.
enum FeeType {
  free,
  paid,
}

/// Whether a match is played indoors or outdoors.
enum FieldType {
  indoor,
  outdoor,
}

/// The type of a football match.
enum MatchType {
  friendly,
  league,
  tournament,
  training,
}
