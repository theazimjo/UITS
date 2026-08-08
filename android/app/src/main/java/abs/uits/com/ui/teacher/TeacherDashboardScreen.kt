package abs.uits.com.ui.teacher

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import abs.uits.com.ui.teacher.components.*
import abs.uits.com.ui.teacher.segments.*
import androidx.compose.animation.*
import androidx.navigation.NavController
import abs.uits.com.ui.navigation.Screen
import abs.uits.com.ui.theme.IosBackground
import abs.uits.com.ui.theme.IosTabBar
import abs.uits.com.ui.theme.IosTabItem
import abs.uits.com.ui.theme.iosHazeSource
import dev.chrisbanes.haze.HazeState

private val teacherTabs = listOf(TeacherTab.Home, TeacherTab.Students, TeacherTab.Finance, TeacherTab.Settings)
private val teacherTabItems = teacherTabs.map { IosTabItem(it.label, it.icon, it.filledIcon) }


@OptIn(ExperimentalSharedTransitionApi::class)
@Composable
fun TeacherDashboardScreen(
    onLogout: () -> Unit,
    navController: NavController,
    sharedTransitionScope: SharedTransitionScope,
    animatedVisibilityScope: AnimatedVisibilityScope,
    teacherViewModel: TeacherViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                @Suppress("UNCHECKED_CAST")
                return TeacherViewModel() as T
            }
        }
    )
) {
    androidx.compose.runtime.LaunchedEffect(Unit) {
        teacherViewModel.fetchAllData()
    }

    val selectedTab by teacherViewModel.selectedTab.collectAsState()
    val hazeState = remember { HazeState() }

    Box(modifier = Modifier.fillMaxSize().background(IosBackground)) {
        // Segment content extends full-height behind the glass tab bar so it has something to blur
        Box(modifier = Modifier.fillMaxSize().iosHazeSource(hazeState)) {
            when (selectedTab) {
                is TeacherTab.Home -> TeacherHomeSegment(teacherViewModel)
                is TeacherTab.Students -> TeacherStudentsSegment(
                    teacherViewModel,
                    navController,
                    sharedTransitionScope,
                    animatedVisibilityScope
                )
                is TeacherTab.Finance -> TeacherFinanceSegment(teacherViewModel)
                is TeacherTab.Settings -> TeacherSettingsSegment(teacherViewModel, onLogout)
            }
        }

        IosTabBar(
            items = teacherTabItems,
            selectedIndex = teacherTabs.indexOf(selectedTab),
            onSelect = { index -> teacherViewModel.selectTab(teacherTabs[index]) },
            modifier = Modifier.align(Alignment.BottomCenter),
            hazeState = hazeState
        )
    }
}

