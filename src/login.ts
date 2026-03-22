import './styles/main.css'
import { LoginPage } from './pages/LoginPage'

const loginApp = document.getElementById('login-app')!
const loginPage = new LoginPage(loginApp)
loginPage.render()
