/**
 * AgroVida - Módulo de Historial Fitosanitario
 * Permite registrar, comparar fotografías antes/después y hacer seguimiento a la salud de las plantas.
 */

const HistorialModule = {
  historial: [],

  // Registros iniciales vacíos para que el agricultor empiece con su propio historial limpio
  defaultHistorial: [],

  init() {
    this.setupListeners();
    this.loadHistorial();
  },

  activeModalId: null,

  setupListeners() {
    // Filtro por estado en la pantalla de historial
    const filtroSelect = document.getElementById("filtro-historial-estado");
    if (filtroSelect) {
      filtroSelect.addEventListener("change", (e) => {
        this.filterHistorial(e.target.value);
      });
    }

    const btnEliminarModal = document.getElementById("btn-eliminar-historial-modal");
    if (btnEliminarModal) {
      btnEliminarModal.addEventListener("click", () => {
        if (this.activeModalId) this.deleteHistorialRecord(this.activeModalId);
      });
    }
  },

  async loadHistorial() {
    const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
    const userId = user ? user.uid : "demo_agricultor_juan";
    let localStored = window.AgroVidaStorage.get(`historial_${userId}`, null);
    // Filtrar registros mock/dummy viejos para que el agricultor tenga su historial limpio
    const cleanLocal = localStored && Array.isArray(localStored)
      ? localStored.filter((h) => !h.id.startsWith("hist_00"))
      : [];

    if (window.firestoreDb && userId && userId !== "demo_agricultor_juan") {
      try {
        const snapshot = await window.firestoreDb
          .collection("historial")
          .where("userId", "==", userId)
          .get();

        const fromCloud = [];
        snapshot.forEach((doc) => {
          fromCloud.push({ id: doc.id, ...doc.data() });
        });

        if (fromCloud.length > 0) {
          this.historial = fromCloud;
        } else if (cleanLocal.length > 0) {
          this.historial = cleanLocal;
        } else {
          // El usuario solicitó que el historial esté vacío para iniciar limpio
          this.historial = [];
        }
      } catch (err) {
        console.warn("Aviso al cargar historial desde Firestore:", err);
        this.historial = cleanLocal;
      }
    } else {
      this.historial = cleanLocal;
    }

    this.renderHistorialList(this.historial);
  },

  async addHistorialRecord(recordData) {
    const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
    const userId = user ? user.uid : "demo_agricultor_juan";

    const newRecord = {
      ...recordData,
      id: `hist_${Date.now()}`,
      userId: userId,
      createdAt: new Date().toISOString()
    };

    // Siempre guardamos en almacenamiento local para asegurar que la fotografía nunca se pierda
    let stored = window.AgroVidaStorage.get(`historial_${userId}`, []);
    stored.unshift(newRecord);
    window.AgroVidaStorage.set(`historial_${userId}`, stored);

    this.historial.unshift(newRecord);
    this.renderHistorialList(this.historial);

    if (window.firestoreDb && userId && userId !== "demo_agricultor_juan") {
      try {
        const docRef = await window.firestoreDb.collection("historial").add(newRecord);
        newRecord.id = docRef.id;
      } catch (err) {
        console.warn("Aviso guardando historial en Firestore:", err);
      }
    }

    if (window.App && window.App.showNotification) {
      window.App.showNotification("¡Fotografía y análisis guardados en tu historial!", "success");
    }
  },

  filterHistorial(estadoFiltro) {
    if (!estadoFiltro || estadoFiltro === "todos") {
      this.renderHistorialList(this.historial);
    } else {
      const filtered = this.historial.filter((h) => h.estado === estadoFiltro);
      this.renderHistorialList(filtered);
    }
  },

  renderHistorialList(items) {
    const container = document.getElementById("historial-items-container");
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box" style="padding: 40px 20px; text-align: center;">
          <span class="empty-icon" style="font-size: 3rem; display: block; margin-bottom: 12px;">📋</span>
          <h4 style="font-weight: 700; margin-bottom: 6px;">Historial limpio</h4>
          <p style="color: var(--text-muted); margin-bottom: 16px;">Aún no tienes registros fitosanitarios guardados. Toma una foto con la cámara para comenzar.</p>
          <button class="btn btn-primary btn-sm" onclick="App.showScreen('analizar')">
            📷 Analizar una planta ahora
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = items
      .map((item) => {
        const badgeClass =
          item.estado === "Sin problemas"
            ? "badge-healthy"
            : item.estado === "En tratamiento"
            ? "badge-warning"
            : "badge-danger";

        const partes = item.fecha ? item.fecha.split("-") : ["2025", "10", "28"];
        const fechaFormateada = partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : item.fecha;
        const isAdmin = window.AuthModule && window.AuthModule.isAdmin;

        return `
          <div class="historial-card">
            <div class="historial-card-left">
              <img src="${item.fotoAntes || 'img/cultivos/hoja-enferma.jpg'}" alt="${item.cultivo}" class="historial-thumb">
              <div class="historial-info">
                <div class="historial-meta">
                  <span class="historial-date">📅 ${fechaFormateada}</span>
                  <strong class="historial-crop">Cultivo: ${item.cultivo}</strong>
                </div>
                <p class="historial-problem"><strong>Problema:</strong> ${item.problema}</p>
                <div class="historial-status-row">
                  <span class="status-badge ${badgeClass}">${item.estado}</span>
                </div>
              </div>
            </div>
            
            <div class="historial-card-right" style="display: flex; gap: 8px; align-items: center;">
              <button class="btn btn-outline btn-sm" onclick="HistorialModule.openDetailModal('${item.id}')">
                Ver detalle
              </button>
              ${
                isAdmin
                  ? `<button class="btn btn-danger btn-sm" onclick="HistorialModule.deleteHistorialRecord('${item.id}')" title="Eliminar foto y análisis (Solo Admin)">🗑️</button>`
                  : ``
              }
            </div>
          </div>
        `;
      })
      .join("");
  },

  openDetailModal(id) {
    const item = this.historial.find((h) => h.id === id);
    if (!item) return;

    this.activeModalId = id;
    const modal = document.getElementById("modal-historial-detalle");
    if (!modal) return;

    document.getElementById("historial-modal-crop").textContent = item.cultivo;
    document.getElementById("historial-modal-date").textContent = item.fecha;
    document.getElementById("historial-modal-problem").textContent = item.problema;
    document.getElementById("historial-modal-symptoms").textContent = item.sintomas || "No especificado";
    document.getElementById("historial-modal-actions").textContent = item.medidasRealizadas || "Ninguna medida registrada";

    const imgAntes = document.getElementById("historial-modal-img-antes");
    const imgDespues = document.getElementById("historial-modal-img-despues");
    if (imgAntes) imgAntes.src = item.fotoAntes || "img/cultivos/hoja-enferma.jpg";
    if (imgDespues) imgDespues.src = item.fotoDespues || "img/cultivos/hoja-sana.jpg";

    const badge = document.getElementById("historial-modal-status-badge");
    if (badge) {
      badge.textContent = item.estado;
      badge.className = `status-badge ${
        item.estado === "Sin problemas" ? "badge-healthy" : "badge-warning"
      }`;
    }

    // Solo el administrador tiene botón de eliminar en el detalle
    const btnEliminarModal = document.getElementById("btn-eliminar-historial-modal");
    if (btnEliminarModal) {
      btnEliminarModal.style.display = (window.AuthModule && window.AuthModule.isAdmin) ? "inline-flex" : "none";
    }

    window.App.openModal("modal-historial-detalle");
  },

  async deleteHistorialRecord(id) {
    if (!window.AuthModule || !window.AuthModule.isAdmin) {
      alert("Solo el administrador del sistema tiene autorización para eliminar registros o fotografías fitosanitarias.");
      return;
    }

    if (!confirm("¿Deseas eliminar esta fotografía y su registro fitosanitario del sistema?")) return;
    const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
    const userId = user ? user.uid : "demo_agricultor_juan";

    this.historial = this.historial.filter((h) => h.id !== id);
    window.AgroVidaStorage.set(`historial_${userId}`, this.historial);
    this.renderHistorialList(this.historial);

    if (window.firestoreDb && userId && userId !== "demo_agricultor_juan") {
      try {
        await window.firestoreDb.collection("historial").doc(id).delete();
      } catch (err) {
        console.warn("Aviso eliminando de Firestore:", err);
      }
    }

    window.App.closeModal("modal-historial-detalle");
    if (window.App && window.App.showNotification) {
      window.App.showNotification("Fotografía y registro eliminados con éxito.", "info");
    }
  }
};

window.HistorialModule = HistorialModule;
