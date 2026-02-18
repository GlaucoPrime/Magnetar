function verificarSenha() {
    const senha = document.getElementById('senha').value;
    const indicator = document.getElementById('strength-indicator');
    
    if(senha.length === 0) {
        indicator.innerHTML = '';
        return;
    }
    
    let strength = 0;
    if(senha.length >= 6) strength++;
    if(senha.length >= 10) strength++;
    if(/[a-z]/.test(senha) && /[A-Z]/.test(senha)) strength++;
    if(/[0-9]/.test(senha)) strength++;
    if(/[^a-zA-Z0-9]/.test(senha)) strength++;
    
    if(strength <= 2) {
        indicator.innerHTML = '<span class="strength-weak">⚠️ Senha fraca</span>';
    } else if(strength <= 3) {
        indicator.innerHTML = '<span class="strength-medium">⚡ Senha média</span>';
    } else {
        indicator.innerHTML = '<span class="strength-strong">✅ Senha forte</span>';
    }
}

function mostrarErro(msg) {
    document.getElementById('erro-msg').innerHTML = `<div class="erro">❌ ${msg}</div>`;
}

document.getElementById('senha').addEventListener('input', verificarSenha);

document.getElementById('form-cadastro').onsubmit = async (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const btnSubmit = document.getElementById('btn-submit');
    
    if(!nome || !email || !senha) {
        mostrarErro('Preencha todos os campos!');
        return;
    }

    if(senha.length < 6) {
        mostrarErro('A senha deve ter no mínimo 6 caracteres!');
        return;
    }
    
    btnSubmit.disabled = true;
    btnSubmit.innerText = '⏳ CRIANDO CONTA...';
    
    const payload = {
        nomeReal: nome,
        email: email,
        senha: senha
    };
    
    console.log('=== CADASTRANDO ===');
    console.log('Payload:', payload);

    try {
        const res = await fetch('/api/auth/cadastro', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const gamer = await res.json();
            console.log('✅ Cadastrado com ID:', gamer.id);
            
            document.getElementById('erro-msg').innerHTML = `
                <div class="sucesso">
                    ✅ Conta criada com sucesso!<br>
                    Redirecionando para o login...
                </div>
            `;
            
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 2000);
        } else {
            const erro = await res.text();
            console.error('❌', erro);
            mostrarErro(erro);
            btnSubmit.disabled = false;
            btnSubmit.innerText = 'CRIAR CONTA';
        }
    } catch(err) {
        console.error('❌ Erro:', err);
        mostrarErro('Erro de conexão! Verifique se o backend está rodando.');
        btnSubmit.disabled = false;
        btnSubmit.innerText = 'CRIAR CONTA';
    }
};