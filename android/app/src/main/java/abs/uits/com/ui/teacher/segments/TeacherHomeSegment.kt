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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.ui.draw.clip
import androidx.navigation.NavController
import androidx.compose.ui.graphics.vector.ImageVector
import com.adamglin.PhosphorIcons
import com.adamglin.phosphoricons.Regular
import com.adamglin.phosphoricons.regular.CaretLeft
import com.adamglin.phosphoricons.regular.CaretRight
import com.adamglin.phosphoricons.regular.ClipboardText
import com.adamglin.phosphoricons.regular.Person
import com.adamglin.phosphoricons.regular.Stack
import com.adamglin.phosphoricons.regular.TrendUp
import com.adamglin.phosphoricons.regular.UsersThree
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.pullrefresh.PullRefreshIndicator
import androidx.compose.material.pullrefresh.pullRefresh
import androidx.compose.material.pullrefresh.rememberPullRefreshState
import abs.uits.com.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterialApi::class)
@Composable
fun TeacherHomeSegment(viewModel: TeacherViewModel) {
    val dashboard by viewModel.dashboard.collectAsState()
    val profile by viewModel.profile.collectAsState()

    val todayAttendance by viewModel.todayAttendance.collectAsState()
    val teacherGroups by viewModel.teacherGroups.collectAsState()
    val selectedDate by viewModel.selectedDate.collectAsState()
    val studentsToShow by viewModel.studentsToShow.collectAsState()
    val isRefreshing by viewModel.isRefreshing.collectAsState()

    val pullRefreshState = rememberPullRefreshState(
        refreshing = isRefreshing,
        onRefresh = { viewModel.refreshData() }
    )

    val sdf = remember { java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault()) }

    // Get day of week in Uzbek for selectedDate (for display only)
    val currentDayUz = remember(selectedDate) {
        val days = listOf("Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan")
        val calendar = java.util.Calendar.getInstance()
        try { calendar.time = sdf.parse(selectedDate) ?: java.util.Date() } catch(e:Exception) {}
        val dayIndex = calendar.get(java.util.Calendar.DAY_OF_WEEK) - 1
        days[dayIndex]
    }

    val studentsToday = remember(studentsToShow) {
        studentsToShow.size
    }

    var showTodayAttendanceSheet by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    Box(modifier = Modifier.fillMaxSize().background(IosBackground).pullRefresh(pullRefreshState)) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 20.dp, bottom = 100.dp)
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
                            color = IosSecondaryLabel,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = profile?.name?.split(" ")?.firstOrNull() ?: "Ustoz",
                            style = MaterialTheme.typography.headlineMedium.copy(fontSize = 28.sp),
                            color = IosLabel,
                            fontWeight = FontWeight.Black,
                            letterSpacing = (-0.5).sp
                        )
                    }
                    Surface(
                        shape = CircleShape,
                        color = IosCard,
                        modifier = Modifier.size(44.dp),
                        shadowElevation = 0.dp,
                        border = androidx.compose.foundation.BorderStroke(1.dp, IosBlue.copy(alpha = 0.15f))
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                profile?.name?.take(1) ?: "U",
                                style = MaterialTheme.typography.titleMedium,
                                color = IosBlue,
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
                    color = IosSecondaryLabel,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(start = 4.dp, bottom = 10.dp)
                )
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        CompactStatCard(
                            label = "GURUHLAR",
                            value = "${dashboard?.totalGroups ?: 0}",
                            icon = DashboardIcon.Layers,
                            color = IosGreen,
                            modifier = Modifier.weight(1f)
                        )
                        CompactStatCard(
                            label = "TALABALAR",
                            value = "${dashboard?.totalStudents ?: 0}",
                            icon = DashboardIcon.Users,
                            color = IosBlue,
                            modifier = Modifier.weight(1f)
                        )
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        val arrivedCountHome = remember(studentsToShow) {
                            studentsToShow.count { student ->
                                student.status?.lowercase() == "present" ||
                                student.status == "1" ||
                                student.status_display?.lowercase()?.contains("kelgan") == true ||
                                !student.arrived_at.isNullOrEmpty()
                            }
                        }
                        CompactStatCard(
                            label = "BUGUN KELADIGANLAR",
                            value = "$arrivedCountHome / ${if (studentsToShow.isNotEmpty()) studentsToShow.size else (todayAttendance?.expected ?: studentsToday)}",
                            icon = PhosphorIcons.Regular.UsersThree,
                            color = Color(0xFF5856D6),
                            modifier = Modifier.weight(1f).iosPressable { showTodayAttendanceSheet = true }
                        )
                        Box(modifier = Modifier.weight(1f))
                    }
                }
                Spacer(modifier = Modifier.height(10.dp))
                IosCard(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("OYLIK DAROMAD", style = MaterialTheme.typography.labelSmall, color = IosSecondaryLabel, fontWeight = FontWeight.Bold)
                            Text(formatMoney(dashboard?.monthlyIncome), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Black, color = IosLabel)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("KUTILGAN", style = MaterialTheme.typography.labelSmall, color = IosSecondaryLabel, fontWeight = FontWeight.Bold)
                            Text(formatMoney(dashboard?.expectedIncome), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = IosGreen)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(28.dp))
            }

            // Financial Trend (Compact)
            item {
                IosCard(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                "MOLIYA DINAMIKASI",
                                style = MaterialTheme.typography.labelSmall,
                                color = IosSecondaryLabel,
                                fontWeight = FontWeight.Bold
                            )
                            Icon(PhosphorIcons.Regular.TrendUp, null, tint = IosGreen, modifier = Modifier.size(16.dp))
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
                                            color = IosSecondaryLabel,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Spacer(modifier = Modifier.height(4.dp))
                                    }
                                    Box(
                                        modifier = Modifier
                                            .width(24.dp)
                                            .height(barHeight)
                                            .background(IosBlue.copy(alpha = 0.8f), RoundedCornerShape(4.dp))
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
                        color = IosSecondaryLabel,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        "Barchasi",
                        style = MaterialTheme.typography.labelSmall,
                        color = IosBlue,
                        fontWeight = FontWeight.Bold
                    )
                }
                IosCard(modifier = Modifier.fillMaxWidth()) {
                    Column {
                        val groups = dashboard?.groups ?: emptyList()
                        if (groups.isEmpty()) {
                            Box(modifier = Modifier.padding(24.dp).fillMaxWidth(), contentAlignment = Alignment.Center) {
                                Text("Guruhlar yo'q", color = IosSecondaryLabel, fontSize = 14.sp)
                            }
                        } else {
                            groups.take(3).forEachIndexed { index, group ->
                                CompactGroupItem(group)
                                if (index < groups.take(3).size - 1) {
                                    HorizontalDivider(
                                        modifier = Modifier.padding(start = 16.dp),
                                        color = IosSeparator.copy(alpha = 0.5f),
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
                containerColor = IosCard,
                dragHandle = { BottomSheetDefaults.DragHandle() }
            ) {
                Column(modifier = Modifier.fillMaxWidth().padding(bottom = 32.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "KELADIGANLAR",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Black
                        )

                        // Date Navigator
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.background(IosBackground, RoundedCornerShape(8.dp)).padding(2.dp)
                        ) {
                            IosIconButton(
                                size = 28.dp,
                                onClick = {
                                    val calendar = java.util.Calendar.getInstance()
                                    try { calendar.time = sdf.parse(selectedDate) ?: java.util.Date() } catch(e:Exception){}
                                    calendar.add(java.util.Calendar.DAY_OF_YEAR, -1)
                                    viewModel.updateSelectedDate(sdf.format(calendar.time))
                                }
                            ) {
                                Icon(PhosphorIcons.Regular.CaretLeft, null, modifier = Modifier.size(18.dp))
                            }

                            val displayDate = remember(selectedDate) {
                                val cal = java.util.Calendar.getInstance()
                                try { cal.time = sdf.parse(selectedDate) ?: java.util.Date() } catch(e:Exception){}
                                val day = cal.get(java.util.Calendar.DAY_OF_MONTH)
                                val month = listOf("Yan", "Feb", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek")[cal.get(java.util.Calendar.MONTH)]
                                "$day-$month, $currentDayUz"
                            }

                            Text(
                                text = displayDate,
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp)
                            )

                            IosIconButton(
                                size = 28.dp,
                                onClick = {
                                    val calendar = java.util.Calendar.getInstance()
                                    try { calendar.time = sdf.parse(selectedDate) ?: java.util.Date() } catch(e:Exception){}
                                    calendar.add(java.util.Calendar.DAY_OF_YEAR, 1)
                                    viewModel.updateSelectedDate(sdf.format(calendar.time))
                                }
                            ) {
                                Icon(PhosphorIcons.Regular.CaretRight, null, modifier = Modifier.size(18.dp))
                            }
                        }
                    }

                    val arrivedCount = remember(studentsToShow) {
                        studentsToShow.count { student ->
                            student.status?.lowercase() == "present" ||
                            student.status == "1" ||
                            student.status_display?.lowercase()?.contains("kelgan") == true ||
                            !student.arrived_at.isNullOrEmpty()
                        }
                    }

                    Surface(
                        modifier = Modifier.fillMaxWidth().padding(20.dp),
                        shape = RoundedCornerShape(20.dp),
                        color = IosBackground.copy(alpha = 0.5f)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(20.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("UMUMIY KO'RSATKICH", style = MaterialTheme.typography.labelSmall, color = IosBlue, fontWeight = FontWeight.Bold)
                                Text("$arrivedCount / ${if (studentsToShow.isNotEmpty()) studentsToShow.size else (todayAttendance?.expected ?: studentsToday)}", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Black)
                            }
                            Text("${if (studentsToShow.isNotEmpty()) (arrivedCount.toFloat() / studentsToShow.size * 100).toInt() else (todayAttendance?.percentage ?: 0.0).toInt()}%", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black, color = IosBlue)
                        }
                    }

                    val isAttendanceListLoading by viewModel.isAttendanceListLoading.collectAsState()

                    if (isAttendanceListLoading) {
                        Box(modifier = Modifier.fillMaxWidth().height(300.dp), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(color = IosBlue, strokeWidth = 3.dp)
                        }
                    } else {
                        LazyColumn(modifier = Modifier.fillMaxWidth().heightIn(max = 500.dp)) {
                            if (studentsToShow.isEmpty()) {
                                item {
                                    Box(modifier = Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) {
                                        Text("O'quvchilar ro'yxati bo'sh", color = IosSecondaryLabel, fontSize = 14.sp)
                                    }
                                }
                            } else {
                                items(studentsToShow.size) { index ->
                                    AttendanceStudentItem(studentsToShow[index])
                                    if (index < studentsToShow.size - 1) {
                                        HorizontalDivider(modifier = Modifier.padding(horizontal = 20.dp), color = IosSeparator.copy(alpha = 0.3f))
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        PullRefreshIndicator(
            refreshing = isRefreshing,
            state = pullRefreshState,
            modifier = Modifier.align(Alignment.TopCenter),
            backgroundColor = IosCard,
            contentColor = IosBlue
        )
    }
}

@Composable
fun AttendanceStudentItem(student: AttendanceStudentUI) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Surface(
            modifier = Modifier.size(44.dp),
            shape = CircleShape,
            color = IosBackground
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
                    Icon(PhosphorIcons.Regular.Person, null, tint = IosSecondaryLabel, modifier = Modifier.size(24.dp))
                }
            }
        }
        Spacer(modifier = Modifier.width(14.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(student.name, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold, color = IosLabel)
            Text(student.groupName ?: "Guruhsiz", style = MaterialTheme.typography.labelSmall, color = IosSecondaryLabel)
        }
        Column(horizontalAlignment = Alignment.End) {
            val isPresent = remember(student) {
                student.status?.lowercase() == "present" ||
                student.status == "1" ||
                student.status_display?.lowercase()?.contains("kelgan") == true ||
                !student.arrived_at.isNullOrEmpty()
            }
            Surface(
                shape = RoundedCornerShape(6.dp),
                color = if (isPresent) IosGreen.copy(alpha = 0.1f) else IosRed.copy(alpha = 0.1f)
            ) {
                Text(
                    text = (student.status_display ?: "Kelmagan").uppercase(),
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    style = MaterialTheme.typography.labelSmall,
                    color = if (isPresent) IosGreen else IosRed,
                    fontWeight = FontWeight.Black,
                    fontSize = 9.sp
                )
            }
            if (student.arrived_at != null) {
                Text("K: ${student.arrived_at}", style = MaterialTheme.typography.labelSmall, color = IosBlue, fontWeight = FontWeight.Bold, fontSize = 9.sp)
            }
            if (student.left_at != null) {
                Text("Ch: ${student.left_at}", style = MaterialTheme.typography.labelSmall, color = IosSecondaryLabel, fontWeight = FontWeight.Medium, fontSize = 9.sp)
            }
        }
    }
}

@Composable
fun CompactStatCard(label: String, value: String, icon: ImageVector, color: Color, modifier: Modifier = Modifier) {
    IosCard(modifier = modifier, cornerRadius = 12.dp) {
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
                    color = IosSecondaryLabel,
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
                    color = IosLabel,
                    fontSize = 24.sp,
                    letterSpacing = (-1).sp
                )
                if (value.contains(" / ")) {
                    Text(
                        text = " / " + (value.split(" / ").lastOrNull() ?: ""),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold,
                        color = IosSecondaryLabel,
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
            modifier = Modifier.size(36.dp).background(IosBlue.copy(alpha = 0.1f), RoundedCornerShape(8.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(group.name.take(1).uppercase(), color = IosBlue, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(group.name, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold, color = IosLabel)
            Text("${group.studentCount} o'quvchi • ${group.startTime ?: "--:--"}", style = MaterialTheme.typography.labelSmall, color = IosSecondaryLabel)
        }
        Icon(PhosphorIcons.Regular.CaretRight, null, tint = IosSeparator, modifier = Modifier.size(16.dp))
    }
}

fun formatMoney(value: Double?): String {
    val amount = value?.toInt() ?: 0
    return if (amount >= 1000000) "${String.format("%.1f", amount / 1000000.0)}M"
    else if (amount >= 1000) "${amount / 1000}K"
    else amount.toString()
}

object DashboardIcon {
    val Layers = PhosphorIcons.Regular.Stack
    val Users = PhosphorIcons.Regular.UsersThree
    val Clipboard = PhosphorIcons.Regular.ClipboardText
    val TrendingUp = PhosphorIcons.Regular.TrendUp
}
