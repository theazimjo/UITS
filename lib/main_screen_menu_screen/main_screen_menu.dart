import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iconly/iconly.dart';
import 'package:just_lesson_app/controller/main_wrapper_controller.dart';
import 'package:just_lesson_app/main_screen_menu_screen/view_menu/contact_menu.dart';
import 'package:just_lesson_app/main_screen_menu_screen/view_menu/home_menu.dart';
import 'package:just_lesson_app/main_screen_menu_screen/view_menu/services_menu.dart';
import 'package:just_lesson_app/main_screen_menu_screen/view_menu/team_menu.dart';
import 'package:zoom_tap_animation/zoom_tap_animation.dart';

import '../controller/color_constants.dart';
import '../themas.dart';

class mainScreenMenu extends StatelessWidget {
  static String routeName = "mainScreenMenu";

  final MainWrapperController controller = Get.put(MainWrapperController());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          "<UITS/>",
          style: Theme.of(context).textTheme.subtitle1?.copyWith(
            color: Colors.green,
            fontSize: 25.0,
          ),
        ),
      ),
      body: PageView(
        onPageChanged: controller.animateToTab,
        controller: controller.pageController,
        physics: const BouncingScrollPhysics(),
        children: const [
          homeMenu(),
          TeamMenu(),
          ServicesMenu(),
          ContactMenu(),
        ],
      ),
      bottomNavigationBar: BottomAppBar(
        elevation: 0,
        notchMargin: 10,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 35, vertical: 15),
          child: Obx(
            () => Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _bottomAppbarItem(
                  context,
                  icon: IconlyLight.home,
                  page: 0,
                  label: "Home",
                ),
                _bottomAppbarItemSecond(
                  context,
                  icon: IconlyLight.user_1,
                  page: 1,
                  label: "Team",
                ),
                _bottomAppbarItemThree(
                  context,
                  icon: IconlyLight.activity,
                  page: 2,
                  label: "Services",
                ),
                _bottomAppbarItemFive(
                  context,
                  icon: IconlyLight.discovery,
                  page: 3,
                  label: "Contact",
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _bottomAppbarItem(BuildContext context,
      {required icon, required page, required label}) {
    return ZoomTapAnimation(
      onTap: () => controller.goToTab(page),
      child: Container(
        color: Colors.transparent,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: controller.currentPage.value == page
                  ? ColorConstants.appColors
                  : Colors.grey,
            ),
            Text(
              label,
              style: TextStyle(
                color: controller.currentPage.value == page
                    ? ColorConstants.appColors
                    : Colors.grey,
                fontSize: 13.0,
                fontWeight: controller.currentPage.value == page
                    ? FontWeight.w600
                    : null,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _bottomAppbarItemSecond(BuildContext context,
      {required icon, required page, required label}) {
    return ZoomTapAnimation(
      onTap: () => controller.goToTab(page),
      child: Container(
        color: Colors.transparent,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: controller.currentPage.value == page
                  ? ColorConstants.appColors
                  : Colors.grey,
            ),
            Text(
              label,
              style: TextStyle(
                color: controller.currentPage.value == page
                    ? ColorConstants.appColors
                    : Colors.grey,
                fontSize: 13.0,
                fontWeight: controller.currentPage.value == page
                    ? FontWeight.w600
                    : null,
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _bottomAppbarItemThree(BuildContext context,
      {required icon, required page, required label}) {
    return ZoomTapAnimation(
      onTap: () => controller.goToTab(page),
      child: Container(
        color: Colors.transparent,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: controller.currentPage.value == page
                  ? ColorConstants.appColors
                  : Colors.grey,
            ),
            Text(
              label,
              style: TextStyle(
                color: controller.currentPage.value == page
                    ? ColorConstants.appColors
                    : Colors.grey,
                fontSize: 13.0,
                fontWeight: controller.currentPage.value == page
                    ? FontWeight.w600
                    : null,
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _bottomAppbarItemFive(BuildContext context,
      {required icon, required page, required label}) {
    return ZoomTapAnimation(
      onTap: () => controller.goToTab(page),
      child: Container(
        color: Colors.transparent,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: controller.currentPage.value == page
                  ? ColorConstants.appColors
                  : Colors.grey,
            ),
            Text(
              label,
              style: TextStyle(
                color: controller.currentPage.value == page
                    ? ColorConstants.appColors
                    : Colors.grey,
                fontSize: 13.0,
                fontWeight: controller.currentPage.value == page
                    ? FontWeight.w600
                    : null,
              ),
            )
          ],
        ),
      ),
    );
  }

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    super.debugFillProperties(properties);
    properties.add(
        DiagnosticsProperty<MainWrapperController>('controller', controller));
  }
}

// class menuPages extends StatelessWidget {
//   @override
//   Widget build(BuildContext context) {
//     // TODO: implement build
//     return Scaffold(
//       bottomNavigationBar: Container(
//         color: Colors.black,
//         child: Padding(
//           padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 20.0),
//           child: GNav(
//             backgroundColor: Colors.black,
//             color: Colors.white,
//             textStyle: TextStyle(
//               color: Colors.white,
//               fontWeight: FontWeight.w600,
//             ),
//             activeColor: Colors.white,
//             tabBackgroundColor: Colors.grey.shade800,
//             padding: EdgeInsets.all(16.0),
//             gap: 8,
//             onTabChange: (index) {
//               print(index);
//             },
//             tabs: const [
//               GButton(
//                 icon: Icons.home,
//                 text: "home()",
//               ),
//               GButton(
//                 icon: Icons.account_balance_wallet_outlined,
//                 text: "team()",
//                 // onPressed: () {
//                 //   Navigator.pushNamed(context, 'teamPage');
//                 // },
//               ),
//               GButton(
//                 icon: Icons.search,
//                 text: "services()",
//               ),
//               GButton(
//                 icon: Icons.settings,
//                 text: "contact()",
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }

// class bottomAppbar extends StatelessWidget {
//   const bottomAppbar({super.key});
//
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       bottomNavigationBar: BottomAppBar(
//         elevation: 0,
//         notchMargin: 10,
//         child: Container(
//           padding: EdgeInsets.symmetric(horizontal: 35, vertical: 15),
//           child: Row(
//             mainAxisAlignment: MainAxisAlignment.spaceBetween,
//             children: [
//               _bottomAppbarItem(
//                 context,
//                 icon: IconlyLight.home,
//                 page: 0,
//                 label: "Home",
//               ),
//               _bottomAppbarItemSecond(
//                 context,
//                 icon: IconlyLight.chart,
//                 page: 0,
//                 label: "Team",
//               ),
//               _bottomAppbarItemThree(
//                 context,
//                 icon: IconlyLight.home,
//                 page: 0,
//                 label: "Services",
//               ),
//               _bottomAppbarItemFive(
//                 context,
//                 icon: IconlyLight.home,
//                 page: 0,
//                 label: "Contact",
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
//
//   Widget _bottomAppbarItem(BuildContext context,
//       {required icon, required page, required label}) {
//     return ZoomTapAnimation(
//       onTap: () {},
//       child: Container(
//         color: Colors.transparent,
//         child: Column(
//           mainAxisSize: MainAxisSize.min,
//           children: [Icon(Icons.home), Text(label)],
//         ),
//       ),
//     );
//   }
//
//   Widget _bottomAppbarItemSecond(BuildContext context,
//       {required icon, required page, required label}) {
//     return ZoomTapAnimation(
//       onTap: () {},
//       child: Container(
//         color: Colors.transparent,
//         child: Column(
//           mainAxisSize: MainAxisSize.min,
//           children: [Icon(Icons.wallet), Text(label)],
//         ),
//       ),
//     );
//   }
//
//   Widget _bottomAppbarItemThree(BuildContext context,
//       {required icon, required page, required label}) {
//     return ZoomTapAnimation(
//       onTap: () {},
//       child: Container(
//         color: Colors.transparent,
//         child: Column(
//           mainAxisSize: MainAxisSize.min,
//           children: [Icon(Icons.miscellaneous_services), Text(label)],
//         ),
//       ),
//     );
//   }
//
//   Widget _bottomAppbarItemFive(BuildContext context,
//       {required icon, required page, required label}) {
//     return ZoomTapAnimation(
//       onTap: () {},
//       child: Container(
//         color: Colors.transparent,
//         child: Column(
//           mainAxisSize: MainAxisSize.min,
//           children: [Icon(Icons.contact_phone_rounded), Text(label)],
//         ),
//       ),
//     );
//   }
// }
