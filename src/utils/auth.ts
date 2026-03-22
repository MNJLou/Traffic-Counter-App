export function initializeApp() {
  // Check for authentication token
  const token = localStorage.getItem('authToken')
  
  if (!token && !window.location.pathname.includes('login')) {
    window.location.href = '/login.html'
  }
}

export function getCurrentUser() {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export function setUser(user: any) {
  localStorage.setItem('user', JSON.stringify(user))
}

export function removeUser() {
  localStorage.removeItem('user')
  localStorage.removeItem('authToken')
}
