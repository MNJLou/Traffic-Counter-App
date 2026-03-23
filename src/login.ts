// login.ts  (new file in src/)
import './styles/main.css'
import { LoginPage } from './pages/LoginPage'

const app = document.getElementById('app')!
const loginPage = new LoginPage(app)
loginPage.render()