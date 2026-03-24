import { TrafficCounterService } from '../services/TrafficCounterService'
import { AuthService } from '../services/AuthService'

export class MainClicker {
  private container: HTMLElement
  private counterService: TrafficCounterService
  private authService: AuthService
  private inCount: number = 0
  private outCount: number = 0
  private bagsCount: number = 0
  private notes: string = ''
  private selectedLocation: string = 'pnp'
  private staffName: string = ''
  private session: string = ''
  private syncCountdown: number = 900 // 15 minutes in seconds
  private syncInterval: NodeJS.Timeout | null = null

  constructor(container: HTMLElement) {
    this.container = container
    this.counterService = new TrafficCounterService()
    this.authService = new AuthService()
    this.staffName = this.authService.getStaffName() || 'Staff'
    this.session = this.authService.getSession() || ''
    this.loadCountsFromStorage()
    this.startSyncCountdown()
  }

  private loadCountsFromStorage() {
    // Try to load from localStorage first (session persistence)
    const sessionKey = `session_${this.selectedLocation}_${this.session}`
    const stored = localStorage.getItem(sessionKey)
    
    if (stored) {
      try {
        const data = JSON.parse(stored)
        this.inCount = data.in || 0
        this.outCount = data.out || 0
        this.bagsCount = data.bags || 0
        this.notes = data.notes || ''
        console.log('Loaded counts from localStorage:', data)
        return
      } catch (error) {
        console.error('Failed to parse stored counts:', error)
      }
    }
    
    // Start fresh if no local data
    this.inCount = 0
    this.outCount = 0
    this.bagsCount = 0
    this.notes = ''
  }

  private saveCountsToStorage() {
    const sessionKey = `session_${this.selectedLocation}_${this.session}`
    localStorage.setItem(sessionKey, JSON.stringify({
      in: this.inCount,
      out: this.outCount,
      bags: this.bagsCount,
      notes: this.notes,
      timestamp: Date.now()
    }))
  }

  private startSyncCountdown() {
    if (this.syncInterval) clearInterval(this.syncInterval)
    this.syncCountdown = 900
    this.syncInterval = setInterval(() => {
      this.syncCountdown--
      this.updateCountdownDisplay()
      if (this.syncCountdown <= 0) {
        this.handleAutoSubmit()
      }
    }, 1000)
  }

  private updateCountdownDisplay() {
    const minutes = Math.floor(this.syncCountdown / 60)
    const seconds = this.syncCountdown % 60
    const countdownEl = document.getElementById('syncCountdown')
    if (countdownEl) {
      countdownEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
  }

  private async handleAutoSubmit() {
    console.log('Auto-submitting session data to database...')
    try {
      const result = await this.counterService.submitSession({
        name: this.staffName,
        session: this.session,
        location: this.selectedLocation,
        customer_in: this.inCount,
        customer_out: this.outCount,
        out_with_bags: this.bagsCount,
        notes: this.notes
      })
      console.log('Session data submitted successfully:', result)
      
      // Update last sync time
      const lastSyncEl = document.getElementById('lastSync')
      if (lastSyncEl) {
        const now = new Date()
        lastSyncEl.textContent = `Last auto-sync: ${now.toLocaleTimeString()}`
      }
      
      // Clear localStorage for this session
      const sessionKey = `session_${this.selectedLocation}_${this.session}`
      localStorage.removeItem(sessionKey)
      
      // Show confirmation
      alert(`Session auto-submitted!\nName: ${this.staffName}\nEntries: ${this.inCount}\nExits: ${this.outCount}\nWith Bags: ${this.bagsCount}`)
      
      // Reset counts and restart countdown
      this.inCount = 0
      this.outCount = 0
      this.bagsCount = 0
      this.notes = ''
      this.updateDisplay()
      this.startSyncCountdown()
    } catch (error) {
      console.error('Failed to auto-submit session:', error)
      alert('Auto-submit failed. Retrying in 30 seconds...')
      // Retry after 30 seconds if failed
      setTimeout(() => this.handleAutoSubmit(), 30000)
    }
  }

  private formatSessionDisplay(sessionIso: string): string {
    if (!sessionIso) return 'No session'
    try {
      const date = new Date(sessionIso)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
      const dateNum = date.getDate()
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      return `${dayName} ${dateNum}/${month}, ${year}, ${time}`
    } catch {
      return sessionIso
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="bg-background text-on-surface flex flex-col min-h-screen">
        <!-- TopAppBar -->
        <header class="fixed w-full top-0 z-50 bg-surface-container-low backdrop-blur-md flex justify-between items-center px-6 py-4">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-2xl text-primary">storefront</span>
            <h1 class="text-xl font-bold tracking-tighter text-primary editorial-headline">Retail Traffic</h1>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right text-sm">
              <p class="font-semibold text-on-surface">${this.staffName}</p>
              <p class="text-on-surface-variant text-xs">${this.formatSessionDisplay(this.session)}</p>
            </div>
            <button id="logoutBtn" class="px-4 py-2 bg-secondary text-on-secondary rounded-md font-semibold hover:opacity-90 transition-opacity">
              Logout
            </button>
          </div>
        </header>

        <main class="flex-1 px-4 pt-24 pb-32 max-w-2xl mx-auto w-full space-y-4 overflow-y-auto">
          <!-- Current Session Bento Card -->
          <section class="bg-surface-container-low rounded-3xl p-6 flex flex-col items-center justify-center text-center">
            <p class="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label mb-1">Active Session</p>
            <h2 class="text-2xl font-bold text-on-surface editorial-headline mb-4">${this.formatSessionDisplay(this.session)}</h2>
            <div class="bg-surface-container-lowest p-4 rounded-2xl flex flex-col items-center justify-center min-w-[160px] shadow-sm border border-outline-variant/20">
              <span class="text-xs font-black uppercase tracking-widest text-tertiary mb-1 font-label">Sync Countdown</span>
              <div class="text-4xl font-bold tracking-tighter text-on-surface editorial-headline tabular-nums" id="syncCountdown">15:00</div>
              <div class="w-full bg-surface-container mt-3 h-1.5 rounded-full overflow-hidden">
                <div class="bg-tertiary h-full w-full transition-all" id="syncProgress"></div>
              </div>
            </div>
          </section>

          <!-- Counting Dashboard -->
          <div class="flex flex-col gap-4">
            <!-- Location Select -->
            <div class="bg-surface-container-low rounded-xl p-4">
              <label for="locationSelect" class="block text-sm font-medium mb-2 text-on-surface">Monitoring Location:</label>
              <select id="locationSelect" class="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="pnp">PnP</option>
                <option value="checkers">Checkers</option>
                <option value="walmart">Walmart</option>
              </select>
            </div>

            <!-- People Entering -->
            <div class="bg-surface-container-low rounded-xl p-4 flex flex-col gap-4">
              <div class="flex justify-between items-center px-2">
                <span class="editorial-headline font-bold text-lg text-on-surface">People Entering</span>
                <span class="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label text-xs font-bold">LIVE</span>
              </div>
              <div class="grid grid-cols-3 items-center gap-4">
                <button id="inUndoBtn" class="bg-surface-container-highest text-on-surface-variant h-16 rounded-xl flex items-center justify-center active:scale-95 transition-all hover:bg-surface-container">
                  <span class="material-symbols-outlined text-3xl">remove</span>
                </button>
                <div class="text-center">
                  <span class="editorial-headline text-5xl font-bold text-secondary tabular-nums" id="inCount">${this.inCount}</span>
                </div>
                <button id="inBtn" class="bg-secondary text-on-secondary h-16 rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-secondary/20 hover:opacity-90">
                  <span class="material-symbols-outlined text-3xl">add</span>
                </button>
              </div>
            </div>

            <!-- People Leaving -->
            <div class="bg-surface-container-low rounded-xl p-4 flex flex-col gap-4">
              <div class="flex justify-between items-center px-2">
                <span class="editorial-headline font-bold text-lg text-on-surface">People Leaving Without Bags</span>
              </div>
              <div class="grid grid-cols-3 items-center gap-4">
                <button id="outUndoBtn" class="bg-surface-container-highest text-on-surface-variant h-16 rounded-xl flex items-center justify-center active:scale-95 transition-all hover:bg-surface-container">
                  <span class="material-symbols-outlined text-3xl">remove</span>
                </button>
                <div class="text-center">
                  <span class="editorial-headline text-5xl font-bold text-primary tabular-nums" id="outCount">${this.outCount}</span>
                </div>
                <button id="outBtn" class="bg-primary text-on-primary h-16 rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-primary/20 hover:opacity-90">
                  <span class="material-symbols-outlined text-3xl">add</span>
                </button>
              </div>
            </div>

            <!-- Leaving with Bags -->
            <div class="bg-surface-container-low rounded-xl p-4 flex flex-col gap-4">
              <div class="flex justify-between items-center px-2">
                <div class="flex flex-col">
                  <span class="editorial-headline font-bold text-lg text-on-surface">Leaving with Bags</span>
                  <span class="font-label text-xs text-on-surface-variant">Conversion metric</span>
                </div>
              </div>
              <div class="grid grid-cols-3 items-center gap-4">
                <button id="bagsUndoBtn" class="bg-surface-container-highest text-on-surface-variant h-16 rounded-xl flex items-center justify-center active:scale-95 transition-all hover:bg-surface-container">
                  <span class="material-symbols-outlined text-3xl">remove</span>
                </button>
                <div class="text-center">
                  <span class="editorial-headline text-5xl font-bold text-primary tabular-nums" id="bagsCount">${this.bagsCount}</span>
                </div>
                <button id="bagsBtn" class="bg-primary text-on-primary h-16 rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-primary/20 hover:opacity-90">
                  <span class="material-symbols-outlined text-3xl">add</span>
                </button>
              </div>
            </div>

            <!-- Notes Section -->
            <div class="bg-surface-container-low rounded-xl p-4 flex flex-col gap-4">
              <div class="flex justify-between items-center px-2">
                <div class="flex flex-col">
                  <span class="editorial-headline font-bold text-lg text-on-surface">Notes & Observations</span>
                  <span class="font-label text-xs text-on-surface-variant">Record customer insights</span>
                </div>
              </div>
              <textarea
                id="notesInput"
                class="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Add your thoughts and observations about customers..."
                rows="4"
              >${this.notes}</textarea>
            </div>
          </div>

          <!-- Submit Session Button -->
          <div class="pt-4">
            <button id="submitBtn" class="w-full h-16 bg-primary text-on-primary rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/10 hover:opacity-90 active:scale-[0.98] transition-all">
              <span class="material-symbols-outlined">send</span>
              Submit Session
            </button>
            <p class="text-center mt-4 text-xs font-medium text-on-surface-variant/60 font-label" id="lastSync">
              Last auto-sync: ${new Date().toLocaleTimeString()}
            </p>
          </div>
        </main>

        <!-- BottomNavBar -->
        <nav class="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-surface-container-low/80 backdrop-blur-md z-50 rounded-t-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <a class="flex flex-col items-center justify-center bg-primary text-on-primary rounded-xl px-8 py-2 transition-all active:scale-90">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">analytics</span>
            <span class="font-label text-xs font-bold uppercase tracking-widest mt-1">Count</span>
          </a>
          <a class="flex flex-col items-center justify-center text-on-surface-variant px-8 py-2 transition-all hover:bg-surface-container rounded-xl active:scale-90">
            <span class="material-symbols-outlined">history</span>
            <span class="font-label text-xs font-bold uppercase tracking-widest mt-1">History</span>
          </a>
        </nav>
      </div>
    `

    this.attachEventListeners()
    this.updateCountdownDisplay()
  }

  private attachEventListeners() {
    // Counter buttons
    document.getElementById('inBtn')!.addEventListener('click', () => this.incrementIn())
    document.getElementById('outBtn')!.addEventListener('click', () => this.incrementOut())
    document.getElementById('bagsBtn')!.addEventListener('click', () => this.incrementBags())
    document.getElementById('inUndoBtn')!.addEventListener('click', () => this.decrementIn())
    document.getElementById('outUndoBtn')!.addEventListener('click', () => this.decrementOut())
    document.getElementById('bagsUndoBtn')!.addEventListener('click', () => this.decrementBags())

    // Location select
    document.getElementById('locationSelect')!.addEventListener('change', (e) => {
      this.selectedLocation = (e.target as HTMLSelectElement).value
      this.loadCountsFromStorage()
      this.updateDisplay()
    })

    // Notes input
    document.getElementById('notesInput')!.addEventListener('input', (e) => {
      this.notes = (e.target as HTMLTextAreaElement).value
      this.syncToBackend()
    })

    // Submit button
    document.getElementById('submitBtn')!.addEventListener('click', () => this.submitSession())

    // Logout
    document.getElementById('logoutBtn')!.addEventListener('click', () => {
      this.authService.logout()
      window.location.href = '/login.html'
    })
  }

  private async incrementIn() {
    this.inCount++
    this.updateDisplay()
    this.syncToBackend()
  }

  private async decrementIn() {
    if (this.inCount > 0) {
      this.inCount--
      this.updateDisplay()
      this.syncToBackend()
    }
  }

  private async incrementOut() {
    this.outCount++
    this.updateDisplay()
    this.syncToBackend()
  }

  private async decrementOut() {
    if (this.outCount > 0) {
      this.outCount--
      this.updateDisplay()
      this.syncToBackend()
    }
  }

  private async incrementBags() {
    this.bagsCount++
    this.updateDisplay()
    this.syncToBackend()
  }

  private async decrementBags() {
    if (this.bagsCount > 0) {
      this.bagsCount--
      this.updateDisplay()
      this.syncToBackend()
    }
  }

  private updateDisplay() {
    // Update just the numbers on the page without full re-render
    const inCountEl = document.getElementById('inCount')
    const outCountEl = document.getElementById('outCount')
    const bagsCountEl = document.getElementById('bagsCount')
    
    if (inCountEl) inCountEl.textContent = String(this.inCount)
    if (outCountEl) outCountEl.textContent = String(this.outCount)
    if (bagsCountEl) bagsCountEl.textContent = String(this.bagsCount)
  }

  private syncToBackend() {
    // Just save to localStorage - actual sync happens every 15 minutes with handleAutoSubmit
    this.saveCountsToStorage()
  }

  private async submitSession() {
    try {
      const result = await this.counterService.submitSession({
        name: this.staffName,
        session: this.session,
        location: this.selectedLocation,
        customer_in: this.inCount,
        customer_out: this.outCount,
        out_with_bags: this.bagsCount,
        notes: this.notes
      })
      
      alert(`Session submitted!\nEntries: ${this.inCount}\nExits: ${this.outCount}\nWith Bags: ${this.bagsCount}`)
      
      // Clear localStorage
      const sessionKey = `session_${this.selectedLocation}_${this.session}`
      localStorage.removeItem(sessionKey)
      
      // Reset and restart
      this.inCount = 0
      this.outCount = 0
      this.bagsCount = 0
      this.notes = ''
      this.updateDisplay()
      this.render()
      this.startSyncCountdown()
    } catch (error: any) {
    console.error('Failed to submit session:', error)
    alert(`Failed to submit session: ${error.message}`)
  }
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
  }
}
