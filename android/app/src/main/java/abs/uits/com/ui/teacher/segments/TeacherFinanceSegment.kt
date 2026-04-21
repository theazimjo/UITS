package abs.uits.com.ui.teacher.segments

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import abs.uits.com.ui.teacher.TeacherViewModel
import abs.uits.com.ui.teacher.components.PaymentListItem
import abs.uits.com.ui.teacher.components.BoxShadowBorder

@Composable
fun TeacherFinanceSegment(viewModel: TeacherViewModel) {
    val finance by viewModel.finance.collectAsState()
    
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 24.dp)
    ) {
        item {
            Text(
                "Moliya", 
                style = MaterialTheme.typography.displayLarge,
                color = MaterialTheme.colorScheme.onBackground
            )
            Spacer(modifier = Modifier.height(24.dp))
        }
        
        item {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.primary,
                shadowElevation = 4.dp
            ) {
                Column(modifier = Modifier.padding(24.dp)) {
                    Text(
                        "Umumiy yig'ilgan", 
                        color = Color.White.copy(alpha = 0.8f), 
                        style = MaterialTheme.typography.labelSmall
                    )
                    Text(
                        "${finance?.totalIncome?.toInt() ?: 0} UZS", 
                        color = Color.White, 
                        style = MaterialTheme.typography.displayLarge.copy(fontSize = 32.sp),
                        fontWeight = FontWeight.Black
                    )
                }
            }
            Spacer(modifier = Modifier.height(32.dp))
        }
        
        item {
            Text("To'lovlar tarixi", style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(12.dp))
            
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.surface,
                shadowElevation = 0.5.dp,
                border = BoxShadowBorder()
            ) {
                Column {
                    finance?.payments?.forEachIndexed { index, payment ->
                        PaymentListItem(payment)
                        if (index < (finance?.payments?.size ?: 0) - 1) {
                            HorizontalDivider(
                                color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f), 
                                modifier = Modifier.padding(start = 16.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
