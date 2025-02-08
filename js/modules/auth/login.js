// Toggle password visibility
document
  .querySelector('.toggle-password')
  .addEventListener('click', function () {
    const passwordInput = document.getElementById('password')
    const icon = this.querySelector('i')

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text'
      icon.classList.remove('fa-eye')
      icon.classList.add('fa-eye-slash')
    } else {
      passwordInput.type = 'password'
      icon.classList.remove('fa-eye-slash')
      icon.classList.add('fa-eye')
    }
  })

// Add floating label behavior
document.querySelectorAll('.input-container input').forEach(input => {
  input.addEventListener('focus', () => {
    input.parentElement.classList.add('focused')
  })

  input.addEventListener('blur', () => {
    if (!input.value) {
      input.parentElement.classList.remove('focused')
    }
  })

  // Check initial state
  if (input.value) {
    input.parentElement.classList.add('focused')
  }
})

// Add loading state to login button
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault()
  const button = this.querySelector('.login-button')
  button.classList.add('loading')

  // Simulate loading state
  setTimeout(() => {
    button.classList.remove('loading')
    button.classList.add('success')

    // Reset after animation
    setTimeout(() => {
      button.classList.remove('success')
    }, 2000)
  }, 2000)
})
