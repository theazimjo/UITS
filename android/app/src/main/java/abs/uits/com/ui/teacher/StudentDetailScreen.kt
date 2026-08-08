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
import androidx.compose.material3.*
import com.adamglin.PhosphorIcons
import com.adamglin.phosphoricons.Regular
import com.adamglin.phosphoricons.regular.Clock
import com.adamglin.phosphoricons.regular.ClipboardText
import com.adamglin.phosphoricons.regular.Equalizer
import com.adamglin.phosphoricons.regular.House
import com.adamglin.phosphoricons.regular.Phone
import com.adamglin.phosphoricons.regular.Star
import com.adamglin.phosphoricons.regular.UsersThree
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.*
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import abs.uits.com.data.model.*
import abs.uits.com.ui.theme.*
import dev.chrisbanes.haze.HazeState
import java.util.*

@OptIn(ExperimentalSharedTransitionApi::class)
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
        Box(modifier = Modifier.fillMaxSize().background(IosBackground), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = IosBlue)
        }
        return
    }

    // Success Score calculation
    val attendCount = attendance?.recent_attendance?.count { it.status?.lowercase() == "present" } ?: 0
    val attendPercent = (attendCount.toFloat() / 12f * 100f).coerceIn(0f, 100f)
    val examPercent = exams.firstOrNull()?.percentage?.toFloat() ?: 0f
    val successScore = if (examPercent > 0) (attendPercent * 0.4f + examPercent * 0.6f).coerceIn(0f, 100f) else attendPercent.coerceIn(0f, 100f)

    with(sharedTransitionScope) {
        val hazeState = remember { HazeState() }
        var navBarHeight by remember { mutableStateOf(0.dp) }
        val density = LocalDensity.current

        Box(modifier = Modifier.fillMaxSize().background(IosBackground)) {
            LazyColumn(
                modifier = Modifier.fillMaxSize().iosHazeSource(hazeState),
                contentPadding = PaddingValues(top = navBarHeight, bottom = 32.dp)
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
                            color = IosCard,
                            shadowElevation = 8.dp
                        ) {
                            if (currentStudent.photo != null) {
                                AsyncImage(
                                    model = ImageRequest.Builder(context).data(currentStudent.photo).crossfade(true).build(),
                                    contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize()
                                )
                            } else {
                                Box(modifier = Modifier.fillMaxSize().background(IosSeparator), contentAlignment = Alignment.Center) {
                                    Text(currentStudent.name.take(1), fontSize = 40.sp, fontWeight = FontWeight.Bold, color = IosSecondaryLabel)
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
                            color = IosSecondaryLabel,
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
                            IosStatCard(
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
                                tint = IosBlue,
                                icon = PhosphorIcons.Regular.Clock
                            )
                            IosStatCard(
                                modifier = Modifier.weight(1f),
                                label = "O'RTACHA BAHO",
                                value = "$avgScore",
                                tint = Color(0xFF5856D6),
                                icon = PhosphorIcons.Regular.Equalizer
                            )
                        }
                        IosStatCard(
                            modifier = Modifier.fillMaxWidth(),
                            label = "BUGUNGI BAHO",
                            value = todayGrade?.score?.toString() ?: "Baholanmagan",
                            subValue = todayGrade?.comment,
                            tint = Color(0xFFFF9500),
                            icon = PhosphorIcons.Regular.Star
                        )
                    }
                }

                // INFO SECTION (iOS Grouped List Style)
                item {
                    IosSectionHeader("MA'LUMOTLAR")
                    IosCard(modifier = Modifier.padding(horizontal = 16.dp)) {
                        Column {
                            IosListRow(
                                icon = PhosphorIcons.Regular.Phone,
                                label = "Telefon",
                                value = currentStudent.phone ?: "Noma'lum",
                                isLast = false,
                                stacked = true,
                                showChevron = currentStudent.phone != null,
                                onClick = currentStudent.phone?.let { phone ->
                                    { context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phone"))) }
                                }
                            )
                            IosListRow(
                                icon = PhosphorIcons.Regular.UsersThree,
                                label = "Ota-ona",
                                value = currentStudent.parentPhone ?: "Noma'lum",
                                isLast = false,
                                stacked = true,
                                showChevron = currentStudent.parentPhone != null,
                                onClick = currentStudent.parentPhone?.let { phone ->
                                    { context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phone"))) }
                                }
                            )
                            IosListRow(
                                icon = PhosphorIcons.Regular.House,
                                label = "Manzil",
                                value = currentStudent.address ?: "Kiritilmagan",
                                isLast = true,
                                stacked = true
                            )
                        }
                    }
                }

                // CALENDAR / ATTENDANCE
                item {
                    IosSectionHeader("DAVOMAT JURNALI")
                    IosCard(modifier = Modifier.padding(horizontal = 16.dp)) {
                        Box(modifier = Modifier.padding(16.dp)) {
                            if (isAttLoading) {
                                Box(Modifier.fillMaxWidth().height(150.dp), contentAlignment = Alignment.Center) {
                                    CircularProgressIndicator(color = IosBlue, modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
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
                                            Text("$attendCount kunda kelgan", style = MaterialTheme.typography.bodySmall, color = IosGreen)
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
                                                    color = IosSecondaryLabel.copy(alpha = 0.5f)
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
                                                                        isPresent -> IosGreen
                                                                        isAbsent -> IosRed
                                                                        else -> IosBackground
                                                                    }
                                                                ),
                                                                contentAlignment = Alignment.Center
                                                            ) {
                                                                Text("$day", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = if (isPresent || isAbsent) Color.White else IosLabel)
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
                        IosSectionHeader("IMTIHON NATIJALARI")
                        IosCard(modifier = Modifier.padding(horizontal = 16.dp)) {
                            Column {
                                exams.forEachIndexed { index, exam ->
                                    IosListRow(
                                        icon = PhosphorIcons.Regular.ClipboardText,
                                        label = exam.month,
                                        value = "${exam.percentage?.toInt()}% Natija",
                                        isLast = index == exams.size - 1,
                                        stacked = true
                                    )
                                }
                            }
                        }
                    }
                }
            }

            IosNavBar(
                title = "Talaba Profili",
                onBack = onBack,
                backLabel = "Orqaga",
                hazeState = hazeState,
                modifier = Modifier.onGloballyPositioned { coordinates ->
                    navBarHeight = with(density) { coordinates.size.height.toDp() }
                }
            )
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
