import 'package:flutter/material.dart';

import 'controller/color_constants.dart';

class Themes {
  static ThemeData lightTheme = ThemeData(
      fontFamily: "Open sans",
      primaryColor: Colors.blue,
      brightness: Brightness.light,
      appBarTheme: AppBarTheme(
          titleTextStyle: const TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.w400,
          ),
          iconTheme: const IconThemeData(color: Colors.black),
          backgroundColor: Colors.grey.shade50,
          elevation: 0),
      inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(
              borderSide: BorderSide.none,
              borderRadius: BorderRadius.circular(10)),
          hintStyle: const TextStyle(
            fontSize: 14,
          )),
      cardColor: Colors.grey.shade200,
      progressIndicatorTheme:
          const ProgressIndicatorThemeData(color: Colors.red),
      textTheme: TextTheme(
          headline1: const TextStyle(
        letterSpacing: -1.5,
        fontSize: 48,
        color: Colors.black,
        fontWeight: FontWeight.bold,
      )));

  static ThemeData darkTheme = ThemeData(
      fontFamily: "Open sans",
      primaryColor: Colors.blue,
      primarySwatch: Colors.blue,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: ColorConstants.gray900,
      appBarTheme: AppBarTheme(
        backgroundColor: ColorConstants.gray900,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      bottomAppBarColor: ColorConstants.gray800,
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderSide: BorderSide.none,
          borderRadius: BorderRadius.circular(10)),
        hintStyle: const TextStyle(
          fontSize: 14,
        )
      ));
}
