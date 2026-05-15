import { auth } from '../firebase/config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 1. Verificação Local Imediata (Resolve o loop de redirecionamento)
const isBypass = localStorage.getItem('devBypass') === 'true';
const hasSession = localStorage.getItem('userRole') !== null;

// 2. Monitoramento Seguro do Firebase em Segundo Plano
try {
    onAuthStateChanged(auth, (user) => {
        const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('sistemaassistencia');

        if (user || isBypass || hasSession) {
            // LOGADO: Se abrir o app, vai direto pro dashboard sem pedir senha!
            if (isLoginPage) {
                window.location.replace('pages/dashboard.html'); // replace() evita o erro de voltar pro login
            } else {
                initAppUI(); 
            }
        } else {
            // NÃO LOGADO: Protege as páginas internas chutando para o login
            if (!isLoginPage) {
                window.location.replace('../index.html');
            }
        }
    });
} catch (error) {
    console.warn("O Firebase não foi inicializado completamente, usando sessão local.");
}

// Lógica de Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        Swal.fire({
            title: 'Sair do Sistema?',
            text: "Você será desconectado.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Sim, sair',
            cancelButtonText: 'Cancelar',
            background: '#1f2937',
            color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                signOut(auth).catch(() => {}).finally(() => {
                    localStorage.clear();
                    window.location.replace('../index.html');
                });
            }
        });
    });
}

// Inicializa os dados da Interface do Usuário (Sidebar)
function initAppUI() {
    const userName = localStorage.getItem('userName') || 'Usuário';
    const userRole = localStorage.getItem('userRole') || 'TÉCNICO';

    document.getElementById('userNameDisplay').textContent = userName;
    document.getElementById('userRoleDisplay').textContent = userRole;
    document.getElementById('userInitial').textContent = userName.charAt(0);

    // Controle de Acesso Baseado em Nível (Role)
    if (userRole === 'ADMIN') {
        document.getElementById('adminMenu').classList.remove('hidden');
    }
}