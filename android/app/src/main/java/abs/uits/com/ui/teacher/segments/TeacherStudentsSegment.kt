package abs.uits.com.ui.teacher.segments

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import abs.uits.com.ui.teacher.TeacherViewModel
import abs.uits.com.ui.teacher.components.StudentListItem
import abs.uits.com.ui.teacher.components.BoxShadowBorder

@Composable
fun TeacherStudentsSegment(viewModel: TeacherViewModel) {
    val students by viewModel.filteredStudents.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF2F2F7)) // iOS System Background
    ) {
        Column(modifier = Modifier.padding(horizontal = 20.dp)) {
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                "O'quvchilar", 
                style = MaterialTheme.typography.displayLarge.copy(
                    fontWeight = FontWeight.Bold,
                    letterSpacing = (-1).sp
                ),
                color = Color(0xFF1D1D1F), // iOS Black
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            // iOS Style Search Bar
            TextField(
                value = searchQuery,
                onValueChange = { viewModel.updateSearchQuery(it) },
                placeholder = { 
                    Text(
                        "Qidiruv...", 
                        color = Color(0xFF8E8E93),
                        fontSize = 17.sp
                    ) 
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(65.dp),
                shape = RoundedCornerShape(10.dp),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = Color(0xFFE3E3E8), // iOS Search Bar Container
                    unfocusedContainerColor = Color(0xFFE3E3E8),
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                    cursorColor = Color(0xFF007AFF) // iOS Blue
                ),
                leadingIcon = { 
                    Icon(
                        Icons.Default.Search, 
                        contentDescription = null, 
                        tint = Color(0xFF8E8E93),
                        modifier = Modifier.size(20.dp)
                    ) 
                },
                singleLine = true,
                textStyle = MaterialTheme.typography.bodyLarge.copy(fontSize = 17.sp)
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
                    Text("Natijalar topilmadi", color = Color(0xFF8E8E93))
                }
            } else {
                // Grouped Inset List Style
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp),
                    shape = RoundedCornerShape(12.dp),
                    color = Color.White,
                    shadowElevation = 0.5.dp
                ) {
                    LazyColumn(modifier = Modifier.fillMaxWidth()) {
                        items(
                            items = studentList,
                            key = { it.id } // High performance diffing
                        ) { student ->
                            val index = studentList.indexOf(student)
                            StudentListItem(
                                student = student,
                                staggerIndex = index.coerceAtMost(10) // Only stagger first 10 for performance
                            )
                            if (student != studentList.lastOrNull()) {
                                HorizontalDivider(
                                    color = Color(0xFFC6C6C8).copy(alpha = 0.4f), // iOS Separator
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
