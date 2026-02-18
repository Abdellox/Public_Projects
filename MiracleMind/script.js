// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Newsletter form submission
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        
        // Show success message
        alert(`🎉 Welcome to the Economic Mindset Academy!\n\nThank you for subscribing with: ${email}\n\nYou'll receive:\n✓ Weekly insights from China & USA strategies\n✓ Practical problem-solving frameworks\n✓ Manufacturing and innovation case studies\n✓ Exclusive downloadable resources\n\nCheck your inbox for a welcome email!`);
        
        this.reset();
    });
}

// CTA button action
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', function() {
        const mindsetSection = document.querySelector('#mindset');
        if (mindsetSection) {
            mindsetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Unobserve after animation to improve performance
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections and cards for fade-in animation
document.addEventListener('DOMContentLoaded', function() {
    const elementsToAnimate = document.querySelectorAll(
        'section, .mindset-card, .problem-card, .lesson-card, .framework-card, .resource-category'
    );
    
    elementsToAnimate.forEach(element => {
        element.classList.add('fade-in');
        observer.observe(element);
    });
});


// Enhanced navbar on scroll
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add shadow when scrolled
    if (currentScroll > 50) {
        navbar.style.boxShadow = '0 6px 30px rgba(0,0,0,0.25)';
    } else {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
    }
    
    lastScroll = currentScroll;
});

// Download card interactions
const downloadCards = document.querySelectorAll('.download-card');
downloadCards.forEach(card => {
    card.addEventListener('click', function(e) {
        e.preventDefault();
        const title = this.querySelector('h4').textContent;
        alert(`📥 Downloading: ${title}\n\nThis is a demo. In production, this would download a PDF with:\n\n✓ Detailed frameworks and templates\n✓ Step-by-step implementation guides\n✓ Real-world examples and case studies\n✓ Actionable checklists\n\nStay tuned for the full resource library!`);
    });
});

// Add hover effect to lesson cards
const lessonCards = document.querySelectorAll('.lesson-card');
lessonCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.borderLeft = '5px solid var(--china-gold)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.borderLeft = 'none';
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', function() {
    const hero = document.querySelector('.hero');
    if (hero) {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        hero.style.transform = `translateY(${parallax}px)`;
    }
});

// Counter animation for statistics (if you add stats later)
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start).toLocaleString();
        }
    }, 16);
}

// Track user engagement
let timeOnPage = 0;
setInterval(() => {
    timeOnPage++;
    // Could send analytics data here
}, 1000);

// Log page sections viewed
const sectionsViewed = new Set();
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            if (sectionId && !sectionsViewed.has(sectionId)) {
                sectionsViewed.add(sectionId);
                console.log(`Section viewed: ${sectionId}`);
                // Could send analytics event here
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('section[id]').forEach(section => {
    sectionObserver.observe(section);
});

// Mobile menu toggle (for future enhancement)
function createMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar .container');
    
    if (window.innerWidth <= 768) {
        // Mobile menu logic can be added here
        console.log('Mobile view detected');
    }
}

window.addEventListener('resize', createMobileMenu);
createMobileMenu();

// Print functionality
function printPage() {
    window.print();
}

// Share functionality (for future social sharing)
function shareContent(platform) {
    const url = window.location.href;
    const title = document.title;
    
    const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`
    };
    
    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
}

// Console welcome message
console.log('%c🌏 Welcome to Economic Mindset Academy!', 'font-size: 20px; font-weight: bold; color: #DE2910;');
console.log('%cLearn the secrets of China & USA economic success', 'font-size: 14px; color: #002868;');
console.log('%cBuilt with passion for learning and growth 🚀', 'font-size: 12px; color: #27ae60;');
