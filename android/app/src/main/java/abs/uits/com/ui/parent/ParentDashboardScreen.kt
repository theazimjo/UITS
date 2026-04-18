package abs.uits.com.ui.parent

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
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

    Scaffold(
        topBar = {
            Column {
                CenterAlignedTopAppBar(
                    title = { 
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("UITS CRM", fontWeight = FontWeight.Black, fontSize = 18.sp)
                            Text("Ota-ona portali", fontSize = 10.sp, color = MaterialTheme.colorScheme.primary)
                        }
                    },
                    actions = {
                        IconButton(onClick = { viewModel.refresh() }) {
                            Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                        }
                        IconButton(onClick = onLogout) {
                            Icon(Icons.Default.Logout, contentDescription = "Logout")
                        }
                    }
                )
                if (isLoading) {
                    LinearProgressIndicator(
                        modifier = Modifier.fillMaxWidth(),
                        color = MaterialTheme.colorScheme.primary,
                        trackColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
                    )
                }
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.surface),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // Child Selector
            if (children.size > 1) {
                item {
                    Text("Farzandni tanlang", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        items(children) { child ->
                            val isSelected = child.id == selectedChildId
                            FilterChip(
                                selected = isSelected,
                                onClick = { viewModel.selectChild(child.id) },
                                label = { Text(child.name) },
                                leadingIcon = if (isSelected) {
                                    { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp)) }
                                } else null
                            )
                        }
                    }
                }
            }

            // Hero Card
            item {
                selectedChild?.let { child ->
                    ChildHeroCard(child, attendance)
                }
            }

            // Active Courses
            item {
                SectionTitle("Faol o'quv dasturlari", Icons.Default.School)
            }
            items(selectedChild?.enrollments?.filter { it.status == "ACTIVE" } ?: emptyList()) { enrollment ->
                CourseCard(enrollment)
            }

            // Attendance Section
            item {
                SectionTitle("Batafsil Davomat", Icons.Default.CalendarToday)
                AttendanceSummary(attendance.recent_attendance)
            }

            // Teacher Reports
            if (attendance.grades.any { !it.comment.isNullOrBlank() }) {
                item {
                    SectionTitle("O'qituvchi izohlari", Icons.Default.Message)
                }
                items(attendance.grades.filter { !it.comment.isNullOrBlank() }) { grade ->
                    TeacherReportCard(grade)
                }
            }

            // Exam Results
            item {
                SectionTitle("Imtihon natijalari", Icons.Default.Assessment)
            }
            if (exams.isEmpty()) {
                item { EmptyState("Imtihon natijalari yo'q", Icons.Default.HistoryEdu) }
            } else {
                items(exams) { exam ->
                    ExamCard(exam)
                }
            }

            // Payments
            item {
                SectionTitle("To'lovlar tarixi", Icons.Default.Payments)
            }
            if (payments.isEmpty()) {
                item { EmptyState("To'lovlar tarixi yo'q", Icons.Default.ReceiptLong) }
            } else {
                items(payments) { payment ->
                    PaymentCard(payment)
                }
            }

            // Notifications
            item {
                SectionTitle("Bildirishnomalar", Icons.Default.Notifications)
            }
            if (notifications.isEmpty()) {
                item { EmptyState("Xabarlar yo'q", Icons.Default.NotificationsNone) }
            } else {
                items(notifications) { notification ->
                    NotificationCard(notification) { viewModel.markAsRead(notification.id) }
                }
            }
            
            item {
                Spacer(modifier = Modifier.height(40.dp))
                Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                    Text(
                        "© 2026 UITS ACADEMY CRM SYSTEM", 
                        fontSize = 10.sp, 
                        color = Color.Gray,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(20.dp))
            }
        }
    }
}

@Composable
fun ChildHeroCard(child: StudentResponse, attendance: AttendanceResponse) {
    val gradient = Brush.linearGradient(
        colors = listOf(Color(0xFF007AFF), Color(0xFF00BFFF))
    )

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(32.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent)
    ) {
        Box(modifier = Modifier.background(gradient).padding(24.dp)) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .clip(RoundedCornerShape(24.dp))
                            .background(Color.White.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        val photoUrl = child.photo?.let {
                            if (it.startsWith("http")) it else "https://schoolmanage.uz/$it"
                        }
                        
                        if (photoUrl != null) {
                            AsyncImage(
                                model = photoUrl,
                                contentDescription = child.name,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        } else {
                            Icon(Icons.Default.Person, contentDescription = null, modifier = Modifier.size(48.dp), tint = Color.White)
                        }
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Text(child.name, color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Black)
                        Text("ID: ${child.externalId ?: "Noma'lum"}", color = Color.White.copy(alpha = 0.8f), fontSize = 14.sp)
                    }
                }
                
                Spacer(modifier = Modifier.height(24.dp))
                
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    StatItem("Status", child.status ?: "O'qiydi")
                    val avg = if (attendance.grades.isNotEmpty()) {
                        attendance.grades.map { it.score.toDoubleOrNull() ?: 0.0 }.average()
                    } else null
                    StatItem("O'rtacha baxo", avg?.let { String.format("%.1f", it) } ?: "—")
                }
            }
        }
    }
}

@Composable
fun StatItem(label: String, value: String) {
    Column {
        Text(label.uppercase(), color = Color.White.copy(alpha = 0.6f), fontSize = 10.sp, fontWeight = FontWeight.Bold)
        Text(value, color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Black)
    }
}

@Composable
fun SectionTitle(title: String, icon: ImageVector) {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(bottom = 8.dp)) {
        Icon(icon, contentDescription = null, modifier = Modifier.size(20.dp), tint = MaterialTheme.colorScheme.primary)
        Spacer(modifier = Modifier.width(8.dp))
        Text(title.uppercase(), fontWeight = FontWeight.Black, fontSize = 13.sp, color = Color.Gray, letterSpacing = 1.sp)
    }
}

@Composable
fun CourseCard(enrollment: EnrollmentResponse) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
    ) {
        ListItem(
            headlineContent = { Text(enrollment.group?.course?.name ?: "Kurs", fontWeight = FontWeight.Bold) },
            supportingContent = { Text(enrollment.group?.name ?: "Guruh") },
            trailingContent = { 
                Surface(
                    color = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        enrollment.status, 
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
        )
    }
}

@Composable
fun AttendanceSummary(records: List<AttendanceRecord>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            // Status Grid (Last 30 days)
            Text(
                "So'nggi 30 kunlik holat", 
                fontSize = 12.sp, 
                fontWeight = FontWeight.Bold, 
                color = Color.Gray,
                modifier = Modifier.padding(bottom = 12.dp)
            )
            
            // Simple grid of dots
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                // We show 30 slots, filling with real data or empty
                repeat(30) { index ->
                    val record = records.getOrNull(index)
                    val color = when {
                        record == null -> Color.LightGray.copy(alpha = 0.3f)
                        record.status_display == "Kelgan" -> Color(0xFF4CAF50)
                        else -> Color(0xFFF44336)
                    }
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(RoundedCornerShape(2.dp))
                            .background(color)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Detailed List
            if (records.isEmpty()) {
                Text("Hali davomat qayd etilmagan", fontSize = 14.sp, color = Color.Gray)
            } else {
                records.take(10).forEach { record ->
                    AttendanceSessionCard(record)
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
fun AttendanceSessionCard(record: AttendanceRecord) {
    val isPresent = record.status_display == "Kelgan"
    val color = if (isPresent) Color(0xFF4CAF50) else Color(0xFFF44336)
    
    Surface(
        color = color.copy(alpha = 0.05f),
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.1f))
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(record.date, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text(record.status_display ?: "Noma'lum", color = color, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
            
            if (isPresent) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    TimeInfo("IN", record.arrived_at ?: "--:--", Icons.Default.Login)
                    Spacer(modifier = Modifier.width(16.dp))
                    TimeInfo("OUT", record.left_at ?: "--:--", Icons.Default.Logout)
                }
            }
        }
    }
}

@Composable
fun TimeInfo(label: String, time: String, icon: ImageVector) {
    Column(horizontalAlignment = Alignment.End) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, contentDescription = null, modifier = Modifier.size(10.dp), tint = Color.Gray)
            Spacer(modifier = Modifier.width(4.dp))
            Text(label, fontSize = 8.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
        }
        Text(time, fontSize = 14.sp, fontWeight = FontWeight.Black)
    }
}

@Composable
fun TeacherReportCard(grade: GradeResponse) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.03f))
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier.size(32.dp).clip(CircleShape).background(MaterialTheme.colorScheme.primary),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.FormatQuote, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(grade.teacher?.name ?: "O'qituvchi", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text(grade.group?.course?.name ?: "Kurs", fontSize = 10.sp, color = Color.Gray)
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                grade.comment ?: "", 
                fontSize = 14.sp, 
                lineHeight = 20.sp, 
                fontWeight = FontWeight.Medium,
                fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(grade.date, fontSize = 10.sp, color = Color.Gray, modifier = Modifier.fillMaxWidth(), textAlign = androidx.compose.ui.text.style.TextAlign.End)
        }
    }
}

@Composable
fun ExamCard(exam: ExamResponse) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier.size(48.dp).clip(RoundedCornerShape(12.dp)).background(MaterialTheme.colorScheme.primaryContainer),
                contentAlignment = Alignment.Center
            ) {
                Text(exam.score, fontWeight = FontWeight.Black, fontSize = 20.sp, color = MaterialTheme.colorScheme.onPrimaryContainer)
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(exam.group?.course?.name ?: "Imtihon", fontWeight = FontWeight.Bold)
                Text("${exam.date} • ${exam.type ?: "Oylik"}", fontSize = 12.sp, color = Color.Gray)
            }
        }
    }
}

@Composable
fun PaymentCard(payment: PaymentResponse) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp)
    ) {
        ListItem(
            headlineContent = { Text("${payment.amount} UZS", fontWeight = FontWeight.Bold) },
            supportingContent = { Text("${payment.date} • ${payment.method ?: "Naxd"}") },
            trailingContent = {
                Text(payment.status ?: "Tasdiqlangan", color = Color(0xFF4CAF50), fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        )
    }
}

@Composable
fun NotificationCard(notification: NotificationResponse, onRead: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = if (notification.isRead) CardDefaults.cardColors() else CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.Top) {
                Icon(
                    if (notification.isRead) Icons.Default.Drafts else Icons.Default.MarkEmailUnread,
                    contentDescription = null,
                    tint = if (notification.isRead) Color.Gray else MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(notification.title, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Text(notification.createdAt, fontSize = 10.sp, color = Color.Gray)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(notification.message, fontSize = 13.sp, lineHeight = 18.sp)
                }
                if (!notification.isRead) {
                    IconButton(onClick = onRead) {
                        Icon(Icons.Default.DoneAll, contentDescription = "Mark Read", tint = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }
    }
}

@Composable
fun EmptyState(text: String, icon: ImageVector) {
    Column(
        modifier = Modifier.fillMaxWidth().padding(vertical = 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(icon, contentDescription = null, modifier = Modifier.size(48.dp), tint = Color.Gray.copy(alpha = 0.3f))
        Spacer(modifier = Modifier.height(8.dp))
        Text(text, color = Color.Gray, fontSize = 14.sp)
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
