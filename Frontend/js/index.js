document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const role = data.role;  

      switch(role) {
        case 'admin':
          window.location.href = '/admin/admin_homepage.html';
          break;
        case 'clerk':
          window.location.href = '/Clerk/clerk_homepage.html';
          break;
        case 'customer':
          window.location.href = '/homepage.html';
          break;
        default:
          document.getElementById('loginError').textContent = 'Unknown user role';
          break;
      }
    } else {
      document.getElementById('loginError').textContent = data.message || 'Login failed';
    }
  })
  .catch(err => {
    console.error(err);
    document.getElementById('loginError').textContent = 'An error occurred';
  });
});
