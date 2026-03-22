import { AuthService } from '../services/AuthService'

const STAFF_MEMBERS = [
  'John Smith',
  'Sarah Johnson',
  'Mike Wilson',
  'Emma Davis',
  'Chris Brown',
  'Lisa Anderson',
  'David Martinez'
]

// Generate session slots for next 7 days
function generateSessionSlots(): { label: string; value: string }[] {
  const slots = []
  const now = new Date()
  
  for (let day = 0; day < 7; day++) {
    const date = new Date(now)
    date.setDate(date.getDate() + day)
    
    for (let hour = 8; hour <= 20; hour += 2) {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
      const dateNum = date.getDate()
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      const timeStr = `${String(hour).padStart(2, '0')}:00`
      
      const label = `${dayName} ${dateNum}/${month}, ${year}, ${timeStr}`
      const value = date.toISOString().split('T')[0] + `T${String(hour).padStart(2, '0')}:00`
      
      slots.push({ label, value })
    }
  }
  
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
