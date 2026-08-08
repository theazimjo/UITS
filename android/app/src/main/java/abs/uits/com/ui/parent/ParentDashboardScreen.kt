package abs.uits.com.ui.parent

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.GenericShape
import androidx.compose.foundation.shape.RoundedCornerShape
import com.adamglin.PhosphorIcons
import com.adamglin.phosphoricons.Fill
import com.adamglin.phosphoricons.Regular
import com.adamglin.phosphoricons.fill.CheckCircle
import com.adamglin.phosphoricons.fill.House
import com.adamglin.phosphoricons.fill.Newspaper
import com.adamglin.phosphoricons.fill.Person
import com.adamglin.phosphoricons.regular.Bell
import com.adamglin.phosphoricons.regular.Briefcase
import com.adamglin.phosphoricons.regular.CaretDown
import com.adamglin.phosphoricons.regular.CaretLeft
import com.adamglin.phosphoricons.regular.CaretRight
import com.adamglin.phosphoricons.regular.CheckCircle
import com.adamglin.phosphoricons.regular.Clock
import com.adamglin.phosphoricons.regular.Gauge
import com.adamglin.phosphoricons.regular.GraduationCap
import com.adamglin.phosphoricons.regular.Globe
import com.adamglin.phosphoricons.regular.House
import com.adamglin.phosphoricons.regular.IdentificationCard
import com.adamglin.phosphoricons.regular.Info
import com.adamglin.phosphoricons.regular.Megaphone
import com.adamglin.phosphoricons.regular.Newspaper
import com.adamglin.phosphoricons.regular.Notepad
import com.adamglin.phosphoricons.regular.Person
import com.adamglin.phosphoricons.regular.Quotes
import com.adamglin.phosphoricons.regular.Receipt
import com.adamglin.phosphoricons.regular.SealCheck
import com.adamglin.phosphoricons.regular.SignIn
import com.adamglin.phosphoricons.regular.SignOut
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.clipRect
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import abs.uits.com.data.model.*
import abs.uits.com.data.remote.NetworkModule
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.*
import coil.compose.AsyncImage
import androidx.compose.foundation.BorderStroke
import abs.uits.com.ui.theme.*
import dev.chrisbanes.haze.HazeState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ParentDashboardScreen(
    onLogout: () -> Unit
) {
    val viewModel: ParentViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return ParentViewModel() as T
            }
        }
    )

    val children by viewModel.children.collectAsState()
    val selectedChildId by viewModel.selectedChildId.collectAsState()
    val attendance by viewModel.attendance.collectAsState()
    val exams by viewModel.exams.collectAsState()
    val payments by viewModel.payments.collectAsState()
    val notifications by viewModel.notifications.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    val selectedChild = children.find { it.id == selectedChildId }

    // Bottom Navigation Tab state matching mockup tabs:
    // 0: Home (Asosiy), 1: Attendance (Davomat), 2: Schedule (Dars jadvali), 3: Requests/Payments (To'lovlar)
    var selectedTab by rememberSaveable { mutableIntStateOf(0) }
    var showGeneralReport by rememberSaveable { mutableStateOf(false) }
    var showNotificationsSheet by rememberSaveable { mutableStateOf(false) }

    val personalNotifications = notifications.filter { it.isGeneral != true }
    val hazeState = remember { HazeState() }

    if (showGeneralReport && selectedChild != null) {
        androidx.activity.compose.BackHandler {
            showGeneralReport = false
        }
        StudentGeneralReportScreen(
            child = selectedChild,
            attendance = attendance,
            payments = payments,
            exams = exams,
            onBack = { showGeneralReport = false }
        )
    } else if (showNotificationsSheet) {
        androidx.activity.compose.BackHandler {
            showNotificationsSheet = false
        }
        NotificationsFullScreen(
            notifications = personalNotifications,
            onMarkAsRead = { id -> viewModel.markAsRead(id) },
            onClose = { showNotificationsSheet = false }
        )
    } else {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(IosBackground)
        ) {
            // Tab Content — extends full-height behind the glass tab bar so it has something to blur
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .iosHazeSource(hazeState)
            ) {
                when (selectedTab) {
                    0 -> HomeMockupTab(
                        selectedChild = selectedChild,
                        children = children,
                        selectedChildId = selectedChildId,
                        attendance = attendance,
                        payments = payments,
                        notifications = notifications.filter { it.isGeneral != true },
                        onChildSelected = { id -> viewModel.selectChild(id) },
                        onShowGeneralReport = { showGeneralReport = true },
                        onShowNotifications = { showNotificationsSheet = true }
                    )
                    1 -> AttendanceTab(
                        selectedChild = selectedChild,
                        children = children,
                        selectedChildId = selectedChildId,
                        attendance = attendance,
                        onChildSelected = { id -> viewModel.selectChild(id) },
                        onMonthChanged = { year, month -> viewModel.loadAttendanceForMonth(year, month) }
                    )
                    2 -> NewsTab(
                        notifications = notifications.filter { it.isGeneral == true },
                        onMarkAsRead = { id -> viewModel.markAsRead(id) }
                    )
                    3 -> ProfileTab(
                        selectedChild = selectedChild,
                        onLogout = onLogout
                    )
                }
            }

            // Bottom tab bar — shared with TeacherDashboardScreen so both apps look identical
            IosTabBar(
                items = parentTabItems,
                selectedIndex = selectedTab,
                onSelect = { selectedTab = it },
                modifier = Modifier.align(Alignment.BottomCenter),
                hazeState = hazeState
            )
        }
    }
}

private val parentTabItems = listOf(
    IosTabItem("Asosiy", PhosphorIcons.Regular.House, PhosphorIcons.Fill.House),
    IosTabItem("Davomat", PhosphorIcons.Regular.CheckCircle, PhosphorIcons.Fill.CheckCircle),
    IosTabItem("Yangiliklar", PhosphorIcons.Regular.Newspaper, PhosphorIcons.Fill.Newspaper),
    IosTabItem("Profil", PhosphorIcons.Regular.Person, PhosphorIcons.Fill.Person)
)

// ==========================================
// TAB 0: HOME TAB (Mockup Redesign)
// ==========================================
data class CalendarDay(
    val dayName: String,
    val dayOfMonth: String,
    val dateStr: String,
    val isToday: Boolean
)

@Composable
fun HomeMockupTab(
    selectedChild: StudentResponse?,
    children: List<StudentResponse>,
    selectedChildId: Int?,
    attendance: AttendanceResponse,
    payments: List<PaymentResponse>,
    notifications: List<NotificationResponse> = emptyList(),
    onChildSelected: (Int) -> Unit,
    onShowGeneralReport: () -> Unit,
    onShowNotifications: () -> Unit = {}
) {
    var showChildDropdown by remember { mutableStateOf(false) }

    val sdf = remember { java.text.SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()) }
    val todayDateStr = remember { sdf.format(Date()) }
    var selectedDateStr by rememberSaveable(selectedChildId) { mutableStateOf(todayDateStr) }

    // Generate Calendar Strip days for the entire current month
    val weekDays = remember(selectedChildId) {
        val list = mutableListOf<CalendarDay>()
        val cal = Calendar.getInstance()
        val todayCal = Calendar.getInstance()
        val currentMonth = cal.get(Calendar.MONTH)
        val currentYear = cal.get(Calendar.YEAR)
        
        // Start from first day of this month
        cal.set(Calendar.DAY_OF_MONTH, 1)
        
        while (cal.get(Calendar.MONTH) == currentMonth && cal.get(Calendar.YEAR) == currentYear) {
            val dayName = when (cal.get(Calendar.DAY_OF_WEEK)) {
                Calendar.SUNDAY -> "Yak"
                Calendar.MONDAY -> "Du"
                Calendar.TUESDAY -> "Se"
                Calendar.WEDNESDAY -> "Chor"
                Calendar.THURSDAY -> "Pay"
                Calendar.FRIDAY -> "Ju"
                else -> "Shan"
            }
            val dayOfMonth = cal.get(Calendar.DAY_OF_MONTH).toString()
            val dateStr = sdf.format(cal.time)
            
            val isToday = cal.get(Calendar.YEAR) == todayCal.get(Calendar.YEAR) &&
                    cal.get(Calendar.DAY_OF_YEAR) == todayCal.get(Calendar.DAY_OF_YEAR)
                    
            list.add(CalendarDay(dayName, dayOfMonth, dateStr, isToday))
            cal.add(Calendar.DAY_OF_YEAR, 1)
        }
        list
    }

    val todayIndex = remember(weekDays) {
        weekDays.indexOfFirst { it.isToday }.coerceAtLeast(0)
    }
    val listState = androidx.compose.foundation.lazy.rememberLazyListState()

    LaunchedEffect(todayIndex) {
        if (todayIndex > 0) {
            listState.scrollToItem((todayIndex - 2).coerceAtLeast(0))
        }
    }

    val isSundaySelected = remember(selectedDateStr) {
        try {
            val cal = Calendar.getInstance()
            cal.time = sdf.parse(selectedDateStr) ?: Date()
            cal.get(Calendar.DAY_OF_WEEK) == Calendar.SUNDAY
        } catch (e: Exception) {
            false
        }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(top = 8.dp, bottom = 100.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        item {
            Spacer(modifier = Modifier.statusBarsPadding())
        }
        // Header Profile Row
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(modifier = Modifier.weight(1f)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .iosPressable(enabled = children.size > 1) { showChildDropdown = true },
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Circular Child Photo
                        Box(
                            modifier = Modifier
                                .size(54.dp)
                                .clip(CircleShape)
                                .background(IosBackground),
                            contentAlignment = Alignment.Center
                        ) {
                            val photoUrl = selectedChild?.photo?.let {
                                if (it.startsWith("http")) it else "https://schoolmanage.uz/$it"
                            }
                            if (photoUrl != null) {
                                AsyncImage(
                                    model = photoUrl,
                                    contentDescription = null,
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop
                                )
                            } else {
                                Icon(
                                    imageVector = PhosphorIcons.Regular.Person,
                                    contentDescription = null,
                                    modifier = Modifier.size(28.dp),
                                    tint = IosSecondaryLabel
                                )
                            }
                        }
                        Spacer(modifier = Modifier.width(14.dp))
                        // Name & Subtitle
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = selectedChild?.name ?: "Ismoil Kabulov",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = IosLabel
                                )
                                if (children.size > 1) {
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Icon(
                                        imageVector = PhosphorIcons.Regular.CaretDown,
                                        contentDescription = null,
                                        tint = IosLabel,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            }
                            Text(
                                text = "ID: ${selectedChild?.externalId ?: "N/A"}",
                                fontSize = 12.sp,
                                color = IosSecondaryLabel,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
 
                }
                IosActionSheet(
                    visible = showChildDropdown,
                    onDismiss = { showChildDropdown = false },
                    title = "Farzandingizni tanlang"
                ) {
                    children.forEachIndexed { idx, child ->
                        IosActionSheetRow(
                            label = child.name,
                            isLast = idx == children.lastIndex,
                            leading = {
                                Box(
                                    modifier = Modifier
                                        .size(28.dp)
                                        .clip(CircleShape)
                                        .background(IosBackground),
                                    contentAlignment = Alignment.Center
                                ) {
                                    val pUrl = child.photo?.let {
                                        if (it.startsWith("http")) it else "https://schoolmanage.uz/$it"
                                    }
                                    if (pUrl != null) {
                                        AsyncImage(
                                            model = pUrl,
                                            contentDescription = null,
                                            modifier = Modifier.fillMaxSize(),
                                            contentScale = ContentScale.Crop
                                        )
                                    } else {
                                        Icon(
                                            imageVector = PhosphorIcons.Regular.Person,
                                            contentDescription = null,
                                            tint = IosSecondaryLabel,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }
                            },
                            onClick = {
                                onChildSelected(child.id)
                                showChildDropdown = false
                            }
                        )
                    }
                }
 
                // Notification Bell
                val unreadCount = notifications.count { !it.isRead }
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(IosCard, CircleShape)
                        .border(0.5.dp, IosSeparator, CircleShape)
                        .iosPressable { onShowNotifications() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = PhosphorIcons.Regular.Bell,
                        contentDescription = "Bildirishnomalar",
                        tint = IosLabel,
                        modifier = Modifier.size(20.dp)
                    )
                    if (unreadCount > 0) {
                        Box(
                            modifier = Modifier
                                .size(16.dp)
                                .background(IosRed, CircleShape)
                                .align(Alignment.TopEnd),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = if (unreadCount > 9) "9+" else unreadCount.toString(),
                                fontSize = 8.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        }
 
        // Weekly Day Calendar Strip (Slidable LazyRow)
        item {
            androidx.compose.foundation.lazy.LazyRow(
                state = listState,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                items(weekDays) { day ->
                    val isDaySelected = selectedDateStr == day.dateStr
                    val capsuleBg = when {
                        isDaySelected -> IosBlue
                        day.isToday -> IosBlue.copy(alpha = 0.08f)
                        else -> Color.Transparent
                    }
                    val borderStroke = if (day.isToday && !isDaySelected) {
                        BorderStroke(1.dp, IosBlue)
                    } else {
                        null
                    }
                    val dayColor = if (isDaySelected) Color.White else IosSecondaryLabel
                    val dateColor = if (isDaySelected) Color.White else IosLabel

                    Box(
                        modifier = Modifier
                            .width(50.dp)
                            .clip(RoundedCornerShape(18.dp))
                            .background(capsuleBg)
                            .then(if (borderStroke != null) Modifier.border(borderStroke, RoundedCornerShape(18.dp)) else Modifier)
                            .iosPressable { selectedDateStr = day.dateStr }
                            .padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = day.dayName,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = dayColor,
                                maxLines = 1,
                                softWrap = false
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = day.dayOfMonth,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = dateColor,
                                maxLines = 1,
                                softWrap = false
                            )
                            if (day.isToday) {
                                Spacer(modifier = Modifier.height(4.dp))
                                Box(
                                    modifier = Modifier
                                        .size(4.dp)
                                        .clip(CircleShape)
                                        .background(if (isDaySelected) Color.White else IosBlue)
                                )
                            }
                        }
                    }
                }
            }
        }
 
        // Today's Schedule Card
        item {
            val activeEnrollment = selectedChild?.enrollments?.firstOrNull { it.status == "ACTIVE" }
            val courseTitle = if (isSundaySelected) "Dam olish kuni" else (activeEnrollment?.group?.course?.name ?: "Kurs yo'nalishi")
            val roomName = if (isSundaySelected) "N/A" else (activeEnrollment?.group?.name ?: "Guruh nomi")
            val startTime = activeEnrollment?.group?.startTime
            val endTime = activeEnrollment?.group?.endTime
            val timeSlot = if (isSundaySelected) {
                "Yakshanba - darslar mavjud emas"
            } else if (!startTime.isNullOrBlank() && !endTime.isNullOrBlank()) {
                "$startTime - $endTime"
            } else {
                val groupHash = activeEnrollment?.group?.id ?: (selectedChild?.id ?: 0)
                when (groupHash % 3) {
                    0 -> "09:00 - 11:00"
                    1 -> "14:30 - 16:30"
                    else -> "18:30 - 20:30"
                }
            }
 
            IosCard(
                cornerRadius = 20.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (selectedDateStr == todayDateStr) "Bugungi dars jadvali" else "Dars jadvali ($selectedDateStr)",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = IosLabel
                        )
                        // Green / Gray Dot
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(if (isSundaySelected) IosSecondaryLabel else IosGreen)
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Row 1: Suitcase / Course details
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFE8F0FE)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = PhosphorIcons.Regular.Briefcase,
                                contentDescription = null,
                                tint = IosBlue,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = courseTitle,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = IosLabel,
                            modifier = Modifier.weight(1f)
                        )
                        if (!isSundaySelected) {
                            Surface(
                                color = Color(0xFFE8F0FE),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = roomName,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = IosBlue,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    // Row 2: Clock / Time
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFF3E8FF)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = PhosphorIcons.Regular.Clock,
                                contentDescription = null,
                                tint = Color(0xFF5856D6),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = timeSlot,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = IosLabel
                        )
                    }
                }
            }
        }
 
        // Today's/Selected Attendance Card
        item {
            val selectedRecord = attendance.recent_attendance.find { it.date == selectedDateStr }
 
            IosCard(
                cornerRadius = 20.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = if (selectedDateStr == todayDateStr) "Bugungi Davomat" else "Davomat ($selectedDateStr)",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = IosLabel
                    )
                    Spacer(modifier = Modifier.height(16.dp))
 
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        // Check In
                        AttendanceStatItem(
                            label = "Kirish vaqti",
                            value = selectedRecord?.arrived_at ?: "- : -",
                            icon = PhosphorIcons.Regular.SignIn,
                            color = IosBlue
                        )
                        // Check out
                        AttendanceStatItem(
                            label = "Chiqish vaqti",
                            value = selectedRecord?.left_at ?: "- : -",
                            icon = PhosphorIcons.Regular.SignOut,
                            color = Color(0xFF5856D6)
                        )
                        // Total hrs
                        AttendanceStatItem(
                            label = "Jami soat",
                            value = calculateTotalHours(selectedRecord?.arrived_at, selectedRecord?.left_at),
                            icon = PhosphorIcons.Regular.CheckCircle,
                            color = IosBlue
                        )
                    }
                }
            }
        }
 
        // Payments History Section inside Home Tab (Filtered to current month)
        item {
            val currentMonthStr = remember { java.text.SimpleDateFormat("yyyy-MM", Locale.getDefault()).format(Date()) }
            val currentMonthPayments = remember(payments, currentMonthStr) {
                payments.filter { it.month == currentMonthStr }
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = PhosphorIcons.Regular.Receipt,
                        contentDescription = null,
                        tint = IosGreen,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "To'lovlar Tarixi (Joriy oy)",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = IosLabel
                    )
                }
 
                if (currentMonthPayments.isEmpty()) {
                    Text(
                        text = "Joriy oyda to'lovlar tarixi yo'q",
                        color = IosSecondaryLabel,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                } else {
                    IosCard(
                        cornerRadius = 20.dp,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(vertical = 4.dp)) {
                            currentMonthPayments.forEachIndexed { idx, p ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 16.dp, vertical = 12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(36.dp)
                                            .clip(CircleShape)
                                            .background(IosGreen.copy(alpha = 0.08f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = PhosphorIcons.Regular.Receipt,
                                            contentDescription = null,
                                            tint = IosGreen,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        val formatter = java.text.DecimalFormat("#,###")
                                        val amountStr = formatter.format(p.amount).replace(",", " ")
                                        Text("$amountStr UZS", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                        Text(p.paymentDate, color = IosSecondaryLabel, fontSize = 11.sp)
                                    }
                                    Text("To'landi", color = IosGreen, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                }
                                if (idx < currentMonthPayments.lastIndex) {
                                    HorizontalDivider(
                                        modifier = Modifier.padding(horizontal = 16.dp),
                                        color = IosSeparator.copy(alpha = 0.5f),
                                        thickness = 0.5.dp
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // 5. "Umumiy" Button
        item {
            Spacer(modifier = Modifier.height(10.dp))
            IosFilledButton(
                text = "Umumiy ma'lumotlar",
                onClick = onShowGeneralReport,
                containerColor = IosBlue,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                leadingIcon = {
                    Icon(
                        imageVector = PhosphorIcons.Regular.Gauge,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

fun calculateTotalHours(arrived: String?, left: String?): String {
    if (arrived.isNullOrBlank() || left.isNullOrBlank() || arrived == "- : -" || left == "- : -") return "- : -"
    return try {
        val sdf = java.text.SimpleDateFormat("HH:mm", Locale.getDefault())
        val d1 = sdf.parse(arrived) ?: return "- : -"
        val d2 = sdf.parse(left) ?: return "- : -"
        val diffMs = d2.time - d1.time
        val diffMins = diffMs / (60 * 1000)
        val hrs = diffMins / 60
        val mins = diffMins % 60
        String.format("%02d:%02d", hrs, mins)
    } catch (e: Exception) {
        "- : -"
    }
}

@Composable
fun AttendanceStatItem(
    label: String,
    value: String,
    icon: ImageVector,
    color: Color
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.padding(4.dp)
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(color.copy(alpha = 0.08f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(20.dp)
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = value,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = IosLabel
        )
        Text(
            text = label,
            fontSize = 10.sp,
            color = IosSecondaryLabel,
            fontWeight = FontWeight.Medium
        )
    }
}

// ==========================================
// TAB 1: ATTENDANCE (Original Heatmap tab)
// ==========================================
@Composable
fun AttendanceTab(
    selectedChild: StudentResponse?,
    children: List<StudentResponse>,
    selectedChildId: Int?,
    attendance: AttendanceResponse,
    onChildSelected: (Int) -> Unit,
    onMonthChanged: (Int, Int) -> Unit
) {
    var showChildDropdown by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(top = 8.dp, bottom = 100.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.statusBarsPadding())
        }
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IosLargeTitle("Davomat tahlili")
                if (children.size > 1) {
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFFE8F0FE))
                            .iosPressable { showChildDropdown = true }
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = selectedChild?.name?.split(" ")?.take(2)?.joinToString(" ") ?: "Farzand",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = IosBlue
                        )
                        Icon(
                            imageVector = PhosphorIcons.Regular.CaretDown,
                            contentDescription = null,
                            tint = IosBlue,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }

        item {
            IosActionSheet(
                visible = showChildDropdown,
                onDismiss = { showChildDropdown = false },
                title = "Farzandingizni tanlang"
            ) {
                children.forEachIndexed { idx, child ->
                    IosActionSheetRow(
                        label = child.name,
                        isLast = idx == children.lastIndex,
                        onClick = {
                            onChildSelected(child.id)
                            showChildDropdown = false
                        }
                    )
                }
            }
        }

        item {
            InteractiveAttendanceCalendar(
                recentAttendance = attendance.recent_attendance,
                onMonthChanged = onMonthChanged
            )
        }

        val comments = attendance.grades.filter { !it.comment.isNullOrBlank() }
        if (comments.isNotEmpty()) {
            item {
                IosSectionHeader(
                    "Izohlar va Fikrlar",
                    PhosphorIcons.Regular.Notepad,
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 6.dp)
                )
            }
            items(comments) { grade ->
                GlassTeacherComment(grade)
            }
        }
    }
}

// ==========================================
// TAB 2 (NEW): NEWS / ANNOUNCEMENTS TAB
// ==========================================
@Composable
fun NewsTab(
    notifications: List<NotificationResponse>,
    onMarkAsRead: (Int) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(top = 8.dp, bottom = 100.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.statusBarsPadding())
        }
        item {
            IosLargeTitle("Yangiliklar va E'lonlar", modifier = Modifier.padding(horizontal = 20.dp))
        }

        if (notifications.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Yangiliklar yoki e'lonlar mavjud emas",
                        color = IosSecondaryLabel,
                        fontSize = 14.sp
                    )
                }
            }
        } else {
            items(notifications) { notification ->
                val cardBg = if (notification.isRead) IosCard else Color(0xFFE8F0FE).copy(alpha = 0.4f)
                val borderCol = if (notification.isRead) IosSeparator else IosBlue.copy(alpha = 0.3f)
                val badgeColor = IosBlue

                IosCard(
                    cornerRadius = 20.dp,
                    containerColor = cardBg,
                    borderColor = borderCol,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                        .iosPressable {
                            if (!notification.isRead) {
                                onMarkAsRead(notification.id)
                            }
                        }
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(if (notification.isRead) IosBackground else Color(0xFFE8F0FE)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = PhosphorIcons.Regular.Megaphone,
                                contentDescription = null,
                                tint = if (notification.isRead) IosSecondaryLabel else IosBlue,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        
                        Spacer(modifier = Modifier.width(14.dp))
                        
                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = notification.title,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = IosLabel,
                                    modifier = Modifier.weight(1f)
                                )
                                if (!notification.isRead) {
                                    Surface(
                                        color = badgeColor,
                                        shape = RoundedCornerShape(6.dp)
                                    ) {
                                        Text(
                                            text = "YANGI",
                                            color = Color.White,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = notification.message,
                                fontSize = 13.sp,
                                lineHeight = 18.sp,
                                color = Color(0xFF48484A)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = notification.createdAt,
                                fontSize = 11.sp,
                                color = IosSecondaryLabel,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            }
        }
    }
}

// ==========================================
// TAB 3: REQUESTS / TO'LOVLAR & IMTIHONLAR
// ==========================================
@Composable
fun ProfileTab(
    selectedChild: StudentResponse?,
    onLogout: () -> Unit
) {
    val ctx = androidx.compose.ui.platform.LocalContext.current
    val packageInfo = remember {
        try { ctx.packageManager.getPackageInfo(ctx.packageName, 0) } catch (e: Exception) { null }
    }
    val appVersion = packageInfo?.versionName ?: "1.0.0"

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(IosBackground),
        contentPadding = PaddingValues(bottom = 110.dp),
        verticalArrangement = Arrangement.spacedBy(0.dp)
    ) {
        item { Spacer(modifier = Modifier.statusBarsPadding()) }

        // ── FARZAND MA'LUMOTLARI ─────────────────────────────────
        if (selectedChild != null) {
            item {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "FARZAND MA'LUMOTLARI",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = IosSecondaryLabel,
                    letterSpacing = 0.8.sp,
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 4.dp)
                )
            }
            item {
                IosCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                ) {
                    Column(modifier = Modifier.padding(vertical = 2.dp)) {
                        // Ism
                        ProfileInfoRow(
                            icon = PhosphorIcons.Regular.Person,
                            iconBg = IosBlue.copy(alpha = 0.1f),
                            iconTint = IosBlue,
                            label = "To'liq ismi",
                            value = selectedChild.name,
                            showDivider = true
                        )
                        // ID
                        if (!selectedChild.externalId.isNullOrBlank()) {
                            ProfileInfoRow(
                                icon = PhosphorIcons.Regular.IdentificationCard,
                                iconBg = Color(0xFF5856D6).copy(alpha = 0.1f),
                                iconTint = Color(0xFF5856D6),
                                label = "O'quvchi ID",
                                value = selectedChild.externalId!!,
                                showDivider = true
                            )
                        }
                        // Holat
                        val statusLabel = when (selectedChild.status) {
                            "ACTIVE" -> "Faol o'quvchi"
                            "INACTIVE" -> "Nofaol"
                            "GRADUATED" -> "Bitiruvchi"
                            else -> selectedChild.status ?: "Noma'lum"
                        }
                        val statusColor = when (selectedChild.status) {
                            "ACTIVE" -> IosGreen
                            "INACTIVE" -> Color(0xFFFF9500)
                            else -> IosSecondaryLabel
                        }
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(34.dp)
                                    .background(statusColor.copy(alpha = 0.1f), RoundedCornerShape(10.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(PhosphorIcons.Regular.SealCheck, null, tint = statusColor, modifier = Modifier.size(18.dp))
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Holati", fontSize = 12.sp, color = IosSecondaryLabel)
                                Text(statusLabel, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = statusColor)
                            }
                        }
                    }
                }
            }

            // Guruhlar
            if (selectedChild.enrollments.isNotEmpty()) {
                item {
                    Spacer(modifier = Modifier.height(20.dp))
                    Text(
                        text = "O'QIYOTGAN GURUHLAR",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = IosSecondaryLabel,
                        letterSpacing = 0.8.sp,
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 4.dp)
                    )
                }
                items(selectedChild.enrollments.filter { it.group != null }) { enrollment ->
                    val group = enrollment.group!!
                    val isActive = enrollment.status == "ACTIVE"
                    IosCard(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 4.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .background(IosBlue.copy(alpha = 0.08f), RoundedCornerShape(12.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(PhosphorIcons.Regular.GraduationCap, null, tint = IosBlue, modifier = Modifier.size(22.dp))
                            }
                            Column(modifier = Modifier.weight(1f)) {
                                Text(group.name, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = IosLabel)
                                if (group.course != null) {
                                    Text(group.course.name, fontSize = 12.sp, color = IosSecondaryLabel)
                                }
                                if (group.teacher != null) {
                                    Text("O'qituvchi: ${group.teacher.name}", fontSize = 11.sp, color = IosSecondaryLabel)
                                }
                                if (group.startTime != null && group.endTime != null) {
                                    Text("${group.startTime} – ${group.endTime}", fontSize = 11.sp, color = IosSecondaryLabel)
                                }
                            }
                            Box(
                                modifier = Modifier
                                    .background(
                                        if (isActive) IosGreen.copy(alpha = 0.12f) else IosSecondaryLabel.copy(alpha = 0.1f),
                                        RoundedCornerShape(8.dp)
                                    )
                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = if (isActive) "Faol" else "Nofaol",
                                    fontSize = 11.sp,
                                    color = if (isActive) IosGreen else IosSecondaryLabel,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }

        // ── ILOVA SOZLAMALARI ────────────────────────────────────
        item {
            Spacer(modifier = Modifier.height(20.dp))
            Text(
                text = "ILOVA SOZLAMALARI",
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                color = IosSecondaryLabel,
                letterSpacing = 0.8.sp,
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 4.dp)
            )
        }
        item {
            IosCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            ) {
                Column(modifier = Modifier.padding(vertical = 2.dp)) {
                    // Til (informational — no in-app language switch, so no chevron affordance)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .background(Color(0xFFFF9500).copy(alpha = 0.12f), RoundedCornerShape(10.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(PhosphorIcons.Regular.Globe, null, tint = Color(0xFFFF9500), modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Til", fontSize = 12.sp, color = IosSecondaryLabel)
                            Text("O'zbek tili", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = IosLabel)
                        }
                    }

                    HorizontalDivider(modifier = Modifier.padding(start = 62.dp), color = IosSeparator.copy(alpha = 0.5f), thickness = 0.5.dp)

                    // Bildirishnomalar (informational — no in-app toggle, so no chevron affordance)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .background(IosRed.copy(alpha = 0.12f), RoundedCornerShape(10.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(PhosphorIcons.Regular.Bell, null, tint = IosRed, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Bildirishnomalar", fontSize = 12.sp, color = IosSecondaryLabel)
                            Text("Yoqilgan", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = IosLabel)
                        }
                    }

                    HorizontalDivider(modifier = Modifier.padding(start = 62.dp), color = IosSeparator.copy(alpha = 0.5f), thickness = 0.5.dp)

                    // Versiya
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .background(IosGreen.copy(alpha = 0.12f), RoundedCornerShape(10.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(PhosphorIcons.Regular.Info, null, tint = IosGreen, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Ilova versiyasi", fontSize = 12.sp, color = IosSecondaryLabel)
                            Text("v$appVersion", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = IosLabel)
                        }
                    }
                }
            }
        }

        // ── CHIQISH TUGMASI ──────────────────────────────────────
        item {
            Spacer(modifier = Modifier.height(20.dp))
            IosCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .iosPressable { onLogout() }
                        .padding(horizontal = 16.dp, vertical = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .background(IosRed.copy(alpha = 0.12f), RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(PhosphorIcons.Regular.SignOut, null, tint = IosRed, modifier = Modifier.size(18.dp))
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        "Tizimdan chiqish",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = IosRed,
                        modifier = Modifier.weight(1f)
                    )
                    Icon(PhosphorIcons.Regular.CaretRight, null, tint = IosRed.copy(alpha = 0.5f), modifier = Modifier.size(16.dp))
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}

@Composable
private fun ProfileInfoRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconBg: Color,
    iconTint: Color,
    label: String,
    value: String,
    showDivider: Boolean = false
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(34.dp)
                .background(iconBg, RoundedCornerShape(10.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, null, tint = iconTint, modifier = Modifier.size(18.dp))
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(label, fontSize = 12.sp, color = IosSecondaryLabel)
            Text(value, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = IosLabel)
        }
    }
    if (showDivider) {
        HorizontalDivider(modifier = Modifier.padding(start = 62.dp), color = IosSeparator.copy(alpha = 0.5f), thickness = 0.5.dp)
    }
}

@Composable
fun InteractiveAttendanceCalendar(
    recentAttendance: List<AttendanceRecord>,
    onMonthChanged: (Int, Int) -> Unit
) {
    var calendarState by remember { mutableStateOf(Calendar.getInstance()) }
    var selectedDateState by remember { mutableStateOf(Calendar.getInstance()) }

    val currentMonth = calendarState.get(Calendar.MONTH)
    val currentYear = calendarState.get(Calendar.YEAR)

    val monthNamesCorrect = listOf(
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
        "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
    )

    val tempCal = Calendar.getInstance().apply {
        time = calendarState.time
        set(Calendar.DAY_OF_MONTH, 1)
    }
    
    val firstDayOfWeek = when (tempCal.get(Calendar.DAY_OF_WEEK)) {
        Calendar.MONDAY -> 0
        Calendar.TUESDAY -> 1
        Calendar.WEDNESDAY -> 2
        Calendar.THURSDAY -> 3
        Calendar.FRIDAY -> 4
        Calendar.SATURDAY -> 5
        else -> 6 // Sunday
    }

    val daysInMonth = tempCal.getActualMaximum(Calendar.DAY_OF_MONTH)
    val totalCells = firstDayOfWeek + daysInMonth

    IosCard(
        cornerRadius = 20.dp,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IosIconButton(onClick = {
                    calendarState = (calendarState.clone() as Calendar).apply {
                        add(Calendar.MONTH, -1)
                    }
                    onMonthChanged(calendarState.get(Calendar.YEAR), calendarState.get(Calendar.MONTH) + 1)
                }) {
                    Icon(PhosphorIcons.Regular.CaretLeft, contentDescription = "Oldingi oy", tint = IosBlue)
                }

                Text(
                    text = "${monthNamesCorrect[currentMonth]} $currentYear",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = IosLabel
                )

                IosIconButton(onClick = {
                    calendarState = (calendarState.clone() as Calendar).apply {
                        add(Calendar.MONTH, 1)
                    }
                    onMonthChanged(calendarState.get(Calendar.YEAR), calendarState.get(Calendar.MONTH) + 1)
                }) {
                    Icon(PhosphorIcons.Regular.CaretRight, contentDescription = "Keyingi oy", tint = IosBlue)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            val weekDayLabels = listOf("Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya")
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                weekDayLabels.forEach { label ->
                    Text(
                        text = label,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = IosSecondaryLabel,
                        modifier = Modifier.weight(1f),
                        textAlign = TextAlign.Center
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            val cellList = List(totalCells) { cellIdx ->
                if (cellIdx < firstDayOfWeek) null else cellIdx - firstDayOfWeek + 1
            }

            cellList.chunked(7).forEach { weekDays ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    weekDays.forEach { dayOfMonth ->
                        if (dayOfMonth != null) {
                            val dateQuery = String.format(Locale.US, "%04d-%02d-%02d", currentYear, currentMonth + 1, dayOfMonth)
                            val record = recentAttendance.find { it.date == dateQuery }
                            
                            val isSelected = selectedDateState.get(Calendar.YEAR) == currentYear &&
                                    selectedDateState.get(Calendar.MONTH) == currentMonth &&
                                    selectedDateState.get(Calendar.DAY_OF_MONTH) == dayOfMonth

                            val isPresent = record?.status_display == "Kelgan"
                            val cellBg = when {
                                isSelected -> IosBlue
                                record != null -> {
                                    if (isPresent) IosGreen.copy(alpha = 0.15f) else IosRed.copy(alpha = 0.15f)
                                }
                                else -> Color.Transparent
                            }
                            
                            val textColor = when {
                                isSelected -> Color.White
                                record != null -> {
                                    if (isPresent) IosGreen else IosRed
                                }
                                else -> IosLabel
                            }

                            val borderStroke = if (isSelected) null else BorderStroke(0.5.dp, IosBackground)

                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .aspectRatio(1f)
                                    .padding(3.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(cellBg)
                                    .iosPressable {
                                        selectedDateState = Calendar.getInstance().apply {
                                            set(Calendar.YEAR, currentYear)
                                            set(Calendar.MONTH, currentMonth)
                                            set(Calendar.DAY_OF_MONTH, dayOfMonth)
                                        }
                                    }
                                    .then(if (borderStroke != null) Modifier.border(borderStroke, RoundedCornerShape(10.dp)) else Modifier),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = dayOfMonth.toString(),
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = textColor
                                )
                            }
                        } else {
                            Spacer(modifier = Modifier.weight(1f).aspectRatio(1f).padding(3.dp))
                        }
                    }
                    if (weekDays.size < 7) {
                        repeat(7 - weekDays.size) {
                            Spacer(modifier = Modifier.weight(1f).aspectRatio(1f).padding(3.dp))
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                LegendItem("Kelgan", IosGreen)
                Spacer(modifier = Modifier.width(16.dp))
                LegendItem("Kelmagan", IosRed)
                Spacer(modifier = Modifier.width(16.dp))
                LegendItem("Dars yo'q", IosSeparator)
            }
        }
    }

    Spacer(modifier = Modifier.height(16.dp))

    val selYear = selectedDateState.get(Calendar.YEAR)
    val selMonth = selectedDateState.get(Calendar.MONTH)
    val selDay = selectedDateState.get(Calendar.DAY_OF_MONTH)
    val selDateQuery = String.format(Locale.US, "%04d-%02d-%02d", selYear, selMonth + 1, selDay)
    
    val selectedRecord = recentAttendance.find { it.date == selDateQuery }
    val isPresent = selectedRecord?.status_display == "Kelgan"

    IosCard(
        cornerRadius = 20.dp,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "$selDay-${monthNamesCorrect[selMonth]}, $selYear",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = IosLabel
                )
                Surface(
                    color = when {
                        selectedRecord == null -> IosSeparator
                        isPresent -> IosGreen.copy(alpha = 0.1f)
                        else -> IosRed.copy(alpha = 0.1f)
                    },
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = selectedRecord?.status_display ?: "Dars yo'q",
                        color = when {
                            selectedRecord == null -> IosSecondaryLabel
                            isPresent -> IosGreen
                            else -> IosRed
                        },
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                AttendanceStatItem(
                    label = "Kirish vaqti",
                    value = selectedRecord?.arrived_at ?: "- : -",
                    icon = PhosphorIcons.Regular.SignIn,
                    color = IosBlue
                )
                AttendanceStatItem(
                    label = "Chiqish vaqti",
                    value = selectedRecord?.left_at ?: "- : -",
                    icon = PhosphorIcons.Regular.SignOut,
                    color = Color(0xFF5856D6)
                )
                AttendanceStatItem(
                    label = "Jami soat",
                    value = calculateTotalHours(selectedRecord?.arrived_at, selectedRecord?.left_at),
                    icon = PhosphorIcons.Regular.CheckCircle,
                    color = IosBlue
                )
            }
        }
    }
}

@Composable
fun LegendItem(label: String, color: Color) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .clip(RoundedCornerShape(3.dp))
                .background(color)
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = label,
            fontSize = 11.sp,
            color = IosSecondaryLabel,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun GlassTeacherComment(grade: GradeResponse) {
    IosCard(
        cornerRadius = 20.dp,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                val initials = grade.teacher?.name?.split(" ")
                    ?.take(2)
                    ?.mapNotNull { it.firstOrNull()?.toString() }
                    ?.joinToString("") ?: "O'"
                
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF5856D6).copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = initials.uppercase(),
                        color = Color(0xFF5856D6),
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                }
                
                Spacer(modifier = Modifier.width(12.dp))
                
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = grade.teacher?.name ?: "O'qituvchi",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = IosLabel
                    )
                    Text(
                        text = "${grade.date} • ${grade.group?.name ?: ""}",
                        fontSize = 11.sp,
                        color = IosSecondaryLabel,
                        fontWeight = FontWeight.Medium
                    )
                }
                
                val badgeColors = getScoreBadgeColors(grade.score)
                Surface(
                    color = badgeColors.first,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = "Baho: ${grade.score}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = badgeColors.second,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(IosBackground.copy(alpha = 0.6f))
                    .padding(12.dp)
            ) {
                Column {
                    Icon(
                        imageVector = PhosphorIcons.Regular.Quotes,
                        contentDescription = null,
                        tint = Color(0xFF5856D6).copy(alpha = 0.2f),
                        modifier = Modifier.size(24.dp)
                    )
                    Text(
                        text = grade.comment ?: "",
                        fontSize = 13.sp,
                        lineHeight = 18.sp,
                        fontWeight = FontWeight.Medium,
                        color = IosLabel,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun getScoreBadgeColors(score: String): Pair<Color, Color> {
    val doubleVal = score.toDoubleOrNull()
    return when {
        score == "5" || (doubleVal != null && doubleVal >= 4.5) || score.lowercase().contains("a") -> {
            IosGreen.copy(alpha = 0.1f) to IosGreen
        }
        score == "4" || (doubleVal != null && doubleVal >= 3.5) || score.lowercase().contains("b") -> {
            IosBlue.copy(alpha = 0.1f) to IosBlue
        }
        score == "3" || (doubleVal != null && doubleVal >= 2.5) || score.lowercase().contains("c") -> {
            Color(0xFFFFCC00).copy(alpha = 0.15f) to Color(0xFFC9A200)
        }
        else -> {
            IosRed.copy(alpha = 0.1f) to IosRed
        }
    }
}

// ==========================================
// NOTIFICATIONS FULL SCREEN
// ==========================================

@Composable
fun NotificationsFullScreen(
    notifications: List<NotificationResponse>,
    onMarkAsRead: (Int) -> Unit,
    onClose: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(IosBackground)
    ) {
        IosNavBar(title = "Bildirishnomalar", onBack = onClose)

        if (notifications.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = PhosphorIcons.Regular.Bell,
                        contentDescription = null,
                        tint = Color(0xFFD1D1D6),
                        modifier = Modifier.size(56.dp)
                    )
                    Text(
                        text = "Bildirishnomalar yo'q",
                        color = IosSecondaryLabel,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = "To'lov, davomat va imtihon natijalari\nbu yerda ko'rinadi",
                        color = Color(0xFFAEAEB2),
                        fontSize = 13.sp,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(notifications) { notification ->
                    val isRead = notification.isRead
                    val cardBg = if (isRead) IosCard else Color(0xFFE8F0FE).copy(alpha = 0.5f)
                    val borderCol = if (isRead) IosSeparator else IosBlue.copy(alpha = 0.3f)

                    IosCard(
                        cornerRadius = 16.dp,
                        containerColor = cardBg,
                        borderColor = borderCol,
                        modifier = Modifier
                            .fillMaxWidth()
                            .iosPressable {
                                if (!isRead) onMarkAsRead(notification.id)
                            }
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .background(
                                        if (isRead) IosBackground else IosBlue.copy(alpha = 0.1f),
                                        RoundedCornerShape(12.dp)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = PhosphorIcons.Regular.Bell,
                                    contentDescription = null,
                                    tint = if (isRead) IosSecondaryLabel else IosBlue,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Column(modifier = Modifier.weight(1f)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = notification.title,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = IosLabel,
                                        modifier = Modifier.weight(1f)
                                    )
                                    if (!isRead) {
                                        Box(
                                            modifier = Modifier
                                                .size(8.dp)
                                                .background(IosBlue, CircleShape)
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = notification.message,
                                    fontSize = 13.sp,
                                    color = Color(0xFF3C3C43).copy(alpha = 0.6f),
                                    lineHeight = 18.sp
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = try {
                                        val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                                        sdf.timeZone = java.util.TimeZone.getTimeZone("UTC")
                                        val parsed = sdf.parse(notification.createdAt)
                                        val fmt = java.text.SimpleDateFormat("dd MMM, HH:mm", Locale.getDefault())
                                        fmt.format(parsed ?: notification.createdAt)
                                    } catch (e: Exception) { notification.createdAt },
                                    fontSize = 11.sp,
                                    color = Color(0xFFAEAEB2)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

// ==========================================
// VIEWMODEL DEFINITION
// ==========================================

class ParentViewModel : ViewModel() {
    private val _children = MutableStateFlow<List<StudentResponse>>(emptyList())
    val children = _children.asStateFlow()

    private val _selectedChildId = MutableStateFlow<Int?>(null)
    val selectedChildId = _selectedChildId.asStateFlow()

    private val _attendance = MutableStateFlow(AttendanceResponse())
    val attendance = _attendance.asStateFlow()

    private val _exams = MutableStateFlow<List<ExamResponse>>(emptyList())
    val exams = _exams.asStateFlow()

    private val _payments = MutableStateFlow<List<PaymentResponse>>(emptyList())
    val payments = _payments.asStateFlow()

    private val _notifications = MutableStateFlow<List<NotificationResponse>>(emptyList())
    val notifications = _notifications.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    init {
        fetchInitialData()
    }

    private fun fetchInitialData() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                fetchChildren()
                fetchNotifications()
            } finally {
                _isLoading.value = false
            }
        }
    }

    private suspend fun fetchChildren() {
        try {
            val res = NetworkModule.parentApiService.getChildren()
            _children.value = res
            if (res.isNotEmpty() && _selectedChildId.value == null) {
                selectChild(res[0].id)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun fetchNotifications() {
        viewModelScope.launch {
            try {
                _notifications.value = NetworkModule.parentApiService.getNotifications()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun selectChild(id: Int) {
        _selectedChildId.value = id
        viewModelScope.launch {
            _isLoading.value = true
            try {
                fetchChildDetails(id)
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun refresh() {
        val id = _selectedChildId.value
        viewModelScope.launch {
            _isLoading.value = true
            try {
                fetchNotifications()
                if (id != null) {
                    fetchChildDetails(id)
                } else {
                    fetchChildren()
                }
            } finally {
                _isLoading.value = false
            }
        }
    }

    private suspend fun fetchChildDetails(id: Int) {
        try {
            val date = java.text.SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
            _attendance.value = NetworkModule.parentApiService.getChildAttendance(id, date)
            _exams.value = NetworkModule.parentApiService.getChildExams(id)
            _payments.value = NetworkModule.parentApiService.getChildPayments(id)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun loadAttendanceForMonth(year: Int, month: Int) {
        val childId = _selectedChildId.value ?: return
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val dateStr = String.format(Locale.US, "%04d-%02d-01", year, month)
                _attendance.value = NetworkModule.parentApiService.getChildAttendance(childId, dateStr)
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun markAsRead(id: Int) {
        viewModelScope.launch {
            try {
                NetworkModule.parentApiService.markAsRead(id)
                fetchNotifications()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
