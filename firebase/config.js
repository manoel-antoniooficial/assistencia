import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// ATENÇÃO: Preencha com as chaves WEB (não a chave de serviço/private_key)
const firebaseConfig = {
  apiKey: "AIzaSyAzvsvVPdBGvndPtn08Ie5KaSpKTtV7oO0",
  authDomain: "assistenciatecnica-31b6b.firebaseapp.com",
  databaseURL: "https://assistenciatecnica-31b6b-default-rtdb.firebaseio.com",
  projectId: "assistenciatecnica-31b6b",
  storageBucket: "assistenciatecnica-31b6b.firebasestorage.app",
  messagingSenderId: "504782440975",
  appId: "1:504782440975:web:97dea1629b1136950c717a",
  measurementId: "G-0LPTSVVNW3"
};

// Inicializando o Firebase
let app, auth, db;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getDatabase(app);
} catch (error) {
    console.warn("Aviso: Firebase com chaves inválidas ou ausentes. O Modo Bypass será ativado.", error);
}

export { auth, db };