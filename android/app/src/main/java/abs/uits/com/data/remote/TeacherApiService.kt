package abs.uits.com.data.remote

import abs.uits.com.data.model.*
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface TeacherApiService {
    @GET("staff/me")
    suspend fun getMe(): StaffResponse

    @GET("teacher/dashboard")
    suspend fun getDashboard(@Query("month") month: String? = null): TeacherDashboardResponse

    @GET("teacher/my-groups")
    suspend fun getMyGroups(): List<TeacherGroupSummary>

    @GET("teacher/my-students")
    suspend fun getMyStudents(): List<TeacherStudentResponse>

    @GET("students/{id}")
    suspend fun getStudentById(@Path("id") id: Int): TeacherStudentResponse

    @GET("payments/student/{id}")
    suspend fun getPaymentsByStudent(@Path("id") id: Int): List<TeacherPaymentItem>

    @GET("students/{id}/exams")
    suspend fun getStudentExams(@Path("id") id: Int): List<StudentExamResult>

    @GET("teacher/my-finance")
    suspend fun getMyFinance(@Query("month") month: String? = null): TeacherFinanceResponse

    @GET("students/{id}/attendance")
    suspend fun getStudentAttendance(
        @Path("id") id: Int,
        @Query("date") date: String
    ): StudentAttendanceResponse

    @GET("teacher/my-attendance")
    suspend fun getTeacherAttendance(
        @Query("date") date: String,
        @Query("sync") sync: Boolean = false
    ): TeacherAttendanceResponse
}
