/**
 * AgroVida - Módulo de Gestión de Cultivos
 * CRUD completo con soporte de fotografías reales tomadas con cámara o subidas de archivo.
 */

const CultivosModule = {
  cultivos: [],
  editingId: null,

  // Cultivos iniciales con fotografías reales
  defaultCultivos: [
    {
      id: "cult_001",
      userId: "demo_agricultor_juan",
      nombre: "Papa",
      variedad: "Canchan / Blanca",
      fechaSiembra: "2025-08-15",
      area: 100,
      tipoSuelo: "Franco-arenoso",
      estado: "Saludable",
      foto: "img/cultivos/papa.jpg",
      observaciones: "Buen crecimiento vegetativo, aporque realizado a tiempo."
    },
    {
      id: "cult_002",
      userId: "demo_agricultor_juan",
      nombre: "Maíz",
      variedad: "Amarillo duro",
      fechaSiembra: "2025-08-20",
      area: 80,
      tipoSuelo: "Franco",
      estado: "En revisión",
      foto: "img/cultivos/maiz.jpg",
      observaciones: "Se detectó inicio de mancha foliar en hojas basales. En tratamiento preventivo."
    },
    {
      id: "cult_003",
      userId: "demo_agricultor_juan",
      nombre: "Choclo",
      variedad: "Gigante del Cusco",
      fechaSiembra: "2025-08-25",
      area: 70,
      tipoSuelo: "Franco-arcilloso",
      estado: "Saludable",
      foto: "img/cultivos/choclo.jpg",
      observaciones: "Riego controlado por surcos. Formación óptima de mazorcas."
    },
    {
      id: "cult_004",
      userId: "demo_agricultor_juan",
      nombre: "Haba",
      variedad: "Verde Serrana / Gigante",
      fechaSiembra: "2025-08-01",
      area: 50,
      tipoSuelo: "Franco",
      estado: "Saludable",
      foto: "img/cultivos/haba.svg",
      observaciones: "Fijación biológica de nitrógeno activa. Crecimiento vigoroso sin plagas."
    },
    {
      id: "cult_005",
      userId: "demo_agricultor_juan",
      nombre: "Arvejas",
      variedad: "Usui / Rondo",
      fechaSiembra: "2025-08-10",
      area: 60,
      tipoSuelo: "Franco",
      estado: "Saludable",
      foto: "img/cultivos/arveja-cultivo.jpg",
      observaciones: "Tutorado instalado. Monitoreo fitosanitario con trampas amarillas (Doctor Agro)."
    }
  ],

  init() {
    this.setupListeners();
    this.loadCultivos();
  },

  setupListeners() {
    const formCultivo = document.getElementById("form-agregar-cultivo");
    if (formCultivo) {
      formCultivo.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSaveCultivo();
      });
    }

    const btnCancelar = document.getElementById("btn-cancelar-cultivo");
    if (btnCancelar) {
      btnCancelar.addEventListener("click", () => {
        this.resetForm();
        window.App.showScreen("cultivos");
      });
    }

    // Input de foto de archivo
    const inputFoto = document.getElementById("cultivo-foto-input");
    const previewImg = document.getElementById("cultivo-foto-preview");
    if (inputFoto && previewImg) {
      inputFoto.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 8 * 1024 * 1024) {
            alert("La fotografía no debe superar los 8MB.");
            return;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
            previewImg.src = event.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Sugerencia automática de foto real al seleccionar cultivo
    const selectNombre = document.getElementById("cultivo-nombre");
    if (selectNombre && previewImg) {
      selectNombre.addEventListener("change", (e) => {
        const nombreVal = e.target.value.toLowerCase();
        if (!inputFoto || !inputFoto.files || inputFoto.files.length === 0) {
          if (nombreVal.includes("papa")) previewImg.src = "img/cultivos/papa.jpg";
          else if (nombreVal.includes("choclo")) previewImg.src = "img/cultivos/choclo.jpg";
          else if (nombreVal.includes("haba")) previewImg.src = "img/cultivos/haba.svg";
          else if (nombreVal.includes("arveja") || nombreVal.includes("alverja")) previewImg.src = "img/cultivos/arveja.jpg";
          else if (nombreVal.includes("quinua")) previewImg.src = "img/cultivos/quinua.jpg";
        }
      });
    }
  },

  async loadCultivos() {
    const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
    const userId = user ? user.uid : "demo_agricultor_juan";
    let localStored = window.AgroVidaStorage ? window.AgroVidaStorage.get(`cultivos_${userId}`, null) : null;

    if (window.firestoreDb && userId && userId !== "demo_agricultor_juan") {
      try {
        const snapshot = await window.firestoreDb
          .collection("cultivos")
          .where("userId", "==", userId)
          .get();

        const fromCloud = [];
        snapshot.forEach((doc) => {
          fromCloud.push({ id: doc.id, ...doc.data() });
        });

        if (fromCloud.length > 0) {
          this.cultivos = fromCloud;
          if (window.AgroVidaStorage) {
            window.AgroVidaStorage.set(`cultivos_${userId}`, fromCloud);
          }
        } else if (localStored && localStored.length > 0) {
          this.cultivos = localStored;
        } else {
          // Si el usuario no tiene cultivos registrados aún, se cargan los cultivos iniciales
          this.cultivos = this.defaultCultivos.map((c) => ({ ...c, userId: userId }));
          if (window.AgroVidaStorage) {
            window.AgroVidaStorage.set(`cultivos_${userId}`, this.cultivos);
          }
        }
      } catch (error) {
        console.warn("Aviso consultando Firestore (modo local activo):", error);
        this.cultivos = localStored && localStored.length ? localStored : this.defaultCultivos.map((c) => ({ ...c, userId: userId }));
      }
    } else {
      this.cultivos = localStored && localStored.length ? localStored : this.defaultCultivos.map((c) => ({ ...c, userId: userId }));
    }

    this.renderCultivosTable();
    this.renderDashboardSummary();

    if (window.AnalisisModule && window.AnalisisModule.populateCropSelector) {
      window.AnalisisModule.populateCropSelector();
    }
  },

  async handleSaveCultivo() {
    const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
    const userId = user ? user.uid : "demo_agricultor_juan";

    const nombre = document.getElementById("cultivo-nombre").value.trim();
    const fechaSiembra = document.getElementById("cultivo-fecha").value;
    const area = parseFloat(document.getElementById("cultivo-area").value) || 0;
    const tipoSuelo = document.getElementById("cultivo-suelo").value;
    const estado = document.getElementById("cultivo-estado").value || "Saludable";
    const observaciones = document.getElementById("cultivo-observaciones").value.trim();
    const previewImg = document.getElementById("cultivo-foto-preview");
    const foto = previewImg ? previewImg.src : "img/cultivos/papa.jpg";

    if (!nombre) {
      alert("Por favor indica el nombre del cultivo.");
      return;
    }
    if (!fechaSiembra) {
      alert("Por favor selecciona la fecha de siembra.");
      return;
    }

    const cultivoData = {
      userId: userId,
      nombre: nombre,
      fechaSiembra: fechaSiembra,
      area: area,
      tipoSuelo: tipoSuelo,
      estado: estado,
      foto: foto,
      observaciones: observaciones,
      updatedAt: new Date().toISOString()
    };

    // 1. Guardar de inmediato en memoria y almacenamiento local garantizado
    if (this.editingId) {
      const index = this.cultivos.findIndex((c) => c.id === this.editingId);
      if (index !== -1) {
        this.cultivos[index] = { ...this.cultivos[index], ...cultivoData, id: this.editingId };
      }
      window.App.showNotification("Cultivo actualizado exitosamente.", "success");
    } else {
      cultivoData.id = `cult_${Date.now()}`;
      cultivoData.createdAt = new Date().toISOString();
      this.cultivos.unshift(cultivoData);
      window.App.showNotification("Cultivo registrado exitosamente en Mis Cultivos.", "success");
    }

    if (window.AgroVidaStorage) {
      window.AgroVidaStorage.set(`cultivos_${userId}`, this.cultivos);
    }
    this.renderCultivosTable();
    this.renderDashboardSummary();

    // 2. Sincronizar con Firestore en segundo plano si está disponible
    if (window.firestoreDb && userId && userId !== "demo_agricultor_juan") {
      try {
        if (this.editingId && !this.editingId.startsWith("cult_demo")) {
          await window.firestoreDb.collection("cultivos").doc(this.editingId).update(cultivoData);
        } else {
          const docRef = await window.firestoreDb.collection("cultivos").add(cultivoData);
          if (!this.editingId) {
            cultivoData.id = docRef.id;
            if (window.AgroVidaStorage) {
              window.AgroVidaStorage.set(`cultivos_${userId}`, this.cultivos);
            }
          }
        }
      } catch (err) {
        console.warn("Aviso Firestore al guardar cultivo (guardado local preservado):", err);
      }
    }

    this.resetForm();
    if (window.AnalisisModule && window.AnalisisModule.populateCropSelector) {
      window.AnalisisModule.populateCropSelector();
    }
    window.App.showScreen("cultivos");
  },

  editCultivo(id) {
    const cultivo = this.cultivos.find((c) => c.id === id);
    if (!cultivo) return;

    this.editingId = id;
    document.getElementById("cultivo-nombre").value = cultivo.nombre;
    document.getElementById("cultivo-fecha").value = cultivo.fechaSiembra;
    document.getElementById("cultivo-area").value = cultivo.area;
    document.getElementById("cultivo-suelo").value = cultivo.tipoSuelo || "Franco";
    document.getElementById("cultivo-estado").value = cultivo.estado || "Saludable";
    document.getElementById("cultivo-observaciones").value = cultivo.observaciones || "";

    const preview = document.getElementById("cultivo-foto-preview");
    if (preview) preview.src = cultivo.foto || "img/cultivos/papa.jpg";

    const titleElem = document.getElementById("form-cultivo-title");
    if (titleElem) titleElem.textContent = "Editar cultivo";

    window.App.showScreen("agregar-cultivo");
  },

  async deleteCultivo(id) {
    const cultivo = this.cultivos.find((c) => c.id === id);
    const nombre = cultivo ? cultivo.nombre : "este cultivo";

    if (!confirm(`¿Estás seguro de que deseas eliminar "${nombre}" de tu registro?`)) {
      return;
    }

    const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
    const userId = user ? user.uid : "demo_agricultor_juan";

    // Eliminar de memoria y almacenamiento local
    this.cultivos = this.cultivos.filter((c) => c.id !== id);
    if (window.AgroVidaStorage) {
      window.AgroVidaStorage.set(`cultivos_${userId}`, this.cultivos);
    }
    this.renderCultivosTable();
    this.renderDashboardSummary();

    // Eliminar de Firestore si aplica
    if (window.firestoreDb && userId && userId !== "demo_agricultor_juan" && !id.startsWith("cult_demo")) {
      try {
        await window.firestoreDb.collection("cultivos").doc(id).delete();
      } catch (error) {
        console.warn("Aviso Firestore al eliminar cultivo:", error);
      }
    }

    if (window.AnalisisModule && window.AnalisisModule.populateCropSelector) {
      window.AnalisisModule.populateCropSelector();
    }
    window.App.showNotification(`Cultivo "${nombre}" eliminado.`, "info");
  },

  // Guarda en Mis Cultivos la fotografía y el estado diagnosticado por la IA
  updateCropFromAnalysis(nombreCultivo, nuevoEstado, nuevaFoto, observacion) {
    if (!nombreCultivo) return;
    const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
    const userId = user ? user.uid : "demo_agricultor_juan";

    const index = this.cultivos.findIndex(
      (c) => c.nombre.toLowerCase().includes(nombreCultivo.toLowerCase()) || nombreCultivo.toLowerCase().includes(c.nombre.toLowerCase())
    );

    if (index !== -1) {
      const c = this.cultivos[index];
      c.estado = nuevoEstado;
      if (nuevaFoto) c.foto = nuevaFoto;
      c.observaciones = observacion;
      c.updatedAt = new Date().toISOString();

      if (window.AgroVidaStorage) {
        window.AgroVidaStorage.set(`cultivos_${userId}`, this.cultivos);
      }
      this.renderCultivosTable();
      this.renderDashboardSummary();

      if (window.firestoreDb && userId && userId !== "demo_agricultor_juan" && c.id && !c.id.startsWith("cult_demo")) {
        window.firestoreDb.collection("cultivos").doc(c.id).update({
          estado: nuevoEstado,
          foto: c.foto,
          observaciones: observacion,
          updatedAt: new Date().toISOString()
        }).catch((e) => console.warn("Aviso Firestore al actualizar cultivo desde análisis:", e));
      }
    } else {
      // Si el cultivo analizado no estaba registrado previamente, se registra automáticamente
      const nuevoCultivo = {
        id: `cult_${Date.now()}`,
        userId: userId,
        nombre: nombreCultivo,
        fechaSiembra: new Date().toISOString().split("T")[0],
        area: 50,
        tipoSuelo: "Franco",
        estado: nuevoEstado,
        foto: nuevaFoto || "img/cultivos/papa.jpg",
        observaciones: observacion,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.cultivos.unshift(nuevoCultivo);

      if (window.AgroVidaStorage) {
        window.AgroVidaStorage.set(`cultivos_${userId}`, this.cultivos);
      }
      this.renderCultivosTable();
      this.renderDashboardSummary();

      if (window.firestoreDb && userId && userId !== "demo_agricultor_juan") {
        window.firestoreDb.collection("cultivos").add(nuevoCultivo).then((docRef) => {
          nuevoCultivo.id = docRef.id;
          if (window.AgroVidaStorage) {
            window.AgroVidaStorage.set(`cultivos_${userId}`, this.cultivos);
          }
        }).catch((e) => console.warn("Aviso Firestore al registrar cultivo desde análisis:", e));
      }
    }
  },

  resetForm() {
    this.editingId = null;
    const form = document.getElementById("form-agregar-cultivo");
    if (form) form.reset();

    const titleElem = document.getElementById("form-cultivo-title");
    if (titleElem) titleElem.textContent = "Agregar cultivo";

    const preview = document.getElementById("cultivo-foto-preview");
    if (preview) preview.src = "img/cultivos/papa.jpg";
  },

  renderCultivosTable() {
    const tbody = document.getElementById("tabla-cultivos-body");
    if (!tbody) return;

    if (this.cultivos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-table-cell">
            <div class="empty-state-box">
              <span class="empty-icon">🌱</span>
              <p>No tienes cultivos registrados todavía.</p>
              <button class="btn btn-primary btn-sm" onclick="App.showScreen('agregar-cultivo')">
                + Agregar mi primer cultivo
              </button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.cultivos
      .map((c) => {
        const badgeClass =
          c.estado === "Saludable"
            ? "badge-healthy"
            : c.estado === "En revisión"
            ? "badge-warning"
            : "badge-danger";

        const partes = c.fechaSiembra ? c.fechaSiembra.split("-") : ["2025", "08", "15"];
        const fechaFormateada = partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : c.fechaSiembra;

        return `
          <tr>
            <td class="col-cultivo">
              <div class="cultivo-cell-content">
                <img src="${c.foto || 'img/cultivos/papa.jpg'}" alt="${c.nombre}" class="cultivo-thumb">
                <div>
                  <strong>${c.nombre}</strong>
                  ${c.tipoSuelo ? `<span class="cultivo-sub">${c.tipoSuelo}</span>` : ""}
                </div>
              </div>
            </td>
            <td>${fechaFormateada}</td>
            <td>${c.area} m²</td>
            <td><span class="status-badge ${badgeClass}">${c.estado}</span></td>
            <td class="col-actions">
              <button class="btn-icon btn-edit" title="Editar cultivo" onclick="CultivosModule.editCultivo('${c.id}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-icon btn-delete" title="Eliminar cultivo" onclick="CultivosModule.deleteCultivo('${c.id}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
  },

  renderDashboardSummary() {
    const container = document.getElementById("inicio-cultivos-recientes");
    if (container) {
      if (this.cultivos.length === 0) {
        container.innerHTML = `<p class="text-muted">Aún no hay cultivos registrados.</p>`;
      } else {
        const previewList = this.cultivos.slice(0, 4);
        container.innerHTML = previewList
          .map((c) => {
            const partes = c.fechaSiembra ? c.fechaSiembra.split("-") : ["2025", "08", "15"];
            const fechaFormateada = partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : c.fechaSiembra;
            const badgeClass =
              c.estado === "Saludable" ? "badge-healthy" : c.estado === "En revisión" ? "badge-warning" : "badge-danger";

            return `
              <div class="crop-mini-card" onclick="App.showScreen('cultivos')">
                <img src="${c.foto || 'img/cultivos/papa.jpg'}" alt="${c.nombre}" class="crop-mini-img">
                <div class="crop-mini-info">
                  <h4>${c.nombre}</h4>
                  <span class="crop-date">${fechaFormateada}</span>
                  <span class="status-badge ${badgeClass}">${c.estado}</span>
                </div>
              </div>
            `;
          })
          .join("");
      }
    }

    const donutPercentage = document.getElementById("health-donut-percentage");
    const donutCircle = document.getElementById("health-donut-circle");
    if (this.cultivos.length > 0 && donutPercentage) {
      const saludables = this.cultivos.filter((c) => c.estado === "Saludable").length;
      const ratio = Math.round((saludables / this.cultivos.length) * 100);
      donutPercentage.textContent = `${ratio}%`;

      if (donutCircle) {
        const circumference = 2 * Math.PI * 40;
        const offset = circumference - (ratio / 100) * circumference;
        donutCircle.style.strokeDashoffset = offset;
      }
    }

    const perfilCount = document.getElementById("perfil-cultivos-count");
    if (perfilCount) {
      perfilCount.textContent = this.cultivos.length;
    }
  }
};

window.CultivosModule = CultivosModule;
