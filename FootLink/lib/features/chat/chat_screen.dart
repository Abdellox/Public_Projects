import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/services/auth_service.dart';
import '../../core/services/supabase_service.dart';
import '../../core/models/message.dart';
import '../../l10n/strings.dart';
import '../explore/match_repository.dart';

/// Group chat for a single match.
class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key, required this.matchId, required this.matchTitle});

  final String matchId;
  final String matchTitle;

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _input = TextEditingController();
  final _scroll = ScrollController();
  List<ChatMessage> _messages = [];
  bool _loading = true;
  RealtimeChannel? _channel;

  @override
  void initState() {
    super.initState();
    _load();
    _subscribe();
  }

  @override
  void dispose() {
    _input.dispose();
    _scroll.dispose();
    _channel?.unsubscribe();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final rows = await SupabaseService.client
          .from('messages')
          .select()
          .eq('match_id', widget.matchId)
          .order('created_at', ascending: true)
          .limit(200);
      if (!mounted) return;
      setState(() {
        _messages = rows.map(ChatMessage.fromJson).toList();
        _loading = false;
      });
      _scrollToBottom();
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  void _subscribe() {
    _channel = SupabaseService.client.channel('match_${widget.matchId}');
    _channel!.onPostgresChanges(
      event: PostgresChangeEvent.insert,
      schema: 'public',
      table: 'messages',
      filter: PostgresChangeFilter(type: PostgresChangeFilterType.eq, column: 'match_id', value: widget.matchId),
      callback: (payload) {
        final row = payload.newRecord;
        final msg = ChatMessage.fromJson(row);
        if (mounted && !_messages.any((m) => m.id == msg.id)) {
          setState(() => _messages.add(msg));
          _scrollToBottom();
        }
      },
    );
    _channel!.subscribe();
  }

  Future<void> _send() async {
    final text = _input.text.trim();
    if (text.isEmpty) return;
    final profile = await AuthServiceProfile.current();
    _input.clear();
    await SupabaseService.client.from('messages').insert({
      'match_id': widget.matchId,
      'sender_id': profile == null ? '' : profile['id'],
      'text': text,
      'is_system': false,
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.jumpTo(_scroll.position.maxScrollExtent);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.matchTitle),
        actions: [
          IconButton(onPressed: () => _reportDialog(), icon: const Icon(Icons.flag_outlined)),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : (_messages.isEmpty
                    ? Center(child: Text(Strings.tr(context, 'emptyState')))
                    : ListView.builder(
                        controller: _scroll,
                        padding: const EdgeInsets.all(16),
                        itemCount: _messages.length,
                        itemBuilder: (context, i) => _bubble(_messages[i]),
                      )),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _input,
                      minLines: 1,
                      maxLines: 4,
                      textInputAction: TextInputAction.newline,
                      decoration: InputDecoration(
                        hintText: Strings.tr(context, 'messages'),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: _send,
                    icon: const Icon(Icons.send),
                    color: Colors.white,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _bubble(ChatMessage m) {
    final currentUserId = AuthService.instance.currentUser?.id;
    final mine = m.senderId == currentUserId;
    if (m.isSystem) {
      return Container(
        margin: const EdgeInsets.symmetric(vertical: 6),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(m.text ?? '', textAlign: TextAlign.center, style: const TextStyle(fontSize: 12)),
      );
    }
    return Align(
      alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: mine ? const Color(0xFF21D07A) : Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!mine) ...[
              Text(
                m.senderName ?? 'Player',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF21D07A)),
              ),
              const SizedBox(height: 2),
            ],
            Text(m.text ?? '', style: TextStyle(color: mine ? Colors.white : null)),
          ],
        ),
      ),
    );
  }

  void _reportDialog() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Report'),
        content: const Text('A moderator will review this conversation.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context), child: const Text('Submit')),
        ],
      ),
    );
  }
}
