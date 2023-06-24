import 'package:flutter/material.dart';
import 'package:iconly/iconly.dart';

class TeamMenu extends StatelessWidget {
  const TeamMenu({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          "Team",
        ),
        const Icon(
          Icons.panorama_fisheye_rounded,
          size: 40,
        )
      ],
    );
  }
}
