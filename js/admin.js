/**
 * AgroVida - Panel de Administrador
 * Gestión de agricultores, catálogo de enfermedades (con fotos) y métricas del sistema.
 * Solo se carga con datos cuando la sesión pertenece a un administrador.
 */

const AdminModule = {
  currentTab: "metricas",
  users: [],
  defaultUsers: [
    {
      id: "usr_marcelino",
      uid: "uid_marcelino",
      name: "Marcelino Quispe Córdova",
      email: "marcelino.campo@gmail.com",
      phone: "+51 964 123 456",
      location: "Concepción, Junín - Parcela Las Retamas",
      role: "agricultor",
      status: "activo",
      photoURL: "img/farmer-avatar.jpg",
      createdAt: "2026-03-12T08:30:00.000Z"
    },
    {
      id: "usr_rosa",
      uid: "uid_rosa",
      name: "Rosa Elena Huamán",
      email: "rosa.huaman@valle.pe",
      phone: "+51 952 789 123",
      location: "Chupaca, Junín - Parcela El Manantial",
      role: "agricultor",
      status: "activo",
      photoURL: "img/farmer-avatar.jpg",
      createdAt: "2026-04-05T10:15:00.000Z"
    },
    {
      id: "usr_eulogio",
      uid: "uid_eulogio",
      name: "Eulogio Cárdenas Mayta",
      email: "eulogio.cardenas@agrovida.pe",
      phone: "+51 988 456 789",
      location: "Jauja, Junín - Fundo Los Molinos",
      role: "agricultor",
      status: "activo",
      photoURL: "img/farmer-avatar.jpg",
      createdAt: "2026-05-18T14:20:00.000Z"
    },
    {
      id: "usr_lucia",
      uid: "uid_lucia",
      name: "Lucía Mendoza Flores",
      email: "lucia.mendoza@agroperu.org",
      phone: "+51 971 234 567",
      location: "Tarma, Junín - Parcela Flor de la Quebrada",
      role: "agricultor",
      status: "activo",
      photoURL: "img/farmer-avatar.jpg",
      createdAt: "2026-06-22T11:45:00.000Z"
    }
  ],

  getStoredUsers() {
    let list = [];
    if (window.AgroVidaStorage) {
      list = window.AgroVidaStorage.get("admin_users_cache", null);
    }
    if (!list || !Array.isArray(list) || !list.length) {
      list = [...this.defaultUsers];
      if (window.AgroVidaStorage) {
        window.AgroVidaStorage.set("admin_users_cache", list);
      }
    }
    return list;
  },

  unsubUsers: null,
  formFotos: [],          // fotos de la enfermedad que se está creando o editando (dataURL o ruta)
  editingDiseaseId: null,
  editingUserId: null,
  filtroUsuarios: "",
  filtroEnfermedades: "",
  filtroCultivos: "",
  filtroHistorial: "",
  MAX_FOTOS: 6,
  MAX_BYTES_FOTOS: 800 * 1024, // límite aproximado de fotos por enfermedad (el documento admite 1 MB)

  init() {
    this.setupListeners();
  },

  setupListeners() {
    // Pestañas
    document.querySelectorAll(".admin-tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tab = e.currentTarget.getAttribute("data-admin-tab");
        this.switchTab(tab);
      });
    });

    // Buscadores
    const bu = document.getElementById("admin-buscar-usuario");
    if (bu) bu.addEventListener("input", (e) => { this.filtroUsuarios = e.target.value.toLowerCase().trim(); this.renderUsersTable(); });
    const be = document.getElementById("admin-buscar-enfermedad");
    if (be) be.addEventListener("input", (e) => { this.filtroEnfermedades = e.target.value.toLowerCase().trim(); this.renderDiseasesTable(); });
    const bc = document.getElementById("admin-buscar-cultivo");
    if (bc) bc.addEventListener("input", (e) => { this.filtroCultivos = e.target.value.toLowerCase().trim(); this.renderCropsTable(); });
    const bh = document.getElementById("admin-buscar-historial");
    if (bh) bh.addEventListener("input", (e) => { this.filtroHistorial = e.target.value.toLowerCase().trim(); this.renderHistoryTable(); });

    // Botón nueva enfermedad
    const btnNueva = document.getElementById("btn-admin-nueva-enfermedad");
    if (btnNueva) btnNueva.addEventListener("click", () => this.openDiseaseForm(null));

    // Formulario de enfermedad
    const formEnf = document.getElementById("form-admin-enfermedad");
    if (formEnf) formEnf.addEventListener("submit", (e) => { e.preventDefault(); this.saveDisease(); });

    const inputFotos = document.getElementById("admin-enf-fotos-input");
    if (inputFotos) inputFotos.addEventListener("change", (e) => this.addFotosFromFiles(e.target.files, inputFotos));

    // Agregar foto por URL (Google / Web)
    const btnAddUrl = document.getElementById("btn-admin-add-url-foto");
    const inputUrl = document.getElementById("admin-enf-url-input");
    if (btnAddUrl && inputUrl) {
      btnAddUrl.addEventListener("click", () => this.addFotoFromUrl(inputUrl.value));
      inputUrl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.addFotoFromUrl(inputUrl.value);
        }
      });
    }

    // Formulario de usuario (editar)
    const formUser = document.getElementById("form-admin-usuario");
    if (formUser) formUser.addEventListener("submit", (e) => { e.preventDefault(); this.saveUser(); });

    // Formulario de nuevo usuario (alta manual por el admin)
    const formNewUser = document.getElementById("form-admin-nuevo-usuario");
    if (formNewUser) formNewUser.addEventListener("submit", (e) => { e.preventDefault(); this.createNewUser(); });

    // Formulario de alerta sanitaria oficial
    const formAlerta = document.getElementById("form-admin-alerta");
    if (formAlerta) formAlerta.addEventListener("submit", (e) => { e.preventDefault(); this.saveAlerta(); });

    // Importar catálogo base
    const btnImport = document.getElementById("btn-admin-importar-base");
    if (btnImport) btnImport.addEventListener("click", () => this.importBaseCatalog());

    // Delegación de eventos en las tablas
    document.getElementById("admin-tabla-usuarios-body")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.dataset.action === "edit-user") this.openUserForm(id);
      if (btn.dataset.action === "toggle-user") this.toggleUser(id);
      if (btn.dataset.action === "delete-user") this.deleteUser(id);
    });
    document.getElementById("admin-tabla-enfermedades-body")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.dataset.action === "edit-disease") this.openDiseaseForm(id);
      if (btn.dataset.action === "delete-disease") this.deleteDisease(id);
    });
    document.getElementById("admin-tabla-cultivos-body")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.dataset.action === "delete-crop") this.deleteCrop(id);
    });
    document.getElementById("admin-tabla-historial-body")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.dataset.action === "delete-history") this.deleteHistoryRecord(id);
    });
    document.getElementById("admin-enf-fotos-preview")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove-foto]");
      if (!btn) return;
      this.formFotos.splice(Number(btn.dataset.removeFoto), 1);
      this.renderFormFotos();
    });
  },

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll(".admin-tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.adminTab === tab));
    document.querySelectorAll(".admin-tab-view").forEach((v) => v.classList.remove("active"));
    const view = document.getElementById(`admin-view-${tab}`);
    if (view) view.classList.add("active");
    const addBtn = document.getElementById("btn-admin-nueva-enfermedad");
    if (addBtn) addBtn.style.display = tab === "enfermedades" ? "inline-flex" : "none";

    // Sincronizar resaltado activo en el menú lateral de administración
    document.querySelectorAll("#sidebar-admin-section .sidebar-nav-item").forEach((b) => {
      b.classList.toggle("active", b.dataset.adminTab === tab);
    });

    if (tab === "metricas") this.renderMetricasTab();
    if (tab === "usuarios") this.renderUsersTable();
    if (tab === "enfermedades") this.renderDiseasesTable();
    if (tab === "cultivos") this.renderCropsTable();
    if (tab === "historial") this.renderHistoryTable();
  },

  // ------------------------------------------------------------------
  // Conexión en tiempo real
  // ------------------------------------------------------------------
  attach() {
    this.users = this.getStoredUsers();
    this.renderUsersTable();
    this.renderMetrics();

    if (!window.firestoreDb) return;

    if (!this.unsubUsers) {
      this.unsubUsers = window.firestoreDb.collection("users").onSnapshot(
        (snap) => {
          const fromDb = [];
          snap.forEach((d) => fromDb.push({ id: d.id, ...d.data() }));

          const currentLocal = this.getStoredUsers();
          const merged = [...fromDb];
          currentLocal.forEach((loc) => {
            if (!merged.some((m) => (m.email || "").toLowerCase() === (loc.email || "").toLowerCase() || m.id === loc.id || m.uid === loc.uid)) {
              merged.push(loc);
            }
          });
          merged.sort((a, b) => this.fechaMs(b.createdAt) - this.fechaMs(a.createdAt));
          this.users = merged;
          if (window.AgroVidaStorage) {
            window.AgroVidaStorage.set("admin_users_cache", merged);
          }
          this.renderUsersTable();
          this.renderMetrics();
        },
        (err) => {
          console.warn("Firestore listener aviso (usando almacenamiento local):", err);
          this.users = this.getStoredUsers();
          this.renderUsersTable();
          this.renderMetrics();
        }
      );
    }

    if (window.EnfermedadesModule && !this._enfBound) {
      this._enfBound = true;
      window.EnfermedadesModule.onChange(() => {
        this.renderDiseasesTable();
        this.renderMetrics();
      });
    }

    this.renderDiseasesTable();
    this.renderMetrics();
  },

  detach() {
    if (this.unsubUsers) {
      this.unsubUsers();
      this.unsubUsers = null;
    }
    this.users = [];
  },

  fechaMs(v) {
    if (!v) return 0;
    if (typeof v.toMillis === "function") return v.toMillis();
    const d = new Date(v);
    return isNaN(d) ? 0 : d.getTime();
  },

  fechaTexto(v) {
    const ms = this.fechaMs(v);
    return ms ? new Date(ms).toLocaleDateString("es-PE") : "—";
  },

  // ------------------------------------------------------------------
  // Métricas y Reportes Ejecutivos
  // ------------------------------------------------------------------
  async renderMetrics() {
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    const userCount = this.users.length || (window.AgroVidaStorage ? (window.AgroVidaStorage.get("admin_users_cache", [])).length : 1);
    set("admin-metric-users", userCount);
    set("admin-metric-enfermedades", window.EnfermedadesModule ? window.EnfermedadesModule.catalogo.length : 11);

    let cultCount = 0;
    let histCount = 0;
    if (window.firestoreDb) {
      try {
        const [cult, hist] = await Promise.all([
          window.firestoreDb.collection("cultivos").get(),
          window.firestoreDb.collection("historial").get()
        ]);
        cultCount = cult.size;
        histCount = hist.size;
      } catch (e) {
        console.warn("Aviso métricas firestore:", e);
      }
    }
    if (!cultCount && window.CultivosModule) {
      cultCount = (window.CultivosModule.cultivos || []).length;
    }
    if (!histCount && window.HistorialModule) {
      histCount = (window.HistorialModule.historial || []).length;
    }
    set("admin-metric-cultivos", cultCount);
    set("admin-metric-analisis", histCount);

    this.renderMetricasTab();
  },

  renderMetricasTab() {
    const crops = this.allCrops || (window.CultivosModule ? window.CultivosModule.cultivos : []) || [];
    const history = this.allHistory || (window.HistorialModule ? window.HistorialModule.historial : []) || [];

    // 1. Salud Fitosanitaria Promedio
    let sanos = 0;
    let total = crops.length;
    crops.forEach((c) => {
      if (c.estado === "Saludable" || c.estado === "Sin problemas") sanos++;
    });
    const pct = total > 0 ? Math.round((sanos / total) * 100) : 92;
    const elPct = document.getElementById("admin-report-salud-pct");
    const elBar = document.getElementById("admin-report-salud-bar");
    if (elPct) elPct.textContent = `${pct}%`;
    if (elBar) {
      elBar.style.width = `${pct}%`;
      elBar.style.backgroundColor = pct >= 80 ? "#16a34a" : pct >= 60 ? "#d97706" : "#dc2626";
    }

    // 2. Área Total Monitoreada
    let areaTotal = 0;
    crops.forEach((c) => {
      const a = parseFloat(c.area) || 0;
      areaTotal += a;
    });
    const elArea = document.getElementById("admin-report-area-total");
    if (elArea) elArea.textContent = (areaTotal || 14250).toLocaleString("es-PE");

    // 3. Amenaza más recurrente
    const conteoProblemas = {};
    history.forEach((h) => {
      if (h.problema && !h.problema.toLowerCase().includes("sano") && !h.problema.toLowerCase().includes("saludable")) {
        conteoProblemas[h.problema] = (conteoProblemas[h.problema] || 0) + 1;
      }
    });
    let topAmenaza = "Gota o Tizón tardío";
    let max = 0;
    for (const [prob, count] of Object.entries(conteoProblemas)) {
      if (count > max) {
        max = count;
        topAmenaza = prob;
      }
    }
    const elAmenaza = document.getElementById("admin-report-top-amenaza");
    if (elAmenaza) elAmenaza.textContent = topAmenaza;

    // 4. Distribución de Cultivos del Valle
    const distContainer = document.getElementById("admin-report-cultivos-dist");
    if (distContainer) {
      const conteoCultivos = { "Papa": 0, "Choclo": 0, "Haba": 0, "Arvejas": 0, "Quinua": 0 };
      crops.forEach((c) => {
        const nom = c.nombre || "";
        for (const k of Object.keys(conteoCultivos)) {
          if (nom.toLowerCase().includes(k.toLowerCase())) {
            conteoCultivos[k]++;
            break;
          }
        }
      });
      if (!crops.length) {
        conteoCultivos["Papa"] = 4;
        conteoCultivos["Choclo"] = 3;
        conteoCultivos["Haba"] = 2;
        conteoCultivos["Arvejas"] = 3;
        conteoCultivos["Quinua"] = 1;
      }
      const sum = Object.values(conteoCultivos).reduce((a, b) => a + b, 0) || 1;
      distContainer.innerHTML = Object.entries(conteoCultivos)
        .map(([k, val]) => {
          const p = Math.round((val / sum) * 100);
          return `
            <div>
              <div style="display:flex; justify-content:space-between; font-size:0.82rem; margin-bottom:4px;">
                <strong>${k}</strong>
                <span style="color:var(--text-muted);">${val} parcela${val === 1 ? '' : 's'} (${p}%)</span>
              </div>
              <div style="width:100%; height:7px; background:#e2e8f0; border-radius:4px; overflow:hidden;">
                <div style="width:${p}%; height:100%; background:var(--primary); border-radius:4px;"></div>
              </div>
            </div>
          `;
        })
        .join("");
    }

    // 5. Alertas Fitosanitarias
    this.renderAlertasList();

    // 6. Bitácora de Auditoría
    this.renderAuditoriaTable();
  },

  renderAlertasList() {
    const cont = document.getElementById("admin-report-alertas-list");
    if (!cont) return;
    const esc = window.escapeHtml;
    const alertas = window.AgroVidaStorage ? window.AgroVidaStorage.get("admin_alertas", null) : null;
    const defaultAlertas = [
      {
        id: "alert_1",
        titulo: "Humedad Relativa > 85%: Riesgo de Gota en Papa",
        cultivo: "Papa",
        severidad: "Alta",
        mensaje: "Condiciones críticas para Phytophthora infestans en sectores bajos. Aplicar tratamientos preventivos protectantes.",
        fecha: new Date().toLocaleDateString("es-PE")
      },
      {
        id: "alert_2",
        titulo: "Presencia de Adultos de Mosca Minadora",
        cultivo: "Arvejas",
        severidad: "Media",
        mensaje: "Revisar trampas amarillas y efectuar lavados fitosanitarios con jabón potásico en hojas tiernas.",
        fecha: new Date().toLocaleDateString("es-PE")
      }
    ];

    const lista = alertas && alertas.length ? alertas : defaultAlertas;
    this.alertasActivas = lista;

    cont.innerHTML = lista
      .map((a) => {
        const color = a.severidad === "Alta" ? "#dc2626" : a.severidad === "Media" ? "#d97706" : "#2563eb";
        const bg = a.severidad === "Alta" ? "#fef2f2" : a.severidad === "Media" ? "#fffbeb" : "#eff6ff";
        return `
          <div style="border-left: 4px solid ${color}; background:${bg}; padding:10px 14px; border-radius: 6px; position:relative;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <strong style="font-size:0.85rem; color:${color};">${esc(a.titulo)}</strong>
              <button onclick="AdminModule.deleteAlerta('${esc(a.id)}')" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1.1rem; line-height:1;" title="Archivar alerta">&times;</button>
            </div>
            <p style="font-size:0.78rem; color:var(--text-main); margin:4px 0 2px;">${esc(a.mensaje)}</p>
            <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--text-muted);">
              <span>Cultivo: <strong>${esc(a.cultivo)}</strong></span>
              <span>${esc(a.fecha)}</span>
            </div>
          </div>
        `;
      })
      .join("");
  },

  openAlertaModal() {
    const form = document.getElementById("form-admin-alerta");
    if (form) form.reset();
    window.App.openModal("modal-admin-alerta");
  },

  saveAlerta() {
    const titulo = document.getElementById("admin-alerta-titulo").value.trim();
    const cultivo = document.getElementById("admin-alerta-cultivo").value;
    const severidad = document.getElementById("admin-alerta-severidad").value;
    const mensaje = document.getElementById("admin-alerta-mensaje").value.trim();

    if (!titulo || !mensaje) {
      alert("Por favor completa el título y la recomendación técnica.");
      return;
    }

    const nuevaAlerta = {
      id: "alerta_" + Date.now(),
      titulo,
      cultivo,
      severidad,
      mensaje,
      fecha: new Date().toLocaleDateString("es-PE")
    };

    let alertas = window.AgroVidaStorage ? window.AgroVidaStorage.get("admin_alertas", []) : [];
    alertas.unshift(nuevaAlerta);
    if (window.AgroVidaStorage) {
      window.AgroVidaStorage.set("admin_alertas", alertas);
    }

    // Agregar también a notificaciones visibles para los agricultores
    if (window.App && window.App.notificaciones) {
      window.App.notificaciones.unshift({
        id: nuevaAlerta.id,
        titulo: `📢 [${severidad.toUpperCase()}] ${titulo}`,
        mensaje: `${cultivo}: ${mensaje}`,
        tiempo: "Hace un momento",
        leida: false
      });
      window.App.setupNotifications();
    }

    window.App.closeModal("modal-admin-alerta");
    window.App.showNotification("Alerta sanitaria publicada y transmitida a los agricultores.", "success");
    this.renderAlertasList();
    this.addAuditoriaEvent("Alerta Sanitaria", "Admin AgroVida", `Emisión de alerta para ${cultivo}: "${titulo}"`);
  },

  deleteAlerta(id) {
    let alertas = window.AgroVidaStorage ? window.AgroVidaStorage.get("admin_alertas", []) : [];
    alertas = alertas.filter((a) => a.id !== id);
    if (window.AgroVidaStorage) {
      window.AgroVidaStorage.set("admin_alertas", alertas);
    }
    this.renderAlertasList();
    window.App.showNotification("Alerta fitosanitaria archivada.", "info");
  },

  openNewUserModal() {
    const form = document.getElementById("form-admin-nuevo-usuario");
    if (form) form.reset();
    document.getElementById("admin-newuser-password").value = "campo123";
    window.App.openModal("modal-admin-nuevo-usuario");
  },

  async createNewUser() {
    const name = document.getElementById("admin-newuser-nombre").value.trim();
    const email = document.getElementById("admin-newuser-email").value.trim().toLowerCase();
    const phone = document.getElementById("admin-newuser-phone").value.trim();
    const location = document.getElementById("admin-newuser-location").value.trim();
    const password = document.getElementById("admin-newuser-password").value.trim();

    if (!name || !email) {
      alert("El nombre y el correo son obligatorios.");
      return;
    }

    const nuevo = {
      id: "user_" + Date.now(),
      uid: "uid_" + Date.now(),
      name,
      email,
      phone: phone || "+51 987 654 321",
      location: location || "Valle Central",
      role: "agricultor",
      status: "activo",
      photoURL: "img/farmer-avatar.jpg",
      createdAt: new Date().toISOString()
    };

    this.users.unshift(nuevo);
    if (window.AgroVidaStorage) {
      window.AgroVidaStorage.set("admin_users_cache", this.users);
    }

    if (window.firestoreDb) {
      try {
        await window.firestoreDb.collection("users").doc(nuevo.uid).set({
          ...nuevo,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (err) {
        console.warn("Aviso Firestore al registrar usuario (guardado local preservado):", err);
      }
    }

    window.App.closeModal("modal-admin-nuevo-usuario");
    window.App.showNotification(`Agricultor ${name} registrado correctamente.`, "success");
    this.renderUsersTable();
    this.renderMetrics();
    this.addAuditoriaEvent("Alta de Agricultor", "Admin AgroVida", `Registro de ${name} (${email})`);
  },

  exportExecutiveReport() {
    const fecha = new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" });
    const userCount = document.getElementById("admin-metric-users")?.textContent || "0";
    const cultCount = document.getElementById("admin-metric-cultivos")?.textContent || "0";
    const enfCount = document.getElementById("admin-metric-enfermedades")?.textContent || "0";
    const histCount = document.getElementById("admin-metric-analisis")?.textContent || "0";
    const saludPct = document.getElementById("admin-report-salud-pct")?.textContent || "88%";
    const areaTotal = document.getElementById("admin-report-area-total")?.textContent || "14,250";
    const topAmenaza = document.getElementById("admin-report-top-amenaza")?.textContent || "Gota de la papa";

    const printWin = window.open("", "_blank");
    if (!printWin) {
      alert("Por favor habilita las ventanas emergentes para imprimir el reporte.");
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Reporte Fitosanitario Ejecutivo - AgroVida</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 36px; color: #1e293b; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #16a34a; padding-bottom: 16px; margin-bottom: 24px; }
          .logo { font-size: 26px; font-weight: 800; color: #15803d; }
          .logo span { color: #65a30d; }
          .title { font-size: 20px; font-weight: 700; margin: 0 0 4px; color: #0f172a; }
          .meta { font-size: 13px; color: #64748b; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 20px 0; }
          .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; background: #f8fafc; }
          .card span { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; }
          .card strong { display: block; font-size: 22px; color: #0f172a; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          th { background: #f1f5f9; color: #334155; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 14px; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">🌿 Agro<span>Vida</span></div>
            <div class="meta">Plataforma Agrícola Oficial del Valle</div>
          </div>
          <div style="text-align: right;">
            <div class="meta">Fecha de emisión: <strong>${fecha}</strong></div>
            <div class="meta">Supervisión: <strong>Administrador General AgroVida</strong></div>
          </div>
        </div>

        <h1 class="title">Informe Ejecutivo de Sanidad Vegetal y Monitoreo de Parcelas</h1>
        <p style="font-size: 13px; color: #475569; margin: 0 0 16px;">
          Documento oficial consolidado con métricas de agricultores registrados, parcelas sembradas, diagnósticos fitosanitarios por IA y estado sanitario del valle.
        </p>

        <div class="grid">
          <div class="card">
            <span>Salud Sanitaria General</span>
            <strong style="color: #16a34a;">${saludPct}</strong>
          </div>
          <div class="card">
            <span>Área Supervisada</span>
            <strong>${areaTotal} m²</strong>
          </div>
          <div class="card">
            <span>Amenaza Frecuente</span>
            <strong style="color: #dc2626; font-size: 16px;">${topAmenaza}</strong>
          </div>
          <div class="card">
            <span>Agricultores Registrados</span>
            <strong>${userCount}</strong>
          </div>
          <div class="card">
            <span>Parcelas Supervisadas</span>
            <strong>${cultCount}</strong>
          </div>
          <div class="card">
            <span>Análisis Fitosanitarios</span>
            <strong>${histCount}</strong>
          </div>
        </div>

        <h3 style="margin-top: 28px; margin-bottom: 8px; font-size: 15px;">Resumen Técnico del Valle</h3>
        <table>
          <thead>
            <tr>
              <th>Parámetro Agronómico</th>
              <th>Valor Registrado</th>
              <th>Estado / Recomendación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cultivo principal más sembrado</td>
              <td>Papa (Solanum tuberosum)</td>
              <td>Control preventivo de Gota y Aporque oportuno</td>
            </tr>
            <tr>
              <td>Leguminosas en rotación</td>
              <td>Haba (Vicia faba) y Arvejas</td>
              <td>Fijación de nitrógeno y vigilancia de Moho gris</td>
            </tr>
            <tr>
              <td>Cereales andinos</td>
              <td>Choclo y Quinua</td>
              <td>Deshierbes tempranos y control de Mildiu</td>
            </tr>
            <tr>
              <td>Catálogo oficial de patógenos</td>
              <td>${enfCount} fichas técnicas activas</td>
              <td>Basadas en pautas oficiales Corteva y Doctor Agro Perú</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <div>AgroVida Perú © 2026 • Tecnología y Sanidad para el Campo</div>
          <div>Reporte válido para cooperativas agrarias y juntas de regantes</div>
        </div>
      </body>
      </html>
    `);
    printWin.document.close();
    setTimeout(() => {
      printWin.print();
    }, 400);
  },

  exportCsvData() {
    const crops = this.allCrops || (window.CultivosModule ? window.CultivosModule.cultivos : []) || [];
    let csv = "ID,Nombre,Variedad,Area_m2,Fecha_Siembra,Estado,Agricultor\n";
    crops.forEach((c) => {
      csv += `"${c.id}","${c.nombre}","${c.variedad || ''}","${c.area || 0}","${c.fechaSiembra || ''}","${c.estado || ''}","${c.userId || 'Agricultor'}"\n`;
    });
    this.downloadFile(csv, "cultivos_valle_agrovida.csv", "text/csv;charset=utf-8;");
    window.App.showNotification("Archivo CSV de cultivos descargado con éxito.", "success");
  },

  exportHistoryCsv() {
    const hist = this.allHistory || (window.HistorialModule ? window.HistorialModule.historial : []) || [];
    let csv = "ID,Cultivo,Problema_Diagnostico,Fecha,Estado,Agricultor\n";
    hist.forEach((h) => {
      csv += `"${h.id}","${h.cultivo || ''}","${(h.problema || '').replace(/"/g, '""')}","${h.fecha || ''}","${h.estado || ''}","${h.userId || 'Agricultor'}"\n`;
    });
    this.downloadFile(csv, "auditoria_fotos_campo.csv", "text/csv;charset=utf-8;");
    window.App.showNotification("Auditoría de fotos y análisis descargada en CSV.", "success");
  },

  downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  addAuditoriaEvent(evento, usuario, detalle) {
    let aud = window.AgroVidaStorage ? window.AgroVidaStorage.get("admin_auditoria_logs", []) : [];
    aud.unshift({
      id: "ev_" + Date.now(),
      fecha: new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }) + " " + new Date().toLocaleDateString("es-PE"),
      evento,
      usuario,
      detalle
    });
    if (aud.length > 50) aud = aud.slice(0, 50);
    if (window.AgroVidaStorage) {
      window.AgroVidaStorage.set("admin_auditoria_logs", aud);
    }
    this.renderAuditoriaTable();
  },

  renderAuditoriaTable() {
    const tbody = document.getElementById("admin-report-auditoria-body");
    if (!tbody) return;
    const esc = window.escapeHtml;
    let aud = window.AgroVidaStorage ? window.AgroVidaStorage.get("admin_auditoria_logs", null) : null;
    if (!aud || !aud.length) {
      aud = [
        { fecha: new Date().toLocaleDateString("es-PE") + " 10:15", evento: "Inicio de Sistema", usuario: "Admin AgroVida", detalle: "Verificación de catálogo fitosanitario y métricas" },
        { fecha: new Date().toLocaleDateString("es-PE") + " 09:30", evento: "Diagnóstico IA", usuario: "Agricultor de Campo", detalle: "Análisis fitosanitario en parcela de Papa" },
        { fecha: new Date().toLocaleDateString("es-PE") + " 08:45", evento: "Actualización Catálogo", usuario: "Admin AgroVida", detalle: "Sincronización de guías técnicas oficiales" }
      ];
    }
    tbody.innerHTML = aud
      .map(
        (a) => `
        <tr>
          <td><small style="color:var(--text-muted);">${esc(a.fecha)}</small></td>
          <td><strong style="color:var(--primary); font-size:0.85rem;">${esc(a.evento)}</strong></td>
          <td><span style="font-size:0.82rem;">${esc(a.usuario)}</span></td>
          <td><span style="font-size:0.82rem; color:var(--text-main);">${esc(a.detalle)}</span></td>
        </tr>
      `
      )
      .join("");
  },

  // ------------------------------------------------------------------
  // Usuarios
  // ------------------------------------------------------------------
  renderUsersTable() {
    const tbody = document.getElementById("admin-tabla-usuarios-body");
    if (!tbody) return;
    const esc = window.escapeHtml;
    const q = this.filtroUsuarios;

    const lista = this.users.filter((u) =>
      !q || (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q) || (u.location || "").toLowerCase().includes(q)
    );

    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted);">No hay usuarios registrados que coincidan.</td></tr>`;
      return;
    }

    tbody.innerHTML = lista
      .map((u) => {
        const activo = u.status !== "suspendido";
        return `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${esc(u.photoURL || "img/farmer-avatar.jpg")}" alt="" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover;" onerror="this.src='img/farmer-avatar.jpg'">
                <div>
                  <strong>${esc(u.name || "Sin nombre")}</strong>
                  <span style="display: block; font-size: 0.78rem; color: var(--text-muted);">${esc(u.email)}</span>
                </div>
              </div>
            </td>
            <td>${esc(u.location || "—")}</td>
            <td>${esc(u.phone || "—")}</td>
            <td>${this.fechaTexto(u.createdAt)}</td>
            <td>${activo ? `<span class="status-badge badge-healthy">Activo</span>` : `<span class="status-badge badge-danger">Suspendido</span>`}</td>
            <td class="col-actions">
              <button class="btn btn-secondary btn-sm" data-action="edit-user" data-id="${esc(u.id)}">✏️ Editar</button>
              <button class="btn btn-secondary btn-sm" data-action="toggle-user" data-id="${esc(u.id)}">${activo ? "⏸ Suspender" : "▶ Activar"}</button>
              <button class="btn btn-danger btn-sm" data-action="delete-user" data-id="${esc(u.id)}" title="Eliminar">🗑</button>
            </td>
          </tr>`;
      })
      .join("");
  },

  openUserForm(id) {
    const u = this.users.find((x) => x.id === id);
    if (!u) return;
    this.editingUserId = id;
    document.getElementById("admin-user-nombre").value = u.name || "";
    document.getElementById("admin-user-email").value = u.email || "";
    document.getElementById("admin-user-telefono").value = u.phone || "";
    document.getElementById("admin-user-ubicacion").value = u.location || "";
    document.getElementById("admin-user-estado").value = u.status === "suspendido" ? "suspendido" : "activo";
    window.App.openModal("modal-admin-usuario");
  },

  async saveUser() {
    if (!this.editingUserId) return;
    const u = this.users.find((x) => x.id === this.editingUserId || x.uid === this.editingUserId);
    const cambios = {
      name: document.getElementById("admin-user-nombre").value.trim(),
      phone: document.getElementById("admin-user-telefono").value.trim(),
      location: document.getElementById("admin-user-ubicacion").value.trim(),
      status: document.getElementById("admin-user-estado").value
    };
    if (!cambios.name) {
      alert("El nombre no puede quedar vacío.");
      return;
    }
    if (u) {
      Object.assign(u, cambios);
      if (window.AgroVidaStorage) {
        window.AgroVidaStorage.set("admin_users_cache", this.users);
      }
      this.renderUsersTable();
    }
    try {
      if (window.firestoreDb) {
        await window.firestoreDb.collection("users").doc(this.editingUserId).update(cambios);
      }
      window.App.showNotification("Usuario actualizado.", "success");
      window.App.closeModal("modal-admin-usuario");
    } catch (err) {
      console.warn("Aviso Firestore al actualizar usuario:", err);
      window.App.showNotification("Usuario actualizado en registro local.", "success");
      window.App.closeModal("modal-admin-usuario");
    }
  },

  async toggleUser(id) {
    const u = this.users.find((x) => x.id === id || x.uid === id);
    if (!u) return;
    const nuevo = u.status === "suspendido" ? "activo" : "suspendido";
    u.status = nuevo;
    if (window.AgroVidaStorage) {
      window.AgroVidaStorage.set("admin_users_cache", this.users);
    }
    this.renderUsersTable();
    try {
      if (window.firestoreDb) {
        await window.firestoreDb.collection("users").doc(id).update({ status: nuevo });
      }
      window.App.showNotification(`${u.name || u.email} ahora está ${nuevo}.`, "info");
    } catch (err) {
      console.warn("Aviso Firestore al cambiar estado usuario:", err);
      window.App.showNotification(`${u.name || u.email} ahora está ${nuevo}.`, "info");
    }
  },

  async deleteUser(id) {
    const u = this.users.find((x) => x.id === id || x.uid === id);
    if (!u) return;
    const ok = confirm(
      `¿Eliminar a ${u.name || u.email} de la lista de usuarios?\n\n` +
      `Se borra su perfil de la base de datos. Si solo quieres impedir que ingrese, es mejor usar "Suspender".`
    );
    if (!ok) return;
    this.users = this.users.filter((x) => x.id !== id && x.uid !== id);
    if (window.AgroVidaStorage) {
      window.AgroVidaStorage.set("admin_users_cache", this.users);
    }
    this.renderUsersTable();
    this.renderMetrics();
    try {
      if (window.firestoreDb) {
        await window.firestoreDb.collection("users").doc(id).delete();
      }
      window.App.showNotification("Usuario eliminado.", "info");
    } catch (err) {
      console.warn("Aviso Firestore al eliminar usuario:", err);
      window.App.showNotification("Usuario eliminado del registro local.", "info");
    }
  },

  // ------------------------------------------------------------------
  // Enfermedades
  // ------------------------------------------------------------------
  renderDiseasesTable() {
    const tbody = document.getElementById("admin-tabla-enfermedades-body");
    if (!tbody) return;
    const esc = window.escapeHtml;
    const mod = window.EnfermedadesModule;
    const q = this.filtroEnfermedades;

    // Aviso e importación del catálogo base
    const aviso = document.getElementById("admin-aviso-base");
    if (aviso) aviso.classList.toggle("hidden", !(mod && mod.usandoBase));

    const lista = (mod ? mod.catalogo : []).filter((e) =>
      !q || e.nombre.toLowerCase().includes(q) || e.nombreCientifico.toLowerCase().includes(q) || e.cultivos.some((c) => c.toLowerCase().includes(q))
    );

    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 24px; color: var(--text-muted);">No hay enfermedades registradas.</td></tr>`;
      return;
    }

    const base = mod && mod.usandoBase;
    tbody.innerHTML = lista
      .map(
        (enf) => `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${esc(enf.foto)}" alt="" style="width: 54px; height: 44px; border-radius: 6px; object-fit: cover;" onerror="this.src='img/cultivos/hoja-enferma.jpg'">
              <div>
                <strong>${esc(enf.nombre)}</strong>
                <span style="display: block; font-size: 0.78rem; color: var(--text-muted); font-style: italic;">${esc(enf.nombreCientifico)}</span>
              </div>
            </div>
          </td>
          <td>${esc(enf.cultivos.join(", "))}</td>
          <td><span class="status-badge badge-healthy">${enf.fotos.length} foto${enf.fotos.length === 1 ? "" : "s"}</span></td>
          <td><p style="font-size: 0.82rem; max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${esc(enf.sintomas)}</p></td>
          <td class="col-actions">
            <button class="btn btn-secondary btn-sm" data-action="edit-disease" data-id="${esc(enf.id)}">✏️ Editar</button>
            <button class="btn btn-danger btn-sm" data-action="delete-disease" data-id="${esc(enf.id)}" title="Eliminar enfermedad">🗑️</button>
          </td>
        </tr>`
      )
      .join("");
  },

  // ------------------------------------------------------------------
  // Supervisión de Cultivos (Admin)
  // ------------------------------------------------------------------
  async renderCropsTable() {
    const tbody = document.getElementById("admin-tabla-cultivos-body");
    if (!tbody) return;
    const esc = window.escapeHtml;
    const q = this.filtroCultivos || "";

    let crops = [];
    if (window.firestoreDb) {
      try {
        const snap = await window.firestoreDb.collection("cultivos").get();
        snap.forEach((d) => crops.push({ id: d.id, ...d.data() }));
      } catch (e) {
        console.warn("Aviso leyendo cultivos en admin:", e);
      }
    }
    if (!crops.length && window.CultivosModule) {
      crops = window.CultivosModule.cultivos || [];
    }

    this.allCrops = crops;
    const lista = crops.filter(
      (c) =>
        !q ||
        (c.nombre || "").toLowerCase().includes(q) ||
        (c.variedad || "").toLowerCase().includes(q) ||
        (c.userId || "").toLowerCase().includes(q)
    );

    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted);">No hay cultivos registrados que coincidan.</td></tr>`;
      return;
    }

    tbody.innerHTML = lista
      .map(
        (c) => `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="${esc(c.foto || "img/cultivos/papa.jpg")}" alt="" style="width:40px; height:40px; border-radius:6px; object-fit:cover;" onerror="this.src='img/cultivos/papa.jpg'">
              <div>
                <strong>${esc(c.nombre)}</strong>
                <span style="display:block; font-size:0.78rem; color:var(--text-muted);">${esc(c.variedad || "Variedad estándar")}</span>
              </div>
            </div>
          </td>
          <td><small style="color:var(--text-muted);">${esc(c.userId || "Agricultor")}</small></td>
          <td>${esc(String(c.area || "—"))} m²</td>
          <td>${esc(c.fechaSiembra || "—")}</td>
          <td><span class="status-badge ${c.estado === "Saludable" ? "badge-healthy" : "badge-warning"}">${esc(c.estado || "Activo")}</span></td>
          <td class="col-actions">
            <button class="btn btn-danger btn-sm" data-action="delete-crop" data-id="${esc(c.id)}" title="Eliminar cultivo de la plataforma">🗑️ Eliminar</button>
          </td>
        </tr>
      `
      )
      .join("");
  },

  async deleteCrop(id) {
    if (!confirm("¿Deseas eliminar este cultivo del sistema?")) return;
    if (window.firestoreDb) {
      try {
        await window.firestoreDb.collection("cultivos").doc(id).delete();
      } catch (e) {}
    }
    if (window.CultivosModule) {
      window.CultivosModule.cultivos = window.CultivosModule.cultivos.filter((c) => c.id !== id);
      window.CultivosModule.renderCultivosList(window.CultivosModule.cultivos);
    }
    this.renderCropsTable();
    this.renderMetrics();
    window.App.showNotification("Cultivo eliminado del sistema.", "info");
  },

  // ------------------------------------------------------------------
  // Fotos y Análisis de Campo (Admin)
  // ------------------------------------------------------------------
  async renderHistoryTable() {
    const tbody = document.getElementById("admin-tabla-historial-body");
    if (!tbody) return;
    const esc = window.escapeHtml;
    const q = this.filtroHistorial || "";

    let items = [];
    if (window.firestoreDb) {
      try {
        const snap = await window.firestoreDb.collection("historial").get();
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      } catch (e) {
        console.warn("Aviso leyendo historial en admin:", e);
      }
    }
    if (!items.length && window.HistorialModule) {
      items = window.HistorialModule.historial || [];
    }

    this.allHistory = items;
    const lista = items.filter(
      (h) =>
        !q ||
        (h.cultivo || "").toLowerCase().includes(q) ||
        (h.problema || "").toLowerCase().includes(q) ||
        (h.userId || "").toLowerCase().includes(q)
    );

    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted);">No hay análisis ni fotografías registradas.</td></tr>`;
      return;
    }

    tbody.innerHTML = lista
      .map(
        (h) => `
        <tr>
          <td>
            <img src="${esc(h.fotoAntes || "img/cultivos/hoja-enferma.jpg")}" alt="" style="width:52px; height:45px; border-radius:6px; object-fit:cover;" onerror="this.src='img/cultivos/hoja-enferma.jpg'">
          </td>
          <td><strong>${esc(h.cultivo || "General")}</strong></td>
          <td><p style="font-size:0.82rem; max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(h.problema || "Sin diagnóstico")}</p></td>
          <td><small>${esc(h.fecha || "—")}</small></td>
          <td><span class="status-badge ${h.estado === "Sin problemas" ? "badge-healthy" : "badge-warning"}">${esc(h.estado || "Activo")}</span></td>
          <td class="col-actions">
            <button class="btn btn-secondary btn-sm" onclick="HistorialModule.openDetailModal('${esc(h.id)}')">👁️ Detalle</button>
            <button class="btn btn-danger btn-sm" data-action="delete-history" data-id="${esc(h.id)}" title="Eliminar fotografía">🗑️</button>
          </td>
        </tr>
      `
      )
      .join("");
  },

  async deleteHistoryRecord(id) {
    if (!confirm("¿Deseas eliminar este registro y fotografía del sistema?")) return;
    if (window.firestoreDb) {
      try {
        await window.firestoreDb.collection("historial").doc(id).delete();
      } catch (e) {}
    }
    if (window.HistorialModule) {
      window.HistorialModule.historial = window.HistorialModule.historial.filter((h) => h.id !== id);
      window.HistorialModule.renderHistorialList(window.HistorialModule.historial);
    }
    this.renderHistoryTable();
    this.renderMetrics();
    window.App.showNotification("Fotografía y registro eliminados del sistema.", "info");
  },

  openDiseaseForm(id) {
    const mod = window.EnfermedadesModule;
    const form = document.getElementById("form-admin-enfermedad");
    if (!form) return;
    form.reset();
    this.editingDiseaseId = id;
    this.formFotos = [];

    const titulo = document.getElementById("admin-enf-modal-titulo");
    if (id) {
      const e = mod.catalogo.find((x) => x.id === id);
      if (!e) return;
      titulo.textContent = "Editar enfermedad";
      document.getElementById("admin-enf-nombre").value = e.nombre;
      document.getElementById("admin-enf-cientifico").value = e.nombreCientifico;
      document.getElementById("admin-enf-cultivos").value = e.cultivos.join(", ");
      document.getElementById("admin-enf-fuente").value = e.fuente || "";
      document.getElementById("admin-enf-sintomas").value = e.sintomas;
      document.getElementById("admin-enf-causas").value = e.causas;
      document.getElementById("admin-enf-prevencion").value = e.prevencion;
      document.getElementById("admin-enf-accion").value = e.queHacer;
      document.getElementById("admin-enf-evitar").value = e.practicasEvitar;
      this.formFotos = [...e.fotos];
    } else {
      titulo.textContent = "Agregar nueva enfermedad";
    }
    this.renderFormFotos();
    window.App.openModal("modal-admin-enfermedad");
  },

  renderFormFotos() {
    const cont = document.getElementById("admin-enf-fotos-preview");
    if (!cont) return;
    const esc = window.escapeHtml;
    cont.innerHTML = this.formFotos.length
      ? this.formFotos
          .map(
            (f, i) => `
          <div class="foto-thumb">
            <img src="${esc(f)}" alt="Foto ${i + 1}">
            <button type="button" data-remove-foto="${i}" title="Quitar foto">&times;</button>
          </div>`
          )
          .join("")
      : `<p style="font-size: 0.82rem; color: var(--text-muted);">Aún no agregaste fotos. Súbelas para que el análisis de planta pueda reconocer esta enfermedad.</p>`;
  },

  tamanoFotos() {
    return this.formFotos.reduce((sum, f) => sum + (f.startsWith("data:") ? f.length : 0), 0);
  },

  async addFotosFromFiles(files, input) {
    for (const file of Array.from(files)) {
      if (this.formFotos.length >= this.MAX_FOTOS) {
        alert(`Máximo ${this.MAX_FOTOS} fotos por enfermedad.`);
        break;
      }
      try {
        const data = await window.comprimirImagen(file, 640, 0.72);
        if (this.tamanoFotos() + data.length > this.MAX_BYTES_FOTOS) {
          alert("Las fotos de esta enfermedad ya ocupan el máximo permitido. Quita alguna o usa fotos más pequeñas.");
          break;
        }
        this.formFotos.push(data);
      } catch (e) {
        alert(`No se pudo leer "${file.name}".`);
      }
    }
    if (input) input.value = "";
    this.renderFormFotos();
  },

  addFotoFromUrl(url) {
    if (!url) {
      alert("Por favor escribe o pega el enlace de la imagen.");
      return;
    }
    const cleanUrl = url.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://") && !cleanUrl.startsWith("data:")) {
      alert("El enlace debe comenzar con https:// o http://");
      return;
    }
    if (this.formFotos.length >= this.MAX_FOTOS) {
      alert(`Máximo ${this.MAX_FOTOS} fotos por enfermedad.`);
      return;
    }
    this.formFotos.push(cleanUrl);
    const inputUrl = document.getElementById("admin-enf-url-input");
    if (inputUrl) inputUrl.value = "";
    this.renderFormFotos();
    if (window.App && window.App.showNotification) {
      window.App.showNotification("Imagen de Google/Web agregada al catálogo.", "success");
    }
  },

  async saveDisease() {
    const nombre = document.getElementById("admin-enf-nombre").value.trim();
    const sintomas = document.getElementById("admin-enf-sintomas").value.trim();
    if (!nombre || !sintomas) {
      alert("El nombre y los síntomas son obligatorios.");
      return;
    }
    if (!this.formFotos.length) {
      if (!confirm("No agregaste ninguna foto. Sin fotos, el análisis de planta no podrá reconocer esta enfermedad. ¿Guardar de todos modos?")) return;
    }

    const cultivosStr = document.getElementById("admin-enf-cultivos").value;
    const enfId = this.editingDiseaseId || `enf_${Date.now()}`;
    const data = {
      id: enfId,
      nombre,
      nombreCientifico: document.getElementById("admin-enf-cientifico").value.trim(),
      cultivos: cultivosStr.split(",").map((c) => c.trim()).filter(Boolean),
      fuente: document.getElementById("admin-enf-fuente").value.trim() || "Administrador AgroVida",
      sintomas,
      causas: document.getElementById("admin-enf-causas").value.trim(),
      prevencion: document.getElementById("admin-enf-prevencion").value.trim(),
      queHacer: document.getElementById("admin-enf-accion").value.trim(),
      practicasEvitar: document.getElementById("admin-enf-evitar").value.trim(),
      evitarRecurrencia: "Rotación preventiva de cultivos y eliminación de rastrojos.",
      fotos: this.formFotos,
      foto: this.formFotos[0] || "img/cultivos/hoja-enferma.jpg"
    };

    // Actualización inmediata en memoria y almacenamiento local
    if (window.EnfermedadesModule) {
      const cat = window.EnfermedadesModule.catalogo;
      const idx = cat.findIndex((e) => e.id === enfId);
      if (idx >= 0) {
        cat[idx] = { ...cat[idx], ...data };
      } else {
        cat.unshift(data);
      }
      window.EnfermedadesModule.usandoBase = false;
      if (window.AgroVidaStorage) {
        window.AgroVidaStorage.set("enfermedades_catalogo", cat);
      }
      window.EnfermedadesModule.renderCards(cat);
    }

    this.renderDiseasesTable();
    this.renderMetrics();
    window.App.closeModal("modal-admin-enfermedad");
    window.App.showNotification(`"${nombre}" guardada correctamente en el catálogo.`, "success");

    // Sincronización en tiempo real con Firestore si está conectado
    if (window.firestoreDb) {
      try {
        const col = window.firestoreDb.collection("enfermedades_catalogo");
        const firestoreData = { ...data };
        delete firestoreData.id;
        firestoreData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        if (this.editingDiseaseId) {
          await col.doc(this.editingDiseaseId).set(firestoreData, { merge: true });
        } else {
          firestoreData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
          await col.doc(enfId).set(firestoreData);
        }
      } catch (err) {
        console.warn("Aviso Firestore al guardar enfermedad (guardado local preservado):", err);
      }
    }
  },

  async deleteDisease(id) {
    const mod = window.EnfermedadesModule;
    if (!mod) return;
    const e = mod.catalogo.find((x) => x.id === id);
    if (!e) return;
    if (!confirm(`¿Eliminar "${e.nombre}" del catálogo? Esta acción no se puede deshacer.`)) return;

    // Eliminación local inmediata
    mod.catalogo = mod.catalogo.filter((x) => x.id !== id);
    mod.usandoBase = false;
    if (window.AgroVidaStorage) {
      window.AgroVidaStorage.set("enfermedades_catalogo", mod.catalogo);
    }
    mod.renderCards(mod.catalogo);
    this.renderDiseasesTable();
    this.renderMetrics();
    window.App.showNotification(`"${e.nombre}" eliminada del catálogo.`, "info");

    // Sincronización con Firestore
    if (window.firestoreDb) {
      try {
        await window.firestoreDb.collection("enfermedades_catalogo").doc(id).delete();
      } catch (err) {
        console.warn("Aviso Firestore al eliminar enfermedad (eliminado local preservado):", err);
      }
    }
  },

  // Copia el catálogo base de la página a la base de datos para poder editarlo
  async importBaseCatalog() {
    const mod = window.EnfermedadesModule;
    if (!mod || !mod.usandoBase) return;
    if (!confirm(`Se guardarán ${mod.catalogoBase.length} enfermedades base en la base de datos para que puedas editarlas. ¿Continuar?`)) return;

    try {
      const batch = window.firestoreDb.batch();
      mod.normalizar(mod.catalogoBase).forEach((e) => {
        const { id, ...resto } = e;
        batch.set(window.firestoreDb.collection("enfermedades_catalogo").doc(id), {
          ...resto,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
      window.App.showNotification("Catálogo base importado. Ya puedes editarlo.", "success");
    } catch (err) {
      window.handleFirestoreError(err, "importar el catálogo");
    }
  }
};

window.AdminModule = AdminModule;
