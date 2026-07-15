/* ==========================================================================
   Navbar & Discrete Variation Search Bar Component
   ========================================================================== */

const NavbarComponent = {
  init() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-submit-btn');

    if (searchForm && searchInput) {
      searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSearch(searchInput.value);
      });

      if (searchBtn) {
        searchBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          await this.handleSearch(searchInput.value);
        });
      }
    }

    this.updatePendingCounter();
  },

  async handleSearch(queryStr) {
    if (!queryStr || !queryStr.trim()) return;

    const btn = document.getElementById('search-submit-btn');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) btn.innerHTML = `<span>⏳</span> Querying Vault...`;

    try {
      const result = await API.search(queryStr);

      if (result.status === 'hit' && result.results.length > 0) {
        // Hit Logic: Book is found!
        const match = result.results[0];
        showTelegramToast(
          "LEDGER MATCH LOCATED",
          `Found "${match.title}" by ${match.author} in active stock. Opening vault notes...`,
          "📚"
        );
        // Open the matched book in the two-page ledger
        if (typeof LedgerModalComponent !== 'undefined') {
          LedgerModalComponent.open(match);
        }
      } else {
        // Miss Logic (Automation Hook): Book is not found!
        if (typeof MissModalComponent !== 'undefined') {
          MissModalComponent.open(result.query, result.log);
        } else {
          showTelegramToast(
            "ITEM NOT CURRENTLY IN STOCK",
            "Your discrete requisition has been filed in the Blackwater ledger.",
            "📜"
          );
        }
        await this.updatePendingCounter();
      }
    } catch (err) {
      console.error("Search error:", err);
      showTelegramToast("TELEGRAM ERROR", "Failed to communicate with Blackwater vault.", "⚠️");
    } finally {
      if (btn) btn.innerHTML = originalText || `<span>🔍</span> Query Ledger`;
    }
  },

  async updatePendingCounter() {
    try {
      const badge = document.getElementById('header-pending-badge');
      if (!badge) return;

      const logs = await API.getSearchLogs();
      const pendingCount = logs.filter(l => l.status === 'Pending').length;

      if (pendingCount > 0) {
        badge.textContent = pendingCount;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    } catch (e) {
      // Ignore if not on admin or api error
    }
  }
};
