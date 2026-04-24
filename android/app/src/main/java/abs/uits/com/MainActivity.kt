package abs.uits.com

import android.os.Bundle
import android.app.Activity
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.navigation.compose.*
import androidx.navigation.NavType
import androidx.navigation.navArgument
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.animation.SharedTransitionLayout
import abs.uits.com.data.local.TokenManager
import abs.uits.com.data.remote.NetworkModule
import abs.uits.com.data.repository.AuthRepository
import abs.uits.com.ui.login.LoginScreen
import abs.uits.com.ui.login.LoginViewModel
import abs.uits.com.ui.navigation.Screen
import abs.uits.com.ui.theme.UITSTheme
import abs.uits.com.ui.teacher.TeacherDashboardScreen
import abs.uits.com.ui.parent.ParentDashboardScreen
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val tokenManager = TokenManager(applicationContext)
        NetworkModule.initialize(tokenManager)
        
        val authRepository = AuthRepository(NetworkModule.apiService, tokenManager)
        
        enableEdgeToEdge()
        setContent {
            UITSTheme {
                val navController = rememberNavController()
                val context = LocalContext.current
                val window = (context as Activity).window
                
                // Track if we need to show the premium reveal
                var startRoute by remember { mutableStateOf<String?>(null) }
                val revealOffsetY = remember { Animatable(0f) }
                val revealTextAlpha = remember { Animatable(0f) }
                val revealTextScale = remember { Animatable(0.8f) }
                var showRevealOverlay by remember { mutableStateOf(false) }

                // Initial Startup Logic
                LaunchedEffect(Unit) {
                    val token = tokenManager.token.first()
                    val role = tokenManager.role.first()

                    if (token != null && role != null) {
                        // 1. Set start route to Splash to hide eventual flicker
                        startRoute = Screen.Splash.route
                        showRevealOverlay = true
                        
                        // 2. Premium Coordinated Entry for the logo
                        launch {
                            revealTextAlpha.animateTo(1f, tween(1000, easing = EaseOutQuart))
                        }
                        launch {
                            revealTextScale.animateTo(1f, tween(1200, easing = EaseOutBack))
                        }
                        
                        delay(2000)
                        
                        // 3. Navigate to actual dashboard to trigger its internal enterTransition
                        val destination = when (role.lowercase()) {
                            "admin" -> Screen.AdminDashboard.route
                            "teacher" -> Screen.TeacherDashboard.route
                            else -> Screen.ParentDashboard.route
                        }
                        navController.navigate(destination) {
                            popUpTo(Screen.Splash.route) { inclusive = true }
                        }
                        
                        // 4. Give the dashboard a tiny bit of time to start its transition before lifting the curtain
                        delay(100)
                        
                        // 5. Execute high-end Curtin Reveal
                        revealOffsetY.animateTo(
                            targetValue = -3000f, 
                            animationSpec = tween(
                                durationMillis = 1800, 
                                easing = CubicBezierEasing(0.6f, 0.0f, 0.1f, 1.0f)
                            )
                        )
                        showRevealOverlay = false
                    } else {
                        startRoute = Screen.Login.route
                    }
                }

                // Set System UI colors for classic iOS theme
                SideEffect {
                    window.statusBarColor = android.graphics.Color.parseColor("#FFFFFF")
                    window.navigationBarColor = android.graphics.Color.parseColor("#FFFFFF")
                }
                
                Box(modifier = Modifier.fillMaxSize()) {
                    // Layer 0: Main Navigation
                    startRoute?.let { initialRoute ->
                        val teacherViewModel: abs.uits.com.ui.teacher.TeacherViewModel = viewModel(
                            factory = object : ViewModelProvider.Factory {
                                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                                    @Suppress("UNCHECKED_CAST")
                                    return abs.uits.com.ui.teacher.TeacherViewModel() as T
                                }
                            }
                        )
                        
                        @OptIn(ExperimentalSharedTransitionApi::class)
                        SharedTransitionLayout {
                            NavHost(
                                navController = navController,
                                startDestination = initialRoute
                            ) {
                                composable(Screen.Splash.route) {
                                    Box(modifier = Modifier.fillMaxSize().background(Color.White))
                                }

                                composable(
                                    route = Screen.Login.route,
                                    exitTransition = {
                                        fadeOut(animationSpec = tween(600)) + scaleOut(targetScale = 0.9f, animationSpec = tween(600))
                                    }
                                ) {
                                    val loginViewModel: LoginViewModel = viewModel(
                                        factory = object : ViewModelProvider.Factory {
                                            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                                                @Suppress("UNCHECKED_CAST")
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
                                
                                composable(
                                    route = Screen.AdminDashboard.route,
                                    enterTransition = {
                                        slideInVertically(initialOffsetY = { it }, animationSpec = tween(800, easing = EaseOutQuart)) + fadeIn(tween(800))
                                    }
                                ) { DashboardPlaceholder("Admin") }
                                
                                composable(
                                    route = Screen.TeacherDashboard.route,
                                    enterTransition = {
                                        slideInVertically(initialOffsetY = { it }, animationSpec = tween(800, easing = EaseOutQuart)) + fadeIn(tween(800))
                                    }
                                ) { 
                                    TeacherDashboardScreen(
                                        onLogout = {
                                            lifecycleScope.launch {
                                                teacherViewModel.clearData()
                                                tokenManager.clear()
                                                navController.navigate(Screen.Login.route) {
                                                    popUpTo(0) { inclusive = true }
                                                }
                                            }
                                        },
                                        navController = navController,
                                        sharedTransitionScope = this@SharedTransitionLayout,
                                        animatedVisibilityScope = this@composable,
                                        teacherViewModel = teacherViewModel
                                    )
                                }

                                composable(
                                    route = Screen.StudentDetail.route,
                                    arguments = listOf(navArgument("studentId") { type = NavType.IntType }),
                                    enterTransition = { fadeIn(tween(400)) },
                                    exitTransition = { fadeOut(tween(400)) }
                                ) { backStackEntry ->
                                    val studentId = backStackEntry.arguments?.getInt("studentId") ?: 0
                                    abs.uits.com.ui.teacher.StudentDetailScreen(
                                        studentId = studentId,
                                        onBack = { navController.popBackStack() },
                                        sharedTransitionScope = this@SharedTransitionLayout,
                                        animatedVisibilityScope = this@composable,
                                        teacherViewModel = teacherViewModel
                                    )
                                }
                                
                                composable(
                                    route = Screen.ParentDashboard.route,
                                    enterTransition = {
                                        slideInVertically(initialOffsetY = { it }, animationSpec = tween(800, easing = EaseOutQuart)) + fadeIn(tween(800))
                                    }
                                ) { 
                                    ParentDashboardScreen(
                                        onLogout = {
                                            lifecycleScope.launch {
                                                tokenManager.clear()
                                                navController.navigate(Screen.Login.route) {
                                                    popUpTo(0) { inclusive = true }
                                                }
                                            }
                                        }
                                    )
                                }
                            }
                        }
                    }

                    // Layer 1: Premium Reveal Overlay (Visible for existing sessions)
                    if (showRevealOverlay) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .graphicsLayer { 
                                    translationY = revealOffsetY.value.dp.toPx() 
                                }
                                .background(Color.White),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "UITS",
                                modifier = Modifier.graphicsLayer {
                                    alpha = revealTextAlpha.value
                                    scaleX = revealTextScale.value
                                    scaleY = revealTextScale.value
                                },
                                fontSize = 72.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF1D1D1F),
                                letterSpacing = (-2).sp
                            )
                        }
                    }
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