package abs.uits.com.data.model

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val username: String,
    val password: String
)

@Serializable
data class UserResponse(
    val id: Int,
    val username: String,
    val role: String,
    val name: String? = null
)

@Serializable
data class LoginResponse(
    val access_token: String,
    val user: UserResponse
)

@Serializable
data class CourseResponse(
    val id: Int,
    val name: String
)

@Serializable
data class GroupResponse(
    val id: Int,
    val name: String,
    val course: CourseResponse? = null,
    val startDate: String? = null,
    val groupStatus: String? = null
)

@Serializable
data class StaffResponse(
    val id: Int,
    val name: String,
    val username: String? = null,
    val phone: String? = null,
    val groups: List<GroupResponse> = emptyList()
)

@Serializable
data class EnrollmentResponse(
    val id: Int,
    val status: String,
    val group: GroupResponse? = null
)

@Serializable
data class StudentResponse(
    val id: Int,
    val name: String,
    val externalId: String? = null,
    val photo: String? = null,
    val parentName: String? = null,
    val status: String? = null,
    val enrollments: List<EnrollmentResponse> = emptyList()
)

@Serializable
data class AttendanceRecord(
    val date: String,
    val status_display: String? = null,
    val arrived_at: String? = null,
    val left_at: String? = null
)

@Serializable
data class GradeResponse(
    val id: Int,
    val score: String,
    val date: String,
    val comment: String? = null,
    val teacher: StaffResponse? = null,
    val group: GroupResponse? = null
)

@Serializable
data class AttendanceResponse(
    val recent_attendance: List<AttendanceRecord> = emptyList(),
    val grades: List<GradeResponse> = emptyList()
)

@Serializable
data class ExamResponse(
    val id: Int,
    val score: String,
    val date: String,
    val month: String? = null,
    val year: Int? = null,
    val type: String? = null,
    val group: GroupResponse? = null,
    val teacher: StaffResponse? = null
)

@Serializable
data class PaymentResponse(
    val id: Int,
    val amount: Int,
    val date: String,
    val method: String? = null,
    val status: String? = null
)

@Serializable
data class NotificationResponse(
    val id: Int,
    val title: String,
    val message: String,
    val createdAt: String,
    val isRead: Boolean
)
