package abs.uits.com.ui.teacher.segments

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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

@Composable
fun TeacherHomeSegment(viewModel: TeacherViewModel) {
    val dashboard by viewModel.dashboard.collectAsState()
    
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 24.dp)
    ) {
        item {
            Text(
                text = "Asosiy", 
                style = MaterialTheme.typography.displayLarge,
                color = MaterialTheme.colorScheme.onBackground
            )
            Spacer(modifier = Modifier.height(24.dp))
        }
        
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                DashboardStatCard(
                    label = "O'quvchilar", 
                    value = "${dashboard?.totalStudents ?: 0}", 
                    modifier = Modifier.weight(1f)
                )
                DashboardStatCard(
                    label = "Guruhlar", 
                    value = "${dashboard?.totalGroups ?: 0}", 
                    modifier = Modifier.weight(1f)
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
        
        item {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.surface,
                shadowElevation = 0.5.dp,
                border = BoxShadowBorder()
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        "Oylik tushum", 
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "${dashboard?.monthlyIncome?.toInt() ?: 0} UZS", 
                        style = MaterialTheme.typography.displayLarge.copy(fontSize = 28.sp),
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(), 
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "Kutilayotgan", 
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                        Text(
                            "${dashboard?.expectedIncome?.toInt() ?: 0} UZS", 
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
