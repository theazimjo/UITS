package abs.uits.com.ui.login

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    viewModel: LoginViewModel,
    onLoginSuccess: (String) -> Unit
) {
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val uiState by viewModel.uiState.collectAsState()
    val scope = rememberCoroutineScope()

    // Professional iOS Palette (Light)
    val themeBg = Color.White
    val iosSystemGray = Color(0xFFF2F2F7)
    val iosSystemBlue = Color(0xFF007AFF)
    val themeText = Color(0xFF1D1D1F)
    val themeSecondaryText = Color(0xFF8E8E93)

    // Coordinated Animation States
    val logoAlpha = remember { Animatable(0f) }
    val logoOffsetY = remember { Animatable(0f) } // 0 is center
    val contentAlpha = remember { Animatable(0f) }
    val contentOffsetY = remember { Animatable(150f) } // Slide from bottom

    LaunchedEffect(Unit) {
        // Stage 1: Logo appears at center
        logoAlpha.animateTo(1f, tween(1000, easing = EaseInCubic))
        delay(800)

        // Stage 2: Logo moves UP & Form slides UP from bottom
        launch {
            logoOffsetY.animateTo(
                targetValue = -140f, // Lowered from -260f for better centering
                animationSpec = tween(1400, easing = EaseInOutQuart)
            )
        }
        
        delay(400) // Slight stagger for the form
        
        launch {
            contentAlpha.animateTo(1f, tween(1000))
        }
        launch {
            contentOffsetY.animateTo(0f, tween(1400, easing = EaseOutBack))
        }
    }

    LaunchedEffect(uiState) {
        if (uiState is LoginUiState.Success) {
            onLoginSuccess((uiState as LoginUiState.Success).role)
        }
    }

    Scaffold(
        containerColor = themeBg
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // 1. Branding Logo (Animated from center to top)
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .align(Alignment.Center)
                    .offset(y = logoOffsetY.value.dp)
                    .alpha(logoAlpha.value)
            ) {
                Text(
                    text = "UITS",
                    fontSize = 80.sp,
                    style = MaterialTheme.typography.displayLarge,
                    fontWeight = FontWeight.Bold,
                    color = themeText,
                    letterSpacing = (-4).sp
                )
            }

            // 2. Animated Login Content (Slides from bottom)
            Column(
                modifier = Modifier
                    .align(Alignment.Center)
                    .padding(horizontal = 24.dp)
                    .padding(top = 100.dp) // Reduced from 180.dp to bring it closer to center
                    .offset(y = contentOffsetY.value.dp)
                    .alpha(contentAlpha.value),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Inset Grouped Form
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(iosSystemGray, RoundedCornerShape(14.dp))
                        .padding(vertical = 4.dp)
                ) {
                    TextField(
                        value = username,
                        onValueChange = { username = it },
                        placeholder = { Text("Login", color = themeSecondaryText.copy(alpha = 0.6f)) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent,
                            focusedTextColor = themeText,
                            unfocusedTextColor = themeText
                        ),
                        leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = iosSystemBlue) },
                        singleLine = true
                    )
                    
                    HorizontalDivider(
                        modifier = Modifier.padding(start = 56.dp),
                        color = themeText.copy(alpha = 0.05f),
                        thickness = 0.5.dp
                    )
                    
                    TextField(
                        value = password,
                        onValueChange = { password = it },
                        placeholder = { Text("Parol", color = themeSecondaryText.copy(alpha = 0.6f)) },
                        modifier = Modifier.fillMaxWidth(),
                        visualTransformation = PasswordVisualTransformation(),
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent,
                            focusedTextColor = themeText,
                            unfocusedTextColor = themeText
                        ),
                        leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = iosSystemBlue) },
                        singleLine = true
                    )
                }

                if (uiState is LoginUiState.Error) {
                    Text(
                        text = (uiState as LoginUiState.Error).message,
                        color = Color.Red,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(top = 16.dp),
                        fontWeight = FontWeight.Medium
                    )
                }

                Spacer(modifier = Modifier.height(32.dp))

                // Premium Action Button
                Button(
                    onClick = { viewModel.login(username, password) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = iosSystemBlue,
                        disabledContainerColor = iosSystemBlue.copy(alpha = 0.4f)
                    ),
                    enabled = uiState !is LoginUiState.Loading,
                    elevation = null
                ) {
                    if (uiState is LoginUiState.Loading) {
                        CircularProgressIndicator(
                            color = Color.White,
                            modifier = Modifier.size(24.dp),
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(
                            "Kirish",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White
                        )
                    }
                }
            }

            // Footer
            Text(
                text = "Tizimdan foydalanish orqali siz maxfiylik siyosatiga rozilik bildirasiz",
                fontSize = 13.sp,
                color = themeSecondaryText,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                lineHeight = 18.sp,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 32.dp)
                    .padding(horizontal = 40.dp)
                    .alpha(contentAlpha.value)
            )
        }
    }
}
