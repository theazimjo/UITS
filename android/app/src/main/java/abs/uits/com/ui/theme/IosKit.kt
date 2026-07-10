package abs.uits.com.ui.theme

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Dims content on press instead of showing a Material ripple, matching iOS's tap-highlight behavior.
 */
fun Modifier.iosPressable(enabled: Boolean = true, onClick: () -> Unit): Modifier = composed {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val alpha by animateFloatAsState(if (isPressed) 0.55f else 1f, animationSpec = tween(120), label = "iosPressAlpha")
    this
        .graphicsLayer { this.alpha = alpha }
        .clickable(interactionSource = interactionSource, indication = null, enabled = enabled, onClick = onClick)
}

/** Flat, hairline-bordered container matching iOS grouped-list cards (no Material drop shadow). */
@Composable
fun IosCard(
    modifier: Modifier = Modifier,
    cornerRadius: Dp = 16.dp,
    containerColor: Color = Color.White,
    borderColor: Color = IosSeparator.copy(alpha = 0.5f),
    content: @Composable () -> Unit
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(cornerRadius),
        color = containerColor,
        border = BorderStroke(0.5.dp, borderColor),
        shadowElevation = 0.dp,
        tonalElevation = 0.dp
    ) {
        content()
    }
}

/** iOS-style navigation bar: left "‹ Back" text button, centered title, hairline bottom separator. */
@Composable
fun IosNavBar(
    title: String,
    onBack: (() -> Unit)? = null,
    backLabel: String = "Orqaga",
    actions: @Composable () -> Unit = {}
) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 8.dp, vertical = 8.dp)
                .heightIn(min = 44.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.CenterStart) {
                if (onBack != null) {
                    Row(
                        modifier = Modifier
                            .iosPressable(onClick = onBack)
                            .padding(horizontal = 8.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Outlined.ArrowBack,
                            contentDescription = backLabel,
                            tint = IosBlue,
                            modifier = Modifier.size(22.dp)
                        )
                        Text(backLabel, color = IosBlue, fontSize = 17.sp, fontWeight = FontWeight.Medium)
                    }
                }
            }
            Text(
                text = title,
                fontSize = 17.sp,
                fontWeight = FontWeight.SemiBold,
                color = IosLabel,
                textAlign = TextAlign.Center,
                modifier = Modifier.weight(2f)
            )
            Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.CenterEnd) {
                actions()
            }
        }
        HorizontalDivider(color = IosSeparator.copy(alpha = 0.5f), thickness = 0.5.dp)
    }
}

/** iOS Large Title text style (34sp Bold, tight tracking) for top-of-screen headers. */
@Composable
fun IosLargeTitle(text: String, modifier: Modifier = Modifier) {
    Text(
        text = text,
        fontSize = 34.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = (-0.4).sp,
        color = IosLabel,
        modifier = modifier
    )
}

/** iOS-style filled button: tinted background, bold white label, no elevation, press-dim instead of ripple. */
@Composable
fun IosFilledButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    containerColor: Color = IosBlue,
    leadingIcon: (@Composable () -> Unit)? = null
) {
    Surface(
        modifier = modifier.iosPressable(onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        color = containerColor
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 15.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (leadingIcon != null) {
                leadingIcon()
                Spacer(modifier = Modifier.width(8.dp))
            }
            Text(text, color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}

/** Small circular icon button with iOS press-dim feedback instead of a bounded Material ripple. */
@Composable
fun IosIconButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    size: Dp = 36.dp,
    content: @Composable () -> Unit
) {
    Box(
        modifier = modifier
            .size(size)
            .clip(CircleShape)
            .iosPressable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        content()
    }
}

/**
 * iOS action sheet: a grouped white options card sliding up from the bottom, plus a
 * separate "Cancel" block below it — replaces Android's Material [androidx.compose.material3.DropdownMenu]
 * for picker-style choices.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IosActionSheet(
    visible: Boolean,
    onDismiss: () -> Unit,
    title: String? = null,
    cancelLabel: String = "Bekor qilish",
    rows: @Composable ColumnScope.() -> Unit
) {
    if (!visible) return
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = Color.Transparent,
        dragHandle = null,
        scrimColor = Color.Black.copy(alpha = 0.35f)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp)
                .navigationBarsPadding()
                .padding(bottom = 8.dp)
        ) {
            Surface(shape = RoundedCornerShape(14.dp), color = Color.White) {
                Column {
                    if (title != null) {
                        Text(
                            text = title,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = IosSecondaryLabel,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth().padding(16.dp)
                        )
                        HorizontalDivider(color = IosSeparator.copy(alpha = 0.5f), thickness = 0.5.dp)
                    }
                    rows()
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Surface(
                modifier = Modifier.iosPressable(onClick = onDismiss),
                shape = RoundedCornerShape(14.dp),
                color = Color.White
            ) {
                Text(
                    text = cancelLabel,
                    color = IosBlue,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp)
                )
            }
        }
    }
}

/** A single row inside an [IosActionSheet]; centers plain text options, left-aligns rows with a leading avatar/icon. */
@Composable
fun ColumnScope.IosActionSheetRow(
    label: String,
    isLast: Boolean,
    destructive: Boolean = false,
    leading: (@Composable () -> Unit)? = null,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .iosPressable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        horizontalArrangement = if (leading != null) Arrangement.Start else Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (leading != null) {
            leading()
            Spacer(modifier = Modifier.width(10.dp))
        }
        Text(
            text = label,
            color = if (destructive) IosRed else IosBlue,
            fontSize = 17.sp,
            fontWeight = FontWeight.Medium,
            modifier = if (leading != null) Modifier.weight(1f) else Modifier
        )
    }
    if (!isLast) {
        HorizontalDivider(color = IosSeparator.copy(alpha = 0.5f), thickness = 0.5.dp)
    }
}
