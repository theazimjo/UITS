import 'package:flutter/material.dart';
import 'package:just_lesson_app/main_screen_menu_screen/main_screen_menu.dart';

class SplashScreen extends StatelessWidget {
  // route name for our screen
  static String routeName = "SplashScreen";

  @override
  Widget build(BuildContext context) {
    // scalfond  color set to primary color in main in our text theme
    return Scaffold(
      body: Column(
        children: <Widget>[
          Expanded(
            // screen page in class
            child: mainPage(),
          )
        ],
      ),
    );
  }
}

class mainPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // we use future to go from one screen to other via duration time
    Future.delayed(Duration(seconds: 5), (){
      // no return is splash
      Navigator.pushNamedAndRemoveUntil(context, mainScreenMenu.routeName,  (route) => false);
      },
    );
    return Container(
      margin: EdgeInsets.only(top: 70.0),
      child: Column(
        children: <Widget>[
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Text(
                "<",
                style: TextStyle(
                  fontSize: 30.0,
                  color: Colors.green,
                ),
              ),
              Text(
                "UITS",
                style: TextStyle(
                  fontSize: 30.0,
                  color: Colors.black,
                ),
              ),
              Text(
                "/>",
                style: TextStyle(
                  fontSize: 30.0,
                  color: Colors.green,
                ),
              ),
            ],
          ),
          Image.asset("assets/images/main.jpg"),
          Container(
            margin: EdgeInsets.only(top: 60.0,),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      "IT Hamma uchun",
                      style: TextStyle(
                        fontSize: 25.0,
                        color: Colors.green,
                      ),
                    ),
                    Text(
                      ": do'stona",
                      style: TextStyle(
                        fontSize: 25.0,
                        color: Colors.black,
                      ),
                    ),
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      "va qulay muhitda o'rganishni",
                      style: TextStyle(
                        fontSize: 25.0,
                        color: Colors.black,
                      ),
                    ),
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      "boshlang!",
                      style: TextStyle(
                        fontSize: 25.0,
                        color: Colors.black,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}