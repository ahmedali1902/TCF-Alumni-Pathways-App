import 'package:alumni_pathways/core/services/http_service.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/colors.dart';
import '../../../widgets/card.dart';
import '../domain/resources_model.dart';
import '../repository/home_repository.dart';

enum ResourceCategory {
  forms(1),
  video(2);

  final int value;
  const ResourceCategory(this.value);
}

class ResourcesScreen extends StatefulWidget {
  final int educationLevel;
  final int category;

  const ResourcesScreen({
    super.key,
    required this.educationLevel,
    required this.category,
  });

  @override
  State<ResourcesScreen> createState() => _ResourcesScreenState();
}

class _ResourcesScreenState extends State<ResourcesScreen> {
  List<Resource> resources = [];
  final HomeRepository homeRepository = HomeRepository(ApiHandlerService());
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    getResources();
  }

  Future<void> getResources() async {
    try {
      final result = await homeRepository.getResources(
        widget.educationLevel,
        widget.category,
      );
      setState(() {
        resources = result;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load resources: $e')),
      );
    }
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
          "Resources",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            fontFamily: 'Inter',
          ),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : resources.isEmpty
          ? const Center(child: Text("No resources available."))
          : SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: resources.map((resource) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 5),
              child: TCard(
                height: 130,
                leftIcon: CircleAvatar(
                  backgroundColor: TAppColors.primary.withOpacity(0.2),
                  child: Icon(
                    widget.category == ResourceCategory.video.value ? LucideIcons.bookOpen : LucideIcons.globe,
                    color: TAppColors.primary,
                  ),
                ),
                textWidget: SizedBox(
                  height: 120,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        resource.title,
                        style: Theme.of(context)
                            .textTheme
                            .titleSmall
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        resource.content ?? '',
                        style: Theme.of(context)
                            .textTheme
                            .bodySmall
                            ?.copyWith(color: Colors.grey),
                      ),
                    ],
                  ),
                ),
                openLink: resource.link,
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
