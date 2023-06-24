import 'package:flutter/material.dart';
import 'package:iconly/iconly.dart';

class ContactMenu extends StatelessWidget {
  const ContactMenu({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          "Beta version",
        ),
        const Icon(
          Icons.help,
          size: 40,
        )
      ],
    );
  }
}
