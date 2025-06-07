document.getElementById('transferForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('recipientUsername').value.trim();
  const email = document.getElementById('recipientEmail').value.trim();
  const role = document.getElementById('amountSelect').value;

  if (!username || !email || !role) {
    alert('Please fill in all fields before assigning a role.');
    return;
  }

  const payload = { username, email, role };

  try {
    const res = await fetch('/auth/assign-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      alert('Role assigned successfully!');
      this.reset();
    } else {
      alert('Failed to assign role: ' + (data.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Something went wrong while assigning role.');
  }
});

// Dark Mode Toggle
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
