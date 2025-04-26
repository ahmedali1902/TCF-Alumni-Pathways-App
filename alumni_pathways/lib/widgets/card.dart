import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class TCard extends StatelessWidget {
  final Widget leftIcon;
  final Widget textWidget;
  final Widget? rightIcon;
  final bool showRightIcon;
  final VoidCallback? onRightIconPressed;
  final String? openLink;
  final double height;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;

  const TCard({
    super.key,
    required this.leftIcon,
    required this.textWidget,
    this.rightIcon,
    this.showRightIcon = false,
    this.onRightIconPressed,
    this.openLink,
    this.height = 80,
    this.padding,
    this.onTap,
  });

  Future<void> _launchUrl() async {
    if (openLink != null && await canLaunchUrl(Uri.parse(openLink!))) {
      await launchUrl(
        Uri.parse(openLink!),
        mode: LaunchMode.externalApplication,
      );
    } else {
      debugPrint("Could not launch URL: $openLink");
    }
  }

  @override
  Widget build(BuildContext context) {
    try {
      final brightness = Theme.of(context).brightness;
      final bgColor =
          brightness == Brightness.dark ? Colors.grey[900]! : Colors.grey[200]!;

      return SizedBox(
        height: height,
        child: MouseRegion(
          cursor: SystemMouseCursors.click,
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: openLink != null ? _launchUrl : onTap,
            child: Container(
              margin: const EdgeInsets.symmetric(vertical: 8),
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.15),
                    blurRadius: 8,
                    spreadRadius: 1,
                    offset: const Offset(0, 4),
                  ),
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 3,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Padding(
                padding: padding ?? const EdgeInsets.symmetric(horizontal: 12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(right: 12),
                      child: leftIcon,
                    ),
                    Expanded(
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: textWidget,
                      ),
                    ),
                    if (showRightIcon && rightIcon != null)
                      IconButton(
                        icon: rightIcon!,
                        onPressed: onRightIconPressed,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        splashRadius: 20, // Custom splash radius for icon
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    } catch (e) {
      debugPrint('TCard error: $e');
      return ErrorWidget(e);
    }
  }
}
