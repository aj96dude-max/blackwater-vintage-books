/* ==========================================================================
   Two-Page Leather-Bound Ledger Reading Modal Component
   ========================================================================== */

const LedgerModalComponent = {
  init() {
    const modal = document.getElementById('ledger-modal');
    const closeBtn = document.getElementById('close-ledger-btn');
    const footerBtn = document.getElementById('ledger-close-footer-btn');

    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (footerBtn) footerBtn.addEventListener('click', () => this.close());

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

  open(book) {
    if (!book) return;

    const modal = document.getElementById('ledger-modal');
    if (!modal) return;

    // Populate Left Page
    document.getElementById('ledger-cat-id').textContent = `#CAT-1899-${String(book.id || 1).padStart(3, '0')}`;
    const coverImg = document.getElementById('ledger-cover');
    if (coverImg) {
      coverImg.src = book.coverImageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800';
      coverImg.alt = book.title;
    }

    const stamp = document.getElementById('ledger-stamp');
    if (stamp) {
      stamp.textContent = (book.stockStatus || 'IN STOCK').toUpperCase();
      if (book.stockStatus === 'Out of Stock') {
        stamp.style.color = '#8B2626';
        stamp.style.borderColor = '#8B2626';
        stamp.style.background = 'rgba(139, 38, 38, 0.08)';
      } else if (book.stockStatus === 'Reserved') {
        stamp.style.color = '#7D6323';
        stamp.style.borderColor = '#7D6323';
        stamp.style.background = 'rgba(199, 161, 74, 0.15)';
      } else {
        stamp.style.color = '#2D6B3F';
        stamp.style.borderColor = '#2D6B3F';
        stamp.style.background = 'rgba(45, 107, 63, 0.08)';
      }
    }

    document.getElementById('ledger-author').textContent = book.author || 'Unknown Author';
    document.getElementById('ledger-genre').textContent = book.genre || 'General Archive';
    document.getElementById('ledger-price').textContent = `$${parseFloat(book.price || 14.50).toFixed(2)} GOLD`;

    // Populate Right Page
    document.getElementById('ledger-title').textContent = book.title || 'Untitled Volume';
    document.getElementById('ledger-sub-author').textContent = `Volume Chronicle by ${book.author}`;
    
    // Format excerpt with drop cap styling
    const excerptElem = document.getElementById('ledger-excerpt');
    if (excerptElem) {
      excerptElem.textContent = book.excerpt || 'From Chapter One: The shadows stretched long across the western horizon as the first bells of evening sounded through the town square...';
    }

    const descElem = document.getElementById('ledger-description');
    if (descElem) {
      descElem.textContent = book.description || 'A remarkable vintage volume cataloged and preserved in the rare manuscripts archive of Blackwater & Co.';
    }

    // Activate modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  close() {
    const modal = document.getElementById('ledger-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
};
