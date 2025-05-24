import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:uuid/uuid.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/colors.dart';
import '../../../widgets/card.dart';
import 'package:flutter/gestures.dart'; // Important for gesture recognizer

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final String deviceId = const Uuid().v4();

  final List<Map<String, dynamic>> _settingsOptions = [
    {'title': 'Search Settings', 'icon': LucideIcons.search},
    {'title': 'Privacy Policy', 'icon': LucideIcons.shield},
    {'title': 'Institue Add Request', 'icon': LucideIcons.messageSquare},
    {'title': 'About', 'icon': LucideIcons.info},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Settings",
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
            children: [
              Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: TAppColors.primary.withOpacity(0.2),
                    child: Icon(
                      LucideIcons.smartphone,
                      size: 40,
                      color: TAppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    "Device ID:",
                    style: Theme.of(
                      context,
                    ).textTheme.bodyMedium?.copyWith(color: Colors.grey),
                  ),
                  Text(
                    deviceId,
                    style: Theme.of(
                      context,
                    ).textTheme.bodySmall?.copyWith(color: Colors.grey),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
              const SizedBox(height: 32),
              Column(
                children:
                    _settingsOptions.map((option) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 5.0),
                        child: TCard(
                          height: 70,
                          leftIcon: CircleAvatar(
                            backgroundColor: TAppColors.primary.withOpacity(
                              0.2,
                            ),
                            child: Icon(
                              option['icon'],
                              color: TAppColors.primary,
                            ),
                          ),
                          textWidget: SizedBox(
                            height: 50,
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  option['title'],
                                  style: Theme.of(context).textTheme.titleSmall,
                                ),
                              ],
                            ),
                          ),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) {
                                  switch (option['title']) {
                                    case 'Search Settings':
                                      return const SearchSettingsScreen();
                                    case 'Privacy Policy':
                                      return const PrivacyPolicyScreen();
                                    case 'Institue Add Request':
                                      return const FeedbackScreen();
                                    case 'About':
                                      return const AboutScreen();
                                    default:
                                      return const Scaffold(
                                        body: Center(
                                          child: Text('Hello World'),
                                        ),
                                      );
                                  }
                                },
                              ),
                            );
                          },
                        ),
                      );
                    }).toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class SearchSettingsScreen extends StatefulWidget {
  const SearchSettingsScreen({super.key});

  @override
  State<SearchSettingsScreen> createState() => _SearchSettingsScreenState();
}

class _SearchSettingsScreenState extends State<SearchSettingsScreen> {
  int _distance = 10;
  double _minRating = 3.0;
  String? _selectedGender;
  int _admissionCriteria = 50;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _distance = prefs.getInt('search_distance') ?? 10;
      _minRating = prefs.getDouble('search_min_rating') ?? 3.0;
      _selectedGender =
          prefs.getString('search_gender') ?? '3'; // Default to 'Coeducation'
      _admissionCriteria = prefs.getInt('search_admission_criteria') ?? 50;
    });
  }

  Future<void> _saveSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('search_distance', _distance); // Convert km to meters
    await prefs.setDouble('search_min_rating', _minRating);
    if (_selectedGender != null) {
      await prefs.setString('search_gender', _selectedGender!);
    }
    await prefs.setInt('search_admission_criteria', _admissionCriteria);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Settings saved successfully')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft), // Using chevron left icon
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          "Search Settings",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            fontFamily: 'Inter',
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            _buildDistanceSlider(),
            const SizedBox(height: 20),
            _buildRatingSlider(),
            const SizedBox(height: 20),
            _buildGenderDropdown(),
            const SizedBox(height: 20),
            _buildAdmissionCriteriaSlider(),
            const Spacer(),
            ElevatedButton(
              onPressed: _saveSettings,
              style: ElevatedButton.styleFrom(
                backgroundColor: TAppColors.primary,
                minimumSize: const Size(double.infinity, 50),
              ),
              child: const Text(
                'Save Settings',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDistanceSlider() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Max distance from me: $_distance km',
          style: Theme.of(context).textTheme.titleSmall,
        ),
        Slider(
          value: _distance.toDouble(),
          min: 1,
          max: 40,
          divisions: 20,
          label: '$_distance km',
          onChanged: (value) => setState(() => _distance = value.round()),
          activeColor: TAppColors.primary,
        ),
      ],
    );
  }

  Widget _buildRatingSlider() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Institute Minimum Rating: ${_minRating.toStringAsFixed(1)}',
          style: Theme.of(context).textTheme.titleSmall,
        ),
        Slider(
          value: _minRating,
          min: 1,
          max: 5,
          divisions: 8,
          label: _minRating.toStringAsFixed(1),
          onChanged: (value) => setState(() => _minRating = value),
          activeColor: TAppColors.primary,
        ),
      ],
    );
  }

  Widget _buildGenderDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Gender Preference',
          style: Theme.of(context).textTheme.titleSmall,
        ),
        DropdownButtonFormField<String>(
          value: _selectedGender,
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 15,
              vertical: 10,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(
                color: TAppColors.primary,
              ), // Active border color
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(
                color: TAppColors.primary,
              ), // Enabled border color
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(
                color: TAppColors.primary,
                width: 2,
              ), // Focused border color
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(
                color: Colors.red,
              ), // Error border color
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(
                color: Colors.red,
                width: 2,
              ), // Focused error border
            ),
          ),
          items: const [
            DropdownMenuItem(value: '1', child: Text('Male Only')),
            DropdownMenuItem(value: '2', child: Text('Female Only')),
            DropdownMenuItem(value: '3', child: Text('Coeducation')),
          ],
          onChanged: (value) => setState(() => _selectedGender = value),
          hint: const Text('Select gender'),
        ),
      ],
    );
  }

  Widget _buildAdmissionCriteriaSlider() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'SSC/HSC Percentage: $_admissionCriteria%',
          style: Theme.of(context).textTheme.titleSmall,
        ),
        Slider(
          value: _admissionCriteria.toDouble(),
          min: 1,
          max: 100,
          divisions: 99,
          label: '$_admissionCriteria%',
          onChanged:
              (value) => setState(() => _admissionCriteria = value.round()),
          activeColor: TAppColors.primary,
        ),
      ],
    );
  }
}

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft), // Using chevron left icon
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          "Privacy Policy",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            fontFamily: 'Inter',
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Data Collection and Usage',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 15),
            Text(
              'We collect the following data to provide and improve our service:',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 10),
            _buildPolicyItem(
              'Location Data',
              'We collect your location data to provide location-based services and improve search results.',
            ),
            _buildPolicyItem(
              'Educational Data',
              'Information about your educational background is used to provide personalized recommendations.',
            ),
            _buildPolicyItem(
              'Usage Data',
              'We collect how you interact with our app to improve user experience and for marketing purposes.',
            ),
            const SizedBox(height: 20),
            Text(
              'All data is stored securely on our servers and is used solely for educational and marketing purposes within our platform.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPolicyItem(String title, String description) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const SizedBox(height: 5),
          Text(description),
        ],
      ),
    );
  }
}

class FeedbackScreen extends StatefulWidget {
  const FeedbackScreen({super.key});

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _programController = TextEditingController();
  final _locationController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _programController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Institute request submitted successfully'),
        ),
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
          "Institute Add Request",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            fontFamily: 'Inter',
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start, // align labels left
            children: [
              const Text(
                'Institute Name',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(
                  hintText: 'e.g Habib University',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(
                      color: TAppColors.primary,
                    ), // Active border color
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(
                      color: TAppColors.primary,
                    ), // Enabled border color
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(
                      color: TAppColors.primary,
                      width: 2,
                    ), // Focused border color
                  ),
                  errorBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(
                      color: Colors.red,
                    ), // Error border color
                  ),
                  focusedErrorBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(
                      color: Colors.red,
                      width: 2,
                    ), // Focused error border
                  ),
                ),
                validator:
                    (value) =>
                        value?.isEmpty ?? true ? 'e.g Habib University' : null,
              ),
              const SizedBox(height: 20),

              const Text(
                'Program',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _programController,
                decoration: InputDecoration(
                  hintText: 'e.g BS Computer Science, BBA, etc',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(
                      color: TAppColors.primary,
                    ), // Active border color
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(
                      color: TAppColors.primary,
                    ), // Enabled border color
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(
                      color: TAppColors.primary,
                      width: 2,
                    ), // Focused border color
                  ),
                  errorBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(
                      color: Colors.red,
                    ), // Error border color
                  ),
                  focusedErrorBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(
                      color: Colors.red,
                      width: 2,
                    ), // Focused error border
                  ),
                ),
                validator:
                    (value) =>
                        value?.isEmpty ?? true
                            ? 'e.g BS Computer Science, BBA, etc'
                            : null,
              ),
              const SizedBox(height: 20),

              const Text(
                'Location',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _locationController,
                decoration: InputDecoration(
                  hintText: 'e.g Gulistan-e-Johar, near Farhan Biryani',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(
                      color: TAppColors.primary,
                    ), // Active border color
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(
                      color: TAppColors.primary,
                    ), // Enabled border color
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(
                      color: TAppColors.primary,
                      width: 2,
                    ), // Focused border color
                  ),
                  errorBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(
                      color: Colors.red,
                    ), // Error border color
                  ),
                  focusedErrorBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(
                      color: Colors.red,
                      width: 2,
                    ), // Focused error border
                  ),
                ),
                validator:
                    (value) =>
                        value?.isEmpty ?? true
                            ? 'e.g Gulistan-e-Johar, near Farhan Biryani'
                            : null,
              ),
              const SizedBox(height: 20),

              const Text(
                'Maps Link',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _programController,
                decoration: InputDecoration(
                  hintText: 'e.g https://goo.gl/maps/xyz',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(
                      color: TAppColors.primary,
                    ), // Active border color
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(
                      color: TAppColors.primary,
                    ), // Enabled border color
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide(
                      color: TAppColors.primary,
                      width: 2,
                    ), // Focused border color
                  ),
                  errorBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(
                      color: Colors.red,
                    ), // Error border color
                  ),
                  focusedErrorBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(
                      color: Colors.red,
                      width: 2,
                    ), // Focused error border
                  ),
                ),
                validator:
                    (value) =>
                        value?.isEmpty ?? true
                            ? 'e.g https://goo.gl/maps/xyz'
                            : null,
              ),
              const Spacer(),
              ElevatedButton(
                onPressed: _submitForm,
                style: ElevatedButton.styleFrom(
                  backgroundColor: TAppColors.primary,
                  minimumSize: const Size(double.infinity, 50),
                ),
                child: const Text(
                  'Submit',
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          "About",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            fontFamily: 'Inter',
          ),
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(height: 20),
            CircleAvatar(
              radius: 50,
              backgroundColor: TAppColors.primary.withOpacity(0.2),
              child: Icon(
                LucideIcons.smartphone,
                size: 50,
                color: TAppColors.primary,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'TCF Alumni Pathways App',
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 5),
            Text('v1.0.0', style: Theme.of(context).textTheme.bodyLarge),
            const SizedBox(height: 10),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                'This app is built to help TCF students find their career pathway, the institutes they can apply using TCF scholarship, and to stay updated with real-time notifications.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.only(bottom: 20),
              child: RichText(
                textAlign: TextAlign.center,
                text: TextSpan(
                  style: Theme.of(
                    context,
                  ).textTheme.bodyMedium?.copyWith(color: Colors.grey),
                  children: [
                    const TextSpan(text: 'Developed with ❤️ by '),
                    TextSpan(
                      text: 'Ahsan',
                      style: TextStyle(
                        color: TAppColors.primary,
                        decoration: TextDecoration.underline,
                        decorationColor:
                            TAppColors
                                .primary, // underline color same as text color
                      ),
                      recognizer:
                          TapGestureRecognizer()
                            ..onTap = () {
                              launchUrl(Uri.parse('https://ahsan.tech'));
                            },
                    ),
                    const TextSpan(text: ' & '),
                    TextSpan(
                      text: 'Ahmed',
                      style: TextStyle(
                        color: TAppColors.primary,
                        decoration: TextDecoration.underline,
                        decorationColor:
                            TAppColors
                                .primary, // underline color same as text color
                      ),
                      recognizer:
                          TapGestureRecognizer()
                            ..onTap = () {
                              launchUrl(
                                Uri.parse('https://github.com/ahmedali1902'),
                              );
                            },
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
