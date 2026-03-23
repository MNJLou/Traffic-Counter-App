import './styles/main.css'
import { LoginPage } from './pages/LoginPage'

const app = document.getElementById('login-app')!  // ← was 'app', now 'login-app'
const loginPage = new LoginPage(app)
loginPage.render()