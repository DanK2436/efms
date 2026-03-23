import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/annonce.dart';
import '../models/request.dart';
import 'dart:io';

class ApiService extends ChangeNotifier {
  final SupabaseClient _supabase = Supabase.instance.client;
  final FlutterLocalNotificationsPlugin _notifications = FlutterLocalNotificationsPlugin();

  ApiService() {
    _initNotifications();
    _listenToNewRequests();
  }

  // --- NOTIFICATIONS ---
  Future<void> _initNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const initSettings = InitializationSettings(android: androidSettings);
    await _notifications.initialize(initSettings);
  }

  void _listenToNewRequests() {
    _supabase
        .from('requests')
        .stream(primaryKey: ['id'])
        .listen((List<Map<String, dynamic>> data) {
          if (data.isNotEmpty) {
            final latest = data.first;
            // On vérifie si c'est une nouvelle demande (moins de 10 secondes)
            final createdAt = DateTime.parse(latest['created_at']);
            if (DateTime.now().difference(createdAt).inSeconds < 10) {
              _showNotification(
                'Nouvelle demande !',
                '${latest['nom']} souhaite un devis pour : ${latest['service'] ?? 'Non spécifié'}',
              );
            }
          }
        });
  }

  Future<void> _showNotification(String title, String body) async {
    const androidDetails = AndroidNotificationDetails(
      'efms_channel', 'EFMS Notifications',
      importance: Importance.max,
      priority: Priority.high,
    );
    const details = NotificationDetails(android: androidDetails);
    await _notifications.show(0, title, body, details);
  }

  // --- ACTIONS ---
  Future<void> sendEmail(String email, String subject) async {
    final Uri params = Uri(
      scheme: 'mailto',
      path: email,
      query: 'subject=${Uri.encodeComponent(subject)}',
    );
    if (await canLaunchUrl(params)) {
      await launchUrl(params);
    } else {
      debugPrint('Impossible d\'ouvrir l\'application mail');
    }
  }

  // --- AUTH & DATA ---
  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('is_admin_logged_in') ?? false;
  }

  Future<bool> login(String email, String password) async {
    try {
      final response = await _supabase
          .from('users')
          .select()
          .eq('email', email)
          .eq('password', password)
          .maybeSingle();

      if (response != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('is_admin_logged_in', true);
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Login error: $e');
    }
    return false;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('is_admin_logged_in');
    notifyListeners();
  }

  Future<List<Annonce>> getAnnonces() async {
    final List<dynamic> data = await _supabase.from('annonces').select().order('created_at');
    return data.map((item) => Annonce.fromJson(item)).toList();
  }

  Future<List<ClientRequest>> getRequests() async {
    final List<dynamic> data = await _supabase.from('requests').select().order('created_at');
    return data.map((item) => ClientRequest.fromJson(item)).toList();
  }

  Future<bool> publishAnnonce(String titre, String contenu, File? media) async {
    try {
      String? mediaUrl;
      if (media != null) {
        final fileName = '${DateTime.now().millisecondsSinceEpoch}.jpg';
        await _supabase.storage.from('annonces-media').upload(fileName, media);
        mediaUrl = _supabase.storage.from('annonces-media').getPublicUrl(fileName);
      }
      await _supabase.from('annonces').insert({
        'titre': titre,
        'contenu': contenu,
        'media_url': mediaUrl,
        'media_type': media != null ? 'image' : null,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteAnnonce(String id) async {
    try {
      await _supabase.from('annonces').delete().eq('id', id);
      return true;
    } catch (e) { return false; }
  }

  Future<bool> deleteRequest(String id) async {
    try {
      await _supabase.from('requests').delete().eq('id', id);
      return true;
    } catch (e) { return false; }
  }
}
