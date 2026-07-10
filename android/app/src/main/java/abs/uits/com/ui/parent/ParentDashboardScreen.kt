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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material.icons.automirrored.outlined.*
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
            // Tab Content
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(bottom = 84.dp)
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

            // Flat White Bottom Navigation Bar matching mockup
            Surface(
                color = Color.White,
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.BottomCenter)
                    .drawBehind {
                        // Top divider line
                        drawLine(
                            color = Color(0xFFE5E5EA),
                            start = Offset(0f, 0f),
                            end = Offset(size.width, 0f),
                            strokeWidth = 1.dp.toPx()
                        )
                    }
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .navigationBarsPadding()
                        .padding(vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceAround,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    val tabs = listOf(
                        NavigationTabInfo(0, Icons.Outlined.Home, Icons.Filled.Home, "Asosiy"),
                        NavigationTabInfo(1, Icons.Outlined.CheckCircle, Icons.Filled.CheckCircle, "Davomat"),
                        NavigationTabInfo(2, Icons.Outlined.Newspaper, Icons.Filled.Newspaper, "Yangiliklar"),
                        NavigationTabInfo(3, Icons.Outlined.Person, Icons.Filled.Person, "Profil")
                    )

                    tabs.forEach { tab ->
                        val isSelected = selectedTab == tab.id
                        val color = if (isSelected) Color(0xFF0056C6) else Color(0xFF8E8E93)
                        val fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium

                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .iosPressable { selectedTab = tab.id }
                                .padding(horizontal = 12.dp, vertical = 4.dp)
                        ) {
                            Icon(
                                imageVector = if (isSelected) tab.filledIcon else tab.outlinedIcon,
                                contentDescription = tab.label,
                                tint = color,
                                modifier = Modifier.size(22.dp)
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = tab.label,
                                fontSize = 11.sp,
                                fontWeight = fontWeight,
                                color = color
                            )
                        }
                    }
                }
            }
        }
    }
}

data class NavigationTabInfo(
    val id: Int,
    val outlinedIcon: ImageVector,
    val filledIcon: ImageVector,
    val label: String
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
        contentPadding = PaddingValues(top = 8.dp, bottom = 24.dp),
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
                                .background(Color(0xFFF2F2F7)),
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
                                    imageVector = Icons.Default.Person,
                                    contentDescription = null,
                                    modifier = Modifier.size(28.dp),
                                    tint = Color(0xFF8E8E93)
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
                                    color = Color.Black
                                )
                                if (children.size > 1) {
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Icon(
                                        imageVector = Icons.Outlined.ExpandMore,
                                        contentDescription = null,
                                        tint = Color.Black,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            }
                            Text(
                                text = "ID: ${selectedChild?.externalId ?: "N/A"}",
                                fontSize = 12.sp,
                                color = Color(0xFF8E8E93),
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
                                        .background(Color(0xFFF2F2F7)),
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
                                            imageVector = Icons.Default.Person,
                                            contentDescription = null,
                                            tint = Color(0xFF8E8E93),
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
                        .background(Color.White, CircleShape)
                        .border(0.5.dp, Color(0xFFE5E5EA), CircleShape)
                        .iosPressable { onShowNotifications() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Outlined.NotificationsNone,
                        contentDescription = "Bildirishnomalar",
                        tint = Color.Black,
                        modifier = Modifier.size(20.dp)
                    )
                    if (unreadCount > 0) {
                        Box(
                            modifier = Modifier
                                .size(16.dp)
                                .background(Color(0xFFFF3B30), CircleShape)
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
                        isDaySelected -> Color(0xFF0056C6)
                        day.isToday -> Color(0xFF0056C6).copy(alpha = 0.08f)
                        else -> Color.Transparent
                    }
                    val borderStroke = if (day.isToday && !isDaySelected) {
                        BorderStroke(1.dp, Color(0xFF0056C6))
                    } else {
                        null
                    }
                    val dayColor = if (isDaySelected) Color.White else Color(0xFF8E8E93)
                    val dateColor = if (isDaySelected) Color.White else Color(0xFF1C1C1E)

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
                                        .background(if (isDaySelected) Color.White else Color(0xFF0056C6))
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
                            color = Color.Black
                        )
                        // Green / Gray Dot
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(if (isSundaySelected) Color(0xFF8E8E93) else Color(0xFF34C759))
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
                                imageVector = Icons.Outlined.WorkOutline,
                                contentDescription = null,
                                tint = Color(0xFF0056C6),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = courseTitle,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black,
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
                                    color = Color(0xFF0056C6),
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
                                imageVector = Icons.Outlined.AccessTime,
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
                            color = Color.Black
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
                        color = Color.Black
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
                            icon = Icons.AutoMirrored.Outlined.Login,
                            color = Color(0xFF0056C6)
                        )
                        // Check out
                        AttendanceStatItem(
                            label = "Chiqish vaqti",
                            value = selectedRecord?.left_at ?: "- : -",
                            icon = Icons.AutoMirrored.Outlined.Logout,
                            color = Color(0xFF5856D6)
                        )
                        // Total hrs
                        AttendanceStatItem(
                            label = "Jami soat",
                            value = calculateTotalHours(selectedRecord?.arrived_at, selectedRecord?.left_at),
                            icon = Icons.Outlined.CheckCircleOutline,
                            color = Color(0xFF007AFF)
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
                        imageVector = Icons.AutoMirrored.Outlined.ReceiptLong,
                        contentDescription = null,
                        tint = Color(0xFF34C759),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "To'lovlar Tarixi (Joriy oy)",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                }
 
                if (currentMonthPayments.isEmpty()) {
                    Text(
                        text = "Joriy oyda to'lovlar tarixi yo'q",
                        color = Color(0xFF8E8E93),
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
                                            .background(Color(0xFF34C759).copy(alpha = 0.08f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.AutoMirrored.Outlined.ReceiptLong,
                                            contentDescription = null,
                                            tint = Color(0xFF34C759),
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        val formatter = java.text.DecimalFormat("#,###")
                                        val amountStr = formatter.format(p.amount).replace(",", " ")
                                        Text("$amountStr UZS", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                        Text(p.paymentDate, color = Color(0xFF8E8E93), fontSize = 11.sp)
                                    }
                                    Text("To'landi", color = Color(0xFF34C759), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                }
                                if (idx < currentMonthPayments.lastIndex) {
                                    HorizontalDivider(
                                        modifier = Modifier.padding(horizontal = 16.dp),
                                        color = Color(0xFFE5E5EA),
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
                containerColor = Color(0xFF0056C6),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Outlined.Dashboard,
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
            color = Color.Black
        )
        Text(
            text = label,
            fontSize = 10.sp,
            color = Color(0xFF8E8E93),
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun RequestStatusBox(
    modifier: Modifier,
    count: String,
    label: String,
    textColor: Color,
    borderColor: Color,
    bgColor: Color
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(bgColor)
            .border(0.5.dp, borderColor, RoundedCornerShape(16.dp))
            .padding(vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = count,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = textColor
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = label,
                fontSize = 10.sp,
                color = textColor,
                fontWeight = FontWeight.Bold
            )
        }
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
        contentPadding = PaddingValues(top = 8.dp, bottom = 24.dp),
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
                            color = Color(0xFF0056C6)
                        )
                        Icon(
                            imageVector = Icons.Outlined.ExpandMore,
                            contentDescription = null,
                            tint = Color(0xFF0056C6),
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
            item { SectionHeader("Izohlar va Fikrlar", Icons.Outlined.HistoryEdu) }
            items(comments) { grade ->
                GlassTeacherComment(grade)
            }
        }
    }
}

// ==========================================
// TAB 2: SCHEDULE (Timed class listing tab)
// ==========================================
@Composable
fun ScheduleTab(
    selectedChild: StudentResponse?,
    children: List<StudentResponse>,
    selectedChildId: Int?,
    onChildSelected: (Int) -> Unit
) {
    var showChildDropdown by remember { mutableStateOf(false) }
    var selectedDayIndex by rememberSaveable { mutableIntStateOf(1) } // Default Tue (1) active

    val weekDays = listOf(
        Pair("Du", "18"),
        Pair("Se", "19"),
        Pair("Chor", "20"),
        Pair("Pay", "21"),
        Pair("Ju", "22")
    )

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(top = 8.dp, bottom = 24.dp),
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
                Column {
                    Text(
                        text = "Dars jadvalim",
                        fontSize = 26.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    if (children.size > 1) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Box {
                            Row(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0xFFE8F0FE))
                                    .clickable { showChildDropdown = true }
                                    .padding(horizontal = 10.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = selectedChild?.name?.split(" ")?.take(2)?.joinToString(" ") ?: "",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF0056C6)
                                )
                                Icon(
                                    imageVector = Icons.Outlined.ExpandMore,
                                    contentDescription = null,
                                    tint = Color(0xFF0056C6),
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                            DropdownMenu(
                                expanded = showChildDropdown,
                                onDismissRequest = { showChildDropdown = false },
                                modifier = Modifier.background(Color.White)
                            ) {
                                children.forEach { child ->
                                    DropdownMenuItem(
                                        text = { Text(child.name, fontWeight = FontWeight.Bold) },
                                        onClick = {
                                            onChildSelected(child.id)
                                            showChildDropdown = false
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .background(Color.White, CircleShape)
                        .border(0.5.dp, Color(0xFFE5E5EA), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Outlined.CalendarMonth, contentDescription = null, tint = Color.Black, modifier = Modifier.size(18.dp))
                }
            }
        }

        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                weekDays.forEachIndexed { index, day ->
                    val isDayActive = selectedDayIndex == index
                    val dayBg = if (isDayActive) Color(0xFF9E8FFF) else Color.White
                    val dayTextColor = if (isDayActive) Color.White else Color(0xFF8E8E93)
                    val numColor = if (isDayActive) Color.White else Color(0xFF1C1C1E)

                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = dayBg),
                        modifier = Modifier
                            .width(56.dp)
                            .clickable { selectedDayIndex = index }
                            .border(0.5.dp, Color(0xFFE5E5EA), RoundedCornerShape(16.dp)),
                        elevation = CardDefaults.cardElevation(defaultElevation = if (isDayActive) 4.dp else 0.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(vertical = 10.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Text(text = day.first, fontSize = 10.sp, color = dayTextColor, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(text = day.second, fontSize = 16.sp, color = numColor, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        val enrollments = selectedChild?.enrollments?.filter { it.status == "ACTIVE" } ?: emptyList()

        if (enrollments.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Jadval bo'sh", color = Color(0xFF8E8E93))
                }
            }
        } else {
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    enrollments.forEachIndexed { idx, enrollment ->
                        val courseName = enrollment.group?.course?.name ?: "Kurs"
                        
                        val pair = when (idx) {
                            0 -> Triple("08:30 AM", "10:00 AM", "B3, Room 124") to Pair("Mrs. Goodman", false)
                            1 -> Triple("10:30 AM", "12:00 PM", "B2, Room 158") to Pair("Mrs. Melton", true) // Active Now
                            else -> Triple("12:15 PM", "01:45 PM", "B3, Room 310") to Pair("Mr. Hodge", false)
                        }
                        val (timeStart, timeEnd, room) = pair.first
                        val (teacherName, isNow) = pair.second

                        Column {
                            if (isNow) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        "Now",
                                        color = Color(0xFF8E8E93),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    HorizontalDivider(
                                        thickness = 0.5.dp,
                                        color = Color(0xFFC7C7CC)
                                    )
                                }
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.Top
                            ) {
                                Column(
                                    modifier = Modifier.width(68.dp),
                                    horizontalAlignment = Alignment.Start
                                ) {
                                    Text(
                                        text = timeStart,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF1C1C1E)
                                    )
                                    Canvas(
                                        modifier = Modifier
                                            .padding(start = 16.dp, top = 6.dp, bottom = 6.dp)
                                            .height(36.dp)
                                            .width(2.dp)
                                    ) {
                                        val strokeVal = Stroke(
                                            width = 1.dp.toPx(),
                                            pathEffect = PathEffect.dashPathEffect(floatArrayOf(5f, 5f), 0f)
                                        )
                                        drawLine(
                                            color = Color(0xFFC7C7CC),
                                            start = Offset(0f, 0f),
                                            end = Offset(0f, size.height),
                                            strokeWidth = 1.dp.toPx(),
                                            pathEffect = strokeVal.pathEffect
                                        )
                                    }
                                    Text(
                                        text = timeEnd,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF8E8E93)
                                    )
                                }

                                Spacer(modifier = Modifier.width(8.dp))

                                val cardBg = if (isNow) Color(0xFFB4F3B4) else Color.White
                                val textSubjectColor = if (isNow) Color(0xFF1B5E20) else Color.Black
                                val textDescColor = if (isNow) Color(0xFF2E7D32) else Color(0xFF8E8E93)

                                Card(
                                    shape = RoundedCornerShape(22.dp),
                                    colors = CardDefaults.cardColors(containerColor = cardBg),
                                    modifier = Modifier
                                        .weight(1f)
                                        .border(0.5.dp, Color(0xFFE5E5EA), RoundedCornerShape(22.dp)),
                                    elevation = CardDefaults.cardElevation(defaultElevation = if (isNow) 3.dp else 1.dp)
                                ) {
                                    Column(modifier = Modifier.padding(16.dp)) {
                                        Text(
                                            text = courseName,
                                            fontSize = 16.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = textSubjectColor
                                        )
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(
                                            text = room,
                                            fontSize = 11.sp,
                                            color = textDescColor,
                                            fontWeight = FontWeight.Medium
                                        )
                                        Spacer(modifier = Modifier.height(12.dp))

                                        Row(
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .size(24.dp)
                                                    .clip(CircleShape)
                                                    .background(Color.White.copy(alpha = 0.6f)),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Icon(
                                                    Icons.Outlined.Person,
                                                    contentDescription = null,
                                                    tint = Color(0xFF8E8E93),
                                                    modifier = Modifier.size(14.dp)
                                                )
                                            }
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text(
                                                text = teacherName,
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = textSubjectColor
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
        contentPadding = PaddingValues(top = 8.dp, bottom = 24.dp),
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
                        color = Color(0xFF8E8E93),
                        fontSize = 14.sp
                    )
                }
            }
        } else {
            items(notifications) { notification ->
                val cardBg = if (notification.isRead) Color.White else Color(0xFFE8F0FE).copy(alpha = 0.4f)
                val borderCol = if (notification.isRead) Color(0xFFE5E5EA) else Color(0xFF0056C6).copy(alpha = 0.3f)
                val badgeColor = Color(0xFF0056C6)

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
                                .background(if (notification.isRead) Color(0xFFF2F2F7) else Color(0xFFE8F0FE)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Campaign,
                                contentDescription = null,
                                tint = if (notification.isRead) Color(0xFF8E8E93) else Color(0xFF0056C6),
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
                                    color = Color.Black,
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
                                color = Color(0xFF8E8E93),
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
        contentPadding = PaddingValues(bottom = 36.dp),
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
                    color = Color(0xFF8E8E93),
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
                            icon = Icons.Outlined.Person,
                            iconBg = Color(0xFF007AFF).copy(alpha = 0.1f),
                            iconTint = Color(0xFF007AFF),
                            label = "To'liq ismi",
                            value = selectedChild.name,
                            showDivider = true
                        )
                        // ID
                        if (!selectedChild.externalId.isNullOrBlank()) {
                            ProfileInfoRow(
                                icon = Icons.Outlined.Badge,
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
                            "ACTIVE" -> Color(0xFF34C759)
                            "INACTIVE" -> Color(0xFFFF9500)
                            else -> Color(0xFF8E8E93)
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
                                Icon(Icons.Outlined.VerifiedUser, null, tint = statusColor, modifier = Modifier.size(18.dp))
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Holati", fontSize = 12.sp, color = Color(0xFF8E8E93))
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
                        color = Color(0xFF8E8E93),
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
                                    .background(Color(0xFF007AFF).copy(alpha = 0.08f), RoundedCornerShape(12.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Outlined.School, null, tint = Color(0xFF007AFF), modifier = Modifier.size(22.dp))
                            }
                            Column(modifier = Modifier.weight(1f)) {
                                Text(group.name, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF1C1C1E))
                                if (group.course != null) {
                                    Text(group.course.name, fontSize = 12.sp, color = Color(0xFF8E8E93))
                                }
                                if (group.teacher != null) {
                                    Text("O'qituvchi: ${group.teacher.name}", fontSize = 11.sp, color = Color(0xFF8E8E93))
                                }
                                if (group.startTime != null && group.endTime != null) {
                                    Text("${group.startTime} – ${group.endTime}", fontSize = 11.sp, color = Color(0xFF8E8E93))
                                }
                            }
                            Box(
                                modifier = Modifier
                                    .background(
                                        if (isActive) Color(0xFF34C759).copy(alpha = 0.12f) else Color(0xFF8E8E93).copy(alpha = 0.1f),
                                        RoundedCornerShape(8.dp)
                                    )
                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = if (isActive) "Faol" else "Nofaol",
                                    fontSize = 11.sp,
                                    color = if (isActive) Color(0xFF34C759) else Color(0xFF8E8E93),
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
                color = Color(0xFF8E8E93),
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
                            Icon(Icons.Outlined.Language, null, tint = Color(0xFFFF9500), modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Til", fontSize = 12.sp, color = Color(0xFF8E8E93))
                            Text("O'zbek tili", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = Color(0xFF1C1C1E))
                        }
                    }

                    HorizontalDivider(modifier = Modifier.padding(start = 62.dp), color = Color(0xFFF2F2F7), thickness = 0.8.dp)

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
                                .background(Color(0xFFFF3B30).copy(alpha = 0.12f), RoundedCornerShape(10.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Outlined.NotificationsNone, null, tint = Color(0xFFFF3B30), modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Bildirishnomalar", fontSize = 12.sp, color = Color(0xFF8E8E93))
                            Text("Yoqilgan", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = Color(0xFF1C1C1E))
                        }
                    }

                    HorizontalDivider(modifier = Modifier.padding(start = 62.dp), color = Color(0xFFF2F2F7), thickness = 0.8.dp)

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
                                .background(Color(0xFF34C759).copy(alpha = 0.12f), RoundedCornerShape(10.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Outlined.Info, null, tint = Color(0xFF34C759), modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Ilova versiyasi", fontSize = 12.sp, color = Color(0xFF8E8E93))
                            Text("v$appVersion", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = Color(0xFF1C1C1E))
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
                            .background(Color(0xFFFF3B30).copy(alpha = 0.12f), RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.AutoMirrored.Outlined.Logout, null, tint = Color(0xFFFF3B30), modifier = Modifier.size(18.dp))
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        "Tizimdan chiqish",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFFFF3B30),
                        modifier = Modifier.weight(1f)
                    )
                    Icon(Icons.Outlined.ChevronRight, null, tint = Color(0xFFFF3B30).copy(alpha = 0.5f), modifier = Modifier.size(16.dp))
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
            Text(label, fontSize = 12.sp, color = Color(0xFF8E8E93))
            Text(value, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = Color(0xFF1C1C1E))
        }
    }
    if (showDivider) {
        HorizontalDivider(modifier = Modifier.padding(start = 62.dp), color = Color(0xFFF2F2F7), thickness = 0.8.dp)
    }
}


// ==========================================
// RESTORED COMPOSABLES
// ==========================================

@Composable
fun IosSegmentedControl(
    children: List<StudentResponse>,
    selectedChildId: Int?,
    onChildSelected: (Int) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
    ) {
        Text(
            text = "FARZANDLARINGIZ",
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF8E8E93),
            letterSpacing = 1.sp,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            contentPadding = PaddingValues(end = 20.dp)
        ) {
            items(children) { child ->
                val isSelected = child.id == selectedChildId
                val scale by animateFloatAsState(if (isSelected) 1.03f else 1.0f)
                
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isSelected) Color.White else Color(0xFFE5E5EA).copy(alpha = 0.4f)
                    ),
                    elevation = CardDefaults.cardElevation(
                        defaultElevation = if (isSelected) 4.dp else 0.dp
                    ),
                    border = if (isSelected) BorderStroke(
                        1.5.dp,
                        Brush.linearGradient(colors = listOf(Color(0xFF0056C6), Color(0xFF5856D6)))
                    ) else null,
                    modifier = Modifier
                        .graphicsLayer {
                            scaleX = scale
                            scaleY = scale
                        }
                        .clickable { onChildSelected(child.id) }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFF2F2F7)),
                            contentAlignment = Alignment.Center
                        ) {
                            val photoUrl = child.photo?.let {
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
                                    imageVector = Icons.Default.Person,
                                    contentDescription = null,
                                    tint = Color(0xFF8E8E93),
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = child.name.split(" ").take(2).joinToString(" "),
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            fontSize = 13.sp,
                            color = if (isSelected) Color.Black else Color(0xFF1C1C1E).copy(alpha = 0.7f)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SectionHeader(title: String, icon: ImageVector) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Color(0xFF0056C6),
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = title,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black
        )
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
                    Icon(Icons.Outlined.ChevronLeft, contentDescription = "Oldingi oy", tint = IosBlue)
                }

                Text(
                    text = "${monthNamesCorrect[currentMonth]} $currentYear",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )

                IosIconButton(onClick = {
                    calendarState = (calendarState.clone() as Calendar).apply {
                        add(Calendar.MONTH, 1)
                    }
                    onMonthChanged(calendarState.get(Calendar.YEAR), calendarState.get(Calendar.MONTH) + 1)
                }) {
                    Icon(Icons.Outlined.ChevronRight, contentDescription = "Keyingi oy", tint = IosBlue)
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
                        color = Color(0xFF8E8E93),
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
                                isSelected -> Color(0xFF0056C6)
                                record != null -> {
                                    if (isPresent) Color(0xFF34C759).copy(alpha = 0.15f) else Color(0xFFFF3B30).copy(alpha = 0.15f)
                                }
                                else -> Color.Transparent
                            }
                            
                            val textColor = when {
                                isSelected -> Color.White
                                record != null -> {
                                    if (isPresent) Color(0xFF34C759) else Color(0xFFFF3B30)
                                }
                                else -> Color.Black
                            }

                            val borderStroke = if (isSelected) null else BorderStroke(0.5.dp, Color(0xFFF2F2F7))

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
                LegendItem("Kelgan", Color(0xFF34C759))
                Spacer(modifier = Modifier.width(16.dp))
                LegendItem("Kelmagan", Color(0xFFFF3B30))
                Spacer(modifier = Modifier.width(16.dp))
                LegendItem("Dars yo'q", Color(0xFFE5E5EA))
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
                    color = Color.Black
                )
                Surface(
                    color = when {
                        selectedRecord == null -> Color(0xFFE5E5EA)
                        isPresent -> Color(0xFF34C759).copy(alpha = 0.1f)
                        else -> Color(0xFFFF3B30).copy(alpha = 0.1f)
                    },
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = selectedRecord?.status_display ?: "Dars yo'q",
                        color = when {
                            selectedRecord == null -> Color(0xFF8E8E93)
                            isPresent -> Color(0xFF34C759)
                            else -> Color(0xFFFF3B30)
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
                    icon = Icons.AutoMirrored.Outlined.Login,
                    color = Color(0xFF0056C6)
                )
                AttendanceStatItem(
                    label = "Chiqish vaqti",
                    value = selectedRecord?.left_at ?: "- : -",
                    icon = Icons.AutoMirrored.Outlined.Logout,
                    color = Color(0xFF5856D6)
                )
                AttendanceStatItem(
                    label = "Jami soat",
                    value = calculateTotalHours(selectedRecord?.arrived_at, selectedRecord?.left_at),
                    icon = Icons.Outlined.CheckCircleOutline,
                    color = Color(0xFF007AFF)
                )
            }
        }
    }
}

@Composable
fun DetailedAttendanceGrid(records: List<AttendanceRecord>) {
    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp),
        border = BorderStroke(0.5.dp, Color(0xFFE5E5EA)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "DAVOMAT (OXIRGI 30 KUN)",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF8E8E93),
                letterSpacing = 0.5.sp
            )
            Spacer(modifier = Modifier.height(14.dp))

            Box(
                modifier = Modifier.fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    (0 until 30).chunked(10).forEach { rowIndices ->
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            rowIndices.forEach { index ->
                                val record = records.getOrNull(index)
                                val status = record?.status_display
                                val color = when (status) {
                                    "Kelgan" -> Color(0xFF34C759)
                                    null -> Color(0xFFE5E5EA)
                                    else -> Color(0xFFFF3B30)
                                }

                                Box(
                                    modifier = Modifier
                                        .size(22.dp)
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(color)
                                )
                            }
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
                LegendItem("Kelgan", Color(0xFF34C759))
                Spacer(modifier = Modifier.width(16.dp))
                LegendItem("Kelmagan", Color(0xFFFF3B30))
                Spacer(modifier = Modifier.width(16.dp))
                LegendItem("Dars yo'q", Color(0xFFE5E5EA))
            }

            Spacer(modifier = Modifier.height(16.dp))
            HorizontalDivider(color = Color(0xFFF2F2F7), thickness = 1.dp)
            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "OXIRGI DAVOMAT YOZUVLARI",
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF8E8E93),
                letterSpacing = 0.5.sp
            )
            Spacer(modifier = Modifier.height(8.dp))

            val recentRecords = records.take(3)
            if (recentRecords.isEmpty()) {
                Text(
                    text = "Yozuvlar topilmadi",
                    color = Color(0xFF8E8E93),
                    fontSize = 13.sp,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            } else {
                recentRecords.forEachIndexed { index, record ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        val isPresent = record.status_display == "Kelgan"
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(if (isPresent) Color(0xFF34C759) else Color(0xFFFF3B30))
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = record.date,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.weight(1f))
                        Text(
                            text = record.status_display ?: "Yo'q",
                            fontSize = 13.sp,
                            color = if (isPresent) Color(0xFF34C759) else Color(0xFFFF3B30),
                            fontWeight = FontWeight.Bold
                        )
                    }
                    if (index < recentRecords.lastIndex) {
                        HorizontalDivider(color = Color(0xFFF2F2F7), thickness = 0.5.dp)
                    }
                }
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
            color = Color(0xFF8E8E93),
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
                        color = Color.Black
                    )
                    Text(
                        text = "${grade.date} • ${grade.group?.name ?: ""}",
                        fontSize = 11.sp,
                        color = Color(0xFF8E8E93),
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
                    .background(Color(0xFFF2F2F7).copy(alpha = 0.6f))
                    .padding(12.dp)
            ) {
                Column {
                    Icon(
                        imageVector = Icons.Outlined.FormatQuote,
                        contentDescription = null,
                        tint = Color(0xFF5856D6).copy(alpha = 0.2f),
                        modifier = Modifier.size(24.dp)
                    )
                    Text(
                        text = grade.comment ?: "",
                        fontSize = 13.sp,
                        lineHeight = 18.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF1C1C1E),
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
            Color(0xFF34C759).copy(alpha = 0.1f) to Color(0xFF34C759)
        }
        score == "4" || (doubleVal != null && doubleVal >= 3.5) || score.lowercase().contains("b") -> {
            Color(0xFF007AFF).copy(alpha = 0.1f) to Color(0xFF007AFF)
        }
        score == "3" || (doubleVal != null && doubleVal >= 2.5) || score.lowercase().contains("c") -> {
            Color(0xFFFFCC00).copy(alpha = 0.15f) to Color(0xFFC9A200)
        }
        else -> {
            Color(0xFFFF3B30).copy(alpha = 0.1f) to Color(0xFFFF3B30)
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
                        imageVector = Icons.Outlined.NotificationsNone,
                        contentDescription = null,
                        tint = Color(0xFFD1D1D6),
                        modifier = Modifier.size(56.dp)
                    )
                    Text(
                        text = "Bildirishnomalar yo'q",
                        color = Color(0xFF8E8E93),
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
                    val cardBg = if (isRead) Color.White else Color(0xFFE8F0FE).copy(alpha = 0.5f)
                    val borderCol = if (isRead) Color(0xFFE5E5EA) else Color(0xFF007AFF).copy(alpha = 0.3f)

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
                                        if (isRead) Color(0xFFF2F2F7) else Color(0xFF007AFF).copy(alpha = 0.1f),
                                        RoundedCornerShape(12.dp)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.NotificationsNone,
                                    contentDescription = null,
                                    tint = if (isRead) Color(0xFF8E8E93) else Color(0xFF007AFF),
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
                                        color = Color(0xFF1C1C1E),
                                        modifier = Modifier.weight(1f)
                                    )
                                    if (!isRead) {
                                        Box(
                                            modifier = Modifier
                                                .size(8.dp)
                                                .background(Color(0xFF007AFF), CircleShape)
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
