package abs.uits.com.ui.teacher

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.Settings
import androidx.compose.ui.graphics.vector.ImageVector

sealed class TeacherTab(val route: String, val label: String, val icon: ImageVector) {
    object Home : TeacherTab("home", "Asosiy", Icons.Default.Home)
    object Students : TeacherTab("students", "O'quvchilar", Icons.Default.Groups)
    object Finance : TeacherTab("finance", "Finance", Icons.Default.Payments)
    object Settings : TeacherTab("settings", "Sozlamalar", Icons.Default.Settings)
}
