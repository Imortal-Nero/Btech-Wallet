document.getElementById('signupForm').addEventListener('submit', function(e) {
  e.preventDefault(); 

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;

  fetch('/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password, passwordConfirm }),
    credentials: 'include'
  })
  .then(res => res.json())
  .then(data => {
    if(data.success) {
      
        window.location.href = '/index.html';
    } else {
        
      document.getElementById('signupError').textContent = data.message || 'Signup failed';
    }
  })
  .catch(err => {
    console.error(err);
    document.getElementById('signupError').textContent = 'An error occurred';
  });
});
