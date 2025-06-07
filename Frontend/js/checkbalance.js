    document.addEventListener('DOMContentLoaded', function() {
      let isBalanceVisible = false; 
      const balanceText = document.getElementById('balanceValue');
      const toggleBtn = document.getElementById('toggleBalance');
      const icon = toggleBtn.querySelector('i');

      fetch('/auth/users', {
        method: 'GET',
        credentials: 'include'
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(response.status === 401 ? "Not authenticated" : "Server error");
        }
        return response.json();
      })
      .then(data => {
        if (data.name) {
          document.getElementById("username-tagline").textContent = data.name;
        } else {
          window.location.href = '/index.html';
        }
      })
      .catch(err => {
        console.error("User fetch error:", err);
        document.getElementById("username-tagline").textContent = "Error";
      });
      fetch('/auth/balance', {
        method: 'GET',
        credentials: 'include'
      })
      .then(response => {
        if (!response.ok) throw new Error("Failed to load balance");
        return response.json();
      })
      .then(data => {

        const formattedBalance = new Intl.NumberFormat('en-IN').format(data.balance);
        balanceText.dataset.originalValue = formattedBalance;
      })
      .catch(error => {
        console.error("Balance fetch error:", error);
        balanceText.textContent = "Error";
      });


        fetch('/auth/bank_id', {
    method: 'GET',
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(response.status === 401 ? "Not authenticated" : "Server error");
    }
    return response.json();
  })
  .then(data => {
    if (data.bank_id) {
      document.getElementById("bankId").textContent = data.bank_id;
    } else {
      window.location.href = '/index.html';
    }
  })
  .catch(err => {
    console.error("Bank ID fetch error:", err);
    document.getElementById("bankId").textContent = "Error";
  });

      toggleBtn.addEventListener('click', function() {
        isBalanceVisible = !isBalanceVisible;
        
        if (isBalanceVisible) {

          balanceText.textContent = balanceText.dataset.originalValue || "0.00";
          icon.classList.replace('bi-eye', 'bi-eye-slash');
        } else {

          balanceText.textContent = '••••••';
          icon.classList.replace('bi-eye-slash', 'bi-eye');
        }
      });
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


