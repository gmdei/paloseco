// ==========================================================================
// PALO SECO - JAVASCRIPT LOGIC WITH GOOGLE AUTHENTICATION & ADMIN PANEL
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- STATE MANAGEMENT ---
    const ADMIN_EMAIL = "mgregoriomartinez@gmail.com";
    let isAdminLoggedIn = false;

    // Load states from LocalStorage or Fallbacks
    let siteInfo = JSON.parse(localStorage.getItem('ps_site_info')) || {
        heroTitle: "Artesanías y educación artística elevadas a su mayor expresión",
        heroDesc: "Combinamos el rescate de piezas en madera con la educación artística y la creación de obras únicas que resaltan la identidad local."
    };

    let carouselImages = JSON.parse(localStorage.getItem('ps_carousel_images')) || [
        "PHOTO-2026-07-07-13-41-25.jpg",
        "PHOTO-2026-07-07-13-41-28.jpg",
        "PHOTO-2026-07-07-13-41-30.jpg"
    ];
    let currentSlideIndex = 0;
    let carouselIntervalId = null;

    let calendarEvents = JSON.parse(localStorage.getItem('ps_calendar_events')) || {
        "2026-7-8": {
            title: "Taller de Pintura Textil",
            tag: "Diseño Textil",
            time: "10:00 AM - 1:00 PM",
            desc: "Aprende a plasmar tus diseños artísticos sobre telas utilizando técnicas de fijación y pintura acrílica especializada para tejidos."
        },
        "2026-7-15": {
            title: "Taller Iniciación al Arte con Resina",
            tag: "Resina",
            time: "2:00 PM - 5:00 PM",
            desc: "Crea hermosas piezas decorativas y portavasos experimentando con resina epóxica, flores prensadas y pigmentos metálicos."
        },
        "2026-7-22": {
            title: "Restauración de Muebles Rústicos",
            tag: "Madera",
            time: "9:00 AM - 1:00 PM",
            desc: "Aprende el proceso básico de lijado, curado de madera, técnicas de pintura a la tiza y encerado tradicional para dar nueva vida a tus muebles."
        },
        "2026-7-29": {
            title: "Exhibición de Bendición de Puertas",
            tag: "Arte Sacro",
            time: "4:00 PM - 7:00 PM",
            desc: "Ven a conocer de cerca nuestra exclusiva colección de Bendición de Puertas firmadas, con certificado de derecho de autor."
        }
    };

    let galleryImages = JSON.parse(localStorage.getItem('ps_gallery_images')) || [
        { src: "PHOTO-2026-07-07-13-41-25.jpg", alt: "Restauración de madera Palo Seco", desc: "Rescate de piezas y muebles antiguos", category: "madera" },
        { src: "PHOTO-2026-07-07-13-41-26.jpg", alt: "Pieza de madera rústica Palo Seco", desc: "Trabajos detallados y texturas", category: "madera" },
        { src: "PHOTO-2026-07-07-13-41-27.jpg", alt: "Proceso de lijado y acabado", desc: "Técnicas de barnizado y protección", category: "madera" },
        { src: "PHOTO-2026-07-07-13-41-28.jpg", alt: "Taller de arte en resina", desc: "Combinación de color y transparencia", category: "resina" },
        { src: "PHOTO-2026-07-07-13-41-29.jpg", alt: "Clase de resina y pintura", desc: "Alumnos creando piezas personalizadas", category: "resina" },
        { src: "PHOTO-2026-07-07-13-41-30.jpg", alt: "Bendición de puertas de autor", desc: "Diseño exclusivo y marca registrada", category: "sacro" },
        { src: "PHOTO-2026-07-07-13-41-31.jpg", alt: "Souvenirs denarios y mini bendiciones", desc: "Artesanía fina de arte sacro", category: "sacro" },
        { src: "PHOTO-2026-07-07-13-41-27(1).jpg", alt: "Artesanía y tarjetería fina", desc: "Detalles decorados con algodón y papel fino", category: "sacro" }
    ];

    const defaultServices = [
        { num: "01", title: "Taller Multidisciplinario", desc: "Espacio creativo ideal para aprender técnicas avanzadas en diseño textil, pintura, madera y resina con guía profesional." },
        { num: "02", title: "Tienda de Insumos", desc: "Contamos con un amplio catálogo de materiales de alta calidad cuidadosamente seleccionados para crear tus propias obras de arte." },
        { num: "03", title: "Restauración Experta", desc: "Servicio especializado de reparación y renovación profesional que devuelve la vida y el esplendor a tus muebles y piezas de madera." },
        { num: "04", title: "Bendición de Puertas", desc: "Creadores de las exclusivas Bendiciones de Puertas únicas en el mercado; con certificado de derecho de autor y marca registrada.", highlight: true },
        { num: "05", title: "Tarjetería Personalizada", desc: "Diseños únicos en papel y papelería fina elaborados a mano para complementar cualquier obsequio o evento especial." }
    ];

    // --- DOM ELEMENTS RENDER ---
    function renderStaticContent() {
        document.getElementById('editable-hero-title').textContent = siteInfo.heroTitle;
        document.getElementById('editable-hero-desc').textContent = siteInfo.heroDesc;

        // Render services
        const servicesContainer = document.getElementById('services-container');
        if (servicesContainer) {
            servicesContainer.innerHTML = defaultServices.map(s => `
                <div class="service-card ${s.highlight ? 'highlight-card' : ''}">
                    <div class="service-icon-wrapper">
                        <span class="service-num">${s.num}</span>
                    </div>
                    <h3>${s.title}</h3>
                    <p>${s.desc}</p>
                </div>
            `).join('');
        }
    }

    function renderHeroCarousel() {
        const carouselContainer = document.getElementById('hero-carousel');
        if (!carouselContainer) return;
        
        if (carouselImages.length === 0) {
            carouselContainer.innerHTML = '<div class="hero-slide active" style="background-color: var(--color-bg-alt);"></div>';
            return;
        }
        
        carouselContainer.innerHTML = carouselImages.map((imgSrc, index) => `
            <div class="hero-slide ${index === 0 ? 'active' : ''}" style="background-image: url('${imgSrc}');"></div>
        `).join('');
        
        currentSlideIndex = 0;
        startCarouselTimer();
    }

    function startCarouselTimer() {
        if (carouselIntervalId) clearInterval(carouselIntervalId);
        if (carouselImages.length <= 1) return;
        
        carouselIntervalId = setInterval(() => {
            const slides = document.querySelectorAll('#hero-carousel .hero-slide');
            if (slides.length === 0) return;
            
            slides[currentSlideIndex].classList.remove('active');
            currentSlideIndex = (currentSlideIndex + 1) % slides.length;
            slides[currentSlideIndex].classList.add('active');
        }, 5000);
    }

    function renderGallery() {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        grid.innerHTML = galleryImages.map(img => `
            <div class="gallery-item" data-category="${img.category}">
                <img src="${img.src}" alt="${img.alt}">
                <div class="gallery-overlay">
                    <h4>${img.alt}</h4>
                    <p>${img.desc}</p>
                </div>
            </div>
        `).join('');
        
        // Reapply filter events since elements are redrawn
        const activeFilter = document.querySelector('.filter-btn.active');
        if (activeFilter) {
            applyGalleryFilter(activeFilter.getAttribute('data-filter'));
        }
    }

    function applyGalleryFilter(filterValue) {
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            const category = item.getAttribute('data-category');
            if (filterValue === 'all' || category === filterValue) {
                item.classList.remove('hidden-item');
            } else {
                item.classList.add('hidden-item');
            }
        });
    }

    // --- MOBILE MENU ---
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            navMenu.classList.toggle('open');
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('open');
                navMenu.classList.remove('open');
            });
        });
    }

    // Active link highlighting on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= (sectionTop - 120)) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // --- INTERACTIVE CALENDAR ---
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const calendarDays = document.getElementById('calendar-days');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const eventDetailsBox = document.getElementById('event-details-box');
    const eventDetailsContent = document.getElementById('event-details-content');
    const eventPlaceholder = eventDetailsBox ? eventDetailsBox.querySelector('.event-details-placeholder') : null;

    let currentDate = new Date(2026, 7, 16); // Starting centered at August 2026 (Month index 7)
    let activeYear = currentDate.getFullYear();
    let activeMonth = currentDate.getMonth();

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    function renderCalendar(year, month) {
        if (!calendarDays || !calendarMonthYear) return;
        calendarDays.innerHTML = "";
        calendarMonthYear.textContent = `${monthNames[month]} ${year}`;

        const firstDayIndex = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayIndex; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('empty');
            calendarDays.appendChild(emptyDiv);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = day;
            const dateKey = `${year}-${month}-${day}`;
            
            if (calendarEvents[dateKey]) {
                dayDiv.classList.add('has-event');
            }

            dayDiv.addEventListener('click', () => {
                calendarDays.querySelectorAll('div').forEach(d => d.classList.remove('active-day'));
                dayDiv.classList.add('active-day');
                showEventDetails(dateKey);
            });

            calendarDays.appendChild(dayDiv);
        }
    }

    function showEventDetails(dateKey) {
        if (!eventDetailsContent || !eventPlaceholder) return;
        const event = calendarEvents[dateKey];
        if (event) {
            eventPlaceholder.style.display = 'none';
            eventDetailsContent.classList.remove('hidden');
            document.getElementById('event-detail-tag').textContent = event.tag;
            document.getElementById('event-detail-title').textContent = event.title;
            document.getElementById('event-detail-time').textContent = event.time;
            document.getElementById('event-detail-desc').textContent = event.desc;
            
            const whatsappBtn = document.getElementById('event-detail-whatsapp-btn');
            if (whatsappBtn) {
                whatsappBtn.textContent = "Pedir información por WhatsApp";
                whatsappBtn.href = `https://wa.me/18295550199?text=${encodeURIComponent('Hola, me interesa pedir información sobre el curso: ' + event.title)}`;
            }
        } else {
            eventPlaceholder.style.display = 'block';
            eventDetailsContent.classList.add('hidden');
        }
    }

    if (prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            activeMonth--;
            if (activeMonth < 0) { activeMonth = 11; activeYear--; }
            renderCalendar(activeYear, activeMonth);
            resetEventDetails();
        });
        nextMonthBtn.addEventListener('click', () => {
            activeMonth++;
            if (activeMonth > 11) { activeMonth = 0; activeYear++; }
            renderCalendar(activeYear, activeMonth);
            resetEventDetails();
        });
    }

    function resetEventDetails() {
        if (eventPlaceholder && eventDetailsContent) {
            eventPlaceholder.style.display = 'block';
            eventDetailsContent.classList.add('hidden');
        }
    }

    // --- GOOGLE AUTHENTICATION & LOGIN DIALOG ---
    const adminNavBtn = document.getElementById('admin-nav-btn');
    const authModal = document.getElementById('auth-modal');
    const authCloseBtn = document.getElementById('auth-close-btn');
    const simEmailInput = document.getElementById('sim-email');
    const simLoginSubmit = document.getElementById('sim-login-submit');
    const authErrorMsg = document.getElementById('auth-error-msg');
    
    const adminPanelModal = document.getElementById('admin-panel-modal');
    const adminCloseBtn = document.getElementById('admin-close-btn');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');

    // Trigger Auth Modal
    if (adminNavBtn) {
        adminNavBtn.addEventListener('click', () => {
            if (isAdminLoggedIn) {
                openAdminPanel();
            } else {
                authModal.classList.remove('hidden');
                initGoogleSignIn();
            }
        });
    }

    // Close Auth Modal
    if (authCloseBtn) {
        authCloseBtn.addEventListener('click', () => {
            authModal.classList.add('hidden');
            authErrorMsg.classList.add('hidden');
        });
    }

    // Google Sign-In GIS Initialization
    function initGoogleSignIn() {
        if (typeof google !== 'undefined') {
            google.accounts.id.initialize({
                client_id: '999999999999-mockclientid.apps.googleusercontent.com', // MOCK ID - will run locally
                callback: handleGoogleCredentialResponse
            });
            google.accounts.id.renderButton(
                document.getElementById('google-signin-button'),
                { theme: 'outline', size: 'large', text: 'signin_with' }
            );
        }
    }

    // Callback on successful Google Sign-In
    function handleGoogleCredentialResponse(response) {
        try {
            // Decodes standard JWT payload returned by Google
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const googleUser = JSON.parse(jsonPayload);
            verifyAndLogin(googleUser.email);
        } catch (e) {
            showAuthError("Error decodificando credenciales de Google.");
        }
    }

    // Simulated local fallback sign in
    if (simLoginSubmit) {
        simLoginSubmit.addEventListener('click', (e) => {
            e.preventDefault();
            const inputEmail = simEmailInput.value.trim().toLowerCase();
            verifyAndLogin(inputEmail);
        });
    }

    function verifyAndLogin(email) {
        if (email === ADMIN_EMAIL) {
            isAdminLoggedIn = true;
            localStorage.setItem('ps_admin_logged', 'true');
            
            // Hide auth box, open Dashboard
            authModal.classList.add('hidden');
            authErrorMsg.classList.add('hidden');
            openAdminPanel();
            
            // Change nav button look
            adminNavBtn.classList.add('active');
        } else {
            showAuthError("Acceso denegado: El correo no está autorizado.");
        }
    }

    function showAuthError(msg) {
        if (authErrorMsg) {
            authErrorMsg.textContent = msg;
            authErrorMsg.classList.remove('hidden');
        }
    }

    // Admin Logout
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            isAdminLoggedIn = false;
            localStorage.removeItem('ps_admin_logged');
            adminPanelModal.classList.add('hidden');
            adminNavBtn.classList.remove('active');
        });
    }

    // Check login state on load
    if (localStorage.getItem('ps_admin_logged') === 'true') {
        verifyAndLogin(ADMIN_EMAIL);
    }


    // --- ADMIN PANEL DASHBOARD CONTROLS ---
    
    function openAdminPanel() {
        if (adminPanelModal) {
            adminPanelModal.classList.remove('hidden');
            
            // Populate form fields with current states
            document.getElementById('edit-hero-title').value = siteInfo.heroTitle;
            document.getElementById('edit-hero-desc').value = siteInfo.heroDesc;
            
            // Render active lists in admin panel
            renderAdminEventsList();
            renderAdminImagesList();
            renderAdminCarouselList();
        }
    }

    if (adminCloseBtn) {
        adminCloseBtn.addEventListener('click', () => {
            adminPanelModal.classList.add('hidden');
        });
    }

    // Tab Switching inside Dashboard
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Save general info edits
    const saveInfoBtn = document.getElementById('save-info-btn');
    if (saveInfoBtn) {
        saveInfoBtn.addEventListener('click', () => {
            siteInfo.heroTitle = document.getElementById('edit-hero-title').value.trim();
            siteInfo.heroDesc = document.getElementById('edit-hero-desc').value.trim();
            
            localStorage.setItem('ps_site_info', JSON.stringify(siteInfo));
            renderStaticContent();
            alert("¡Información general actualizada con éxito!");
        });
    }

    // Manage Calendar events inside panel
    const addEventBtn = document.getElementById('add-event-btn');
    function renderAdminEventsList() {
        const container = document.getElementById('admin-events-list');
        if (!container) return;

        container.innerHTML = Object.entries(calendarEvents).map(([dateKey, ev]) => {
            const [y, m, d] = dateKey.split('-');
            const formattedDate = `${parseInt(d)} de ${monthNames[parseInt(m)]} ${y}`;
            return `
                <div class="admin-list-item">
                    <div class="admin-list-item-info">
                        <strong>${ev.title}</strong>
                        <span>📅 ${formattedDate} | 🕒 ${ev.time}</span>
                    </div>
                    <button class="btn-delete" data-datekey="${dateKey}">Borrar</button>
                </div>
            `;
        }).join('');

        // Apply delete events
        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.getAttribute('data-datekey');
                delete calendarEvents[key];
                localStorage.setItem('ps_calendar_events', JSON.stringify(calendarEvents));
                renderAdminEventsList();
                renderCalendar(activeYear, activeMonth);
                resetEventDetails();
            });
        });
    }

    if (addEventBtn) {
        addEventBtn.addEventListener('click', () => {
            const rawDate = document.getElementById('new-event-date').value;
            const title = document.getElementById('new-event-title').value.trim();
            const tag = document.getElementById('new-event-tag').value.trim();
            const time = document.getElementById('new-event-time').value.trim();
            const desc = document.getElementById('new-event-desc').value.trim();

            if (!rawDate || !title || !tag || !time || !desc) {
                alert("Por favor rellene todos los campos de la actividad.");
                return;
            }

            const dateObj = new Date(rawDate + 'T00:00:00');
            const key = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;

            calendarEvents[key] = { title, tag, time, desc };
            localStorage.setItem('ps_calendar_events', JSON.stringify(calendarEvents));

            // Reset inputs
            document.getElementById('new-event-date').value = "";
            document.getElementById('new-event-title').value = "";
            document.getElementById('new-event-tag').value = "";
            document.getElementById('new-event-time').value = "";
            document.getElementById('new-event-desc').value = "";

            renderAdminEventsList();
            renderCalendar(activeYear, activeMonth);
            alert("¡Actividad añadida al calendario con éxito!");
        });
    }

    // Manage Gallery images inside panel
    const addImgBtn = document.getElementById('add-img-btn');
    function renderAdminImagesList() {
        const container = document.getElementById('admin-images-list');
        if (!container) return;

        container.innerHTML = galleryImages.map((img, index) => `
            <div class="admin-list-item">
                <div class="admin-list-item-info">
                    <strong>${img.alt}</strong>
                    <span>Categoría: ${img.category}</span>
                </div>
                <button class="btn-delete" data-index="${index}">Quitar</button>
            </div>
        `).join('');

        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                galleryImages.splice(idx, 1);
                localStorage.setItem('ps_gallery_images', JSON.stringify(galleryImages));
                renderAdminImagesList();
                renderGallery();
            });
        });
    }

    if (addImgBtn) {
        addImgBtn.addEventListener('click', () => {
            const src = document.getElementById('new-img-url').value.trim();
            const alt = document.getElementById('new-img-alt').value.trim();
            const desc = document.getElementById('new-img-desc').value.trim();
            const category = document.getElementById('new-img-cat').value;

            if (!src || !alt || !desc) {
                alert("Por favor rellene todos los campos del catálogo.");
                return;
            }

            galleryImages.push({ src, alt, desc, category });
            localStorage.setItem('ps_gallery_images', JSON.stringify(galleryImages));

            // Reset inputs
            document.getElementById('new-img-url').value = "";
            document.getElementById('new-img-alt').value = "";
            document.getElementById('new-img-desc').value = "";

            renderAdminImagesList();
            renderGallery();
            alert("¡Imagen añadida con éxito al catálogo!");
        });
    }

    // Manage Carousel images inside panel
    const addCarouselBtn = document.getElementById('add-carousel-btn');
    function renderAdminCarouselList() {
        const container = document.getElementById('admin-carousel-list');
        if (!container) return;

        container.innerHTML = carouselImages.map((img, index) => `
            <div class="admin-list-item">
                <div class="admin-list-item-info">
                    <strong>Imagen ${index + 1}</strong>
                    <span class="admin-url-text">${img}</span>
                </div>
                <button class="btn-delete" data-index="${index}">Quitar</button>
            </div>
        `).join('');

        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                carouselImages.splice(idx, 1);
                localStorage.setItem('ps_carousel_images', JSON.stringify(carouselImages));
                renderAdminCarouselList();
                renderHeroCarousel();
            });
        });
    }

    if (addCarouselBtn) {
        addCarouselBtn.addEventListener('click', () => {
            const srcInput = document.getElementById('new-carousel-url');
            const src = srcInput.value.trim();

            if (!src) {
                alert("Por favor ingrese la URL de la imagen.");
                return;
            }

            carouselImages.push(src);
            localStorage.setItem('ps_carousel_images', JSON.stringify(carouselImages));

            srcInput.value = "";
            renderAdminCarouselList();
            renderHeroCarousel();
            alert("¡Imagen añadida con éxito al carrusel!");
        });
    }


    // --- INITIAL RENDER EXECUTION ---
    renderStaticContent();
    renderHeroCarousel();
    renderCalendar(activeYear, activeMonth);
    renderGallery();

    // Gallery filter button action
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            applyGalleryFilter(button.getAttribute('data-filter'));
        });
    });
});
