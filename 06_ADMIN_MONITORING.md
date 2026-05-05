# 📊 Administration & Monitoring — Plateforme Artisans

---

## 🖥️ Dashboard Admin Flutter

### Page Admin Dashboard

```dart
// lib/presentation/pages/admin/admin_dashboard_page.dart

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';

class AdminDashboardPage extends StatefulWidget {
  const AdminDashboardPage({super.key});

  @override
  State<AdminDashboardPage> createState() => _AdminDashboardPageState();
}

class _AdminDashboardPageState extends State<AdminDashboardPage> {
  final _client = Supabase.instance.client;
  Map<String, dynamic>? _kpis;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadKPIs();
  }

  Future<void> _loadKPIs() async {
    try {
      final result = await _client
          .from('admin_kpis')
          .select()
          .single();
      setState(() {
        _kpis = result;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tableau de bord Admin'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadKPIs,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Vue d\'ensemble', style: AppTextStyles.headingLarge),
                  const SizedBox(height: 24),

                  // KPI Grid
                  _buildKPIGrid(),
                  const SizedBox(height: 32),

                  // Alertes
                  _buildAlertsSection(),
                  const SizedBox(height: 32),

                  // Graphiques (à implémenter avec fl_chart)
                  _buildChartsSection(),
                ],
              ),
            ),
    );
  }

  Widget _buildKPIGrid() {
    if (_kpis == null) return const SizedBox();

    final cards = [
      _KPIData('Clients',       _kpis!['total_clients'],       Icons.people,       AppColors.info),
      _KPIData('Artisans',      _kpis!['total_artisans'],      Icons.construction, AppColors.primary),
      _KPIData('Certifiés',     _kpis!['verified_artisans'],   Icons.verified,     AppColors.success),
      _KPIData('Réservations',  _kpis!['total_bookings'],      Icons.calendar_today, AppColors.secondary),
      _KPIData('Terminées',     _kpis!['completed_bookings'],  Icons.check_circle, AppColors.success),
      _KPIData('En attente',    _kpis!['pending_bookings'],    Icons.hourglass_empty, AppColors.warning),
      _KPIData('Revenus',       '${_kpis!['total_revenue']}€', Icons.euro,         Colors.green),
      _KPIData('Commission',    '${_kpis!['total_commission']}€', Icons.account_balance, Colors.teal),
      _KPIData('Note moy.',     _kpis!['platform_avg_rating'], Icons.star,         Colors.amber),
      _KPIData('Signalements',  _kpis!['pending_reports'],     Icons.flag,         Colors.red),
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        final cols = constraints.maxWidth > 900 ? 5
                   : constraints.maxWidth > 600 ? 3 : 2;
        return GridView.count(
          crossAxisCount: cols,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.4,
          children: cards.map((kpi) => _KPICard(data: kpi)).toList(),
        );
      },
    );
  }

  Widget _buildAlertsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Alertes', style: AppTextStyles.headingMedium),
        const SizedBox(height: 12),
        if ((_kpis?['disputed_bookings'] ?? 0) > 0)
          _AlertTile(
            icon: Icons.warning,
            color: Colors.red,
            title: 'Litiges en cours',
            subtitle: '${_kpis!['disputed_bookings']} réservation(s) en litige',
          ),
        if ((_kpis?['pending_reports'] ?? 0) > 0)
          _AlertTile(
            icon: Icons.flag,
            color: Colors.orange,
            title: 'Signalements à traiter',
            subtitle: '${_kpis!['pending_reports']} signalement(s) en attente',
          ),
        if ((_kpis?['pending_bookings'] ?? 0) > 10)
          _AlertTile(
            icon: Icons.hourglass_empty,
            color: Colors.amber,
            title: 'Réservations en attente',
            subtitle: '${_kpis!['pending_bookings']} réservation(s) non confirmées',
          ),
      ],
    );
  }

  Widget _buildChartsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Statistiques 30 jours', style: AppTextStyles.headingMedium),
        const SizedBox(height: 12),
        Container(
          height: 200,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.divider),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('📊 ${_kpis?['bookings_30d'] ?? 0} réservations',
                    style: AppTextStyles.headingMedium),
                Text('👤 ${_kpis?['new_users_30d'] ?? 0} nouveaux utilisateurs',
                    style: AppTextStyles.bodyMedium),
                Text('💶 ${_kpis?['revenue_30d'] ?? 0}€ de chiffre d\'affaires',
                    style: AppTextStyles.bodyMedium),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// Widget KPI Card
class _KPICard extends StatelessWidget {
  final _KPIData data;
  const _KPICard({required this.data});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(data.icon, color: data.color, size: 24),
          const SizedBox(height: 8),
          Text(
            data.value?.toString() ?? '—',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: data.color,
              fontFamily: 'Poppins',
            ),
          ),
          Text(data.label, style: AppTextStyles.bodySmall),
        ],
      ),
    );
  }
}

class _KPIData {
  final String label;
  final dynamic value;
  final IconData icon;
  final Color color;
  const _KPIData(this.label, this.value, this.icon, this.color);
}

class _AlertTile extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  const _AlertTile({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: AppTextStyles.labelMedium.copyWith(color: color)),
              Text(subtitle, style: AppTextStyles.bodySmall),
            ],
          ),
        ],
      ),
    );
  }
}
```

---

## 🎯 Page — Modération Artisans

```dart
// lib/presentation/pages/admin/admin_artisans_page.dart (extrait)

class AdminArtisansPage extends StatefulWidget {
  const AdminArtisansPage({super.key});

  @override
  State<AdminArtisansPage> createState() => _AdminArtisansPageState();
}

class _AdminArtisansPageState extends State<AdminArtisansPage>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestion Artisans'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'À valider'),
            Tab(text: 'Certifiés'),
            Tab(text: 'Suspendus'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _PendingArtisansList(),
          _CertifiedArtisansList(),
          _SuspendedArtisansList(),
        ],
      ),
    );
  }
}

class _PendingArtisansList extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return StreamBuilder(
      stream: Supabase.instance.client
          .from('admin_pending_artisans')
          .stream(primaryKey: ['artisan_id']),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Center(child: CircularProgressIndicator());
        }
        final artisans = snapshot.data!;
        if (artisans.isEmpty) {
          return const Center(child: Text('Aucun artisan en attente de validation'));
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: artisans.length,
          itemBuilder: (context, index) {
            final a = artisans[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                title: Text(a['full_name'] as String),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(a['email'] as String? ?? ''),
                    Text('SIRET: ${a['siret'] ?? "Non renseigné"}'),
                    Text('Ville: ${a['city'] ?? "Non renseignée"}'),
                  ],
                ),
                isThreeLine: true,
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.check_circle, color: Colors.green),
                      onPressed: () => _certifyArtisan(context, a['artisan_id'] as String),
                    ),
                    IconButton(
                      icon: const Icon(Icons.cancel, color: Colors.red),
                      onPressed: () => _suspendUser(context, a['profile_id'] as String),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _certifyArtisan(BuildContext context, String artisanId) async {
    await Supabase.instance.client.rpc('admin_certify_artisan', params: {
      'p_artisan_id': artisanId,
      'p_badges':     ['Vérifié ArtisansPlus'],
    });
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Artisan certifié ✅'), backgroundColor: Colors.green),
      );
    }
  }

  Future<void> _suspendUser(BuildContext context, String userId) async {
    await Supabase.instance.client.rpc('admin_suspend_user', params: {
      'p_user_id': userId,
      'p_reason':  'Profil non conforme',
    });
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Utilisateur suspendu'), backgroundColor: Colors.red),
      );
    }
  }
}
```

---

## 📈 Monitoring — Indicateurs Clés

### Métriques à Surveiller

| Métrique | Seuil d'alerte | Action |
|----------|---------------|--------|
| **Taux d'annulation** | > 20% | Investiguer les artisans concernés |
| **Temps de réponse artisan** | > 48h | Notification de rappel |
| **Note plateforme** | < 3.5 | Audit qualité artisans |
| **Litiges ouverts** | > 5 | Intervention manuelle admin |
| **Taux de conversion** | < 15% | Optimisation UX funnel |
| **Signalements actifs** | > 10 | Modération urgente |
| **Réservations J+1 non confirmées** | > 0 | Alerte artisan immédiate |

### Dashboard Supabase — Tables à activer en Realtime

```sql
-- Activer Realtime sur les tables critiques
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE reports;
```

---

## 🔄 Supabase Storage — Organisation des Fichiers

```
Bucket: avatars/
└── {user_id}/
    └── avatar.jpg                    ← Photo de profil

Bucket: portfolio/
└── {artisan_id}/
    ├── {item_id}_main.jpg            ← Photo principale
    ├── {item_id}_before.jpg          ← Avant travaux
    └── {item_id}_after.jpg           ← Après travaux

Bucket: documents/
└── {artisan_id}/
    ├── kbis.pdf                      ← Extrait KBIS
    ├── insurance.pdf                 ← Attestation assurance
    └── certification.pdf             ← Certificats RGE/Qualibat

Bucket: bookings/
└── {booking_id}/
    ├── before_{timestamp}.jpg        ← Photos avant intervention
    └── after_{timestamp}.jpg         ← Photos après intervention
```

### Upload Sécurisé dans Flutter

```dart
// lib/data/services/storage_service.dart

class StorageService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<String> uploadAvatar(String userId, Uint8List bytes) async {
    final path = '$userId/avatar.jpg';

    await _client.storage
        .from('avatars')
        .uploadBinary(
          path,
          bytes,
          fileOptions: const FileOptions(
            contentType: 'image/jpeg',
            upsert: true,
          ),
        );

    return _client.storage
        .from('avatars')
        .getPublicUrl(path);
  }

  Future<String> uploadPortfolioItem({
    required String artisanId,
    required String itemId,
    required Uint8List bytes,
    required String type, // 'main' | 'before' | 'after'
  }) async {
    final path = '$artisanId/${itemId}_$type.jpg';

    await _client.storage
        .from('portfolio')
        .uploadBinary(path, bytes,
          fileOptions: const FileOptions(
            contentType: 'image/jpeg',
            upsert: true,
          ),
        );

    return _client.storage.from('portfolio').getPublicUrl(path);
  }
}
```

---

## 🔧 Configuration analyse_options.yaml

```yaml
# analysis_options.yaml

include: package:flutter_lints/flutter.yaml

linter:
  rules:
    # Qualité du code
    prefer_const_constructors: true
    prefer_const_declarations: true
    prefer_final_fields: true
    avoid_print: true
    use_key_in_widget_constructors: true
    avoid_unnecessary_containers: true
    sized_box_for_whitespace: true

    # Dart moderne
    prefer_single_quotes: true
    require_trailing_commas: true
    sort_child_properties_last: true

    # Performance
    avoid_slow_async_io: true

analyzer:
  exclude:
    - build/**
    - "**/*.g.dart"
    - "**/*.freezed.dart"
  errors:
    missing_required_param: error
    missing_return: error
    dead_code: warning
```

---

## 📋 Checklist Déploiement Production

```
PRÉ-DÉPLOIEMENT
□ flutter analyze → 0 erreur
□ flutter test → tous les tests passent
□ Clés de prod remplacées (Supabase prod, Stripe live)
□ Variables d'environnement configurées dans Supabase Dashboard
□ RLS testés avec comptes de test (client, artisan, admin)
□ Edge Functions déployées et testées
□ Webhooks Stripe enregistrés avec URL prod
□ Buckets Storage créés avec politiques
□ pg_cron jobs schedulés

ANDROID
□ app/build.gradle — minSdkVersion ≥ 21
□ AndroidManifest.xml — permissions internet
□ google-services.json ajouté (Firebase FCM)
□ flutter build apk --release
□ Signature keystore configurée
□ Test sur appareil physique

WEB
□ flutter build web --release
□ Meta tags SEO dans web/index.html
□ favicon configuré
□ Domaine custom configuré dans Supabase Auth

POST-DÉPLOIEMENT
□ Monitoring Supabase activé
□ Alertes emails configurées (erreurs 5xx, saturation DB)
□ Sauvegarde automatique Supabase activée
□ Stripe Dashboard en mode live
□ Test paiement end-to-end avec carte réelle
□ RGPD: politique confidentialité accessible
```

---

*Documentation complète — Plateforme Artisans*  
*Générée pour développement VSCode — Flutter 3.35.4 + Supabase*
