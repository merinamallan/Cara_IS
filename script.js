const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if(bar) {
  bar.addEventListener('click', () => {
    nav.classList.add('active');
  })
};

if(close) {
  close.addEventListener('click', () => {
    nav.classList.remove('active');
  })
};

document.addEventListener("DOMContentLoaded", () => {
  // Select all remove buttons (❌ icons)
  const removeButtons = document.querySelectorAll(".bx-x-circle");

  removeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const row = this.closest("tr");
      row.remove();
      updateSubtotal();
    });
  });

  // Add listener for quantity changes
  const qtyInputs = document.querySelectorAll("#cart input[type='number']");
  qtyInputs.forEach((input) => {
    input.addEventListener("change", updateSubtotal);
  });

  // Function to recalculate subtotal
  function updateSubtotal() {
    let subtotal = 0;
    const rows = document.querySelectorAll("#cart tbody tr");

    rows.forEach((row) => {
      // get price from 4th column
      const priceText = row.querySelector("td:nth-child(4)").textContent.replace("₹", "");
      const quantity = row.querySelector("input").value;
      const price = parseFloat(priceText);

      const rowTotal = price * quantity;
      subtotal += rowTotal;

      // update row subtotal (6th column)
      row.querySelector("td:nth-child(6)").textContent = "₹" + rowTotal;
    });

    // Update subtotal & total in Cart Summary
    document.querySelector("#subtotal table tr:nth-child(1) td:nth-child(2)").textContent = "₹" + subtotal;
    document.querySelector("#subtotal table tr:nth-child(3) td:nth-child(2)").textContent = "₹" + subtotal;
  }

  // REPLACE this block:
if (window.SalesforceInteractions && SalesforceInteractions.sendEvent) {
  const rows = document.querySelectorAll('#cart tbody tr');
  const lineItems = Array.from(rows).map(row => {
    const name = row.querySelector('td:nth-child(2)').innerText.trim();
    const id = row.dataset.productId || name.toLowerCase().replace(/\s+/g, '-');
    const price = parseFloat(row.querySelector('td:nth-child(4)').textContent.replace(/[^0-9.]/g,'')) || null;
    const quantity = parseInt(row.querySelector('input').value, 10) || 1;
    return {
      catalogObjectType: 'product',
      catalogObjectId: id,
      quantity: quantity,
      price: price,
      attributes: { name }
    };
  });

  SalesforceInteractions.sendEvent({
    interaction: {
      name: SalesforceInteractions.CartInteractionName.ReplaceCart,
      lineItems: lineItems,
      source: { channel: 'Web', pageType: 'Cart', url: window.location.href }
    }
  });
  console.log('Personalization: ReplaceCart sent', lineItems);
}

// REMOVE the old SalesforceInteractions code and REPLACE with:
if (window.Evergage) {
  window.Evergage.push(function (evergage) {
    const rows = document.querySelectorAll('#cart tbody tr');
    if (rows.length > 0) {
      const lineItems = Array.from(rows).map(row => {
        const name = row.querySelector('td:nth-child(2)').innerText.trim();
        const id = row.dataset.productId || name.toLowerCase().replace(/\s+/g, '-');
        const price = parseFloat(row.querySelector('td:nth-child(4)').textContent.replace(/[^0-9.]/g,'')) || null;
        const quantity = parseInt(row.querySelector('input').value, 10) || 1;
        return {
          catalogObjectType: 'product',
          catalogObjectId: id,
          quantity: quantity,
          price: price,
          attributes: { name }
        };
      });

      evergage.sendEvent({
        action: "Cart Updated",
        lineItems: lineItems
      });
      console.log('Evergage: Cart Updated sent', lineItems);
    }
  });
}

// run once when page loads
updateSubtotal();

});








