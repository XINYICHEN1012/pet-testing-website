// Product interaction processing script
class ProductInteraction {
  constructor() {
    this.productsData = null;
    this.currentProductId = null;
    this.STORAGE_KEY = 'pet_products_data';
  }

  // Initialize
  async init() {
    await this.loadProductsData();
    this.setupEventListeners();
    this.sortProductsByDate();
    this.updateProductDisplay();
  }

  // Load product data
  async loadProductsData() {
    try {
      // First try to load data from localStorage
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (storedData) {
        this.productsData = JSON.parse(storedData);
      } else {
        // If no stored data, load initial data from products.json
        const response = await fetch('../data/products.json');
        this.productsData = await response.json();
        // Save to localStorage
        this.saveProductsData();
      }
      this.sortProductsByDate();
      this.updateProductDisplay();
    } catch (error) {
      console.error('Failed to load product data:', error);
    }
  }

  // Save product data to localStorage
  saveProductsData() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.productsData));
    } catch (error) {
      console.error('Failed to save product data:', error);
    }
  }

  // Sort products by release date
  sortProductsByDate() {
    if (this.productsData && this.productsData.products) {
      this.productsData.products.sort((a, b) => {
        return new Date(b.releaseDate) - new Date(a.releaseDate);
      });
    }
  }

  // Update product display
  updateProductDisplay() {
    const productGrid = document.querySelector('.grid');
    if (!productGrid) {
      return;
    }

    productGrid.innerHTML = '';
    this.productsData.products.forEach((product) => {
      const productElement = this.createProductElement(product);
      productGrid.appendChild(productElement);
    });
  }

  // Create product element
  createProductElement(product) {
    const article = document.createElement('article');
    article.className =
      'bg-white rounded-xl shadow-sm card-shadow overflow-hidden flex flex-col h-full';
    article.setAttribute('data-id', product.id);

    const likeData = product.stats || { likes: 0, followers: 0 };

    article.innerHTML = `
      <div class="relative aspect-[4/3] overflow-hidden cursor-pointer gallery-trigger">
        <img src="${this.productsData.constants.imageBaseUrl}${product.image.query}${this.productsData.constants.imageParams}" alt="${product.name}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105">
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <div class="flex items-center">
            <div class="flex -space-x-2">
              ${product.followerAvatars.map((avatar) => `
                <img src="${this.productsData.constants.avatarBaseUrl}${avatar.query}${this.productsData.constants.avatarParams}" class="w-8 h-8 rounded-full border-2 border-white" alt="User Avatar">
              `).join('')}
            </div>
            <span class="text-white text-base ml-2"><span class="follow-count">${likeData.followers}</span> followers</span>
          </div>
        </div>
      </div>
      <div class="p-4 flex flex-col flex-grow">
        <h3 class="text-xl font-medium text-gray-800 mb-2 line-clamp-2">${product.name}</h3>
        <p class="text-base text-gray-600 mb-4 line-clamp-3">${product.description}</p>
        <div class="flex items-center justify-between mb-4">
          <p class="text-primary font-semibold text-lg">${product.currency} ${product.price}</p>
          <p class="text-base text-gray-500">${product.releaseDate}</p>
        </div>
        <div class="flex items-center justify-end pt-4 border-t border-gray-100 mt-auto">
          <div class="flex items-center space-x-4">
            <div class="flex items-center cursor-pointer like-button" data-liked="false" data-count="${likeData.likes}">
              <i class="ri-heart-line ri-xl mr-2 text-gray-400"></i>
              <span class="text-base text-gray-600 like-count">${likeData.likes}</span>
            </div>
            <div class="flex items-center cursor-pointer comment-button">
              <i class="ri-message-3-line ri-xl mr-2 text-gray-400"></i>
              <span class="text-base text-gray-600">${likeData.comments || 0}</span>
            </div>
            <div class="flex items-center cursor-pointer collect-button" data-collected="false">
              <i class="ri-star-line ri-xl mr-2 text-gray-400"></i>
              <span class="text-base text-gray-600">Collect</span>
            </div>
          </div>
        </div>
      </div>
    `;

    return article;
  }

  // Setup event listeners
  setupEventListeners() {
    // Like button click event
    document.querySelectorAll('.like-button').forEach((button) => {
      button.addEventListener('click', () => {
        const isLiked = button.getAttribute('data-liked') === 'true';
        const countElement = button.querySelector('.like-count');
        let count = parseInt(countElement.textContent);
        const productId = button.closest('article').getAttribute('data-id');

        if (isLiked) {
          count--;
          button.setAttribute('data-liked', 'false');
          button
            .querySelector('i')
            .classList.remove('ri-heart-fill', 'text-primary');
          button
            .querySelector('i')
            .classList.add('ri-heart-line', 'text-gray-400');
        } else {
          count++;
          button.setAttribute('data-liked', 'true');
          button
            .querySelector('i')
            .classList.remove('ri-heart-line', 'text-gray-400');
          button
            .querySelector('i')
            .classList.add('ri-heart-fill', 'text-primary');
        }

        countElement.textContent = count;
        this.updateProductStats(productId, 'likes', count);
      });
    });

    // Collect button click event
    document.querySelectorAll('.collect-button').forEach((button) => {
      button.addEventListener('click', () => {
        const isCollected = button.getAttribute('data-collected') === 'true';
        const countElement = button
          .closest('article')
          .querySelector('.follow-count');
        let count = parseInt(countElement.textContent);
        const productId = button.closest('article').getAttribute('data-id');

        if (isCollected) {
          count--;
          button.setAttribute('data-collected', 'false');
          button
            .querySelector('i')
            .classList.remove('ri-star-fill', 'text-primary');
          button
            .querySelector('i')
            .classList.add('ri-star-line', 'text-gray-400');
        } else {
          count++;
          button.setAttribute('data-collected', 'true');
          button
            .querySelector('i')
            .classList.remove('ri-star-line', 'text-gray-400');
          button
            .querySelector('i')
            .classList.add('ri-star-fill', 'text-primary');
        }

        countElement.textContent = count;
        this.updateProductStats(productId, 'followers', count);
      });
    });
  }

  // Update product statistics
  updateProductStats(productId, statType, newValue) {
    if (!this.productsData) {
      return;
    }

    const product = this.productsData.products.find((p) => p.id === productId);
    if (product) {
      if (!product.stats) {
        product.stats = {};
      }
      product.stats[statType] = newValue;
      product.stats.lastUpdated = new Date().toISOString();
      this.saveProductsData();

      // Update statistics in gallery
      const gallery = document.querySelector('.image-gallery');
      if (gallery && gallery.classList.contains('active')) {
        const currentProduct = document.querySelector('.current-card');
        if (
          currentProduct &&
          currentProduct.getAttribute('data-id') === productId
        ) {
          if (statType === 'likes') {
            gallery.querySelector('.gallery-like-count').textContent = newValue;
          } else if (statType === 'followers') {
            gallery.querySelector('.follow-count').textContent = newValue;
          }
        }
      }
    }
  }

  // Get current product ID
  getCurrentProductId() {
    if (!this.currentProductId) {
      const urlParams = new URLSearchParams(window.location.search);
      this.currentProductId = urlParams.get('id');
    }
    return this.currentProductId;
  }
}

// Initialize product interaction
document.addEventListener('DOMContentLoaded', () => {
  const productInteraction = new ProductInteraction();
  productInteraction.init();
});
