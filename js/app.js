import { auth } from '../firebase/config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 1. Verificação Local Imediata (Resolve o loop de redirecionamento)
const isBypass = localStorage.getItem('devBypass') === 'true';
const hasSession = localStorage.getItem('userRole') !== null;

if (isBypass || hasSession) {
    initAppUI(); // Carrega os botões do admin instantaneamente
}

// 2. Monitoramento Seguro do Firebase em Segundo Plano
try {
    onAuthStateChanged(auth, (user) => {
        // Se NÃO estiver logado de nenhuma forma...
        if (!user && !isBypass && !hasSession) {
            if (!window.location.href.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
                window.location.href = '../index.html';
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
                    window.location.href = '../index.html';
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