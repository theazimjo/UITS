package abs.uits.com.ui.teacher

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import abs.uits.com.data.model.StaffResponse
import abs.uits.com.data.remote.NetworkModule
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class TeacherTab(val route: String, val icon: ImageVector, val label: String) {
    object Home : TeacherTab("home", Icons.Default.Home, "Asosiy")
    object Groups : TeacherTab("groups", Icons.Default.Groups, "Guruhlar")
    object Profile : TeacherTab("profile", Icons.Default.Person, "Profil")
}

@Composable
fun TeacherDashboardScreen(
    onLogout: () -> Unit
) {
    var selectedTab by remember { mutableStateOf<TeacherTab>(TeacherTab.Home) }
    val teacherViewModel: TeacherViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return TeacherViewModel() as T
            }
        }
    )

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.background,
                tonalElevation = 8.dp
            ) {
                val tabs = listOf(TeacherTab.Home, TeacherTab.Groups, TeacherTab.Profile)
                tabs.forEach { tab ->
                    NavigationBarItem(
                        selected = selectedTab == tab,
                        onClick = { selectedTab = tab },
                        icon = { Icon(tab.icon, contentDescription = tab.label) },
                        label = { Text(tab.label) }
                    )
                }
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when (selectedTab) {
                is TeacherTab.Home -> TeacherHomeScreen(teacherViewModel)
                is TeacherTab.Groups -> TeacherGroupsScreen(teacherViewModel)
                is TeacherTab.Profile -> TeacherProfileScreen(teacherViewModel, onLogout)
            }
        }
    }
}

class TeacherViewModel : ViewModel() {
    private val _profile = MutableStateFlow<StaffResponse?>(null)
    val profile = _profile.asStateFlow()

    init {
        fetchProfile()
    }

    private fun fetchProfile() {
        viewModelScope.launch {
            try {
                val response = NetworkModule.teacherApiService.getMe()
                _profile.value = response
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}

@Composable
fun TeacherHomeScreen(viewModel: TeacherViewModel) {
    val profile by viewModel.profile.collectAsState()
    
    Column(modifier = Modifier.fillMaxSize().padding(24.dp)) {
        Text("Xush kelibsiz,", fontSize = 16.sp, color = MaterialTheme.colorScheme.secondary)
        Text(profile?.name ?: "Ustoz", fontSize = 24.sp, fontWeight = FontWeight.Bold)
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp)
        ) {
            Column(modifier = Modifier.padding(24.dp)) {
                Text("Guruhlaringiz soni", fontSize = 14.sp)
                Text("${profile?.groups?.size ?: 0} ta", fontSize = 32.sp, fontWeight = FontWeight.Black)
            }
        }
    }
}

@Composable
fun TeacherGroupsScreen(viewModel: TeacherViewModel) {
    val profile by viewModel.profile.collectAsState()
    
    Column(modifier = Modifier.fillMaxSize().padding(24.dp)) {
        Text("Mening guruhlarim", fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(16.dp))
        
        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(profile?.groups ?: emptyList()) { group ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    ListItem(
                        headlineContent = { Text(group.name, fontWeight = FontWeight.Bold) },
                        supportingContent = { Text(group.course?.name ?: "Kurs nomi ko'rsatilmadi") },
                        trailingContent = {
                             Text(group.groupStatus ?: "Faol", color = MaterialTheme.colorScheme.primary)
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun TeacherProfileScreen(viewModel: TeacherViewModel, onLogout: () -> Unit) {
    val profile by viewModel.profile.collectAsState()

    Column(modifier = Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.Center) {
        Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(24.dp)) {
            Column(modifier = Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Default.Person, contentDescription = null, modifier = Modifier.size(64.dp), tint = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.height(16.dp))
                Text(profile?.name ?: "", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text(profile?.phone ?: "", fontSize = 14.sp, color = Color.Gray)
                
                Spacer(modifier = Modifier.height(32.dp))
                
                Button(
                    onClick = onLogout,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Tizimdan chiqish")
                }
            }
        }
    }
}
