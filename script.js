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

const brandSelect = document.getElementById("brandSelect");
const modelInput = document.getElementById("modelInput");
const modelList = document.getElementById("modelList");

/* Заполняем список марок (по алфавиту) */
Object.keys(CARS)
  .sort((a, b) => a.localeCompare(b, "ru"))
  .forEach((brand) => {
    const opt = document.createElement("option");
    opt.value = brand;
    opt.textContent = brand;
    brandSelect.appendChild(opt);
  });

/* Обновляем варианты моделей. Поле остаётся текстовым — можно ввести своё. */
brandSelect.addEventListener("change", () => {
  modelList.innerHTML = "";
  const models = CARS[brandSelect.value] || [];
  models.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    modelList.appendChild(opt);
  });
  modelInput.value = "";
  modelInput.placeholder = models.length
    ? "Выберите или введите модель"
    : "Введите модель вручную";
});

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
const form = document.getElementById("leadForm");
const submitBtn = document.getElementById("submitBtn");
const successBox = document.getElementById("formSuccess");

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

    /* Успех: показываем сообщение */
    form.querySelectorAll(".field, .form__row, .form__hint, #submitBtn").forEach(
      (el) => (el.style.display = "none")
    );
    successBox.hidden = false;
    successBox.scrollIntoView({ behavior: "smooth", block: "center" });
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
