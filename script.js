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
      const row = this.closest("tr"); // remove row
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

  // run once when page loads
  updateSubtotal();
});


// === Add this block before checkoutBtn ===
document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", function () {
    const productCard = this.closest(".pro"); // adjust selector to your product container
    const name = productCard.querySelector("h5").textContent;
    const price = parseFloat(productCard.querySelector(".price").textContent.replace("₹", ""));
    const image = productCard.querySelector("img").src;

    // Capture size if available
    const sizeElement = productCard.querySelector("select");
    const size = sizeElement ? sizeElement.value : null;

    // === Also update your local cart (existing logic) ===
    let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    cart.push({ name, price, image, size, quantity: 1 });
    localStorage.setItem("cartItems", JSON.stringify(cart));

    alert(`${name} added to cart ✅`);

    // === Salesforce Interaction push ===
    if (window.SalesforceInteractions) {
      Evergage.sendEvent("AddToCart", {
        product: {
          name: name,
          price: price,
          imageUrl: image,
          size: size,
          quantity: 1
        }
      });
    } else {
      console.warn("Evergage is not defined");
    }
    // === End Salesforce Interaction push ===
  });
});
// === End Salesforce Add to Cart tracking ===


// Your existing checkout button logic
const checkoutBtn = document.getElementById("checkout-btn");
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    let cart = JSON.parse(localStorage.getItem("cartItems")) || [];

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    localStorage.removeItem("cartItems");
    alert("✅ Purchase successful! Thank you for shopping.");
    location.reload();
  });
}


