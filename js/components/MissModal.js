/* ==========================================================================
   Discrete Variation Miss Requisition Telegram Modal Component
   ========================================================================== */

const MissModalComponent = {
  init() {
    const modal = document.getElementById('miss-modal');
    const closeBtn = document.getElementById('close-miss-btn');
    const ackBtn = document.getElementById('miss-acknowledge-btn');

    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (ackBtn) ackBtn.addEventListener('click', () => this.close());

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.close();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        this.close();
      }
    });
  },

  open(queryStr, logEntry) {
    const modal = document.getElementById('miss-modal');
    if (!modal) return;

    const queryDisplay = document.getElementById('miss-query-text');
    if (queryDisplay) {
      queryDisplay.textContent = `"${queryStr || 'Discrete Variation Query'}"`;
    }

    const timestampDisplay = document.getElementById('miss-timestamp');
    if (timestampDisplay) {
      const now = logEntry && logEntry.timestamp ? new Date(logEntry.timestamp) : new Date();
      timestampDisplay.textContent = now.toISOString().split('T')[0];
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  close() {
    const modal = document.getElementById('miss-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
};
