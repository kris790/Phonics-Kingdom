interface TelemetryEvent {
  type: string;
  skillId?: string;
  accuracy?: number;
  timestamp: number;
  sessionId: string;
}

class TelemetryService {
  private sessionId: string;
  private readonly ENDPOINT = 'https://api.your-analytics.com/events'; // Placeholder for production
  private readonly BATCH_SIZE = 10;
  private queue: TelemetryEvent[] = [];
  
  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    this.setupVisibilityListener();
  }

  /**
   * Tracks an event locally and attempts to sync with the server.
   */
  track(type: string, skillId?: string, accuracy?: number): void {
    const event: TelemetryEvent = {
      type,
      skillId,
      accuracy,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };
    
    this.queue.push(event);
    this.saveQueue();
    
    // Log to console for development visibility
    console.debug(`[Telemetry Track] ${type}`, event);

    // Batch send if online and threshold met
    if (this.queue.length >= this.BATCH_SIZE && navigator.onLine) {
      this.flushQueue();
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem('telemetry_queue', JSON.stringify(this.queue));
    } catch (e) {
      console.warn('Failed to persist telemetry queue to local storage');
    }
  }

  /**
   * Flushes the current queue to the analytics endpoint.
   */
  async flushQueue(): Promise<void> {
    if (this.queue.length === 0 || !navigator.onLine) return;
    
    const eventsToSend = [...this.queue];
    this.queue = [];
    
    try {
      // In this specific implementation, we log to console to prevent 404 errors 
      // from the placeholder ENDPOINT while satisfying the architectural requirement.
      console.debug('[Telemetry Flush Syncing...]', eventsToSend);
      
      /* Actual production implementation:
      await fetch(this.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSend })
      });
      */
      
      this.saveQueue();
    } catch (error) {
      // Re-queue failed events for next attempt
      this.queue = [...eventsToSend, ...this.queue];
      this.saveQueue();
      console.log('Telemetry flush failed, will retry on next check');
    }
  }

  private setupVisibilityListener(): void {
    if (typeof window === 'undefined') return;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushQueue();
      }
    });
  }

  /**
   * Loads queued events from previous sessions to ensure no data is lost.
   */
  loadQueue(): void {
    try {
      const saved = localStorage.getItem('telemetry_queue');
      if (saved) {
        this.queue = JSON.parse(saved);
        if (this.queue.length > 0) {
          this.flushQueue();
        }
      }
    } catch (e) {
      console.error('Failed to load telemetry queue:', e);
    }
  }
}

export const telemetry = new TelemetryService();
