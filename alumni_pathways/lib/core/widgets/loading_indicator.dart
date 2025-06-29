import 'package:alumni_pathways/core/constants/colors.dart';
import 'package:flutter/material.dart';

class TLoadingIndicator {
  static Widget build({String? message}) {
    return _buildLoadingIndicator(message: message);
  }
}

Widget _buildLoadingIndicator({String? message}) {
  return Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        RotationTransition(
          turns: const AlwaysStoppedAnimation(0.75),
          child: Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(25),
              border: Border.all(
                color: TAppColors.primary,
                width: 4,
                style: BorderStyle.solid,
              ),
            ),
            child: const Padding(
              padding: EdgeInsets.all(8.0),
              child: CircularProgressIndicator(
                color: TAppColors.primary,
                strokeWidth: 2,
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
        if(message != null) Text(
          message,
          style: TextStyle(color: TAppColors.primary),
        ),
      ],
    ),
  );
}
