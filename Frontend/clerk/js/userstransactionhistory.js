document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("transactionTableBody");
  const filterBtn = document.getElementById("filterBtn");
  const clearBtn = document.getElementById("clearFilterBtn");
  const darkModeToggle = document.getElementById("darkModeToggle");

  // Load saved dark mode preference
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark");
    darkModeToggle.textContent = "Light Mode";
  } else {
    darkModeToggle.textContent = "Dark Mode";
  }

  // Toggle dark mode on button click
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

  // Load all transactions by default
  loadTransactions();

  // Filter transactions on filter button click
  filterBtn.addEventListener("click", () => {
    const query = buildQueryFromFilters();
    loadTransactions(query);
  });

  // Clear filters and reload all transactions
  clearBtn.addEventListener("click", () => {
    document.getElementById("filterUsername").value = "";
    document.getElementById("filterEmail").value = "";
    document.getElementById("filterType").value = "";
    document.getElementById("filterMinAmount").value = "";
    document.getElementById("filterMaxAmount").value = "";
    loadTransactions(); // Reload all transactions
  });

  // Build URL query string from filter inputs
  function buildQueryFromFilters() {
    const params = new URLSearchParams();

    const username = document.getElementById("filterUsername").value.trim();
    const email = document.getElementById("filterEmail").value.trim();
    const type = document.getElementById("filterType").value;
    const min = document.getElementById("filterMinAmount").value;
    const max = document.getElementById("filterMaxAmount").value;

    if (username) params.append("username", username);
    if (email) params.append("email", email);
    if (type) params.append("type", type);
    if (min) params.append("amountMin", min);
    if (max) params.append("amountMax", max);

    return params.toString();
  }

  // Fetch and display transactions, optionally with filters
  function loadTransactions(query = "") {
    fetch(`/auth/userstransactions${query ? `?${query}` : ""}`)
      .then(res => res.json())
      .then(data => {
        tableBody.innerHTML = "";

        if (!data.success || !data.transactions.length) {
          tableBody.innerHTML = `
            <tr>
              <td colspan="4" class="text-center">No transactions found.</td>
            </tr>`;
          return;
        }

        data.transactions.forEach(tx => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${tx.name}</td>
            <td>${tx.email}</td>
            <td>Rs.${parseFloat(tx.amount).toFixed(2)}</td>
            <td><span class="badge ${tx.type === "Sent" ? "bg-danger" : "bg-success"}">${tx.type}</span></td>
          `;
          tableBody.appendChild(row);
        });
      })
      .catch(err => {
        console.error("Fetch error:", err);
        tableBody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center text-danger">Error loading transactions.</td>
          </tr>`;
      });
  }
});
