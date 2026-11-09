/**
 * AgroVida - Módulo de Biblioteca Agrícola
 * Guías técnicas y agronómicas completas para los 5 cultivos esenciales:
 * Papa, Choclo, Haba, Arvejas y Quinua.
 */

const BibliotecaModule = {
  guias: [
    {
      id: "guia_papa",
      nombre: "Papa",
      nombreCientifico: "Solanum tuberosum",
      foto: "img/cultivos/papa.jpg",
      descripcionCorta: "Cultivo fundamental andino. Exige suelos sueltos, aporques oportunos y control riguroso de humedad según pautas Corteva.",
      tiempoCosecha: "120 - 150 días",
      rendimientoPromedio: "18 - 30 t/ha",
      secciones: {
        preparacionTerreno: "El suelo debe ararse a una profundidad de 25 a 30 cm con al menos 3 semanas de anticipación. Desterronar y nivelar para evitar encharcamientos. Incorporar estiércol maduro o compost (10 a 15 t/ha) durante el segundo pase de rastra.",
        siembra: "Época recomendada: inicio de lluvias o con riego asegurado (septiembre a noviembre en valles interandinos). Utilizar tubérculos-semilla brotados de 40 a 60 gramos. Distanciamiento: 80 a 90 cm entre surcos y 30 a 35 cm entre plantas. Profundidad: 10 a 12 cm.",
        riego: "Riegos ligeros y frecuentes. Las etapas críticas de mayor demanda hídrica son la emergencia, la estolonización (inicio de tuberización) y el engorde del tubérculo. Suspender el riego 15 días antes de la cosecha para facilitar el endurecimiento de la piel.",
        nutricion: "Dosis referencial N-P-K: 140-160-120 kg/ha. Fraccionar el nitrógeno: 50% a la siembra y 50% al primer aporque. El fósforo (fuerte impulsor de raíces y tubérculos) se aplica 100% al fondo del surco al momento de sembrar.",
        enfermedades: "Gota o Tizón tardío (Phytophthora infestans), Tizón temprano (Alternaria solani), Costra negra (Rhizoctonia), Gorgojo de los Andes (Premnotrypes vorax) y Polilla de la papa (Tecia solanivora) [Pautas fitosanitarias Corteva].",
        prevencion: "Uso estricto de semilla certificada. Rotaciones de 3 años sin solanáceas. Aporques altos (30 cm) que impiden a las larvas de gorgojo llegar a los tubérculos y aíslan del tizón. Monitoreo temprano antes del cierre de hileras.",
        soluciones: "Programa fitosanitario Corteva: Para Gota/Tizón tardío aplicar Zorvec® Encantia®, Curzate® M-8, Equation® Pro y Dithane™ M-45. Para Tizón temprano aplicar Fontelis®. Para Gorgojo y Polilla aplicar Vydate® C-LV, Lannate™ 40 o Exalt® en la base del cuello de la planta.",
        cosecha: "Se realiza cuando el follaje se torna amarillo y se seca naturalmente. Cortar el follaje 10 días antes de escarbar para que la cáscara del tubérculo madure y no se pele durante el transporte. Almacenar en lugar ventilado y sombreado."
      }
    },
    {
      id: "guia_choclo",
      nombre: "Choclo",
      nombreCientifico: "Zea mays var. amylacea",
      foto: "img/cultivos/choclo.jpg",
      descripcionCorta: "Maíz blanco gigante tierno para consumo fresco. Requiere alta fertilidad, humedad constante y buen aporque.",
      tiempoCosecha: "140 - 170 días (estado lechoso)",
      rendimientoPromedio: "10 - 16 t/ha",
      secciones: {
        preparacionTerreno: "Arado profundo de 30 cm para facilitar la penetración de raíces adventicias. Cruza y rastreado fino. Construcción de surcos bien alineados con pendiente suave (0.2% a 0.5%) para evitar la erosión por riego.",
        siembra: "Siembra directa colocando 2 a 3 semillas seleccionadas por golpe a 7 a 8 cm de profundidad. Distancia entre surcos: 85 a 90 cm; distancia entre golpes: 40 a 50 cm. Desahijar a 2 plantas vigorosas por golpe a los 25 días.",
        riego: "Riego por gravedad en surcos. Es sumamente sensible al estrés hídrico durante la floración masculina (panoja) y emisión de estigmas (pelos del choclo). La falta de agua en este momento produce mazorcas vanas con fallas de grano.",
        nutricion: "Requiere alta provisión de nitrógeno y materia orgánica. Aplicar guano de isla (800 a 1000 kg/ha) o fórmula química N-P-K 160-100-80. Segundo abonamiento indispensable durante el aporque.",
        enfermedades: "Carbón común de la mazorca (Ustilago maydis), Mancha foliar, Gusano cogollero (Spodoptera) y Gusano choclero (Helicoverpa zea).",
        prevencion: "Monitoreo continuo de cogollos. Limpieza de malezas hospederas. Densidad adecuada para favorecer el ingreso de luz solar en el estrato medio.",
        soluciones: "Colocación de unas gotas de aceite mineral o vegetal con extracto de ajo en los estigmas para evitar la entrada del gusano choclero. Liberación de Trichogramma.",
        cosecha: "El momento óptimo es cuando los granos están en estado lechoso-masoso (al presionar con la uña sale un líquido blanco). Los estigmas se observan color marrón oscuro seco. Cosechar temprano en la mañana para mantener la frescura y dulzor."
      }
    },
    {
      id: "guia_habas",
      nombre: "Haba",
      nombreCientifico: "Vicia faba",
      foto: "img/cultivos/haba.svg",
      descripcionCorta: "Leguminosa andina de alto valor nutritivo y fijadora de nitrógeno. Clave para la rotación y nutrición de los suelos andinos.",
      tiempoCosecha: "120 - 150 días (verde) / 180 días (seco)",
      rendimientoPromedio: "8 - 14 t/ha (vaina verde)",
      secciones: {
        preparacionTerreno: "Arado profundo a 30 cm para permitir el anclaje de raíces y nodulación. Cama mullida y nivelada con buen drenaje para evitar asfixia radicular.",
        siembra: "Siembra a golpe de 2 semillas seleccionadas por golpe a 8-10 cm de profundidad. Distanciamiento: 70 a 80 cm entre surcos y 30 a 40 cm entre plantas.",
        riego: "Riegos ligeros y oportunos durante floración y cuajado de vainas. No tolerar el encharcamiento que favorece pudriciones de raíz y tallo.",
        nutricion: "Abonamiento balanceado con fósforo y potasio (P-K: 80-60 kg/ha). La planta fija su propio nitrógeno atmosférico mediante simbiosis con Rhizobium leguminosarum.",
        enfermedades: "Mancha chocolate (Botrytis fabae), Roya de la haba (Uromyces viciae-fabae), Pulgón negro (Aphis fabae) y Barrenador del tallo.",
        prevencion: "Uso de semilla sana desinfectada. Densidad adecuada para ventilación foliar. Eliminación de rastrojos infestados y rotación con cereales o tubérculos.",
        soluciones: "Para mancha chocolate: aplicaciones preventivas de fungicidas cúpricos o biológicos (Trichoderma). Para pulgón negro: lavados con jabón potásico al 1.5% o extractos de neem.",
        cosecha: "Cosecha escalonada en verde cuando las vainas están turgentes y los granos tiernos. Para grano seco, cosechar cuando la planta amarillea y las vainas se tornan negras."
      }
    },
    {
      id: "guia_arvejas",
      nombre: "Arvejas",
      nombreCientifico: "Pisum sativum",
      foto: "img/cultivos/arveja.jpg",
      descripcionCorta: "Cultivo de ciclo corto para valles altos y templados. Guía técnica de Manejo Integrado según Doctor Agro Perú.",
      tiempoCosecha: "75 - 90 días (verde) / 120 días (grano)",
      rendimientoPromedio: "5 - 9 t/ha (vaina verde)",
      secciones: {
        preparacionTerreno: "Aradura ligera a 20-25 cm y rastreado fino. Prefiere suelos francos y bien drenados con pH entre 6.0 y 7.5. Sensible a la salinidad y a los encharcamientos. Nivelar bien el terreno para evitar asfixia radicular.",
        siembra: "Siembra en líneas dobles o sencillas distanciadas 40 a 50 cm. En variedades trepadoras, colocar tutores o espalderas con cañas y rafia a los 20 cm de altura para mantener el follaje erguido y aireado.",
        riego: "Riegos ligeros semanales sin encharcar. Evitar estrés hídrico durante la floración y el llenado de vainas. No mojar las flores ni el follaje para evitar hongos.",
        nutricion: "Abonamiento de fondo con compost (4 a 6 t/ha) e inoculación de semilla con Rhizobium leguminosarum para fijación natural de nitrógeno. Aporte foliar de fósforo, calcio y boro en floración.",
        enfermedades: "Mosca minadora (Liriomyza huidobrensis), Mosquilla de los brotes / Caracha (Prodiplosis longifila), Gusanos cortadores (Copitarsia / Spodoptera), Chupadera (Rhizoctonia) y Moho gris (Botrytis cinerea) [Fichas Doctor Agro Perú].",
        prevencion: "Manejo Integrado según Doctor Agro: Instalación de cercos vivos con maíz para albergar insectos benéficos; 100 trampas pegantes amarillas por hectárea; fomento del parasitoide Halticoptera arduine; eliminación de malezas hospederas en acequias y bordos.",
        soluciones: "Lavados a presión al atardecer con jabón potásico al 1-2% + coadyuvante siliconado para atrapar adultos de prodiplosis y minador. Aplicación de Bacillus thuringiensis o nematodos para gusanos de tierra. Fungicidas cúpricos o azufre para Botrytis.",
        cosecha: "Cosecha manual escalonada cada 4 a 6 días en horas tempranas de la mañana cuando las vainas están turgentes y dulces antes de que los granos se endurezcan."
      }
    },
    {
      id: "guia_quinua",
      nombre: "Quinua",
      nombreCientifico: "Chenopodium quinoa",
      foto: "img/cultivos/quinua.jpg",
      descripcionCorta: "Superalimento andino de gran resistencia a sequías y heladas. Requiere buen control de escarda y cosecha precisa.",
      tiempoCosecha: "140 - 180 días",
      rendimientoPromedio: "1.5 - 3.0 t/ha",
      secciones: {
        preparacionTerreno: "Preparación muy esmerada: arado y rastrado fino para obtener una 'cama de semilla' mullida, ya que el grano de quinua es muy diminuto (1.5 a 2 mm).",
        siembra: "Dosis de semilla: 8 a 10 kg/ha. Siembra en surcos distanciados 50 a 60 cm a una profundidad de solo 1 a 2 cm. Tapar ligeramente con ramas o rastra de púas.",
        riego: "Muy eficiente en el uso del agua. Riego de machaco antes de la siembra para asegurar la emergencia. Soporta sequías moderadas gracias a sus raíces profundas.",
        nutricion: "Responde notablemente al abonamiento orgánico: 5 a 8 t/ha de estiércol de ovino descompuesto o compost. Fórmula 80-60-40 kg/ha.",
        enfermedades: "Mildiu velloso (Peronospora variabilis) y polilla de la quinua / kcona kcona (Eurysacca melanocampta).",
        prevencion: "Densidad de siembra no excesiva. Selección de semilla con saponina que ofrece protección natural contra plagas iniciales.",
        soluciones: "Aplicación preventiva de caldo sulfocálcico para mildiu. Uso de trampas de luz para polillas adultas en la parcela.",
        cosecha: "Corte o siega cuando la panoja adquiere su color característico de madurez y el grano se quiebra al morderlo. Secado en parvas o carpas y trilla manual o mecanizada."
      }
    }
  ],

  init() {
    this.renderCatalog();
  },

  renderCatalog() {
    const container = document.getElementById("biblioteca-grid-container");
    if (!container) return;

    container.innerHTML = this.guias
      .map(
        (g) => `
        <div class="crop-guide-card">
          <div class="guide-card-top">
            <img src="${g.foto}" alt="${g.nombre}" class="guide-crop-img">
            <div class="guide-header-info">
              <h3>${g.nombre}</h3>
              <p class="guide-scientific"><em>${g.nombreCientifico}</em></p>
              <div class="guide-meta-pill">⏱ ${g.tiempoCosecha}</div>
            </div>
          </div>
          <p class="guide-short-desc">${g.descripcionCorta}</p>
          <div class="guide-footer-btn">
            <button class="btn btn-primary btn-block" onclick="BibliotecaModule.openGuide('${g.id}')">
              Ver guía completa →
            </button>
          </div>
        </div>
      `
      )
      .join("");
  },

  openGuide(id) {
    const guia = this.guias.find((g) => g.id === id);
    if (!guia) return;

    const modal = document.getElementById("modal-guia-detalle");
    if (!modal) return;

    document.getElementById("guia-modal-title").textContent = `Guía Integral: ${guia.nombre} (${guia.nombreCientifico})`;
    document.getElementById("guia-modal-img").src = guia.foto;
    document.getElementById("guia-modal-tiempo").textContent = guia.tiempoCosecha;
    document.getElementById("guia-modal-rendimiento").textContent = guia.rendimientoPromedio;

    // Poblar secciones del manual agronómico
    document.getElementById("guia-sec-terreno").textContent = guia.secciones.preparacionTerreno;
    document.getElementById("guia-sec-siembra").textContent = guia.secciones.siembra;
    document.getElementById("guia-sec-riego").textContent = guia.secciones.riego;
    document.getElementById("guia-sec-nutricion").textContent = guia.secciones.nutricion;
    document.getElementById("guia-sec-enfermedades").textContent = guia.secciones.enfermedades;
    document.getElementById("guia-sec-prevencion").textContent = guia.secciones.prevencion;
    document.getElementById("guia-sec-soluciones").textContent = guia.secciones.soluciones;
    document.getElementById("guia-sec-cosecha").textContent = guia.secciones.cosecha;

    window.App.openModal("modal-guia-detalle");
  }
};

window.BibliotecaModule = BibliotecaModule;
