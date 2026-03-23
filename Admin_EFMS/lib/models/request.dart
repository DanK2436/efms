class ClientRequest {
  final String id;
  final String nom;
  final String email;
  final String? telephone;
  final String? service;
  final String? vehicule;
  final String message;
  final DateTime createdAt;

  ClientRequest({
    required this.id,
    required this.nom,
    required this.email,
    this.telephone,
    this.service,
    this.vehicule,
    required this.message,
    required this.createdAt,
  });

  factory ClientRequest.fromJson(Map<String, dynamic> json) {
    return ClientRequest(
      id: json['id'].toString(),
      nom: json['nom'],
      email: json['email'],
      telephone: json['telephone'],
      service: json['service'],
      vehicule: json['vehicule'],
      message: json['message'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
