/// A chat message in a match or team conversation.
class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.matchId,
    required this.senderId,
    this.senderName,
    this.text,
    this.isSystem = false,
    this.createdAt,
  });

  final String id;
  final String matchId;
  final String senderId;
  final String? senderName;
  final String? text;
  final bool isSystem;
  final DateTime? createdAt;

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String,
      matchId: (json['match_id'] ?? json['conversation_id']) as String,
      senderId: (json['sender_id'] ?? json['user_id']) as String,
      senderName: json['sender_name'] as String?,
      text: json['text'] as String? ?? json['content'] as String?,
      isSystem: json['is_system'] as bool? ?? false,
      createdAt: json['created_at'] == null ? null : DateTime.parse(json['created_at']).toLocal(),
    );
  }

  Map<String, dynamic> toJson() => {
        'match_id': matchId,
        'sender_id': senderId,
        'text': text,
        'is_system': isSystem,
        'created_at': createdAt?.toUtc().toIso8601String(),
      };
}

/// An in-app notification for the current user.
class AppNotification {
  const AppNotification({
    required this.id,
    this.type,
    this.title,
    this.body,
    this.matchId,
    this.read = false,
    this.createdAt,
  });

  final String id;
  final String? type;
  final String? title;
  final String? body;
  final String? matchId;
  final bool read;
  final DateTime? createdAt;

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String,
      type: json['type'] as String?,
      title: json['title'] as String?,
      body: json['body'] as String?,
      matchId: json['match_id'] as String?,
      read: json['read'] as bool? ?? false,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at']).toLocal(),
    );
  }
}
