package com.proyecto.atlas

import android.content.Intent
import android.os.Bundle
import android.text.SpannableString
import android.text.Spanned
import android.text.style.ForegroundColorSpan
import android.text.style.StyleSpan
import android.graphics.Typeface
import android.util.Patterns
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.widget.doAfterTextChanged
import com.proyecto.atlas.data.AuthRepository
import com.proyecto.atlas.databinding.ActivityLoginBinding

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        ViewCompat.setOnApplyWindowInsetsListener(binding.loginRoot) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        styleRegisterLink()
        setupValidationListeners()
        setupButtons()
    }

    /** Resalta la palabra "Regístrate" dentro del enlace inferior. */
    private fun styleRegisterLink() {
        val fullText = getString(R.string.login_go_to_register)
        val highlight = getString(R.string.login_register_highlight)
        val start = fullText.indexOf(highlight)

        if (start == -1) {
            binding.tvGoToRegister.text = fullText
            return
        }

        val spannable = SpannableString(fullText)
        val neon = ContextCompat.getColor(this, R.color.primary_neon)
        val end = start + highlight.length
        spannable.setSpan(ForegroundColorSpan(neon), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
        spannable.setSpan(StyleSpan(Typeface.BOLD), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
        binding.tvGoToRegister.text = spannable
    }

    /** Limpia el mensaje de error en cuanto el usuario corrige el campo. */
    private fun setupValidationListeners() {
        binding.etEmail.doAfterTextChanged { binding.tilEmail.error = null }
        binding.etPassword.doAfterTextChanged { binding.tilPassword.error = null }
    }

    private fun setupButtons() {
        binding.btnLogin.setOnClickListener { attemptLogin() }

        binding.tvGoToRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        binding.tvForgotPassword.setOnClickListener {
            Toast.makeText(this, R.string.login_feature_pending, Toast.LENGTH_SHORT).show()
        }
    }

    private fun attemptLogin() {
        val email = binding.etEmail.text?.toString()?.trim().orEmpty()
        val password = binding.etPassword.text?.toString().orEmpty()

        if (!validateFields(email, password)) return

        if (!AuthRepository.login(email, password)) {
            binding.tilPassword.error = getString(R.string.login_error_invalid_credentials)
            Toast.makeText(this, R.string.login_error_invalid_credentials, Toast.LENGTH_SHORT).show()
            return
        }

        val userName = AuthRepository.getCurrentUser()?.name.orEmpty()
        Toast.makeText(this, getString(R.string.login_success, userName), Toast.LENGTH_SHORT).show()
        goToHome()
    }

    private fun validateFields(email: String, password: String): Boolean {
        var isValid = true

        if (email.isEmpty()) {
            binding.tilEmail.error = getString(R.string.login_error_empty_email)
            isValid = false
        } else if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.tilEmail.error = getString(R.string.login_error_invalid_email)
            isValid = false
        }

        if (password.isEmpty()) {
            binding.tilPassword.error = getString(R.string.login_error_empty_password)
            isValid = false
        }

        return isValid
    }

    private fun goToHome() {
        startActivity(Intent(this, HomeContainerActivity::class.java))
        finish()
    }
}
