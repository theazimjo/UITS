package abs.uits.com.data.model

import kotlinx.serialization.Serializable

@Serializable
data class TeacherDashboardResponse(
    val month: String,
    val totalGroups: Int,
    val totalStudents: Int,
    val monthlyIncome: Double,
    val expectedIncome: Double,
    val financialTrend: List<FinancialTrendItem> = emptyList(),
    val studentDistribution: List<DistributionItem> = emptyList(),
    val groups: List<TeacherGroupSummary> = emptyList()
)

@Serializable
data class FinancialTrendItem(
    val month: String,
    val income: Double
)

@Serializable
data class DistributionItem(
    val name: String,
    val value: Int
)

@Serializable
data class TeacherGroupSummary(
    val id: Int,
    val name: String,
    val status: String,
    val days: List<String>? = null,
    val startTime: String? = null,
    val endTime: String? = null,
    val courseName: String? = null,
    val studentCount: Int = 0,
    val monthlyPrice: String? = null
)

@Serializable
data class TeacherStudentResponse(
    val id: Int,
    val name: String,
    val phone: String? = null,
    val photo: String? = null,
    val externalId: String? = null,
    val groups: List<GroupSummaryShort> = emptyList()
)

@Serializable
data class GroupSummaryShort(
    val id: Int,
    val name: String
)

@Serializable
data class TeacherFinanceResponse(
    val totalIncome: Double,
    val month: String,
    val payments: List<TeacherPaymentItem> = emptyList(),
    val groups: List<TeacherGroupFinanceStats> = emptyList()
)

@Serializable
data class TeacherPaymentItem(
    val id: Int,
    val studentName: String,
    val groupName: String,
    val amount: Double,
    val paymentDate: String,
    val paymentType: String? = null
)

@Serializable
data class TeacherGroupFinanceStats(
    val id: Int,
    val name: String,
    val activeStudents: Int = 0,
    val paidStudents: Int = 0,
    val totalCollected: Double = 0.0,
    val monthlyPrice: Double = 0.0
)
