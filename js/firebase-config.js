/**
 * AgroVida - Conexión con la base de datos y utilidades de almacenamiento local
 */

const firebaseConfig = {
  apiKey: "AIzaSyCLgfU2S6bPHKWOmDDe_b3RATvy2osXbSg",
  authDomain: "agrovida-2cb8c.firebaseapp.com",
  projectId: "agrovida-2cb8c",
  storageBucket: "agrovida-2cb8c.firebasestorage.app",
  messagingSenderId: "217307831618",
  appId: "1:217307831618:web:a423f581f8d4828bb53cdb",
  measurementId: "G-G95R7XGVV6"
};

let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;

try {
  if (typeof firebase !== "undefined") {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firebaseAuth = firebase.auth();
    firestoreDb = firebase.firestore();
    firebaseAuth.languageCode = "es";
  } else {
    console.error("No se pudo cargar el SDK. Revisa tu conexión a internet.");
  }
} catch (error) {
  console.error("Error de inicialización:", error);
}

/**
 * Almacenamiento local simple (guarda datos de la sesión en el navegador)
 */
const AgroVidaStorage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem("agrovida_" + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem("agrovida_" + key, JSON.stringify(value));
    } catch (e) {
      console.warn("No se pudo guardar en el navegador:", e);
    }
  },
  remove(key) {
    try {
      localStorage.removeItem("agrovida_" + key);
    } catch (e) {}
  }
};

/**
 * Mensaje claro cuando una operación falla (sin mostrar nombres técnicos)
 */
function handleFirestoreError(error, accion = "guardar los datos") {
  console.error("Error de base de datos:", error);
  if (error && error.code === "permission-denied") {
    alert(`No tienes permiso para ${accion}. Si eres administrador, cierra sesión y vuelve a ingresar.`);
  } else {
    alert(`No se pudo ${accion}. Revisa tu conexión e inténtalo de nuevo.`);
  }
}

/**
 * Reduce y comprime una imagen (File o dataURL) para guardarla en la base de datos
 * maxSize: lado máximo en píxeles | quality: calidad JPEG (0 a 1)
 */
function comprimirImagen(source, maxSize = 640, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const procesar = (src) => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("No se pudo leer la imagen"));
      img.src = src;
    };

    if (typeof source === "string") {
      procesar(source);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => procesar(e.target.result);
      reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
      reader.readAsDataURL(source);
    }
  });
}

function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

window.firebaseConfig = firebaseConfig;
window.firebaseApp = firebaseApp;
window.firebaseAuth = firebaseAuth;
window.firestoreDb = firestoreDb;
window.AgroVidaStorage = AgroVidaStorage;
window.handleFirestoreError = handleFirestoreError;
window.comprimirImagen = comprimirImagen;
window.escapeHtml = escapeHtml;
