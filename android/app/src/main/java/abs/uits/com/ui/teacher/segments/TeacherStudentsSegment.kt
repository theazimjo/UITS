package abs.uits.com.ui.teacher.segments

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.navigation.NavController
import abs.uits.com.ui.navigation.Screen
import androidx.compose.foundation.background
import androidx.compose.ui.Alignment
import abs.uits.com.ui.teacher.TeacherViewModel
import abs.uits.com.ui.teacher.components.StudentListItem
import abs.uits.com.ui.theme.*

@OptIn(ExperimentalSharedTransitionApi::class)
@Composable
fun TeacherStudentsSegment(
    viewModel: TeacherViewModel,
    navController: NavController,
    sharedTransitionScope: SharedTransitionScope,
    animatedVisibilityScope: AnimatedVisibilityScope
) {
    val students by viewModel.filteredStudents.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(IosBackground)
    ) {
        Column(modifier = Modifier.padding(horizontal = 20.dp)) {
            Spacer(modifier = Modifier.height(24.dp))
            IosLargeTitle("O'quvchilar", modifier = Modifier.padding(bottom = 16.dp))

            IosSearchField(
                value = searchQuery,
                onValueChange = { viewModel.updateSearchQuery(it) },
                placeholder = "Qidiruv..."
            )

            Spacer(modifier = Modifier.height(20.dp))
        }

        // Animated Content for smooth list transitions
        AnimatedContent(
            targetState = students,
            transitionSpec = {
                fadeIn(tween(400)) togetherWith fadeOut(tween(300))
            },
            label = "StudentListAnimation"
        ) { studentList ->
            if (studentList.isEmpty() && searchQuery.isNotEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Natijalar topilmadi", color = IosSecondaryLabel)
                }
            } else {
                // Grouped Inset List Style
                IosCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                ) {
                    LazyColumn(
                        modifier = Modifier.fillMaxWidth(),
                        contentPadding = PaddingValues(bottom = 100.dp)
                    ) {
                        items(
                            items = studentList,
                            key = { it.id } // High performance diffing
                        ) { student ->
                            val index = studentList.indexOf(student)
                            StudentListItem(
                                student = student,
                                staggerIndex = index.coerceAtMost(10), // Only stagger first 10 for performance
                                sharedTransitionScope = sharedTransitionScope,
                                animatedVisibilityScope = animatedVisibilityScope,
                                onClick = {
                                    navController.navigate(Screen.StudentDetail.createRoute(student.id))
                                }
                            )
                            if (student != studentList.lastOrNull()) {
                                HorizontalDivider(
                                    color = IosSeparator.copy(alpha = 0.5f),
                                    modifier = Modifier.padding(start = 72.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
        Spacer(modifier = Modifier.height(24.dp))
    }
}
