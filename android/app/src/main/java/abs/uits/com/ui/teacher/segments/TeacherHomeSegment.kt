package abs.uits.com.ui.teacher.segments

import abs.uits.com.data.model.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import abs.uits.com.ui.teacher.TeacherViewModel
import abs.uits.com.ui.teacher.components.DashboardStatCard
import abs.uits.com.ui.teacher.components.BoxShadowBorder
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.ui.draw.clip
import androidx.navigation.NavController
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.material3.ExperimentalMaterial3Api

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TeacherHomeSegment(viewModel: TeacherViewModel) {
    val dashboard by viewModel.dashboard.collectAsState()
    val profile by viewModel.profile.collectAsState()
    
    // Get current day of week in Uzbek
    val currentDayUz = remember {
        val days = listOf("Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan")
        val calendar = java.util.Calendar.getInstance()
        val dayIndex = calendar.get(java.util.Calendar.DAY_OF_WEEK) - 1
        days[dayIndex]
    }
    
    val teacherGroups by viewModel.teacherGroups.collectAsState()
    
    val groupsTodayNames = remember(teacherGroups) {
        teacherGroups.filter { group -> 
            group.days?.any { it.startsWith(currentDayUz, ignoreCase = true) } == true 
        }.map { it.name }.toSet()
    }

    val studentsToday = remember(teacherGroups) {
        teacherGroups.filter { group -> 
            group.days?.any { it.startsWith(currentDayUz, ignoreCase = true) } == true 
        }.sumOf { it.studentCount }
    }

    val todayAttendance by viewModel.todayAttendance.collectAsState()
    
    val studentsToShow = remember(todayAttendance?.students, groupsTodayNames) {
        todayAttendance?.students?.filter { student ->
            groupsTodayNames.contains(student.groupName)
        } ?: emptyList()
    }

    var showTodayAttendanceSheet by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    Box(modifier = Modifier.fillMaxSize().background(Color(0xFFF2F2F7))) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 20.dp)
        ) {
            // Welcome Header (Compact)
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Xayrli kun,", 
                            style = MaterialTheme.typography.labelSmall,
                            color = Color(0xFF8E8E93),
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = profile?.name?.split(" ")?.firstOrNull() ?: "Ustoz", 
                            style = MaterialTheme.typography.headlineMedium.copy(fontSize = 28.sp),
                            color = Color(0xFF1D1D1F),
                            fontWeight = FontWeight.Black,
                            letterSpacing = (-0.5).sp
                        )
                    }
                    Surface(
                        shape = CircleShape,
                        color = Color.White,
                        modifier = Modifier.size(44.dp),
                        shadowElevation = 2.dp,
                        border = androidx.compose.foundation.BorderStroke(2.dp, Color(0xFF007AFF).copy(alpha = 0.1f))
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                profile?.name?.take(1) ?: "U",
                                style = MaterialTheme.typography.titleMedium,
                                color = Color(0xFF007AFF),
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
            }
            
            // Metrics Grid (2x2 Style for better fit)
            item {
                Text(
                    "STATISTIKA", 
                    style = MaterialTheme.typography.labelSmall,
                    color = Color(0xFF8E8E93),
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(start = 4.dp, bottom = 10.dp)
                )
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        CompactStatCard(
                            label = "GURUHLAR",
                            value = "${dashboard?.totalGroups ?: 0}",
                            icon = DashboardIcon.Layers,
                            color = Color(0xFF34C759),
                            modifier = Modifier.weight(1f)
                        )
                        CompactStatCard(
                            label = "TALABALAR",
                            value = "${dashboard?.totalStudents ?: 0}",
                            icon = DashboardIcon.Users,
                            color = Color(0xFF007AFF),
                            modifier = Modifier.weight(1f)
                        )
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        CompactStatCard(
                            label = "BUGUN KELADIGANLAR",
                            value = "${todayAttendance?.arrived ?: 0} / ${if (studentsToShow.isNotEmpty()) studentsToShow.size else (todayAttendance?.expected ?: studentsToday)}",
                            icon = Icons.Default.Groups,
                            color = Color(0xFF5856D6),
                            modifier = Modifier.weight(1f).clickable { showTodayAttendanceSheet = true }
                        )
                        Box(modifier = Modifier.weight(1f))
                    }
                }
                Spacer(modifier = Modifier.height(10.dp))
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    color = Color.White,
                    shadowElevation = 0.5.dp
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("OYLIK DAROMAD", style = MaterialTheme.typography.labelSmall, color = Color(0xFF8E8E93), fontWeight = FontWeight.Bold)
                            Text(formatMoney(dashboard?.monthlyIncome), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Black, color = Color(0xFF1D1D1F))
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("KUTILGAN", style = MaterialTheme.typography.labelSmall, color = Color(0xFF8E8E93), fontWeight = FontWeight.Bold)
                            Text(formatMoney(dashboard?.expectedIncome), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Color(0xFF34C759))
                        }
                    }
                }
                Spacer(modifier = Modifier.height(28.dp))
            }
            
            // Financial Trend (Compact)
            item {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    color = Color.White,
                    shadowElevation = 0.5.dp
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                "MOLIYA DINAMIKASI", 
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFF8E8E93),
                                fontWeight = FontWeight.Bold
                            )
                            Icon(Icons.Default.TrendingUp, null, tint = Color(0xFF34C759), modifier = Modifier.size(16.dp))
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth().height(80.dp),
                            horizontalArrangement = Arrangement.SpaceEvenly,
                            verticalAlignment = Alignment.Bottom
                        ) {
                            val trends = dashboard?.financialTrend ?: emptyList()
                            val displayTrends = if (trends.isEmpty()) List(6) { FinancialTrendItem("M$it", 0.0) } else trends.takeLast(6)
                            val maxIncome = displayTrends.maxOfOrNull { it.income } ?: 1.0
                            
                            displayTrends.forEach { item ->
                                val barHeight = ((item.income / maxIncome) * 60).coerceAtLeast(4.0).dp
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    if (item.income > 0) {
                                        Text(
                                            text = formatMoney(item.income),
                                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 8.sp),
                                            color = Color(0xFF8E8E93),
                                            fontWeight = FontWeight.Bold
                                        )
                                        Spacer(modifier = Modifier.height(4.dp))
                                    }
                                    Box(
                                        modifier = Modifier
                                            .width(24.dp)
                                            .height(barHeight)
                                            .background(Color(0xFF007AFF).copy(alpha = 0.8f), RoundedCornerShape(4.dp))
                                    )
                                }
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(28.dp))
            }

            // Limited Groups List
            item {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(start = 4.dp, bottom = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "GURUHLARIM", 
                        style = MaterialTheme.typography.labelSmall,
                        color = Color(0xFF8E8E93),
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        "Barchasi", 
                        style = MaterialTheme.typography.labelSmall,
                        color = Color(0xFF007AFF),
                        fontWeight = FontWeight.Bold
                    )
                }
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    color = Color.White,
                    shadowElevation = 0.5.dp
                ) {
                    Column {
                        val groups = dashboard?.groups ?: emptyList()
                        if (groups.isEmpty()) {
                            Box(modifier = Modifier.padding(24.dp).fillMaxWidth(), contentAlignment = Alignment.Center) {
                                Text("Guruhlar yo'q", color = Color(0xFF8E8E93), fontSize = 14.sp)
                            }
                        } else {
                            groups.take(3).forEachIndexed { index, group ->
                                CompactGroupItem(group)
                                if (index < groups.take(3).size - 1) {
                                    HorizontalDivider(
                                        modifier = Modifier.padding(start = 16.dp),
                                        color = Color(0xFFC6C6C8).copy(alpha = 0.4f),
                                        thickness = 0.5.dp
                                    )
                                }
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(32.dp))
            }
        }

        if (showTodayAttendanceSheet) {
            ModalBottomSheet(
                onDismissRequest = { showTodayAttendanceSheet = false },
                sheetState = sheetState,
                containerColor = Color.White,
                dragHandle = { BottomSheetDefaults.DragHandle() }
            ) {
                Column(modifier = Modifier.fillMaxWidth().padding(bottom = 32.dp)) {
                    Text(
                        text = "BUGUN KELADIGANLAR",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Black,
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp)
                    )
                    
                    Surface(
                        modifier = Modifier.fillMaxWidth().padding(20.dp),
                        shape = RoundedCornerShape(16.dp),
                        color = Color(0xFF007AFF).copy(alpha = 0.05f),
                        border = androidx.compose.foundation.BorderStroke(0.5.dp, Color(0xFF007AFF).copy(alpha = 0.2f))
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("UMUMIY KO'RSATKICH", style = MaterialTheme.typography.labelSmall, color = Color(0xFF007AFF), fontWeight = FontWeight.Bold)
                                Text("${todayAttendance?.arrived ?: 0} / ${if (studentsToShow.isNotEmpty()) studentsToShow.size else (todayAttendance?.expected ?: studentsToday)}", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Black)
                            }
                            Text("${if (studentsToShow.isNotEmpty()) (todayAttendance?.arrived?.toFloat() ?: 0f) / studentsToShow.size * 100 else (todayAttendance?.percentage ?: 0.0).toInt()}%", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black, color = Color(0xFF007AFF))
                        }
                    }

                    LazyColumn(modifier = Modifier.fillMaxWidth().heightIn(max = 500.dp)) {
                        if (studentsToShow.isEmpty()) {
                            item {
                                Box(modifier = Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) {
                                    Text("O'quvchilar ro'yxati bo'sh", color = Color.Gray, fontSize = 14.sp)
                                }
                            }
                        } else {
                            items(studentsToShow.size) { index ->
                                AttendanceStudentItem(studentsToShow[index])
                                if (index < studentsToShow.size - 1) {
                                    HorizontalDivider(modifier = Modifier.padding(horizontal = 20.dp), color = Color(0xFFC6C6C8).copy(alpha = 0.3f))
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
fun AttendanceStudentItem(student: AttendanceStudent) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Surface(
            modifier = Modifier.size(44.dp),
            shape = CircleShape,
            color = Color(0xFFF2F2F7)
        ) {
            if (student.photo != null) {
                coil.compose.AsyncImage(
                    model = student.photo,
                    contentDescription = null,
                    modifier = Modifier.fillMaxSize().clip(CircleShape),
                    contentScale = androidx.compose.ui.layout.ContentScale.Crop
                )
            } else {
                Box(contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Person, null, tint = Color.Gray, modifier = Modifier.size(24.dp))
                }
            }
        }
        Spacer(modifier = Modifier.width(14.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(student.name, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold, color = Color(0xFF1D1D1F))
            Text(student.groupName ?: "Guruhsiz", style = MaterialTheme.typography.labelSmall, color = Color(0xFF8E8E93))
        }
        Column(horizontalAlignment = Alignment.End) {
            Surface(
                shape = RoundedCornerShape(6.dp),
                color = if (student.status == "present") Color(0xFF34C759).copy(alpha = 0.1f) else Color(0xFFFF3B30).copy(alpha = 0.1f)
            ) {
                Text(
                    text = (student.status_display ?: "Kelmagan").uppercase(),
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    style = MaterialTheme.typography.labelSmall,
                    color = if (student.status == "present") Color(0xFF34C759) else Color(0xFFFF3B30),
                    fontWeight = FontWeight.Black,
                    fontSize = 9.sp
                )
            }
            if (student.arrivedAt != null) {
                Text("K: ${student.arrivedAt}", style = MaterialTheme.typography.labelSmall, color = Color(0xFF007AFF), fontWeight = FontWeight.Bold, fontSize = 9.sp)
            }
            if (student.leftAt != null) {
                Text("Ch: ${student.leftAt}", style = MaterialTheme.typography.labelSmall, color = Color.Gray, fontWeight = FontWeight.Medium, fontSize = 9.sp)
            }
        }
    }
}

@Composable
fun CompactStatCard(label: String, value: String, icon: ImageVector, color: Color, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        color = Color.White,
        shadowElevation = 0.5.dp
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Icon(
                    imageVector = icon, 
                    contentDescription = null, 
                    tint = color, 
                    modifier = Modifier.size(16.dp)
                )
                Text(
                    text = label, 
                    style = MaterialTheme.typography.labelSmall, 
                    color = Color(0xFF8E8E93), 
                    fontSize = 9.sp, 
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(start = 8.dp),
                    textAlign = androidx.compose.ui.text.style.TextAlign.End,
                    maxLines = 2,
                    lineHeight = 10.sp
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Row(verticalAlignment = Alignment.Bottom) {
                Text(
                    text = value.split(" / ").firstOrNull() ?: value, 
                    style = MaterialTheme.typography.titleLarge, 
                    fontWeight = FontWeight.Black, 
                    color = Color(0xFF1D1D1F),
                    fontSize = 24.sp,
                    letterSpacing = (-1).sp
                )
                if (value.contains(" / ")) {
                    Text(
                        text = " / " + (value.split(" / ").lastOrNull() ?: ""), 
                        style = MaterialTheme.typography.bodyMedium, 
                        fontWeight = FontWeight.Bold, 
                        color = Color(0xFF8E8E93),
                        modifier = Modifier.padding(bottom = 2.dp),
                        letterSpacing = (-0.5).sp
                    )
                }
            }
        }
    }
}

@Composable
fun CompactGroupItem(group: abs.uits.com.data.model.TeacherGroupSummary) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier.size(36.dp).background(Color(0xFF007AFF).copy(alpha = 0.1f), RoundedCornerShape(8.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(group.name.take(1).uppercase(), color = Color(0xFF007AFF), fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(group.name, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold, color = Color(0xFF1D1D1F))
            Text("${group.studentCount} o'quvchi • ${group.startTime ?: "--:--"}", style = MaterialTheme.typography.labelSmall, color = Color(0xFF8E8E93))
        }
        Icon(androidx.compose.material.icons.Icons.Default.ChevronRight, null, tint = Color(0xFFC4C4C6), modifier = Modifier.size(16.dp))
    }
}

fun formatMoney(value: Double?): String {
    val amount = value?.toInt() ?: 0
    return if (amount >= 1000000) "${String.format("%.1f", amount / 1000000.0)}M"
    else if (amount >= 1000) "${amount / 1000}K"
    else amount.toString()
}

object DashboardIcon {
    val Layers = Icons.Default.Layers
    val Users = Icons.Default.Groups
    val Clipboard = Icons.AutoMirrored.Filled.Assignment
    val TrendingUp = Icons.Default.TrendingUp
}
