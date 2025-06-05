/**
 * SHORESQUAD - INTERACTIVE WEB APPLICATION
 * 
 * Features:
 * - Mobile-responsive navigation
 * - Interactive map integration
 * - Weather API integration
 * - Smooth scrolling and animations
 * - Accessibility features
 * - Progressive Web App capabilities
 * - Performance optimizations
 */

class ShoreSquadApp {
    constructor() {
        this.init();
        this.weatherApiKey = 'your-weather-api-key'; // Replace with actual API key
        this.isMapLoaded = false;
        this.userLocation = null;
        this.cleanupEvents = [];
    }

    init() {
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.setupSmoothScrolling();
        this.animateCounters();
        this.checkUserLocation();
        
        // Initialize components when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeComponents();
            });
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        this.initializeMap();
        this.loadWeatherData();
        this.setupProgressiveWebApp();
    }

    /**
     * EVENT LISTENERS SETUP
     */
    setupEventListeners() {
        // Navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                this.toggleMobileNav(navToggle, navMenu);
            });
        }

        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavClick(e);
                this.closeMobileNav(navToggle, navMenu);
            });
        });

        // CTA buttons
        this.setupCTAButtons();

        // Location-based features
        const findLocationBtn = document.getElementById('find-location-btn');
        if (findLocationBtn) {
            findLocationBtn.addEventListener('click', () => {
                this.findUserLocation();
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu?.classList.contains('active')) {
                this.closeMobileNav(navToggle, navMenu);
            }
        });

        // Window events
        window.addEventListener('resize', this.debounce(() => {
            this.handleWindowResize();
        }, 250));

        window.addEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, 16));
    }

    setupCTAButtons() {
        const ctaButtons = [
            'get-started-btn',
            'join-now-btn',
            'watch-demo-btn',
            'login-btn',
            'signup-btn'
        ];

        ctaButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', (e) => {
                    this.handleCTAClick(e, buttonId);
                });
            }
        });
    }

    /**
     * NAVIGATION FUNCTIONALITY
     */
    toggleMobileNav(toggle, menu) {
        const isActive = menu.classList.contains('active');
        
        if (isActive) {
            this.closeMobileNav(toggle, menu);
        } else {
            this.openMobileNav(toggle, menu);
        }
    }

    openMobileNav(toggle, menu) {
        menu.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        
        // Animate hamburger
        const hamburgers = toggle.querySelectorAll('.hamburger');
        hamburgers[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        hamburgers[1].style.opacity = '0';
        hamburgers[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    }

    closeMobileNav(toggle, menu) {
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        
        // Reset hamburger
        const hamburgers = toggle.querySelectorAll('.hamburger');
        hamburgers[0].style.transform = '';
        hamburgers[1].style.opacity = '';
        hamburgers[2].style.transform = '';
    }

    handleNavClick(e) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        
        if (href && href.startsWith('#')) {
            const targetElement = document.querySelector(href);
            if (targetElement) {
                this.smoothScrollTo(targetElement);
            }
        }
    }

    /**
     * SMOOTH SCROLLING
     */
    setupSmoothScrolling() {
        // Polyfill for browsers that don't support smooth scrolling
        if (!('scrollBehavior' in document.documentElement.style)) {
            this.loadSmoothScrollPolyfill();
        }
    }

    smoothScrollTo(element) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
        const targetPosition = element.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * INTERSECTION OBSERVER FOR ANIMATIONS
     */
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll(
            '.feature-card, .stat-card, .hero-content, .section-header'
        );
        
        animatedElements.forEach((el, index) => {
            el.classList.add('fade-in');
            el.style.transitionDelay = `${index * 0.1}s`;
            this.observer.observe(el);
        });
    }

    /**
     * COUNTER ANIMATIONS
     */
    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const start = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out)
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(target * easeOut);
                
                counter.textContent = this.formatNumber(current);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            // Start animation when element is visible
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        requestAnimationFrame(animate);
                        counterObserver.unobserve(entry.target);
                    }
                });
            });
            
            counterObserver.observe(counter);
        });
    }

    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace('.0', '') + 'K';
        }
        return num.toString();
    }

    /**
     * GEOLOCATION & MAP FUNCTIONALITY
     */
    checkUserLocation() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.updateLocationBasedContent();
                },
                (error) => {
                    console.log('Geolocation permission denied or unavailable');
                },
                { timeout: 10000, enableHighAccuracy: false }
            );
        }
    }

    findUserLocation() {
        if ('geolocation' in navigator) {
            const button = document.getElementById('find-location-btn');
            const originalText = button.innerHTML;
            
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finding your location...';
            button.disabled = true;
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.updateMapWithUserLocation();
                    button.innerHTML = originalText;
                    button.disabled = false;
                },
                (error) => {
                    this.showLocationError(error);
                    button.innerHTML = originalText;
                    button.disabled = false;
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        } else {
            this.showNotification('Geolocation is not supported by your browser', 'error');
        }
    }

    initializeMap() {
        // This would integrate with Google Maps, Mapbox, or similar
        // For now, we'll create a placeholder that simulates map loading
        const mapContainer = document.getElementById('interactive-map');
        if (!mapContainer) return;

        setTimeout(() => {
            mapContainer.innerHTML = `
                <div style="height: 100%; background: linear-gradient(135deg, #0077BE, #4A90E2); 
                     display: flex; align-items: center; justify-content: center; color: white; 
                     font-size: 1.5rem; border-radius: 1rem;">
                    <div style="text-align: center;">
                        <i class="fas fa-map-marker-alt" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <p>Interactive Map Loading...</p>
                        <p style="font-size: 0.9rem; opacity: 0.8;">Beach cleanup locations will appear here</p>
                    </div>
                </div>
            `;
            this.isMapLoaded = true;
        }, 2000);
    }

    updateMapWithUserLocation() {
        if (!this.isMapLoaded || !this.userLocation) return;
        
        // Simulate updating map with user location
        this.showNotification('Found nearby beach cleanups!', 'success');
    }

    updateLocationBasedContent() {
        if (!this.userLocation) return;
        
        // Update weather for user's location
        this.loadWeatherData(this.userLocation.lat, this.userLocation.lng);
        
        // Update nearby events (simulation)
        this.loadNearbyCleanups();
    }

    /**
     * WEATHER INTEGRATION
     */
    async loadWeatherData(lat = 40.7128, lng = -74.0060) { // Default to NYC
        const weatherWidget = document.getElementById('weather-widget');
        if (!weatherWidget) return;

        try {
            // Simulate weather API call
            await this.delay(1500);
            
            const weatherData = this.generateMockWeatherData();
            this.displayWeatherData(weatherData, weatherWidget);
            
        } catch (error) {
            console.error('Weather data loading failed:', error);
            this.displayWeatherError(weatherWidget);
        }
    }

    generateMockWeatherData() {
        const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'];
        const temps = [18, 22, 25, 28, 32];
        
        return {
            temperature: temps[Math.floor(Math.random() * temps.length)],
            condition: conditions[Math.floor(Math.random() * conditions.length)],
            humidity: Math.floor(Math.random() * 40) + 40,
            windSpeed: Math.floor(Math.random() * 15) + 5,
            uvIndex: Math.floor(Math.random() * 8) + 1
        };
    }

    displayWeatherData(data, container) {
        const isGoodForCleanup = data.temperature >= 20 && !data.condition.includes('Rain');
        
        container.innerHTML = `
            <div class="weather-display">
                <div class="weather-main">
                    <div class="weather-temp">${data.temperature}°C</div>
                    <div class="weather-condition">${data.condition}</div>
                </div>
                <div class="weather-details">
                    <div class="weather-item">
                        <i class="fas fa-eye"></i>
                        <span>Humidity: ${data.humidity}%</span>
                    </div>
                    <div class="weather-item">
                        <i class="fas fa-wind"></i>
                        <span>Wind: ${data.windSpeed} km/h</span>
                    </div>
                    <div class="weather-item">
                        <i class="fas fa-sun"></i>
                        <span>UV Index: ${data.uvIndex}</span>
                    </div>
                </div>
                <div class="weather-recommendation ${isGoodForCleanup ? 'good' : 'poor'}">
                    <i class="fas fa-${isGoodForCleanup ? 'thumbs-up' : 'umbrella'}"></i>
                    <span>${isGoodForCleanup ? 'Perfect for cleanup!' : 'Consider rescheduling'}</span>
                </div>
            </div>
        `;
    }

    displayWeatherError(container) {
        container.innerHTML = `
            <div style="text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Unable to load weather data</p>
                <button class="btn btn-outline" onclick="app.loadWeatherData()" style="margin-top: 1rem;">
                    Try Again
                </button>
            </div>
        `;
    }

    /**
     * PROGRESSIVE WEB APP SETUP
     */
    setupProgressiveWebApp() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered successfully');
                })
                .catch(error => {
                    console.log('SW registration failed');
                });
        }

        // Add to home screen prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });
    }

    showInstallPrompt() {
        // You could show a custom install banner here
        console.log('App can be installed');
    }

    /**
     * CTA HANDLERS
     */
    handleCTAClick(e, buttonId) {
        e.preventDefault();
        
        switch(buttonId) {
            case 'get-started-btn':
            case 'join-now-btn':
                this.showSignupModal();
                break;
            case 'watch-demo-btn':
                this.showDemoVideo();
                break;
            case 'login-btn':
                this.showLoginModal();
                break;
            case 'signup-btn':
                this.showSignupModal();
                break;
        }
    }

    showSignupModal() {
        // In a real app, this would open a signup modal
        this.showNotification('Signup feature coming soon! Join our newsletter for updates.', 'info');
    }

    showLoginModal() {
        // In a real app, this would open a login modal
        this.showNotification('Login feature coming soon!', 'info');
    }

    showDemoVideo() {
        // In a real app, this would open a video modal or redirect
        this.showNotification('Demo video coming soon!', 'info');
    }

    /**
     * NOTIFICATION SYSTEM
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);

        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });

        // Show notification
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * UTILITY FUNCTIONS
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    handleWindowResize() {
        // Handle responsive adjustments
        const navMenu = document.querySelector('.nav-menu');
        if (window.innerWidth > 768 && navMenu?.classList.contains('active')) {
            const navToggle = document.querySelector('.nav-toggle');
            this.closeMobileNav(navToggle, navMenu);
        }
    }

    handleScroll() {
        // Handle scroll-based effects
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = '';
            }
        }
    }

    loadNearbyCleanups() {
        // Simulate loading nearby cleanup events
        this.cleanupEvents = [
            {
                id: 1,
                name: 'Bondi Beach Cleanup',
                date: '2025-06-15',
                participants: 45,
                distance: '2.3 km'
            },
            {
                id: 2,
                name: 'Manly Beach Squad',
                date: '2025-06-18',
                participants: 32,
                distance: '5.7 km'
            }
        ];
    }

    showLocationError(error) {
        let message = 'Unable to get your location. ';
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message += 'Please enable location permissions.';
                break;
            case error.POSITION_UNAVAILABLE:
                message += 'Location information unavailable.';
                break;
            case error.TIMEOUT:
                message += 'Location request timed out.';
                break;
        }
        this.showNotification(message, 'error');
    }

    loadSmoothScrollPolyfill() {
        // Load smooth scroll polyfill for older browsers
        if (!window.smoothScrollPolyfillLoaded) {
            const script = document.createElement('script');
            script.src = 'https://polyfill.io/v3/polyfill.min.js?features=smoothscroll';
            document.head.appendChild(script);
            window.smoothScrollPolyfillLoaded = true;
        }
    }
}

// Enhanced notification styles (injected via JavaScript)
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .notification.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        padding: 16px;
        gap: 12px;
    }
    
    .notification-success { border-left: 4px solid #2ECC71; }
    .notification-error { border-left: 4px solid #FF6B6B; }
    .notification-warning { border-left: 4px solid #F39C12; }
    .notification-info { border-left: 4px solid #0077BE; }
    
    .notification-close {
        margin-left: auto;
        background: none;
        border: none;
        font-size: 20px;
        color: #666;
        cursor: pointer;
        padding: 4px;
    }
    
    .notification-close:hover {
        color: #333;
    }
    
    @media (max-width: 480px) {
        .notification {
            left: 20px;
            right: 20px;
            max-width: none;
        }
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize the app
const app = new ShoreSquadApp();

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShoreSquadApp;
}
