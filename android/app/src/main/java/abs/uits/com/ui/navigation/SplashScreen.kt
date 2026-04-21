package abs.uits.com.ui.navigation

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import abs.uits.com.data.local.TokenManager
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first

@Composable
fun SplashScreen(
    tokenManager: TokenManager,
    onNavigateNext: (String) -> Unit
) {
    val themeBg = Color(0xFFFFFFFF) // White
    val themeText = Color(0xFF1D1D1F) // Deep black
    val iosSystemBlue = Color(0xFF007AFF) // Official iOS Blue
    
    val logoAlpha = remember { Animatable(0f) }
    var showBranding by remember { mutableStateOf(false) }
    
    LaunchedEffect(Unit) {
        // Collect session data quickly
        val token = tokenManager.token.first()
        val role = tokenManager.role.first()
        
        if (token != null && role != null) {
            showBranding = true
            logoAlpha.animateTo(1f, tween(800))
            delay(500) // Stay on branding for a moment
            
            val destination = when (role.lowercase()) {
                "admin" -> Screen.AdminDashboard.route
                "teacher" -> Screen.TeacherDashboard.route
                else -> Screen.ParentDashboard.route
            }
            onNavigateNext(destination)
        } else {
            // Not logged in -> Go to Login immediately (it has its own intro)
            onNavigateNext(Screen.Login.route)
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White),
        contentAlignment = Alignment.Center
    ) {
        if (showBranding) {
            Text(
                text = "UITS",
                fontSize = 72.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1D1D1F),
                letterSpacing = (-2).sp,
                modifier = Modifier.alpha(logoAlpha.value)
            )
        }
    }
}
