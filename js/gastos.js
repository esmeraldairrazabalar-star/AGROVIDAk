/**
 * AgroVida - Módulo de Control de Gastos, Cosechas y Ventas
 * Gestiona el balance económico agrícola, cosechas obtenidas, gráficos y métricas de rentabilidad.
 */

const GastosModule = {
  finanzas: [],
  currentTab: "gastos", // "gastos" o "cosechas"

  // Datos iniciales de demostración acordes al mockup
  defaultFinanzas: [
    {
      id: "fin_001",
      userId: "demo_agricultor_juan",
      tipo: "gasto",
      concepto: "Semillas de Papa Canchan certificadas",
      categoria: "Semillas",
      monto: 50.0,
      fecha: "2025-10-28",
      cultivo: "Papa",
      cantidadKg: 0
    },
    {
      id: "fin_002",
      userId: "demo_agricultor_juan",
      tipo: "gasto",
      concepto: "Fertilizante orgánico Guano de las Islas",
      categoria: "Fertilizantes",
      monto: 60.0,
      fecha: "2025-09-15",
      cultivo: "Maíz",
      cantidadKg: 0
    },
    {
      id: "fin_003",
      userId: "demo_agricultor_juan",
      tipo: "gasto",
      concepto: "Jornales de mano de obra para aporque",
      categoria: "Mano de obra",
      monto: 40.0,
      fecha: "2025-09-02",
      cultivo: "Choclo",
      cantidadKg: 0
    },
    {
      id: "fin_004",
      userId: "demo_agricultor_juan",
      tipo: "cosecha",
      concepto: "Primera cosecha de Choclo tierno",
      categoria: "Cosecha",
      monto: 0,
      fecha: "2025-10-15",
      cultivo: "Choclo",
      cantidadKg: 120.0
    },
    {
      id: "fin_005",
      userId: "demo_agricultor_juan",
      tipo: "venta",
      concepto: "Venta directa de 120 kg de Choclo a mercado local",
      categoria: "Ventas",
      monto: 480.0,
      fecha: "2025-10-18",
      cultivo: "Choclo",
      cantidadKg: 120.0
    }
  ],

  init() {
    this.setupListeners();
    this.loadFinanzas();
  },

  setupListeners() {
    // Cambio entre tabs (Gastos / Cosechas / Ventas)
    document.querySelectorAll(".tab-finanza-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".tab-finanza-btn").forEach((b) => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.currentTab = e.currentTarget.getAttribute("data-tab");
        this.updateFormFieldsForTab(this.currentTab);
      });
    });

    // Formulario de registro financiero
    const form = document.getElementById("form-registro-finanzas");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAddRecord();
      });
    }
  },

  updateFormFieldsForTab(tab) {
    const labelMonto = document.getElementById("label-finanza-monto");
    const containerKg = document.getElementById("container-finanza-kg");
    const btnSubmit = document.getElementById("btn-submit-finanza");
    const selectConcepto = document.getElementById("finanza-concepto-select");

    if (tab === "gastos") {
      if (labelMonto) labelMonto.textContent = "Monto del gasto (S/.):";
      if (containerKg) containerKg.classList.add("hidden");
      if (btnSubmit) btnSubmit.textContent = "+ Agregar gasto";
      if (selectConcepto) {
        selectConcepto.innerHTML = `
          <option value="Semillas">Semillas e insumos de siembra</option>
          <option value="Fertilizantes">Fertilizantes y abonos (Guano, Compost)</option>
          <option value="Mano de obra">Mano de obra y jornales de campo</option>
          <option value="Riego">Riego y mantenimiento de canales</option>
          <option value="Herramientas">Herramientas agrícolas y repuestos</option>
          <option value="Flete">Transporte y flete de carga</option>
          <option value="Otros">Otros gastos del cultivo</option>
        `;
      }
    } else if (tab === "cosechas") {
      if (labelMonto) labelMonto.textContent = "Costo asociado opcional (S/.):";
      if (containerKg) containerKg.classList.remove("hidden");
      if (btnSubmit) btnSubmit.textContent = "+ Registrar cosecha";
      if (selectConcepto) {
        selectConcepto.innerHTML = `
          <option value="Cosecha principal">Cosecha principal del lote</option>
          <option value="Segunda cosecha">Segunda cosecha / rebusca</option>
          <option value="Muestra">Muestra y calibración de peso</option>
        `;
      }
    } else if (tab === "ventas") {
      if (labelMonto) labelMonto.textContent = "Ingreso por venta (S/.):";
      if (containerKg) containerKg.classList.remove("hidden");
      if (btnSubmit) btnSubmit.textContent = "+ Registrar venta";
      if (selectConcepto) {
        selectConcepto.innerHTML = `
          <option value="Venta mayorista">Venta mayorista a acopiador</option>
          <option value="Venta en feria">Venta directa en feria comunitaria</option>
          <option value="Venta local">Venta a comercio / tienda local</option>
        `;
      }
    }
  },

  async loadFinanzas() {
    const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
    const userId = user ? user.uid : "demo_agricultor_juan";

    if (window.isFirebaseConfigured() && window.firestoreDb && user && !user.isDemo) {
      try {
        const snapshot = await window.firestoreDb
          .collection("finanzas")
          .where("userId", "==", userId)
          .orderBy("fecha", "desc")
          .get();

        this.finanzas = [];
        snapshot.forEach((doc) => {
          this.finanzas.push({ id: doc.id, ...doc.data() });
        });
      } catch (err) {
        console.error("Error al cargar finanzas de Firestore:", err);
        this.finanzas = window.AgroVidaStorage.get(`finanzas_${userId}`, this.defaultFinanzas);
      }
    } else {
      this.finanzas = window.AgroVidaStorage.get(`finanzas_${userId}`, this.defaultFinanzas);
    }

    this.calculateTotalsAndRender();
  },

  async handleAddRecord() {
    const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
    const userId = user ? user.uid : "demo_agricultor_juan";

    const categoria = document.getElementById("finanza-concepto-select").value;
    const monto = parseFloat(document.getElementById("finanza-monto").value) || 0;
    const fecha = document.getElementById("finanza-fecha").value;
    const cultivo = document.getElementById("finanza-cultivo-select").value;
    const kg = parseFloat(document.getElementById("finanza-kg")?.value) || 0;

    if (!fecha) {
      alert("Por favor selecciona una fecha.");
      return;
    }

    const newRecord = {
      userId: userId,
      tipo: this.currentTab === "cosechas" ? "cosecha" : this.currentTab === "ventas" ? "venta" : "gasto",
      concepto: `${categoria} (${cultivo})`,
      categoria: categoria,
      monto: monto,
      cantidadKg: kg,
      fecha: fecha,
      cultivo: cultivo,
      createdAt: new Date().toISOString()
    };

    try {
      if (window.isFirebaseConfigured() && window.firestoreDb && user && !user.isDemo) {
        const docRef = await window.firestoreDb.collection("finanzas").add(newRecord);
        newRecord.id = docRef.id;
      } else {
        newRecord.id = `fin_${Date.now()}`;
        this.finanzas.unshift(newRecord);
        window.AgroVidaStorage.set(`finanzas_${userId}`, this.finanzas);
      }

      window.App.showNotification("Registro económico añadido exitosamente.", "success");
      document.getElementById("form-registro-finanzas").reset();
      this.calculateTotalsAndRender();
    } catch (err) {
      console.error("Error guardando registro financiero:", err);
      alert("Error al guardar el registro.");
    }
  },

  async deleteRecord(id) {
    if (!confirm("¿Deseas eliminar este registro económico?")) return;

    const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
    const userId = user ? user.uid : "demo_agricultor_juan";

    try {
      if (window.isFirebaseConfigured() && window.firestoreDb && user && !user.isDemo) {
        await window.firestoreDb.collection("finanzas").doc(id).delete();
      } else {
        this.finanzas = this.finanzas.filter((f) => f.id !== id);
        window.AgroVidaStorage.set(`finanzas_${userId}`, this.finanzas);
      }

      window.App.showNotification("Registro eliminado.", "info");
      this.calculateTotalsAndRender();
    } catch (err) {
      console.error("Error al eliminar registro:", err);
    }
  },

  calculateTotalsAndRender() {
    let totalGastos = 0;
    let totalCosechasKg = 0;
    let totalIngresos = 0;

    this.finanzas.forEach((r) => {
      if (r.tipo === "gasto") {
        totalGastos += r.monto || 0;
      } else if (r.tipo === "cosecha") {
        totalCosechasKg += r.cantidadKg || 0;
      } else if (r.tipo === "venta") {
        totalIngresos += r.monto || 0;
        if (r.cantidadKg && !this.finanzas.some((f) => f.tipo === "cosecha")) {
          totalCosechasKg += r.cantidadKg;
        }
      }
    });

    const ganancia = totalIngresos - totalGastos;

    // Actualizar tarjetas de métricas
    const elemGastos = document.getElementById("finanzas-total-gastos");
    const elemCosechas = document.getElementById("finanzas-total-cosechas");
    const elemIngresos = document.getElementById("finanzas-total-ingresos");
    const elemGanancia = document.getElementById("finanzas-total-ganancia");

    if (elemGastos) elemGastos.textContent = `S/ ${totalGastos.toFixed(2)}`;
    if (elemCosechas) elemCosechas.textContent = `${totalCosechasKg.toFixed(0)} kg`;
    if (elemIngresos) elemIngresos.textContent = `S/ ${totalIngresos.toFixed(2)}`;
    if (elemGanancia) {
      elemGanancia.textContent = `S/ ${ganancia.toFixed(2)}`;
      elemGanancia.className = `metric-value ${ganancia >= 0 ? "text-positive" : "text-negative"}`;
    }

    // Actualizar datos en pantalla Perfil
    const perfilCosecha = document.getElementById("perfil-cosecha-total");
    if (perfilCosecha) {
      perfilCosecha.textContent = `${totalCosechasKg.toFixed(0)} kg`;
    }

    this.renderTransactionsTable();
    this.renderChart();
  },

  renderTransactionsTable() {
    const tbody = document.getElementById("tabla-finanzas-body");
    if (!tbody) return;

    if (this.finanzas.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="5" class="empty-table-cell">No hay transacciones registradas.</td></tr>
      `;
      return;
    }

    tbody.innerHTML = this.finanzas
      .map((f) => {
        const isGasto = f.tipo === "gasto";
        const isVenta = f.tipo === "venta";
        const tipoBadge = isGasto
          ? `<span class="status-badge badge-danger">Gasto</span>`
          : isVenta
          ? `<span class="status-badge badge-healthy">Venta</span>`
          : `<span class="status-badge badge-warning">Cosecha</span>`;

        const partes = f.fecha ? f.fecha.split("-") : ["2025", "10", "28"];
        const fechaFormateada = partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : f.fecha;

        return `
          <tr>
            <td>${fechaFormateada}</td>
            <td>${tipoBadge}</td>
            <td><strong>${f.concepto}</strong></td>
            <td>${f.tipo === "cosecha" ? `${f.cantidadKg} kg` : `S/ ${f.monto.toFixed(2)}`}</td>
            <td class="col-actions">
              <button class="btn-icon btn-delete" title="Eliminar" onclick="GastosModule.deleteRecord('${f.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

  // Renderizar gráfico de barras "Resumen anual" (Gastos vs Ingresos) con SVG responsive
  renderChart() {
    const chartContainer = document.getElementById("finanzas-bar-chart");
    if (!chartContainer) return;

    // Meses de muestra comparativos
    const dataMeses = [
      { mes: "Ene", gastos: 80, ingresos: 0 },
      { mes: "Feb", gastos: 140, ingresos: 120 },
      { mes: "Mar", gastos: 60, ingresos: 180 },
      { mes: "Abr", gastos: 110, ingresos: 210 },
      { mes: "May", gastos: 90, ingresos: 240 },
      { mes: "Jun", gastos: 130, ingresos: 310 }
    ];

    const maxVal = 350;
    const height = 140;

    const barsHtml = dataMeses
      .map((d) => {
        const hGasto = Math.round((d.gastos / maxVal) * height);
        const hIngreso = Math.round((d.ingresos / maxVal) * height);

        return `
          <div class="chart-month-col">
            <div class="chart-bars-group">
              <div class="bar bar-gasto" style="height: ${hGasto}px" title="Gastos ${d.mes}: S/ ${d.gastos}"></div>
              <div class="bar bar-ingreso" style="height: ${hIngreso}px" title="Ingresos ${d.mes}: S/ ${d.ingresos}"></div>
            </div>
            <span class="chart-label">${d.mes}</span>
          </div>
        `;
      })
      .join("");

    chartContainer.innerHTML = `
      <div class="chart-legend">
        <span class="legend-item"><span class="legend-color legend-gasto"></span> Gastos</span>
        <span class="legend-item"><span class="legend-color legend-ingreso"></span> Ingresos</span>
      </div>
      <div class="chart-bars-wrapper">
        ${barsHtml}
      </div>
    `;
  }
};

window.GastosModule = GastosModule;
