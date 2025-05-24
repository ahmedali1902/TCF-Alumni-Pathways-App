import 'package:alumni_pathways/features/home/presentation/resources_screen.dart';
import 'package:alumni_pathways/features/institute_search/presentation/institute_search_screen.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/colors.dart';

enum StudentEducation { none, matric, intermediate }

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  StudentEducation _selectedEducation = StudentEducation.matric;

  // @override
  // void initState() {
  //   super.initState();
  //   // Initialize any necessary data or state here
  //   setState(() {
  //     _selectedEducation = StudentEducation.matric;
  //   });
  // }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "TCF Alumni Pathways",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            fontFamily: 'Inter',
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Welcome Text
              const Text(
                "Welcome, User 👋",
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              // const SizedBox(height: 10),

              // // Container for the "Choose one" section with absolute positioned back button
              // SizedBox(
              //   height: 48, // Fixed height to prevent layout shift
              //   child: Stack(
              //     alignment: Alignment.center,
              //     children: [
              //       // Centered "Choose one" text
              //       const Center(
              //         child: Text(
              //           "Choose one",
              //           style: TextStyle(
              //             fontSize: 22,
              //             fontWeight: FontWeight.bold,
              //           ),
              //         ),
              //       ),
              //       // Back button positioned absolutely to the left
              //       // if (_selectedEducation != StudentEducation.none)
              //       //   Positioned(
              //       //     left: 0,
              //       //     child: IconButton(
              //       //       icon: const Icon(Icons.chevron_left),
              //       //       onPressed: () {
              //       //         setState(() {
              //       //           _selectedEducation = StudentEducation.none;
              //       //         });
              //       //       },
              //       //       padding: EdgeInsets.zero,
              //       //       constraints: const BoxConstraints(),
              //       //     ),
              //       //   ),
              //     ],
              //   ),
              // ),
              const SizedBox(height: 20),

              // Show different options based on selection
              // _selectedEducation == StudentEducation.none
              //     ? _buildInitialOptions(theme)
              //     : _buildSelectedOptions(theme),
              _buildSelectedOptions(theme),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInitialOptions(ThemeData theme) {
    return Column(
      children: [
        // First Option (Matriculation or Pursuing Matriculation)
        _buildEducationCard(
          title: "Matriculation or Pursuing Matriculation",
          icon: LucideIcons.bookOpen,
          color1: TAppColors.primary,
          color2: TAppColors.primary.withOpacity(0.7),
          theme: theme,
          onTap: () {
            setState(() {
              _selectedEducation = StudentEducation.matric;
            });
          },
        ),
        const SizedBox(height: 15),

        // "Or" Line (Light Gray)
        const Text(
          "--- or ---",
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 15),

        // Second Option (Intermediate or Pursuing Intermediate)
        _buildEducationCard(
          title: "Intermediate or Pursuing Intermediate",
          icon: LucideIcons.graduationCap,
          color1: TAppColors.primary,
          color2: TAppColors.primary.withOpacity(0.7),
          theme: theme,
          onTap: () {
            setState(() {
              _selectedEducation = StudentEducation.intermediate;
            });
          },
        ),
      ],
    );
  }

  Widget _buildSelectedOptions(ThemeData theme) {
    return Column(
      children: [
        // First Option (Conditional text based on selection)
        _buildEducationCard(
          title:
              _selectedEducation == StudentEducation.matric
                  ? "How to apply for college?"
                  : "How to apply for university?",
          icon: LucideIcons.helpCircle,
          color1: TAppColors.primary,
          color2: TAppColors.primary.withOpacity(0.7),
          theme: theme,
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const ResourcesScreen()),
            );
          },
        ),
        const SizedBox(height: 15),

        // "Or" Line (Light Gray)
        const Text(
          "--- or ---",
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 15),

        // Second Option ("How to avail TCF Scholarship?")
        _buildEducationCard(
          title: "How to avail TCF Scholarship?",
          icon: LucideIcons.graduationCap,
          color1: TAppColors.primary,
          color2: TAppColors.primary.withOpacity(0.7),
          theme: theme,
          onTap: () {
            // Handle "Where to apply?" action
          },
        ),
        const SizedBox(height: 15),
        // "Or" Line (Light Gray)
        const Text(
          "--- or ---",
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 15),
        // Third Option ("Where to apply?")
        _buildEducationCard(
          title:
              _selectedEducation == StudentEducation.matric
                  ? "Where to apply for college?"
                  : "Where to apply for university?",
          icon: LucideIcons.mapPin,
          color1: TAppColors.primary,
          color2: TAppColors.primary.withOpacity(0.7),
          theme: theme,
          onTap: () {
            // Handle "Where to apply?" action
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const InstituteSearchScreen(),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildEducationCard({
    required String title,
    required IconData icon,
    required Color color1,
    required Color color2,
    required ThemeData theme,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 30, horizontal: 10),
        margin: const EdgeInsets.symmetric(vertical: 5),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(15),
          gradient: LinearGradient(
            colors: [color1, color2],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 5,
              spreadRadius: 1,
              offset: const Offset(2, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 30, color: Colors.white),
            const SizedBox(height: 5),
            Text(
              title,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyLarge?.copyWith(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
