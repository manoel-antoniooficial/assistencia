import { auth, db } from '../firebase/config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { criarAdminMasf } from './setupAdmin.js';

const loginForm = document.getElementById('loginForm');

if (loginForm) {
    // Aviso no console para sabermos que o script não travou
    console.log("✅ Sistema de Autenticação Carregado e Pronto!");

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const btnSubmit = loginForm.querySelector('button[type="submit"]');
        const originalText = btnSubmit.innerHTML;

        btnSubmit.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Autenticando...';
        btnSubmit.disabled = true;

        // BYPASS MASTER BLINDADO: Garante acesso imediato sem depender da internet ou Firebase
        if (email === "contato.masf1991@gmail.com" && password === "123456789") {
            localStorage.setItem('devBypass', 'true');
            localStorage.setItem('userRole', 'ADMIN');
            localStorage.setItem('userName', 'MASF Admin');
            
            // Tenta cadastrar no banco por baixo dos panos, mas se falhar não trava você
            criarAdminMasf().catch(() => {});
            
            redirecionarDashboard();
            return;
        }

        try {
            // Usuário comum (banco de dados real)
            const credential = await signInWithEmailAndPassword(auth, email, password);
            const user = credential.user;

            // 2. Busca permissões no Realtime Database
            try {
                const userRef = ref(db, 'usuarios/' + user.uid);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    localStorage.setItem('userRole', userData.cargo);
                    localStorage.setItem('userName', userData.nome);
                } else {
                    localStorage.setItem('userRole', 'ADMIN');
                    localStorage.setItem('userName', 'Admin');
                }
            } catch (dbError) {
            }

            // Login bem-sucedido via Firebase
            localStorage.removeItem('devBypass');
            redirecionarDashboard();

        } catch (error) {
            console.error("Erro no Login:", error);

            // Trazemos o erro real do Firebase para a tela
            let mensagemErro = 'Falha na autenticação. Verifique e-mail e senha.';
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                mensagemErro = 'Usuário ou senha incorretos.';
            } else if (error.code === 'auth/network-request-failed') {
                mensagemErro = 'Sem conexão com a internet ou bloqueio no Firebase.';
            } else {
                mensagemErro = 'Erro do sistema: ' + error.message;
            }

            Swal.fire({
                icon: 'error',
                title: 'Acesso Negado',
                text: mensagemErro,
                background: '#18181b',
                color: '#fff'
            });

        } finally {
            if (btnSubmit) {
                btnSubmit.innerHTML = originalText;
                btnSubmit.disabled = false;
            }
        }
    });
}

function redirecionarDashboard() {
    Swal.fire({
        icon: 'success',
        title: 'Acesso Permitido',
        text: 'Bem-vindo ao LomanTrix!',
        background: '#18181b',
        color: '#fff',
        timer: 1000,
        showConfirmButton: false
    }).then(() => {
        window.location.replace('pages/dashboard.html');
    });
}