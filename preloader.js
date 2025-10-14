// Preloader Integration Script for Tech Talk Solution
// This script handles the preloader functionality across all pages

(function() {
    'use strict';
    
    // Configuration
    const PRELOADER_CONFIG = {
        enabled: true, // Preloader enabled for deployment
        minLoadTime: 2000, // Minimum loading time in milliseconds
        maxLoadTime: 4000,  // Maximum loading time in milliseconds
        preloaderUrl: 'preloader.html',
        excludePages: [] // Pages to exclude from preloader
    };
    
    // Check if preloader should be shown
    function shouldShowPreloader() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isExcluded = PRELOADER_CONFIG.excludePages.includes(currentPage);
        const isPreloaderPage = currentPage.includes('preloader.html');
        
        // Check if preloader has already been shown in this session
        const preloaderShown = sessionStorage.getItem('preloader_shown') === 'true';
        
        console.log('Preloader check:', {
            currentPage,
            isExcluded,
            isPreloaderPage,
            preloaderShown,
            enabled: PRELOADER_CONFIG.enabled
        });
        
        // Don't show preloader if already shown or on preloader page
        if (preloaderShown || isPreloaderPage) {
            console.log('Preloader skipped - already shown or on preloader page');
            return false;
        }
        
        const shouldShow = PRELOADER_CONFIG.enabled && !isExcluded;
        console.log('Should show preloader:', shouldShow);
        return shouldShow;
    }
    
    // Show preloader overlay - DISABLED
    function showPreloaderOverlay() {
        // Purple gradient overlay disabled - function does nothing
        return false;
    }
    
    // Animate progress
    function animateProgress(progressElement, percentageElement, duration) {
        return new Promise((resolve) => {
            let progress = 0;
            const increment = 100 / (duration / 50);
            
            const interval = setInterval(() => {
                progress += Math.random() * increment + 0.5;
                if (progress > 100) progress = 100;
                
                progressElement.style.width = progress + '%';
                percentageElement.textContent = Math.floor(progress) + '%';
                
                if (progress >= 100) {
                    clearInterval(interval);
                    resolve();
                }
            }, 50);
        });
    }
    
    // Hide preloader
    function hidePreloader(overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 800);
    }
    
    // Initialize preloader
    function initPreloader() {
        if (!shouldShowPreloader()) {
            return;
        }
        
        // Removed session storage marking to allow preloader on every visit
        
        // Show preloader overlay
        const overlay = showPreloaderOverlay();
        
        // If overlay is disabled, redirect to preloader.html
        if (!overlay) {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            window.location.href = `preloader.html?page=${encodeURIComponent(currentPage)}`;
            return;
        }
        
        const progressElement = document.getElementById('inline-progress');
        const percentageElement = document.getElementById('inline-percentage');
        
        // Calculate loading duration
        const loadDuration = Math.random() * 
            (PRELOADER_CONFIG.maxLoadTime - PRELOADER_CONFIG.minLoadTime) + 
            PRELOADER_CONFIG.minLoadTime;
        
        // Wait for DOM to be ready
        const domReady = new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
        
        // Wait for all resources to load
        const resourcesReady = new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
        
        // Start progress animation
        setTimeout(() => {
            animateProgress(progressElement, percentageElement, loadDuration)
                .then(() => {
                    return Promise.all([domReady, resourcesReady]);
                })
                .then(() => {
                    setTimeout(() => {
                        hidePreloader(overlay);
                    }, 500);
                });
        }, 300);
    }
    
    // Add navigation interceptor for internal links
    function addNavigationInterceptor() {
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) {
                return;
            }
            
            // Check if it's an internal page
            const internalPages = ['index.html', 'services.html', 'about-us.html', 'contact.html', 'why-choose-us.html', 'Growth.html', 'test-preloader.html'];
            const isInternalPage = internalPages.some(page => href.includes(page));
            
            if (isInternalPage) {
                e.preventDefault();
                
                // Navigate to preloader with target page (no session management needed)
                const targetPage = href;
                window.location.href = `preloader.html?page=${encodeURIComponent(targetPage)}`;
            }
        });
    }
    
    // Reset preloader session (for testing)
    function resetPreloaderSession() {
        sessionStorage.removeItem('preloader_shown');
        console.log('Preloader session reset');
    }
    
    // Make reset function available globally for testing
    window.resetPreloaderSession = resetPreloaderSession;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, initializing preloader');
            initPreloader();
            addNavigationInterceptor();
        });
    } else {
        console.log('DOM already loaded, initializing preloader');
        initPreloader();
        addNavigationInterceptor();
    }
    
})();

// Navigation event listener (session management removed)
window.addEventListener('beforeunload', function() {
    // No session management needed - preloader will show on every page
});