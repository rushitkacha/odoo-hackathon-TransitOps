/**
 * TransitOps – Login Page Logic
 * Handles login form submission, validation, particles, and password toggle.
 */

(function initLoginPage() {

  // If already authenticated, redirect to app
  if (Auth.isAuthenticated()) {
    window.location.href = 'app.html';
    return;
  }

  // --- DOM References ---
  const form          = document.getElementById('login-form');
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const loginBtn      = document.getElementById('btn-login');
  const errorAlert    = document.getElementById('login-error');
  const errorText     = document.getElementById('login-error-text');
  const usernameError = document.getElementById('username-error');
  const passwordError = document.getElementById('password-error');
  const passwordToggle = document.getElementById('password-toggle');

  // --- Generate floating particles ---
  generateParticles();

  // --- Password visibility toggle ---
  passwordToggle.addEventListener('click', function () {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    passwordToggle.textContent = isPassword ? '🙈' : '👁️';
  });

  // --- Form submission ---
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearErrors();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Client-side validation
    let valid = true;

    if (!username) {
      showFieldError(usernameInput, usernameError, 'Username is required');
      valid = false;
    }

    if (!password) {
      showFieldError(passwordInput, passwordError, 'Password is required');
      valid = false;
    }

    if (!valid) return;

    // Disable button & show loading
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    loginBtn.textContent = '';

    try {
      await Auth.login(username, password);

      // Success — redirect to app
      window.location.href = 'app.html';

    } catch (err) {
      // Show error alert
      errorText.textContent = err.message || 'Invalid username or password. Please try again.';
      errorAlert.classList.add('visible');

      // Shake the form
      form.style.animation = 'none';
      requestAnimationFrame(function () {
        form.style.animation = 'shakeForm 0.4s ease';
      });

    } finally {
      loginBtn.classList.remove('loading');
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign In';
    }
  });

  // --- Clear errors on input ---
  usernameInput.addEventListener('input', function () {
    clearFieldError(usernameInput, usernameError);
    hideAlert();
  });

  passwordInput.addEventListener('input', function () {
    clearFieldError(passwordInput, passwordError);
    hideAlert();
  });

  // --- Enter key support ---
  passwordInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });

  // --- Forgot password link ---
  document.getElementById('forgot-password-link').addEventListener('click', function (e) {
    e.preventDefault();
    // Placeholder — could open a modal or redirect
    alert('Please contact your system administrator to reset your password.');
  });


  // ===== Helper Functions =====

  function showFieldError(input, errorEl, message) {
    input.classList.add('error');
    errorEl.textContent = message;
    errorEl.classList.remove('d-none');
  }

  function clearFieldError(input, errorEl) {
    input.classList.remove('error');
    errorEl.classList.add('d-none');
    errorEl.textContent = '';
  }

  function clearErrors() {
    [usernameInput, passwordInput].forEach(function (el) { el.classList.remove('error'); });
    [usernameError, passwordError].forEach(function (el) {
      el.classList.add('d-none');
      el.textContent = '';
    });
  }

  function hideAlert() {
    errorAlert.classList.remove('visible');
  }

  function generateParticles() {
    var container = document.getElementById('login-particles');
    if (!container) return;

    for (var i = 0; i < 20; i++) {
      var particle = document.createElement('div');
      particle.className = 'login-particle';
      var size = Math.random() * 6 + 3;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = (Math.random() * 100 + 100) + '%';
      particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
      particle.style.animationDelay = (Math.random() * 10) + 's';
      container.appendChild(particle);
    }
  }

})();
