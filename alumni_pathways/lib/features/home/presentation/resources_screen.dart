import 'package:alumni_pathways/core/services/http_service.dart';
import 'package:alumni_pathways/core/widgets/loading_indicator.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/colors.dart';
import '../../../widgets/card.dart';
import '../domain/resources_model.dart';
import '../repository/home_repository.dart';

enum ResourceCategory {
  general(1),
  scholarship(2);

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

  // Pagination variables
  int _page = 1; // Start from page 1
  final int _limit = 10; // Items per page
  bool _hasMoreData = true; // Track if more data is available
  bool _isLoadingMore = false; // Track loading more state

  @override
  void initState() {
    super.initState();
    getResources();
  }

  Future<void> getResources({bool isLoadMore = false}) async {
    try {
      if (isLoadMore) {
        setState(() {
          _isLoadingMore = true;
        });
      } else {
        setState(() {
          isLoading = true;
          resources.clear(); // Clear previous results only for fresh load
          _page = 1; // Reset to first page for fresh load
          _hasMoreData = true; // Reset pagination flag
        });
      }

      if (isLoadMore) {
        _page++; // Increment page before making the API call for load more
      }

      final result = await homeRepository.getResources(
        widget.educationLevel,
        widget.category,
        page: _page,
        limit: _limit,
      );

      // Check if we have more data based on response length
      _hasMoreData = result.length == _limit;

      setState(() {
        resources.addAll(result);
        if (!isLoadMore) {
          isLoading = false;
        }
      });
    } catch (e) {
      setState(() {
        if (!isLoadMore) {
          isLoading = false;
        }
      });
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Failed to load resources: $e')));
    } finally {
      if (isLoadMore) {
        setState(() {
          _isLoadingMore = false;
        });
      }
    }
  }

  // Pull to refresh functionality
  Future<void> _onRefresh() async {
    await getResources(); // This will reset pagination automatically
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
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: () {
              getResources(); // This will reset pagination automatically
            },
            tooltip: 'Refresh',
          ),
        ],
      ),
      body:
          isLoading
              ? TLoadingIndicator.build(message: "Loading Resources...")
              : resources.isEmpty
              ? const Center(child: Text("No resources available."))
              : RefreshIndicator(
                onRefresh: _onRefresh,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      ...resources.map((resource) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 5),
                          child: TCard(
                            height: 130,
                            leftIcon: CircleAvatar(
                              backgroundColor: TAppColors.primary.withOpacity(
                                0.2,
                              ),
                              child: Icon(
                                widget.category == ResourceCategory.general.value
                                    ? LucideIcons.bookOpen
                                    : LucideIcons.globe,
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
                                    style: Theme.of(context).textTheme.bodySmall
                                        ?.copyWith(color: Colors.grey),
                                  ),
                                ],
                              ),
                            ),
                            openLink: resource.link,
                          ),
                        );
                      }).toList(),
                      // Load More Button
                      if (_hasMoreData && resources.isNotEmpty) ...[
                        const SizedBox(height: 20),
                        Center(
                          child:
                              _isLoadingMore
                                  ? TLoadingIndicator.build(
                                    message: "Loading more resources...",
                                  )
                                  : ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: TAppColors.primary,
                                      foregroundColor: TAppColors.darkAccent,
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 32,
                                        vertical: 12,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                    ),
                                    onPressed: () async {
                                      await getResources(isLoadMore: true);
                                    },
                                    child: const Text(
                                      'Load More',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                        ),
                        const SizedBox(height: 20),
                      ],
                    ],
                  ),
                ),
              ),
    );
  }
}
