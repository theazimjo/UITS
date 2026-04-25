package abs.uits.com.ui.teacher

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.*
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import abs.uits.com.data.model.*
import java.util.*

@OptIn(ExperimentalSharedTransitionApi::class, ExperimentalMaterial3Api::class)
@Composable
fun StudentDetailScreen(
    studentId: Int,
    onBack: () -> Unit,
    sharedTransitionScope: SharedTransitionScope,
    animatedVisibilityScope: AnimatedVisibilityScope,
    teacherViewModel: TeacherViewModel
) {
    val context = LocalContext.current
    
    // Data fetching
    LaunchedEffect(studentId) {
        teacherViewModel.fetchStudentDetails(studentId)
        val now = Calendar.getInstance()
        val monthStr = String.format("%d-%02d-01", now.get(Calendar.YEAR), now.get(Calendar.MONTH) + 1)
        teacherViewModel.fetchStudentAttendance(studentId, monthStr)
    }

    val baseStudent = teacherViewModel.getStudentById(studentId)
    val detailedStudent by teacherViewModel.selectedStudent.collectAsState()
    val payments by teacherViewModel.studentPayments.collectAsState()
    val exams by teacherViewModel.studentExams.collectAsState()
    val attendance by teacherViewModel.studentAttendance.collectAsState()
    val isDetailLoading by teacherViewModel.isDetailLoading.collectAsState()
    val isAttLoading by teacherViewModel.isAttendanceLoading.collectAsState()

    val currentStudent = detailedStudent ?: baseStudent

    if (currentStudent == null) {
        Box(modifier = Modifier.fillMaxSize().background(Color(0xFFF2F2F7)), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Color(0xFF007AFF))
        }
        return
    }

    // Success Score calculation
    val attendCount = attendance?.recent_attendance?.count { it.status?.lowercase() == "present" } ?: 0
    val attendPercent = (attendCount.toFloat() / 12f * 100f).coerceIn(0f, 100f)
    val examPercent = exams.firstOrNull()?.percentage?.toFloat() ?: 0f
    val successScore = if (examPercent > 0) (attendPercent * 0.4f + examPercent * 0.6f).coerceIn(0f, 100f) else attendPercent.coerceIn(0f, 100f)

    with(sharedTransitionScope) {
        Scaffold(
            topBar = {
                CenterAlignedTopAppBar(
                    title = { Text("Talaba Profili", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold) },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(Icons.Default.ChevronLeft, contentDescription = null, tint = Color(0xFF007AFF), modifier = Modifier.size(32.dp))
                        }
                    },
                    actions = {
                        IconButton(onClick = { /* More options */ }) {
                            Icon(Icons.Default.MoreHoriz, contentDescription = null, tint = Color(0xFF007AFF))
                        }
                    },
                    colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                        containerColor = Color(0xFFF2F2F7).copy(alpha = 0.9f)
                    )
                )
            },
            containerColor = Color(0xFFF2F2F7)
        ) { paddingValue ->
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(paddingValue),
                contentPadding = PaddingValues(bottom = 32.dp)
            ) {
                // HERO SECTION
                item {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(top = 20.dp, bottom = 24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Surface(
                            shape = CircleShape,
                            modifier = Modifier.size(110.dp).sharedElement(
                                rememberSharedContentState(key = "photo-${currentStudent.id}"),
                                animatedVisibilityScope = animatedVisibilityScope
                            ),
                            color = Color.White,
                            shadowElevation = 8.dp
                        ) {
                            if (currentStudent.photo != null) {
                                AsyncImage(
                                    model = ImageRequest.Builder(context).data(currentStudent.photo).crossfade(true).build(),
                                    contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize()
                                )
                            } else {
                                Box(modifier = Modifier.fillMaxSize().background(Color(0xFFE5E5EA)), contentAlignment = Alignment.Center) {
                                    Text(currentStudent.name.take(1), fontSize = 40.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
                                }
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Text(
                            text = currentStudent.name,
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Black,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.sharedBounds(
                                rememberSharedContentState(key = "name-${currentStudent.id}"),
                                animatedVisibilityScope = animatedVisibilityScope
                            )
                        )
                        
                        Text(
                            text = if (currentStudent.groups.isNotEmpty()) currentStudent.groups.first().name else "Guruhsiz",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color.Gray,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }

                // STATS CARDS
                item {
                    val todayStr = remember { java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US).format(java.util.Date()) }
                    val dayOfMonth = java.util.Calendar.getInstance().get(java.util.Calendar.DAY_OF_MONTH).toString()
                    
                    // Priority 1: Monthly journal from dashboard (most reliable)
                    val studentInJournal = teacherViewModel.todayAttendance.value?.students?.find { it.id == studentId }
                    val todayFromJournal = studentInJournal?.attendance?.get(dayOfMonth)
                    
                    // Priority 2: Recent attendance list (fallback)
                    val todayFromList = attendance?.recent_attendance?.find { 
                        val normalized = normalizeDate(it.date)
                        normalized != null && normalized.startsWith(todayStr) 
                    }
                    
                    val todayGrade = attendance?.grades?.find { 
                        val normalized = normalizeDate(it.date)
                        normalized != null && normalized.startsWith(todayStr)
                    }
                    
                    val avgScore = remember(attendance) {
                        val g = attendance?.grades ?: emptyList()
                        if (g.isEmpty()) 0 else g.map { it.score ?: 0 }.average().toInt()
                    }

                    Column(modifier = Modifier.padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            iOSMetricCard(
                                modifier = Modifier.weight(1f),
                                label = "BUGUNGI DAVOMAT",
                                value = when {
                                    todayFromJournal?.arrived_at != null -> "K: ${todayFromJournal.arrived_at}"
                                    todayFromList?.arrived_at != null -> "K: ${todayFromList.arrived_at}"
                                    todayFromJournal?.status?.lowercase() == "present" || todayFromJournal?.status_display?.lowercase()?.contains("kelgan") == true -> "Kelgan"
                                    todayFromList?.status?.lowercase() == "present" -> "Kelgan"
                                    else -> "Kelmagan"
                                },
                                subValue = todayFromJournal?.left_at?.let { "Ch: $it" } ?: todayFromList?.left_at?.let { "Ch: $it" },
                                color = Color(0xFF007AFF),
                                icon = Icons.Default.AccessTime
                            )
                            iOSMetricCard(
                                modifier = Modifier.weight(1f),
                                label = "O'RTACHA BAHO",
                                value = "$avgScore",
                                color = Color(0xFF5856D6),
                                icon = Icons.Default.Equalizer
                            )
                        }
                        iOSMetricCard(
                            modifier = Modifier.fillMaxWidth(),
                            label = "BUGUNGI BAHO",
                            value = todayGrade?.score?.toString() ?: "Baholanmagan",
                            subValue = todayGrade?.comment,
                            color = Color(0xFFFF9500),
                            icon = Icons.Default.Grade
                        )
                    }
                }

                // INFO SECTION (iOS Grouped List Style)
                item {
                    Text("MA'LUMOTLAR", style = MaterialTheme.typography.labelSmall, color = Color.Gray, fontWeight = FontWeight.Bold, modifier = Modifier.padding(start = 20.dp, top = 8.dp, bottom = 8.dp))
                    Surface(
                        modifier = Modifier.padding(horizontal = 16.dp),
                        shape = RoundedCornerShape(16.dp),
                        color = Color.White
                    ) {
                        Column {
                            ListItemiOS(Icons.Default.Phone, "Telefon", currentStudent.phone ?: "Noma'lum", isLast = false) {
                                currentStudent.phone?.let { context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:$it"))) }
                            }
                            ListItemiOS(Icons.Default.FamilyRestroom, "Ota-ona", currentStudent.parentPhone ?: "Noma'lum", isLast = false) {
                                currentStudent.parentPhone?.let { context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:$it"))) }
                            }
                            ListItemiOS(Icons.Default.Home, "Manzil", currentStudent.address ?: "Kiritilmagan", isLast = true)
                        }
                    }
                }

                // CALENDAR / ATTENDANCE
                item {
                    Text("DAVOMAT JURNALI", style = MaterialTheme.typography.labelSmall, color = Color.Gray, fontWeight = FontWeight.Bold, modifier = Modifier.padding(start = 20.dp, top = 24.dp, bottom = 8.dp))
                    Surface(
                        modifier = Modifier.padding(horizontal = 16.dp),
                        shape = RoundedCornerShape(16.dp),
                        color = Color.White
                    ) {
                        Box(modifier = Modifier.padding(16.dp)) {
                            if (isAttLoading) {
                                Box(Modifier.fillMaxWidth().height(150.dp), contentAlignment = Alignment.Center) {
                                    CircularProgressIndicator(color = Color(0xFF007AFF), modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                                }
                            } else {
                                val cal = Calendar.getInstance()
                                val year = cal.get(Calendar.YEAR)
                                val month = cal.get(Calendar.MONTH)
                                val daysInMonth = getDaysInMonth(year, month)
                                
                                // Source of truth: try to get from the monthly journal first (dashboard data)
                                val monthlyJournal = teacherViewModel.todayAttendance.value?.students?.find { it.id == studentId }?.attendance
                                val attendCount = monthlyJournal?.values?.count { it.status?.lowercase() == "present" || it.status_display?.lowercase()?.contains("kelgan") == true }
                                    ?: attendance?.recent_attendance?.count { it.status?.lowercase() == "present" } ?: 0

                                    val calMonth = Calendar.getInstance().apply { set(year, month, 1) }
                                    val firstDayOfWeek = (calMonth.get(Calendar.DAY_OF_WEEK) + 5) % 7 // Align to Monday=0
                                    
                                    Column {
                                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                            Text("${cal.getDisplayName(Calendar.MONTH, Calendar.LONG, Locale("uz"))} oyi", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold)
                                            Text("$attendCount kunda kelgan", style = MaterialTheme.typography.bodySmall, color = Color(0xFF34C759))
                                        }
                                        Spacer(modifier = Modifier.height(16.dp))
                                        
                                        // Weekday Headers
                                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                            val weekdays = listOf("Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya")
                                            weekdays.forEach { dayName ->
                                                Text(
                                                    text = dayName,
                                                    modifier = Modifier.weight(1f),
                                                    textAlign = TextAlign.Center,
                                                    style = MaterialTheme.typography.labelSmall,
                                                    color = Color.Gray.copy(alpha = 0.5f)
                                                )
                                            }
                                        }
                                        Spacer(modifier = Modifier.height(8.dp))

                                        // 7 columns x 6 rows grid
                                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                            for (row in 0..5) {
                                                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                                    for (col in 0..6) {
                                                        val dayIndex = row * 7 + col
                                                        val day = dayIndex - firstDayOfWeek + 1
                                                        
                                                        if (day in 1..daysInMonth) {
                                                            val dayStr = day.toString()
                                                            val dateKey = String.format(java.util.Locale.US, "%d-%02d-%02d", year, month + 1, day)
                                                            
                                                            val recordFromJournal = monthlyJournal?.get(dayStr)
                                                            val recordFromList = attendance?.recent_attendance?.find { 
                                                                val norm = normalizeDate(it.date)
                                                                norm == dateKey || norm?.startsWith(dateKey) == true
                                                            }
                                                            
                                                            val isPresent = recordFromJournal?.status?.lowercase() == "present" || 
                                                                           recordFromJournal?.status_display?.lowercase()?.contains("kelgan") == true ||
                                                                           recordFromList?.status?.lowercase() == "present" || 
                                                                           recordFromList?.status_display?.lowercase()?.contains("kelgan") == true
                                                                           
                                                            val isAbsent = recordFromJournal?.status?.lowercase() == "absent" || 
                                                                          recordFromList?.status?.lowercase() == "absent"
                                                            
                                                            Box(
                                                                modifier = Modifier.weight(1f).aspectRatio(1f).clip(RoundedCornerShape(6.dp)).background(
                                                                    when {
                                                                        isPresent -> Color(0xFF34C759)
                                                                        isAbsent -> Color(0xFFFF3B30)
                                                                        else -> Color(0xFFF2F2F7)
                                                                    }
                                                                ),
                                                                contentAlignment = Alignment.Center
                                                            ) {
                                                                Text("$day", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = if (isPresent || isAbsent) Color.White else Color.Black)
                                                            }
                                                        } else {
                                                            Spacer(modifier = Modifier.weight(1f).aspectRatio(1f))
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                            }
                        }
                    }
                }
                
                // EXAM RESULTS
                if (exams.isNotEmpty()) {
                    item {
                        Text("IMTIHON NATIJALARI", style = MaterialTheme.typography.labelSmall, color = Color.Gray, fontWeight = FontWeight.Bold, modifier = Modifier.padding(start = 20.dp, top = 24.dp, bottom = 8.dp))
                        Surface(
                            modifier = Modifier.padding(horizontal = 16.dp),
                            shape = RoundedCornerShape(16.dp),
                            color = Color.White
                        ) {
                            Column {
                                exams.forEachIndexed { index, exam ->
                                    ListItemiOS(
                                        icon = Icons.Default.Assignment,
                                        label = exam.month,
                                        value = "${exam.percentage?.toInt()}% Natija",
                                        isLast = index == exams.size - 1
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun iOSMetricCard(modifier: Modifier, label: String, value: String, subValue: String? = null, color: Color, icon: ImageVector) {
    Surface(
        modifier = modifier.heightIn(min = 100.dp),
        color = Color.White,
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.Center) {
            Icon(icon, null, tint = color.copy(alpha = 0.8f), modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text(label, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
            Text(value, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black)
            if (subValue != null) {
                Text(subValue, style = MaterialTheme.typography.bodySmall, color = Color.Gray, fontWeight = FontWeight.Medium)
            }
        }
    }
}

@Composable
fun ListItemiOS(icon: ImageVector, label: String, value: String, isLast: Boolean, onClick: (() -> Unit)? = null) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth().height(60.dp).clickable(enabled = onClick != null) { onClick?.invoke() }.padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, null, tint = Color.Gray.copy(alpha = 0.7f), modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(label, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                Text(value, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold, color = if (onClick != null) Color(0xFF007AFF) else Color.Black)
            }
            if (onClick != null) {
                Icon(Icons.Default.ChevronRight, null, tint = Color.LightGray, modifier = Modifier.size(20.dp))
            }
        }
        if (!isLast) {
            Divider(modifier = Modifier.padding(start = 52.dp), color = Color(0xFFF2F2F7), thickness = 1.dp)
        }
    }
}

fun normalizeDate(date: String?): String? {
    if (date == null) return null
    return try {
        if (date.contains("-")) {
            val parts = date.split("T")[0].split("-")
            if (parts[0].length == 4) date.split("T")[0] else "${parts[0]}-${parts[1]}-${parts[2]}"
        } else if (date.contains(".")) {
            val parts = date.split(".")
            if (parts[0].length == 4) "${parts[0]}-${parts[1]}-${parts[2]}" else "${parts[2]}-${parts[1]}-${parts[0]}"
        } else null
    } catch (e: Exception) { null }
}

fun getDaysInMonth(year: Int, month: Int): Int {
    val cal = Calendar.getInstance()
    cal.set(year, month, 1)
    return cal.getActualMaximum(Calendar.DAY_OF_MONTH)
}
