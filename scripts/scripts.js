document.addEventListener("DOMContentLoaded", function () {
  loadHTML("includes/header.html", "header");
  loadHTML("includes/footer.html", "footer");
  loadGuitars();
  loadGuitarDetails();
});

function loadHTML(filename, targetElementId) {
  fetch(filename)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById(targetElementId).innerHTML = data;
      if (filename === "includes/header.html") {
        initialize(); // Initialize event listeners for the header after it is loaded
      }
    })
    .catch((error) => console.error("Error loading HTML:", error));
}

function loadGuitars() {
  var path = "data/" + localStorage.getItem("product") + ".json";
  fetch(path)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const productsContainer = document.querySelector(".product-list-guitars");
      productsContainer.innerHTML = ""; // Clear existing content

      data.forEach((guitar) => {
        const productDiv = document.createElement("div");
        productDiv.classList.add("product-p");
        productDiv.innerHTML = `
          <a href="product-detail.html?id=${guitar.id}">
            <img src="${guitar.image}" alt="${guitar.name}" class="img-fluid"/>
            <h3>${guitar.name}</h3>
            <p class="price">$${guitar.price.toFixed(2)}</p>
          </a>
        `;
        console.log(`Link generated: product-detail.html?id=${guitar.id}`); // Debugging line
        productsContainer.appendChild(productDiv);
      });
    })
    .catch((error) => console.error("Error loading guitar data:", error));
}

// Function to initialize event listeners for adding to cart
function initialize() {
  // Remove any previous event listeners to prevent duplication
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.removeEventListener("click", handleAddToCartClick); // Remove any existing listeners
    button.addEventListener("click", handleAddToCartClick);
  });
}

function handleAddToCartClick() {
  let Id = this.getAttribute("data-id");
  let name = this.getAttribute("data-name");
  let price = this.getAttribute("data-price");
  let image = this.getAttribute("data-image");
  addToCart(Id, name, price, image);
}

// Function to display items in the cart
function displayCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || {};
  let cartItemsDiv = document.getElementById("cart-items");
  let totalPrice = 0;

  cartItemsDiv.innerHTML = "";

  for (let id in cart) {
    let item = cart[id];
    let quantity = item.quantity;

    if (item && quantity > 0) {
      // Ensure quantity > 0 to display item
      let itemDiv = document.createElement("div");
      itemDiv.classList.add(
        "cart-item",
        "d-flex",
        "align-items-center",
        "mb-3"
        
      );
      itemDiv.innerHTML = `
        <div class="card">
          <img src="${item.image}" class="card-img-top" alt="${item.name}">
          <div class="card-body">
            <h5 class="card-title">${item.name}</h5>
              <p class="card-text">$${item.price.toFixed(2)}</p>
          <div class="d-flex justify-content-center align-items-center mb-2">
          <button class="idbutton decrement" data-id="${id}">-</button>
<input type="text" class="form-control mx-2 text-center" value="${quantity}" readonly style="width: 60px;">
<button class="idbutton increment" data-id="${id}">+</button>

        </div>
        <button class="btn btn-danger btn-sm remove" data-id="${id}">Remove</button>
        </div>

        </div>
      `;
      cartItemsDiv.appendChild(itemDiv);
      totalPrice += item.price * quantity;
    }
  }

  document.getElementById("total-price").textContent = totalPrice.toFixed(2);
}

// Function to update cart quantity or remove item
function updateCart(id, action) {
  let cart = JSON.parse(localStorage.getItem("cart")) || {};

  if (action === "increment") {
    cart[id].quantity++;
  } else if (action === "decrement" && cart[id].quantity > 1) {
    cart[id].quantity--;
  } else if (action === "remove") {
    delete cart[id];
  }

  if (cart[id] && cart[id].quantity === 0) {
    delete cart[id];
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

function initializeCart() {
  const cartItemsDiv = document.getElementById("cart-items");

  // Event delegation: listen for clicks on the entire cart items div
  cartItemsDiv.addEventListener("click", function (e) {
    const target = e.target;
    const id = target.getAttribute("data-id");

    if (target.classList.contains("increment")) {
      console.log("Increment button clicked for ID:", id); // Debugging line
      updateCart(id, "increment");
    } else if (target.classList.contains("decrement")) {
      console.log("Decrement button clicked for ID:", id); // Debugging line
      updateCart(id, "decrement");
    } else if (target.classList.contains("remove")) {
      console.log("Remove button clicked for ID:", id); // Debugging line
      updateCart(id, "remove");
    }
  });
}

// Function to handle checkout
function handleCheckout() {
  localStorage.removeItem("cart");
  displayCart(); // Clear cart display
  alert("Thank you for your purchase! Your cart has been cleared.");
}

window.onload = function () {
  loadHTML("includes/header.html", "header");
  loadHTML("includes/footer.html", "footer");

  if (document.body.classList.contains("cart-page")) {
    initializeCart(); // Initialize cart-related event listeners
    // Initialize checkout button listener
    document
      .querySelector(".btn-success")
      .addEventListener("click", handleCheckout);
    displayCart(); // Display the cart items
  }
};


function getGuitarIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

function loadGuitarDetails() {
  const guitarId = getGuitarIdFromUrl();
  var path = "data/" + localStorage.getItem("product") + ".json";
  fetch(path)
    .then((response) => response.json())
    .then((data) => {
      const guitar = data.find((g) => g.id == guitarId);
      if (guitar) {
        const guitarInfoContainer = document.getElementById("guitar-info");
        guitarInfoContainer.innerHTML = `
          <img src="${guitar.image}" alt="${guitar.name}" class="img-fluid" />
          <h2>${guitar.name}</h2>
          <p class="price">$${guitar.price.toFixed(2)}</p>
          <p>${guitar.description}</p>
        `;

        // Attach the event listener to the "Add to Cart" button
        document
          .getElementById("add-to-cart")
          .addEventListener("click", function () {
            addToCart(guitar);
          });
      } else {
        document.getElementById("guitar-info").innerHTML =
          "<p>Guitar not found.</p>";
      }
    })
    .catch((error) => console.error("Error loading guitar data:", error));
}

function addToCart(guitar) {
  let cart = JSON.parse(localStorage.getItem("cart")) || {};

  if (cart[guitar.id]) {
    cart[guitar.id].quantity += 1;
  } else {
    cart[guitar.id] = {
      id: guitar.id,
      name: guitar.name,
      price: guitar.price,
      image: guitar.image,
      quantity: 1,
    };
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${guitar.name} has been added to your cart.`);
}

function setProduct(value) {
  localStorage.setItem("product", value); // Store the product value
  console.log("Product set to:", value); // Debugging: log the stored value
}
document.addEventListener("DOMContentLoaded", function () {
  var product = localStorage.getItem("product"); // Corrected here
  console.log("Product retrieved:", product); // Debugging line
  var ptitle = product.charAt(0).toUpperCase() + product.slice(1);
  if (product) {
    document.querySelector(".ProductsName").innerText = ptitle;
  }
});
