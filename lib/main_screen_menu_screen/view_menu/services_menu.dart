import 'package:flutter/material.dart';
import 'package:iconly/iconly.dart';

class ServicesMenu extends StatelessWidget {
  const ServicesMenu({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          "Home",
        ),
        const Icon(
          Icons.settings,
          size: 40,
        )
      ],
    );
  }
}
