import 'package:alumni_pathways/core/constants/enum.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:alumni_pathways/features/institute_search/domain/institute_details.dart';
import 'package:alumni_pathways/features/institute_search/repository/institute_search_repository.dart';
import '../../../core/constants/colors.dart';
import '../../../core/services/http_service.dart';
import '../../../widgets/card.dart';
import 'package:alumni_pathways/widgets/institute_map_loader.dart';
import 'dart:convert';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  final InstituteSearchRepository _repository = InstituteSearchRepository(
    ApiHandlerService(),
  );
  List<InstituteDetails> _favoriteInstitutes = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFavorites();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (ModalRoute.of(context)?.isCurrent ?? false) {
      _loadFavorites();
    }
  }

  Future<void> _loadFavorites() async {
    try {
      // Load favorite institute IDs from SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final favoritesJson = prefs.getString('favorite_institutes') ?? '[]';
      final List<String> favoriteIds = List<String>.from(
        json.decode(favoritesJson),
      );

      // Fetch details for each favorite institute
      final List<InstituteDetails> loadedInstitutes = [];
      for (String id in favoriteIds) {
        try {
          final institute = await _repository.getInstituteById(id);
          loadedInstitutes.add(institute);
        } catch (e) {
          print('Error loading institute $id: $e');
        }
      }

      setState(() {
        _favoriteInstitutes = loadedInstitutes;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading favorites: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _removeFavorite(String instituteId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final favoritesJson = prefs.getString('favorite_institutes') ?? '[]';
      final List<String> favoriteIds = List<String>.from(
        json.decode(favoritesJson),
      );

      favoriteIds.remove(instituteId);

      await prefs.setString('favorite_institutes', json.encode(favoriteIds));

      setState(() {
        _favoriteInstitutes.removeWhere((inst) => inst.id == instituteId);
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Removed from favorites'),
          duration: Duration(seconds: 1),
        ),
      );
    } catch (e) {
      print('Error removing favorite: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Favorites",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            fontFamily: 'Inter',
          ),
        ),
      ),
      body:
          _isLoading
              ? const Center(
                child: CircularProgressIndicator(
                  color: TAppColors.primary,
                  strokeWidth: 4,
                ),
              )
              : _favoriteInstitutes.isEmpty
              ? const Center(
                child: Text(
                  "No favorites yet",
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
              )
              : SingleChildScrollView(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children:
                      _favoriteInstitutes.map((institute) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 5.0),
                          child: TCard(
                            height: 90,
                            leftIcon: CircleAvatar(
                              backgroundColor: TAppColors.primary.withOpacity(
                                0.2,
                              ),
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
                                    institute.name,
                                    style:
                                        Theme.of(context).textTheme.titleSmall,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    ManagingAuthority.fromValue(
                                      institute.managingAuthority,
                                    ).toString(),
                                    style: Theme.of(context).textTheme.bodySmall
                                        ?.copyWith(color: Colors.grey),
                                  ),
                                ],
                              ),
                            ),
                            rightIcon: Icon(
                              Icons.favorite,
                              color: const Color(0XFFFF5A5F),
                            ),
                            showRightIcon: true,
                            onRightIconPressed:
                                () => _removeFavorite(institute.id),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder:
                                      (context) => InstituteMapLoader(
                                        institute: institute,
                                      ),
                                ),
                              );
                            },
                          ),
                        );
                      }).toList(),
                ),
              ),
    );
  }
}
