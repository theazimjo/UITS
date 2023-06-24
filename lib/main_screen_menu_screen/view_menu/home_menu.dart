import 'dart:async';
import 'package:flutter/material.dart';
import 'package:iconly/iconly.dart';

class homeMenu extends StatelessWidget {
  const homeMenu({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AutoSlideshow(),
    );
  }
}

class AutoSlideshow extends StatefulWidget {
  @override
  _AutoSlideshowState createState() => _AutoSlideshowState();
}

class _AutoSlideshowState extends State<AutoSlideshow> {
  late PageController _pageController;
  late Timer _timer;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _currentPage);
    _startTimer();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _timer.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(Duration(seconds: 3), (timer) {
      if (_currentPage < 2) {
        _currentPage++;
      } else {
        _currentPage = 0;
      }
      _pageController.animateToPage(
        _currentPage,
        duration: Duration(milliseconds: 300),
        curve: Curves.easeIn,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Center(
            child: Container(
              height: 200.0,
              child: PageView(
                controller: _pageController,
                onPageChanged: (int page) {
                  setState(() {
                    _currentPage = page;
                  });
                },
                children: <Widget>[
                  Container(
                    color: Colors.white,
                    child: Center(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Barchasiga",
                                style: TextStyle(
                                  fontSize: 26.0,
                                  letterSpacing: 1,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              Text(
                                "Birgalikda Erishamiz",
                                style: TextStyle(
                                    fontSize: 19.0,
                                    fontWeight: FontWeight.w300),
                              ),
                              Container(
                                margin: EdgeInsets.only(top: 20),
                                child: OutlinedButton(
                                  child: Text("Barchasi"),
                                  onPressed: () {
                                    Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            AllOfWe(data: "This is allof page"),
                                      ),
                                    );
                                  },
                                ),
                              ),
                            ],
                          ),
                          Column(
                            children: [
                              Expanded(
                                child: Image.asset("assets/images/up.jpg"),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  Container(
                    color: Colors.green,
                    child: Center(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          // Expanded(
                          //   child: Image.asset(
                          //     "assets/images/mission.jpg",
                          //   ),
                          // ),
                          Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Text(
                                "Bizning Missiya",
                                style: TextStyle(
                                  fontSize: 30.0,
                                  color: Colors.white,
                                  letterSpacing: 1,
                                  fontWeight: FontWeight.w300,
                                ),
                              ),
                              Container(
                                margin: EdgeInsets.only(top: 20),
                                child: OutlinedButton(
                                  child: Text(
                                    "Ko'rish",
                                    style: TextStyle(
                                      color: Colors.white
                                    ),
                                  ),
                                  onPressed: () {
                                    Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (context) => AllOfWe(
                                            data:
                                                "Hello there from this first page"),
                                      ),
                                    );
                                  },
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  Container(
                    color: Colors.blue,
                    child: Center(
                      child: Text(
                        'slide 3',
                        style: TextStyle(fontSize: 24.0, color: Colors.white),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// first slideshow manu in like menu
class AllOfWe extends StatelessWidget {
  final String data;

  AllOfWe({
    Key? key,
    required this.data,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        title: Text("<UITS/>"),
      ),
      body: Center(
        child: Column(
          children: [Text("Second page")],
        ),
      ),
    );
  }
}

//
// Column(
// children: [
// Image.asset("assets/images/mission.jpg"),
// Column(
// children: [
// Container(
// child: Row(
// crossAxisAlignment: CrossAxisAlignment.center,
// mainAxisAlignment: MainAxisAlignment.center,
// children: [
// Text(
// "Bizning Missiya",
// style: TextStyle(
// fontSize: 35.0,
// color: Colors.black,
// ),
// ),
// ],
// ),
// ),
// Container(
// margin: EdgeInsets.only(top: 10.0),
// child: Column(
// children: [
// Column(
// children: [
// Text(
// "O'zbekistonlik IT-tadbirkorlar",
// style: TextStyle(
// fontSize: 19,
// ),
// ),
// ],
// ),
// Column(
// children: [
// Text(
// "global bozorda muvaffaqiyatli",
// style: TextStyle(
// fontSize: 19,
// ),
// ),
// ],
// ),
// Column(
// children: [
// Text(
// "faoliyat yuritishi, yurtimiz va butun",
// style: TextStyle(
// fontSize: 19,
// ),
// ),
// ],
// ),
// Column(
// children: [
// Text(
// "jaxonning faxriga aylanishi uchun",
// style: TextStyle(
// fontSize: 19,
// ),
// ),
// ],
// ),
// Column(
// children: [
// Text(
// "mexnat qilamiz!",
// style: TextStyle(
// fontSize: 19,
// ),
// ),
// ],
// ),
// ],
// ),
// ),
// ],
// ),
//
//
// ],
// ),
