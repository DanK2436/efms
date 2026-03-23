import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../models/annonce.dart';
import '../models/request.dart';
import 'login_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _picker = ImagePicker();
  
  final _annonceFormKey = GlobalKey<FormState>();
  final _titreController = TextEditingController();
  final _contenuController = TextEditingController();
  File? _selectedMedia;
  bool _isPublishing = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  Future<void> _pickMedia() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) setState(() => _selectedMedia = File(image.path));
  }

  Future<void> _publishAnnonce() async {
    if (!_annonceFormKey.currentState!.validate()) return;
    setState(() => _isPublishing = true);
    final success = await Provider.of<ApiService>(context, listen: false)
        .publishAnnonce(_titreController.text, _contenuController.text, _selectedMedia);
    if (mounted) {
      setState(() => _isPublishing = false);
      if (success) {
        _titreController.clear(); _contenuController.clear(); setState(() => _selectedMedia = null);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Publiée !'), backgroundColor: Color(0xFF7CCF2B)));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('EFMS Admin', style: TextStyle(fontWeight: FontWeight.w900)),
        actions: [
          IconButton(icon: const Icon(Icons.logout, color: Color(0xFFE63946)), 
          onPressed: () async {
            await Provider.of<ApiService>(context, listen: false).logout();
            if (mounted) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
          }),
        ],
        bottom: TabBar(controller: _tabController, indicatorColor: const Color(0xFF7CCF2B), tabs: const [Tab(text: 'Annonces'), Tab(text: 'Demandes')]),
      ),
      body: TabBarView(controller: _tabController, children: [_buildAnnoncesTab(), _buildRequestsTab()]),
    );
  }

  Widget _buildAnnoncesTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _buildPublishPanel(),
          const SizedBox(height: 24),
          _buildAnnoncesList(),
        ],
      ),
    );
  }

  Widget _buildPublishPanel() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: const Color(0xFF171C21), borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFF7CCF2B).withOpacity(0.2))),
      child: Form(key: _annonceFormKey, child: Column(children: [
        TextFormField(controller: _titreController, decoration: _inputDecoration('Titre'), validator: (v) => v!.isEmpty ? 'Requis' : null),
        const SizedBox(height: 12),
        TextFormField(controller: _contenuController, decoration: _inputDecoration('Contenu'), maxLines: 3, validator: (v) => v!.isEmpty ? 'Requis' : null),
        const SizedBox(height: 12),
        ListTile(leading: const Icon(Icons.image), title: Text(_selectedMedia == null ? 'Ajouter image' : 'Image sélectionnée'), onTap: _pickMedia),
        const SizedBox(height: 12),
        ElevatedButton(onPressed: _isPublishing ? null : _publishAnnonce, style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF7CCF2B), minimumSize: const Size(double.infinity, 50)), child: const Text('PUBLIER'))
      ])),
    );
  }

  Widget _buildAnnoncesList() {
    final api = Provider.of<ApiService>(context);
    return FutureBuilder<List<Annonce>>(
      future: api.getAnnonces(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const CircularProgressIndicator();
        return ListView.builder(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), itemCount: snapshot.data!.length, itemBuilder: (context, i) {
          final a = snapshot.data![i];
          return ListTile(title: Text(a.titre), trailing: IconButton(icon: const Icon(Icons.delete, color: Colors.red), onPressed: () async {
            if (await api.deleteAnnonce(a.id)) setState(() {});
          }));
        });
      },
    );
  }

  Widget _buildRequestsTab() {
    final api = Provider.of<ApiService>(context);
    return FutureBuilder<List<ClientRequest>>(
      future: api.getRequests(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        return ListView.builder(padding: const EdgeInsets.all(16), itemCount: snapshot.data!.length, itemBuilder: (context, i) {
          final r = snapshot.data![i];
          return Container(
            margin: const EdgeInsets.bottom(16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: const Color(0xFF171C21), borderRadius: BorderRadius.circular(16), border: const Border(left: BorderSide(color: Color(0xFF7CCF2B), width: 4))),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text(r.nom, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                IconButton(icon: const Icon(Icons.email, color: Color(0xFF7CCF2B)), onPressed: () => api.sendEmail(r.email, 'Réponse à votre demande EFMS')),
              ]),
              Text(r.message, style: const TextStyle(color: Colors.white70)),
              const SizedBox(height: 10),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text(DateFormat('dd/MM/yyyy').format(r.createdAt), style: const TextStyle(fontSize: 12, color: Colors.grey)),
                TextButton(onPressed: () async { if (await api.deleteRequest(r.id)) setState(() {}); }, child: const Text('Archiver', style: TextStyle(color: Colors.red))),
              ])
            ]),
          );
        });
      },
    );
  }

  InputDecoration _inputDecoration(String label) => InputDecoration(labelText: label, filled: true, fillColor: Colors.black26, border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none));
}
