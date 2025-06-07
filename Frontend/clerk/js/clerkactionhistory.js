document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("transactionTableBody");

  // Filters elements
  const filterUsername = document.getElementById("filterUsername");
  const filterEmail = document.getElementById("filterEmail");
  const filterType = document.getElementById("filterType");
  const filterMinAmount = document.getElementById("filterMinAmount");
  const filterMaxAmount = document.getElementById("filterMaxAmount");
  const filterBtn = document.getElementById("filterBtn");
  const clearFilterBtn = document.getElementById("clearFilterBtn");

  async function fetchClerkActions(filters = {}) {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/clerkactions?${queryParams}`);
      const data = await response.json();

      if (!data.success) {
        alert("Failed to load clerk action history.");
        return;
      }

      populateTable(data.actions);
    } catch (err) {
      console.error("Error fetching clerk action history:", err);
      alert("Error fetching data.");
    }
  }

  function populateTable(actions) {
    tableBody.innerHTML = ""; // Clear previous rows

    if (actions.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="text-center">No records found.</td></tr>`;
      return;
    }

    actions.forEach(action => {
      // Use fields based on your backend response:
      // name, email, amountTransferred, type
      // For clerk action, amountTransferred may not apply,
      // so you can leave that blank or show an action description instead.

      const tr = document.createElement("tr");

      const nameTd = document.createElement("td");
      nameTd.textContent = action.name || "-";
      tr.appendChild(nameTd);

      const emailTd = document.createElement("td");
      emailTd.textContent = action.email || "-";
      tr.appendChild(emailTd);

      const amountTd = document.createElement("td");
      // Show the "amountTransferred" if available, else maybe action description
      amountTd.textContent = action.amountTransferred !== undefined 
        ? action.amountTransferred 
        : (action.actionDescription || "-");
      tr.appendChild(amountTd);

      const typeTd = document.createElement("td");
      typeTd.textContent = action.type || "-";
      tr.appendChild(typeTd);

      tableBody.appendChild(tr);
    });
  }

  // Initial fetch without filters
  fetchClerkActions();

  // Filter button click event
  filterBtn.addEventListener("click", () => {
    const filters = {
      username: filterUsername.value.trim(),
      email: filterEmail.value.trim(),
      type: filterType.value,
      minAmount: filterMinAmount.value,
      maxAmount: filterMaxAmount.value,
    };
    fetchClerkActions(filters);
  });

  // Clear filters
  clearFilterBtn.addEventListener("click", () => {
    filterUsername.value = "";
    filterEmail.value = "";
    filterType.value = "";
    filterMinAmount.value = "";
    filterMaxAmount.value = "";
    fetchClerkActions();
  });
});
