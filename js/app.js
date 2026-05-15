import { auth } from '../firebase/config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 1. Verificação Local Imediata (Resolve o loop de redirecionamento)
const isBypass = localStorage.getItem('devBypass') === 'true';
const hasSession = localStorage.getItem('userRole') !== null;

// 2. Monitoramento Seguro do Firebase em Segundo Plano
try {
    onAuthStateChanged(auth, (user) => {
        const path = window.location.pathname;
        const isLoginPage = path.endsWith('index.html') || path === '/' || path.endsWith('/sistemaassistencia') || path.endsWith('/sistemaassistencia/');

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
    const runUI = () => {
        try {
            const userName = localStorage.getItem('userName') || 'Usuário';
            const userRole = localStorage.getItem('userRole') || 'TÉCNICO';

            const elName = document.getElementById('userNameDisplay');
            if (elName) elName.textContent = userName;

            const elRole = document.getElementById('userRoleDisplay');
            if (elRole) elRole.textContent = userRole;

            const elInitial = document.getElementById('userInitial');
            if (elInitial) elInitial.textContent = userName.charAt(0);

            const adminMenu = document.getElementById('adminMenu');
            if (userRole === 'ADMIN' && adminMenu) {
                adminMenu.classList.remove('hidden');
            }

            // Controle do Menu Flutuante (App/Mobile)
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const sidebar = document.getElementById('sidebar');
            
            if (mobileMenuBtn && sidebar && !sidebar.dataset.menuInitialized) {
                sidebar.dataset.menuInitialized = 'true'; // Impede ações duplicadas
                
                let backdrop = document.getElementById('sidebarBackdrop');
                if (!backdrop) {
                    backdrop = document.createElement('div');
                    backdrop.id = 'sidebarBackdrop';
                    backdrop.className = 'fixed inset-0 bg-black/60 z-40 hidden backdrop-blur-sm transition-opacity cursor-pointer';
                    document.body.appendChild(backdrop);
                }

                const toggleMenu = () => {
                    sidebar.classList.toggle('-translate-x-full');
                    backdrop.classList.toggle('hidden');
                };

                mobileMenuBtn.addEventListener('click', toggleMenu);
                backdrop.addEventListener('click', toggleMenu);
            }
        } catch (e) {
            console.error("Erro na interface:", e);
        }
    };

    // Garante que o menu e textos só carreguem DEPOIS que a página HTML inteira existir
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runUI);
    } else {
        runUI();
    }
}

// Lógica do Sino de Notificações
window.abrirNotificacoes = function() {
    Swal.fire({
        title: 'Notificações (3)',
        html: `
            <div class="text-left text-sm space-y-3 mt-4">
                <div class="p-3 bg-zinc-800 rounded-lg border border-darkBorder flex items-center shadow-sm"><div class="w-2 h-2 bg-amber-500 rounded-full mr-3 shrink-0"></div><div><span class="text-primary font-bold">OS-1002</span> aguardando peça do fornecedor.</div></div>
                <div class="p-3 bg-zinc-800 rounded-lg border border-darkBorder flex items-center shadow-sm"><div class="w-2 h-2 bg-emerald-500 rounded-full mr-3 shrink-0"></div><div><span class="text-primary font-bold">OS-0998</span> pronta para retirada!</div></div>
                <div class="p-3 bg-zinc-800 rounded-lg border border-darkBorder flex items-center shadow-sm"><div class="w-2 h-2 bg-blue-500 rounded-full mr-3 shrink-0"></div><div>Bem-vindo ao novo sistema LomanTrix!</div></div>
            </div>
        `,
        background: '#18181b',
        color: '#fff',
        showConfirmButton: true,
        confirmButtonColor: '#6366f1',
        confirmButtonText: 'Fechar painel'
    });
};