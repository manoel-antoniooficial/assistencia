import { auth, db } from '../firebase/config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Utilitário para forçar a criação do Admin MASF. 
// Chame a função criarAdminMasf() no console do navegador ou importe-a em app.js temporariamente.
export async function criarAdminMasf() {
    try {
        const email = "contato.masf1991@gmail.com"; // Firebase Auth requer padrão de e-mail
        const senha = "123456789";
        
        console.log("Criando usuário admin...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        console.log("Salvando permissões full admin (ADMIN) no Banco de Dados...");
        await set(ref(db, 'usuarios/' + user.uid), {
            nome: "MASF Admin",
            email: email,
            cargo: "ADMIN",
            status: "online",
            data_criacao: new Date().toISOString()
        });

        console.log("Admin MASF criado com sucesso! Login: " + email + " / Senha: " + senha);
    } catch (error) {
        console.error("Erro ao criar admin MASF:", error);
    }
}