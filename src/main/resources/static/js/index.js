async function executarLogin() {
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    
    if(!email || !senha) {
        mostrarErro('Preencha todos os campos!');
        return;
    }
    
    try {
        const res = await fetch(`/api/auth/login?email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`, { 
            method: 'POST' 
        });
        
        if (res.ok) {
            const dados = await res.json();
            localStorage.setItem('gamerId', dados.id);
            localStorage.setItem('gamerNome', dados.nomeReal);
            localStorage.setItem('gamerEmail', dados.email);
            localStorage.setItem('modoAnonimo', 'false');
            window.location.href = '/dashboard.html';
        } else {
            const erro = await res.text();
            mostrarErro(erro);
        }
    } catch(err) {
        mostrarErro('Erro de conexão! Verifique se o backend está rodando.');
    }
}

function mostrarErro(msg) {
    document.getElementById('erro-msg').innerHTML = `<div class="erro">❌ ${msg}</div>`;
}

function entrarAnonimo() {
    localStorage.clear();
    localStorage.setItem('modoAnonimo', 'true');
    localStorage.setItem('gamerNome', 'Visitante');
    window.location.href = '/dashboard.html';
}

document.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') executarLogin();
});