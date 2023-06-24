import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_navigation/src/root/get_material_app.dart';
import 'package:just_lesson_app/constants.dart';
import 'package:just_lesson_app/controller/main_wrapper_controller.dart';
import 'package:just_lesson_app/routes.dart';
import 'package:just_lesson_app/screens/splash_screen/splash_screen.dart';
import 'package:just_lesson_app/themas.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      debugShowCheckedModeBanner: false,
      title: "IT school",
      // initial  route is splash screen
      // mean first screen
      initialRoute: SplashScreen.routeName,
      // define the routes  file here in order to acces the router any were all over
      routes: routes,
    );
  }
}
