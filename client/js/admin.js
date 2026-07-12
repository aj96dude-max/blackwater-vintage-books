/* ==========================================================================
   Admin Portal Controller (admin.js)
   ========================================================================== */

let activeTab = 'inventory';

document.addEventListener('DOMContentLoaded', async () => {
  console.log("❖ Blackwater & Co. Proprietor's CMS Deck Initialized ❖");

  await loadInventory();
  await loadSearchLogs();

  // Listen for real-time discrete variation requisitions
  API.listenForAlerts(async (alert) => {
    console.log("Admin received live requisition alert:", alert);
    showTelegramToast(
      "NEW REQUISITION FILED",
      `Query: "${alert.query}" (Count: ${alert.requestCount}x). Action required in Discrete Variation logs!`,
      "🔔"
    );
    await loadSearchLogs();
  });
});

function switchAdminTab(tabName) {
  activeTab = tabName;
  const invBtn = document.getElementById('tab-inventory-btn');
  const logsBtn = document.getElementById('tab-logs-btn');
  const invSection = document.getElementById('section-inventory');
  const logsSection = document.getElementById('section-logs');

  if (tabName === 'inventory') {
    if (invBtn) invBtn.classList.add('active');
    if (logsBtn) logsBtn.classList.remove('active');
    if (invSection) invSection.classList.add('active');
    if (logsSection) logsSection.classList.remove('active');
    loadInventory();
  } else {
    if (invBtn) invBtn.classList.remove('active');
    if (logsBtn) logsBtn.classList.add('active');
    if (invSection) invSection.classList.remove('active');
    if (logsSection) logsSection.classList.add('active');
    loadSearchLogs();
  }
}

async function loadInventory() {
  const tbody = document.getElementById('inventory-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading inventory volumes...</td></tr>`;

  try {
    const books = await API.getBooks();
    if (books.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2.5rem;">No volumes in catalog. Click 'Add New Volume' above!</td></tr>`;
      return;
    }

    tbody.innerHTML = books.map(b => {
      const pillClass = b.stockStatus === 'In Stock' ? 'in-stock' : (b.stockStatus === 'Out of Stock' ? 'out-of-stock' : 'pending');
      return `
        <tr>
          <td style="font-family: var(--font-mono-ledger); font-weight: bold;">#${b.id}</td>
          <td>
            <img src="${b.coverImageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'}" alt="${b.title}" style="width: 48px; height: 68px; object-fit: cover; border: 1px solid #1C152A;" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'"/>
          </td>
          <td>
            <strong style="font-family: var(--font-header-western); font-size: 1.15rem; color: var(--ledger-ink); display: block;">${b.title}</strong>
            <span style="font-style: italic; color: var(--ledger-ink-light);">by ${b.author}</span>
          </td>
          <td><span style="font-family: var(--font-mono-ledger); font-size: 0.88rem; background: #E5DCCA; padding: 0.3rem 0.6rem; border-radius: 4px;">${b.genre}</span></td>
          <td style="font-family: var(--font-mono-ledger); font-weight: bold; color: var(--stamp-crimson);">$${parseFloat(b.price || 14.50).toFixed(2)}</td>
          <td><span class="status-pill ${pillClass}">${b.stockStatus || 'In Stock'}</span></td>
          <td style="text-align: right; white-space: nowrap;">
            <button class="btn-western" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; margin-right: 0.4rem;" onclick='openEditBookModal(${JSON.stringify(b).replace(/'/g, "&#39;")})'>✏️ Edit</button>
            <button class="btn-western btn-crimson" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="deleteBookItem(${b.id}, '${b.title.replace(/'/g, "\\'")}')">🗑️ Delete</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error("Error loading inventory:", err);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--stamp-crimson); padding: 2rem;">Error loading catalog. Is backend server running?</td></tr>`;
  }
}

async function loadSearchLogs() {
  const tbody = document.getElementById('search-logs-tbody');
  if (!tbody) return;

  try {
    const logs = await API.getSearchLogs();
    
    // Update badge counters
    const pendingCount = logs.filter(l => l.status === 'Pending').length;
    const tabCounter = document.getElementById('tab-logs-counter');
    const headerCounter = document.getElementById('header-pending-badge');
    if (tabCounter) tabCounter.textContent = pendingCount;
    if (headerCounter) {
      headerCounter.textContent = pendingCount;
      headerCounter.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }

    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2.5rem;">No discrete variation search queries recorded yet. Try searching for a missing volume on the storefront!</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map(log => {
      const statusPill = log.status === 'Added' 
        ? `<span class="status-pill added">ADDED TO CATALOG</span>` 
        : (log.status === 'Ignored' 
           ? `<span class="status-pill out-of-stock">IGNORED</span>` 
           : `<span class="status-pill pending">PENDING REVIEW</span>`);

      const actionButtons = log.status === 'Pending'
        ? `<button class="btn-western btn-gold" style="padding: 0.45rem 1rem; font-size: 0.85rem;" onclick="quickAddBookFromLog('${log.queryString.replace(/'/g, "\\'")}', ${log.id})">⚡ Requisition & Add to Catalog</button>
           <button class="btn-western" style="padding: 0.45rem 0.8rem; font-size: 0.85rem; margin-left: 0.4rem;" onclick="updateSearchLogItemStatus(${log.id}, 'Ignored')">✕ Ignore</button>`
        : (log.status === 'Added' 
           ? `<span style="font-family: var(--font-mono-ledger); font-size: 0.85rem; color: #2D6B3F;">✓ Available in Storefront</span>` 
           : `<button class="btn-western" style="padding: 0.35rem 0.7rem; font-size: 0.8rem;" onclick="updateSearchLogItemStatus(${log.id}, 'Pending')">↩ Reopen Requisition</button>`);

      return `
        <tr>
          <td>
            <strong style="font-family: var(--font-mono-ledger); font-size: 1.12rem; color: var(--ledger-ink); display: block;">"${log.queryString}"</strong>
          </td>
          <td>
            <span style="font-family: var(--font-mono-ledger); font-weight: bold; background: #D6CAB4; padding: 0.35rem 0.75rem; border-radius: 12px; font-size: 0.95rem;">
              ${log.requestCount}x Queried
            </span>
          </td>
          <td style="font-family: var(--font-mono-ledger); font-size: 0.9rem; color: var(--ledger-ink-light);">
            ${new Date(log.timestamp).toLocaleString()}
          </td>
          <td>${statusPill}</td>
          <td style="text-align: right; white-space: nowrap;">${actionButtons}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error("Error loading search logs:", err);
  }
}

// 1-Click Quick Add Workflow from a discrete variation search log!
function quickAddBookFromLog(queryStr, logId) {
  openCreateBookModal(queryStr);
  showTelegramToast("PRE-FILLED FROM LEDGER", `Pre-filling new volume form with discrete query: "${queryStr}". Fill author & save to instantly satisfy this requisition!`, "⚡");
}

async function updateSearchLogItemStatus(id, newStatus) {
  try {
    await API.updateSearchLogStatus(id, newStatus);
    showTelegramToast("REQUISITION STATUS UPDATED", `Search log #${id} marked as ${newStatus.toUpperCase()}.`, "⚖️");
    await loadSearchLogs();
  } catch (err) {
    console.error("Error updating log status:", err);
    showTelegramToast("ERROR", "Failed to update requisition status.", "⚠️");
  }
}

async function deleteBookItem(id, title) {
  if (!confirm(`Are you certain you wish to delete "${title}" from the Blackwater catalog ledger?`)) {
    return;
  }
  try {
    await API.deleteBook(id);
    showTelegramToast("VOLUME REMOVED", `"${title}" has been removed from active inventory.`, "🗑️");
    await loadInventory();
  } catch (err) {
    console.error("Error deleting book:", err);
    showTelegramToast("ERROR", "Failed to remove volume.", "⚠️");
  }
}

function openCreateBookModal(prefillTitle = '') {
  document.getElementById('form-book-id').value = '';
  document.getElementById('form-modal-title').textContent = 'ADD NEW CATALOG VOLUME';
  document.getElementById('book-form').reset();
  
  if (prefillTitle && typeof prefillTitle === 'string') {
    document.getElementById('form-title').value = prefillTitle;
  }

  const modal = document.getElementById('admin-form-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function openEditBookModal(book) {
  document.getElementById('form-book-id').value = book.id;
  document.getElementById('form-modal-title').textContent = `EDIT VOLUME #${book.id}`;
  
  document.getElementById('form-title').value = book.title || '';
  document.getElementById('form-author').value = book.author || '';
  document.getElementById('form-genre').value = book.genre || 'Western & Frontier';
  document.getElementById('form-price').value = book.price || 14.50;
  document.getElementById('form-stock').value = book.stockStatus || 'In Stock';
  document.getElementById('form-cover').value = book.coverImageUrl || '';
  document.getElementById('form-desc').value = book.description || '';
  document.getElementById('form-excerpt').value = book.excerpt || '';

  const modal = document.getElementById('admin-form-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeAdminFormModal() {
  const modal = document.getElementById('admin-form-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

async function handleBookFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('form-book-id').value;
  const bookData = {
    title: document.getElementById('form-title').value.trim(),
    author: document.getElementById('form-author').value.trim(),
    genre: document.getElementById('form-genre').value,
    price: parseFloat(document.getElementById('form-price').value) || 14.50,
    stockStatus: document.getElementById('form-stock').value,
    coverImageUrl: document.getElementById('form-cover').value.trim(),
    description: document.getElementById('form-desc').value.trim(),
    excerpt: document.getElementById('form-excerpt').value.trim()
  };

  const btn = document.getElementById('form-submit-btn');
  const origText = btn ? btn.innerHTML : '';
  if (btn) btn.innerHTML = `<span>⏳</span> Saving to Ledger...`;

  try {
    if (id) {
      await API.updateBook(id, bookData);
      showTelegramToast("VOLUME UPDATED", `"${bookData.title}" updated successfully.`, "💾");
    } else {
      await API.createBook(bookData);
      showTelegramToast("NEW VOLUME CATALOGED", `"${bookData.title}" added to active storefront inventory!`, "✨");
    }

    closeAdminFormModal();
    await loadInventory();
    await loadSearchLogs();
  } catch (err) {
    console.error("Error saving book:", err);
    showTelegramToast("SAVE ERROR", err.message || "Failed to save volume.", "⚠️");
  } finally {
    if (btn) btn.innerHTML = origText || `<span>💾</span> Save Volume to Catalog`;
  }
}
