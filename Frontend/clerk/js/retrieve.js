document.addEventListener("DOMContentLoaded", () => {
  // Dark mode toggle setup
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

  // Transfer form submission handler
  document.getElementById('transferForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('recipientUsername').value;
    const idOrEmail = document.getElementById('recipientIdOrEmail').value.trim();
    let amount = document.getElementById('amountSelect').value;

    if (!idOrEmail) {
      alert("Please enter recipient's bank ID or email");
      return;
    }

    if (amount === 'custom') {
      amount = document.getElementById('customAmount').value;
      if (!amount || amount <= 0) {
        alert('Please enter a valid custom amount');
        return;
      }
    }

    let payload = { username, amount: Number(amount) };

    if (idOrEmail.includes('@')) {
      payload.email = idOrEmail;
    } else {
      payload.bank_id = idOrEmail;
    }

    try {
      const res = await fetch('/auth/retrieve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert('Retrieval successful!');
        this.reset();
        document.getElementById('customAmountGroup').style.display = 'none';
        document.getElementById('customAmount').required = false;
      } else {
        alert('Retrieval failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
});
