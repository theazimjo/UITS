package abs.uits.com.ui.teacher.segments

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import abs.uits.com.ui.teacher.TeacherViewModel
import abs.uits.com.ui.teacher.components.PaymentListItem
import abs.uits.com.ui.theme.*

@Composable
fun TeacherFinanceSegment(viewModel: TeacherViewModel) {
    val finance by viewModel.finance.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 24.dp, bottom = 100.dp)
    ) {
        item {
            IosLargeTitle("Moliya")
            Spacer(modifier = Modifier.height(24.dp))
        }

        item {
            IosCard(
                modifier = Modifier.fillMaxWidth(),
                cornerRadius = 20.dp,
                containerColor = IosBlue
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
            IosSectionHeader("To'lovlar tarixi")

            IosCard(modifier = Modifier.fillMaxWidth()) {
                Column {
                    finance?.payments?.forEachIndexed { index, payment ->
                        PaymentListItem(payment)
                        if (index < (finance?.payments?.size ?: 0) - 1) {
                            HorizontalDivider(
                                color = IosSeparator.copy(alpha = 0.5f),
                                thickness = 0.5.dp,
                                modifier = Modifier.padding(start = 16.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
