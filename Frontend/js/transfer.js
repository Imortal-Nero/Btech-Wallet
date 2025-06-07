  document.getElementById('amountSelect').addEventListener('change', function () {
    const customGroup = document.getElementById('customAmountGroup');
    if (this.value === 'custom') {
      customGroup.style.display = 'block';
      document.getElementById('customAmount').required = true;
    } else {
      customGroup.style.display = 'none';
      document.getElementById('customAmount').required = false;
    }
  });


  
  document.getElementById('transferForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('recipientUsername').value;
    const email = document.getElementById('recipientEmail').value;
    let amount = document.getElementById('amountSelect').value;

    if (amount === 'custom') {
      amount = document.getElementById('customAmount').value;
      if (!amount || amount <= 0) {
        alert('Please enter a valid custom amount');
        return;
      }
    }

    try {
      const res = await fetch('/auth/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, amount: Number(amount) })
      });
      const data = await res.json();

      if (data.success) {
        alert('Transfer successful!');
        this.reset();
        document.getElementById('customAmountGroup').style.display = 'none';
        document.getElementById('customAmount').required = false;
      } else {
        alert('Transfer failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
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

