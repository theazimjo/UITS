package abs.uits.com.ui.teacher

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import abs.uits.com.ui.teacher.components.*
import abs.uits.com.ui.teacher.segments.*

sealed class TeacherTab(val route: String, val label: String, val icon: ImageVector) {
    object Home : TeacherTab("home", "Asosiy", Icons.Default.Home)
    object Students : TeacherTab("students", "O'quvchilar", Icons.Default.Groups)
    object Finance : TeacherTab("finance", "Finance", Icons.Default.Payments)
    object Settings : TeacherTab("settings", "Sozlamalar", Icons.Default.Settings)
}

@Composable
fun TeacherDashboardScreen(
    onLogout: () -> Unit
) {
    var selectedTab by remember { mutableStateOf<TeacherTab>(TeacherTab.Home) }
    val teacherViewModel: TeacherViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                @Suppress("UNCHECKED_CAST")
                return TeacherViewModel() as T
            }
        }
    )

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = {
            Column(modifier = Modifier.navigationBarsPadding()) {
                Surface(
                    color = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column {
                        HorizontalDivider(
                            color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f), 
                            thickness = 0.5.dp
                        )
                        NavigationBar(
                            containerColor = Color.Transparent,
                            tonalElevation = 0.dp,
                            windowInsets = WindowInsets(0, 0, 0, 0)
                        ) {
                            val tabs = listOf(TeacherTab.Home, TeacherTab.Students, TeacherTab.Finance, TeacherTab.Settings)
                            tabs.forEach { tab ->
                                val isSelected = selectedTab == tab
                                NavigationBarItem(
                                    selected = isSelected,
                                    onClick = { selectedTab = tab },
                                    icon = { 
                                        Icon(
                                            tab.icon, 
                                            contentDescription = tab.label,
                                            tint = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
                                        ) 
                                    },
                                    label = { 
                                        Text(
                                            tab.label,
                                            style = MaterialTheme.typography.labelSmall,
                                            fontSize = 11.sp,
                                            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
                                        ) 
                                    },
                                    colors = NavigationBarItemDefaults.colors(
                                        indicatorColor = Color.Transparent
                                    )
                                )
                            }
                        }
                    }
                }
            }
        }
    ) { padding ->
        Box(modifier = Modifier
            .padding(padding)
            .fillMaxSize()
        ) {
            when (selectedTab) {
                is TeacherTab.Home -> TeacherHomeSegment(teacherViewModel)
                is TeacherTab.Students -> TeacherStudentsSegment(teacherViewModel)
                is TeacherTab.Finance -> TeacherFinanceSegment(teacherViewModel)
                is TeacherTab.Settings -> TeacherSettingsSegment(teacherViewModel, onLogout)
            }
        }
    }
}

