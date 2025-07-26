// Navigation functionality
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Enhanced mobile menu toggle
    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('nav-open');
        
        // Add haptic feedback for mobile
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    });

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
        });
    });

    // Close menu when clicking outside (mobile)
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('nav-open');
            }
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
        }
    });

    // Enhanced navbar scroll behavior
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });

    // Add active state to current page navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
            link.parentElement.classList.add('active');
        }
    });

    // Enhanced navigation with smooth transitions
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Only prevent default for anchor links (starting with #)
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);

                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            } else {
                // For page navigation, add smooth transition effect
                e.preventDefault();
                
                // Add transition class
                document.body.classList.add('page-transition');
                
                // Navigate after transition
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            }
        });
        
        // Add ripple effect on click
        link.addEventListener('mousedown', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function () {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.exhibition-card, .stat-item, .featured-text, .featured-image');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Contact form submission
    const contactForm = document.querySelector('.contact-form');
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');

        // Form validation
        if (!name || !email || !subject || !message) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Create email content
        const emailSubject = encodeURIComponent(`Contact Form: ${subject}`);
        const emailBody = encodeURIComponent(
            `Name: ${name}\n` +
            `Email: ${email}\n` +
            `Subject: ${subject}\n\n` +
            `Message:\n${message}\n\n` +
            `---\n` +
            `This message was sent from the Runako Pictures contact form.`
        );

        // Create mailto link
        const mailtoLink = `mailto:runakopictures@gmail.com?subject=${emailSubject}&body=${emailBody}`;

        // Open email client
        window.location.href = mailtoLink;

        // Show success message
        showMessage('Your email client should open with the message pre-filled. Please send the email to complete your inquiry.', 'success');

        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        // Reset form after a short delay
        setTimeout(() => {
            this.reset();
        }, 1000);
    });

    // Function to show messages
    function showMessage(message, type) {
        // Remove existing message
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.textContent = message;

        // Insert message before the form
        const contactSection = document.querySelector('#contact .container');
        contactSection.insertBefore(messageDiv, contactSection.firstChild);

        // Auto-remove message after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Parallax effect for hero section
    window.addEventListener('scroll', function () {
        const scrolled = window.pageYOffset;
        const heroImage = document.querySelector('.hero-image');
        if (heroImage) {
            heroImage.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
});

// Exhibition modal functionality
function openExhibition(exhibitionId) {
    const modal = document.getElementById('exhibition-modal');
    const content = document.getElementById('exhibition-content');

    // Exhibition data
    const exhibitions = {
        'urban-landscapes': {
            title: 'Urban Landscapes',
            description: 'Exploring the intersection of architecture and human experience in modern cityscapes.',
            date: 'March 2024',
            images: [
                'https://images.pexels.com/photos/1181248/pexels-photo-1181248.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
            ],
            details: 'This exhibition captures the dynamic relationship between urban architecture and the human experience. Through a series of carefully composed photographs, we explore how modern cityscapes shape our daily lives and emotional responses to our built environment.'
        },
        'natural-moments': {
            title: 'Natural Moments',
            description: 'Capturing the fleeting beauty of nature through intimate and powerful imagery.',
            date: 'February 2024',
            images: [
                'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/1408221/pexels-photo-1408221.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/1274260/pexels-photo-1274260.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
            ],
            details: 'A celebration of nature\'s ephemeral beauty, this collection focuses on those precious moments when light, weather, and landscape converge to create something truly magical. Each image tells a story of patience, observation, and deep connection with the natural world.'
        },
        'human-stories': {
            title: 'Human Stories',
            description: 'Portraits that reveal the depth and complexity of human emotion and experience.',
            date: 'January 2024',
            images: [
                'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
            ],
            details: 'Through intimate portraiture, this exhibition explores the rich tapestry of human experience. Each photograph captures not just a face, but a story, an emotion, a moment in time that speaks to our shared humanity and individual uniqueness.'
        },
        'abstract-visions': {
            title: 'Abstract Visions',
            description: 'Experimental photography exploring form, color, and conceptual boundaries.',
            date: 'December 2023',
            images: [
                'https://images.pexels.com/photos/1183021/pexels-photo-1183021.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/1089440/pexels-photo-1089440.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
                'https://images.pexels.com/photos/1183099/pexels-photo-1183099.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
            ],
            details: 'This experimental collection pushes the boundaries of traditional photography, exploring abstract concepts through innovative techniques. Each piece challenges viewers to see beyond the obvious, discovering new meanings in form, color, and composition.'
        }
    };

    const exhibition = exhibitions[exhibitionId];

    if (exhibition) {
        let imagesHTML = '';
        exhibition.images.forEach((image, index) => {
            imagesHTML += `
                <div class="exhibition-image-item">
                    <img src="${image}" alt="${exhibition.title} - Image ${index + 1}">
                </div>
            `;
        });

        content.innerHTML = `
            <div class="exhibition-modal-content">
                <h2>${exhibition.title}</h2>
                <p class="exhibition-modal-date">${exhibition.date}</p>
                <p class="exhibition-modal-description">${exhibition.description}</p>
                
                <div class="exhibition-images-grid">
                    ${imagesHTML}
                </div>
                
                <div class="exhibition-details">
                    <h3>About This Exhibition</h3>
                    <p>${exhibition.details}</p>
                </div>
                
                <div class="exhibition-modal-actions">
                    <button class="secondary-button" onclick="closeExhibition()">Close</button>
                </div>
            </div>
        `;

        // Add styles for modal content
        const modalStyles = `
            <style>
                .exhibition-modal-content h2 {
                    font-family: 'Playfair Display', serif;
                    font-size: 2.5rem;
                    color: #2c3e50;
                    margin-bottom: 0.5rem;
                }
                
                .exhibition-modal-date {
                    color: #e74c3c;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }
                
                .exhibition-modal-description {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: #555;
                    margin-bottom: 2rem;
                }
                
                .exhibition-images-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                
                .exhibition-image-item img {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                    border-radius: 8px;
                    transition: transform 0.3s ease;
                }
                
                .exhibition-image-item img:hover {
                    transform: scale(1.05);
                }
                
                .exhibition-details h3 {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.5rem;
                    color: #2c3e50;
                    margin-bottom: 1rem;
                }
                
                .exhibition-details p {
                    line-height: 1.8;
                    color: #555;
                    margin-bottom: 2rem;
                }
                
                .exhibition-modal-actions {
                    text-align: center;
                }
                
                @media (max-width: 768px) {
                    .exhibition-images-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .exhibition-modal-content h2 {
                        font-size: 2rem;
                    }
                }
            </style>
        `;

        content.innerHTML = modalStyles + content.innerHTML;
        modal.style.display = 'block';

        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }
}

function closeExhibition() {
    const modal = document.getElementById('exhibition-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('exhibition-modal');
    if (event.target === modal) {
        closeExhibition();
    }
}

// Add loading animation for images
document.addEventListener('DOMContentLoaded', function () {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        img.addEventListener('load', function () {
            this.style.opacity = '1';
        });

        // Set initial opacity for smooth loading
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease';
    });
});

// Add scroll-triggered animations
function addScrollAnimations() {
    const elements = document.querySelectorAll('.exhibition-card, .stat-item, .contact-item');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, observerOptions);

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', addScrollAnimations);