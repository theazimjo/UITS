package abs.uits.com.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "settings")

class TokenManager(private val context: Context) {
    companion object {
        private val TOKEN_KEY = stringPreferencesKey("jwt_token")
        private val ROLE_KEY = stringPreferencesKey("user_role")
    }

    val token: Flow<String?> = context.dataStore.data.map { it[TOKEN_KEY] }
    val role: Flow<String?> = context.dataStore.data.map { it[ROLE_KEY] }

    suspend fun saveAuth(token: String, role: String) {
        context.dataStore.edit {
            it[TOKEN_KEY] = token
            it[ROLE_KEY] = role
        }
    }

    suspend fun clear() {
        context.dataStore.edit {
            it.clear()
        }
    }
}
