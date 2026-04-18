package abs.uits.com

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import abs.uits.com.data.local.TokenManager
import abs.uits.com.data.remote.NetworkModule
import abs.uits.com.data.repository.AuthRepository
import abs.uits.com.ui.login.LoginScreen
import abs.uits.com.ui.login.LoginViewModel
import abs.uits.com.ui.navigation.Screen
import abs.uits.com.ui.theme.UITSTheme
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val tokenManager = TokenManager(applicationContext)
        val authRepository = AuthRepository(NetworkModule.apiService, tokenManager)
        
        enableEdgeToEdge()
        setContent {
            UITSTheme {
                val navController = rememberNavController()
                
                NavHost(navController = navController, startDestination = Screen.Login.route) {
                    composable(Screen.Login.route) {
                        val loginViewModel: LoginViewModel = viewModel(
                            factory = object : ViewModelProvider.Factory {
                                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                                    return LoginViewModel(authRepository) as T
                                }
                            }
                        )
                        
                        LoginScreen(
                            viewModel = loginViewModel,
                            onLoginSuccess = { role ->
                                val destination = when (role.lowercase()) {
                                    "admin" -> Screen.AdminDashboard.route
                                    "teacher" -> Screen.TeacherDashboard.route
                                    else -> Screen.ParentDashboard.route
                                }
                                navController.navigate(destination) {
                                    popUpTo(Screen.Login.route) { inclusive = true }
                                }
                            }
                        )
                    }
                    
                    composable(Screen.AdminDashboard.route) { DashboardPlaceholder("Admin") }
                    composable(Screen.TeacherDashboard.route) { DashboardPlaceholder("Ustoz") }
                    composable(Screen.ParentDashboard.route) { DashboardPlaceholder("Ota-ona") }
                }
            }
        }
    }
}

@Composable
fun DashboardPlaceholder(role: String) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(text = "$role Dashboardi (Tez orada...)")
    }
}