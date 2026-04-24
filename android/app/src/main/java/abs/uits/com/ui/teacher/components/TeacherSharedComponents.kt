package abs.uits.com.ui.teacher.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.foundation.clickable
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.graphicsLayer
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import abs.uits.com.data.model.TeacherStudentResponse
import abs.uits.com.data.model.TeacherPaymentItem

@Composable
fun DashboardStatCard(label: String, value: String, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 0.5.dp,
        border = BoxShadowBorder()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                label, 
                style = MaterialTheme.typography.labelSmall, 
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                value, 
                style = MaterialTheme.typography.displayLarge.copy(fontSize = 24.sp), 
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@OptIn(ExperimentalSharedTransitionApi::class)
@Composable
fun StudentListItem(
    student: TeacherStudentResponse,
    staggerIndex: Int = 0,
    sharedTransitionScope: SharedTransitionScope,
    animatedVisibilityScope: AnimatedVisibilityScope,
    onClick: () -> Unit
) {
    val animatedAlpha = remember { Animatable(0f) }
    val animatedScale = remember { Animatable(0.95f) }
    val animatedOffset = remember { Animatable(20f) }

    LaunchedEffect(student.id) {
        delay(staggerIndex * 40L)
        launch { animatedAlpha.animateTo(1f, tween(400)) }
        launch { animatedScale.animateTo(1f, tween(400, easing = EaseOutBack)) }
        launch { animatedOffset.animateTo(0f, tween(400, easing = EaseOutQuart)) }
    }

    with(sharedTransitionScope) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onClick() }
                .graphicsLayer {
                    // Only apply stagger if we are not in a transition or use a different trigger
                    alpha = animatedAlpha.value
                    translationY = animatedOffset.value
                }
                .padding(vertical = 12.dp, horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = CircleShape,
                modifier = Modifier
                    .size(44.dp)
                    .sharedElement(
                        rememberSharedContentState(key = "photo-${student.id}"),
                        animatedVisibilityScope = animatedVisibilityScope,
                        boundsTransform = { _, _ -> 
                            spring(
                                dampingRatio = 0.8f, // Subtle bounce
                                stiffness = 380f     // Smooth flow
                            )
                        }
                    ),
                color = MaterialTheme.colorScheme.surfaceVariant,
                tonalElevation = 0.dp
            ) {
                if (student.photo != null) {
                    AsyncImage(
                        model = ImageRequest.Builder(LocalContext.current)
                            .data(student.photo)
                            .crossfade(true)
                            .build(),
                        contentDescription = null,
                        contentScale = androidx.compose.ui.layout.ContentScale.Crop,
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(CircleShape)
                    )
                } else {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            student.name.take(1).uppercase(),
                            color = MaterialTheme.colorScheme.primary,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.width(14.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    student.name, 
                    modifier = Modifier.sharedBounds(
                        rememberSharedContentState(key = "name-${student.id}"),
                        animatedVisibilityScope = animatedVisibilityScope
                    ),
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.SemiBold,
                        letterSpacing = (-0.5).sp
                    ),
                    fontSize = 17.sp,
                    color = Color(0xFF1D1D1F) // iOS Dynamic Black
                )
                Text(
                    student.groups.joinToString { it.name }, 
                    style = MaterialTheme.typography.labelSmall, 
                    color = Color(0xFF8E8E93), // iOS Secondary Label Color
                    letterSpacing = 0.sp
                )
            }
            
            Icon(
                Icons.Default.ChevronRight, 
                contentDescription = null, 
                tint = Color(0xFFC4C4C6), // iOS Separator/Chevron Color
                modifier = Modifier.size(16.dp)
            )
        }
    }
}

@Composable
fun PaymentListItem(payment: TeacherPaymentItem) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                payment.studentName, 
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                fontSize = 17.sp
            )
            Text(
                "${payment.groupName} • ${payment.paymentDate}", 
                style = MaterialTheme.typography.labelSmall, 
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
            )
        }
        Text(
            "+${payment.amount.toInt()}", 
            color = Color(0xFF34C759), // iOS Green
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
            fontSize = 17.sp
        )
    }
}

@Composable
fun SettingsItem(icon: ImageVector, label: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Surface(
            shape = RoundedCornerShape(8.dp),
            color = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f),
            modifier = Modifier.size(32.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    icon, 
                    contentDescription = null, 
                    tint = MaterialTheme.colorScheme.primary, 
                    modifier = Modifier.size(20.dp)
                )
            }
        }
        Spacer(modifier = Modifier.width(16.dp))
        Text(
            label, 
            style = MaterialTheme.typography.bodyLarge,
            fontSize = 17.sp
        )
        Spacer(modifier = Modifier.weight(1f))
        Icon(
            Icons.Default.ChevronRight, 
            contentDescription = null, 
            tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f),
            modifier = Modifier.size(16.dp)
        )
    }
}

@Composable
fun BoxShadowBorder() = androidx.compose.foundation.BorderStroke(
    width = 0.5.dp,
    color = MaterialTheme.colorScheme.outline.copy(alpha = 0.1f)
)
