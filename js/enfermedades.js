/**
 * AgroVida - Módulo de Enfermedades y Plagas Agrícolas
 * El catálogo se lee en tiempo real desde la colección "enfermedades_catalogo".
 * Mientras esa colección esté vacía se muestra el catálogo base incluido en la página.
 * Datos base: Corteva Agriscience (Papa) y Doctor Agro Perú (Arvejas / Leguminosas).
 */

const EnfermedadesModule = {
  // Catálogo base que viene con la página (el administrador puede importarlo a la base de datos)
  catalogoBase: [
    // =========================================================================
    // CULTIVO DE PAPA - INFORMACIÓN OFICIAL CORTEVA AGRISCIENCE
    // =========================================================================
    {
      id: "enf_papa_gota_corteva",
      nombre: "Gota o Tizón tardío de la papa",
      nombreCientifico: "Phytophthora infestans",
      cultivos: ["Papa", "Tomate"],
      foto: "img/cultivos/hoja-enferma.jpg",
      fuente: "Corteva Agriscience Colombia",
      sintomas: "Manchas necróticas acuosas irregulares en los márgenes y ápices de las hojas, de color verde oscuro a marrón y negro. En condiciones de alta humedad aparece una vellosidad blanca en el envés (esporangios). En tallos causa lesiones anilladas que quiebran la planta. En los tubérculos genera una pudrición seca de color castaño-rojizo bajo la piel.",
      causas: "Oomiceto altamente destructivo favorecido por humedad relativa superior al 85%, neblinas frecuentes y temperaturas frescas de 12°C a 20°C. Las esporas se dispersan rápidamente por viento y salpicaduras de lluvia.",
      prevencion: "Monitoreo preventivo continuo. Utilizar tubérculo-semilla certificado libre de patógenos. Respetar distancias entre surcos de 80 a 90 cm para ventilación. Realizar aporque alto para cubrir los tubérculos y evitar que las esporas lavadas penetren.",
      queHacer: "Manejo según programa fitosanitario Corteva: Aplicaciones preventivas y curativas con fungicidas especializados de alta eficacia como Zorvec® Encantia® (acción sistémica prolongada), Curzate® M-8, Equation® Pro y protectores multisitio como Dithane™ M-45 WP NT o Cobrethane™.",
      practicasEvitar: "No regar por aspersión al final de la tarde o en la noche. No abandonar rastrojos ni plantas voluntarias ('huachas') infectadas en el campo. Evitar el exceso de fertilización nitrogenada que hace el tejido foliar más tierno y susceptible.",
      evitarRecurrencia: "Rotación de cultivos por mínimo 3 campañas sin solanáceas y desinfección preventiva del terreno."
    },
    {
      id: "enf_papa_tizon_temprano_corteva",
      nombre: "Tizón temprano de la papa",
      nombreCientifico: "Alternaria solani",
      cultivos: ["Papa", "Tomate"],
      foto: "img/cultivos/hoja-enferma.jpg",
      fuente: "Corteva Agriscience Colombia",
      sintomas: "Manchas circulares u ovales castaño oscuro a negro en hojas inferiores, caracterizadas por presentar anillos concéntricos en forma de diana o 'tiro al blanco'. Las hojas afectadas se tornan amarillas, se secan y quedan adheridas al tallo.",
      causas: "Hongo que sobrevive en rastrojos secos y malezas solanáceas. Prolifera con la alternancia de períodos húmedos (rocío nocturno) y días cálidos y secos (22°C - 28°C), común en plantas bajo estrés nutricional.",
      prevencion: "Garantizar una nutrición balanceada (adecuado aporte de potasio y magnesio). Evitar el estrés hídrico. Manejo de rastrojos mediante arado profundo.",
      queHacer: "Tratamientos foliares recomendados por Corteva: Aplicación de fungicidas como Fontelis® (carboxamida de última generación) en rotación con Dithane™ M-45 WP NT para prevenir resistencias.",
      practicasEvitar: "Evitar el estrés por sequía seguido de sobre-riego. No descuidar las hojas inferiores de la planta.",
      evitarRecurrencia: "Eliminar rastrojos de cosechas previas e incorporar materia orgánica descompuesta al suelo."
    },
    {
      id: "enf_papa_gorgojo_corteva",
      nombre: "Gorgojo de los Andes / Gusano blanco de la papa",
      nombreCientifico: "Premnotrypes vorax",
      cultivos: ["Papa"],
      foto: "img/cultivos/papa.jpg",
      fuente: "Corteva Agriscience Colombia",
      sintomas: "Adultos provocan mordeduras semicirculares características en los bordes de las hojas ('en forma de media luna'). El daño principal lo causan las larvas que barrenan el interior de los tubérculos, excavando galerías cavernosas llenas de excrementos, destruyendo por completo la calidad comercial.",
      causas: "Insecto coleóptero no volador endémico de los Andes. Los adultos emergen del suelo con las primeras lluvias y caminan desde lotes infestados hacia las nuevas siembras.",
      prevencion: "Zanjas perimetrales con plástico en los linderos para atrapar adultos caminadores. Cosecha oportuna sin demoras en el terreno. Uso de semilla limpia sin orificios.",
      queHacer: "Manejo químico según Corteva: Aplicaciones dirigidas al cuello de la planta y base de los tallos durante la emergencia y el aporque con insecticidas como Vydate® C-LV o Exalt® en rotación estratégica.",
      practicasEvitar: "No transportar tubérculos agusanados a almacenes sanos ni botar papas con gusano al borde de la chacra.",
      evitarRecurrencia: "Rotación rigurosa con pastos, cereales o leguminosas. Dejar aves en el lote tras la cosecha para predación de larvas."
    },
    {
      id: "enf_papa_polilla_corteva",
      nombre: "Polilla de la papa y Polilla guatemalteca",
      nombreCientifico: "Tecia solanivora / Phthorimaea operculella",
      cultivos: ["Papa"],
      foto: "img/cultivos/papa.jpg",
      fuente: "Corteva Agriscience Colombia",
      sintomas: "Larvas que penetran en los tubérculos formando túneles superficiales y profundos tanto en campo como en bodegas de almacenamiento. Se observa aserrín oscuro expulsado por los orificios de entrada. Facilita la entrada de bacterias pudridoras.",
      causas: "Microlepidópteros con altísima capacidad de reproducción en épocas secas y cálidas. Las hembras ovipositan en el suelo cerca de las raíces cuando este se agrieta por falta de humedad.",
      prevencion: "Mantener el suelo con humedad constante para evitar agrietamientos en surcos. Aporque alto y compacto para que las polillas no alcancen los tubérculos. Uso de trampas de feromona.",
      queHacer: "Control fitosanitario recomendado por Corteva: Aplicaciones foliares y a la base con insecticidas como Lannate™ 40, Closer™ 240 SC, Toretto™ o Exalt® al detectar vuelo de adultos.",
      practicasEvitar: "No dejar tubérculos expuestos a la luz del sol en la superficie de los surcos ni almacenar papas sin seleccionar.",
      evitarRecurrencia: "Limpieza profunda y encalado de paredes de almacenes de papa antes de guardar la nueva cosecha."
    },
    {
      id: "enf_papa_rizoctonia_corteva",
      nombre: "Costra negra y chancro del tallo en papa",
      nombreCientifico: "Rhizoctonia solani",
      cultivos: ["Papa"],
      foto: "img/cultivos/hoja-enferma.jpg",
      fuente: "Corteva Agriscience Colombia",
      sintomas: "En tubérculos: costras negras irregulares muy duras adheridas a la piel (esclerocios) que parecen terrones de tierra pero no se caen al lavar. En brotes y tallos subterráneos: lesiones necróticas hundidas de color marrón que estrangulan el brote y causan fallas en la emergencia.",
      causas: "Hongo habitante común del suelo y transmitido en tubérculos semilla infectados. Favorecido por siembras en suelos fríos, pesados y con drenaje deficiente.",
      prevencion: "Desinfección de semilla antes de sembrar. Siembra superficial en cama caliente para acelerar la emergencia de los brotes y aporcar luego gradualmente.",
      queHacer: "Aplicar fungicidas curasemillas específicos y bioestimulantes de enraizamiento. Tratamientos al fondo del surco al momento de la siembra.",
      practicasEvitar: "No sembrar en terrenos pesados inundables ni usar tubérculos con presencia evidente de costras negras.",
      evitarRecurrencia: "Solarización del suelo en época de estiaje y rotación larga con abonos verdes."
    },

    // =========================================================================
    // CULTIVO DE ARVEJA - INFORMACIÓN TÉCNICA OFICIAL DOCTOR AGRO PERÚ
    // =========================================================================
    {
      id: "enf_arveja_minador_doctoragro",
      nombre: "Mosca minadora de la arveja",
      nombreCientifico: "Liriomyza huidobrensis",
      cultivos: ["Arvejas", "Haba"],
      foto: "img/cultivos/arveja-mosca-minadora.png",
      fuente: "Doctor Agro Perú (doctoragro.pe)",
      sintomas: "Las larvas se alimentan del parénquima foliar excavando galerías o minas serpenteantes translúcidas y sinuosas características que secan el tejido foliar. Los adultos (dípteros pequeños) realizan perforaciones de alimentación y oviposición en hojas y vainas tiernas, dejando cicatrices necróticas que demeritan gravemente la calidad exportable del grano verde.",
      causas: "Plaga clave en los valles de arveja del Perú. Los adultos presentan máxima actividad al mediodía con alta radiación solar (ocultándose en días nublados bajo las hojas). La oviposición es intensa en las primeras horas de la mañana.",
      prevencion: "Manejo Integrado según Doctor Agro: Instalación de cercos vivos con maíz alrededor de la parcela para albergar y fomentar fauna benéfica. Colocación de trampas pegantes amarillas (100 trampas/ha) para captura masiva de adultos. Fomento del parasitoide biológico nativo Halticoptera arduine.",
      queHacer: "Lavados fitosanitarios con jabón potásico al 1-2% para limpiar hojas y oviposiciones. En caso de poblaciones elevadas, aplicación de insecticidas selectivos y de bajo impacto (reguladores de crecimiento o grupo IRAC 30) respetando rigurosamente los Límites Máximos de Residuos (LMR).",
      practicasEvitar: "No aplicar insecticidas piretroides o fosforados de amplio espectro que eliminan a las avispitas parasitoides benéficas.",
      evitarRecurrencia: "Eliminación inmediata de rastrojos luego de la cosecha y rotación con cultivos no hospederos."
    },
    {
      id: "enf_arveja_prodiplosis_doctoragro",
      nombre: "Mosquilla de los brotes o 'Caracha' en arveja",
      nombreCientifico: "Prodiplosis longifila",
      cultivos: ["Arvejas", "Haba"],
      foto: "img/cultivos/arveja-dano-prodiplosis.png",
      fuente: "Doctor Agro Perú (doctoragro.pe)",
      sintomas: "Las larvas raspan y dañan los tejidos meristemáticos tiernos, provocando encrespamiento, oscurecimiento y atrofia de los brotes en crecimiento (aspecto de 'escoba de bruja'). Causa aborto y caída masiva de botones florales, y en las vainas en formación genera deformaciones severas, curvaturas y costras corchosas ('caracha').",
      causas: "Díptero cecidómido de hábitos sumamente crípticos. Posee un ciclo biológico sumamente rápido (de 9 a 11 días en épocas cálidas de verano), con múltiples generaciones superpuestas. Los adultos muestran mayor actividad durante las horas del crepúsculo.",
      prevencion: "Control cultural estricto: Eliminación constante de malezas hospederas en bordos, acequias y caminos colindantes. Riegos oportunos sin generar estrés a la planta.",
      queHacer: "Soluciones técnicas Doctor Agro: Lavados a alta presión al final de la tarde utilizando jabón potásico enriquecido con coadyuvantes siliconados (adherentes) para atrapar e inmovilizar a los adultos al momento de su vuelo. Rotación estratégica de insecticidas de contacto e ingestión para romper ciclos biológicos.",
      practicasEvitar: "No regar en exceso ni permitir brotes etiolados débiles. Evitar aplicaciones al mediodía cuando los adultos están ocultos.",
      evitarRecurrencia: "Mantener limpios los canales de regadío y monitorear brotes tiernos semanalmente."
    },
    {
      id: "enf_arveja_gusanos_doctoragro",
      nombre: "Gusanos de tierra y cortadores de brotes en arveja",
      nombreCientifico: "Copitarsia sp. / Spodoptera sp. / Chrysodeixis includens",
      cultivos: ["Arvejas", "Haba"],
      foto: "img/cultivos/arveja-dano-gusano.png",
      fuente: "Doctor Agro Perú (doctoragro.pe)",
      sintomas: "En plántulas recién emergidas: corte a ras del cuello del tallo provocando la caída y muerte de la plantita. En plantas en floración y fructificación: las larvas esqueletizan las hojas o perforan directamente las vainas verdes para alimentarse de los granos tiernos en llenado.",
      causas: "Lepidópteros de hábitos crepusculares y nocturnos. Durante el día las larvas permanecen ocultas bajo el suelo, terrones o malezas secas para protegerse del sol y aves.",
      prevencion: "Recomendaciones Doctor Agro: Riegos de machaco pesados previos a la siembra para anegar el suelo y ahogar pupas invernantes. Buena preparación y desmenuzado del terreno. Trampas de melaza fermentada para captura de polillas adultas.",
      queHacer: "Aplicación de agentes biológicos específicos como Bacillus thuringiensis (Bt) cepa Kurstaki o nematodos entomopatógenos (Steinernema carpocapsae) en pulverizaciones al atardecer cuando las orugas salen a alimentarse.",
      practicasEvitar: "No dejar terrones grandes en el suelo tras el arado que sirvan de madriguera diurna para las orugas.",
      evitarRecurrencia: "Deshierbes tempranos a los 20-25 días para suprimir hospederos silvestres."
    },
    {
      id: "enf_arveja_chupadera_doctoragro",
      nombre: "Chupadera fungosa de la arveja",
      nombreCientifico: "Rhizoctonia solani",
      cultivos: ["Arvejas", "Haba"],
      foto: "img/cultivos/arveja-chupadera.png",
      fuente: "Doctor Agro Perú (doctoragro.pe)",
      sintomas: "Lesión hundida de color castaño-rojizo que circunda y estrangula el cuello del tallito a nivel del suelo. Las plantitas jóvenes se marchitan rápidamente, se doblan y mueren ('damping-off'), dejando claros vacíos en los surcos de siembra.",
      causas: "Hongo telúrico favorecido por suelos pesados, arcillosos o con mal drenaje, sumado a temperaturas templadas y exceso de humedad en los primeros riegos.",
      prevencion: "Adecuada nivelación del terreno para impedir empozamientos de agua. Sembrar sobre el lomo del surco y no en el fondo. Tratamiento preventivo de la semilla con cepas antagonistas de Trichoderma harzianum.",
      queHacer: "Suspender riegos pesados de inmediato y abrir zanjas de drenaje. Aplicación dirigida al cuello con caldo sulfocálcico o fungicidas protectores de suelo.",
      practicasEvitar: "No sembrar semilla sin desinfectar. Evitar enterrar la semilla a más de 5 cm de profundidad.",
      evitarRecurrencia: "Incorporar materia orgánica bien compostada que aumente la microfauna antagonista del suelo."
    },
    {
      id: "enf_arveja_botrytis_doctoragro",
      nombre: "Moho gris o Pudrición por Botrytis en arveja",
      nombreCientifico: "Botrytis cinerea",
      cultivos: ["Arvejas", "Haba"],
      foto: "img/cultivos/arveja-botrytis.png",
      fuente: "Doctor Agro Perú (doctoragro.pe)",
      sintomas: "Manchas acuosas marrón claro en flores, vainas y hojas senescentes que rápidamente se cubren de un denso micelio o moho algodonoso gris cenizo. Provoca caída de flores fecundadas y pudrición blanda de vainas listas para cosecha o en poscosecha.",
      causas: "Hongo necrotrófico oportunista activado por lluvias continuas, neblina, humedad relativa >90% y temperaturas entre 15°C y 22°C. Aprovecha los pétalos marchitos que quedan pegados a la vaina.",
      prevencion: "Manejo según Doctor Agro: Tutorado adecuado de la arveja con cañas y rafia para levantar el follaje del suelo. Respetar distanciamientos amplios para permitir el paso de corrientes de aire.",
      queHacer: "Eliminación manual de hojas y vainas infectadas. Pulverizaciones preventivas con productos a base de azufre micronizado, oxicloruro de cobre o fungicidas botricidas específicos antes del cierre de hilera.",
      practicasEvitar: "No mojar las flores y vainas durante riegos por aspersión. No cosechar con vainas húmedas de rocío.",
      evitarRecurrencia: "Recojo y quema de rastrojos infectados al terminar la campaña para eliminar esclerocios."
    },

    // =========================================================================
    // CULTIVOS ANDINOS (CHOCLO, HABA, QUINUA)
    // =========================================================================
    {
      id: "enf_haba_mancha_chocolate",
      nombre: "Mancha chocolate de la haba",
      nombreCientifico: "Botrytis fabae",
      cultivos: ["Haba", "Arvejas"],
      foto: "img/cultivos/hoja-enferma.jpg",
      sintomas: "Pequeñas manchas circulares marrón-rojizas o color chocolate en hojas y tallos. Con alta humedad las manchas coalescen, se vuelven necróticas y negras, provocando caída masiva de hojas y aborto floral.",
      causas: "Hongo patógeno activado por períodos de alta humedad relativa (>80%), neblinas matutinas y temperaturas frescas de 15°C a 20°C.",
      prevencion: "Uso de semilla sana libre de manchas. Respetar densidades amplias de siembra (70-80 cm entre surcos) para ventilación y sol.",
      queHacer: "Aplicar fungicidas cúpricos protectantes (oxicloruro de cobre) o caldos sulfocálcicos de manera preventiva. Podar partes gravemente afectadas.",
      practicasEvitar: "Evitar riegos por aspersión que mojen flores y follaje en horas de la tarde.",
      evitarRecurrencia: "Rotación con papa o maíz/choclo y eliminación de rastrojos infestados."
    },
    {
      id: "enf_haba_roya",
      nombre: "Roya de la haba",
      nombreCientifico: "Uromyces viciae-fabae",
      cultivos: ["Haba"],
      foto: "img/cultivos/hoja-enferma.jpg",
      sintomas: "Pústulas pulverulentas de color marrón herrumbroso a castaño oscuro en el envés de las hojas y tallos tiernos. Al avanzar seca las hojas y merma el llenado de vainas.",
      causas: "Esporas dispersadas por el viento favorecidas por rocíos nocturnos y temperaturas templadas moderadas.",
      prevencion: "Monitoreo preventivo desde la floración. Uso de variedades resistentes adaptadas a valles interandinos.",
      queHacer: "Aplicación de azufre micronizado soluble o biofungicidas a base de Trichoderma en primeras etapas de infestación.",
      practicasEvitar: "No aplicar exceso de fertilización nitrogenada que hace el follaje suculento.",
      evitarRecurrencia: "Incorporar rastrojos con arado profundo y dejar reposar el suelo."
    },
    {
      id: "enf_choclo_cercospora",
      nombre: "Mancha foliar / Cercosporiosis del choclo",
      nombreCientifico: "Cercospora zeae-maydis",
      cultivos: ["Choclo"],
      foto: "img/cultivos/hoja-enferma.jpg",
      sintomas: "Lesiones angostas, alargadas y rectangulares paralelas a las nervaduras de la hoja. Comienzan en las hojas inferiores con color verde pálido y maduran a marrón-grisáceo, secando la hoja prematuramente.",
      causas: "Esporas que sobreviven en los rastrojos de cosechas anteriores. Prolifera con temperaturas templadas (22°C a 30°C) y rocíos matutinos prolongados.",
      prevencion: "Rotación con leguminosas (arveja, haba). Incorporar restos de cosecha con arado profundo para acelerar su descomposición.",
      queHacer: "Podar y eliminar las hojas basales fuertemente infectadas antes de la floración. Aplicar biofungicidas a base de Trichoderma.",
      practicasEvitar: "Evitar sembrar choclo continuo campaña tras campaña en el mismo lote.",
      evitarRecurrencia: "Eliminar el rastrojo infestado tras la cosecha y desinfectar el terreno."
    },
    {
      id: "enf_quinua_mildiu",
      nombre: "Mildiú velloso de la quinua",
      nombreCientifico: "Peronospora variabilis",
      cultivos: ["Quinua"],
      foto: "img/cultivos/hoja-enferma.jpg",
      sintomas: "Manchas cloróticas (amarillas, rojizas o violáceas) en la superficie superior de la hoja. Por el envés se observa un fieltro grisáceo violáceo característico. Provoca defoliación severa.",
      causas: "Oomiceto transmitido por oosporas en la cubierta de la semilla y restos de tallos. Muy activo con humedad alta y temperaturas de 10°C a 18°C.",
      prevencion: "Elegir ecotipos de quinua tolerantes (ej. Pasankalla o Amarilla de Marangani). Lavado y desinfección preventiva de semillas.",
      queHacer: "Tratamientos tempranos con caldos minerales (sulfocálcico o bordelés) a dosis bajas para no quemar las hojas tiernas de la quinua.",
      practicasEvitar: "No sembrar en terrenos bajos donde el aire frío y la niebla se empozan.",
      evitarRecurrencia: "Realizar barbecho profundo en época seca para exponer las esporas a la radiación solar."
    }
  ],

  catalogo: [],
  usandoBase: true,        // true = se está mostrando el catálogo base (la base de datos está vacía)
  unsubscribe: null,
  listeners: [],           // funciones que se avisan cuando cambia el catálogo
  cropFilter: "todos",
  searchQuery: "",

  init() {
    const guardado = window.AgroVidaStorage ? window.AgroVidaStorage.get("enfermedades_catalogo", null) : null;
    if (guardado && Array.isArray(guardado) && guardado.length) {
      this.catalogo = this.normalizar(guardado);
      this.usandoBase = false;
    } else {
      this.catalogo = this.normalizar(this.catalogoBase);
    }
    this.setupListeners();
    this.renderCards(this.catalogo);
  },

  // Completa los campos opcionales y garantiza la lista de fotos
  normalizar(lista) {
    return lista.map((e) => {
      const fotos = Array.isArray(e.fotos) && e.fotos.length ? e.fotos : (e.foto ? [e.foto] : []);
      return {
        ...e,
        cultivos: Array.isArray(e.cultivos) ? e.cultivos : [],
        nombreCientifico: e.nombreCientifico || "",
        sintomas: e.sintomas || "",
        causas: e.causas || "",
        prevencion: e.prevencion || "",
        queHacer: e.queHacer || "",
        practicasEvitar: e.practicasEvitar || "",
        evitarRecurrencia: e.evitarRecurrencia || "",
        fotos: fotos,
        foto: fotos[0] || "img/cultivos/hoja-enferma.jpg",
        severidad: e.severidad || "Media"
      };
    });
  },

  // Se llama al iniciar sesión: escucha los cambios del catálogo en tiempo real
  attach() {
    if (this.unsubscribe || !window.firestoreDb) return;
    this.unsubscribe = window.firestoreDb.collection("enfermedades_catalogo").onSnapshot(
      (snap) => {
        if (snap.empty) {
          const guardado = window.AgroVidaStorage ? window.AgroVidaStorage.get("enfermedades_catalogo", null) : null;
          if (guardado && Array.isArray(guardado) && guardado.length) {
            this.catalogo = this.normalizar(guardado);
            this.usandoBase = false;
          } else {
            this.usandoBase = true;
            this.catalogo = this.normalizar(this.catalogoBase);
          }
        } else {
          this.usandoBase = false;
          const docs = [];
          snap.forEach((d) => docs.push({ id: d.id, ...d.data() }));
          docs.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"));
          this.catalogo = this.normalizar(docs);
          if (window.AgroVidaStorage) {
            window.AgroVidaStorage.set("enfermedades_catalogo", this.catalogo);
          }
        }
        this.aplicarFiltros();
        this.listeners.forEach((fn) => fn());
      },
      (err) => {
        console.warn("No se pudo leer el catálogo:", err);
        const guardado = window.AgroVidaStorage ? window.AgroVidaStorage.get("enfermedades_catalogo", null) : null;
        if (guardado && Array.isArray(guardado) && guardado.length) {
          this.catalogo = this.normalizar(guardado);
          this.usandoBase = false;
        } else {
          this.catalogo = this.normalizar(this.catalogoBase);
          this.usandoBase = true;
        }
        this.aplicarFiltros();
      }
    );
  },

  detach() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  },

  onChange(fn) {
    this.listeners.push(fn);
  },

  setupListeners() {
    const searchInput = document.getElementById("input-buscar-enfermedad");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.aplicarFiltros();
      });
    }

    document.querySelectorAll(".chip-filtro-cultivo").forEach((chip) => {
      chip.addEventListener("click", (e) => {
        document.querySelectorAll(".chip-filtro-cultivo").forEach((c) => c.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.cropFilter = e.currentTarget.getAttribute("data-crop") || "todos";
        this.aplicarFiltros();
      });
    });
  },

  aplicarFiltros() {
    let lista = this.catalogo;
    const q = this.searchQuery;
    const crop = this.cropFilter;

    if (crop && crop !== "todos") {
      lista = lista.filter((enf) => enf.cultivos.some((c) => c.toLowerCase().includes(crop.toLowerCase())));
    }
    if (q) {
      lista = lista.filter(
        (enf) =>
          enf.nombre.toLowerCase().includes(q) ||
          enf.nombreCientifico.toLowerCase().includes(q) ||
          enf.sintomas.toLowerCase().includes(q) ||
          (enf.fuente && enf.fuente.toLowerCase().includes(q)) ||
          enf.cultivos.some((c) => c.toLowerCase().includes(q))
      );
    }
    this.renderCards(lista);
  },

  // Compatibilidad con el buscador global de la barra superior
  filterEnfermedades(query) {
    this.searchQuery = (query || "").toLowerCase().trim();
    this.aplicarFiltros();
  },

  filterByCrop(cropName) {
    this.cropFilter = cropName || "todos";
    this.aplicarFiltros();
  },

  renderCards(items) {
    const container = document.getElementById("enfermedades-cards-grid");
    if (!container) return;
    const esc = window.escapeHtml;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box full-width">
          <span class="empty-icon">🔍</span>
          <p>No se encontraron afecciones o plagas que coincidan con la búsqueda.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items
      .map(
        (enf) => `
        <div class="card disease-card">
          <div class="disease-card-header">
            <img src="${esc(enf.foto)}" alt="${esc(enf.nombre)}" class="disease-card-thumb" onerror="this.src='img/cultivos/hoja-enferma.jpg'">
            <div class="disease-title-box">
              <h3>${esc(enf.nombre)}</h3>
              ${enf.nombreCientifico ? `<p class="scientific-name"><em>${esc(enf.nombreCientifico)}</em></p>` : ""}
              ${enf.fuente ? `<span style="display: inline-block; font-size: 0.74rem; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 9999px; margin-bottom: 6px;">📚 ${esc(enf.fuente)}</span>` : ""}
              <div class="crop-tags">
                ${enf.cultivos.map((c) => `<span class="crop-tag">${esc(c)}</span>`).join("")}
              </div>
            </div>
          </div>

          ${enf.fotos.length > 1 ? `
          <div class="disease-gallery">
            ${enf.fotos.slice(0, 5).map((f) => `<img src="${esc(f)}" alt="${esc(enf.nombre)}" onerror="this.style.display='none'">`).join("")}
          </div>` : ""}

          <div class="disease-card-body">
            <div class="disease-section">
              <span class="section-badge badge-symptom">🔍 Síntomas y Daños</span>
              <p>${esc(enf.sintomas)}</p>
            </div>

            <div class="disease-section">
              <span class="section-badge badge-cause">⚠️ Causas y Biología</span>
              <p>${esc(enf.causas)}</p>
            </div>

            <div class="disease-section">
              <span class="section-badge badge-prevent">🛡️ Prevención Técnica</span>
              <p>${esc(enf.prevencion)}</p>
            </div>

            <div class="disease-section">
              <span class="section-badge badge-action">💡 Manejo y Control</span>
              <p>${esc(enf.queHacer)}</p>
            </div>

            <div class="disease-section alert-box-avoid">
              <strong>⚠️ Qué prácticas evitar:</strong>
              <p>${esc(enf.practicasEvitar)}</p>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  }
};

window.EnfermedadesModule = EnfermedadesModule;
