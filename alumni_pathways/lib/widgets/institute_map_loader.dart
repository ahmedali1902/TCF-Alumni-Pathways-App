import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/colors.dart';
import '../../../widgets/card.dart';

class InstituteMapLoader extends StatefulWidget {
  final Map<String, dynamic> institute;

  const InstituteMapLoader({super.key, required this.institute});

  @override
  State<InstituteMapLoader> createState() => _InstituteMapLoaderState();
}

class _InstituteMapLoaderState extends State<InstituteMapLoader> {
  MapboxMap? mapboxMapController;
  PointAnnotationManager? pointAnnotationManager;

  @override
  void initState() {
    super.initState();
  }

  String getStyleForTheme(BuildContext context) {
    final brightness = MediaQuery.of(context).platformBrightness;
    return brightness == Brightness.dark
        ? MapboxStyles.DARK
        : MapboxStyles.LIGHT;
  }

  @override
  Widget build(BuildContext context) {
    final institute = widget.institute;
    final location = Point(
      coordinates: Position(
        institute['longitude'] ?? 0.0,
        institute['latitude'] ?? 0.0,
      ),
    );

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft), // Using chevron left icon
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          institute['name'] ?? 'Institute Details',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            fontFamily: 'Inter',
          ),
        ),
      ),
      body: Stack(
        children: [
          // Background Map
          MapWidget(
            styleUri: getStyleForTheme(context),
            onMapCreated: _onMapCreated,
            cameraOptions: CameraOptions(center: location, zoom: 14.0),
          ),

          // Foreground Draggable Bottom Sheet
          DraggableScrollableSheet(
            initialChildSize: 0.35, // how much visible initially (0.0 to 1.0)
            minChildSize: 0.2, // minimum height
            maxChildSize: 0.85, // maximum height
            builder: (context, scrollController) {
              return Container(
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.background,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(20),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, -2),
                    ),
                  ],
                ),
                child: SingleChildScrollView(
                  controller: scrollController, // Important to link scroll
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Small grab handle
                      Center(
                        child: Container(
                          width: 40,
                          height: 4,
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.grey[300],
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),

                      // Rest of your details (just copy from your original Column)
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Expanded(
                            child: Text(
                              institute['name'] ?? '',
                              style: Theme.of(
                                context,
                              ).textTheme.headlineSmall?.copyWith(
                                color: TAppColors.primary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          _buildRatingStars(_calculateAverageRating(institute)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _getManagingAuthority(institute['managingAuthority']),
                        style: Theme.of(
                          context,
                        ).textTheme.bodySmall?.copyWith(color: Colors.grey),
                      ),
                      const SizedBox(height: 16),

                      Text(
                        'Description',
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        institute['description'] ?? 'No description available',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 20),

                      TCard(
                        height: 80,
                        leftIcon: CircleAvatar(
                          backgroundColor: TAppColors.primary.withOpacity(0.2),
                          child: const Icon(
                            LucideIcons.mapPin,
                            color: TAppColors.primary,
                            size: 20,
                          ),
                        ),
                        textWidget: const Text(
                          'Open in Google Maps',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                        onTap:
                            () => _openGoogleMaps(
                              institute['latitude'],
                              institute['longitude'],
                            ),
                      ),
                      const SizedBox(height: 20),

                      Text(
                        'Faculties',
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      ..._buildFacultyCards(institute['faculties'] ?? []),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Future<void> _onMapCreated(MapboxMap controller) async {
    mapboxMapController = controller;
    pointAnnotationManager =
        await controller.annotations.createPointAnnotationManager();

    // Load the image from assets
    final ByteData bytes = await rootBundle.load(
      'assets/media/custom-icon.png',
    );
    final Uint8List imageData = bytes.buffer.asUint8List();

    // Add marker at institute location
    final institute = widget.institute;
    final pointAnnotationOptions = PointAnnotationOptions(
      geometry: Point(
        coordinates: Position(
          institute['longitude'] ?? 0.0,
          institute['latitude'] ?? 0.0,
        ),
      ),
      image: imageData,
      iconSize: 0.7,
    );

    pointAnnotationManager?.create(pointAnnotationOptions);
  }

  double _calculateAverageRating(Map<String, dynamic> institute) {
    final ratings = institute['ratings'] ?? [];
    if (ratings.isEmpty) return 0.0;

    final sum = ratings.fold(
      0.0,
      (total, rating) => total + (rating['rating'] ?? 0),
    );
    return sum / ratings.length;
  }

  Widget _buildRatingStars(double rating) {
    return Row(
      children: [
        Icon(LucideIcons.star, color: Colors.amber, size: 20),
        const SizedBox(width: 4),
        Text(
          rating.toStringAsFixed(1),
          style: Theme.of(
            context,
          ).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  String _getManagingAuthority(int? authority) {
    switch (authority) {
      case 0:
        return 'Private';
      case 1:
        return 'Government';
      case 2:
        return 'NGO';
      default:
        return 'Unknown';
    }
  }

  Future<void> _openGoogleMaps(double? lat, double? lng) async {
    if (lat == null || lng == null) return;

    final url = Uri.parse(
      'https://www.google.com/maps/search/?api=1&query=$lat,$lng',
    );
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  List<Widget> _buildFacultyCards(List<dynamic> faculties) {
    if (faculties.isEmpty) {
      return [
        const Text(
          'No faculties available',
          style: TextStyle(color: Colors.grey),
        ),
      ];
    }

    return faculties.map((faculty) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 8.0),
        child: TCard(
          height: 110,
          leftIcon: CircleAvatar(
            backgroundColor: TAppColors.primary.withOpacity(0.2),
            child: const Icon(
              LucideIcons.graduationCap,
              color: TAppColors.primary,
              size: 20,
            ),
          ),
          textWidget: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                faculty['name'] ?? 'Unnamed Faculty',
                style: Theme.of(
                  context,
                ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _buildInfoItem(
                    LucideIcons.barChart2,
                    'Admission: ${faculty['performanceAdmissionCriteria']?.toStringAsFixed(1) ?? 'N/A'}%',
                  ),
                  const SizedBox(width: 16),
                  _buildInfoItem(
                    LucideIcons.award,
                    'Results: ${faculty['performanceAverageResult']?.toStringAsFixed(1) ?? 'N/A'}%',
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _buildInfoItem(
                    LucideIcons.star,
                    'Rating: ${_calculateFacultyRating(faculty['ratings'] ?? []).toStringAsFixed(1)}',
                  ),
                  const SizedBox(width: 16),
                  _buildInfoItem(
                    faculty['gender'] == 0
                        ? LucideIcons.user
                        : LucideIcons.user,
                    faculty['gender'] == 0 ? 'Male' : 'Female',
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    }).toList();
  }

  Widget _buildInfoItem(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: Colors.grey),
        const SizedBox(width: 4),
        Text(text, style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }

  double _calculateFacultyRating(List<dynamic> ratings) {
    if (ratings.isEmpty) return 0.0;

    final sum = ratings.fold(
      0.0,
      (total, rating) => total + (rating['rating'] ?? 0),
    );
    return sum / ratings.length;
  }
}
