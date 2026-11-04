'use strict';

/* ============================================================
   Автосервис — script.js
   ============================================================ */

(function () {
  /* ---------- Бургер-меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function setMenu(open) {
    var isOpen = open === true;
    nav.classList.toggle('nav--open', isOpen);
    burger.classList.toggle('burger--active', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  }

  burger.addEventListener('click', function () {
    setMenu(!nav.classList.contains('nav--open'));
  });

  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) {
      setMenu(false);
    }
  });

  document.addEventListener('click', function (event) {
    if (nav.classList.contains('nav--open') && !nav.contains(event.target) && !burger.contains(event.target)) {
      setMenu(false);
    }
  });

  /* ---------- Плавный скролл по якорям ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var targetId = link.getAttribute('href');
      if (targetId.length <= 1) return;
      var target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---------- Тень хедера при скролле ---------- */
  var header = document.getElementById('header');
  window.addEventListener('scroll', function () {
    header.classList.toggle('header--scrolled', window.scrollY > 8);
  }, { passive: true });

  /* ---------- Появление секций (Intersection Observer) ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('reveal--visible');
    });
  }

  /* ---------- Счётчики статистики ---------- */
  var statValues = document.querySelectorAll('.stat__value');

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) {
      el.textContent = el.getAttribute('data-count') || '0';
      return;
    }
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var startTime = null;

    function frame(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = value.toLocaleString('ru-RU') + suffix;
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = target.toLocaleString('ru-RU') + suffix;
      }
    }

    requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statValues.forEach(function (el) {
      counterObserver.observe(el);
    });
  } else {
    statValues.forEach(function (el) {
      el.textContent = (el.getAttribute('data-count') || '0') + (el.getAttribute('data-suffix') || '');
    });
  }

  /* ---------- FAQ-аккордеон: один открыт ---------- */
  var faqButtons = document.querySelectorAll('.faq__btn');

  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var answer = document.getElementById(btn.getAttribute('aria-controls'));
      var isOpen = btn.getAttribute('aria-expanded') === 'true';

      faqButtons.forEach(function (other) {
        var otherAnswer = document.getElementById(other.getAttribute('aria-controls'));
        other.setAttribute('aria-expanded', 'false');
        otherAnswer.classList.remove('open');
        otherAnswer.hidden = true;
      });

      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
        requestAnimationFrame(function () {
          answer.classList.add('open');
        });
      }
    });
  });

  /* ---------- Маска телефона +7 (___) ___-__-__ ---------- */
  var phoneInput = document.getElementById('f-phone');

  function formatPhone(value) {
    var digits = value.replace(/\D/g, '');
    if (digits.charAt(0) === '8') digits = '7' + digits.slice(1);
    if (digits.charAt(0) !== '7') digits = '7' + digits;

    var result = '+7';
    if (digits.length > 1) result += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) result += ')';
    if (digits.length > 4) result += ' ' + digits.slice(4, 7);
    if (digits.length >= 7) result += '-';
    if (digits.length > 7) result += digits.slice(7, 9);
    if (digits.length >= 9) result += '-';
    if (digits.length > 9) result += digits.slice(9, 11);
    return result;
  }

  phoneInput.addEventListener('input', function () {
    phoneInput.value = formatPhone(phoneInput.value);
  });

  /* ---------- Валидация формы ---------- */
  var form = document.getElementById('appointment-form');
  var fields = {
    name: {
      input: document.getElementById('f-name'),
      error: document.getElementById('err-name'),
      validate: function () {
        var v = fields.name.input.value.trim();
        if (v.length < 2) return 'Введите имя и фамилию';
        var words = v.split(/\s+/).filter(function (w) { return w.length > 0; });
        if (words.length < 2) return 'Укажите имя и фамилию (например: Иван Иванов)';
        return '';
      }
    },
    phone: {
      input: phoneInput,
      error: document.getElementById('err-phone'),
      validate: function () {
        var digits = fields.phone.input.value.replace(/\D/g, '');
        if (digits.length !== 11) return 'Введите номер полностью';
        return '';
      }
    },
    service: {
      input: document.getElementById('f-service'),
      error: document.getElementById('err-service'),
      validate: function () {
        if (!fields.service.input.value) return 'Выберите услугу';
        return '';
      }
    },
    date: {
      input: document.getElementById('f-date'),
      error: document.getElementById('err-date'),
      validate: function () {
        if (!selectedDate) return 'Выберите дату';
        var sel = new Date(selectedDate + 'T00:00:00');
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (sel < today) return 'Дата не может быть в прошлом';
        return '';
      }
    },
    time: {
      input: document.getElementById('f-time'),
      error: document.getElementById('err-time'),
      validate: function () {
        if (!fields.time.input.value) return 'Выберите время';
        return '';
      }
    },
    consent: {
      input: document.getElementById('f-consent'),
      error: document.getElementById('err-consent'),
      validate: function () {
        if (!fields.consent.input.checked) return 'Необходимо согласие на обработку данных';
        return '';
      }
    }
  };

  function showError(field, message) {
    field.error.textContent = message;
    field.input.classList.toggle('form__input--invalid', message !== '');
    field.input.setAttribute('aria-invalid', message !== '' ? 'true' : 'false');
    return message === '';
  }

  function validateField(key) {
    var field = fields[key];
    if (!field) return true;
    return showError(field, field.validate());
  }

  fields.name.input.addEventListener('blur', function () { validateField('name'); });
  fields.phone.input.addEventListener('blur', function () { validateField('phone'); });
  fields.service.input.addEventListener('change', function () { validateField('service'); });
  fields.date.input.addEventListener('change', function () { validateField('date'); });
  fields.time.input.addEventListener('change', function () { validateField('time'); });
  fields.consent.input.addEventListener('change', function () { validateField('consent'); });

  /* ---------- Автодополнение марка/модель ---------- */
  var carList = document.getElementById('car-list');
  var carHint = document.getElementById('hint-car');
  var carInput = document.getElementById('f-car');

  var CARS = {
    'Audi': ['A4', 'A6', 'A8', 'Q5', 'Q7', 'TT'],
    'BMW': ['3 серия', '5 серия', '7 серия', 'X3', 'X5', 'X6'],
    'Chery': ['Tiggo 4', 'Tiggo 7', 'Tiggo 8', 'Arrizo 8'],
    'Chevrolet': ['Cruze', 'Aveo', 'Lacetti', 'Cobalt', 'Niva'],
    'Citroen': ['C3', 'C4', 'C5', 'Berlingo'],
    'Ford': ['Focus', 'Mondeo', 'Kuga', 'Fiesta', 'Explorer'],
    'Geely': ['Coolray', 'Atlas', 'Monjaro', 'Emgrand'],
    'Haval': ['Jolion', 'F7', 'F7x', 'H5', 'Dargo'],
    'Hyundai': ['Solaris', 'Creta', 'Elantra', 'Tucson', 'Santa Fe', 'Palisade'],
    'Kia': ['Rio', 'Ceed', 'Sportage', 'Sorento', 'K5', 'Seltos'],
    'Lada': ['Granta', 'Vesta', 'Niva', 'Largus', 'X-Ray'],
    'Mazda': ['3', '6', 'CX-5', 'CX-30', 'MX-5'],
    'Mercedes-Benz': ['A-класс', 'C-класс', 'E-класс', 'GLC', 'GLE', 'Vito'],
    'Mitsubishi': ['Lancer', 'Outlander', 'ASX', 'Pajero'],
    'Nissan': ['Almera', 'Qashqai', 'X-Trail', 'Juke', 'Terrano'],
    'Opel': ['Astra', 'Corsa', 'Mokka', 'Insignia'],
    'Peugeot': ['208', '308', '408', '3008', '5008'],
    'Renault': ['Logan', 'Sandero', 'Duster', 'Kaptur', 'Arkana', 'Megan'],
    'Skoda': ['Rapid', 'Octavia', 'Karoq', 'Kodiaq', 'Superb'],
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Land Cruiser', 'Highlander', 'Rav 4'],
    'Volkswagen': ['Polo', 'Jetta', 'Golf', 'Passat', 'Tiguan', 'Touareg'],
    'Volvo': ['S60', 'S90', 'XC60', 'XC90'],
    'УАЗ': ['Патриот', 'Хантер', 'Буханка', 'Профи'],
    'ГАЗ': ['Волга', 'Газель', 'Соболь']
  };

  function fillCarList(filter) {
    var f = (filter || '').trim().toLowerCase();
    carList.innerHTML = '';

    Object.keys(CARS).forEach(function (brand) {
      if (f && brand.toLowerCase().indexOf(f) !== 0 && brand.toLowerCase().indexOf(' ' + f) === -1 && brand.toLowerCase() !== f) {
        if (brand.toLowerCase().indexOf(f) === -1) return;
      }
      var opt = document.createElement('option');
      opt.value = brand;
      carList.appendChild(opt);

      CARS[brand].forEach(function (model) {
        var label = brand + ' ' + model;
        var inBrand = brand.toLowerCase().indexOf(f) !== -1;
        var inModel = model.toLowerCase().indexOf(f) !== -1;
        if (f && !inBrand && !inModel) return;
        var o = document.createElement('option');
        o.value = label;
        carList.appendChild(o);
      });
    });
  }

  carInput.addEventListener('input', function () {
    fillCarList(carInput.value);
    if (carInput.value.trim()) {
      carHint.textContent = '';
    }
  });

  carInput.addEventListener('blur', function () {
    if (!carInput.value.trim()) {
      carHint.textContent = 'Начните вводить — подскажем марку и модель';
    }
  });

  fillCarList('');

  /* ---------- Кастомный datepicker ---------- */
  var datepicker = document.getElementById('datepicker');
  var dateInput = document.getElementById('f-date');
  var popup = document.getElementById('datepicker-popup');
  var grid = document.getElementById('dp-grid');
  var title = document.getElementById('dp-title');
  var btnPrev = document.getElementById('dp-prev');
  var btnNext = document.getElementById('dp-next');
  var timeSelect = document.getElementById('f-time');
  var selectedDate = null;

  var MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  var MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  var SLOTS = ['morning', 'day', 'evening'];
  var SLOT_LABELS = {
    morning: 'Утро (09:00–12:00)',
    day: 'День (12:00–18:00)',
    evening: 'Вечер (18:00–21:00)'
  };

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function toKey(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  /* Демо-занятость: воскресенья полностью заняты (выходной), в субботу занято утро,
     каждый 4-й день начиная с сегодня+2 — занят вечер. Замени на реальные данные. */
  function buildAvailability() {
    var map = {};
    for (var i = 0; i < 120; i++) {
      var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      var key = toKey(d);
      var dow = d.getDay();
      var busy = [];
      if (dow === 0) {
        busy = ['morning', 'day', 'evening'];
      } else if (dow === 6) {
        busy = ['morning'];
      } else if (i > 0 && i % 4 === 0) {
        busy = ['evening'];
      }
      if (busy.length) map[key] = busy;
    }
    return map;
  }

  var availability = buildAvailability();

  function isFull(key) {
    var busy = availability[key];
    return !!busy && busy.length >= SLOTS.length;
  }

  function hasFreeSlots(key) {
    var busy = availability[key] || [];
    return busy.length < SLOTS.length;
  }

  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth();

  function renderCalendar() {
    var first = new Date(viewYear, viewMonth, 1);
    var startCol = (first.getDay() + 6) % 7; // понедельник = 0
    var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    var todayKey = toKey(today);

    grid.innerHTML = '';

    for (var c = 0; c < startCol; c++) {
      var empty = document.createElement('span');
      empty.className = 'datepicker__day datepicker__day--empty';
      empty.setAttribute('aria-hidden', 'true');
      grid.appendChild(empty);
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(viewYear, viewMonth, d);
      var key = toKey(date);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'datepicker__day';
      btn.textContent = d;
      btn.setAttribute('role', 'gridcell');

      if (key === todayKey) btn.classList.add('is-today');
      if (date < today) {
        btn.disabled = true;
      }
      if (isFull(key)) {
        btn.disabled = true;
        btn.classList.add('is-full');
        btn.title = 'Полностью занято';
      } else if (hasFreeSlots(key) && busyToday(key)) {
        btn.title = 'Небольшая занятость';
      }
      if (key === selectedDate) btn.classList.add('is-selected');

      btn.addEventListener('click', (function (k) {
        return function () { selectDate(k); };
      })(key));

      grid.appendChild(btn);
    }

    title.textContent = MONTHS[viewMonth] + ' ' + viewYear;
    btnPrev.disabled = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  }

  function busyToday(key) {
    return !!(availability[key] && availability[key].length);
  }

  function rebuildTimeSlots(key) {
    var busy = availability[key] || [];
    timeSelect.innerHTML = '';

    SLOTS.forEach(function (slot) {
      if (busy.indexOf(slot) !== -1) return;
      var opt = document.createElement('option');
      opt.value = slot;
      opt.textContent = SLOT_LABELS[slot];
      timeSelect.appendChild(opt);
    });

    if (timeSelect.options.length === 0) {
      var none = document.createElement('option');
      none.value = '';
      none.textContent = 'Нет свободного времени в этот день';
      none.disabled = true;
      none.selected = true;
      timeSelect.appendChild(none);
      timeSelect.disabled = true;
    } else {
      timeSelect.disabled = false;
      timeSelect.options[0].selected = true;
    }
  }

  function selectDate(key) {
    selectedDate = key;
    var d = new Date(key + 'T00:00:00');
    dateInput.value = d.getDate() + ' ' + MONTHS_GEN[d.getMonth()] + ' ' + d.getFullYear() + ', ' + WEEKDAYS[d.getDay()];
    dateInput.classList.remove('form__input--invalid');
    fields.date.error.textContent = '';
    rebuildTimeSlots(key);
    validateField('date');
    renderCalendar();
    closePopup();
    if (!timeSelect.disabled && timeSelect.options.length) timeSelect.focus();
  }

  function resetDatepicker() {
    selectedDate = null;
    dateInput.value = '';
    timeSelect.innerHTML = '';
    timeSelect.disabled = false;
    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Выберите время';
    placeholder.disabled = true;
    placeholder.selected = true;
    timeSelect.appendChild(placeholder);
    renderCalendar();
  }

  function openPopup() {
    popup.hidden = false;
    dateInput.setAttribute('aria-expanded', 'true');
  }

  function closePopup() {
    popup.hidden = true;
    dateInput.setAttribute('aria-expanded', 'false');
  }

  dateInput.addEventListener('click', function () {
    if (popup.hidden) openPopup();
    else closePopup();
  });

  dateInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (popup.hidden) {
        openPopup();
        var firstDay = grid.querySelector('.datepicker__day:not(:disabled):not(.datepicker__day--empty)');
        if (firstDay) firstDay.focus();
      } else {
        closePopup();
      }
    }
  });

  btnPrev.addEventListener('click', function () {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });

  btnNext.addEventListener('click', function () {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  document.addEventListener('click', function (event) {
    if (!datepicker.contains(event.target)) closePopup();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !popup.hidden) closePopup();
  });

  renderCalendar();

  /* ---------- Куда приходят заявки ---------- */
    var CONTACT = {
    telegram: 'popstaw',
    whatsapp: '',
    vk: '',
    email: 'savinov.ja@yandex.ru',
    phone: '',
    site: 'https://55857485.github.io/autoservice/'
  };

  /* ---------- Мессенджеры и липкая панель ---------- */
  (function () {
    var links = {
      whatsapp: CONTACT.whatsapp ? 'https://wa.me/' + CONTACT.whatsapp.replace(/[^0-9]/g, '') : '',
      telegram: CONTACT.telegram ? 'https://t.me/' + CONTACT.telegram : '',
      vk: CONTACT.vk ? CONTACT.vk : ''
    };

    document.querySelectorAll('[data-messenger]').forEach(function (el) {
      var url = links[el.getAttribute('data-messenger')];
      if (url) {
        el.href = url;
        el.removeAttribute('hidden');
      } else {
        el.setAttribute('hidden', '');
      }
    });

    document.querySelectorAll('[data-messenger-group]').forEach(function (group) {
      var visible = group.querySelectorAll('[data-messenger]:not([hidden])').length;
      if (visible === 0) group.setAttribute('hidden', '');
    });

    var bar = document.getElementById('cta-bar');
    if (bar) {
      var updateBar = function () {
        bar.classList.toggle('is-visible', window.scrollY > 420);
      };
      window.addEventListener('scroll', updateBar, { passive: true });
      updateBar();
    }
  })();

  function buildRequestText() {
    var nameEl = document.getElementById('f-name');
    var phoneEl = document.getElementById('f-phone');
    var serviceEl = document.getElementById('f-service');
    var timeEl = document.getElementById('f-time');
    var serviceText = serviceEl && serviceEl.selectedIndex >= 0
      ? serviceEl.options[serviceEl.selectedIndex].text : '—';
    var timeText = timeEl && timeEl.selectedIndex >= 0
      ? timeEl.options[timeEl.selectedIndex].text : '—';

    return 'Заявка с сайта автосервиса\n\n' +
      'Имя: ' + (nameEl ? nameEl.value.trim() : '') + '\n' +
      'Телефон: ' + (phoneEl ? phoneEl.value.trim() : '') + '\n' +
      'Услуга: ' + serviceText + '\n' +
      'Дата: ' + (dateInput.value || 'не выбрана') + '\n' +
      'Время: ' + timeText;
  }

  /* ---------- Карта: загрузка по клику ---------- */
  (function () {
    var map = document.getElementById('footer-map');
    var btn = document.getElementById('show-map');
    if (!map || !btn) return;

    btn.addEventListener('click', function () {
      var src = map.getAttribute('data-map-src');
      if (!src) return;
      var frame = document.createElement('iframe');
      frame.src = src;
      frame.loading = 'lazy';
      frame.title = map.getAttribute('aria-label') || 'Карта';
      frame.setAttribute('allowfullscreen', '');
      map.innerHTML = '';
      map.appendChild(frame);
      map.classList.add('is-loaded');
    });
  })();

  /* ---------- Уведомление о cookie ---------- */
  (function () {
    var bar = document.getElementById('cookie-bar');
    var ok = document.getElementById('cookie-ok');
    if (!bar || !ok) return;

    var KEY = 'cookie-ok';

    function accepted() {
      try {
        return window.localStorage.getItem(KEY) === '1';
      } catch (e) {
        return false;
      }
    }

    if (!accepted()) bar.hidden = false;

    ok.addEventListener('click', function () {
      bar.hidden = true;
      try {
        window.localStorage.setItem(KEY, '1');
      } catch (e) {}
    });
  })();

  /* ---------- Яндекс.Метрика ---------- */
  var METRIKA_ID = '114022503'; // номер счётчика, например '12345678'

  if (METRIKA_ID && window.location.protocol.indexOf('http') === 0) {
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) { return; }
      }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

    window.ym(METRIKA_ID, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var valid = true;
    Object.keys(fields).forEach(function (key) {
      if (!validateField(key)) valid = false;
    });

    if (!valid) {
      var firstInvalid = form.querySelector('.form__input--invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    var requestText = buildRequestText();
    form.reset();
    resetDatepicker();
    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      field.error.textContent = '';
      field.input.classList.remove('form__input--invalid');
      field.input.setAttribute('aria-invalid', 'false');
    });
    showSuccessModal(requestText);
  });

  /* ---------- Модалка успеха ---------- */
  var modal = document.getElementById('success-modal');
  var lastFocused = null;

    function showSuccessModal(requestText) {
    lastFocused = document.activeElement;

    var text = requestText || '';
    var pre = document.getElementById('modal-request');
    var tgLink = document.getElementById('send-telegram');
    var mailLink = document.getElementById('send-email');
    var copyBtn = document.getElementById('copy-request');
    var hint = document.getElementById('modal-hint');

    if (pre) pre.textContent = text;
    if (tgLink) tgLink.href = 'https://t.me/' + CONTACT.telegram;
    if (mailLink) {
      mailLink.href = 'mailto:' + CONTACT.email +
        '?subject=' + encodeURIComponent('Заявка с сайта автосервиса') +
        '&body=' + encodeURIComponent(text);
    }

    function copyText() {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        if (hint) hint.textContent = 'Выделите текст и скопируйте вручную';
        return;
      }
      navigator.clipboard.writeText(text).then(function () {
        if (hint) hint.textContent = 'Текст скопирован — вставьте его в чат или письмо';
      }).catch(function () {
        if (hint) hint.textContent = 'Выделите текст и скопируйте вручную';
      });
    }

    if (hint) hint.textContent = '';
    if (copyBtn) copyBtn.onclick = copyText;
    copyText();

    modal.hidden = false;
    document.body.classList.add('modal-open');
    var okBtn = modal.querySelector('.modal__ok');
    if (okBtn) okBtn.focus();
  }

  function hideModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  modal.querySelectorAll('[data-modal-close]').forEach(function (el) {
    el.addEventListener('click', hideModal);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modal.hidden) {
      hideModal();
    }
  });

  modal.addEventListener('click', function (event) {
    if (event.target === modal.querySelector('.modal__window')) return;
  });

  modal.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab') return;
    var focusable = Array.prototype.filter.call(
      modal.querySelectorAll('a[href], button:not([disabled])'),
      function (el) { return el.offsetParent !== null; }
    );
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();