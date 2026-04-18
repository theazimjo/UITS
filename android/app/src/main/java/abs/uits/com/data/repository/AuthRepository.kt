package abs.uits.com.data.repository

import abs.uits.com.data.local.TokenManager
import abs.uits.com.data.model.LoginRequest
import abs.uits.com.data.model.LoginResponse
import abs.uits.com.data.remote.AuthApiService

class AuthRepository(
    private val apiService: AuthApiService,
    private val tokenManager: TokenManager
) {
    suspend fun login(username: String, pass: String): Result<LoginResponse> {
        return try {
            val response = apiService.login(LoginRequest(username, pass))
            tokenManager.saveAuth(response.access_token, response.user.role)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logout() {
        tokenManager.clear()
    }
}
