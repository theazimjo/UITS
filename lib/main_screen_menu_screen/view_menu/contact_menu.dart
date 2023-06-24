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
          "Home",
        ),
        const Icon(
          Icons.contact_support_outlined,
          size: 40,
        )
      ],
    );
  }
}
