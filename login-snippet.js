// Put this in your login screen's JS file.
// Change the element IDs and redirect paths to match your screens/ folders.

const ROLE_HOME = {
  citizen:   '/screens/citizen-home/index.html',
  responder: '/screens/responder-home/index.html',
  admin:     '/screens/admin-dashboard/index.html',
};

async function login(email, password) {
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.message || data.error || 'Login failed.' };
    }

    // Temporary: remember who is logged in (replace with real sessions later)
    sessionStorage.setItem('user', JSON.stringify(data));
    window.location.href = ROLE_HOME[data.role] || '/index.html';
    return { ok: true };
  } catch (error) {
    return { ok: false, error: 'Cannot connect to the server.' };
  }
}

// Example wiring:
// document.querySelector('#login-btn').addEventListener('click', async () => {
//   const email = document.querySelector('#email').value;
//   const password = document.querySelector('#password').value;
//   const result = await login(email, password);
//   if (!result.ok) document.querySelector('#error').textContent = result.error;
// });
