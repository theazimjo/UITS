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
    val parentPhone: String? = null,
    val address: String? = null,
    val schoolName: String? = null,
    val photo: String? = null,
    val externalId: String? = null,
    val status: String? = null,
    val createdAt: String? = null,
    val groups: List<GroupSummaryShort> = emptyList(),
    val enrollments: List<StudentEnrollment>? = emptyList()
)

@Serializable
data class StudentEnrollment(
    val id: Int,
    val group: GroupSummaryShort,
    val joinedDate: String? = null,
    val status: String? = null
)

@Serializable
data class GroupSummaryShort(
    val id: Int,
    val name: String,
    val course: CourseShort? = null,
    val status: String? = null
)

@Serializable
data class CourseShort(
    val id: Int,
    val name: String
)

@Serializable
data class StudentExamResult(
    val id: Int,
    val group: GroupSummaryShort,
    val month: String,
    val currentAverage: Double? = 0.0,
    val theoryScore: Double? = 0.0,
    val practiceScore: Double? = 0.0,
    val totalScore: Double? = 0.0,
    val percentage: Double? = 0.0,
    val status: String? = null
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

@Serializable
data class StudentAttendanceResponse(
    val recent_attendance: List<AttendanceItem> = emptyList(),
    val grades: List<AttendanceGradeItem> = emptyList()
)

@Serializable
data class AttendanceItem(
    val id: Int,
    val date: String? = null,
    val status: String? = null,
    val arrived_at: String? = null,
    val left_at: String? = null,
    val status_display: String? = null
)

@Serializable
data class AttendanceGradeItem(
    val id: Int,
    val date: String? = null,
    val score: Int? = null,
    val comment: String? = null
)

@Serializable
data class TeacherAttendanceResponse(
    val expected: Int = 0,
    val arrived: Int = 0,
    val percentage: Double = 0.0,
    val students: List<AttendanceStudent> = emptyList()
)

@Serializable
data class AttendanceStudent(
    val id: Int,
    val name: String,
    val photo: String? = null,
    val groupName: String? = null,
    val attendance: Map<String, DayAttendance>? = null
)

@Serializable
data class DayAttendance(
    val status: String? = null,
    val arrived_at: String? = null,
    val left_at: String? = null,
    val status_display: String? = null
)

data class AttendanceStudentUI(
    val id: Int,
    val name: String,
    val photo: String? = null,
    val groupName: String? = null,
    val status: String? = null,
    val status_display: String? = null,
    val arrived_at: String? = null,
    val left_at: String? = null
)
