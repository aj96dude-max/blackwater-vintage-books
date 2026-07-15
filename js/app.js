/* ==========================================================================
   Main Storefront Controller (app.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  console.log("❖ Blackwater & Co. Vintage Bookstore Controller Initialized ❖");

  // Initialize UI components
  if (typeof NavbarComponent !== 'undefined') NavbarComponent.init();
  if (typeof LedgerModalComponent !== 'undefined') LedgerModalComponent.init();
  if (typeof MissModalComponent !== 'undefined') MissModalComponent.init();
  if (typeof CatalogComponent !== 'undefined') await CatalogComponent.init();

  // Listen for real-time discrete variation requisitions
  API.listenForAlerts((alert) => {
    console.log("Live discrete variation requisition received:", alert);
    if (typeof NavbarComponent !== 'undefined') {
      NavbarComponent.updatePendingCounter();
    }
  });
});
