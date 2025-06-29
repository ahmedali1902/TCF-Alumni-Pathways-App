import 'package:alumni_pathways/features/settings/domain/app_feedback_model.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:uuid/uuid.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/colors.dart';
import '../../../core/constants/enum.dart';
import '../../../core/services/http_service.dart';
import '../../../widgets/card.dart';
import 'package:flutter/gestures.dart';

import '../../home/repository/home_repository.dart';
import '../domain/institute_request_model.dart';
import '../repository/settings_repository.dart'; // Important for gesture recognizer

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
    {'title': 'Feedback', 'icon': LucideIcons.messageSquareDashed},
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
                        padding: const EdgeInsets.only(bottom: 3.0),
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
                                      return const InstituteAddScreen();
                                    case 'Feedback':
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
  int? _selectedGender;
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
          prefs.getInt('search_gender') ??
          Gender.coeducation.value; // Default to 'Coeducation'
      _admissionCriteria = prefs.getInt('search_admission_criteria') ?? 50;
    });
  }

  Future<void> _saveSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('search_distance', _distance);
    await prefs.setDouble('search_min_rating', _minRating);
    if (_selectedGender != null) {
      await prefs.setInt('search_gender', _selectedGender!);
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
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: const Text(
                'Save Settings',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
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
        DropdownButtonFormField<int>(
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
          items: [
            DropdownMenuItem(
              value: Gender.maleOnly.value,
              child: Text(Gender.maleOnly.toString()),
            ),
            DropdownMenuItem(
              value: Gender.femaleOnly.value,
              child: Text(Gender.femaleOnly.toString()),
            ),
            DropdownMenuItem(
              value: Gender.coeducation.value,
              child: Text(Gender.coeducation.toString()),
            ),
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

class InstituteAddScreen extends StatefulWidget {
  const InstituteAddScreen({super.key});

  @override
  State<InstituteAddScreen> createState() => _InstituteAddScreenState();
}

class _InstituteAddScreenState extends State<InstituteAddScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _programController = TextEditingController();
  final _locationController = TextEditingController();
  final _mapLinkController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _programController.dispose();
    _locationController.dispose();
    _mapLinkController.dispose();
    super.dispose();
  }

  void _submitForm() async {
    if (_formKey.currentState!.validate()) {
      final request = InstituteRequest(
        instituteName: _nameController.text.trim(),
        facultyName: _programController.text.trim(),
        instituteAddress: _locationController.text.trim(),
        instituteMapLink: _mapLinkController.text.trim(),
      );

      try {
        await SettingsRepository(
          ApiHandlerService(),
        ).addInstituteFeedback(request);
        if (!mounted) return;
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Institute request submitted successfully'),
          ),
        );
      } catch (e) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to submit request: $e')));
      }
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
                  hintText: 'e.g Near Gulistan-e-Johar, Karachi',
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
                            ? 'e.g Near Gulistan-e-Johar, Karachi'
                            : null,
              ),
              const SizedBox(height: 20),

              const Text(
                'Maps Link',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _mapLinkController,
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
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                child: const Text(
                  'Submit Add Request',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
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
  final _userNameController = TextEditingController();
  final _whatsappController = TextEditingController();
  final _feedbackController = TextEditingController();
  final _reasonIfOtherController = TextEditingController();

  int _reasonType = 1; // Default reason type
  int _experienceRating = 0; // 0 means no rating selected
  bool _isTcfAlumni = false;

  // Reason type options
  final List<String> _reasonOptions = [
    'General Feedback',
    'Complaint',
    'Suggestion',
    'Other'
  ];

  @override
  void dispose() {
    _userNameController.dispose();
    _whatsappController.dispose();
    _feedbackController.dispose();
    _reasonIfOtherController.dispose();
    super.dispose();
  }

  void _submitForm() async {
    if (_formKey.currentState!.validate()) {
      if (_experienceRating == 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select your experience rating')),
        );
        return;
      }

      final feedback = AppFeedbackModel(
        userName: _userNameController.text.trim(),
        reasonType: _reasonType,
        reasonIfOther: _reasonIfOtherController.text.trim(),
        experienceRating: _experienceRating,
        isTcfAlumni: _isTcfAlumni,
        whatsappNumber: _whatsappController.text.trim(),
        feedbackText: _feedbackController.text.trim(),
      );

      try {
        await SettingsRepository(ApiHandlerService()).addAppFeedback(feedback);
        if (!mounted) return;
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Feedback submitted successfully'),
          ),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to submit feedback: $e')),
        );
      }
    }
  }

  Widget _buildStarRating() {
    return Row(
      children: List.generate(5, (index) {
        return GestureDetector(
          onTap: () {
            setState(() {
              _experienceRating = index + 1;
            });
          },
          child: Icon(
            Icons.star,
            size: 40,
            color: index < _experienceRating 
                ? Colors.amber 
                : Colors.grey.shade300,
          ),
        );
      }),
    );
  }

  InputDecoration _getInputDecoration(String hintText) {
    return InputDecoration(
      hintText: hintText,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: TAppColors.primary),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: TAppColors.primary),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: TAppColors.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Colors.red),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Colors.red, width: 2),
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
          "App Feedback",
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
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // User Name
                const Text(
                  'Your Name',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: TextFormField(
                    controller: _userNameController,
                    decoration: _getInputDecoration('e.g John Doe'),
                    validator: (value) =>
                        value?.isEmpty ?? true ? 'Please enter your name' : null,
                  ),
                ),
                const SizedBox(height: 20),

                // WhatsApp Number
                const Text(
                  'WhatsApp Number',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: TextFormField(
                    controller: _whatsappController,
                    keyboardType: TextInputType.phone,
                    decoration: _getInputDecoration('e.g +92-300-1234567'),
                    validator: (value) =>
                        value?.isEmpty ?? true ? 'Please enter your WhatsApp number' : null,
                  ),
                ),
                const SizedBox(height: 20),

                // Feedback Reason Type
                const Text(
                  'Feedback Type',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: DropdownButtonFormField<int>(
                    value: _reasonType,
                    decoration: _getInputDecoration('Select feedback type'),
                    items: _reasonOptions.asMap().entries.map((entry) {
                      return DropdownMenuItem<int>(
                        value: entry.key + 1,
                        child: Text(entry.value),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        _reasonType = value ?? 1;
                      });
                    },
                  ),
                ),
                const SizedBox(height: 20),

                // Other Reason (if selected)
                if (_reasonType == 4) ...[
                  const Text(
                    'Please specify',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: TextFormField(
                      controller: _reasonIfOtherController,
                      decoration: _getInputDecoration('Please specify your reason'),
                      validator: (value) =>
                          _reasonType == 5 && (value?.isEmpty ?? true)
                              ? 'Please specify your reason'
                              : null,
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // Experience Rating
                const Text(
                  'Rate Your Experience',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildStarRating(),
                      const SizedBox(height: 4),
                      Text(
                        _experienceRating == 0 
                            ? 'Tap to rate your experience'
                            : 'Rating: $_experienceRating/5',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // TCF Alumni Checkbox
                SizedBox(
                  width: double.infinity,
                  child: CheckboxListTile(
                    title: const Text(
                      'I am a TCF Alumni',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                    value: _isTcfAlumni,
                    onChanged: (value) {
                      setState(() {
                        _isTcfAlumni = value ?? false;
                      });
                    },
                    controlAffinity: ListTileControlAffinity.leading,
                    contentPadding: EdgeInsets.zero,
                    activeColor: TAppColors.primary,
                  ),
                ),
                const SizedBox(height: 20),

                // Feedback Text
                const Text(
                  'Your Feedback',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: TextFormField(
                    controller: _feedbackController,
                    maxLines: 5,
                    decoration: _getInputDecoration(
                        'Tell us about your experience, suggestions, or any issues you faced...'),
                    validator: (value) =>
                        value?.isEmpty ?? true ? 'Please enter your feedback' : null,
                  ),
                ),
                const SizedBox(height: 30),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _submitForm,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: TAppColors.primary,
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: const Text(
                      'Submit Feedback',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
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
