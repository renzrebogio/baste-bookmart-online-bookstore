document.addEventListener('DOMContentLoaded', function() {
    const profileIcon = document.getElementById('profile-icon');
    const profileDropdown = document.getElementById('profile-dropdown');

    // Toggle dropdown when clicking profile icon
    profileIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking anywhere else on the page
    document.addEventListener('click', function(e) {
        if (!profileDropdown.contains(e.target) && !profileIcon.contains(e.target)) {
            profileDropdown.classList.remove('show');
        }
    });

    // Logout function
    window.logout = function() {
        // Clear any stored user data
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        // Redirect to login page
        window.location.href = 'login.html';
    };

    // Slideshow functionality
    let currentSlide = 0;
    const slides = document.querySelector(".slides");
    const slideImages = document.querySelectorAll(".slides img");
    const dots = document.querySelectorAll(".dot");
    let slideInterval; // Variable to store the interval

    function showSlide(index) {
        if (index >= slideImages.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = slideImages.length - 1;
        } else {
            currentSlide = index;
        }

        slides.style.transform = `translateX(-${currentSlide * 100}%)`;

        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === currentSlide);
        });
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
        resetInterval(); // Reset the interval timer when manually changing slides
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
        resetInterval(); // Reset the interval timer when manually changing slides
    }

    function goToSlide(index) {
        showSlide(index);
        resetInterval(); // Reset the interval timer when manually changing slides
    }

    // Function to start or reset the interval
    function resetInterval() {
        // Clear the existing interval
        clearInterval(slideInterval);
        // Set a new interval
        slideInterval = setInterval(nextSlide, 5000);
    }

    document.querySelector('.prev').addEventListener('click', prevSlide);
    document.querySelector('.next').addEventListener('click', nextSlide);

    // Initialize dots click events if present
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => goToSlide(i));
    });

    // Start the initial interval
    resetInterval();
});
