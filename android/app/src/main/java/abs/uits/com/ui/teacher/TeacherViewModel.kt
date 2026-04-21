package abs.uits.com.ui.teacher

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
import abs.uits.com.data.model.*
import abs.uits.com.data.remote.NetworkModule

class TeacherViewModel : ViewModel() {
    private val _dashboard = MutableStateFlow<TeacherDashboardResponse?>(null)
    val dashboard = _dashboard.asStateFlow()

    private val _students = MutableStateFlow<List<TeacherStudentResponse>>(emptyList())
    
    private val _searchQuery = MutableStateFlow("")
    val searchQuery = _searchQuery.asStateFlow()

    // Reactive filtering to prevent UI freezes
    val filteredStudents = combine(_students, _searchQuery) { students, query ->
        if (query.isBlank()) students
        else students.filter { it.name.contains(query, ignoreCase = true) }
    }.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    private val _finance = MutableStateFlow<TeacherFinanceResponse?>(null)
    val finance = _finance.asStateFlow()

    private val _profile = MutableStateFlow<StaffResponse?>(null)
    val profile = _profile.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    init {
        fetchAllData()
    }

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun fetchAllData() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                // Run IO operations in parallel and switch to IO dispatcher for safety
                launch(Dispatchers.IO) { _profile.value = NetworkModule.teacherApiService.getMe() }
                launch(Dispatchers.IO) { _dashboard.value = NetworkModule.teacherApiService.getDashboard() }
                launch(Dispatchers.IO) { _students.value = NetworkModule.teacherApiService.getMyStudents() }
                launch(Dispatchers.IO) { _finance.value = NetworkModule.teacherApiService.getMyFinance() }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isLoading.value = false
            }
        }
    }
}
