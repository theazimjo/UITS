package abs.uits.com.data.remote

import abs.uits.com.data.local.TokenManager
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory

object NetworkModule {
    // Automatically detected laptop IP for real device testing
    private const val BASE_URL = "http://go.schoolmanage.uz/api/"

    private var _tokenManager: TokenManager? = null

    fun initialize(tokenManager: TokenManager) {
        _tokenManager = tokenManager
    }

    private val authInterceptor = Interceptor { chain ->
        val token = runBlocking { _tokenManager?.token?.firstOrNull() }
        val request = chain.request().newBuilder()
        if (token != null) {
            request.addHeader("Authorization", "Bearer $token")
        }
        chain.proceed(request.build())
    }

    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
    }

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
        .readTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
        .writeTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
        .addInterceptor(loggingInterceptor)
        .addInterceptor(authInterceptor)
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(client)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()

    val apiService: AuthApiService by lazy {
        retrofit.create(AuthApiService::class.java)
    }

    val teacherApiService: TeacherApiService by lazy {
        retrofit.create(TeacherApiService::class.java)
    }

    val parentApiService: ParentApiService by lazy {
        retrofit.create(ParentApiService::class.java)
    }
}
