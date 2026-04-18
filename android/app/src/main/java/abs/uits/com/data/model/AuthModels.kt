package abs.uits.com.data.model

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val username: String,
    val pass: String
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
