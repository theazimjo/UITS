package abs.uits.com.ui.teacher

import androidx.compose.ui.graphics.vector.ImageVector
import com.adamglin.PhosphorIcons
import com.adamglin.phosphoricons.Fill
import com.adamglin.phosphoricons.Regular
import com.adamglin.phosphoricons.fill.Gear
import com.adamglin.phosphoricons.fill.House
import com.adamglin.phosphoricons.fill.UsersThree
import com.adamglin.phosphoricons.fill.Wallet
import com.adamglin.phosphoricons.regular.Gear
import com.adamglin.phosphoricons.regular.House
import com.adamglin.phosphoricons.regular.UsersThree
import com.adamglin.phosphoricons.regular.Wallet

sealed class TeacherTab(val route: String, val label: String, val icon: ImageVector, val filledIcon: ImageVector) {
    object Home : TeacherTab("home", "Asosiy", PhosphorIcons.Regular.House, PhosphorIcons.Fill.House)
    object Students : TeacherTab("students", "O'quvchilar", PhosphorIcons.Regular.UsersThree, PhosphorIcons.Fill.UsersThree)
    object Finance : TeacherTab("finance", "Moliya", PhosphorIcons.Regular.Wallet, PhosphorIcons.Fill.Wallet)
    object Settings : TeacherTab("settings", "Sozlamalar", PhosphorIcons.Regular.Gear, PhosphorIcons.Fill.Gear)
}
