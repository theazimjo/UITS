package abs.uits.com.data.remote

import abs.uits.com.data.model.StaffResponse
import retrofit2.http.GET

interface TeacherApiService {
    @GET("staff/me")
    suspend fun getMe(): StaffResponse
}
