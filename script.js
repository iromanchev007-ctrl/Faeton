/* ============================================================
   Фаэтон — автосервис. Логика страницы.
   ============================================================ */

/* ---------- Год в подвале ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Шапка: фон при прокрутке ---------- */
const header = document.getElementById("header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- Мобильное меню ---------- */
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const closeMenu = () => {
  nav.classList.remove("is-open");
  burger.classList.remove("is-open");
  burger.setAttribute("aria-expanded", "false");
};
burger.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  burger.classList.toggle("is-open", open);
  burger.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

/* ---------- Анимация появления блоков ---------- */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ============================================================
   Марки и модели автомобилей
   ============================================================ */
const CARS = {
  "BMW": ["1 серия", "3 серия", "5 серия", "7 серия", "X1", "X3", "X5", "X6"],
  "Mercedes-Benz": ["A-класс", "C-класс", "E-класс", "S-класс", "GLA", "GLC", "GLE", "GL", "ML"],
  "Audi": ["A3", "A4", "A6", "A8", "Q3", "Q5", "Q7"],
  "Volkswagen": ["Polo", "Golf", "Passat", "Tiguan", "Touareg", "Jetta"],
  "Toyota": ["Corolla", "Camry", "RAV4", "Land Cruiser", "Highlander", "Prado"],
  "Kia": ["Rio", "Ceed", "Sportage", "Sorento", "Optima", "K5"],
  "Hyundai": ["Solaris", "Creta", "Tucson", "Santa Fe", "Elantra", "Sonata"],
  "Lada (ВАЗ)": ["Granta", "Vesta", "Largus", "XRAY", "Niva", "Priora", "Kalina", "2107", "2110", "2114"],
  "Renault": ["Logan", "Sandero", "Duster", "Kaptur", "Arkana", "Megane"],
  "Nissan": ["Almera", "Qashqai", "X-Trail", "Juke", "Teana", "Murano"],
  "Skoda": ["Octavia", "Rapid", "Superb", "Kodiaq", "Karoq"],
  "Ford": ["Focus", "Mondeo", "Kuga", "Fiesta", "Explorer"],
  "Chevrolet": ["Cruze", "Aveo", "Lacetti", "Niva", "Captiva"],
  "Mazda": ["3", "6", "CX-5", "CX-7", "CX-9"],
  "Mitsubishi": ["Lancer", "Outlander", "ASX", "Pajero"],
  "Honda": ["Civic", "Accord", "CR-V", "Pilot"],
  "Opel": ["Astra", "Insignia", "Corsa", "Zafira"],
  "Volvo": ["XC60", "XC90", "S60", "S90"],
  "Lexus": ["RX", "NX", "ES", "LX", "GX"],
  "УАЗ": ["Патриот", "Хантер", "Буханка"],
  "ГАЗ": ["Газель", "Соболь", "Волга"],
};

const brandInput = document.getElementById("brandInput");
const modelInput = document.getElementById("modelInput");

const BRANDS = Object.keys(CARS).sort((a, b) => a.localeCompare(b, "ru"));

/* ----------------------------------------------------------------
   Combobox: выпадающий список + свободный ввод.
   - клик по полю или стрелке открывает полный список;
   - ввод текста фильтрует подсказки;
   - можно выбрать вариант мышью ИЛИ вписать своё значение вручную.
   ---------------------------------------------------------------- */
function makeCombo(comboId, getOptions, onSelect) {
  const combo = document.getElementById(comboId);
  const input = combo.querySelector(".combo__input");
  const arrow = combo.querySelector(".combo__arrow");
  const menu = combo.querySelector(".combo__menu");

  function render(filter) {
    const all = getOptions();
    const f = (filter || "").trim().toLowerCase();
    const list = f ? all.filter((o) => o.toLowerCase().includes(f)) : all;

    menu.innerHTML = "";
    if (!list.length) {
      const li = document.createElement("li");
      li.className = "combo__empty";
      li.textContent = all.length ? "Ничего не найдено — введите вручную" : "Введите вручную";
      menu.appendChild(li);
      return;
    }
    list.forEach((value) => {
      const li = document.createElement("li");
      li.className = "combo__option";
      li.setAttribute("role", "option");
      li.textContent = value;
      // mousedown, чтобы выбор сработал раньше потери фокуса
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        input.value = value;
        close();
        if (onSelect) onSelect();
      });
      menu.appendChild(li);
    });
  }

  function open(filter) {
    render(filter);
    menu.hidden = false;
    combo.classList.add("is-open");
    input.setAttribute("aria-expanded", "true");
  }
  function close() {
    menu.hidden = true;
    combo.classList.remove("is-open");
    input.setAttribute("aria-expanded", "false");
  }

  input.addEventListener("focus", () => open(""));
  input.addEventListener("input", () => {
    open(input.value);
    if (onSelect) onSelect();
  });
  arrow.addEventListener("mousedown", (e) => {
    e.preventDefault();
    if (menu.hidden) {
      input.focus();
      open("");
    } else {
      close();
    }
  });
  document.addEventListener("click", (e) => {
    if (!combo.contains(e.target)) close();
  });

  return { close };
}

makeCombo("brandCombo", () => BRANDS, () => {
  // при смене марки подсказываем подходящий placeholder для модели
  const has = (CARS[brandInput.value.trim()] || []).length;
  modelInput.placeholder = has ? "Выберите или введите модель" : "Введите модель вручную";
});
makeCombo("modelCombo", () => CARS[brandInput.value.trim()] || []);

/* ---------- Быстрая запись из карточек услуг ---------- */
const serviceSelect = document.getElementById("serviceSelect");
document.querySelectorAll(".service-card__link").forEach((link) => {
  link.addEventListener("click", () => {
    const name = link.dataset.service;
    if (name && [...serviceSelect.options].some((o) => o.value === name)) {
      serviceSelect.value = name;
    }
  });
});

/* ============================================================
   Отправка формы
   ============================================================
   Заявка уходит на серверную функцию /api/lead (см. api/lead.js),
   которая пересылает её в Telegram. Токен бота и chat_id хранятся
   в переменных окружения на стороне сервера — в коде сайта их нет.
   ============================================================ */
/* Демо-режим: форма показывает заглушку «Заявка отправлена мастеру»
   без реальной отправки в Telegram. Когда настроите бота
   (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID), поставьте STUB_MODE = false —
   и заявки начнут уходить в Telegram через /api/lead. */
const STUB_MODE = true;

const form = document.getElementById("leadForm");
const submitBtn = document.getElementById("submitBtn");
const successBox = document.getElementById("formSuccess");

function showSuccess() {
  form.querySelectorAll(".field, .form__row, .form__hint, #submitBtn").forEach(
    (el) => (el.style.display = "none")
  );
  successBox.hidden = false;
  successBox.scrollIntoView({ behavior: "smooth", block: "center" });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  /* Простая валидация обязательных полей */
  let valid = true;
  ["name", "phone"].forEach((n) => {
    const input = form.elements[n];
    const ok = input.value.trim().length > 1;
    input.classList.toggle("is-invalid", !ok);
    if (!ok) valid = false;
  });
  if (!valid) return;

  const data = {
    name: form.elements.name.value.trim(),
    phone: form.elements.phone.value.trim(),
    email: form.elements.email.value.trim(),
    brand: form.elements.brand.value.trim(),
    model: form.elements.model.value.trim(),
    service: form.elements.service.value.trim(),
    comment: form.elements.comment.value.trim(),
  };

  /* Заглушка: сразу показываем подтверждение, ничего не отправляя */
  if (STUB_MODE) {
    showSuccess();
    return;
  }

  submitBtn.disabled = true;
  const original = submitBtn.textContent;
  submitBtn.textContent = "Отправляем…";

  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Bad response");
    showSuccess();
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = original;
    alert(
      "Не удалось отправить заявку. Позвоните нам: +7 (937) 968-54-11 — или попробуйте ещё раз."
    );
  }
});

/* Снимаем подсветку ошибки при вводе */
form.addEventListener("input", (e) => {
  if (e.target.classList?.contains("is-invalid")) {
    e.target.classList.remove("is-invalid");
  }
});
