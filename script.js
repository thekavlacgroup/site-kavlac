/* script.js
   - Mobile menu toggle
   - Smooth scroll
   - Navbar scroll effect
   - Form handling (mailto)
   - Intersection animations
   - Community loader: fetch data/testers.json, sort by date (desc), avatar initials, "novo" badge for 7 days
*/

/* Utility helpers */
function qs(selector, ctx = document) { return ctx.querySelector(selector); }
function qsa(selector, ctx = document) { return Array.from(ctx.querySelectorAll(selector)); }
function sanitize(str) { return String(str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* DOM ready */
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu
  const hamburger = qs('#hamburger');
  const navMenu = qs('#navMenu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const spans = qsa('#hamburger span');
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

  // Close mobile menu on link click
  qsa('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        const spans = qsa('#hamburger span');
        spans.forEach(s => { s.style.transform = 'none'; s.style.opacity = '1'; });
      }
    });
  });

  // Smooth scrolling for anchors
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || !document.querySelector(href)) return;
      e.preventDefault();
      const target = document.querySelector(href);
      const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  });

  // Navbar shadow on scroll
  const navbar = qs('.navbar');
  window.addEventListener('scroll', () => {
    const current = window.pageYOffset;
    if (current > 100) navbar.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
    else navbar.style.boxShadow = '0 1px 2px 0 rgba(0,0,0,0.05)';
  });

  // Contact form mailto
  const contactForm = qs('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = sanitize(qs('#name').value);
      const email = sanitize(qs('#email').value);
      const subjectSelect = qs('#subject');
      const subjectText = subjectSelect ? sanitize(subjectSelect.options[subjectSelect.selectedIndex].text) : 'Contato';
      const message = sanitize(qs('#message').value);
      const mailto = `mailto:thekavlacgroup@gmail.com?subject=${encodeURIComponent('Contato: ' + subjectText)}&body=${encodeURIComponent(`Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`)}`;
      window.location.href = mailto;
      alert('Seu cliente de email será aberto. Se não abrir automaticamente, envie um email para thekavlacgroup@gmail.com');
    });
  }

  // Intersection animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

  qsa('.feature-card, .value-item, .support-card, .content-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // FAQ auto-open from hash
  if (window.location.hash) {
    const el = document.querySelector(window.location.hash);
    if (el && el.tagName === 'DETAILS') {
      el.open = true;
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }
});

/* Add active state to nav based on current page */
window.addEventListener('load', () => {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  qsa('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) link.classList.add('active');
  });
});

/* Prevent form resubmission on refresh */
if (window.history.replaceState) window.history.replaceState(null, null, window.location.href);

/* ---------------------------
   Community loader
   - fetch data/testers.json
   - sort by date (dd/mm/yyyy) desc
   - generate avatar initials + color
   - badge "Novo" for items within last 7 days
   --------------------------- */
(function communityLoader() {
  function parseBRDate(str) {
    if (!str) return null;
    const parts = String(str).split('/');
    if (parts.length !== 3) return null;
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    return new Date(y, m, d);
  }

  function initials(name) {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function colorFromString(s) {
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h} 70% 45%)`;
  }

  function daysBetween(a, b) {
    const ms = Math.abs(a - b);
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('colab-data');
    if (!container) return;

    fetch('data/testers.json', { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          container.innerHTML = '<div class="content-card"><p>Nenhum membro encontrado.</p></div>';
          return;
        }

        // Map and parse dates
        const mapped = data.map(item => {
          const dateObj = parseBRDate(item.data) || new Date(0);
          return {
            nome: sanitize(item.nome),
            origem: sanitize(item.origem),
            data: sanitize(item.data),
            dateObj
          };
        });

        // Sort desc by date
        mapped.sort((a, b) => b.dateObj - a.dateObj);

        // Build HTML
        const now = new Date();
        const html = mapped.map(m => {
          const ini = initials(m.nome);
          const bg = colorFromString(m.nome);
          const isNew = m.dateObj && daysBetween(now, m.dateObj) <= 7;
          return `
            <div class="support-card">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:56px;height:56px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:${bg};color:#fff;font-weight:700;font-size:1.05rem;">
                  ${ini}
                </div>
                <div style="flex:1;">
                  <h3 style="margin:0 0 6px 0;">${m.nome} ${isNew ? '<span style="background:#10b981;color:#fff;padding:4px 8px;border-radius:999px;font-size:0.75rem;margin-left:8px;">Novo</span>' : ''}</h3>
                  <p style="margin:0;color:var(--text-medium);font-size:0.95rem;"><strong>Origem:</strong> ${m.origem}</p>
                </div>
              </div>
              <div style="margin-top:12px;color:var(--text-light);font-size:0.95rem;"><strong>Data:</strong> ${m.data}</div>
            </div>
          `;
        }).join('');

        container.innerHTML = html;
      })
      .catch(err => {
        console.error('Erro ao carregar testers.json:', err);
        container.innerHTML = '<div class="content-card"><p>❌ Erro ao carregar dados da comunidade. Tente novamente mais tarde.</p></div>';
      });
  });
})();

