/* ==========================================================================
   Blackwater & Co. API Client Module
   ========================================================================== */

const API = {
  async getBooks(genre = null) {
    let url = '/api/books';
    if (genre && genre !== 'All Volumes') {
      url += `?genre=${encodeURIComponent(genre)}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch books');
    return await res.json();
  },

  async getBookById(id) {
    const res = await fetch(`/api/books/${id}`);
    if (!res.ok) throw new Error('Failed to fetch book');
    return await res.json();
  },

  async createBook(bookData) {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create book');
    }
    return await res.json();
  },

  async updateBook(id, bookData) {
    const res = await fetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update book');
    }
    return await res.json();
  },

  async deleteBook(id) {
    const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete book');
    return await res.json();
  },

  async search(queryStr) {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: queryStr })
    });
    if (!res.ok) throw new Error('Search failed');
    return await res.json();
  },

  async getSearchLogs() {
    const res = await fetch('/api/admin/logs');
    if (!res.ok) throw new Error('Failed to fetch search logs');
    return await res.json();
  },

  async updateSearchLogStatus(id, status) {
    const res = await fetch(`/api/admin/logs/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update search log status');
    return await res.json();
  },

  listenForAlerts(onAlert) {
    try {
      const eventSource = new EventSource('/api/admin/notifications/stream');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onAlert(data);
        } catch (e) {
          console.error("Error parsing SSE data:", e);
        }
      };
      eventSource.onerror = () => {
        console.warn("EventSource disconnected, reconnecting handled by browser or polling fallback.");
      };
      return eventSource;
    } catch (e) {
      console.warn("EventSource not supported:", e);
      return null;
    }
  }
};

// Global toast helper for RDR2 style notifications
function showTelegramToast(title, message, icon = '📜') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'telegram-toast';
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <h4>${title}</h4>
      <p>${message}</p>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 6000);
}
