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
import androidx.compose.material3.*
import com.adamglin.PhosphorIcons
import com.adamglin.phosphoricons.Regular
import com.adamglin.phosphoricons.regular.Calendar
import com.adamglin.phosphoricons.regular.CalendarBlank
import com.adamglin.phosphoricons.regular.ChalkboardTeacher
import com.adamglin.phosphoricons.regular.Fingerprint
import com.adamglin.phosphoricons.regular.Medal
import com.adamglin.phosphoricons.regular.Person
import com.adamglin.phosphoricons.regular.Phone
import com.adamglin.phosphoricons.regular.Receipt
import com.adamglin.phosphoricons.regular.Star
import com.adamglin.phosphoricons.regular.UserCircle
import com.adamglin.phosphoricons.regular.Users
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import abs.uits.com.data.model.*
import abs.uits.com.ui.theme.*
import coil.compose.AsyncImage
import dev.chrisbanes.haze.HazeState

@Composable
fun StudentGeneralReportScreen(
    child: StudentResponse,
    attendance: AttendanceResponse,
    payments: List<PaymentResponse>,
    exams: List<ExamResponse>,
    onBack: () -> Unit
) {
    val hazeState = remember { HazeState() }
    var navBarHeight by remember { mutableStateOf(0.dp) }
    val density = LocalDensity.current

    Box(modifier = Modifier.fillMaxSize().background(IosBackground)) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .iosHazeSource(hazeState),
            contentPadding = PaddingValues(top = navBarHeight + 16.dp, bottom = 32.dp, start = 20.dp, end = 20.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // 1. Personal Profile Card
            item {
                IosCard(cornerRadius = 20.dp) {
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
                                    modifier = Modifier.size(45.dp)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = child.name,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = IosLabel
                        )
                        if (child.status == "ACTIVE") {
                            Spacer(modifier = Modifier.height(4.dp))
                            Surface(
                                color = Color(0xFFE8F8EE),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = "FAOL O'QUVCHI",
                                    color = IosGreen,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                                )
                            }
                        }
                        
                        HorizontalDivider(modifier = Modifier.padding(vertical = 16.dp), color = IosSeparator, thickness = 0.5.dp)
                        
                        // Details list
                        ProfileDetailRow(PhosphorIcons.Regular.Fingerprint, "O'quvchi ID", child.externalId ?: "Mavjud emas")
                        Spacer(modifier = Modifier.height(12.dp))
                        ProfileDetailRow(PhosphorIcons.Regular.Phone, "Telefon raqami", child.phone ?: "Mavjud emas")
                        Spacer(modifier = Modifier.height(12.dp))
                        ProfileDetailRow(PhosphorIcons.Regular.UserCircle, "Ota-ona telefoni", child.parentPhone ?: "Mavjud emas")
                        Spacer(modifier = Modifier.height(12.dp))
                        ProfileDetailRow(PhosphorIcons.Regular.Calendar, "Ro'yxatdan o'tgan sana", child.createdAt?.split("T")?.firstOrNull() ?: "Mavjud emas")
                    }
                }
            }

            // 2. Enrolled Groups Section
            item {
                IosSectionHeader("O'qiyotgan Guruhlari", PhosphorIcons.Regular.ChalkboardTeacher)
            }
            if (child.enrollments.isEmpty()) {
                item {
                    EmptySectionCard("Hozirda hech qaysi guruhga a'zo emas")
                }
            } else {
                items(child.enrollments) { enrollment ->
                    val grp = enrollment.group
                    IosCard(modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = grp?.course?.name ?: "Kurs",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = IosLabel
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            ProfileDetailRow(PhosphorIcons.Regular.Users, "Guruh nomi", grp?.name ?: "Mavjud emas")
                            Spacer(modifier = Modifier.height(8.dp))
                            ProfileDetailRow(PhosphorIcons.Regular.Person, "O'qituvchi", grp?.teacher?.name ?: "Tayinlanmagan")
                            Spacer(modifier = Modifier.height(8.dp))
                            ProfileDetailRow(
                                PhosphorIcons.Regular.CalendarBlank, 
                                "Dars vaqti", 
                                if (!grp?.startTime.isNullOrBlank() && !grp?.endTime.isNullOrBlank()) "${grp?.startTime} - ${grp?.endTime}" else "Noma'lum"
                            )
                        }
                    }
                }
            }


            // 4. Payments Section
            item {
                IosSectionHeader("Umumiy To'lovlar Tarixi", PhosphorIcons.Regular.Receipt)
            }
            if (payments.isEmpty()) {
                item {
                    EmptySectionCard("To'lovlar tarixi mavjud emas")
                }
            } else {
                item {
                    IosCard(modifier = Modifier.fillMaxWidth()) {
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
                                        Text("${p.paymentDate} • ${p.month ?: ""}", color = IosSecondaryLabel, fontSize = 11.sp)
                                    }
                                    Text(
                                        text = p.status ?: "To'landi", 
                                        color = if (p.status?.lowercase() == "unpaid") IosRed else IosGreen, 
                                        fontWeight = FontWeight.Bold, 
                                        fontSize = 12.sp
                                    )
                                }
                                if (idx < payments.lastIndex) {
                                    HorizontalDivider(
                                        modifier = Modifier.padding(horizontal = 16.dp),
                                        color = IosSeparator,
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
                IosSectionHeader("Barcha Imtihon Natijalari", PhosphorIcons.Regular.Star)
            }
            if (exams.isEmpty()) {
                item {
                    EmptySectionCard("Imtihonlar natijasi mavjud emas")
                }
            } else {
                item {
                    IosCard(modifier = Modifier.fillMaxWidth()) {
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
                                            imageVector = PhosphorIcons.Regular.Star,
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
                                            color = IosSecondaryLabel,
                                            fontSize = 11.sp
                                        )
                                    }
                                    Text(
                                        text = "${exam.totalScore ?: 0.0} (${exam.percentage?.toInt() ?: 0}%)",
                                        fontWeight = FontWeight.Bold,
                                        color = IosBlue,
                                        fontSize = 14.sp
                                    )
                                }
                                if (idx < exams.lastIndex) {
                                    HorizontalDivider(
                                        modifier = Modifier.padding(horizontal = 16.dp),
                                        color = IosSeparator,
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
                IosSectionHeader("Sertifikatlar", PhosphorIcons.Regular.Medal)
            }
            item {
                EmptySectionCard("O'quvchining sertifikatlari mavjud emas")
            }
        }

        IosNavBar(
            title = "Umumiy Ma'lumotlar",
            onBack = onBack,
            hazeState = hazeState,
            modifier = Modifier.onGloballyPositioned { coordinates ->
                navBarHeight = with(density) { coordinates.size.height.toDp() }
            }
        )
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
            tint = IosSecondaryLabel,
            modifier = Modifier.size(18.dp)
        )
        Spacer(modifier = Modifier.width(10.dp))
        Text(
            text = label,
            fontSize = 13.sp,
            color = IosSecondaryLabel,
            modifier = Modifier.weight(1f)
        )
        Text(
            text = value,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = IosLabel
        )
    }
}

@Composable
fun StatCounter(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = value, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = color)
        Spacer(modifier = Modifier.height(2.dp))
        Text(text = label, fontSize = 11.sp, color = IosSecondaryLabel, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun EmptySectionCard(message: String) {
    IosCard(modifier = Modifier.fillMaxWidth()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = message,
                fontSize = 13.sp,
                color = IosSecondaryLabel
            )
        }
    }
}
