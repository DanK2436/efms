class Annonce {
  final String id;
  final String titre;
  final String contenu;
  final String? mediaUrl;
  final String? mediaType;
  final DateTime createdAt;

  Annonce({
    required this.id,
    required this.titre,
    required this.contenu,
    this.mediaUrl,
    this.mediaType,
    required this.createdAt,
  });

  factory Annonce.fromJson(Map<String, dynamic> json) {
    return Annonce(
      id: json['id'].toString(),
      titre: json['titre'],
      contenu: json['contenu'],
      mediaUrl: json['media_url'],
      mediaType: json['media_type'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
