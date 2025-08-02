// Vercel Image Path Fix and Optimization
(function () {
    'use strict';

    // Comprehensive image path fixing for Vercel
    function fixImagePaths() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            let src = img.src || img.getAttribute('data-src');
            if (src) {
                // Ensure proper URL encoding for Vercel
                let fixedSrc = src;

                // Fix common path issues
                fixedSrc = fixedSrc.replace(/\s/g, '%20'); // Encode spaces
                fixedSrc = fixedSrc.replace(/\\/g, '/'); // Fix backslashes

                // Update the image source
                if (img.src && img.src !== fixedSrc) {
                    img.src = fixedSrc;
                }
                if (img.getAttribute('data-src') && img.getAttribute('data-src') !== fixedSrc) {
                    img.setAttribute('data-src', fixedSrc);
                }
            }
        });
    }

    // Enhanced error handling with multiple fallback strategies
    function addImageErrorHandling() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.hasAttribute('data-error-handled')) return;
            img.setAttribute('data-error-handled', 'true');

            img.addEventListener('error', function (e) {
                console.warn('Failed to load image:', this.src);

                const originalSrc = this.src;
                let attempts = parseInt(this.getAttribute('data-load-attempts') || '0');

                if (attempts < 3) {
                    attempts++;
                    this.setAttribute('data-load-attempts', attempts.toString());

                    // Try different encoding strategies
                    let newSrc = originalSrc;

                    if (attempts === 1) {
                        // Try with URL decoding
                        newSrc = decodeURIComponent(originalSrc);
                    } else if (attempts === 2) {
                        // Try with double encoding
                        newSrc = originalSrc.replace(/%20/g, '%2520');
                    } else if (attempts === 3) {
                        // Try with no encoding
                        newSrc = originalSrc.replace(/%20/g, ' ');
                    }

                    if (newSrc !== originalSrc) {
                        setTimeout(() => {
                            this.src = newSrc;
                        }, 100 * attempts);
                        return;
                    }
                }

                // Final fallback: show placeholder
                this.style.cssText = `
                    background: linear-gradient(45deg, #f8f8f8, #e8e8e8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 200px;
                    color: #999;
                    font-size: 2rem;
                    border: 2px dashed #ddd;
                    border-radius: 8px;
                `;
                this.innerHTML = '<span>📷</span>';
                this.alt = 'Image not available';
            });

            // Add load success handler
            img.addEventListener('load', function () {
                this.style.opacity = '1';
                this.classList.add('loaded');
            });
        });
    }

    // Optimize images for Vercel deployment
    function optimizeImagesForVercel() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Add performance attributes
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            if (!img.hasAttribute('decoding')) {
                img.setAttribute('decoding', 'async');
            }

            // Add responsive attributes for gallery images
            if (img.closest('.fj-gallery-item') && !img.hasAttribute('sizes')) {
                img.setAttribute('sizes', '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw');
            }

            // Ensure proper CORS for cross-origin images
            if (img.src && !img.hasAttribute('crossorigin')) {
                img.setAttribute('crossorigin', 'anonymous');
            }
        });
    }

    // Preload critical images
    function preloadCriticalImages() {
        const criticalImages = [
            '/pics/logo/runakopictures.png',
            '/pics/profile/profile.JPG',
            '/pics/studiocology/Studiocology.png',
            '/pics/japan%20trip/asakusa.JPG',
            '/pics/school%20life/capgomeh.jpg',
            '/pics/kota%20lama/semarang.jpg'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    // Initialize all optimizations
    function initializeImageOptimizations() {
        fixImagePaths();
        addImageErrorHandling();
        optimizeImagesForVercel();
        preloadCriticalImages();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeImageOptimizations);
    } else {
        initializeImageOptimizations();
    }

    // Handle dynamically added images
    const observer = new MutationObserver(function (mutations) {
        let hasNewImages = false;
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1) {
                        if (node.tagName === 'IMG' || node.querySelectorAll('img').length > 0) {
                            hasNewImages = true;
                        }
                    }
                });
            }
        });

        if (hasNewImages) {
            setTimeout(initializeImageOptimizations, 100);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Add global error handler for uncaught image errors
    window.addEventListener('error', function (e) {
        if (e.target && e.target.tagName === 'IMG') {
            console.warn('Global image error caught:', e.target.src);
        }
    }, true);

})();