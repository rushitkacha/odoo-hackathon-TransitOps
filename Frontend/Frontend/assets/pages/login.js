(function () {
  if (Auth.isAuthenticated()) { window.location.href = 'app.html'; return; }
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const emailError = document.getElementById('username-error');
  const passwordError = document.getElementById('password-error');
  const errorAlert = document.getElementById('login-error');
  const errorText = document.getElementById('login-error-text');
  const button = document.getElementById('btn-login');

  if (AppConfig.DEMO_MODE) {
    emailInput.value = AppConfig.DEMO_EMAIL;
    passwordInput.value = AppConfig.DEMO_PASSWORD;
    const note = document.createElement('div');
    note.className = 'demo-login-note';
    note.innerHTML = `<strong>Frontend demo mode is active.</strong><br>Use ${AppConfig.DEMO_EMAIL} / ${AppConfig.DEMO_PASSWORD}.`;
    form.before(note);
  }

  document.getElementById('password-toggle').addEventListener('click', () => {
    const hidden = passwordInput.type === 'password';
    passwordInput.type = hidden ? 'text' : 'password';
    document.getElementById('password-toggle').textContent = hidden ? '🙈' : '👁️';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    emailError.classList.add('d-none'); passwordError.classList.add('d-none'); errorAlert.classList.remove('visible');
    const email = emailInput.value.trim(); const password = passwordInput.value;
    let valid = true;
    if (!email) { emailError.textContent = 'Email address is required.'; emailError.classList.remove('d-none'); valid = false; }
    if (!password) { passwordError.textContent = 'Password is required.'; passwordError.classList.remove('d-none'); valid = false; }
    if (!valid) return;
    button.disabled = true; button.textContent = 'Signing In…';
    try { await Auth.login(email, password); window.location.href = 'app.html#dashboard'; }
    catch (error) { errorText.textContent = error.message; errorAlert.classList.add('visible'); }
    finally { button.disabled = false; button.textContent = 'Sign In'; }
  });

  document.getElementById('forgot-password-link').addEventListener('click', (event) => { event.preventDefault(); alert('Password reset is outside the hackathon MVP. Contact the administrator.'); });
})();
