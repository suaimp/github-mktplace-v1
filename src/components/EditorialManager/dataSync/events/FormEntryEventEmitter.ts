/**
 * Event emitter for form entry data synchronization
 * Manages event emission and listener registration with single responsibility
 */

import { FormEntryUpdateEvent, TableRefreshListener } from '../types/dataSyncTypes';

export class FormEntryEventEmitter {
  private listeners: Map<string, TableRefreshListener> = new Map();
  private eventHistory: FormEntryUpdateEvent[] = [];
  private maxHistorySize = 100;

  /**
   * Adds a listener for form entry update events
   */
  addListener(listener: TableRefreshListener): () => void {
    this.listeners.set(listener.id, listener);
    
    console.log(
      `📡 [FormEntryEventEmitter] Listener added: ${listener.id} for form: ${listener.formId || 'ALL'}`
    );

    // Return unsubscribe function
    return () => this.removeListener(listener.id);
  }

  /**
   * Removes a listener by ID
   */
  removeListener(listenerId: string): void {
    const removed = this.listeners.delete(listenerId);
    
    if (removed) {
      console.log(`📡 [FormEntryEventEmitter] Listener removed: ${listenerId}`);
    }
  }

  /**
   * Emits a form entry update event to all relevant listeners
   */
  async emitEvent(event: FormEntryUpdateEvent): Promise<void> {
    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    console.log(
      `🚀 [FormEntryEventEmitter] Emitting event: ${event.type} for entry: ${event.entryId} in form: ${event.formId}`
    );

    // Get relevant listeners (either listening to this specific form or all forms)
    const relevantListeners = Array.from(this.listeners.values()).filter(
      listener => !listener.formId || listener.formId === event.formId
    );

    // Sort by priority (higher numbers first)
    relevantListeners.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    console.log(
      `📡 [FormEntryEventEmitter] Found ${relevantListeners.length} relevant listeners`
    );

    // Execute listeners
    const promises = relevantListeners.map(async (listener) => {
      try {
        console.log(`🔄 [FormEntryEventEmitter] Executing listener: ${listener.id}`);
        await Promise.resolve(listener.callback(event));
        console.log(`✅ [FormEntryEventEmitter] Listener executed successfully: ${listener.id}`);
      } catch (error) {
        console.error(
          `❌ [FormEntryEventEmitter] Error executing listener ${listener.id}:`,
          error
        );
        // Don't throw - one failing listener shouldn't break others
      }
    });

    // Wait for all listeners to complete
    await Promise.allSettled(promises);
    
    console.log(
      `✅ [FormEntryEventEmitter] Event emission completed for: ${event.type}`
    );
  }

  /**
   * Gets all active listeners
   */
  getActiveListeners(): TableRefreshListener[] {
    return Array.from(this.listeners.values());
  }

  /**
   * Gets event history
   */
  getEventHistory(): FormEntryUpdateEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Gets statistics about the event emitter
   */
  getStats() {
    const lastEvent = this.eventHistory[this.eventHistory.length - 1];
    
    return {
      totalListeners: this.listeners.size,
      activeListeners: this.listeners.size,
      eventCount: this.eventHistory.length,
      lastEventTimestamp: lastEvent?.timestamp
    };
  }

  /**
   * Clears all listeners and history
   */
  clear(): void {
    this.listeners.clear();
    this.eventHistory = [];
    console.log(`🧹 [FormEntryEventEmitter] Cleared all listeners and history`);
  }
}
