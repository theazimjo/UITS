package abs.uits.com.ui.teacher.segments

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import com.adamglin.PhosphorIcons
import com.adamglin.phosphoricons.Regular
import com.adamglin.phosphoricons.regular.Bell
import com.adamglin.phosphoricons.regular.Person
import com.adamglin.phosphoricons.regular.Shield
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import abs.uits.com.ui.teacher.TeacherViewModel
import abs.uits.com.ui.teacher.components.SettingsItem
import abs.uits.com.ui.theme.*

@Composable
fun TeacherSettingsSegment(viewModel: TeacherViewModel, onLogout: () -> Unit) {
    val profile by viewModel.profile.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 24.dp, bottom = 100.dp)
    ) {
        item {
            IosLargeTitle("Sozlamalar")
            Spacer(modifier = Modifier.height(32.dp))
        }

        item {
            IosCard(modifier = Modifier.fillMaxWidth()) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        shape = CircleShape,
                        modifier = Modifier.size(60.dp),
                        color = IosBackground
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(PhosphorIcons.Regular.Person, contentDescription = null, tint = IosBlue, modifier = Modifier.size(32.dp))
                        }
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Text(profile?.name ?: "Ustoz", style = MaterialTheme.typography.titleMedium)
                        Text(profile?.phone ?: "Mavjud emas", style = MaterialTheme.typography.labelSmall, color = IosSecondaryLabel)
                    }
                }
            }
            Spacer(modifier = Modifier.height(32.dp))
        }

        item {
            IosCard(modifier = Modifier.fillMaxWidth()) {
                Column {
                    SettingsItem(PhosphorIcons.Regular.Shield, "Xavfsizlik")
                    HorizontalDivider(color = IosSeparator.copy(alpha = 0.5f), thickness = 0.5.dp, modifier = Modifier.padding(start = 56.dp))
                    SettingsItem(PhosphorIcons.Regular.Bell, "Bildirishnomalar")
                }
            }
            Spacer(modifier = Modifier.height(32.dp))
        }

        item {
            IosCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    "Tizimdan chiqish",
                    color = IosRed,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.SemiBold,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .iosPressable(onClick = onLogout)
                        .padding(vertical = 16.dp)
                )
            }
        }
    }
}
