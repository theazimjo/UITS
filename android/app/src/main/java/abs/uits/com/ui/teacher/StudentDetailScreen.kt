package abs.uits.com.ui.teacher

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
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
import androidx.compose.ui.draw.*
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
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
        Box(modifier = Modifier.fillMaxSize().background(Color(0xFF0F172A)), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Color(0xFF38BDF8))
        }
        return
    }

    // Success Score calculation
    val attendCount = attendance?.recent_attendance?.count { it.status == "present" } ?: 0
    val attendPercent = (attendCount.toFloat() / 12f * 100f).coerceIn(0f, 100f)
    val examPercent = exams.firstOrNull()?.percentage?.toFloat() ?: 0f
    val successScore = if (examPercent > 0) (attendPercent * 0.4f + examPercent * 0.6f).coerceIn(0f, 100f) else attendPercent.coerceIn(0f, 100f)

    with(sharedTransitionScope) {
        Box(modifier = Modifier.fillMaxSize().background(Color(0xFF0F172A))) {
            // Background Mesh Gradients
            Canvas(modifier = Modifier.fillMaxSize()) {
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(Color(0xFF1E293B), Color.Transparent),
                        center = center.copy(x = 0f, y = 0f),
                        radius = size.width
                    ),
                    center = center.copy(x = 0f, y = 0f)
                )
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(Color(0xFF083344), Color.Transparent),
                        center = center.copy(x = size.width, y = size.height * 0.6f),
                        radius = size.width * 0.8f
                    ),
                    center = center.copy(x = size.width, y = size.height * 0.6f)
                )
            }

            Scaffold(
                topBar = {
                    TopAppBar(
                        title = { Text("Talaba Orbitali", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold) },
                        navigationIcon = {
                            IconButton(onClick = onBack, modifier = Modifier.clip(CircleShape).background(Color.White.copy(alpha = 0.1f))) {
                                Icon(Icons.Default.Close, contentDescription = null, tint = Color.White)
                            }
                        },
                        colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent)
                    )
                },
                containerColor = Color.Transparent
            ) { paddingValue ->
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(paddingValue),
                    contentPadding = PaddingValues(bottom = 100.dp)
                ) {
                    // HERO SECTION
                    item {
                        Column(
                            modifier = Modifier.fillMaxWidth().padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                // Orbit Rings
                                val infiniteTransition = rememberInfiniteTransition(label = "orbit")
                                val rotation by infiniteTransition.animateFloat(
                                    initialValue = 0f, targetValue = 360f,
                                    animationSpec = infiniteRepeatable(tween(10000, easing = LinearEasing)), label = "rotation"
                                )
                                
                                Canvas(modifier = Modifier.size(160.dp).rotate(rotation)) {
                                    drawArc(
                                        color = Color(0xFF38BDF8),
                                        startAngle = 0f, sweepAngle = 90f, useCenter = false,
                                        style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round)
                                    )
                                    drawArc(
                                        color = Color(0xFFF472B6),
                                        startAngle = 180f, sweepAngle = 60f, useCenter = false,
                                        style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round)
                                    )
                                }

                                Surface(
                                    shape = CircleShape,
                                    modifier = Modifier.size(130.dp).border(2.dp, Color.White.copy(alpha = 0.2f), CircleShape).sharedElement(
                                        rememberSharedContentState(key = "photo-${currentStudent.id}"),
                                        animatedVisibilityScope = animatedVisibilityScope
                                    ),
                                    color = Color(0xFF1E293B)
                                ) {
                                    if (currentStudent.photo != null) {
                                        AsyncImage(
                                            model = ImageRequest.Builder(context).data(currentStudent.photo).crossfade(true).build(),
                                            contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize()
                                        )
                                    } else {
                                        Icon(Icons.Default.Person, contentDescription = null, modifier = Modifier.padding(32.dp), tint = Color.White.copy(alpha = 0.3f))
                                    }
                                }
                            }
                            
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            Text(
                                text = currentStudent.name,
                                color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.ExtraBold,
                                textAlign = TextAlign.Center, modifier = Modifier.sharedBounds(
                                    rememberSharedContentState(key = "name-${currentStudent.id}"),
                                    animatedVisibilityScope = animatedVisibilityScope
                                )
                            )
                            
                            SuccessMeter(score = successScore)
                        }
                    }

                    // METRICS GRID
                    item {
                        Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                            GlassMetric(Modifier.weight(1f), "Davomat", "${attendPercent.toInt()}%", Color(0xFF38BDF8), Icons.Default.DoneAll)
                            GlassMetric(Modifier.weight(1f), "Imtihon", "${examPercent.toInt()}%", Color(0xFFF472B6), Icons.Default.Star)
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                            GlassMetric(Modifier.weight(1f), "To'lov", "Faol", Color(0xFF34D399), Icons.Default.CreditCard)
                            GlassMetric(Modifier.weight(1f), "Guruh", "${currentStudent.enrollments?.size ?: 0}", Color(0xFFFBBF24), Icons.Default.Groups)
                        }
                    }

                    // TIMELINE / ACTIVITY STREAM
                    item {
                        Text(
                            "Harakatlar Oqimi", 
                            color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(start = 24.dp, top = 32.dp, bottom = 12.dp)
                        )
                        ActivityStream(payments, exams)
                    }

                    // CALENDAR WIDGET
                    item {
                        Text(
                            "Oylik Davomat", 
                            color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(start = 24.dp, top = 24.dp, bottom = 12.dp)
                        )
                        GlassCalendar(studentId, attendance, isAttLoading, teacherViewModel)
                    }

                    // INFO SECTION
                    item {
                        Text(
                            "Aloqa & Ma'lumot", 
                            color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(start = 24.dp, top = 24.dp, bottom = 12.dp)
                        )
                        InfoOrbit(currentStudent) { phone ->
                            context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phone")))
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SuccessMeter(score: Float) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(top = 8.dp)) {
        Box(modifier = Modifier.fillMaxWidth(0.5f).height(6.dp).clip(RoundedCornerShape(3.dp)).background(Color.White.copy(alpha = 0.1f))) {
            Box(modifier = Modifier.fillMaxWidth(score / 100f).fillMaxHeight().background(
                Brush.horizontalGradient(listOf(Color(0xFF38BDF8), Color(0xFF818CF8)))
            ))
        }
        Text("Muvaffaqiyat ko'rsatkichi: ${score.toInt()}%", color = Color.White.copy(alpha = 0.6f), fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp))
    }
}

@Composable
fun GlassMetric(modifier: Modifier, label: String, value: String, color: Color, icon: ImageVector) {
    Surface(
        modifier = modifier.height(110.dp),
        color = Color.White.copy(alpha = 0.05f),
        shape = RoundedCornerShape(24.dp),
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.1f))
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.SpaceBetween) {
            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(24.dp))
            Column {
                Text(value, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text(label, color = Color.White.copy(alpha = 0.5f), fontSize = 12.sp)
            }
        }
    }
}

@Composable
fun ActivityStream(payments: List<TeacherPaymentItem>, exams: List<StudentExamResult>) {
    val items = (payments.take(3) + exams.take(3)).sortedByDescending { if (it is TeacherPaymentItem) it.paymentDate else (it as StudentExamResult).month }
    
    LazyRow(
        modifier = Modifier.fillMaxWidth(),
        contentPadding = PaddingValues(horizontal = 20.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(items) { item ->
            Surface(
                modifier = Modifier.width(200.dp).height(100.dp),
                color = Color.White.copy(alpha = 0.08f),
                shape = RoundedCornerShape(20.dp),
                border = BorderStroke(1.dp, Color.White.copy(alpha = 0.1f))
            ) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.SpaceBetween) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        val (icon, color) = if (item is TeacherPaymentItem) Icons.Default.Payments to Color(0xFF34D399) else Icons.Default.Assignment to Color(0xFFF472B6)
                        Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(if (item is TeacherPaymentItem) "To'lov" else "Imtihon", color = color, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                    Text(
                        if (item is TeacherPaymentItem) item.groupName else (item as StudentExamResult).group.name,
                        color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, maxLines = 1
                    )
                    Text(
                        if (item is TeacherPaymentItem) "${String.format("%,.0f", item.amount)} UZS" else "${(item as StudentExamResult).percentage?.toInt()}% Natija",
                        color = Color.White.copy(alpha = 0.7f), fontSize = 12.sp
                    )
                }
            }
        }
    }
}

@Composable
fun GlassCalendar(studentId: Int, attendance: StudentAttendanceResponse?, isLoading: Boolean, viewModel: TeacherViewModel) {
    Surface(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp),
        color = Color.White.copy(alpha = 0.05f),
        shape = RoundedCornerShape(24.dp),
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.1f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            if (isLoading) {
                Box(Modifier.fillMaxWidth().height(100.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFF38BDF8), modifier = Modifier.size(24.dp))
                }
            } else {
                val cal = Calendar.getInstance()
                val year = cal.get(Calendar.YEAR)
                val month = cal.get(Calendar.MONTH)
                val days = getDaysInMonth(year, month)
                
                // Minimalist Dot Calendar
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    for (d in 1..days) {
                        val dateKey = String.format("%d-%02d-%02d", year, month + 1, d)
                        val record = attendance?.recent_attendance?.find { normalizeDate(it.date)?.startsWith(dateKey) == true }
                        
                        Box(
                            modifier = Modifier.weight(1f).aspectRatio(1f).clip(CircleShape).background(
                                when {
                                    record?.status == "present" -> Color(0xFF34D399)
                                    record?.status == "absent" -> Color(0xFFEF4444)
                                    else -> Color.White.copy(alpha = 0.1f)
                                }
                            ).border(if (d == cal.get(Calendar.DAY_OF_MONTH)) 1.dp else 0.dp, Color.White, CircleShape)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(12.dp))
                Text("Joriy oy: ${cal.getDisplayName(Calendar.MONTH, Calendar.LONG, Locale("uz"))}", color = Color.White.copy(alpha = 0.4f), fontSize = 11.sp)
            }
        }
    }
}

@Composable
fun InfoOrbit(student: TeacherStudentResponse, onCall: (String) -> Unit) {
    Surface(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp),
        color = Color.White.copy(alpha = 0.05f),
        shape = RoundedCornerShape(24.dp),
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.1f))
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            OrbitInfoItem(Icons.Default.Phone, "Shaxsiy raqam", student.phone ?: "---", Color(0xFF38BDF8)) {
                student.phone?.let { onCall(it) }
            }
            OrbitInfoItem(Icons.Default.FamilyRestroom, "Ota-ona raqami", student.parentPhone ?: "---", Color(0xFFFBBF24)) {
                student.parentPhone?.let { onCall(it) }
            }
            OrbitInfoItem(Icons.Default.Home, "Manzil", student.address ?: "Kiritilmagan", Color(0xFFF472B6))
        }
    }
}

@Composable
fun OrbitInfoItem(icon: ImageVector, label: String, value: String, color: Color, onClick: (() -> Unit)? = null) {
    Row(
        modifier = Modifier.fillMaxWidth().clickable(enabled = onClick != null) { onClick?.invoke() },
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(modifier = Modifier.size(40.dp).clip(CircleShape).background(color.copy(alpha = 0.1f)), contentAlignment = Alignment.Center) {
            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(20.dp))
        }
        Spacer(modifier = Modifier.width(16.dp))
        Column {
            Text(label, color = Color.White.copy(alpha = 0.5f), fontSize = 11.sp)
            Text(value, color = if (onClick != null) Color(0xFF38BDF8) else Color.White, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
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
