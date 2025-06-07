
    async function loadTransactionHistory() {
      try {
        const response = await fetch("/auth/transactions");
        const data = await response.json();

        if (!data.success) {
          alert("Failed to load transactions: " + (data.message || "Unknown error"));
          return;
        }

        const tbody = document.getElementById("transactionTableBody");
        tbody.innerHTML = ""; 

        if (data.transactions.length === 0) {
          tbody.innerHTML = `<tr><td colspan="4">No transactions found.</td></tr>`;
          return;
        }

        data.transactions.forEach((tx) => {
          const row = document.createElement("tr");

          
          const isSent = tx.transactionType === "Sent";
          const name = isSent ? tx.recipientName : tx.senderName;
          const email = isSent ? tx.recipientEmail : tx.senderEmail;
          const amountDisplay = isSent ? `- Rs. ${tx.amount}` : `+ Rs. ${tx.amount}`;
          const color = isSent ? "red" : "green";

          row.innerHTML = `
            <td>${name}</td>
            <td>${email}</td>
            <td style="color: ${color}; font-weight: bold;">${amountDisplay}</td>
            <td>${tx.transactionType}</td>
          `;

          tbody.appendChild(row);
        });
      } catch (error) {
        console.error("Error fetching transactions:", error);
        alert("Error loading transactions. Check console.");
      }
    }

    
    document.addEventListener("DOMContentLoaded", loadTransactionHistory);
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

