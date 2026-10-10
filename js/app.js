/**
 * =======================================================================
 * 📱 PRINTCASE EXPRESS — ОСНОВНА ЛОГІКА ДОДАТКУ ТА КОНСТРУКТОРА
 * =======================================================================
 */

// Каталог пресетів для швидкої примірки в конструкторі
const PRESET_ARTWORKS = [
  {
    id: "cyberpunk",
    name: "Cyber Neon City",
    bg: "linear-gradient(135deg, #13002b 0%, #39006e 50%, #00f0ff 100%)",
    icon: "🌆"
  },
  {
    id: "marble",
    name: "Liquid Gold Marble",
    bg: "radial-gradient(circle at 30% 30%, #ffd700 0%, #1a1a1a 70%, #0d0d0d 100%)",
    icon: "✨"
  },
  {
    id: "galaxy",
    name: "Deep Space Nebula",
    bg: "linear-gradient(45deg, #090014 0%, #58005b 40%, #0099ff 100%)",
    icon: "🌌"
  },
  {
    id: "carbon",
    name: "Carbon Fiber Tech",
    bg: "repeating-linear-gradient(45deg, #1a1a1a, #1a1a1a 10px, #2a2a2a 10px, #2a2a2a 20px)",
    icon: "🛡️"
  },
  {
    id: "anime",
    name: "Sakura Samurai",
    bg: "linear-gradient(180deg, #ff4071 0%, #7b003a 60%, #1a0010 100%)",
    icon: "🌸"
  },
  {
    id: "minimal",
    name: "Matte Aesthetic",
    bg: "linear-gradient(135deg, #2b303a 0%, #17191d 100%)",
    icon: "🖤"
  }
];

// Ініціалізація та відображення списку локацій автоматів
window.renderLocations = function (lang) {
  const container = document.getElementById("locations-grid");
  if (!container || !window.VENDING_LOCATIONS) return;

  const currentLang = lang || getLanguage() || "uk";

  container.innerHTML = window.VENDING_LOCATIONS.map((loc) => {
    const cityName = loc.city[currentLang] || loc.city.uk;
    const mall = loc.mallName[currentLang] || loc.mallName.uk;
    const addr = loc.address[currentLang] || loc.address.uk;
    const lmark = loc.landmark[currentLang] || loc.landmark.uk;
    const hours = loc.workingHours[currentLang] || loc.workingHours.uk;
    const featuresList = (loc.features[currentLang] || loc.features.uk)
      .map((f) => `<li><span class="feat-check">✓</span> ${f}</li>`)
      .join("");
    const badgeText = loc.badge[currentLang] || loc.badge.uk;
    const isOnlineClass = loc.isOnline ? "badge-online" : "badge-soon";

    return `
      <div class="location-card glass-card">
        <div class="loc-card-header">
          <span class="city-tag">${cityName}</span>
          <span class="status-badge ${isOnlineClass}">${badgeText}</span>
        </div>
        <h3 class="loc-mall-name">${mall}</h3>
        <p class="loc-address">📍 ${addr}</p>
        <p class="loc-landmark">📌 <b>${currentLang === "ru" ? "Ориентир" : "Орієнтир"}:</b> ${lmark}</p>
        
        <div class="loc-hours">
          🕒 <b>${currentLang === "ru" ? "Время работы" : "Години роботи"}:</b> ${hours}
        </div>

        <ul class="loc-features">
          ${featuresList}
        </ul>

        <div class="loc-actions">
          <a href="${loc.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-route">
            <span>🗺️</span> ${currentLang === "ru" ? "Проложить маршрут в Maps" : "Прокласти маршрут у Maps"}
          </a>
        </div>
      </div>
    `;
  }).join("");
};

// Конструктор чохла
function initCaseDesigner() {
  const brandSelect = document.getElementById("designer-brand");
  const modelSelect = document.getElementById("designer-model");
  const colorBtns = document.querySelectorAll(".color-swatch");
  const uploadInput = document.getElementById("case-file-upload");
  const presetsContainer = document.getElementById("presets-container");

  const phoneMockup = document.getElementById("phone-mockup");
  const cameraCutout = document.getElementById("camera-cutout");
  const casePrintSurface = document.getElementById("case-print-surface");
  const scaleInput = document.getElementById("scale-range");

  const MODELS_DATA = {
    apple: [
      { name: "iPhone 16 Pro Max / 16 Pro", type: "iphone-pro" },
      { name: "iPhone 15 Pro Max / 15 Pro", type: "iphone-pro" },
      { name: "iPhone 15 / 15 Plus", type: "iphone-std" },
      { name: "iPhone 14 Pro Max / 14 Pro", type: "iphone-pro" },
      { name: "iPhone 14 / 13", type: "iphone-std" },
      { name: "iPhone 12 / 11", type: "iphone-std" }
    ],
    samsung: [
      { name: "Galaxy S24 Ultra", type: "samsung-ultra" },
      { name: "Galaxy S24 / S24+", type: "samsung-vert" },
      { name: "Galaxy S23 Ultra", type: "samsung-ultra" },
      { name: "Galaxy A55 / A54 5G", type: "samsung-vert" }
    ],
    xiaomi: [
      { name: "Xiaomi 14 / 14 Pro", type: "xiaomi-square" },
      { name: "Redmi Note 13 Pro+", type: "xiaomi-square" },
      { name: "POCO X6 Pro / F6", type: "xiaomi-wide" }
    ]
  };

  // Оновлення списку моделей при виборі бренду
  function updateModels() {
    const brand = brandSelect.value;
    const models = MODELS_DATA[brand] || MODELS_DATA.apple;
    modelSelect.innerHTML = models
      .map((m) => `<option value="${m.type}">${m.name}</option>`)
      .join("");
    updateCameraModule();
  }

  // Оновлення вирізу камери під обрану модель
  function updateCameraModule() {
    const val = modelSelect.value;
    cameraCutout.className = "camera-island " + val;
  }

  if (brandSelect && modelSelect) {
    brandSelect.addEventListener("change", updateModels);
    modelSelect.addEventListener("change", updateCameraModule);
    updateModels();
  }

  // Вибір кольору основи
  colorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      colorBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const color = btn.getAttribute("data-color");
      phoneMockup.setAttribute("data-base-color", color);
    });
  });

  // Завантаження власного зображення
  if (uploadInput) {
    uploadInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          casePrintSurface.style.backgroundImage = `url('${event.target.result}')`;
          casePrintSurface.style.backgroundSize = "cover";
          casePrintSurface.style.backgroundPosition = "center";
          // Прибираємо виділення з пресетів
          document.querySelectorAll(".preset-item").forEach((p) => p.classList.remove("active"));
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Рендер пресетів
  if (presetsContainer) {
    presetsContainer.innerHTML = PRESET_ARTWORKS.map((preset, idx) => `
      <button type="button" class="preset-item ${idx === 0 ? "active" : ""}" data-preset-id="${preset.id}">
        <span class="preset-icon">${preset.icon}</span>
        <span class="preset-name">${preset.name}</span>
      </button>
    `).join("");

    // Встановлюємо перший пресет за замовчуванням
    casePrintSurface.style.backgroundImage = PRESET_ARTWORKS[0].bg;

    presetsContainer.querySelectorAll(".preset-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        presetsContainer.querySelectorAll(".preset-item").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const pId = btn.getAttribute("data-preset-id");
        const found = PRESET_ARTWORKS.find((p) => p.id === pId);
        if (found) {
          casePrintSurface.style.backgroundImage = found.bg;
          casePrintSurface.style.backgroundSize = "cover";
          casePrintSurface.style.backgroundPosition = "center";
        }
      });
    });
  }

  // Зум макета
  if (scaleInput) {
    scaleInput.addEventListener("input", (e) => {
      const scale = e.target.value;
      casePrintSurface.style.transform = `scale(${scale})`;
    });
  }

  // Кнопка генерації коду для автомата
  const generateBtn = document.getElementById("btn-generate-code");
  const modal = document.getElementById("qr-modal");
  const modalClose = document.getElementById("modal-close");
  const codeValue = document.getElementById("generated-code-value");

  if (generateBtn && modal) {
    generateBtn.addEventListener("click", () => {
      // Генеруємо випадковий 5-значний код для автомата
      const randomCode = "PC-" + Math.floor(10000 + Math.random() * 90000);
      if (codeValue) codeValue.textContent = randomCode;
      modal.classList.add("open");
    });

    if (modalClose) {
      modalClose.addEventListener("click", () => modal.classList.remove("open"));
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("open");
    });
  }
}

// FAQ акордеон
function initFaq() {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      faqItems.forEach((i) => i.classList.remove("open"));
      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });
}

// Мобільне меню
function initMobileMenu() {
  const burger = document.getElementById("burger-btn");
  const navMenu = document.getElementById("nav-menu");

  if (burger && navMenu) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("open");
      navMenu.classList.toggle("open");
    });

    // Закриття меню при кліку на посилання
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        burger.classList.remove("open");
        navMenu.classList.remove("open");
      });
    });
  }
}

// Копіювання номера телефону в буфер при кліку
function initCopyPhone() {
  const copyElements = document.querySelectorAll(".copy-phone");
  copyElements.forEach((el) => {
    el.addEventListener("click", (e) => {
      const phone = "+380678918905";
      navigator.clipboard.writeText(phone).then(() => {
        const lang = getLanguage() || "uk";
        const msg = lang === "ru" ? "Номер скопирован: " : "Номер скопійовано: ";
        showToast(msg + phone);
      });
    });
  });
}

// Спливаючі сповіщення (Toast)
function showToast(text) {
  const existing = document.querySelector(".toast-notification");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.textContent = text;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Ініціалізація при завантаженні сторінки
document.addEventListener("DOMContentLoaded", () => {
  if (window.renderLocations) {
    window.renderLocations(getLanguage());
  }
  initCaseDesigner();
  initFaq();
  initMobileMenu();
  initCopyPhone();
});

