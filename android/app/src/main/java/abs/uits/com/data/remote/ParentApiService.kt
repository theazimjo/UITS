package abs.uits.com.data.remote

import abs.uits.com.data.model.*
import retrofit2.http.*

interface ParentApiService {
    @GET("parent/children")
    suspend fun getChildren(): List<StudentResponse>

    @GET("parent/child/{id}/attendance")
    suspend fun getChildAttendance(
        @Path("id") id: Int,
        @Query("date") date: String
    ): AttendanceResponse

    @GET("parent/child/{id}/exams")
    suspend fun getChildExams(@Path("id") id: Int): List<ExamResponse>

    @GET("parent/child/{id}/payments")
    suspend fun getChildPayments(@Path("id") id: Int): List<PaymentResponse>

    @GET("notifications/parent")
    suspend fun getNotifications(): List<NotificationResponse>

    @PATCH("notifications/{id}/read")
    suspend fun markAsRead(@Path("id") id: Int)
}
