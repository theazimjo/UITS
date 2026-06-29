package abs.uits.com.ui.parent

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.ReceiptLong
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import abs.uits.com.data.model.*
import coil.compose.AsyncImage

@Composable
fun StudentGeneralReportScreen(
    child: StudentResponse,
    attendance: AttendanceResponse,
    payments: List<PaymentResponse>,
    exams: List<ExamResponse>,
    onBack: () -> Unit
) {
    Scaffold(
        topBar = {
            Surface(
                color = Color.White,
                tonalElevation = 2.dp,
                shadowElevation = 2.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .statusBarsPadding()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFF2F2F7))
                            .clickable { onBack() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Rounded.ArrowBack,
                            contentDescription = "Orqaga",
                            tint = Color.Black,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Text(
                        text = "Umumiy Ma'lumotlar",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.Black
                    )
                }
            }
        },
        containerColor = Color(0xFFF9FAFC)
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(top = 16.dp, bottom = 32.dp, start = 20.dp, end = 20.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // 1. Personal Profile Card
            item {
                Card(
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(0.5.dp, Color(0xFFE5E5EA)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(90.dp)
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
                                    modifier = Modifier.size(45.dp)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = child.name,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.Black
                        )
                        if (child.status == "ACTIVE") {
                            Spacer(modifier = Modifier.height(4.dp))
                            Surface(
                                color = Color(0xFFE8F8EE),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = "FAOL O'QUVCHI",
                                    color = Color(0xFF34C759),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                                )
                            }
                        }
                        
                        HorizontalDivider(modifier = Modifier.padding(vertical = 16.dp), color = Color(0xFFE5E5EA), thickness = 0.5.dp)
                        
                        // Details list
                        ProfileDetailRow(Icons.Rounded.Fingerprint, "O'quvchi ID", child.externalId ?: "Mavjud emas")
                        Spacer(modifier = Modifier.height(12.dp))
                        ProfileDetailRow(Icons.Rounded.Phone, "Telefon raqami", child.phone ?: "Mavjud emas")
                        Spacer(modifier = Modifier.height(12.dp))
                        ProfileDetailRow(Icons.Rounded.SupervisorAccount, "Ota-ona telefoni", child.parentPhone ?: "Mavjud emas")
                        Spacer(modifier = Modifier.height(12.dp))
                        ProfileDetailRow(Icons.Rounded.CalendarToday, "Ro'yxatdan o'tgan sana", child.createdAt?.split("T")?.firstOrNull() ?: "Mavjud emas")
                    }
                }
            }

            // 2. Enrolled Groups Section
            item {
                SectionHeaderRow(Icons.Rounded.Class, "O'qiyotgan Guruhlari")
            }
            if (child.enrollments.isEmpty()) {
                item {
                    EmptySectionCard("Hozirda hech qaysi guruhga a'zo emas")
                }
            } else {
                items(child.enrollments) { enrollment ->
                    val grp = enrollment.group
                    Card(
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(0.5.dp, Color(0xFFE5E5EA)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = grp?.course?.name ?: "Kurs",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.Black
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            ProfileDetailRow(Icons.Rounded.Group, "Guruh nomi", grp?.name ?: "Mavjud emas")
                            Spacer(modifier = Modifier.height(8.dp))
                            ProfileDetailRow(Icons.Rounded.Person, "O'qituvchi", grp?.teacher?.name ?: "Tayinlanmagan")
                            Spacer(modifier = Modifier.height(8.dp))
                            ProfileDetailRow(
                                Icons.Rounded.Schedule, 
                                "Dars vaqti", 
                                if (!grp?.startTime.isNullOrBlank() && !grp?.endTime.isNullOrBlank()) "${grp?.startTime} - ${grp?.endTime}" else "Noma'lum"
                            )
                        }
                    }
                }
            }


            // 4. Payments Section
            item {
                SectionHeaderRow(Icons.AutoMirrored.Rounded.ReceiptLong, "Umumiy To'lovlar Tarixi")
            }
            if (payments.isEmpty()) {
                item {
                    EmptySectionCard("To'lovlar tarixi mavjud emas")
                }
            } else {
                item {
                    Card(
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(0.5.dp, Color(0xFFE5E5EA)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(vertical = 4.dp)) {
                            payments.forEachIndexed { idx, p ->
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
                                            imageVector = Icons.AutoMirrored.Rounded.ReceiptLong,
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
                                        Text("${p.paymentDate} • ${p.month ?: ""}", color = Color(0xFF8E8E93), fontSize = 11.sp)
                                    }
                                    Text(
                                        text = p.status ?: "To'landi", 
                                        color = if (p.status?.lowercase() == "unpaid") Color(0xFFFF3B30) else Color(0xFF34C759), 
                                        fontWeight = FontWeight.Bold, 
                                        fontSize = 12.sp
                                    )
                                }
                                if (idx < payments.lastIndex) {
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

            // 5. Exam Results Section
            item {
                SectionHeaderRow(Icons.Rounded.Star, "Barcha Imtihon Natijalari")
            }
            if (exams.isEmpty()) {
                item {
                    EmptySectionCard("Imtihonlar natijasi mavjud emas")
                }
            } else {
                item {
                    Card(
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(0.5.dp, Color(0xFFE5E5EA)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(vertical = 4.dp)) {
                            exams.forEachIndexed { idx, exam ->
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
                                            .background(Color(0xFFFFF2D4)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Rounded.Star,
                                            contentDescription = null,
                                            tint = Color(0xFFFFCC00),
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = exam.group?.course?.name ?: "Imtihon",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp
                                        )
                                        Text(
                                            text = "${exam.month} • ${exam.status ?: "Natija"}",
                                            color = Color(0xFF8E8E93),
                                            fontSize = 11.sp
                                        )
                                    }
                                    Text(
                                        text = "${exam.totalScore ?: 0.0} (${exam.percentage?.toInt() ?: 0}%)",
                                        fontWeight = FontWeight.Black,
                                        color = Color(0xFF0056C6),
                                        fontSize = 14.sp
                                    )
                                }
                                if (idx < exams.lastIndex) {
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

            // 6. Certificates Section
            item {
                SectionHeaderRow(Icons.Rounded.WorkspacePremium, "Sertifikatlar")
            }
            item {
                EmptySectionCard("O'quvchining sertifikatlari mavjud emas")
            }
        }
    }
}

@Composable
fun ProfileDetailRow(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Color(0xFF8E8E93),
            modifier = Modifier.size(18.dp)
        )
        Spacer(modifier = Modifier.width(10.dp))
        Text(
            text = label,
            fontSize = 13.sp,
            color = Color(0xFF8E8E93),
            modifier = Modifier.weight(1f)
        )
        Text(
            text = value,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black
        )
    }
}

@Composable
fun SectionHeaderRow(icon: androidx.compose.ui.graphics.vector.ImageVector, title: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
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
fun StatCounter(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = value, fontSize = 22.sp, fontWeight = FontWeight.Black, color = color)
        Spacer(modifier = Modifier.height(2.dp))
        Text(text = label, fontSize = 11.sp, color = Color(0xFF8E8E93), fontWeight = FontWeight.Bold)
    }
}

@Composable
fun EmptySectionCard(message: String) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = BorderStroke(0.5.dp, Color(0xFFE5E5EA)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = message,
                fontSize = 13.sp,
                color = Color(0xFF8E8E93)
            )
        }
    }
}
