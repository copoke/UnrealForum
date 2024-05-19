document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('Email').value;

    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, email})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/login.html';
        } else {
            alert('Sign-Up failed: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});