package abs.uits.com.data.remote

import abs.uits.com.data.model.*
import retrofit2.http.GET
import retrofit2.http.Query

interface TeacherApiService {
    @GET("staff/me")
    suspend fun getMe(): StaffResponse

    @GET("teacher/dashboard")
    suspend fun getDashboard(@Query("month") month: String? = null): TeacherDashboardResponse

    @GET("teacher/my-students")
    suspend fun getMyStudents(): List<TeacherStudentResponse>

    @GET("teacher/my-finance")
    suspend fun getMyFinance(@Query("month") month: String? = null): TeacherFinanceResponse
}
