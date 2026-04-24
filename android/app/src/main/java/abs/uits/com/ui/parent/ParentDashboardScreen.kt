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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.font.FontWeight
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

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .drawBehind {
                // Layered Mesh Gradient for iOS Luminous look
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(Color(0xFF8E2DE2).copy(alpha = 0.15f), Color.Transparent),
                        center = Offset(size.width * 0.8f, size.height * 0.1f),
                        radius = size.width * 1.2f
                    )
                )
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(Color(0xFF4A00E0).copy(alpha = 0.12f), Color.Transparent),
                        center = Offset(size.width * 0.2f, size.height * 0.9f),
                        radius = size.width * 1.5f
                    )
                )
            }
    ) {
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                CenterAlignedTopAppBar(
                    colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                        containerColor = Color.Transparent,
                        scrolledContainerColor = Color.White.copy(alpha = 0.8f)
                    ),
                    title = {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("UITS ACADEMY", fontWeight = FontWeight.Black, fontSize = 20.sp, letterSpacing = (-0.5).sp)
                            Text("STUDENT PORTAL", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF007AFF), letterSpacing = 2.sp)
                        }
                    },
                    actions = {
                        IconButton(onClick = { viewModel.refresh() }) {
                            Icon(Icons.Rounded.Refresh, contentDescription = "Refresh", modifier = Modifier.size(24.dp))
                        }
                        IconButton(onClick = onLogout) {
                            Icon(Icons.Rounded.PowerSettingsNew, contentDescription = "Logout", tint = Color.Red, modifier = Modifier.size(24.dp))
                        }
                    }
                )
            }
        ) { padding ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentPadding = PaddingValues(bottom = 32.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                // Loading Indicator
                if (isLoading) {
                    item {
                        LinearProgressIndicator(
                            modifier = Modifier.fillMaxWidth().height(2.dp),
                            color = Color(0xFF007AFF),
                            trackColor = Color.Transparent
                        )
                    }
                }

                // Child Selection Bar (Horizontal Glass Pills)
                if (children.size > 1) {
                    item {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            items(children) { child ->
                                val isSelected = child.id == selectedChildId
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(100.dp))
                                        .background(if (isSelected) Color(0xFF007AFF) else Color.White.copy(alpha = 0.5f))
                                        .border(1.dp, if (isSelected) Color.Transparent else Color.LightGray.copy(alpha = 0.3f), RoundedCornerShape(100.dp))
                                        .clickable { viewModel.selectChild(child.id) }
                                        .padding(horizontal = 16.dp, vertical = 8.dp)
                                ) {
                                    Text(
                                        child.name,
                                        color = if (isSelected) Color.White else Color.Black,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp
                                    )
                                }
                            }
                        }
                    }
                }

                // Calculations for "Today"
                val todayStr = java.text.SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
                val todayRecord = attendance.recent_attendance.find { it.date == todayStr }
                val todayGrade = attendance.grades.find { it.date == todayStr }
                val avgGrade = if (attendance.grades.isNotEmpty()) {
                    attendance.grades.map { it.score.toDoubleOrNull() ?: 0.0 }.average()
                } else 0.0

                // Hero Profile Card
                item {
                    selectedChild?.let { child ->
                        AnimatedContent(targetState = child.id) {
                            ChildLuminousCard(child, attendance, todayRecord, todayGrade, avgGrade)
                        }
                    }
                }

                // Bento Metrics Row
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        AttendanceBentoCard(
                            modifier = Modifier.weight(1f),
                            record = todayRecord ?: attendance.recent_attendance.firstOrNull(),
                            isToday = todayRecord != null
                        )
                        BentoCard(
                            modifier = Modifier.weight(1f),
                            title = "O'rtacha baho",
                            value = if (avgGrade > 0) String.format("%.1f", avgGrade) else "—",
                            icon = Icons.Rounded.BarChart,
                            color = Color(0xFFFFCC00)
                        )
                    }
                }

                // Courses Section
                item { SectionHeader("O'quv guruhlari", Icons.Rounded.School) }
                items(selectedChild?.enrollments?.filter { it.status == "ACTIVE" } ?: emptyList()) { enrollment ->
                    PremiumCourseItem(enrollment)
                }

                // Attendance detailed
                item { SectionHeader("Davomat tarixlari", Icons.Rounded.CalendarToday) }
                item { DetailedAttendanceGrid(attendance.recent_attendance) }

                // Teacher Reports
                if (attendance.grades.any { !it.comment.isNullOrBlank() }) {
                    item { SectionHeader("Izohlar", Icons.Rounded.HistoryEdu) }
                    items(attendance.grades.filter { !it.comment.isNullOrBlank() }) { grade ->
                        GlassTeacherComment(grade)
                    }
                }

                // Payments
                item { SectionHeader("To'lovlar", Icons.Rounded.AccountBalanceWallet) }
                if (payments.isEmpty()) {
                    item { IOSPlaceholder("To'lovlar mavjud emas") }
                } else {
                    items(payments) { payment ->
                        PremiumPaymentItem(payment)
                    }
                }
            }
        }
    }
}

@Composable
fun ChildLuminousCard(child: StudentResponse, attendance: AttendanceResponse, todayRecord: AttendanceRecord?, todayGrade: GradeResponse?, avgGrade: Double) {
    val successRate = if (avgGrade > 0) (avgGrade / 5.0).toFloat().coerceIn(0f, 1f) else 0.7f

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
            .clip(RoundedCornerShape(32.dp))
            .background(Brush.linearGradient(listOf(Color(0xFF007AFF), Color(0xFF5856D6))))
            .padding(24.dp)
    ) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Profile Avatar with Glowing Border
                Box(contentAlignment = Alignment.Center) {
                    Canvas(modifier = Modifier.size(90.dp)) {
                        this.drawArc(
                            color = Color.White.copy(alpha = 0.2f),
                            startAngle = 0f,
                            sweepAngle = 360f,
                            useCenter = false,
                            style = Stroke(width = 4.dp.toPx(), cap = StrokeCap.Round)
                        )
                        this.drawArc(
                            color = Color.White,
                            startAngle = -90f,
                            sweepAngle = successRate * 360f,
                            useCenter = false,
                            style = Stroke(width = 6.dp.toPx(), cap = StrokeCap.Round)
                        )
                    }
                    Box(
                        modifier = Modifier
                            .size(70.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.1f)),
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
                            Icon(Icons.Default.Person, contentDescription = null, modifier = Modifier.size(40.dp), tint = Color.White)
                        }
                    }
                }
                
                Spacer(modifier = Modifier.width(16.dp))
                
                Column {
                    Text(child.name, color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Black, letterSpacing = (-1).sp)
                    Surface(
                        color = Color.White.copy(alpha = 0.15f),
                        shape = RoundedCornerShape(100.dp)
                    ) {
                        Text(
                            "O'quvchi ID: ${child.externalId ?: "N/A"}",
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 2.dp)
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                CompactStat("HOLATI", child.status?.uppercase() ?: "FAOL")
                CompactStat("GURUHLAR", "${child.enrollments.size} TA")
                CompactStat("BUGUNGI BAXO", todayGrade?.score ?: "—")
            }
        }
    }
}

@Composable
fun CompactStat(label: String, value: String) {
    Column {
        Text(label, color = Color.White.copy(alpha = 0.6f), fontSize = 10.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
        Text(value, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun AttendanceBentoCard(modifier: Modifier, record: AttendanceRecord?, isToday: Boolean) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(24.dp))
            .background(Color.White.copy(alpha = 0.7f))
            .border(1.dp, Color.White.copy(alpha = 0.5f), RoundedCornerShape(24.dp))
            .padding(16.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    if (isToday) "BUGUN" else (record?.date?.takeLast(5) ?: "SANA"),
                    color = if (isToday) Color(0xFF007AFF) else Color.Gray,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 1.sp
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text("Keldi", color = Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            Text(
                record?.arrived_at ?: "-- : --",
                color = Color.Black,
                fontSize = 18.sp,
                fontWeight = FontWeight.Black
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text("ketdi", color = Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            Text(
                record?.left_at ?: "-- : --",
                color = Color.Black,
                fontSize = 18.sp,
                fontWeight = FontWeight.Black
            )
        }
    }
}

@Composable
fun BentoCard(modifier: Modifier, title: String, value: String, icon: ImageVector, color: Color) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(24.dp))
            .background(Color.White.copy(alpha = 0.7f))
            .border(1.dp, Color.White.copy(alpha = 0.5f), RoundedCornerShape(24.dp))
            .padding(16.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text(value, color = Color.Black, fontSize = 22.sp, fontWeight = FontWeight.Black)
            Spacer(modifier = Modifier.height(2.dp))
            Text(title, color = Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun SectionHeader(title: String, icon: ImageVector) {
    Row(
        modifier = Modifier.padding(horizontal = 20.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, contentDescription = null, modifier = Modifier.size(18.dp), tint = Color.Gray)
        Spacer(modifier = Modifier.width(8.dp))
        Text(title.uppercase(), fontSize = 13.sp, fontWeight = FontWeight.Black, color = Color.Gray, letterSpacing = 1.sp)
    }
}

@Composable
fun PremiumCourseItem(enrollment: EnrollmentResponse) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
            .clip(RoundedCornerShape(24.dp))
            .background(Color.White.copy(alpha = 0.7f))
            .border(1.dp, Color.White.copy(alpha = 0.5f), RoundedCornerShape(24.dp))
            .padding(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier.size(48.dp).clip(RoundedCornerShape(14.dp)).background(Color(0xFF007AFF).copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Rounded.AutoStories, contentDescription = null, tint = Color(0xFF007AFF), modifier = Modifier.size(24.dp))
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(enrollment.group?.course?.name ?: "Kurs", fontWeight = FontWeight.Black, fontSize = 16.sp)
                Text(enrollment.group?.name ?: "Guruh", color = Color.Gray, fontSize = 12.sp)
            }
            Surface(
                color = Color(0xFF34C759).copy(alpha = 0.15f),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    enrollment.status,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFF34C759)
                )
            }
        }
    }
}

@Composable
fun DetailedAttendanceGrid(records: List<AttendanceRecord>) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
            .clip(RoundedCornerShape(24.dp))
            .background(Color.Black.copy(alpha = 0.03f))
            .padding(16.dp)
    ) {
        Column {
            Text("DAVOMAT HEATMAP (30 KUN)", fontSize = 10.sp, fontWeight = FontWeight.Black, color = Color.Gray)
            Spacer(modifier = Modifier.height(12.dp))
            
            // Grid flow (Stable nested loop)
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                (0 until 30).chunked(10).forEach { rowIndices ->
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        rowIndices.forEach { index ->
                            val record = records.getOrNull(index)
                            val status = record?.status_display
                            val color = when (status) {
                                "Kelgan" -> Color(0xFF34C759)
                                null -> Color.White.copy(alpha = 0.3f)
                                else -> Color(0xFFFF3B30)
                            }
                            
                            Box(
                                modifier = Modifier
                                    .size(16.dp)
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(color)
                            )
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Recent labels
            records.take(3).forEach { record ->
                Row(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                    val isPresent = record.status_display == "Kelgan"
                    Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(if (isPresent) Color(0xFF34C759) else Color(0xFFFF3B30)))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(record.date, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.weight(1f))
                    Text(record.status_display ?: "N/A", fontSize = 12.sp, color = if (isPresent) Color(0xFF34C759) else Color(0xFFFF3B30), fontWeight = FontWeight.Black)
                }
            }
        }
    }
}

@Composable
fun GlassTeacherComment(grade: GradeResponse) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
            .clip(RoundedCornerShape(24.dp))
            .background(Color.White.copy(alpha = 0.7f))
            .border(1.dp, Color.White.copy(alpha = 0.5f), RoundedCornerShape(24.dp))
            .padding(20.dp)
    ) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Rounded.Message, contentDescription = null, modifier = Modifier.size(20.dp), tint = Color(0xFF5856D6))
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(grade.teacher?.name ?: "O'qituvchi", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text(grade.date, fontSize = 10.sp, color = Color.Gray)
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                grade.comment ?: "",
                fontSize = 15.sp,
                lineHeight = 22.sp,
                fontWeight = FontWeight.Medium,
                color = Color.DarkGray
            )
        }
    }
}


@Composable
fun PremiumPaymentItem(payment: PaymentResponse) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
            .clip(RoundedCornerShape(20.dp))
            .background(Color.White.copy(alpha = 0.7f))
            .padding(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier.size(40.dp).clip(CircleShape).background(Color(0xFF34C759).copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Rounded.ReceiptLong, contentDescription = null, tint = Color(0xFF34C759))
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text("${payment.amount} UZS", fontWeight = FontWeight.Black, fontSize = 16.sp)
                Text("${payment.date} • ${payment.method ?: "Kassa"}", color = Color.Gray, fontSize = 12.sp)
            }
            Text("Muvaffaqiyatli", color = Color(0xFF34C759), fontWeight = FontWeight.Black, fontSize = 12.sp)
        }
    }
}

@Composable
fun IOSPlaceholder(text: String) {
    Box(modifier = Modifier.fillMaxWidth().height(100.dp), contentAlignment = Alignment.Center) {
        Text(text, color = Color.Gray.copy(alpha = 0.6f), fontWeight = FontWeight.Medium)
    }
}

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
        } catch (e: Exception) { e.printStackTrace() }
    }

    private fun fetchNotifications() {
        viewModelScope.launch {
            try {
                _notifications.value = NetworkModule.parentApiService.getNotifications()
            } catch (e: Exception) { e.printStackTrace() }
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
        } catch (e: Exception) { e.printStackTrace() }
    }

    fun markAsRead(id: Int) {
        viewModelScope.launch {
            try {
                NetworkModule.parentApiService.markAsRead(id)
                fetchNotifications()
            } catch (e: Exception) { e.printStackTrace() }
        }
    }
}
