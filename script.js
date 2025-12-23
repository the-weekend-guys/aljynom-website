// Base JS file for AL JYNOM Technical Services landing page

// Smooth scrolling for internal navigation links
const navLinks = document.querySelectorAll('a[href^="#"]');

navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    e.preventDefault();
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });
}

// Simple quote form validation and feedback
const quoteForm = document.getElementById('quote-form');
const formMessage = document.querySelector('.form-message');

if (quoteForm && formMessage) {
  quoteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(quoteForm);
    const requiredFields = ['name', 'phone', 'email', 'service', 'details'];
    let hasError = false;

    requiredFields.forEach((field) => {
      const value = (formData.get(field) || '').toString().trim();
      if (!value) {
        hasError = true;
      }
    });

    if (hasError) {
      formMessage.textContent = 'Please fill in all required fields before submitting your request.';
      formMessage.classList.remove('success');
      formMessage.classList.add('error');
      return;
    }

    formMessage.textContent =
      'Thank you for reaching out. Our team will contact you shortly to discuss your project.';
    formMessage.classList.remove('error');
    formMessage.classList.add('success');

    // Optionally clear the form
    quoteForm.reset();
  });
}
