package abs.uits.com.ui.theme

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.adamglin.PhosphorIcons
import com.adamglin.phosphoricons.Regular
import com.adamglin.phosphoricons.regular.ArrowLeft
import com.adamglin.phosphoricons.regular.CaretRight
import com.adamglin.phosphoricons.regular.MagnifyingGlass
import dev.chrisbanes.haze.HazeDefaults
import dev.chrisbanes.haze.HazeState
import dev.chrisbanes.haze.HazeTint
import dev.chrisbanes.haze.hazeEffect
import dev.chrisbanes.haze.hazeSource

/**
 * iOS "material" glass style used by [IosNavBar], [IosTabBar] and [IosActionSheet]: a blurred,
 * lightly white-tinted backdrop matching iOS's `.regularMaterial`/`.systemMaterial` look.
 */
@Composable
private fun iosGlassStyle(tintColor: Color = IosCard, tintAlpha: Float = 0.55f) = HazeDefaults.style(
    backgroundColor = IosBackground,
    tint = HazeTint(tintColor.copy(alpha = tintAlpha)),
    blurRadius = 24.dp,
    noiseFactor = HazeDefaults.noiseFactor
)

/** Marks scrollable content as a blur source for a glass [IosNavBar]/[IosTabBar]/[IosActionSheet] sharing the same [hazeState]. */
fun Modifier.iosHazeSource(hazeState: HazeState?): Modifier =
    if (hazeState != null) this.hazeSource(state = hazeState) else this

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

/**
 * iOS-style navigation bar: left "‹ Back" text button, centered title, hairline bottom separator.
 * Pass [hazeState] (shared with the scrollable content behind it via [iosHazeSource]) to render it
 * as a blurred glass bar instead of a flat one — matching iOS's translucent nav bar.
 */
@Composable
fun IosNavBar(
    title: String,
    onBack: (() -> Unit)? = null,
    backLabel: String = "Orqaga",
    hazeState: HazeState? = null,
    modifier: Modifier = Modifier,
    actions: @Composable () -> Unit = {}
) {
    Column(
        modifier = modifier.then(
            if (hazeState != null) {
                Modifier.hazeEffect(state = hazeState, style = iosGlassStyle())
            } else {
                Modifier.background(IosBackground)
            }
        )
    ) {
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
                            imageVector = PhosphorIcons.Regular.ArrowLeft,
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

/**
 * iOS-style filled button: tinted background, bold white label, no elevation, press-dim instead of ripple.
 * Set [loading] to swap the label for a spinner (e.g. while a network request is in flight); the button
 * is automatically non-interactive while loading.
 */
@Composable
fun IosFilledButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    containerColor: Color = IosBlue,
    enabled: Boolean = true,
    loading: Boolean = false,
    leadingIcon: (@Composable () -> Unit)? = null
) {
    Surface(
        modifier = modifier.iosPressable(enabled = enabled && !loading, onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        color = if (enabled) containerColor else containerColor.copy(alpha = 0.4f)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 15.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (loading) {
                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
            } else {
                if (leadingIcon != null) {
                    leadingIcon()
                    Spacer(modifier = Modifier.width(8.dp))
                }
                Text(text, color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.SemiBold)
            }
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
    hazeState: HazeState? = null,
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
            Surface(
                shape = RoundedCornerShape(14.dp),
                color = if (hazeState != null) Color.Transparent else Color.White,
                modifier = if (hazeState != null) Modifier.hazeEffect(state = hazeState, style = iosGlassStyle()) else Modifier
            ) {
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
                modifier = Modifier
                    .iosPressable(onClick = onDismiss)
                    .then(if (hazeState != null) Modifier.hazeEffect(state = hazeState, style = iosGlassStyle()) else Modifier),
                shape = RoundedCornerShape(14.dp),
                color = if (hazeState != null) Color.Transparent else Color.White
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

/** Model for a single [IosTabBar] destination. Pass a distinct [selectedIcon] for outline/filled icon
 * pairs (e.g. PhosphorIcons.Regular.House / PhosphorIcons.Fill.House); omit it to reuse [icon] for both states. */
data class IosTabItem(
    val label: String,
    val icon: ImageVector,
    val selectedIcon: ImageVector = icon
)

/**
 * iOS-style bottom tab bar: hairline top separator, evenly-spaced centered icon+label per tab,
 * IosBlue tint when selected, iosPressable feedback — replaces Material's NavigationBar
 * (no ripple, no elevation, no pill indicator) so every tabbed screen in the app looks identical.
 * Pass [hazeState] (shared with the scrollable content behind it via [iosHazeSource]) to render it
 * as a blurred glass bar instead of a flat one.
 */
@Composable
fun IosTabBar(
    items: List<IosTabItem>,
    selectedIndex: Int,
    onSelect: (Int) -> Unit,
    modifier: Modifier = Modifier,
    hazeState: HazeState? = null
) {
    Surface(
        color = if (hazeState != null) Color.Transparent else IosCard,
        modifier = modifier
            .fillMaxWidth()
            .then(if (hazeState != null) Modifier.hazeEffect(state = hazeState, style = iosGlassStyle()) else Modifier)
            .drawBehind {
                drawLine(
                    color = IosSeparator.copy(alpha = 0.5f),
                    start = Offset(0f, 0f),
                    end = Offset(size.width, 0f),
                    strokeWidth = 0.5.dp.toPx()
                )
            }
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            items.forEachIndexed { index, tab ->
                val isSelected = index == selectedIndex
                val tint = if (isSelected) IosBlue else IosSecondaryLabel
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .weight(1f)
                        .iosPressable(onClick = { onSelect(index) })
                        .padding(vertical = 4.dp)
                ) {
                    Icon(
                        imageVector = if (isSelected) tab.selectedIcon else tab.icon,
                        contentDescription = tab.label,
                        tint = tint,
                        modifier = Modifier.size(22.dp)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = tab.label,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Medium,
                        color = tint
                    )
                }
            }
        }
    }
}

/**
 * Section label above a grouped card. Without [icon]: small bold gray all-caps caption, matching
 * iOS's grouped-table section header. With [icon]: larger bold black title row for a content heading.
 */
@Composable
fun IosSectionHeader(
    title: String,
    icon: ImageVector? = null,
    modifier: Modifier = Modifier
) {
    if (icon != null) {
        Row(
            modifier = modifier.fillMaxWidth().padding(vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, contentDescription = null, tint = IosBlue, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = IosLabel)
        }
    } else {
        Text(
            text = title.uppercase(),
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            color = IosSecondaryLabel,
            modifier = modifier.padding(start = 20.dp, top = 8.dp, bottom = 8.dp)
        )
    }
}

/**
 * Grouped-list row: optional leading icon, label, optional trailing value, optional chevron.
 * [stacked]=true renders the label as a small caption above a larger bold value (Contacts-style
 * detail cell); [stacked]=false (default) renders "label ... value" on one trailing-aligned line
 * (Settings-style). Pass [onClick] to make the row tappable with iosPressable feedback.
 */
@Composable
fun IosListRow(
    label: String,
    value: String? = null,
    icon: ImageVector? = null,
    isLast: Boolean = true,
    destructive: Boolean = false,
    showChevron: Boolean = false,
    stacked: Boolean = false,
    onClick: (() -> Unit)? = null
) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .let { if (onClick != null) it.iosPressable(onClick = onClick) else it }
                .padding(horizontal = 16.dp, vertical = if (stacked) 10.dp else 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (icon != null) {
                Icon(
                    icon,
                    contentDescription = null,
                    tint = if (destructive) IosRed else IosSecondaryLabel,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
            }
            if (stacked) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(label, fontSize = 13.sp, color = IosSecondaryLabel)
                    Text(
                        value ?: "",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (destructive) IosRed else if (onClick != null) IosBlue else IosLabel
                    )
                }
            } else {
                Text(
                    label,
                    fontSize = 15.sp,
                    color = if (destructive) IosRed else IosLabel,
                    modifier = Modifier.weight(1f)
                )
                if (value != null) {
                    Text(value, fontSize = 15.sp, fontWeight = FontWeight.Medium, color = IosSecondaryLabel)
                }
            }
            if (showChevron) {
                Spacer(modifier = Modifier.width(6.dp))
                Icon(
                    PhosphorIcons.Regular.CaretRight,
                    contentDescription = null,
                    tint = IosTertiaryLabel,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
        if (!isLast) {
            HorizontalDivider(
                modifier = Modifier.padding(start = if (icon != null) 48.dp else 16.dp),
                color = IosSeparator.copy(alpha = 0.5f),
                thickness = 0.5.dp
            )
        }
    }
}

/** Small metric tile matching iOS card conventions: optional tinted icon, caption label, bold value, optional sub-value. */
@Composable
fun IosStatCard(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    subValue: String? = null,
    tint: Color = IosBlue,
    icon: ImageVector? = null
) {
    IosCard(modifier = modifier.heightIn(min = 100.dp)) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.Center) {
            if (icon != null) {
                Icon(icon, contentDescription = null, tint = tint.copy(alpha = 0.8f), modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.height(8.dp))
            }
            Text(label, fontSize = 12.sp, color = IosSecondaryLabel)
            Text(value, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = IosLabel)
            if (subValue != null) {
                Text(subValue, fontSize = 13.sp, color = IosSecondaryLabel, fontWeight = FontWeight.Medium)
            }
        }
    }
}

/** iOS-style pill search field: magnifying glass, placeholder, no Material underline/focus ring. */
@Composable
fun IosSearchField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "Qidirish"
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(IosBackground, RoundedCornerShape(10.dp))
            .padding(horizontal = 10.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(PhosphorIcons.Regular.MagnifyingGlass, contentDescription = null, tint = IosSecondaryLabel, modifier = Modifier.size(18.dp))
        Spacer(modifier = Modifier.width(6.dp))
        Box(modifier = Modifier.weight(1f)) {
            if (value.isEmpty()) {
                Text(placeholder, fontSize = 15.sp, color = IosSecondaryLabel)
            }
            BasicTextField(
                value = value,
                onValueChange = onValueChange,
                singleLine = true,
                textStyle = TextStyle(fontSize = 15.sp, color = IosLabel),
                cursorBrush = SolidColor(IosBlue),
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}
