document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("deleteUserForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("deleteEmail").value.trim();

    if (!confirm(`Are you sure you want to delete the account with email: ${email}?`)) return;

    fetch('/auth/admin/delete-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message || (data.success ? "User deleted successfully" : "Failed to delete user"));
      form.reset();
    })
    .catch(err => {
      console.error("Error:", err);
      alert("Server error");
    });
  });
});

const darkModeToggle = document.getElementById("darkModeToggle");

if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark");
  darkModeToggle.textContent = "Light Mode";
}

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("darkMode", "enabled");
    darkModeToggle.textContent = "Light Mode";
  } else {
    localStorage.setItem("darkMode", "disabled");
    darkModeToggle.textContent = "Dark Mode";
  }
});
