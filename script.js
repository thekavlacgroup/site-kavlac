// The Kavlac Group - Interactive JavaScript

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger icon
            const spans = hamburger.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(8px, 8px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                const target = document.querySelector(href);
                const offsetTop = target.offsetTop - 70;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar scroll effect
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        }
        
        lastScroll = currentScroll;
    });
    
    // Form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Get subject text
            const subjectSelect = document.getElementById('subject');
            const subjectText = subjectSelect.options[subjectSelect.selectedIndex].text;
            
            // Create mailto link
            const mailtoLink = `mailto:thekavlacgroup@gmail.com?subject=${encodeURIComponent('Contato: ' + subjectText)}&body=${encodeURIComponent(
                `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`
            )}`;
            
            // Open email client
            window.location.href = mailtoLink;
            
            // Show confirmation message
            alert('Seu cliente de email será aberto. Se não abrir automaticamente, envie um email para thekavlacgroup@gmail.com');
            
            // Optional: Reset form
            // contactForm.reset();
        });
    }
    
    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card, .value-item, .support-card, .content-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // FAQ auto-expand from URL hash
    if (window.location.hash) {
        const faqItem = document.querySelector(window.location.hash);
        if (faqItem && faqItem.tagName === 'DETAILS') {
            faqItem.open = true;
            setTimeout(() => {
                faqItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }
});

// Add active state to current page in navigation
window.addEventListener('load', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
});

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

/* ---------------------------
   Integração: carregar comunidade (data/testers.json)
   - Ordena por data (dd/mm/yyyy) mais recente primeiro
   - Gera avatar com iniciais e cor
   --------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    const colabData = document.getElementById("colab-data");
    if (!colabData) return;

    // util: parse dd/mm/yyyy -> Date
    function parseBRDate(str) {
        if (!str) return null;
        const parts = str.split('/');
        if (parts.length !== 3) return null;
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }

    // util: generate color from string
    function stringToColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash) % 360;
        return `hsl(${h} 70% 55%)`;
    }

    // util: initials
    function initialsFromName(name) {
        if (!name) return '';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
        return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
    }

    fetch("data/testers.json", { cache: "no-store" })
        .then(response => {
            if (!response.ok) throw new Error("Arquivo não encontrado ou erro de rede");
            return response.json();
        })
        .then(membros => {
            if (!Array.isArray(membros) || membros.length === 0) {
                colabData.innerHTML = '<div class="content-card"><p>Nenhum membro encontrado.</p></div>';
                return;
            }

            // map with parsed date
            const mapped = membros.map(m => {
                const parsed = parseBRDate(m.data);
                return {
                    nome: m.nome || '',
                    origem: m.origem || '',
                    data: m.data || '',
                    dateObj: parsed || new Date(0)
                };
            });

            // sort desc by dateObj
            mapped.sort((a,b) => b.dateObj - a.dateObj);

            // build HTML grid of support-card
            let html = '';
            mapped.forEach(m => {
                const safeNome = String(m.nome).replace(/</g, "&lt;");
                const safeOrigem = String(m.origem).replace(/</g, "&lt;");
                const safeData = String(m.data).replace(/</g, "&lt;");
                const initials = initialsFromName(safeNome);
                const bg = stringToColor(safeNome);

                html += `
                    <div class="support-card">
                        <div class="support-icon" style="display:flex;align-items:center;gap:12px;">
                            <div style="width:56px;height:56px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:${bg};color:white;font-weight:700;font-size:1.1rem;">
                                ${initials}
                            </div>
                            <div style="flex:1;">
                                <h3 style="margin:0 0 6px 0;">${safeNome}</h3>
                                <p style="margin:0;color:var(--text-medium);font-size:0.95rem;"><strong>Origem:</strong> ${safeOrigem}</p>
                            </div>
                        </div>
                        <div style="margin-top:12px;color:var(--text-light);font-size:0.95rem;"><strong>Data:</strong> ${safeData}</div>
                    </div>
                `;
            });

            colabData.innerHTML = html;
        })
        .catch(err => {
            console.error("Erro ao carregar testers.json:", err);
            colabData.innerHTML = '<div class="content-card"><p>❌ Erro ao carregar dados da comunidade. Tente novamente mais tarde.</p></div>';
        });
});

