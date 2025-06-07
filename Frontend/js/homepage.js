fetch('/auth/users', {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => {
      if (response.status === 401) {
        window.location.href = '/index.html';
      }
      return response.json();
    })
    .then(data => {
      if (data.name) {
        document.getElementById("username-tagline").textContent = data.name;
      } else {
        indow.location.href = '/index.html';
      }
    })
    .catch(err => {
      console.error("Fetch error:", err);
    });
    const toggleBtn = document.getElementById('darkModeToggle');
const body = document.body;


if (localStorage.getItem('darkMode') === 'enabled') {
  body.classList.add('dark');
  toggleBtn.textContent = 'Light Mode';
}

toggleBtn.addEventListener('click', () => {
  body.classList.toggle('dark');
  if (body.classList.contains('dark')) {
    toggleBtn.textContent = 'Light Mode';
    localStorage.setItem('darkMode', 'enabled');
  } else {
    toggleBtn.textContent = 'Dark Mode';
    localStorage.setItem('darkMode', 'disabled');
  }
});
