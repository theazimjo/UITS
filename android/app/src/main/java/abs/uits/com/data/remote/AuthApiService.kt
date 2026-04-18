package abs.uits.com.data.remote

import abs.uits.com.data.model.LoginRequest
import abs.uits.com.data.model.LoginResponse
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse
}
