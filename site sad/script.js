'use strict';

/* ============================================================
   НАСТРОЙКИ
   ВАЖНО: не храните реальный токен бота в клиентском коде —
   его видит любой посетитель сайта. Для настоящего магазина
   отправляйте заказ через свой сервер (PHP/Node), а здесь
   оставьте только адрес этого сервера.
   Пока токен не указан, заказ «отправляется» в демо-режиме.
   ============================================================ */
const TELEGRAM_CONFIG = {
    botToken: 'YOUR_BOT_TOKEN',
    chatId: 'YOUR_CHAT_ID'
};

/* ---------- Вспомогательные функции ---------- */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function formatPrice(value) {
    return value.toLocaleString('ru-RU') + ' ₽';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function lockScroll(lock) {
    document.body.style.overflow = lock ? 'hidden' : '';
}

/* ---------- Уведомления (вместо alert) ---------- */
function showToast(text, type = 'success') {
    let box = $('#toast-box');
    if (!box) {
        box = document.createElement('div');
        box.id = 'toast-box';
        box.setAttribute('aria-live', 'polite');
        document.body.appendChild(box);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = text;
    box.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2600);
}

/* ---------- Универсальные модальные окна ---------- */
const openModals = new Set();

function openModal(modal) {
    if (!modal) return;
    modal.style.display = 'flex';
    openModals.add(modal);
    lockScroll(true);
}

function closeModal(modal) {
    if (!modal) return;
    modal.style.display = 'none';
    openModals.delete(modal);
    if (openModals.size === 0) lockScroll(false);
}

function bindModal(modal, closeBtn) {
    if (!modal) return;
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openModals.size) {
        closeModal(Array.from(openModals).pop());
    }
});

/* ---------- Тема ---------- */
const themeToggle = $('#theme-toggle');
const themeIcon = themeToggle ? $('i', themeToggle) : null;

function applyTheme(isDark) {
    document.body.classList.toggle('dark', isDark);
    if (themeIcon) {
        themeIcon.classList.toggle('fa-moon', !isDark);
        themeIcon.classList.toggle('fa-sun', isDark);
    }
}

applyTheme(localStorage.getItem('theme') === 'dark');

if (themeToggle) {
    themeToggle.setAttribute('role', 'button');
    themeToggle.setAttribute('tabindex', '0');
    themeToggle.setAttribute('aria-label', 'Переключить тему');
    const toggleTheme = () => {
        const isDark = !document.body.classList.contains('dark');
        applyTheme(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };
    themeToggle.addEventListener('click', toggleTheme);
    themeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
        }
    });
}

/* ---------- Высота шапки (для --header-height в CSS) ---------- */
function updateHeaderHeight() {
    const header = $('header');
    if (header) {
        document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
    }
}
window.addEventListener('resize', updateHeaderHeight);
window.addEventListener('load', updateHeaderHeight);
updateHeaderHeight();

/* ---------- Активный пункт меню ---------- */
(function setActiveMenu() {
    const page = location.pathname.split('/').pop() || 'index.html';
    const map = { 'index.html': 'Главная', 'landscape.html': 'Ландшафт', 'catalog.html': 'Каталог' };
    $$('.main-menu a').forEach(link => {
        if (link.textContent.trim() === 'Главная') link.setAttribute('href', 'index.html');
        link.classList.toggle('active', map[page] === link.textContent.trim());
    });
})();

/* ---------- Выбор города ---------- */
const cityTrigger = $('#city-trigger');
const cityModal = $('#city-modal');
const cityName = $('.city-name');

if (cityName) {
    const savedCity = localStorage.getItem('savedCity');
    if (savedCity) cityName.textContent = savedCity;
}

if (cityTrigger && cityModal) {
    bindModal(cityModal, $('.close', cityModal));

    cityTrigger.setAttribute('role', 'button');
    cityTrigger.setAttribute('tabindex', '0');
    cityTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(cityModal);
    });
    cityTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') openModal(cityModal);
    });

    $$('.city-list li', cityModal).forEach(item => {
        item.setAttribute('tabindex', '0');
        const choose = () => {
            const city = item.dataset.city;
            if (cityName) cityName.textContent = city;
            localStorage.setItem('savedCity', city);
            closeModal(cityModal);
            showToast('Город: ' + city);
        };
        item.addEventListener('click', choose);
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') choose();
        });
    });
}

/* ---------- Слайдер ---------- */
const sliderEl = $('.slider');
if (sliderEl) {
    const slides = $$('.slide', sliderEl);
    const dots = $$('.dot', sliderEl);
    const prevBtn = $('.slider-prev', sliderEl);
    const nextBtn = $('.slider-next', sliderEl);
    let currentSlide = 0;
    let timer = null;

    function showSlide(index) {
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('active', i === currentSlide));
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
    }

    function startAuto() {
        stopAuto();
        timer = setInterval(() => showSlide(currentSlide + 1), 6000);
    }
    function stopAuto() {
        if (timer) clearInterval(timer);
    }

    prevBtn.addEventListener('click', () => { showSlide(currentSlide - 1); startAuto(); });
    nextBtn.addEventListener('click', () => { showSlide(currentSlide + 1); startAuto(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { showSlide(i); startAuto(); }));

    sliderEl.addEventListener('mouseenter', stopAuto);
    sliderEl.addEventListener('mouseleave', startAuto);

    // Свайп на телефоне
    let touchStartX = 0;
    sliderEl.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
        stopAuto();
    }, { passive: true });
    sliderEl.addEventListener('touchend', (e) => {
        const diff = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(diff) > 50) showSlide(currentSlide + (diff < 0 ? 1 : -1));
        startAuto();
    }, { passive: true });

    startAuto();

    // Параллакс только на широких экранах и без reduce-motion
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
        const slideImages = $$('.slide-img', sliderEl);
        window.addEventListener('scroll', () => {
            if (window.innerWidth <= 768) {
                slideImages.forEach(img => img.style.transform = '');
                return;
            }
            const scrollPos = window.pageYOffset;
            if (scrollPos < sliderEl.offsetHeight + 200) {
                slideImages.forEach(img => img.style.transform = `translateY(${scrollPos * 0.4}px)`);
            }
        }, { passive: true });
    }
}

/* ---------- Кнопка «наверх» ---------- */
const scrollBtn = $('#scroll-top');
if (scrollBtn) {
    window.addEventListener('scroll', () => {
        scrollBtn.style.display = window.pageYOffset > 500 ? 'flex' : 'none';
    }, { passive: true });
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------- Бургер-меню ---------- */
const burgerBtn = $('.burger-menu');
const mainMenu = $('.main-menu');

if (burgerBtn && mainMenu) {
    const setMenu = (open) => {
        mainMenu.classList.toggle('open', open);
        burgerBtn.classList.toggle('active', open);
        burgerBtn.setAttribute('aria-expanded', String(open));
        const icon = $('i', burgerBtn);
        if (icon) {
            icon.classList.toggle('fa-bars', !open);
            icon.classList.toggle('fa-times', open);
        }
    };
    burgerBtn.setAttribute('aria-expanded', 'false');
    burgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setMenu(!mainMenu.classList.contains('open'));
    });
    $$('a', mainMenu).forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', (e) => {
        if (!mainMenu.contains(e.target) && !burgerBtn.contains(e.target)) setMenu(false);
    });
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) setMenu(false);
    });
    // Пункт «Каталог» в мобильном меню (псевдоэлемент нельзя сделать ссылкой)
    mainMenu.addEventListener('click', (e) => {
        if (e.target === mainMenu && e.offsetY < 70) location.href = 'catalog.html';
    });
}

/* ---------- Каталог: переключение категорий ---------- */
if ($('.catalog-left-btn')) {
    const leftBtns = $$('.catalog-left-btn');
    const categoryBlocks = $$('.category-block');
    const currentCategorySpan = $('.current-category');

    function showCategory(id) {
        leftBtns.forEach(b => b.classList.toggle('active', b.dataset.category === id));
        categoryBlocks.forEach(block => block.classList.toggle('active', block.id === id));
        const btn = leftBtns.find(b => b.dataset.category === id);
        if (btn && currentCategorySpan) currentCategorySpan.textContent = btn.textContent.trim();
    }

    leftBtns.forEach(btn => btn.addEventListener('click', () => {
        showCategory(btn.dataset.category);
        history.replaceState(null, '', '#' + btn.dataset.category);
    }));

    const hash = location.hash.replace('#', '');
    showCategory(leftBtns.some(b => b.dataset.category === hash) ? hash : 'semena');
}

/* ---------- Вход / регистрация ---------- */
const profileLink = $('.fa-user') ? $('.fa-user').parentElement : null;
const profileModal = $('#profile-modal');

if (profileLink && profileModal) {
    const tabBtns = $$('.tab-btn', profileModal);
    const profileForms = $$('.profile-form', profileModal);

    bindModal(profileModal, $('.profile-close', profileModal));

    profileLink.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(profileModal);
    });

    function switchTab(tab) {
        tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
        profileForms.forEach(f => f.classList.toggle('active', f.id === `${tab}-form`));
    }

    tabBtns.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
    $$('.switch-tab span', profileModal).forEach(span =>
        span.addEventListener('click', () => switchTab(span.dataset.tab)));

    function setError(input, message) {
        const err = input.nextElementSibling;
        if (err) err.textContent = message;
        input.classList.toggle('invalid', Boolean(message));
        return !message;
    }

    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    $('#login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = $('#login-email');
        const password = $('#login-password');
        const ok = [
            setError(email, isEmail(email.value.trim()) ? '' : 'Неверный email'),
            setError(password, password.value.length >= 6 ? '' : 'Пароль минимум 6 символов')
        ].every(Boolean);

        if (ok) {
            showToast('Успешный вход!');
            closeModal(profileModal);
            e.target.reset();
        }
    });

    $('#register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('#reg-name');
        const email = $('#reg-email');
        const password = $('#reg-password');
        const confirm = $('#reg-password-confirm');
        const ok = [
            setError(name, name.value.trim().length >= 2 ? '' : 'Имя минимум 2 символа'),
            setError(email, isEmail(email.value.trim()) ? '' : 'Неверный email'),
            setError(password, password.value.length >= 6 ? '' : 'Пароль минимум 6 символов'),
            setError(confirm, password.value === confirm.value ? '' : 'Пароли не совпадают')
        ].every(Boolean);

        if (ok) {
            showToast('Успешная регистрация!');
            closeModal(profileModal);
            e.target.reset();
        }
    });
}

/* ---------- Корзина ---------- */
function loadCart() {
    try {
        const data = JSON.parse(localStorage.getItem('cart') || '[]');
        return Array.isArray(data) ? data : [];
    } catch (err) {
        return [];
    }
}

const cart = loadCart();

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function ensureCartBadge() {
    const cartIcon = $('.cart-icon');
    if (cartIcon && !$('.cart-count', cartIcon)) {
        const span = document.createElement('span');
        span.className = 'cart-count';
        cartIcon.appendChild(span);
    }
}

function updateCartCount() {
    ensureCartBadge();
    const badge = $('.cart-count');
    if (!badge) return;
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = total;
    badge.classList.toggle('visible', total > 0);
}

updateCartCount();

$$('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
        const card = btn.closest('.product-card');
        const title = $('h3', card).textContent.trim();
        const price = parseInt($('.price', card).textContent.replace(/\D/g, ''), 10) || 0;
        const img = $('img', card).getAttribute('src');

        const existing = cart.find(item => item.title === title && item.price === price);
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ img, title, price, quantity: 1 });
        }
        saveCart();

        showToast(`«${title}» добавлен в корзину`);
        btn.classList.add('added');
        btn.textContent = 'Добавлено ✓';
        setTimeout(() => {
            btn.classList.remove('added');
            btn.textContent = 'В корзину';
        }, 1200);
    });
});

/* ---------- Страница корзины и оформление заказа ---------- */
const cartItemsEl = $('#cart-items');

if (cartItemsEl) {
    const cartTotalPrice = $('#cart-total-price');
    const orderBtn = $('#order-btn');

    function cartTotal() {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    function renderCart() {
        cartItemsEl.innerHTML = '';

        if (cart.length === 0) {
            cartItemsEl.innerHTML = '<p class="cart-empty">Корзина пустая</p>' +
                '<a href="catalog.html" class="back-to-catalog">Перейти в каталог</a>';
            cartTotalPrice.textContent = formatPrice(0);
            orderBtn.disabled = true;
            return;
        }

        orderBtn.disabled = false;

        cart.forEach((item, index) => {
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
                <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.title)}">
                <div class="cart-item-info">
                    <h3 class="cart-item-title">${escapeHtml(item.title)}</h3>
                    <p class="cart-item-price">${formatPrice(item.price)}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" data-index="${index}" data-action="decrease" aria-label="Уменьшить">−</button>
                        <span class="quantity-num">${item.quantity}</span>
                        <button class="quantity-btn" data-index="${index}" data-action="increase" aria-label="Увеличить">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-index="${index}" aria-label="Удалить товар"><i class="fas fa-trash"></i></button>
            `;
            cartItemsEl.appendChild(el);
        });

        cartTotalPrice.textContent = formatPrice(cartTotal());
    }

    renderCart();

    cartItemsEl.addEventListener('click', (e) => {
        const qtyBtn = e.target.closest('.quantity-btn');
        const removeBtn = e.target.closest('.cart-item-remove');

        if (qtyBtn) {
            const index = Number(qtyBtn.dataset.index);
            if (qtyBtn.dataset.action === 'increase') {
                cart[index].quantity++;
            } else if (cart[index].quantity > 1) {
                cart[index].quantity--;
            }
            saveCart();
            renderCart();
        }

        if (removeBtn) {
            cart.splice(Number(removeBtn.dataset.index), 1);
            saveCart();
            renderCart();
        }
    });

    /* --- Окно оформления заказа --- */
    const orderModal = document.createElement('div');
    orderModal.id = 'order-modal';
    orderModal.className = 'modal';
    orderModal.innerHTML = `
        <div class="modal-content">
            <span class="close order-close" role="button" aria-label="Закрыть">&times;</span>
            <h3>Оформление заказа</h3>
            <form id="order-form" novalidate>
                <div class="form-group">
                    <label for="order-name">Имя *</label>
                    <input type="text" id="order-name" autocomplete="name">
                    <span class="error"></span>
                </div>
                <div class="form-group">
                    <label for="order-phone">Телефон *</label>
                    <input type="tel" id="order-phone" autocomplete="tel" placeholder="+7 (999) 123-45-67">
                    <span class="error"></span>
                </div>
                <div class="form-group">
                    <label for="order-address">Адрес доставки</label>
                    <textarea id="order-address" rows="3" autocomplete="street-address"></textarea>
                </div>
                <div class="form-group">
                    <label for="order-comment">Комментарий к заказу</label>
                    <textarea id="order-comment" rows="2"></textarea>
                </div>
                <button type="submit" class="submit-btn">Подтвердить заказ</button>
            </form>
        </div>
    `;
    document.body.appendChild(orderModal);
    bindModal(orderModal, $('.order-close', orderModal));

    const orderForm = $('#order-form', orderModal);
    const phoneInput = $('#order-phone', orderModal);

    orderBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Корзина пустая', 'error');
            return;
        }
        openModal(orderModal);
        $('#order-name', orderModal).focus();
    });

    // Простая маска телефона: +7 (999) 123-45-67
    phoneInput.addEventListener('input', () => {
        let digits = phoneInput.value.replace(/\D/g, '');
        if (digits.startsWith('8')) digits = '7' + digits.slice(1);
        if (!digits.startsWith('7')) digits = '7' + digits;
        digits = digits.slice(0, 11);
        let result = '+7';
        if (digits.length > 1) result += ' (' + digits.slice(1, 4);
        if (digits.length >= 5) result += ') ' + digits.slice(4, 7);
        if (digits.length >= 8) result += '-' + digits.slice(7, 9);
        if (digits.length >= 10) result += '-' + digits.slice(9, 11);
        phoneInput.value = result;
    });

    function buildMessage(name, phone, address, comment) {
        let message = '🛒 НОВЫЙ ЗАКАЗ\n\n';
        message += `👤 Имя: ${name}\n`;
        message += `📞 Телефон: ${phone}\n`;
        if (address) message += `📍 Адрес: ${address}\n`;
        if (comment) message += `💬 Комментарий: ${comment}\n`;
        message += `🏙️ Город: ${localStorage.getItem('savedCity') || 'Не указан'}\n\n`;
        message += '📦 Состав заказа:\n';
        cart.forEach(item => {
            message += `• ${item.title} x${item.quantity} = ${item.price * item.quantity} ₽\n`;
        });
        message += `\n💰 ИТОГО: ${cartTotal()} ₽`;
        return message;
    }

    function finishOrder() {
        cart.length = 0;
        saveCart();
        renderCart();
        closeModal(orderModal);
        orderForm.reset();
        showToast('✅ Заказ оформлен! Мы свяжемся с вами для подтверждения.');
    }

    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = $('#order-name', orderModal);
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const address = $('#order-address', orderModal).value.trim();
        const comment = $('#order-comment', orderModal).value.trim();

        const nameErr = nameInput.nextElementSibling;
        const phoneErr = phoneInput.nextElementSibling;
        nameErr.textContent = name.length < 2 ? 'Введите имя' : '';
        phoneErr.textContent = phone.replace(/\D/g, '').length < 11 ? 'Введите телефон полностью' : '';
        if (nameErr.textContent || phoneErr.textContent) return;

        const submitBtn = $('.submit-btn', orderForm);
        const message = buildMessage(name, phone, address, comment);

        // Демо-режим: токен не настроен
        if (TELEGRAM_CONFIG.botToken === 'YOUR_BOT_TOKEN') {
            console.info('Демо-режим, заказ не отправлен в Telegram:\n' + message);
            finishOrder();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CONFIG.chatId, text: message })
        })
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    finishOrder();
                } else {
                    showToast('❌ Ошибка отправки заказа. Попробуйте позже.', 'error');
                }
            })
            .catch(() => showToast('❌ Ошибка сети. Проверьте подключение.', 'error'))
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Подтвердить заказ';
            });
    });
}
