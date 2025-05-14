import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/colors.dart';
import '../../../widgets/card.dart';
import 'package:alumni_pathways/widgets/institute_map_loader.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  // List of favorite institutes with isFavorite state
  List<Map<String, dynamic>> favoriteInstitutes = [
    {
      "id": "65a1b2c3d4e5f6g7h8i9j1k",
      "code": "EDU-001",
      "name": "The Citizens Foundation School",
      "managingAuthority": 2, // NGO
      "latitude": 24.905930,
      "longitude": 67.137647,
      "description":
          "A premier educational institution providing quality education to underprivileged communities since 1995. Known for its excellent faculty and modern facilities.",
      "faculties": [
        {
          "id": "75b2c3d4e5f6g7h8i9j0k1l",
          "name": "Science Faculty",
          "performanceAverageResult": 85.4,
          "performanceAdmissionCriteria": 92.1,
          "performanceUserRating": 4.7,
          "ratings": [
            {"rating": 5, "createdAt": "2025-01-10T09:00:00Z"},
            {"rating": 4, "createdAt": "2025-01-15T14:30:00Z"},
            {"rating": 5, "createdAt": "2025-02-05T11:15:00Z"},
          ],
          "gender": 0, // Male
        },
        {
          "id": "85c3d4e5f6g7h8i9j0k1l2m",
          "name": "Arts Faculty",
          "performanceAverageResult": 78.2,
          "performanceAdmissionCriteria": 85.0,
          "performanceUserRating": 4.2,
          "ratings": [
            {"rating": 4, "createdAt": "2025-01-12T10:00:00Z"},
            {"rating": 4, "createdAt": "2025-02-01T16:45:00Z"},
          ],
          "gender": 1, // Female
        },
      ],
      "ratings": [
        {"rating": 5, "createdAt": "2025-01-05T08:00:00Z"},
        {"rating": 4, "createdAt": "2025-01-20T13:20:00Z"},
        {"rating": 5, "createdAt": "2025-02-10T10:45:00Z"},
      ],
      "createdAt": "2020-06-15T00:00:00Z",
      "updatedAt": "2025-02-15T09:30:00Z",
      "isFavorite": true,
    },
    {
      "id": "65a1b2c3d4e5f6g7h8i9j2k",
      "code": "EDU-002",
      "name": "Karachi Grammar School",
      "managingAuthority": 0, // Private
      "latitude": 24.846565,
      "longitude": 67.028381,
      "description":
          "One of the oldest and most prestigious private schools in Pakistan, established in 1847. Offers British curriculum and excellent extracurricular activities.",
      "faculties": [
        {
          "id": "75b2c3d4e5f6g7h8i9j0k2l",
          "name": "Commerce Faculty",
          "performanceAverageResult": 88.7,
          "performanceAdmissionCriteria": 95.3,
          "performanceUserRating": 4.8,
          "ratings": [
            {"rating": 5, "createdAt": "2025-01-08T09:30:00Z"},
            {"rating": 5, "createdAt": "2025-01-25T15:00:00Z"},
          ],
          "gender": 0, // Male
        },
      ],
      "ratings": [
        {"rating": 5, "createdAt": "2025-01-07T11:00:00Z"},
        {"rating": 5, "createdAt": "2025-01-28T14:15:00Z"},
      ],
      "createdAt": "2018-03-10T00:00:00Z",
      "updatedAt": "2025-02-12T10:45:00Z",
      "isFavorite": true,
    },
    {
      "id": "65a1b2c3d4e5f6g7h8i9j3k",
      "code": "EDU-003",
      "name": "Government College University",
      "managingAuthority": 1, // Government
      "latitude": 24.929243,
      "longitude": 67.034849,
      "description":
          "A public research university with a strong emphasis on sciences and humanities. Offers undergraduate and graduate programs across various disciplines.",
      "faculties": [
        {
          "id": "75b2c3d4e5f6g7h8i9j0k3l",
          "name": "Engineering Faculty",
          "performanceAverageResult": 82.5,
          "performanceAdmissionCriteria": 89.7,
          "performanceUserRating": 4.5,
          "ratings": [
            {"rating": 4, "createdAt": "2025-01-15T10:45:00Z"},
            {"rating": 5, "createdAt": "2025-02-05T12:30:00Z"},
          ],
          "gender": 0, // Male
        },
        {
          "id": "85c3d4e5f6g7h8i9j0k3l2m",
          "name": "Medical Faculty",
          "performanceAverageResult": 91.2,
          "performanceAdmissionCriteria": 97.5,
          "performanceUserRating": 4.9,
          "ratings": [
            {"rating": 5, "createdAt": "2025-01-18T09:15:00Z"},
            {"rating": 5, "createdAt": "2025-02-08T14:00:00Z"},
          ],
          "gender": 1, // Female
        },
      ],
      "ratings": [
        {"rating": 4, "createdAt": "2025-01-12T13:45:00Z"},
        {"rating": 5, "createdAt": "2025-01-30T16:20:00Z"},
      ],
      "createdAt": "2019-05-20T00:00:00Z",
      "updatedAt": "2025-02-14T08:15:00Z",
      "isFavorite": true,
    },
    {
      "id": "65a1b2c3d4e5f6g7h8i9j4k",
      "code": "EDU-004",
      "name": "Beaconhouse School System",
      "managingAuthority": 0, // Private
      "latitude": 24.891231,
      "longitude": 67.072156,
      "description":
          "A leading private school network with modern teaching methodologies and international standards. Focuses on holistic development of students.",
      "faculties": [
        {
          "id": "75b2c3d4e5f6g7h8i9j0k4l",
          "name": "Computer Science Faculty",
          "performanceAverageResult": 87.9,
          "performanceAdmissionCriteria": 93.4,
          "performanceUserRating": 4.6,
          "ratings": [
            {"rating": 4, "createdAt": "2025-01-20T11:30:00Z"},
            {"rating": 5, "createdAt": "2025-02-10T10:00:00Z"},
          ],
          "gender": 0, // Male
        },
      ],
      "ratings": [
        {"rating": 4, "createdAt": "2025-01-15T14:45:00Z"},
        {"rating": 4, "createdAt": "2025-02-05T09:30:00Z"},
      ],
      "createdAt": "2021-02-05T00:00:00Z",
      "updatedAt": "2025-02-13T11:20:00Z",
      "isFavorite": false,
    },
    {
      "id": "65a1b2c3d4e5f6g7h8i9j5k",
      "code": "EDU-005",
      "name": "Indus Valley School of Art and Architecture",
      "managingAuthority": 2, // NGO
      "latitude": 24.815586,
      "longitude": 67.025156,
      "description":
          "Premier institution for art, design and architecture education. Known for its creative environment and industry-relevant programs.",
      "faculties": [
        {
          "id": "75b2c3d4e5f6g7h8i9j0k5l",
          "name": "Architecture Faculty",
          "performanceAverageResult": 89.3,
          "performanceAdmissionCriteria": 94.8,
          "performanceUserRating": 4.7,
          "ratings": [
            {"rating": 5, "createdAt": "2025-01-25T10:15:00Z"},
            {"rating": 4, "createdAt": "2025-02-12T15:30:00Z"},
          ],
          "gender": 1, // Female
        },
        {
          "id": "85c3d4e5f6g7h8i9j0k5l2m",
          "name": "Fine Arts Faculty",
          "performanceAverageResult": 84.6,
          "performanceAdmissionCriteria": 88.9,
          "performanceUserRating": 4.4,
          "ratings": [
            {"rating": 4, "createdAt": "2025-01-28T11:45:00Z"},
            {"rating": 5, "createdAt": "2025-02-14T14:15:00Z"},
          ],
          "gender": 1, // Female
        },
      ],
      "ratings": [
        {"rating": 5, "createdAt": "2025-01-22T09:45:00Z"},
        {"rating": 4, "createdAt": "2025-02-08T13:00:00Z"},
      ],
      "createdAt": "2020-09-12T00:00:00Z",
      "updatedAt": "2025-02-15T10:00:00Z",
      "isFavorite": true,
    },
  ];

  // Toggle favorite status
  void _toggleFavorite(int index) {
    setState(() {
      favoriteInstitutes[index]['isFavorite'] =
          !(favoriteInstitutes[index]['isFavorite'] ?? false);
    });
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
          favoriteInstitutes.isEmpty
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
                      favoriteInstitutes.map((institute) {
                        final index = favoriteInstitutes.indexOf(institute);
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
                                    institute['name'],
                                    style:
                                        Theme.of(context).textTheme.titleSmall,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _getManagingAuthority(
                                      institute['managingAuthority'],
                                    ),
                                    style: Theme.of(context).textTheme.bodySmall
                                        ?.copyWith(color: Colors.grey),
                                  ),
                                ],
                              ),
                            ),
                            rightIcon: Icon(
                              institute['isFavorite']
                                  ? Icons.favorite
                                  : Icons.favorite_border,
                              color:
                                  institute['isFavorite']
                                      ? const Color(0XFFFF5A5F)
                                      : Colors.grey,
                            ),
                            showRightIcon: true,
                            onRightIconPressed: () => _toggleFavorite(index),
                            onTap:
                                () => {},
                          ),
                        );
                      }).toList(),
                ),
              ),
    );
  }

  String _getManagingAuthority(int? authority) {
    switch (authority) {
      case 0:
        return 'Private Institution';
      case 1:
        return 'Government Institution';
      case 2:
        return 'NGO Institution';
      default:
        return 'Unknown';
    }
  }
}
