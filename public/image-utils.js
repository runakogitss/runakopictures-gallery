// Vercel Image Optimization Utilities
class ImageOptimizer {
    constructor() {
        this.isVercel = window.location.hostname.includes('vercel.app') || 
                       window.location.hostname.includes('vercel.com');
        this.baseUrl = this.isVercel ? '/_vercel/image' : '';
    }

    // Generate optimized image URL
    getOptimizedUrl(src, options = {}) {
        if (!this.isVercel) return src;
        
        const {
            width = 800,
            quality = 80,
            format = 'webp'
        } = options;
        
        const params = new URLSearchParams({
            url: src,
            w: width,
            q: quality,
            f: format
        });
        
        return `${this.baseUrl}?${params.toString()}`;
    }

    // Get responsive image URLs
    getResponsiveUrls(src) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        return {
            thumbnail: this.getOptimizedUrl(src, { 
                width: isMobile ? 300 : 400, 
                quality: isMobile ? 70 : 75 
            }),
            medium: this.getOptimizedUrl(src, { 
                width: isMobile ? 600 : 800, 
                quality: isMobile ? 75 : 80 
            }),
            large: this.getOptimizedUrl(src, { 
                width: isMobile ? 900 : 1200, 
                quality: isMobile ? 80 : 85 
            }),
            original: src
        };
    }

    // Preload critical images
    preloadImage(src, priority = false) {
        const link = document.createElement('link');
        link.rel = priority ? 'preload' : 'prefetch';
        link.as = 'image';
        link.href = this.getOptimizedUrl(src, { width: 800, quality: 80 });
        document.head.appendChild(link);
    }

    // Create optimized img element
    createOptimizedImage(src, options = {}) {
        const {
            alt = '',
            width = 800,
            height = 600,
            className = '',
            loading = 'lazy',
            sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        } = options;

        const img = document.createElement('img');
        const urls = this.getResponsiveUrls(src);
        
        // Set up responsive images
        img.src = urls.medium;
        img.srcset = `
            ${urls.thumbnail} 400w,
            ${urls.medium} 800w,
            ${urls.large} 1200w
        `;
        img.sizes = sizes;
        img.alt = alt;
        img.width = width;
        img.height = height;
        img.loading = loading;
        img.decoding = 'async';
        img.className = className;
        
        return img;
    }
}

// Initialize global image optimizer
window.imageOptimizer = new ImageOptimizer();

// Intersection Observer for lazy loading
class LazyImageLoader {
    constructor() {
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            {
                rootMargin: '50px 0px',
                threshold: 0.01
            }
        );
    }

    observe(img) {
        this.observer.observe(img);
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                this.observer.unobserve(img);
            }
        });
    }

    loadImage(img) {
        // Add loading class
        img.classList.add('loading');
        
        // Create a new image to preload
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = tempImg.src;
            img.classList.remove('loading');
            img.classList.add('loaded');
        };
        
        tempImg.onerror = () => {
            img.classList.remove('loading');
            img.classList.add('error');
        };
        
        tempImg.src = img.dataset.src || img.src;
    }
}

// Initialize lazy loader
window.lazyLoader = new LazyImageLoader();