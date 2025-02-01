let currentPage = 1;
const PRODUCT_PER_PAGE = 10;
let products = [];
let filteredProducts = [];
let categories = [];
let filterOption = [];
let maxPrice = 0;
let minPrice = 0;
let sortType = "none";

const initializeLoadingUI = () => {
  const productList = document.querySelector(".product-list");
  productList.innerHTML = `
        <div clsss="loading">Loading products...</div>
    `;
};

const fetchProducts = async () => {
  initializeLoadingUI();

  try {
    const response = await fetch("https://fakestoreapi.com/products");
    if (!response.ok) {
      throw new Error("Network response was not ok!");
    }

    products = await response.json();

    // Transform the data to match our structure to use in the UI
    products = products.map((product) => (
      { id, title, description, price, image, category } = product
    ));

    // Default filters
    filteredProducts = [...products];
    categories = [...new Set(products.map((product) => product.category))];
    maxPrice = Math.max(...products.map((product) => product.price));
    minPrice = Math.min(...products.map((product) => product.price));

    document.querySelector(
      ".result-count"
    ).innerHTML = `${filteredProducts.length} Results`;

    const productList = document.querySelector(".product-list");
    productList.innerHTML = "";

    init();
    renderProducts(currentPage);
  } catch (error) {
    console.error("Error fetching products:", error);
    document.querySelector(".product-list").innerHTML = `
            <div>
                <h1>Error</h1>
                <p>Failed to load produsct. Please try again!!</p>
            </div>
        `;
  }
};

const filterProducts = () => {
  const searchTerm = document.querySelector(".search-input").value;
  const maxPriceFilter = document.querySelector(".price-filter").value;

  filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategories =
      filterOption.length > 0
        ? filterOption.includes(product.category)
        : product;

    const matchesPrice = product.price <= maxPriceFilter;

    return matchesSearch && matchesCategories && matchesPrice;
  });

  // console.log(filteredProducts);
  currentPage = 1;
  const productList = document.querySelector(".product-list");
  productList.innerHTML = "";
  updateResultCount();
  handleSort(sortType);
  renderProducts(currentPage);
};

const sortProducts = (products, sortType) => {
  const sortedProducts = [...products];
  switch (sortType) {
    case "asc":
      return sortedProducts.sort((a, b) => a.price - b.price);
    case "dec":
      return sortedProducts.sort((a, b) => b.price - a.price);
    default:
      return products;
  }
};

const handleSort = (value) => {
  sortType = value;
  filteredProducts = sortProducts(filteredProducts, sortType);
  renderProducts(1);
};

const renderProducts = (page) => {
  const start = (page - 1) * PRODUCT_PER_PAGE;
  const end = start + PRODUCT_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(start, end);

  const productList = document.querySelector(".product-list");

  if (start === 0) {
    productList.innerHTML = "";
  }

  paginatedProducts.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <p class="product-title">${product.title}</p>
                <p>$${product.price}</p>
                <i class="fa-regular fa-heart"></i>
            </div>
        `;
    productList.appendChild(productCard);
  });

  if (productList.childElementCount === filteredProducts.length) {
    document.querySelector(".load-more").style.display = "none";
    document.querySelector(".message").innerHTML = "No more product to show!!!";
  } else {
    document.querySelector(".load-more").style.display = "block";
    document.querySelector(".message").innerHTML = "";
  }
};

const updateResultCount = () => {
  document.querySelector(
    ".result-count"
  ).innerHTML = `${filteredProducts.length} Results`;
};

const init = () => {
  const select = document.querySelector(".filter-categories");
  categories.forEach((category) => {
    const option = document.createElement("div");
    option.innerHTML = `
            <input type="checkbox" class="filter-option" id="${category}" name="filter-option" value="${category}" />
            <label for="${category}">${category}</label>
        `;
    select.appendChild(option);
  });

  document.querySelector(".price-filter-container").innerHTML = `
    <label>
        Max price: $<span class="price-value">${maxPrice.toFixed(2)}</span>
    </label>
    <input type="range" class="price-filter" min="${minPrice}" max="${maxPrice}" value="${maxPrice}" step="0.01" >
  `;

  document.querySelector(".load-more").addEventListener("click", () => {
    currentPage++;
    renderProducts(currentPage);
  });

  document
    .querySelector(".search-input")
    .addEventListener("input", filterProducts);

  document
    .querySelector(".sort-type")
    .addEventListener("change", (e) => handleSort(e.target.value));

  document.querySelector(".price-filter").addEventListener("input", (e) => {
    document.querySelector(".price-value").textContent = parseFloat(
      e.target.value
    ).toFixed(2);
    filterProducts();
  });

  document.querySelector(".filter-button").addEventListener("click", () => {
    filterOption = [];
    let checkboxes = document.getElementsByName("filter-option");
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        filterOption.push(checkboxes[i].value);
      }
    }
    filterProducts();
  });

  updateResultCount();
};

document.querySelector(".nav-icon").addEventListener("click", () => {
    document.querySelector(".mobile-nav").classList.toggle("mobile-nav-active");
});

document.querySelector(".filter-mobile").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("sidebar-active");
});

fetchProducts();
