const pid = new URLSearchParams(window.location.search).get('id');
const modoAnonimo = localStorage.getItem('modoAnonimo') === 'true';
const modoVisualizacaoDashboard = localStorage.getItem('modoVisualizacaoDashboard') === 'true';
const meuAtivoId = localStorage.getItem('meuPersonagemAtivoId');
const gid = localStorage.getItem('gamerId');

let meuNomeAtivo = "";
let dadosPersonagem = null;

console.log('=== DEBUG PERSONAGEM ===');
console.log('PID:', pid);
console.log('Modo Anonimo:', modoAnonimo);
console.log('Modo Visualizacao Dashboard:', modoVisualizacaoDashboard);
console.log('Meu Ativo ID:', meuAtivoId);
console.log('Gamer ID:', gid);

function voltar() {
    localStorage.removeItem('modoVisualizacaoDashboard');
    location.href = '/dashboard.html';
}

function mostrarModalLogin(acao) {
    if(confirm('Você precisa fazer login para ' + acao + '.\n\nDeseja ir para a tela de login agora?')) {
        window.location.href = '/index.html';
    }
}

async function init() {
    try {
        const res = await fetch('/api/personagens/perfil/' + pid);
        
        if(!res.ok) {
            throw new Error('Erro ao buscar personagem');
        }
        
        dadosPersonagem = await res.json();
        
        document.getElementById('p-nome').innerText = dadosPersonagem.nome;
        document.getElementById('p-jogo').innerText = dadosPersonagem.jogo;
        document.getElementById('avatar').src = dadosPersonagem.imagem || 'https://via.placeholder.com/160?text=' + encodeURIComponent(dadosPersonagem.nome);
        document.getElementById('c-seguidores').innerText = dadosPersonagem.seguidoresCount || 0;
        document.getElementById('c-seguindo').innerText = dadosPersonagem.seguindoCount || 0;

        // MODO ANÔNIMO
        if(modoAnonimo) {
            document.getElementById('badge-modo').innerHTML = '<span class="badge-anonimo">🕶️ MODO VISITANTE</span>';
        }
        // MODO VISUALIZAÇÃO DO DASHBOARD
        else if(modoVisualizacaoDashboard) {
            document.getElementById('badge-modo').innerHTML = '<span class="badge-visitante">👁️ APENAS VISUALIZANDO</span>';
        }

        // Busca nome do meu personagem ativo
        if(meuAtivoId && !modoAnonimo && !modoVisualizacaoDashboard) {
            const resMe = await fetch('/api/personagens/perfil/' + meuAtivoId);
            const me = await resMe.json();
            meuNomeAtivo = me.nome;
        }

        // MEU PERSONAGEM
        if (!modoAnonimo && !modoVisualizacaoDashboard && meuAtivoId == pid) {
            document.getElementById('area-post').style.display = 'block';
        } 
        // OUTRO PERSONAGEM (sem modo visualização)
        else if (!modoAnonimo && !modoVisualizacaoDashboard && meuAtivoId) {
            const btn = document.getElementById('btn-seguir');
            btn.style.display = 'inline-block';
            if (dadosPersonagem.seguidoresIds && dadosPersonagem.seguidoresIds.includes(parseInt(meuAtivoId))) {
                btn.innerText = "✖ DESCONECTAR";
                btn.classList.add('btn-unfollow');
            }
        }
        
        await loadFeed();
    } catch(err) {
        console.error('Erro ao carregar perfil:', err);
        alert('Erro ao carregar perfil do personagem!');
    }
}

async function loadFeed() {
    try {
        const res = await fetch('/api/posts/timeline/' + pid);
        const posts = await res.json();
        const feedContainer = document.getElementById('feed');
        
        const postsDoPersonagem = posts.filter(pos => pos.autor && pos.autor.id == pid);
        
        if(postsDoPersonagem.length === 0) {
            feedContainer.innerHTML = `
                <div class="post-card" style="text-align:center; padding:60px; color:#666;">
                    <div style="font-size:3rem; margin-bottom:15px;">📭</div>
                    <h3>Nenhuma postagem ainda</h3>
                    <p>Este personagem ainda não fez nenhum post.</p>
                </div>
            `;
            return;
        }
        
        feedContainer.innerHTML = postsDoPersonagem.map(pos => {
            const euCurti = pos.curtidasIds && meuAtivoId && pos.curtidasIds.includes(parseInt(meuAtivoId));
            const podeInteragir = !modoAnonimo && !modoVisualizacaoDashboard;
            
            return `
                <div class="post-card">
                    <div style="display:flex; align-items:center; gap:15px; margin-bottom:20px;">
                        <img src="${pos.autor.imagemUrl || 'https://via.placeholder.com/50'}" 
                             style="width:50px; height:50px; border-radius:50%; border:2px solid var(--primary);" 
                             onerror="this.src='https://via.placeholder.com/50'">
                        <div>
                            <div style="font-weight:bold; font-size:1.1rem;">${pos.autor.nome}</div>
                            <div style="color:#888; font-size:0.85rem;">há algumas horas</div>
                        </div>
                    </div>
                    <p style="font-size: 1.15rem; line-height:1.6; margin-bottom:20px;">${pos.conteudo}</p>
                    <div style="display:flex; gap:15px; margin-bottom:15px">
                        <button class="btn-like ${euCurti ? 'liked' : ''}" 
                                onclick="like(${pos.id})" 
                                ${!podeInteragir ? 'disabled style="opacity:0.5; cursor:not-allowed"' : ''}>
                            ${euCurti ? '❤️' : '🤍'} ${pos.curtidasCount || 0}
                        </button>
                        <button class="btn-like" 
                                onclick="comentar(${pos.id})"
                                ${!podeInteragir ? 'disabled style="opacity:0.5; cursor:not-allowed"' : ''}>
                            💬 ${pos.comentarios ? pos.comentarios.length : 0} Comentários
                        </button>
                    </div>
                    ${pos.comentarios && pos.comentarios.length > 0 ? `
                        <div class="comment-box">
                            ${pos.comentarios.map(c => {
                                const partes = c.split(': ');
                                const autor = partes[0];
                                const texto = partes.slice(1).join(': ');
                                return `<div class="comment-item"><b>${autor}:</b> ${texto}</div>`;
                            }).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    } catch(err) {
        console.error('Erro ao carregar feed:', err);
    }
}

async function like(postId) {
    
    if(modoAnonimo) {
        mostrarModalLogin('curtir posts');
        return;
    }
    
    if(modoVisualizacaoDashboard) {
        alert('⚠️ Você está apenas visualizando. Entre no seu personagem para interagir!');
        return;
    }
    
    try {
        await fetch('/api/posts/' + postId + '/curtir/' + meuAtivoId, { method: 'POST' });
        await loadFeed();
    } catch(err) {
        console.error('Erro ao curtir:', err);
    }
}

async function comentar(id) {
    if(modoAnonimo) {
        mostrarModalLogin('comentar');
        return;
    }
    
    if(modoVisualizacaoDashboard) {
        alert('⚠️ Você está apenas visualizando. Entre no seu personagem para interagir!');
        return;
    }
    
    const m = prompt("Sua resposta:");
    if(!m || !m.trim()) return;
    
    try {
        await fetch('/api/posts/' + id + '/comentar?nomeAutor=' + encodeURIComponent(meuNomeAtivo), {
            method: 'POST',
            headers: {'Content-Type': 'text/plain'},
            body: m
        });
        await loadFeed();
    } catch(err) {
        console.error('Erro ao comentar:', err);
    }
}

async function radar() {
    const t = document.getElementById('in-radar').value.trim();
    if(!t) {
        alert('Digite algo para buscar!');
        return;
    }
    
    try {
        const res = await fetch('/api/personagens/buscar?termo=' + encodeURIComponent(t));
        const dados = await res.json();
        
        const container = document.getElementById('radar-results');
        
        if(dados.length === 0) {
            container.innerHTML = '<p style="color:#666; text-align:center; margin-top:15px;">Nenhum resultado</p>';
            return;
        }
        
        container.innerHTML = dados.filter(p => p.id != meuAtivoId).map(p => `
            <div class="search-result-item">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${p.imagemUrl || 'https://via.placeholder.com/40'}" 
                         style="width:40px; height:40px; border-radius:50%; border:2px solid var(--primary);" 
                         onerror="this.src='https://via.placeholder.com/40'">
                    <div>
                        <div style="font-weight:bold;">${p.nome}</div>
                        <small style="color:var(--neon)">${p.jogo}</small>
                    </div>
                </div>
                <button class="btn-neon" style="padding:8px 20px; font-size:0.85rem" onclick="verOutroPerfil(${p.id})">VER</button>
            </div>
        `).join('');
    } catch(err) {
        console.error('Erro ao buscar:', err);
    }
}

function verOutroPerfil(id) {
    // BUSCA DENTRO DO PERSONAGEM = navegação normal (não é visualização)
    localStorage.removeItem('modoVisualizacaoDashboard');
    location.href = '/personagem.html?id=' + id;
}

async function seguir() {
    if(modoAnonimo) {
        mostrarModalLogin('seguir personagens');
        return;
    }
    
    if(modoVisualizacaoDashboard) {
        alert('⚠️ Você está apenas visualizando. Entre no seu personagem para interagir!');
        return;
    }
    
    try {
        await fetch('/api/personagens/' + pid + '/seguir/' + meuAtivoId, { method: 'POST' });
        location.reload();
    } catch(err) {
        console.error('Erro ao seguir:', err);
    }
}

async function postar() {
    const txt = document.getElementById('msg-post').value.trim();
    if(!txt) {
        alert('Digite algo para postar!');
        return;
    }
    
    try {
        await fetch('/api/posts', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ conteudo: txt, autor: { id: meuAtivoId } })
        });
        document.getElementById('msg-post').value = '';
        await loadFeed();
    } catch(err) {
        console.error('Erro ao postar:', err);
    }
}

async function mostrarSeguidores() {
    if(modoAnonimo || modoVisualizacaoDashboard) {
        mostrarModalLogin('ver seguidores');
        return;
    }
    
    document.getElementById('modal-titulo').innerText = '👥 Seguidores';
    const modal = document.getElementById('modal-seguidores');
    const lista = document.getElementById('modal-lista');
    
    lista.innerHTML = '<div style="text-align:center; padding:20px; color:var(--neon);">🔄 Carregando...</div>';
    modal.classList.add('active');
    
    try {
        const res = await fetch('/api/personagens/perfil/' + pid);
        const dados = await res.json();
        
        if(!dados.seguidoresIds || dados.seguidoresIds.length === 0) {
            lista.innerHTML = `
                <div class="empty-list">
                    <div style="font-size:3rem; margin-bottom:15px;">👤</div>
                    <p>Nenhum seguidor ainda</p>
                </div>
            `;
            return;
        }
        
        const seguidores = await Promise.all(
            dados.seguidoresIds.map(id => fetch('/api/personagens/perfil/' + id).then(r => r.json()))
        );
        
        lista.innerHTML = seguidores.map(s => `
            <div class="follower-item" onclick="verOutroPerfil(${s.id}); fecharModal();">
                <img src="${s.imagem || 'https://via.placeholder.com/60'}" class="follower-avatar" onerror="this.src='https://via.placeholder.com/60'">
                <div class="follower-info">
                    <div class="follower-name">${s.nome}</div>
                    <div class="follower-game">${s.jogo}</div>
                </div>
                <div style="color:var(--neon);">→</div>
            </div>
        `).join('');
        
    } catch(err) {
        lista.innerHTML = '<div class="empty-list">❌ Erro ao carregar seguidores</div>';
    }
}

async function mostrarSeguindo() {
    if(modoAnonimo || modoVisualizacaoDashboard) {
        mostrarModalLogin('ver quem está sendo seguido');
        return;
    }
    
    document.getElementById('modal-titulo').innerText = '✨ Seguindo';
    const modal = document.getElementById('modal-seguidores');
    const lista = document.getElementById('modal-lista');
    
    lista.innerHTML = '<div style="text-align:center; padding:20px; color:var(--neon);">🔄 Carregando...</div>';
    modal.classList.add('active');
    
    try {
        const res = await fetch('/api/personagens/perfil/' + pid + '/seguindo');
        const seguindo = await res.json();
        
        if(seguindo.length === 0) {
            lista.innerHTML = `
                <div class="empty-list">
                    <div style="font-size:3rem; margin-bottom:15px;">🌟</div>
                    <p>Não está seguindo ninguém ainda</p>
                </div>
            `;
            return;
        }
        
        lista.innerHTML = seguindo.map(s => `
            <div class="follower-item" onclick="verOutroPerfil(${s.id}); fecharModal();">
                <img src="${s.imagem || 'https://via.placeholder.com/60'}" class="follower-avatar" onerror="this.src='https://via.placeholder.com/60'">
                <div class="follower-info">
                    <div class="follower-name">${s.nome}</div>
                    <div class="follower-game">${s.jogo}</div>
                </div>
                <div style="color:var(--neon);">→</div>
            </div>
        `).join('');
        
    } catch(err) {
        console.error('Erro:', err);
        lista.innerHTML = '<div class="empty-list">❌ Erro ao carregar</div>';
    }
}

function fecharModal() {
    document.getElementById('modal-seguidores').classList.remove('active');
}

document.getElementById('modal-seguidores').addEventListener('click', function(e) {
    if(e.target === this) {
        fecharModal();
    }
});

window.onload = init;