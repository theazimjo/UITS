package abs.uits.com.ui.teacher

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.supervisorScope
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

    private val _selectedTab = MutableStateFlow<TeacherTab>(TeacherTab.Home)
    val selectedTab = _selectedTab.asStateFlow()

    fun selectTab(tab: TeacherTab) {
        _selectedTab.value = tab
    }

    private val _profile = MutableStateFlow<StaffResponse?>(null)
    val profile = _profile.asStateFlow()

    private val _selectedStudent = MutableStateFlow<TeacherStudentResponse?>(null)
    val selectedStudent = _selectedStudent.asStateFlow()

    private val _studentPayments = MutableStateFlow<List<TeacherPaymentItem>>(emptyList())
    val studentPayments = _studentPayments.asStateFlow()

    private val _studentExams = MutableStateFlow<List<StudentExamResult>>(emptyList())
    val studentExams = _studentExams.asStateFlow()

    private val _studentAttendance = MutableStateFlow<StudentAttendanceResponse?>(null)
    val studentAttendance = _studentAttendance.asStateFlow()

    private val _isDetailLoading = MutableStateFlow(false)
    val isDetailLoading = _isDetailLoading.asStateFlow()

    private val _isAttendanceLoading = MutableStateFlow(false)
    val isAttendanceLoading = _isAttendanceLoading.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    private val _todayAttendance = MutableStateFlow<TeacherAttendanceResponse?>(null)
    val todayAttendance = _todayAttendance.asStateFlow()

    private val _teacherGroups = MutableStateFlow<List<TeacherGroupSummary>>(emptyList())
    val teacherGroups = _teacherGroups.asStateFlow()

    fun fetchTodayAttendance() {
        viewModelScope.launch {
            try {
                val sdf = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
                val today = sdf.format(java.util.Date())
                _todayAttendance.value = NetworkModule.teacherApiService.getTeacherAttendance(today)
            } catch (e: Exception) {
                handleNetworkError(e)
            }
        }
    }

    fun fetchStudentDetails(id: Int) {
        viewModelScope.launch {
            _isDetailLoading.value = true
            try {
                // Clear old data
                _selectedStudent.value = null
                _studentPayments.value = emptyList()
                _studentExams.value = emptyList()

                // Use supervisorScope to ensure sibling failures don't cancel each other
                supervisorScope {
                    launch(Dispatchers.IO) { 
                        try { _selectedStudent.value = NetworkModule.teacherApiService.getStudentById(id) } 
                        catch (e: Exception) { handleNetworkError(e) } 
                    }
                    launch(Dispatchers.IO) { 
                        try { _studentPayments.value = NetworkModule.teacherApiService.getPaymentsByStudent(id) } 
                        catch (e: Exception) { handleNetworkError(e) } 
                    }
                    launch(Dispatchers.IO) { 
                        try { _studentExams.value = NetworkModule.teacherApiService.getStudentExams(id) } 
                        catch (e: Exception) { handleNetworkError(e) } 
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isDetailLoading.value = false
            }
        }
    }

    fun fetchStudentAttendance(id: Int, date: String) {
        viewModelScope.launch {
            _isAttendanceLoading.value = true
            try {
                _studentAttendance.value = NetworkModule.teacherApiService.getStudentAttendance(id, date)
            } catch (e: Exception) {
                handleNetworkError(e)
            } finally {
                _isAttendanceLoading.value = false
            }
        }
    }

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
                kotlinx.coroutines.supervisorScope {
                    launch(Dispatchers.IO) { 
                        try { _profile.value = NetworkModule.teacherApiService.getMe() } 
                        catch (e: Exception) { handleNetworkError(e) } 
                    }
                    launch(Dispatchers.IO) { 
                        try { _dashboard.value = NetworkModule.teacherApiService.getDashboard() } 
                        catch (e: Exception) { handleNetworkError(e) } 
                    }
                    launch(Dispatchers.IO) { 
                        try { _students.value = NetworkModule.teacherApiService.getMyStudents() } 
                        catch (e: Exception) { handleNetworkError(e) } 
                    }
                    launch(Dispatchers.IO) { 
                        try { _finance.value = NetworkModule.teacherApiService.getMyFinance() } 
                        catch (e: Exception) { handleNetworkError(e) } 
                    }
                    launch(Dispatchers.IO) { 
                        try { 
                            val sdf = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
                            val today = sdf.format(java.util.Date())
                            _todayAttendance.value = NetworkModule.teacherApiService.getTeacherAttendance(today) 
                        } catch (e: Exception) { handleNetworkError(e) } 
                    }
                    launch(Dispatchers.IO) { 
                        try { _teacherGroups.value = NetworkModule.teacherApiService.getMyGroups() } 
                        catch (e: Exception) { handleNetworkError(e) } 
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun clearData() {
        _dashboard.value = null
        _students.value = emptyList()
        _finance.value = null
        _profile.value = null
        _selectedStudent.value = null
        _studentPayments.value = emptyList()
        _studentExams.value = emptyList()
    }

    private fun handleNetworkError(e: Exception) {
        if (e is retrofit2.HttpException && e.code() == 401) {
            // Silently ignore 401 if we are logging out
            println("401 Unauthorized caught - likely session ended")
        } else {
            e.printStackTrace()
        }
    }

    fun getStudentById(id: Int): TeacherStudentResponse? {
        return _students.value.find { it.id == id }
    }
}
