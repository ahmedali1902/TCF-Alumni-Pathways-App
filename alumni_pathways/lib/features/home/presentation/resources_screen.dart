import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/colors.dart';
import '../../../widgets/card.dart';

class ResourcesScreen extends StatelessWidget {
  const ResourcesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final resources = [
      {
        'title': 'Scholarship Application Guide',
        'icon': LucideIcons.fileText,
        'description': 'Step-by-step guide to applying for scholarships',
        'link': 'https://example.com/scholarship-guide',
      },
      {
        'title': 'Career Pathways Handbook',
        'icon': LucideIcons.bookOpen,
        'description': 'Explore different career options after graduation',
        'link': 'https://example.com/career-handbook',
      },
      {
        'title': 'University Preparation',
        'icon': LucideIcons.graduationCap,
        'description': 'Tips for university applications and tests',
        'link': 'https://example.com/university-prep',
      },
      {
        'title': 'Internship Opportunities',
        'icon': LucideIcons.briefcase,
        'description': 'Find internships that match your skills and interests',
        'link': 'https://example.com/internships',
      },
      {
        'title': 'Resume Building Workshop',
        'icon': LucideIcons.fileText,
        'description': 'Learn how to create a standout resume',
        'link': 'https://example.com/resume-workshop',
      },
      {
        'title': 'Interview Preparation Tips',
        'icon': LucideIcons.mic,
        'description': 'Get ready for your next job interview',
        'link': 'https://example.com/interview-tips',
      },
      {
        'title': 'TCF Alumni Pathways Whatsapp Group',
        'icon': LucideIcons.messageSquare,
        'description': 'Join our community for support and networking',
        'link': 'https://example.com/whatsapp-group',
      },
    ];

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft), // Using chevron left icon
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
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            children:
                resources.map((resource) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 5),
                    child: TCard(
                      height: 90,
                      leftIcon: CircleAvatar(
                        backgroundColor: TAppColors.primary.withOpacity(0.2),
                        child: Icon(
                          resource['icon'] as IconData,
                          color: TAppColors.primary,
                        ),
                      ),
                      textWidget: SizedBox(
                        height: 70, // Fixed height for vertical centering
                        child: Column(
                          mainAxisAlignment:
                              MainAxisAlignment.center, // Vertical center
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              resource['title'] as String,
                              style: Theme.of(context).textTheme.titleSmall
                                  ?.copyWith(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              resource['description'] as String,
                              style: Theme.of(context).textTheme.bodySmall
                                  ?.copyWith(color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                      openLink: resource['link'] as String,
                    ),
                  );
                }).toList(),
          ),
        ),
      ),
    );
  }
}
