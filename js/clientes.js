import { db } from '../firebase/config.js';
import { ref, push, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const formCliente = document.getElementById('formCliente');
const tabelaClientes = document.getElementById('tabelaClientes');

// === CADASTRAR NOVO CLIENTE ===
if (formCliente) {
    formCliente.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSalvar = document.getElementById('btnSalvarCliente');
        const textoOriginal = btnSalvar.innerHTML;
        btnSalvar.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Salvando...';
        btnSalvar.disabled = true;

        try {
            // Prepara os dados do formulário
            const novoCliente = {
                nome: document.getElementById('cliNome').value,
                telefone: document.getElementById('cliTelefone').value,
                cpf: document.getElementById('cliCpf').value || '',
                email: document.getElementById('cliEmail').value || '',
                endereco: document.getElementById('cliEndereco').value || '',
                data_cadastro: new Date().toISOString()
            };

            // Cria uma nova chave (ID único) no Firebase em 'clientes'
            const clientesRef = ref(db, 'clientes');
            const novoClienteRef = push(clientesRef);
            
            // Salva os dados com limite de tempo (Timeout de 5s para não travar a tela)
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT_BANCO")), 5000));
            await Promise.race([set(novoClienteRef, novoCliente), timeoutPromise]);

            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Cliente cadastrado com sucesso.',
                background: '#18181b',
                color: '#fff',
                timer: 2000,
                showConfirmButton: false
            });

            // O modal fecha sozinho via chamada no global escopo do HTML, mas forçamos reset aqui
            document.getElementById('formCliente').reset();
            document.getElementById('modalCliente').classList.add('hidden');
            document.getElementById('modalCliente').classList.remove('flex');

        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            
            let msgErro = 'Não foi possível cadastrar o cliente.';
            if (error.message === 'TIMEOUT_BANCO') msgErro = 'Sem conexão com o Banco de Dados. Crie o Realtime Database no painel do Firebase ou verifique o link.';

            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: msgErro,
                background: '#18181b',
                color: '#fff'
            });
        } finally {
            btnSalvar.innerHTML = textoOriginal;
            btnSalvar.disabled = false;
        }
    });
}

// === LISTAR CLIENTES EM TEMPO REAL ===
if (tabelaClientes) {
    const clientesRef = ref(db, 'clientes');
    
    onValue(clientesRef, (snapshot) => {
        tabelaClientes.innerHTML = ''; // Limpa a tabela
        
        if (snapshot.exists()) {
            const clientes = snapshot.val();
            
            // Transforma o objeto Firebase em Array e percorre
            Object.keys(clientes).forEach((key) => {
                const c = clientes[key];
                tabelaClientes.innerHTML += `
                    <tr class="hover:bg-zinc-800/30 transition-colors group">
                        <td class="px-6 py-4 font-medium text-zinc-200">${c.nome}</td>
                        <td class="px-6 py-4">${c.telefone}</td>
                        <td class="px-6 py-4 text-zinc-500">${c.cpf || '-'}</td>
                        <td class="px-6 py-4">
                            <button class="text-primary hover:text-indigo-400 mr-3" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button onclick="excluirCliente('${key}')" class="text-red-500 hover:text-red-400 transition-colors" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        } else {
            tabelaClientes.innerHTML = `<tr><td colspan="4" class="px-6 py-8 text-center text-zinc-500">Nenhum cliente cadastrado.</td></tr>`;
        }
    });
}

// === EXCLUIR CLIENTE ===
// Como estamos usando "type=module", precisamos pendurar a função no objeto window 
// para que o HTML consiga enxergá-la ao clicar no botão.
window.excluirCliente = function(id_cliente) {
    Swal.fire({
        title: 'Excluir Cliente?',
        text: "Esta ação não pode ser desfeita!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#27272a',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar',
        background: '#18181b',
        color: '#fff'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await remove(ref(db, 'clientes/' + id_cliente));
                // O onValue já vai atualizar a tabela automaticamente na tela!
            } catch (error) {
                console.error("Erro ao excluir cliente:", error);
                Swal.fire('Erro!', 'Não foi possível excluir o cliente.', 'error');
            }
        }
    });
};