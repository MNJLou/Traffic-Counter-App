import { AuthService } from '../services/AuthService'

const STAFF_MEMBERS = [
  'Unarine',
  'Masego',
  'Nicole',
  'Driya',
  'Kamogelo',
  'Katlego',
  'Jerome'
]

// Generate session slots - 2 fixed sessions
function generateSessionSlots(): { label: string; value: string }[] {
  const slots = []
  
  // Session 1: Wednesday 25 March 4:00 pm - 6:00 pm
  const wed25 = new Date(2026, 2, 25, 16, 0) // March 25, 2026, 4:00 PM
  const label1 = `Wednesday 25/3, 2026, 16:00`
  const value1 = '2026-03-25T16:00'
  slots.push({ label: label1, value: value1 })
  
  // Session 2: Saturday 28 March 11:00 am - 1:00 pm
  const sat28 = new Date(2026, 2, 28, 11, 0) // March 28, 2026, 11:00 AM
  const label2 = `Saturday 28/3, 2026, 11:00`
  const value2 = '2026-03-28T11:00'
  slots.push({ label: label2, value: value2 })
  
  return slots
}

export class LoginPage {
  private container: HTMLElement
  private authService: AuthService

  constructor(container: HTMLElement) {
    this.container = container
    this.authService = new AuthService()
  }

  render() {
    const sessionSlots = generateSessionSlots()
    const staffOptions = STAFF_MEMBERS.map(name => `<option value="${name}">${name}</option>`).join('')
    const sessionOptions = sessionSlots.map(slot => `<option value="${slot.value}">${slot.label}</option>`).join('')

    this.container.innerHTML = `
      <div class="w-full max-w-md mx-auto p-6">
        <div class="card">
          <div class="flex justify-center mb-8">
            <span class="material-symbols-outlined text-5xl text-primary">storefront</span>
          </div>
          
          <h1 class="editorial-headline text-center mb-2 text-primary">Retail Traffic Monitor</h1>
          <p class="text-center text-on-surface-variant text-sm mb-8">Select staff and session</p>

          <form id="loginForm" class="space-y-4">
            <div>
              <label for="staffSelect" class="block text-sm font-medium mb-2">Staff Member</label>
              <select 
                id="staffSelect" 
                name="staff" 
                class="input-field"
                required
              >
                <option value="">-- Select a staff member --</option>
                ${staffOptions}
              </select>
            </div>

            <div>
              <label for="sessionSelect" class="block text-sm font-medium mb-2">Session</label>
              <select 
                id="sessionSelect" 
                name="session" 
                class="input-field"
                required
              >
                <option value="">-- Select a session --</option>
                ${sessionOptions}
              </select>
            </div>

            <button 
              type="submit" 
              class="btn-primary w-full"
            >
              Start Monitoring
            </button>
          </form>

          <div id="errorMessage" class="hidden mt-4 p-3 bg-error-container text-error border border-error rounded-md text-sm"></div>
        </div>
      </div>
    `

    const form = document.getElementById('loginForm') as HTMLFormElement
    const errorMessage = document.getElementById('errorMessage')!

    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const staff = (document.getElementById('staffSelect') as HTMLSelectElement).value
      const session = (document.getElementById('sessionSelect') as HTMLSelectElement).value

      try {
        await this.authService.quickLogin(staff, session)
        window.location.href = '/index.html'
      } catch (error: any) {
        errorMessage.textContent = error.message || 'Selection failed'
        errorMessage.classList.remove('hidden')
      }
    })
  }
}
