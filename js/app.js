/**
 * AgroVida - Aplicación Principal y Enrutador de Pantallas
 * Controla la navegación del menú lateral, barra superior, modales,
 * accesos rápidos, buscador global y centro de notificaciones.
 */

const App = {
  activeScreen: "inicio",

  // Notificaciones del sistema agrícola
  notificaciones: [
    {
      id: "notif_1",
      titulo: "Recordatorio de riego",
      mensaje: "Toca riego ligero para la parcela de Maíz según calendario.",
      tiempo: "Hace 15 min",
      leida: false
    },
    {
      id: "notif_2",
      titulo: "Alerta de humedad alta",
      mensaje: "Humedad superior al 85% en la zona. Revisa posibles hongos en la Papa.",
      tiempo: "Hace 2 horas",
      leida: false
    }
  ],

  init() {
    this.setupNavigation();
    this.setupGlobalSearch();
    this.setupNotifications();
    this.setupMobileMenu();
    this.setupModalDismiss();

    // Iniciar módulos
    if (window.AuthModule) window.AuthModule.init();
    if (window.CultivosModule) window.CultivosModule.init();
    if (window.AnalisisModule) window.AnalisisModule.init();
    if (window.EnfermedadesModule) window.EnfermedadesModule.init();
    if (window.HistorialModule) window.HistorialModule.init();
    if (window.BibliotecaModule) window.BibliotecaModule.init();
    if (window.PerfilModule) window.PerfilModule.init();
    if (window.AdminModule) window.AdminModule.init();

    // Mostrar pantalla de inicio por defecto
    this.showScreen("inicio");
    console.log(" AgroVida Web inicializada correctamente.");
  },

  // Configuración de los enlaces del menú lateral y accesos rápidos
  setupNavigation() {
    // Todos los elementos con data-screen
    document.querySelectorAll("[data-screen]").forEach((elem) => {
      elem.addEventListener("click", (e) => {
        e.preventDefault();
        const targetScreen = elem.getAttribute("data-screen");
        const adminTab = elem.getAttribute("data-admin-tab");
        if (targetScreen) {
          this.showScreen(targetScreen);
          if (targetScreen === "admin" && adminTab && window.AdminModule) {
            window.AdminModule.switchTab(adminTab);
          }

          // Si es pantalla móvil, cerrar el drawer lateral
          const sidebar = document.getElementById("main-sidebar");
          if (sidebar && sidebar.classList.contains("mobile-open")) {
            sidebar.classList.remove("mobile-open");
          }
        }
      });
    });
  },

  // Cambiar pantalla activa y actualizar resaltado en el menú
  showScreen(screenId) {
    const screens = document.querySelectorAll(".screen-content");
    let found = false;

    screens.forEach((screen) => {
      if (screen.id === `screen-${screenId}`) {
        screen.classList.add("active");
        found = true;
      } else {
        screen.classList.remove("active");
      }
    });

    if (!found) {
      console.warn(`Pantalla "${screenId}" no encontrada. Mostrando inicio.`);
      const home = document.getElementById("screen-inicio");
      if (home) home.classList.add("active");
      screenId = "inicio";
    }

    this.activeScreen = screenId;

    // Actualizar clase activa en el menú lateral
    document.querySelectorAll(".sidebar-nav-item").forEach((item) => {
      const target = item.getAttribute("data-screen");
      if (target === screenId || (screenId === "agregar-cultivo" && target === "cultivos")) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Actualizar título en el breadcrumb si existe
    const breadcrumbTitle = document.getElementById("top-breadcrumb-title");
    if (breadcrumbTitle) {
      const titlesMap = {
        "inicio": "Inicio",
        "cultivos": "Mis cultivos",
        "agregar-cultivo": "Agregar cultivo",
        "analizar": "Analizar planta",
        "enfermedades": "Enfermedades",
        "historial": "Historial",
        "biblioteca": "Biblioteca agrícola",
        "perfil": "Mi perfil",
        "admin": "Centro de Gestión y Reportes"
      };
      breadcrumbTitle.textContent = titlesMap[screenId] || "AgroVida";
    }

    if (screenId === "analizar" && window.AnalisisModule && window.AnalisisModule.populateCropSelector) {
      window.AnalisisModule.populateCropSelector();
    }
    if (screenId === "cultivos" && window.CultivosModule) {
      window.CultivosModule.renderCultivosTable();
      window.CultivosModule.renderDashboardSummary();
    }
    if (screenId === "historial" && window.HistorialModule) {
      window.HistorialModule.loadHistorial();
    }

    // Scroll al tope del contenido
    const mainContainer = document.querySelector(".app-main-content");
    if (mainContainer) mainContainer.scrollTop = 0;
  },

  // Buscador global en la barra superior
  setupGlobalSearch() {
    const searchInput = document.getElementById("global-search-input");
    if (!searchInput) return;

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) return;

        // Comprobar si coincide con enfermedades
        const matchedDisease = window.EnfermedadesModule?.catalogo.some(
          (d) => d.nombre.toLowerCase().includes(query) || d.sintomas.toLowerCase().includes(query)
        );

        // Comprobar si coincide con guías de biblioteca
        const matchedGuide = window.BibliotecaModule?.guias.some(
          (g) => g.nombre.toLowerCase().includes(query) || g.descripcionCorta.toLowerCase().includes(query)
        );

        if (matchedDisease) {
          this.showScreen("enfermedades");
          const inputEnf = document.getElementById("input-buscar-enfermedad");
          if (inputEnf) {
            inputEnf.value = query;
            window.EnfermedadesModule.filterEnfermedades(query);
          }
        } else if (matchedGuide) {
          this.showScreen("biblioteca");
        } else {
          // Filtrar o navegar a Mis Cultivos
          this.showScreen("cultivos");
        }
      }
    });
  },

  // Centro de Notificaciones
  setupNotifications() {
    const btnBell = document.getElementById("btn-top-notifications");
    const dropdown = document.getElementById("notifications-dropdown");

    if (btnBell && dropdown) {
      btnBell.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("open");
      });

      document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target) && !btnBell.contains(e.target)) {
          dropdown.classList.remove("open");
        }
      });
    }

    this.renderNotifications();
  },

  renderNotifications() {
    const listElem = document.getElementById("notifications-list");
    const badgeElem = document.getElementById("notifications-count-badge");

    if (listElem) {
      listElem.innerHTML = this.notificaciones
        .map(
          (n) => `
          <div class="notification-item ${n.leida ? 'read' : 'unread'}">
            <span class="notification-dot"></span>
            <div class="notification-text">
              <strong>${n.titulo}</strong>
              <p>${n.mensaje}</p>
              <span class="notification-time">${n.tiempo}</span>
            </div>
          </div>
        `
        )
        .join("");
    }

    if (badgeElem) {
      const unreadCount = this.notificaciones.filter((n) => !n.leida).length;
      badgeElem.textContent = unreadCount;
      badgeElem.style.display = unreadCount > 0 ? "inline-flex" : "none";
    }
  },

  // Menú hamburguesa para pantallas móviles
  setupMobileMenu() {
    const btnBurger = document.getElementById("btn-mobile-burger");
    const sidebar = document.getElementById("main-sidebar");

    if (btnBurger && sidebar) {
      btnBurger.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-open");
      });
    }
  },

  // Manejador genérico de modales
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("modal-open");
      document.body.classList.add("modal-backdrop-active");
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("modal-open");
      if (!document.querySelector(".modal.modal-open")) {
        document.body.classList.remove("modal-backdrop-active");
      }
    }
  },

  setupModalDismiss() {
    document.querySelectorAll(".modal-close-trigger").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal");
        if (modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // Cerrar modal al hacer clic en el backdrop oscuro
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });
  },

  // Notificaciones flotantes tipo Toast
  showNotification(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast-item toast-${type}`;
    const icon = type === "success" ? "✓" : type === "danger" ? "✕" : "ℹ";
    toast.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-msg">${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-fade-out");
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, 3500);
  }
};

window.App = App;

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
