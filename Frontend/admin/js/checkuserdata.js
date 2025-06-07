document.addEventListener("DOMContentLoaded", () => {
  const userSelect = document.getElementById("userSelect");
  const searchBtn = document.getElementById("searchBtn");
  const tableBody = document.getElementById("userInfoTableBody");
  const datalist = document.getElementById("usersList");
  const darkModeToggle = document.getElementById("darkModeToggle");

  function fetchUsers(search = "") {
    fetch(`/auth/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          tableBody.innerHTML = `<tr><td colspan="6">Error loading users</td></tr>`;
          return;
        }

        datalist.innerHTML = "";
        data.users.forEach(user => {
          const option = document.createElement("option");
          option.value = `${user.bank_id} - ${user.username}`;
          datalist.appendChild(option);
        });

        if (data.users.length === 0) {
          tableBody.innerHTML = `<tr><td colspan="6">No users found</td></tr>`;
        } else {
          tableBody.innerHTML = data.users.map(user => `
            <tr>
              <td>${user.id}</td>
              <td>${user.username}</td>
              <td>${user.email}</td>
              <td>${user.bank_id}</td>
              <td>${user.role}</td>
              <td>Rs.${user.balance}</td>
            </tr>
          `).join("");
        }
      })
      .catch(err => {
        console.error("Fetch error:", err);
        tableBody.innerHTML = `<tr><td colspan="6">Server error</td></tr>`;
      });
  }

  // Initial load
  fetchUsers();

  // Search on button click
  searchBtn.addEventListener("click", () => {
    const value = userSelect.value.split(" - ")[0];
    fetchUsers(value.trim());
  });

  // Dark mode toggle
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
});
