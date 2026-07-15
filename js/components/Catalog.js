/* ==========================================================================
   Catalog Grid Component
   ========================================================================== */

const CatalogComponent = {
  books: [],
  currentGenre: 'All Volumes',

  async init() {
    this.setupTabs();
    await this.loadAndRender();
  },

  setupTabs() {
    const tabsContainer = document.getElementById('filter-tabs');
    if (!tabsContainer) return;

    const tabButtons = tabsContainer.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        this.currentGenre = btn.getAttribute('data-genre') || 'All Volumes';
        await this.loadAndRender();
      });
    });
  },

  async loadAndRender() {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;

    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0; font-family: var(--font-mono-ledger); color: var(--accent-lavender);">
      Retrieving cataloged volumes from the Blackwater vaults...
    </div>`;

    try {
      this.books = await API.getBooks(this.currentGenre);
      this.renderGrid();
    } catch (err) {
      console.error("Error loading catalog:", err);
      grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0; color: var(--stamp-crimson);">
        ⚠️ Failed to retrieve volumes from the ledger database. Please ensure the backend server is active.
      </div>`;
    }
  },

  renderGrid() {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;

    if (this.books.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0; font-family: var(--font-body-vintage); font-size: 1.3rem; color: var(--ledger-paper);">
        No volumes currently listed under "${this.currentGenre}". Use the ledger search above to file a requisition!
      </div>`;
      return;
    }

    grid.innerHTML = this.books.map((book, index) => {
      const stockClass = book.stockStatus === 'In Stock' ? 'in-stock' : '';
      return `
        <article class="book-card fade-in" style="animation-delay: ${index * 0.06}s" onclick="CatalogComponent.handleCardClick(${book.id})">
          <div class="book-cover-container">
            <span class="genre-tag">${book.genre}</span>
            <img src="${book.coverImageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'}" alt="${book.title}" class="book-cover" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'"/>
            <span class="stock-stamp-card ${stockClass}">${book.stockStatus || 'IN STOCK'}</span>
          </div>
          <div class="book-card-content">
            <div>
              <h3 class="book-card-title">${book.title}</h3>
              <p class="book-card-author">by ${book.author}</p>
            </div>
            <div class="book-card-footer">
              <span class="book-price">$${parseFloat(book.price || 14.50).toFixed(2)} GOLD</span>
              <span class="ledger-prompt">📖 Inspect Ledger</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  },

  handleCardClick(id) {
    const book = this.books.find(b => b.id === id);
    if (book && typeof LedgerModalComponent !== 'undefined') {
      LedgerModalComponent.open(book);
    }
  }
};
