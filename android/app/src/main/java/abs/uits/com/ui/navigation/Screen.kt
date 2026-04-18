package abs.uits.com.ui.navigation

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object AdminDashboard : Screen("admin_dashboard")
    object TeacherDashboard : Screen("teacher_dashboard")
    object ParentDashboard : Screen("parent_dashboard")
}
