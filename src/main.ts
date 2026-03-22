import './styles/main.css'
import { MainClicker } from './pages/MainClicker'
import { initializeApp } from './utils/auth'

// Check if user is authenticated
const isAuthenticated = localStorage.getItem('authToken')

if (!isAuthenticated) {
  window.location.href = '/login.html'
} else {
  const app = document.getElementById('app')!
  const mainClicker = new MainClicker(app)
  mainClicker.render()
}
