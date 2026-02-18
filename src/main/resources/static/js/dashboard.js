const gid = localStorage.getItem('gamerId');
const modoAnonimo = localStorage.getItem('modoAnonimo') === 'true';

function logout() {
    localStorage.clear();
    window.location.href = '/index.html';
}

function mostrarModalLogin() {
    if(confirm('Você precisa fazer login para acessar esta funcionalidade.\n\nDeseja ir para a tela de login agora?')) {
        window.location.href = '/index.html';
    }
}

function verificarCriarPersonagem() {
    if(modoAnonimo) {
        mostrarModalLogin();
        return;
    }
    location.href = '/criar-personagem.html';
}

async function carregar() {
    console.log('Modo Anonimo:', modoAnonimo);
    
    const nomeDisplay = document.getElementById('gamer-nome-display');
    const userIcon = document.getElementById('user-icon');
    const btnCriar = document.getElementById('btn-criar');
    
    if(modoAnonimo) {
        nomeDisplay.innerText = 'Visitante';
        userIcon.innerText = '?';
        btnCriar.disabled = true;
        btnCriar.style.opacity = '0.5';
        btnCriar.style.cursor = 'not-allowed';
        document.getElementById('badge-anonimo').innerHTML = '<span class="badge-anonimo">MODO VISITANTE</span>';
        
        mostrarMensagemVisitante();
    } else {
        if(!gid) {
            window.location.href = '/index.html';
            return;
        }
        
        const nome = localStorage.getItem('gamerNome') || "Operador";
        nomeDisplay.innerText = nome;
        userIcon.innerText = nome.charAt(0).toUpperCase();
        
        btnCriar.onclick = verificarCriarPersonagem;
        
        await carregarMeusPersonagens();
    }
}

function mostrarMensagemVisitante() {
    const container = document.getElementById('lista-personagens');
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">🕶️</div>
            <h3>Modo Visitante</h3>
            <p>Você está navegando como visitante. Use a busca para explorar personagens!</p>
            <button class="btn-neon" onclick="location.href='/index.html'">Fazer Login</button>
        </div>
    `;
}

async function carregarMeusPersonagens() {
    try {
        const res = await fetch('/api/personagens/meus/' + gid);
        const dados = await res.json();
        
        const container = document.getElementById('lista-personagens');
        
        if(dados.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎮</div>
                    <h3>Nenhum personagem criado</h3>
                    <p>Comece criando seu primeiro avatar!</p>
                    <button class="btn-neon" onclick="location.href='/criar-personagem.html'">+ Criar Primeiro Personagem</button>
                </div>
            `;
            return;
        }

        container.className = 'char-grid';
        container.innerHTML = dados.map(p => `
            <div class="char-card" onclick="entrarNoPerfil(${p.id})">
                <img src="${p.imagemUrl || 'https://via.placeholder.com/150?text=' + encodeURIComponent(p.nome)}" 
                     onerror="this.src='https://via.placeholder.com/150?text=Avatar'">
                <div class="char-name">${p.nome}</div>
                <div class="char-game">${p.jogo}</div>
            </div>
        `).join('');
        
    } catch (err) {
        console.error('Erro:', err);
        document.getElementById('lista-personagens').innerHTML = `
            <div class="erro-msg">
                <h3>Erro ao carregar personagens</h3>
                <p>${err.message}</p>
                <button class="btn-neon" onclick="carregar()" style="margin-top: 15px;">Tentar Novamente</button>
            </div>
        `;
    }
}

function entrarNoPerfil(id) {
    if(modoAnonimo) {
        // VISITANTE: apenas visualiza
        localStorage.setItem('modoVisualizacaoDashboard', 'true');
    } else {
        // USUARIO LOGADO: entra normalmente
        localStorage.setItem('meuPersonagemAtivoId', id);
        localStorage.removeItem('modoVisualizacaoDashboard');
    }
    location.href = '/personagem.html?id=' + id;
}

async function buscar() {
    const t = document.getElementById('input-busca').value;
    if(!t.trim()) {
        alert('Digite algo para buscar!');
        return;
    }
    
    try {
        const res = await fetch('/api/personagens/buscar?termo=' + encodeURIComponent(t));
        const dados = await res.json();
        
        const container = document.getElementById('resultados-busca');
        
        if(dados.length === 0) {
            container.innerHTML = '<p style="color:#666; text-align:center; margin-top:20px;">Nenhum resultado encontrado</p>';
            return;
        }
        
        container.innerHTML = dados.map(p => `
            <div class="search-item" onclick="verPerfilDaBusca(${p.id})">
                <img src="${p.imagemUrl || 'https://via.placeholder.com/50'}" 
                     onerror="this.src='https://via.placeholder.com/50'">
                <div>
                    <div style="font-weight:bold">${p.nome}</div>
                    <small style="color:var(--neon)">${p.jogo}</small>
                </div>
            </div>
        `).join('');
    } catch(err) {
        console.error('Erro na busca:', err);
        alert('Erro ao buscar personagens');
    }
}

function verPerfilDaBusca(id) {
    // SEMPRE modo visualização quando vem da busca do DASHBOARD
    localStorage.setItem('modoVisualizacaoDashboard', 'true');
    location.href = '/personagem.html?id=' + id;
}

window.onload = carregar;