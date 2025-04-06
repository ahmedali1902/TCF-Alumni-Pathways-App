import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/colors.dart';
import '../../../widgets/card.dart';
// import '../../../widgets/card.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
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
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TCard(
                leftIcon: CircleAvatar(
                  backgroundColor: TAppColors.primary.withOpacity(0.2),
                  child: Icon(Icons.person, color: TAppColors.primary),
                ),
                textWidget: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'User Profile',
                      style: Theme.of(context).textTheme.titleSmall,
                    ),
                    Text(
                      'View your account details',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
                rightIcon: Icon(Icons.favorite, color: Color(0XFFFF5A5F)),
                showRightIcon: true,
                onRightIconPressed: () => print('Right icon pressed'),
                height: 100,
              ),
              TCard(
                leftIcon: CircleAvatar(
                  backgroundColor: TAppColors.primary.withOpacity(0.2),
                  child: Icon(LucideIcons.megaphone, color: TAppColors.primary),
                ),
                textWidget: Text(
                  'Contact Support',
                  style: Theme.of(context).textTheme.titleSmall,
                ),
                openLink: 'whatsapp://send?phone=923181236267',
              ),
              // TCard(
              //   leftIcon: Icon(Icons.settings),
              //   textWidget: Text('App Settings'),
              //   onTap:
              //       () => Navigator.push(
              //         context,
              //         MaterialPageRoute(
              //           builder: (context) => const HomeScreen(),
              //         ),
              //       ),
              //   padding: const EdgeInsets.all(16),
              //   showRightIcon: false,
              //   height: 100,
              // ),
              const Text(
                "No favorites yet",
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
      ),
    );
  }
}



// import 'package:flutter/material.dart';
// import 'package:lucide_icons/lucide_icons.dart';
// import '../../../core/constants/colors.dart';
// import '../../../widgets/card.dart';
// // import '../../../widgets/card.dart';

// class FavoritesScreen extends StatefulWidget {
//   const FavoritesScreen({super.key});

//   @override
//   State<FavoritesScreen> createState() => _FavoritesScreenState();
// }

// class _FavoritesScreenState extends State<FavoritesScreen> {
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text(
//           "Favorites",
//           style: TextStyle(
//             fontSize: 24,
//             fontWeight: FontWeight.bold,
//             fontFamily: 'Inter',
//           ),
//         ),
//       ),
//       body: SingleChildScrollView(
//         child: Padding(
//           padding: const EdgeInsets.all(20.0),
//           child: Column(
//             mainAxisSize: MainAxisSize.min,
//             children: [
//               TCard(
//                 leftIcon: CircleAvatar(
//                   backgroundColor: TAppColors.primary.withOpacity(0.2),
//                   child: Icon(Icons.person, color: TAppColors.primary),
//                 ),
//                 textWidget: Column(
//                   mainAxisAlignment: MainAxisAlignment.center,
//                   crossAxisAlignment: CrossAxisAlignment.start,
//                   children: [
//                     Text(
//                       'User Profile',
//                       style: Theme.of(context).textTheme.titleSmall,
//                     ),
//                     Text(
//                       'View your account details',
//                       style: Theme.of(context).textTheme.bodySmall,
//                     ),
//                   ],
//                 ),
//                 rightIcon: Icon(Icons.favorite, color: Color(0XFFFF5A5F)),
//                 showRightIcon: true,
//                 onRightIconPressed: () => print('Right icon pressed'),
//                 height: 100,
//               ),
//               TCard(
//                 leftIcon: CircleAvatar(
//                   backgroundColor: TAppColors.primary.withOpacity(0.2),
//                   child: Icon(LucideIcons.megaphone, color: TAppColors.primary),
//                 ),
//                 textWidget: Text(
//                   'Contact Support',
//                   style: Theme.of(context).textTheme.titleSmall,
//                 ),
//                 openLink: 'whatsapp://send?phone=923181236267',
//               ),
//               // TCard(
//               //   leftIcon: Icon(Icons.settings),
//               //   textWidget: Text('App Settings'),
//               //   onTap:
//               //       () => Navigator.push(
//               //         context,
//               //         MaterialPageRoute(
//               //           builder: (context) => const HomeScreen(),
//               //         ),
//               //       ),
//               //   padding: const EdgeInsets.all(16),
//               //   showRightIcon: false,
//               //   height: 100,
//               // ),
//               const Text(
//                 "No favorites yet",
//                 style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }
