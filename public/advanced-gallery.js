// Advanced Gallery with Performance Optimizations
class AdvancedGallery {
    constructor(containerId, images, options = {}) {
        this.container = document.getElementById(containerId);
        this.images = images;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.options = {
            batchSize: this.isMobile ? 3 : 6, // Smaller batches on mobile
            preloadNext: this.isMobile ? 1 : 3, // Less preloading on mobile
            quality: this.isMobile ? 70 : 80, // Lower quality on mobile
            thumbnailWidth: this.isMobile ? 250 : 400, // Smaller thumbnails on mobile
            mediumWidth: this.isMobile ? 600 : 800, // Smaller medium size on mobile
            ...options
        };
        
        this.loadedCount = 0;
        this.currentBatch = 0;
        this.imageOptimizer = window.imageOptimizer;
        this.lazyLoader = window.lazyLoader;
        
        this.init();
    }

    init() {
        this.createLoadingIndicator();
        this.loadInitialBatch();
        this.setupInfiniteLoading();
    }

    createLoadingIndicator() {
        const loading = document.createElement('div');
        loading.id = 'gallery-loading-indicator';
        loading.className = 'gallery-loading-indicator';
        loading.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading beautiful images...</p>
        `;
        this.container.appendChild(loading);
    }

    loadInitialBatch() {
        const batch = this.images.slice(0, this.options.batchSize);
        this.renderBatch(batch, 0);
        this.currentBatch++;
    }

    renderBatch(batch, startIndex) {
        const fragment = document.createDocumentFragment();
        
        batch.forEach((image, index) => {
            const galleryItem = this.createGalleryItem(image, startIndex + index);
            fragment.appendChild(galleryItem);
        });
        
        // Remove loading indicator if this is the first batch
        if (startIndex === 0) {
            const loadingIndicator = document.getElementById('gallery-loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
        }
        
        this.container.appendChild(fragment);
        
        // Initialize gallery plugin after adding items
        this.initializeGalleryPlugin();
    }

    createGalleryItem(image, index) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'fj-gallery-item';
        galleryItem.style.cursor = 'pointer';
        
        // Create optimized image
        const img = this.imageOptimizer.createOptimizedImage(image.src, {
            alt: image.title,
            width: image.width,
            height: image.height,
            className: 'loading',
            loading: index < 6 ? 'eager' : 'lazy' // First 6 images load immediately
        });
        
        // Add load event listeners
        img.addEventListener('load', () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
            galleryItem.classList.add('loaded');
            this.loadedCount++;
            
            // Preload next images
            this.preloadNextImages(index);
        });
        
        img.addEventListener('error', () => {
            img.classList.remove('loading');
            img.classList.add('error');
            console.warn(`Failed to load image: ${image.src}`);
        });
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'gallery-item-overlay';
        overlay.innerHTML = `<div class="gallery-item-title">${image.title}</div>`;
        
        // Add click handler
        galleryItem.addEventListener('click', () => {
            if (window.openLightbox) {
                window.openLightbox(index);
            }
        });
        
        galleryItem.appendChild(img);
        galleryItem.appendChild(overlay);
        
        // Observe for lazy loading
        if (index >= 6) {
            this.lazyLoader.observe(img);
        }
        
        return galleryItem;
    }

    preloadNextImages(currentIndex) {
        const nextImages = this.images.slice(
            currentIndex + 1, 
            currentIndex + 1 + this.options.preloadNext
        );
        
        nextImages.forEach(image => {
            this.imageOptimizer.preloadImage(image.src);
        });
    }

    setupInfiniteLoading() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && this.hasMoreImages()) {
                    this.loadNextBatch();
                }
            });
        }, {
            rootMargin: '200px'
        });
        
        // Observe the last item for infinite loading
        const observeLastItem = () => {
            const items = this.container.querySelectorAll('.fj-gallery-item');
            const lastItem = items[items.length - 1];
            if (lastItem) {
                observer.observe(lastItem);
            }
        };
        
        // Initial observation
        setTimeout(observeLastItem, 1000);
        
        // Re-observe after each batch
        this.container.addEventListener('batchLoaded', observeLastItem);
    }

    loadNextBatch() {
        if (!this.hasMoreImages()) return;
        
        const startIndex = this.currentBatch * this.options.batchSize;
        const batch = this.images.slice(startIndex, startIndex + this.options.batchSize);
        
        this.renderBatch(batch, startIndex);
        this.currentBatch++;
        
        // Dispatch event
        this.container.dispatchEvent(new CustomEvent('batchLoaded'));
    }

    hasMoreImages() {
        return this.currentBatch * this.options.batchSize < this.images.length;
    }

    initializeGalleryPlugin() {
        // Initialize Flickr Justified Gallery
        if (window.fjGallery) {
            fjGallery(document.querySelectorAll('.fj-gallery'), {
                itemSelector: '.fj-gallery-item',
                gutter: 15,
                rowHeight: 280,
                rowHeightTolerance: 0.25,
                maxRowsCount: Number.POSITIVE_INFINITY,
                lastRow: 'left',
                transitionDuration: '0.3s',
                calculateItemsHeight: false,
                resizeDebounce: 100
            });
        }
    }
}

// Export for global use
window.AdvancedGallery = AdvancedGallery;