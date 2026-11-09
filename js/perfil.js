/**
 * AgroVida - Módulo de Perfil del Agricultor
 * Muestra y permite editar los datos personales, métricas de producción y avatar.
 */

const PerfilModule = {
  init() {
    this.setupListeners();
    this.renderProfile();
  },

  setupListeners() {
    // Botón Cambiar Foto
    const btnCambiarFoto = document.getElementById("btn-perfil-cambiar-foto");
    const inputFoto = document.getElementById("input-perfil-foto-hidden");
    if (btnCambiarFoto && inputFoto) {
      btnCambiarFoto.addEventListener("click", () => {
        inputFoto.click();
      });

      inputFoto.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const newPhotoURL = event.target.result;
            if (window.AuthModule) {
              window.AuthModule.updateProfile({ photoURL: newPhotoURL });
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Botón Editar Perfil (abrir modal)
    const btnEditarPerfil = document.getElementById("btn-abrir-editar-perfil");
    if (btnEditarPerfil) {
      btnEditarPerfil.addEventListener("click", () => {
        this.openEditModal();
      });
    }

    // Formulario de guardar cambios de perfil
    const formEditar = document.getElementById("form-editar-perfil");
    if (formEditar) {
      formEditar.addEventListener("submit", (e) => {
        e.preventDefault();
        const nombre = document.getElementById("edit-perfil-nombre").value.trim();
        const email = document.getElementById("edit-perfil-email").value.trim();
        const telefono = document.getElementById("edit-perfil-telefono").value.trim();
        const ubicacion = document.getElementById("edit-perfil-ubicacion").value.trim();

        if (window.AuthModule) {
          window.AuthModule.updateProfile({
            name: nombre,
            email: email,
            phone: telefono,
            location: ubicacion
          });
        }

        window.App.closeModal("modal-editar-perfil");
      });
    }

    // Botón Mis Reportes
    const btnReportes = document.getElementById("btn-perfil-reportes");
    if (btnReportes) {
      btnReportes.addEventListener("click", () => {
        this.generateSummaryReport();
      });
    }

    // Botón Configuración
    const btnConfig = document.getElementById("btn-perfil-config");
    if (btnConfig) {
      btnConfig.addEventListener("click", () => {
        window.App.openModal("modal-ia-config");
      });
    }
  },

  renderProfile() {
    const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
    if (!user) return;

    const elemNombre = document.getElementById("perfil-usuario-nombre");
    const elemEmail = document.getElementById("perfil-usuario-email");
    const elemTelefono = document.getElementById("perfil-usuario-telefono");
    const elemUbicacion = document.getElementById("perfil-usuario-ubicacion");
    const elemAvatar = document.getElementById("perfil-usuario-avatar");
    const elemRegistro = document.getElementById("perfil-usuario-registro");

    if (elemNombre) elemNombre.textContent = user.name || "Juan Pérez";
    if (elemEmail) elemEmail.textContent = user.email || "juan@gmail.com";
    if (elemTelefono) elemTelefono.textContent = user.phone || "+51 987 654 321";
    if (elemUbicacion) elemUbicacion.textContent = user.location || "Valle del Mantaro, Perú";
    if (elemAvatar) elemAvatar.src = user.photoURL || "img/farmer-avatar.jpg";
    if (elemRegistro) elemRegistro.textContent = user.registeredAt || "15/05/2024";

    // Actualizar contadores
    if (window.CultivosModule) {
      const countCultivos = window.CultivosModule.cultivos ? window.CultivosModule.cultivos.length : 0;
      const elemCount = document.getElementById("perfil-cultivos-count");
      if (elemCount) elemCount.textContent = countCultivos;
    }
  },

  openEditModal() {
    const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
    if (!user) return;

    document.getElementById("edit-perfil-nombre").value = user.name || "";
    document.getElementById("edit-perfil-email").value = user.email || "";
    document.getElementById("edit-perfil-telefono").value = user.phone || "";
    document.getElementById("edit-perfil-ubicacion").value = user.location || "";

    window.App.openModal("modal-editar-perfil");
  },

  generateSummaryReport() {
    const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
    const cultivos = window.CultivosModule ? window.CultivosModule.cultivos : [];
    const historial = window.HistorialModule ? window.HistorialModule.historial : [];

    const reporteTexto = `
=========================================
      AGROVIDA - REPORTE DE CAMPAÑA
=========================================
Agricultor: ${user ? user.name : "Juan Pérez"}
Ubicación: ${user ? user.location : "Perú"}
Fecha: ${new Date().toLocaleDateString()}

RESUMEN DE CULTIVOS:
- Cultivos registrados: ${cultivos.length}
${cultivos.map((c) => `  • ${c.nombre}: ${c.area} m² | Estado: ${c.estado} | Siembra: ${c.fechaSiembra}`).join("\n")}

HISTORIAL FITOSANITARIO:
- Evaluaciones y análisis realizados: ${historial.length}
${historial.map((h) => `  • [${h.fecha}] ${h.cultivo}: ${h.problema} (${h.estado})`).join("\n")}
=========================================
    Cultiva mejor, cosecha con confianza.
    `;

    // Descargar o mostrar en alerta
    const blob = new Blob([reporteTexto], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Reporte_AgroVida_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    window.App.showNotification("Reporte agrícola generado y descargado con éxito.", "success");
  }
};

window.PerfilModule = PerfilModule;
