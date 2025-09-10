// script.js - safe, drop-in replacement

const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
  bar.addEventListener('click', () => nav.classList.add('active'));
}
if (close) {
  close.addEventListener('click', () => nav.classList.remove('active'));
}

/**
 * Helper: safe wrapper to send events to Evergage.
 * - Logs payload for debugging.
 * - Honors window.EVERGAGE_SUPPRESS_SEND (set true to only log, not send).
 */
function sendEvergageEvent(payload) {
  try {
    console.log('[Evergage] payload prepared:', payload);

    // If the page wants to suppress sends for debugging, don't call the SDK.
    if (window.EVERGAGE_SUPPRESS_SEND) {
      console.log('[Evergage] send suppressed by EVERGAGE_SUPPRESS_SEND flag.');
      return;
    }

    if (window.Evergage && typeof window.Evergage.push === 'function') {
      window.Evergage.push(function (evergage) {
        try {
          evergage.sendEvent(payload);
          console.log('[Evergage] event pushed:', payload.action || payload);
        } catch (err) {
          console.warn('[Evergage] sendEvent failed', err, payload);
        }
      });
    } else {
      console.warn('[Evergage] SDK not available yet; event not sent:', payload);
    }
  } catch (err) {
    console.error('[Evergage] send wrapper error', err, payload);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // ---------- cart UI logic ----------
  const removeButtons = document.querySelectorAll('.bx-x-circle');
  removeButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const row = this.closest('tr');
      if (row) {
        row.remove();
        updateSubtotal();
      }
    });
  });

  const qtyInputs = document.querySelectorAll('#cart input[type="number"]');
  qtyInputs.forEach((input) => input.addEventListener('change', updateSubtotal));

  function updateSubtotal() {
    let subtotal = 0;
    const rows = document.querySelectorAll('#cart tbody tr');
    rows.forEach((row) => {
      const priceText = (row.querySelector('td:nth-child(4)')?.textContent || '').replace(/[^0-9.]/g, '');
      const quantity = parseInt(row.querySelector('input')?.value || '0', 10) || 0;
      const price = parseFloat(priceText) || 0;
      const rowTotal = price * quantity;
      subtotal += rowTotal;
      const cell = row.querySelector('td:nth-child(6)');
      if (cell) cell.textContent = '₹' + rowTotal;
    });

    const subtotalEl = document.querySelector('#subtotal table tr:nth-child(1) td:nth-child(2)');
    const totalEl = document.querySelector('#subtotal table tr:nth-child(3) td:nth-child(2)');
    if (subtotalEl) subtotalEl.textContent = '₹' + subtotal;
    if (totalEl) totalEl.textContent = '₹' + subtotal;
  }

  // Run once on load
  updateSubtotal();

  // ---------- Evergage cart event: only run on cart page ----------
  (function sendCartEventIfOnCartPage() {
    // Identify cart page: either pathname includes cart.html OR DOM has #cart tbody with rows
    const isCartPath = window.location.pathname.includes('cart.html');
    const cartTableBody = document.querySelector('#cart tbody');
    const hasCartRows = cartTableBody && cartTableBody.querySelectorAll('tr').length > 0;

    if (!isCartPath && !hasCartRows) {
      // Not a cart context — do not send cart events.
      console.log('[CartEventGuard] not a cart page or no cart rows; skipping cart event.');
      return;
    }

    const rows = Array.from(cartTableBody ? cartTableBody.querySelectorAll('tr') : []);
    if (rows.length === 0) {
      console.log('[CartEventGuard] no rows found in cart table; skipping cart event.');
      return;
    }

    const lineItems = rows.map((row) => {
      const name = (row.querySelector('td:nth-child(2)')?.innerText || '').trim();
      const id = row.dataset.productId || (name ? name.toLowerCase().replace(/\s+/g, '-') : 'unknown-product');
      const price = parseFloat((row.querySelector('td:nth-child(4)')?.textContent || '').replace(/[^0-9.]/g, '')) || null;
      const quantity = parseInt(row.querySelector('input')?.value || '1', 10) || 1;
      return {
        catalogObjectType: 'product',
        catalogObjectId: id,
        quantity,
        price,
        attributes: { name },
      };
    });

    if (lineItems.length === 0) {
      console.log('[CartEventGuard] no line items built; skipping cart event.');
      return;
    }

    const payload = {
      action: 'Cart Updated',
      lineItems: lineItems,
      source: { channel: 'Web', pageType: 'Cart', url: window.location.href },
    };

    sendEvergageEvent(payload);
  })();
});
