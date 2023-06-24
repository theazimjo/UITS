import 'package:flutter/cupertino.dart';
import 'package:just_lesson_app/main_screen_menu_screen/main_screen_menu.dart';
import 'package:just_lesson_app/screens/splash_screen/splash_screen.dart';

Map<String, WidgetBuilder> routes = {
  //all screen will be registered here like manifest in android
  SplashScreen.routeName : (context) => SplashScreen(),
  mainScreenMenu.routeName : (context) => mainScreenMenu(),
};