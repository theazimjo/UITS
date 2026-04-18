package abs.uits.com.ui.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import abs.uits.com.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class LoginUiState {
    object Idle : LoginUiState()
    object Loading : LoginUiState()
    data class Success(val role: String) : LoginUiState()
    data class Error(val message: String) : LoginUiState()
}

class LoginViewModel(private val repository: AuthRepository) : ViewModel() {
    private val _uiState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    fun login(username: String, pass: String) {
        if (username.isEmpty() || pass.isEmpty()) {
            _uiState.value = LoginUiState.Error("Iltimos, barcha maydonlarni to'ldiring")
            return
        }

        viewModelScope.launch {
            _uiState.value = LoginUiState.Loading
            val result = repository.login(username, pass)
            
            result.onSuccess { response ->
                _uiState.value = LoginUiState.Success(response.user.role)
            }.onFailure { error ->
                _uiState.value = LoginUiState.Error(error.message ?: "Xatolik yuz berdi")
            }
        }
    }

    fun resetState() {
        _uiState.value = LoginUiState.Idle
    }
}
