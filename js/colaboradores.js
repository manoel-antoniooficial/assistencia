import { db, firebaseConfig } from '../firebase/config.js';
import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// === TRUQUE DE MESTRE ===
// Inicializamos um Firebase secundário apenas para registrar a pessoa.
// Assim o Admin não é deslogado do app principal ao criar a conta!
const appCadastro = initializeApp(firebaseConfig, "AppCadastroSecundario");
const authCadastro = getAuth(appCadastro);

const formColaborador = document.getElementById('formColaborador');
const tabelaColaboradores = document.getElementById('tabelaColaboradores');

// === CADASTRAR FUNCIONÁRIO (O SEU CÓDIGO ADAPTADO) ===
if (formColaborador) {
    formColaborador.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSalvar = document.getElementById('btnSalvarColab');
        const textoOriginal = btnSalvar.innerHTML;
        btnSalvar.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Criando...';
        btnSalvar.disabled = true;

        const email = document.getElementById('colEmail').value;
        const senha = document.getElementById('colSenha').value;
        const nome = document.getElementById('colNome').value;
        const cargo = document.getElementById('colCargo').value;

        try {
            // 1. Cria o Usuário no Authentication (Usando o auth Secundário!)
            const userCredential = await createUserWithEmailAndPassword(authCadastro, email, senha);
            const user = userCredential.user;

            // 2. Salva o Cargo no DB com limite de tempo
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT_BANCO")), 5000));
            await Promise.race([set(ref(db, 'usuarios/' + user.uid), {
                nome: nome,
                email: email,
                cargo: cargo,
                status: "online",
                data_criacao: new Date().toISOString()
            }), timeoutPromise]);

            // 3. Desloga o usuário secundário para limpar a memória
            await signOut(authCadastro);

            Swal.fire({ icon: 'success', title: 'Conta Criada!', text: 'O funcionário já pode acessar o sistema.', background: '#18181b', color: '#fff', timer: 2000, showConfirmButton: false });
            document.getElementById('formColaborador').reset();
            document.getElementById('modalColab').classList.add('hidden');
            document.getElementById('modalColab').classList.remove('flex');

        } catch (error) {
            console.error("Erro ao cadastrar o usuário:", error);
            let msg = 'Erro desconhecido.';
            if(error.code === 'auth/email-already-in-use') msg = 'Este e-mail já está cadastrado.';
            if(error.code === 'auth/weak-password') msg = 'A senha deve ter pelo menos 6 caracteres.';
            if(error.message === 'TIMEOUT_BANCO') msg = 'Cadastro feito, mas o Banco de Dados não respondeu.';
            
            Swal.fire({ icon: 'error', title: 'Erro no Cadastro', text: msg, background: '#18181b', color: '#fff' });
        } finally {
            btnSalvar.innerHTML = textoOriginal;
            btnSalvar.disabled = false;
        }
    });
}

// === LISTAR COLABORADORES NA TELA ===
if (tabelaColaboradores) {
    onValue(ref(db, 'usuarios'), (snapshot) => {
        tabelaColaboradores.innerHTML = '';
        if (snapshot.exists()) {
            const usuarios = snapshot.val();
            Object.keys(usuarios).forEach((uid) => {
                const u = usuarios[uid];
                const badgeColor = u.cargo === 'ADMIN' ? 'bg-primary/20 text-primary' : (u.cargo === 'TÉCNICO' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500');
                
                tabelaColaboradores.innerHTML += `
                    <tr class="hover:bg-zinc-800/30 border-b border-darkBorder">
                        <td class="px-6 py-4 font-medium text-zinc-200">${u.nome}</td>
                        <td class="px-6 py-4 text-zinc-400">${u.email}</td>
                        <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-semibold rounded-md ${badgeColor}">${u.cargo}</span></td>
                        <td class="px-6 py-4"><span class="text-emerald-500 text-xs"><i class="fa-solid fa-circle text-[8px] mr-1"></i>Ativo</span></td>
                    </tr>`;
            });
        }
    });
}