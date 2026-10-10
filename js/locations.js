/**
 * =======================================================================
 * 📍 НАЛАШТУВАННЯ ТА СИНХРОНІЗАЦІЯ ЛОКАЦІЙ АВТОМАТІВ VENDIGO
 * =======================================================================
 */

let VENDING_LOCATIONS = [
  {
    id: "ornava_ternopil",
    isOnline: true,
    city: {
      uk: "м. Тернопіль",
      ru: "г. Тернополь"
    },
    mallName: {
      uk: "ТЦ «Орнава»",
      ru: "ТЦ «Орнава»"
    },
    address: {
      uk: "вул. Торговиця (колишня Живова), 15А",
      ru: "ул. Торговица (бывшая Живова), 15А"
    },
    landmark: {
      uk: "1-й поверх, біля центрального входу та ескалатора",
      ru: "1-й этаж, возле центрального входа и эскалатора"
    },
    workingHours: {
      uk: "Щодня: 10:00 — 21:00",
      ru: "Ежедневно: 10:00 — 21:00"
    },
    features: {
      uk: ["Миттєвий друк за 3 хв", "Оплата карткою / Apple Pay", "Безконтактне завантаження фото"],
      ru: ["Мгновенная печать за 3 мин", "Оплата картой / Apple Pay", "Бесконтактная загрузка фото"]
    },
    googleMapsUrl: "https://maps.google.com/?q=ТЦ+Орнава+Тернопіль+вулиця+Торговиця+15А",
    badge: {
      uk: "🟢 Працює зараз",
      ru: "🟢 Работает сейчас"
    }
  },
  {
    id: "coming_soon_1",
    isOnline: false,
    isComingSoon: true,
    city: {
      uk: "м. Тернопіль",
      ru: "г. Тернополь"
    },
    mallName: {
      uk: "ТЦ «Подоляни»",
      ru: "ТЦ «Подоляны»"
    },
    address: {
      uk: "вул. Текстильна, 28Ч",
      ru: "ул. Текстильная, 28Ч"
    },
    landmark: {
      uk: "Готується до відкриття",
      ru: "Готовится к открытию"
    },
    workingHours: {
      uk: "Скоро відкриття!",
      ru: "Скоро открытие!"
    },
    features: {
      uk: ["Новий автомат нового покоління", "Величезний вибір моделей"],
      ru: ["Новый автомат нового поколения", "Огромный выбор моделей"]
    },
    googleMapsUrl: "https://maps.google.com/?q=ТЦ+Подоляни+Тернопіль",
    badge: {
      uk: "⏳ Скоро відкриття",
      ru: "⏳ Скоро открытие"
    }
  }
];

// Автоматична синхронізація локацій та контактів з бекенду або кешу адмінки
async function syncRemoteConfig() {
  try {
    let cfg = null;
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        cfg = await res.json();
      }
    } catch (_) {}

    if (!cfg) {
      const cached = localStorage.getItem("vendigo_config_cache");
      if (cached) cfg = JSON.parse(cached);
    }

    if (cfg && cfg.locations && cfg.locations.length > 0) {
      VENDING_LOCATIONS = cfg.locations.map(loc => ({
        id: loc.id || ("loc_" + Math.random()),
        isOnline: loc.isOnline !== false,
        isComingSoon: !loc.isOnline,
        city: { uk: loc.city_uk || "м. Тернопіль", ru: loc.city_ru || "г. Тернополь" },
        mallName: { uk: loc.mall_uk || "ТЦ", ru: loc.mall_ru || "ТЦ" },
        address: { uk: loc.address_uk || "", ru: loc.address_ru || "" },
        landmark: { uk: loc.landmark_uk || "", ru: loc.landmark_ru || "" },
        workingHours: { uk: loc.hours_uk || "", ru: loc.hours_ru || "" },
        features: {
          uk: ["Миттєвий друк за 3 хв", "Оплата карткою / Apple Pay", "Безконтактне завантаження фото"],
          ru: ["Мгновенная печать за 3 мин", "Оплата картой / Apple Pay", "Бесконтактная загрузка фото"]
        },
        googleMapsUrl: loc.google_maps || "https://maps.google.com",
        badge: {
          uk: loc.badge_uk || (loc.isOnline ? "🟢 Працює зараз" : "⏳ Скоро відкриття"),
          ru: loc.badge_ru || (loc.isOnline ? "🟢 Работает сейчас" : "⏳ Скоро открытие")
        }
      }));

      window.VENDING_LOCATIONS = VENDING_LOCATIONS;
      if (window.renderLocations) {
        window.renderLocations();
      }
    }

    // Синхронізація контактів
    if (cfg && cfg.contacts) {
      const tg = cfg.contacts.telegram;
      const phone = cfg.contacts.phone;
      if (tg) {
        document.querySelectorAll('a[href*="t.me/"]').forEach(a => {
          a.href = "https://t.me/" + tg.replace("@", "");
          if (a.textContent.includes("@")) a.textContent = tg;
        });
      }
      if (phone) {
        document.querySelectorAll('a[href*="tel:"]').forEach(a => a.href = "tel:" + phone);
        document.querySelectorAll('.copy-phone').forEach(el => el.textContent = phone);
      }
    }

    // Синхронізація цін
    if (cfg && cfg.pricing) {
      const p1 = document.querySelector('[data-i18n="price_card_1_cost"]');
      const p2 = document.querySelector('[data-i18n="price_card_2_cost"]');
      const p3 = document.querySelector('[data-i18n="price_card_3_cost"]');
      if (p1 && cfg.pricing.standard) p1.textContent = cfg.pricing.standard;
      if (p2 && cfg.pricing.premium) p2.textContent = cfg.pricing.premium;
      if (p3 && cfg.pricing.pair) p3.textContent = cfg.pricing.pair;
    }
  } catch (err) {
    console.error("Config sync error:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  syncRemoteConfig();
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = { VENDING_LOCATIONS };
}
