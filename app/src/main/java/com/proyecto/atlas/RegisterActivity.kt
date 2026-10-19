package com.proyecto.atlas

import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.text.SpannableString
import android.text.Spanned
import android.text.style.ForegroundColorSpan
import android.text.style.StyleSpan
import android.util.Patterns
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.widget.doAfterTextChanged
import com.proyecto.atlas.data.AuthRepository
import com.proyecto.atlas.databinding.ActivityRegisterBinding
import com.proyecto.atlas.model.User

class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        ViewCompat.setOnApplyWindowInsetsListener(binding.registerRoot) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        styleLoginLink()
        setupValidationListeners()
        setupButtons()
    }

    /** Resalta "Inicia sesión" en naranja dentro del enlace inferior. */
    private fun styleLoginLink() {
        val fullText = getString(R.string.register_go_to_login)
        val highlight = getString(R.string.register_login_highlight)
        val start = fullText.indexOf(highlight)

        if (start == -1) {
            binding.tvGoToLogin.text = fullText
            return
        }

        val spannable = SpannableString(fullText)
        val orange = ContextCompat.getColor(this, R.color.accent_orange)
        val end = start + highlight.length
        spannable.setSpan(ForegroundColorSpan(orange), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
        spannable.setSpan(StyleSpan(Typeface.BOLD), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
        binding.tvGoToLogin.text = spannable
    }

    /** Limpia el mensaje de error en cuanto el usuario corrige el campo. */
    private fun setupValidationListeners() {
        binding.etName.doAfterTextChanged { binding.tilName.error = null }
        binding.etEmail.doAfterTextChanged { binding.tilEmail.error = null }
        binding.etPassword.doAfterTextChanged { binding.tilPassword.error = null }
    }

    private fun setupButtons() {
        binding.btnBack.setOnClickListener { finish() }
        binding.tvGoToLogin.setOnClickListener { finish() }
        binding.btnRegister.setOnClickListener { attemptRegister() }
    }

    private fun attemptRegister() {
        val name = binding.etName.text?.toString()?.trim().orEmpty()
        val email = binding.etEmail.text?.toString()?.trim().orEmpty()
        val password = binding.etPassword.text?.toString().orEmpty()

        if (!validateFields(name, email, password)) return

        val newUser = User(
            id = System.currentTimeMillis().toString(),
            name = name,
            email = email,
            password = password,
            weight = DEFAULT_WEIGHT_KG,
            targetWeight = DEFAULT_WEIGHT_KG,
            goal = DEFAULT_GOAL
        )

        if (!AuthRepository.register(newUser)) {
            binding.tilEmail.error = getString(R.string.register_error_email_taken)
            Toast.makeText(this, R.string.register_error_email_taken, Toast.LENGTH_SHORT).show()
            return
        }

        // register() ya dejó la sesión abierta, así que entramos directo al dashboard.
        Toast.makeText(this, R.string.register_success, Toast.LENGTH_SHORT).show()
        goToHome()
    }

    private fun validateFields(name: String, email: String, password: String): Boolean {
        var isValid = true

        if (name.isEmpty()) {
            binding.tilName.error = getString(R.string.register_error_empty_name)
            isValid = false
        }

        if (email.isEmpty()) {
            binding.tilEmail.error = getString(R.string.register_error_empty_email)
            isValid = false
        } else if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.tilEmail.error = getString(R.string.register_error_invalid_email)
            isValid = false
        }

        if (password.isEmpty()) {
            binding.tilPassword.error = getString(R.string.register_error_empty_password)
            isValid = false
        } else if (password.length < MIN_PASSWORD_LENGTH) {
            binding.tilPassword.error = getString(R.string.register_error_short_password)
            isValid = false
        }

        return isValid
    }

    private fun goToHome() {
        val intent = Intent(this, HomeContainerActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }

    private companion object {
        const val MIN_PASSWORD_LENGTH = 6
        const val DEFAULT_WEIGHT_KG = 70.0
        const val DEFAULT_GOAL = "Hipertrofia"
    }
}
