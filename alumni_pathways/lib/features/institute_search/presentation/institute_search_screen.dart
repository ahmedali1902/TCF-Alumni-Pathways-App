import 'dart:convert';

import 'package:alumni_pathways/core/constants/enum.dart';
import 'package:alumni_pathways/features/institute_search/domain/institute_details.dart';
import 'package:alumni_pathways/features/institute_search/repository/institute_search_repository.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:geolocator/geolocator.dart';
import '../../../core/constants/colors.dart';
import '../../../core/services/http_service.dart';
import '../../../widgets/card.dart';
import 'package:alumni_pathways/widgets/institute_map_loader.dart';

class InstituteSearchScreen extends StatefulWidget {
  const InstituteSearchScreen({super.key});

  @override
  State<InstituteSearchScreen> createState() => _InstituteSearchScreenState();
}

class _InstituteSearchScreenState extends State<InstituteSearchScreen> {
  final InstituteSearchRepository _instituteSearchRepository =
      InstituteSearchRepository(ApiHandlerService());
  final List<Institute> institutes = [];
  bool _isLoading = true;
  bool _locationDenied = false;
  bool _isLocationServiceEnabled = true;
  double? _latitude;
  double? _longitude;
  int _gender = Gender.coeducation.value; // Default
  int _searchRadius = 10000; // Default 10km

  List<String> _favoriteInstitutes = [];

  @override
  void initState() {
    super.initState();
    _initSearch();
    _loadFavorites();
  }

  Future<void> _fetchInstitutes() async {
    if (_latitude == null || _longitude == null) return;

    try {
      final List<Institute> fetchedInstitutes = await _instituteSearchRepository
          .searchInstitutes(
            _longitude!,
            _latitude!,
            _searchRadius * 1000,
            _gender,
          );
      fetchedInstitutes.sort(
        (a, b) => a.approxDistance.compareTo(b.approxDistance),
      );
      setState(() {
        institutes.addAll(fetchedInstitutes);
      });
    } catch (e) {
      debugPrint('Error fetching institutes: $e');
    }
  }

  Future<void> _retryLocation() async {
    setState(() {
      _isLoading = true;
      _locationDenied = false;
      institutes.clear();
    });
    await _checkLocationPermission();
    if (_latitude != null && _longitude != null) {
      await _fetchInstitutes();
    }
    setState(() {
      _isLoading = false;
    });
  }

  Future<void> _initSearch() async {
    try {
      // Get search radius and gender from shared preferences
      final prefs = await SharedPreferences.getInstance();
      _searchRadius = prefs.getInt('search_distance') ?? 10000;
      _gender = prefs.getInt('gender') ?? Gender.coeducation.value;

      // Check and request location permissions
      await _checkLocationPermission();

      if (_latitude != null && _longitude != null) {
        await _fetchInstitutes();
      }
    } catch (e) {
      debugPrint('Initialization error: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _checkLocationPermission() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      setState(() {
        _isLocationServiceEnabled = false;
      });
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        setState(() {
          _locationDenied = true;
        });
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      setState(() {
        _locationDenied = true;
      });
      return;
    }

    // Get current position
    try {
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.best,
      );
      setState(() {
        _latitude = position.latitude;
        _longitude = position.longitude;
        _locationDenied = false;
      });
    } catch (e) {
      debugPrint('Error getting location: $e');
      setState(() {
        _locationDenied = true;
      });
    }
  }

  Future<void> _loadFavorites() async {
    final prefs = await SharedPreferences.getInstance();
    final favoritesJson = prefs.getString('favorite_institutes') ?? '[]';
    setState(() {
      _favoriteInstitutes = List<String>.from(json.decode(favoritesJson));
    });
  }

  Future<void> _toggleFavorite(String instituteId) async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      if (_favoriteInstitutes.contains(instituteId)) {
        _favoriteInstitutes.remove(instituteId);
      } else {
        _favoriteInstitutes.add(instituteId);
      }
    });
    await prefs.setString(
      'favorite_institutes',
      json.encode(_favoriteInstitutes),
    );
  }

  bool _isFavorite(String instituteId) {
    return _favoriteInstitutes.contains(instituteId);
  }

  Widget _buildInstituteList() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        children:
            institutes.map((institute) {
              final index = institutes.indexOf(institute);
              return AnimatedOpacity(
                opacity: 1.0,
                duration: Duration(milliseconds: 500 + (index * 100)),
                curve: Curves.easeInOut,
                child: Transform.scale(
                  scale: 1.0,
                  child: TCard(
                    maxLines: 2,
                    height: 90,
                    leftIcon: CircleAvatar(
                      backgroundColor: TAppColors.primary.withOpacity(0.2),
                      child: Icon(
                        LucideIcons.mapPin,
                        color: TAppColors.primary,
                      ),
                    ),
                    textWidget: SizedBox(
                      height: 70,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            maxLines: 2,
                            institute.name,
                            style: Theme.of(context).textTheme.titleSmall,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            // ManagingAuthority.fromValue(
                            //   institute.managingAuthority,
                            // ).toString(),
                            '${(institute.approxDistance / 1000).toStringAsFixed(2)} Km — ${ManagingAuthority.fromValue(institute.managingAuthority).toString()}',
                            style: Theme.of(
                              context,
                            ).textTheme.bodySmall?.copyWith(color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                    rightIcon: Icon(
                      _isFavorite(institute.id)
                          ? Icons.favorite
                          : Icons.favorite_border,
                      color:
                          _isFavorite(institute.id)
                              ? const Color(0XFFFF5A5F)
                              : Colors.grey,
                    ),
                    showRightIcon: true,
                    onRightIconPressed: () {
                      _toggleFavorite(institute.id);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            !_isFavorite(institute.id)
                                ? 'Added to favorites'
                                : 'Removed from favorites',
                          ),
                          duration: Duration(seconds: 1),
                        ),
                      );
                    },
                    onTap: () {
                      String id = institute.id;
                      _instituteSearchRepository
                          .getInstituteById(id)
                          .then((instituteDetails) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder:
                                    (context) => InstituteMapLoader(
                                      institute: instituteDetails,
                                    ),
                              ),
                            );
                          })
                          .catchError((error) {
                            debugPrint(
                              'Error fetching institute details: $error',
                            );
                          });
                    },
                  ),
                ),
              );
            }).toList(),
      ),
    );
  }

  Widget _buildLoadingIndicator() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          RotationTransition(
            turns: const AlwaysStoppedAnimation(0.75),
            child: Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(25),
                border: Border.all(
                  color: TAppColors.primary,
                  width: 4,
                  style: BorderStyle.solid,
                ),
              ),
              child: const Padding(
                padding: EdgeInsets.all(8.0),
                child: CircularProgressIndicator(
                  color: TAppColors.primary,
                  strokeWidth: 2,
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            "Finding institutes near you...",
            style: TextStyle(color: TAppColors.primary),
          ),
        ],
      ),
    );
  }

  Widget _buildLocationDeniedWidget() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(LucideIcons.mapPinOff, size: 50, color: Colors.red),
            const SizedBox(height: 20),
            const Text(
              "Location Access Required",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text(
              "We need your location to find institutes nearby. "
              "Please enable location permissions in settings.",
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: TAppColors.primary,
                foregroundColor: TAppColors.darkAccent,
              ),
              onPressed: () async {
                await Geolocator.openAppSettings();
                await _retryLocation();
              },
              child: const Text("Open Settings"),
            ),
            TextButton(
              onPressed: _retryLocation,
              child: const Text(
                "Retry",
                style: TextStyle(color: TAppColors.primary),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLocationNotEnabledWidget() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(LucideIcons.mapPinOff, size: 50, color: Colors.red),
            const SizedBox(height: 20),
            const Text(
              "Location Services Disabled",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text(
              "Please enable location services to find institutes nearby.",
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: TAppColors.primary,
                foregroundColor: TAppColors.darkAccent,
              ),
              onPressed: () async {
                await Geolocator.openLocationSettings();
                await _retryLocation();
              },
              child: const Text("Open Settings"),
            ),
            TextButton(
              onPressed: _retryLocation,
              child: const Text(
                "Retry",
                style: TextStyle(color: TAppColors.primary),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          "Find Institutes",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            fontFamily: 'Inter',
          ),
        ),
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: Colors.lightBlue[50],
            child: const Row(
              children: [
                Icon(LucideIcons.info, size: 16, color: Colors.blue),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    "You can change your default search preferences from Settings screen (Default Distance: ~10KM).",
                    style: TextStyle(color: Colors.blue, fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child:
                _isLoading
                    ? _buildLoadingIndicator()
                    : _locationDenied
                    ? _buildLocationDeniedWidget()
                    : !_isLocationServiceEnabled
                    ? _buildLocationNotEnabledWidget()
                    : institutes.isEmpty
                    ? const Center(
                      child: Text(
                        "Sorry! No institutes found.",
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    )
                    : _buildInstituteList(),
          ),
        ],
      ),
    );
  }
}
