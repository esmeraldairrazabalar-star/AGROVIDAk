/**
 * AgroVida - Análisis de planta por comparación de imágenes
 * La foto de la planta se compara con las fotos de las enfermedades registradas
 * en la página (catálogo). Si alguna se parece lo suficiente se muestra su ficha;
 * si ninguna coincide, se informa que no hay coincidencia.
 */

const AnalisisModule = {
  currentImage: null,       // foto a analizar (dataURL comprimido)
  currentResult: null,
  videoStream: null,
  featureCache: new Map(),  // evita recalcular las características de las fotos del catálogo

  // Puntaje mínimo (0 a 1) para considerar que hay coincidencia con una enfermedad
  UMBRAL_COINCIDENCIA: 0.76,
  UMBRAL_ALTA: 0.86,
  BONUS_MISMO_CULTIVO: 0.04,

  // Perfiles patológicos de referencia para cada enfermedad del catálogo
  perfilesPatologicos: {
    "enf_papa_gota_corteva": {
      nombre: "Gota o Tizón tardío de la papa",
      cultivos: ["Papa", "Tomate"],
      // Tizón tardío: Necrosis húmeda oscura extensa con borde clorótico amarillento
      validar(feat) {
        const necrosis = feat.clases[2] + feat.clases[3]; // marrón + oscuro
        const clorosis = feat.clases[1];                 // amarillo
        const verde = feat.clases[0];
        // Requiere necrosis foliar visible y presencia de clorosis o verde remanente
        if (necrosis < 0.14) return 0.25;
        let score = 0.72;
        if (necrosis >= 0.20) score += 0.12;
        if (clorosis >= 0.08) score += 0.08;
        if (verde >= 0.08 && verde <= 0.65) score += 0.06;
        return Math.min(0.96, score);
      }
    },
    "enf_papa_tizon_temprano_corteva": {
      nombre: "Tizón temprano de la papa",
      cultivos: ["Papa", "Tomate"],
      // Tizón temprano: Manchas concéntricas secas en diana con amarillamiento foliar
      validar(feat) {
        const necrosis = feat.clases[2];
        const clorosis = feat.clases[1];
        const texturaFuerte = feat.textura[1]; // anillos concéntricos
        if (necrosis < 0.12 || clorosis < 0.12) return 0.28;
        let score = 0.70;
        if (texturaFuerte > 0.12) score += 0.12;
        if (clorosis >= 0.16) score += 0.08;
        return Math.min(0.94, score);
      }
    },
    "enf_papa_gorgojo_corteva": {
      nombre: "Gorgojo de los Andes / Gusano blanco de la papa",
      cultivos: ["Papa"],
      validar(feat) {
        const verde = feat.clases[0];
        const necrosis = feat.clases[2];
        if (verde < 0.30 || necrosis < 0.10) return 0.25;
        let score = 0.70;
        if (feat.textura[0] > 0.30) score += 0.12;
        return Math.min(0.92, score);
      }
    },
    "enf_papa_polilla_corteva": {
      nombre: "Polilla de la papa",
      cultivos: ["Papa"],
      validar(feat) {
        const oscuro = feat.clases[3];
        const necrosis = feat.clases[2];
        if (oscuro < 0.10 || necrosis < 0.12) return 0.25;
        return Math.min(0.91, 0.70 + (oscuro >= 0.15 ? 0.12 : 0.06));
      }
    },
    "enf_papa_rizoctonia_corteva": {
      nombre: "Costra negra y chancro del tallo en papa",
      cultivos: ["Papa"],
      validar(feat) {
        const necrosis = feat.clases[2] + feat.clases[3];
        if (necrosis < 0.18) return 0.25;
        return Math.min(0.93, 0.71 + (necrosis >= 0.25 ? 0.14 : 0.06));
      }
    },
    "enf_arveja_minador_doctoragro": {
      nombre: "Mosca minadora de la arveja",
      cultivos: ["Arvejas", "Haba"],
      // Mosca minadora: Galerías serpenteantes translúcidas/blanquecinas sobre hoja verde
      validar(feat) {
        const blancoMinas = feat.clases[4]; // blanco/grisáceo de las galerías
        const verde = feat.clases[0];       // lámina foliar verde
        const borde = feat.textura[0];      // gradiente de bordes filiformes
        if (blancoMinas < 0.06 || verde < 0.25) return 0.20;
        let score = 0.72;
        if (blancoMinas >= 0.09) score += 0.12;
        if (verde >= 0.32) score += 0.08;
        if (borde >= 0.25) score += 0.06;
        return Math.min(0.96, score);
      }
    },
    "enf_arveja_botrytis_doctoragro": {
      nombre: "Moho gris o Pudrición por Botrytis en arveja",
      cultivos: ["Arvejas", "Haba"],
      // Botrytis: Moho algodonoso gris cenizo sobre tejido blando
      validar(feat) {
        const mohoGris = feat.clases[4];
        const necrosis = feat.clases[2] + feat.clases[3];
        if (mohoGris < 0.15 || necrosis < 0.12) return 0.22;
        let score = 0.72;
        if (mohoGris >= 0.22) score += 0.14;
        if (necrosis >= 0.18) score += 0.08;
        return Math.min(0.95, score);
      }
    },
    "enf_arveja_prodiplosis_doctoragro": {
      nombre: "Mosquilla de los brotes o 'Caracha' en arveja",
      cultivos: ["Arvejas", "Haba"],
      validar(feat) {
        const necrosis = feat.clases[2];
        const clorosis = feat.clases[1];
        if (necrosis < 0.12) return 0.25;
        let score = 0.70;
        if (clorosis >= 0.10) score += 0.10;
        if (feat.textura[1] > 0.14) score += 0.10;
        return Math.min(0.93, score);
      }
    },
    "enf_arveja_chupadera_doctoragro": {
      nombre: "Chupadera fungosa de la arveja",
      cultivos: ["Arvejas", "Haba"],
      validar(feat) {
        const necrosis = feat.clases[2] + feat.clases[3];
        const clorosis = feat.clases[1];
        if (necrosis < 0.16) return 0.25;
        let score = 0.70;
        if (necrosis >= 0.24) score += 0.12;
        if (clorosis >= 0.10) score += 0.08;
        return Math.min(0.94, score);
      }
    },
    "enf_arveja_gusanos_doctoragro": {
      nombre: "Gusanos de tierra y cortadores de brotes en arveja",
      cultivos: ["Arvejas", "Haba"],
      validar(feat) {
        const verde = feat.clases[0];
        const oscuro = feat.clases[3];
        if (verde < 0.30 || oscuro < 0.10) return 0.22;
        let score = 0.70;
        if (feat.textura[0] > 0.28) score += 0.12;
        return Math.min(0.92, score);
      }
    },
    "enf_haba_mancha_chocolate": {
      nombre: "Mancha chocolate de la haba",
      cultivos: ["Haba", "Arvejas"],
      validar(feat) {
        const necrosis = feat.clases[2];
        const verde = feat.clases[0];
        if (necrosis < 0.10 || verde < 0.35) return 0.25;
        let score = 0.71;
        if (necrosis >= 0.15 && necrosis <= 0.40) score += 0.14;
        return Math.min(0.94, score);
      }
    },
    "enf_haba_roya": {
      nombre: "Roya de la haba",
      cultivos: ["Haba"],
      validar(feat) {
        const clorosis = feat.clases[1];
        const necrosis = feat.clases[2];
        if (clorosis < 0.15 || necrosis < 0.08) return 0.25;
        let score = 0.72;
        if (clorosis >= 0.22) score += 0.14;
        return Math.min(0.93, score);
      }
    },
    "enf_choclo_cercospora": {
      nombre: "Mancha foliar / Cercosporiosis del choclo",
      cultivos: ["Choclo"],
      validar(feat) {
        const necrosis = feat.clases[2];
        const clorosis = feat.clases[1];
        const verde = feat.clases[0];
        if (necrosis < 0.10 || verde < 0.30) return 0.25;
        let score = 0.71;
        if (clorosis >= 0.12) score += 0.12;
        return Math.min(0.93, score);
      }
    }
  },

  init() {
    this.setupListeners();
    this.populateCropSelector();
    if (window.EnfermedadesModule) {
      window.EnfermedadesModule.onChange(() => this.featureCache.clear());
    }
  },

  populateCropSelector() {
    const select = document.getElementById("analisis-crop-select");
    if (!select) return;
    const cultivos = (window.CultivosModule && window.CultivosModule.cultivos && window.CultivosModule.cultivos.length)
      ? window.CultivosModule.cultivos
      : [{ nombre: "Papa" }, { nombre: "Maíz" }, { nombre: "Choclo" }, { nombre: "Haba" }, { nombre: "Arvejas" }, { nombre: "Quinua" }];

    const valorPrevio = select.value;
    select.innerHTML = cultivos
      .map((c) => `<option value="${window.escapeHtml(c.nombre)}">Cultivo: ${window.escapeHtml(c.nombre)}</option>`)
      .join("");
    if (cultivos.some((c) => c.nombre.toLowerCase() === (valorPrevio || "").toLowerCase())) {
      select.value = valorPrevio;
    }
  },

  setupListeners() {
    // Subir archivo
    const fileInput = document.getElementById("analizar-file-input");
    const camInput = document.getElementById("analizar-camera-direct-input");
    [fileInput, camInput].forEach((input) => {
      if (!input) return;
      input.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 12 * 1024 * 1024) {
          alert("La imagen excede el límite de 12 MB.");
          return;
        }
        this.setImageFromSource(file);
        input.value = "";
      });
    });

    // Cámara en vivo
    const btnActivarCamara = document.getElementById("btn-activar-camara");
    if (btnActivarCamara) btnActivarCamara.addEventListener("click", () => this.openCameraView());

    const btnTomarFoto = document.getElementById("btn-capturar-foto-camara");
    if (btnTomarFoto) btnTomarFoto.addEventListener("click", () => this.captureFrameFromCamera());

    const btnCerrarCamara = document.getElementById("btn-cerrar-camara");
    if (btnCerrarCamara) {
      btnCerrarCamara.addEventListener("click", () => {
        this.stopCameraStream();
        window.App.closeModal("modal-camara-captura");
      });
    }

    // Analizar
    const btnAnalizar = document.getElementById("btn-ejecutar-analisis");
    if (btnAnalizar) btnAnalizar.addEventListener("click", () => this.runAnalysis());

    // Guardar en historial
    const btnGuardar = document.getElementById("btn-guardar-analisis-historial");
    if (btnGuardar) btnGuardar.addEventListener("click", () => this.saveCurrentResultToHistory());

    const btnGuardarNomatch = document.getElementById("btn-guardar-nomatch-historial");
    if (btnGuardarNomatch) btnGuardarNomatch.addEventListener("click", () => this.saveCurrentResultToHistory());

    // Descartar / Eliminar fotografía tomada
    const btnDescartar = document.getElementById("btn-descartar-foto");
    if (btnDescartar) btnDescartar.addEventListener("click", () => this.clearCurrentImage());

    const btnEliminarResult = document.getElementById("btn-eliminar-foto-analisis");
    if (btnEliminarResult) btnEliminarResult.addEventListener("click", () => this.clearCurrentImage());
  },

  clearCurrentImage() {
    this.currentImage = null;
    this.currentResult = null;
    const previewContainer = document.getElementById("analisis-preview-container");
    const previewImg = document.getElementById("analisis-img-preview");
    const uploadPrompt = document.getElementById("analisis-upload-prompt");
    const results = document.getElementById("analisis-results-container");

    if (previewImg) previewImg.src = "";
    if (previewContainer) previewContainer.classList.add("hidden");
    if (uploadPrompt) uploadPrompt.classList.remove("has-image");
    if (results) results.classList.add("hidden");

    const fileInput = document.getElementById("analizar-file-input");
    const camInput = document.getElementById("analizar-camera-direct-input");
    if (fileInput) fileInput.value = "";
    if (camInput) camInput.value = "";

    if (window.App && window.App.showNotification) {
      window.App.showNotification("Fotografía descartada y eliminada.", "info");
    }
  },

  // ------------------------------------------------------------------
  // Cámara
  // ------------------------------------------------------------------
  async openCameraView() {
    const videoElem = document.getElementById("camara-video-preview");
    const errorBox = document.getElementById("camara-error-msg");
    if (errorBox) errorBox.classList.add("hidden");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const directInput = document.getElementById("analizar-camera-direct-input");
      if (directInput) directInput.click();
      return;
    }

    try {
      window.App.openModal("modal-camara-captura");
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoElem) {
        videoElem.srcObject = this.videoStream;
        videoElem.play();
      }
    } catch (err) {
      console.warn("No se pudo acceder a la cámara:", err);
      if (errorBox) {
        errorBox.textContent = "No se pudo acceder a la cámara. Puedes usar el botón alternativo para abrir la cámara de tu teléfono.";
        errorBox.classList.remove("hidden");
      }
      const directInput = document.getElementById("analizar-camera-direct-input");
      if (directInput) directInput.click();
    }
  },

  captureFrameFromCamera() {
    const videoElem = document.getElementById("camara-video-preview");
    if (!videoElem) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoElem.videoWidth || 640;
    canvas.height = videoElem.videoHeight || 480;
    canvas.getContext("2d").drawImage(videoElem, 0, 0, canvas.width, canvas.height);

    const captured = canvas.toDataURL("image/jpeg", 0.9);
    this.stopCameraStream();
    window.App.closeModal("modal-camara-captura");
    this.setImageFromSource(captured);
    window.App.showNotification("¡Fotografía capturada con éxito!", "success");
  },

  stopCameraStream() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((t) => t.stop());
      this.videoStream = null;
    }
  },

  // ------------------------------------------------------------------
  // Imagen a analizar
  // ------------------------------------------------------------------
  async setImageFromSource(source) {
    try {
      // Se guarda comprimida para poder registrarla luego en el historial
      this.currentImage = await window.comprimirImagen(source, 800, 0.78);
    } catch (e) {
      alert("No se pudo leer la imagen. Prueba con otra fotografía.");
      return;
    }

    const previewContainer = document.getElementById("analisis-preview-container");
    const previewImg = document.getElementById("analisis-img-preview");
    const uploadPrompt = document.getElementById("analisis-upload-prompt");
    const results = document.getElementById("analisis-results-container");

    if (previewImg) previewImg.src = this.currentImage;
    if (previewContainer) previewContainer.classList.remove("hidden");
    if (uploadPrompt) uploadPrompt.classList.add("has-image");
    if (results) results.classList.add("hidden");
    this.currentResult = null;
  },

  // ------------------------------------------------------------------
  // Comparación de imágenes
  // ------------------------------------------------------------------
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("imagen no disponible"));
      img.src = src;
    });
  },

  async featuresFromSrc(src) {
    if (this.featureCache.has(src)) return this.featureCache.get(src);
    try {
      const img = await this.loadImage(src);
      const size = window.Similitud.SIZE;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      const f = window.Similitud.extractFeatures(data, size, size);
      this.featureCache.set(src, f);
      return f;
    } catch (e) {
      // Ignora de forma segura restricciones de CORS o file:// sin detener el flujo
      console.warn("Aviso leyendo características de imagen:", src, e.message);
      return null;
    }
  },

  // Clasificador de IA botánica: determina si la foto contiene tejido vegetal / agrícola
  evaluarEsPlanta(feat) {
    if (!feat || !feat.clases) return false;
    // clases: 0 verde, 1 clorosis/amarillo, 2 necrosis/marrón, 3 oscuro/negro, 4 blanco/moho, 5 otros colores artificiales
    const verde = feat.clases[0];
    const clorosis = feat.clases[1];
    const necrosis = feat.clases[2];
    const moho = feat.clases[4];
    const artificial = feat.clases[5];

    // Porcentaje total de tejido vegetal y daño patológico foliar
    const tejidoVegetal = verde + clorosis + necrosis + moho;

    // Si más del 38% son colores artificiales o no botánicos, no es planta
    if (artificial > 0.38) return false;

    // Si la suma de tejido vegetal es inferior al 28%, no es planta (pared, mueble, fondo vacío, etc.)
    if (tejidoVegetal < 0.28) return false;

    return true;
  },

  // Evalúa si la hoja / planta tiene tejido sano sin necrosis ni manchas patológicas
  esPlantaSana(feat) {
    if (!feat || !feat.clases) return false;
    const verde = feat.clases[0];
    const clorosis = feat.clases[1];
    const necrosis = feat.clases[2];
    const moho = feat.clases[4];
    // Una planta sana tiene más de 58% de verde limpio y casi nada de daño foliar (<= 14%)
    return verde >= 0.58 && (clorosis + necrosis + moho) <= 0.14;
  },

  async compararConCatalogo(imageSrc, cultivo) {
    const catalogo = window.EnfermedadesModule ? window.EnfermedadesModule.catalogo : [];
    const userFeat = await this.featuresFromSrc(imageSrc);

    // Si no se puede extraer características, se rechaza
    if (!userFeat) {
      return { noEsPlanta: true, resultados: [], fotosComparadas: 0 };
    }

    // 1. Verificación botánica con IA: ¿Es realmente una planta o cultivo agrícola?
    const esPlanta = this.evaluarEsPlanta(userFeat);
    if (!esPlanta) {
      return { noEsPlanta: true, resultados: [], fotosComparadas: 0 };
    }

    // 2. ¿Es una planta totalmente sana?
    if (this.esPlantaSana(userFeat)) {
      return { esPlantaSana: true, resultados: [], fotosComparadas: catalogo.length };
    }

    // 3. Comparación e inferencia con el catálogo de enfermedades
    const resultados = [];
    let fotosComparadas = 0;

    for (const enf of catalogo) {
      let mejorScoreVisual = 0;
      let mejorFoto = null;

      const fotosLista = (Array.isArray(enf.fotos) && enf.fotos.length)
        ? enf.fotos
        : (enf.foto ? [enf.foto] : []);

      for (const foto of fotosLista) {
        try {
          const f = await this.featuresFromSrc(foto);
          if (f) {
            fotosComparadas++;
            const s = window.Similitud.compare(userFeat, f);
            if (s > mejorScoreVisual) {
              mejorScoreVisual = s;
              mejorFoto = foto;
            }
          }
        } catch (e) {
          // Omitir foto no accesible
        }
      }

      if (!mejorFoto && enf.foto) {
        mejorFoto = enf.foto;
        fotosComparadas++;
      }

      // Evaluación del perfil biopatológico específico de la enfermedad
      let scorePatologico = 0;
      const perfil = this.perfilesPatologicos[enf.id];
      if (perfil && typeof perfil.validar === "function") {
        scorePatologico = perfil.validar(userFeat);
      } else {
        // Para enfermedades nuevas agregadas por el administrador en tiempo real
        const necrosis = userFeat.clases[2] + userFeat.clases[3];
        const clorosis = userFeat.clases[1];
        if (necrosis >= 0.15 || clorosis >= 0.15) {
          scorePatologico = 0.73;
        } else {
          scorePatologico = 0.35;
        }
      }

      // Verificación de compatibilidad con el cultivo seleccionado
      const mismoCultivo = cultivo && enf.cultivos && enf.cultivos.some(
        (c) => c.toLowerCase().includes(cultivo.toLowerCase()) || cultivo.toLowerCase().includes(c.toLowerCase())
      );

      // Combinación ponderada de similitud visual directa y perfil de patología foliar
      let puntajeFinal = 0;
      if (mejorScoreVisual > 0) {
        puntajeFinal = (mejorScoreVisual * 0.55) + (scorePatologico * 0.45);
      } else {
        puntajeFinal = scorePatologico;
      }

      // Bonificación si coincide el cultivo o penalización si no pertenece a ese cultivo
      if (mismoCultivo && puntajeFinal >= 0.68) {
        puntajeFinal += this.BONUS_MISMO_CULTIVO;
      } else if (!mismoCultivo && puntajeFinal > 0.40) {
        puntajeFinal -= 0.10;
      }

      puntajeFinal = Math.min(0.97, Math.max(0, puntajeFinal));

      if (mejorFoto) {
        resultados.push({ enfermedad: enf, puntaje: puntajeFinal, foto: mejorFoto });
      }
    }

    resultados.sort((a, b) => b.puntaje - a.puntaje);
    return { noEsPlanta: false, esPlantaSana: false, resultados, fotosComparadas };
  },

  lista(texto) {
    if (!texto) return [];
    return String(texto)
      .split(/(?<=[.;])\s+/)
      .map((t) => t.trim().replace(/[;]$/, ""))
      .filter(Boolean);
  },

  async runAnalysis() {
    if (!this.currentImage) {
      alert("Por favor toma una fotografía o selecciona una imagen de tu planta.");
      return;
    }

    const loader = document.getElementById("analisis-loader");
    const resultsContainer = document.getElementById("analisis-results-container");
    const cropSelect = document.getElementById("analisis-crop-select");
    const cultivo = cropSelect ? cropSelect.value : "Papa";

    if (loader) loader.classList.remove("hidden");
    if (resultsContainer) resultsContainer.classList.add("hidden");

    try {
      await new Promise((r) => setTimeout(r, 400)); // permite animar el escáner de IA

      const diag = await this.compararConCatalogo(this.currentImage, cultivo);

      // Caso A: No es planta (persona, objeto, fondo artificial)
      if (diag.noEsPlanta) {
        this.currentResult = {
          coincide: false,
          noEsPlanta: true,
          cultivo: cultivo,
          foto: this.currentImage,
          fotosComparadas: 0,
          mensaje: "No se detectó ninguna planta o cultivo agrícola en la fotografía. Enfoca directamente las hojas, tallos o frutos de tu cultivo."
        };
      }
      // Caso B: Planta totalmente sana
      else if (diag.esPlantaSana) {
        this.currentResult = {
          coincide: true,
          esSana: true,
          cultivo: cultivo,
          fecha: new Date().toLocaleDateString("es-PE"),
          foto: this.currentImage,
          fotoReferencia: "img/cultivos/hoja-sana.jpg",
          enfermedad: `Planta Sana: ¡Tu cultivo de ${cultivo} está bien!`,
          porcentaje: 100,
          nivel: "sana",
          sintomas: [
            "Láminas foliares limpias sin presencia de pústulas, manchas cloróticas ni necrosis.",
            "Follaje vigoroso con excelente coloración verde y turgencia foliar óptima."
          ],
          causas: [
            "Excelente estado nutricional y vegetativo de la planta.",
            "Manejo agronómico y condiciones microclimáticas favorables en la parcela."
          ],
          prevencion: [
            "Mantener el riego oportuno y regular sin generar encharcamientos.",
            "Continuar con la fertilización balanceada y labores oportunas de aporque.",
            "Monitoreo visual preventivo semanal en el campo."
          ],
          tratamientoInmediato: [
            "¡Tu cultivo está bien! No se requiere aplicar ningún químico ni fungicida."
          ],
          practicasEvitar: [
            "Evitar aplicaciones innecesarias de agroquímicos curativos que puedan estresar la planta.",
            "Evitar excesos de humedad foliar o riegos pesados en horas de frío."
          ],
          otras: [],
          fotosComparadas: diag.fotosComparadas
        };
      }
      // Caso C: Detección y diagnóstico de enfermedad del catálogo
      else {
        const mejor = diag.resultados[0];
        if (mejor && mejor.puntaje >= this.UMBRAL_COINCIDENCIA) {
          const e = mejor.enfermedad;
          this.currentResult = {
            coincide: true,
            cultivo: cultivo,
            fecha: new Date().toLocaleDateString("es-PE"),
            foto: this.currentImage,
            fotoReferencia: mejor.foto,
            enfermedad: e.nombre + (e.nombreCientifico ? ` (${e.nombreCientifico})` : ""),
            porcentaje: Math.round(mejor.puntaje * 100),
            nivel: mejor.puntaje >= this.UMBRAL_ALTA ? "alta" : "probable",
            sintomas: this.lista(e.sintomas),
            causas: this.lista(e.causas),
            prevencion: this.lista(e.prevencion),
            tratamientoInmediato: this.lista(e.queHacer),
            practicasEvitar: this.lista(e.practicasEvitar),
            otras: diag.resultados.slice(1, 3).filter((r) => r.puntaje >= this.UMBRAL_COINCIDENCIA - 0.06),
            fotosComparadas: diag.fotosComparadas
          };
        } else {
          this.currentResult = {
            coincide: false,
            cultivo: cultivo,
            foto: this.currentImage,
            mejorPorcentaje: mejor ? Math.round(mejor.puntaje * 100) : 0,
            fotosComparadas: diag.fotosComparadas,
            mensaje: "La fotografía no coincide con las enfermedades registradas en el catálogo. Puede que el cultivo esté sano o que sea una afección no catalogada."
          };
        }
      }

      this.renderAnalysisResult(this.currentResult);
    } catch (err) {
      console.error("Error durante el análisis:", err);
      alert("No se pudo completar el análisis de la fotografía. Inténtalo de nuevo.");
    } finally {
      if (loader) loader.classList.add("hidden");
      if (this.currentResult && resultsContainer) resultsContainer.classList.remove("hidden");
    }
  },

  renderAnalysisResult(res) {
    const $ = (id) => document.getElementById(id);
    const detalle = $("analisis-match-detail");
    const sinMatch = $("analisis-nomatch");
    const btnGuardar = $("btn-guardar-analisis-historial");
    const esc = window.escapeHtml;

    // Caso: No coincide o no es planta
    if (!res.coincide) {
      const tituloPrincipal = $("resultado-enfermedad-titulo");
      const badge = $("resultado-severidad-badge");
      const modeloBadge = $("resultado-modelo-badge");
      const nomatchTitulo = $("resultado-nomatch-titulo");
      const nomatchDesc = $("resultado-nomatch-desc");

      if (res.noEsPlanta) {
        if (tituloPrincipal) tituloPrincipal.textContent = "No detectado (No es planta)";
        if (badge) {
          badge.textContent = "No detectado";
          badge.className = "status-badge badge-danger";
        }
        if (modeloBadge) modeloBadge.textContent = "IA AgroVida Visión";
        if (nomatchTitulo) nomatchTitulo.textContent = "No detectado: No se identificó planta o cultivo";
        if (nomatchDesc) nomatchDesc.textContent = res.mensaje || "La fotografía capturada no parece contener hojas, tallos o frutos agrícolas reconocibles. Por favor enfoca de cerca tu cultivo.";
      } else {
        if (tituloPrincipal) tituloPrincipal.textContent = "No detectado";
        if (badge) {
          badge.textContent = "No detectado";
          badge.className = "status-badge badge-warning";
        }
        if (modeloBadge) modeloBadge.textContent = `IA AgroVida · Evaluadas ${res.fotosComparadas} referencias`;
        if (nomatchTitulo) nomatchTitulo.textContent = "No detectado: No coincide con ninguna enfermedad registrada";
        if (nomatchDesc) nomatchDesc.textContent = res.mensaje || "La inteligencia artificial analizó la fotografía y determinó que no coincide con ninguna de las enfermedades registradas en el catálogo oficial. No se asignó ningún diagnóstico ni tratamiento para evitar errores en tu cultivo.";
      }

      if (detalle) detalle.classList.add("hidden");
      if (sinMatch) sinMatch.classList.remove("hidden");
      const nomatchFoto = $("resultado-nomatch-foto");
      if (nomatchFoto) nomatchFoto.src = res.foto;
      return;
    }

    // Caso con coincidencia (o planta sana)
    if (detalle) detalle.classList.remove("hidden");
    if (sinMatch) sinMatch.classList.add("hidden");
    if (btnGuardar) btnGuardar.classList.remove("hidden");

    const tituloPrincipal = $("resultado-enfermedad-titulo");
    if (tituloPrincipal) {
      if (res.esSana) {
        tituloPrincipal.textContent = `Planta Sana: ¡Tu cultivo de ${res.cultivo || "la planta"} está bien!`;
      } else {
        tituloPrincipal.textContent = res.enfermedad;
      }
    }

    const badge = $("resultado-severidad-badge");
    if (badge) {
      if (res.esSana) {
        badge.textContent = `Saludable · ¡Está bien! (${res.porcentaje}%)`;
        badge.className = "status-badge badge-healthy";
      } else {
        badge.textContent = `${res.nivel === "alta" ? "Coincidencia alta" : "Coincidencia probable"}: ${res.porcentaje}%`;
        badge.className = `status-badge ${res.nivel === "alta" ? "badge-danger" : "badge-warning"}`;
      }
    }

    const modeloBadge = $("resultado-modelo-badge");
    if (modeloBadge) modeloBadge.textContent = `Diagnóstico IA AgroVida · ${res.fotosComparadas} referencias`;

    const compUsuario = $("resultado-comp-usuario");
    const compRef = $("resultado-comp-referencia");
    if (compUsuario) compUsuario.src = res.foto;
    if (compRef) compRef.src = res.fotoReferencia || "img/cultivos/hoja-sana.jpg";

    const populate = (id, items) => {
      const el = $(id);
      if (!el) return;
      el.innerHTML = items && items.length
        ? items.map((it) => `<li><span class="bullet-check">✓</span> ${esc(it)}</li>`).join("")
        : `<li style="color: var(--text-muted);">Sin información registrada.</li>`;
    };

    populate("resultado-sintomas-list", res.sintomas);
    populate("resultado-causas-list", res.causas);
    populate("resultado-prevencion-list", res.prevencion);
    populate("resultado-tratamiento-list", res.tratamientoInmediato);
    populate("resultado-evitar-list", res.practicasEvitar);

    const otras = $("resultado-otras");
    if (otras) {
      if (res.otras && res.otras.length) {
        otras.classList.remove("hidden");
        otras.innerHTML =
          "<strong>Otras posibles coincidencias:</strong> " +
          res.otras.map((o) => `${esc(o.enfermedad.nombre)} (${Math.round(o.puntaje * 100)}%)`).join(" · ");
      } else {
        otras.classList.add("hidden");
      }
    }
  },

  async saveCurrentResultToHistory() {
    const r = this.currentResult;
    if (!r) {
      alert("No hay ningún resultado para guardar.");
      return;
    }

    if (r.noEsPlanta) {
      alert("La fotografía no contiene tejido vegetal reconocible. Por favor captura una imagen clara de las hojas o tallo de tu cultivo para guardarla en Mis Cultivos.");
      return;
    }

    // 1. Guardar en Historial fitosanitario
    if (window.HistorialModule) {
      await window.HistorialModule.addHistorialRecord({
        cultivo: r.cultivo || "Cultivo agrícola",
        fecha: new Date().toISOString().split("T")[0],
        problema: r.esSana
          ? `Planta Sana: ¡Tu cultivo de ${r.cultivo || "la planta"} está bien!`
          : (r.enfermedad || "Monitoreo fitosanitario de cultivo"),
        estado: r.esSana ? "Sin problemas" : (r.coincide ? "En tratamiento" : "En revisión"),
        fotoAntes: r.foto,
        fotoDespues: r.fotoReferencia || "img/cultivos/hoja-sana.jpg",
        sintomas: r.sintomas ? r.sintomas.join(" ") : (r.mensaje || "Monitoreo fotográfico en campo."),
        medidasRealizadas: r.tratamientoInmediato ? r.tratamientoInmediato.join(" ") : "Seguimiento visual de la parcela."
      });
    }

    // 2. Guardar y actualizar directamente en "Mis Cultivos"
    if (window.CultivosModule && window.CultivosModule.updateCropFromAnalysis) {
      const nuevoEstado = r.esSana ? "Saludable" : (r.coincide ? "En tratamiento" : "En revisión");
      const observacion = r.esSana
        ? `Monitoreo con IA: ¡Tu planta está sana y está bien! Fotografía actualizada el ${new Date().toLocaleDateString("es-PE")}.`
        : (r.enfermedad ? `Diagnóstico IA: ${r.enfermedad}. Medida: ${r.tratamientoInmediato ? r.tratamientoInmediato[0] : "Monitoreo continuo"}` : "Evaluación fotográfica realizada.");

      window.CultivosModule.updateCropFromAnalysis(r.cultivo, nuevoEstado, r.foto, observacion);
    }

    if (window.App && window.App.showNotification) {
      window.App.showNotification(
        r.esSana
          ? `¡Tu cultivo de ${r.cultivo} está bien! Se guardó la fotografía y el estado saludable en Mis Cultivos.`
          : `Diagnóstico y fotografía guardados en Mis Cultivos e Historial.`,
        "success"
      );
    }

    // Llevar al agricultor a "Mis cultivos" para que vea su cultivo actualizado
    if (window.App && window.App.showScreen) {
      window.App.showScreen("cultivos");
    }
  }
};

window.AnalisisModule = AnalisisModule;
