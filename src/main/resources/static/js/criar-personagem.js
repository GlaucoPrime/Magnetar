const jogoSelect = document.getElementById('jogo');
const jogoOutro = document.getElementById('jogo-outro');

jogoSelect.addEventListener('change', function() {
    if(this.value === 'Outro') {
        jogoOutro.style.display = 'block';
        jogoOutro.required = true;
    } else {
        jogoOutro.style.display = 'none';
        jogoOutro.required = false;
    }
});

function previewImage() {
    const url = document.getElementById('foto').value;
    const preview = document.getElementById('image-preview');
    
    if(url && (url.startsWith('http://') || url.startsWith('https://'))) {
        preview.innerHTML = `<img src="${url}" onerror="this.style.display='none'" onload="this.style.display='block'">`;
    } else {
        preview.innerHTML = '';
    }
}

function updateCharCount() {
    const bio = document.getElementById('bio').value;
    document.getElementById('char-count').innerText = `${bio.length} / 500`;
}

document.getElementById('foto').addEventListener('input', previewImage);
document.getElementById('bio').addEventListener('input', updateCharCount);

window.onload = function() {
    const gid = localStorage.getItem('gamerId');
    
    if(!gid) {
        document.getElementById('erro-container').innerHTML = `
            <div class="erro">
                ⚠️ ERRO: Você não está logado!<br>
                Redirecionando para o login...
            </div>
        `;
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 2000);
    }
};

document.getElementById('form-p').onsubmit = async (e) => {
    e.preventDefault();
    
    const gamerId = localStorage.getItem('gamerId');
    const btnSubmit = document.getElementById('btn-submit');
    
    if (!gamerId) {
        alert("ERRO: Faça login primeiro!");
        window.location.href = '/index.html';
        return;
    }

    const jogoSelecionado = document.getElementById('jogo').value;
    const jogoFinal = jogoSelecionado === 'Outro' ? document.getElementById('jogo-outro').value.trim() : jogoSelecionado;

    if(!jogoFinal) {
        document.getElementById('erro-container').innerHTML = `
            <div class="erro">⚠️ Selecione ou digite o nome do jogo!</div>
        `;
        return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerText = '⏳ CRIANDO IDENTIDADE...';

    const payload = {
        nome: document.getElementById('nome').value.trim(),
        jogo: jogoFinal,
        imagemUrl: document.getElementById('foto').value.trim() || 'https://via.placeholder.com/150?text=Avatar',
        bio: document.getElementById('bio').value.trim(),
        gamerId: parseInt(gamerId)
    };

    console.log('📦 Enviando payload:', payload);

    try {
        const res = await fetch('/api/personagens', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const personagem = await res.json();
            console.log('✅ Personagem criado:', personagem);
            
            document.getElementById('erro-container').innerHTML = `
                <div style="background: rgba(0, 255, 136, 0.2); border: 1px solid #00ff88; padding: 15px; border-radius: 10px; color: #00ff88; text-align: center;">
                    ✅ Personagem "${personagem.nome}" criado!<br>
                    Redirecionando...
                </div>
            `;
            
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1500);
        } else {
            const erro = await res.text();
            console.error('❌ Erro:', erro);
            
            document.getElementById('erro-container').innerHTML = `
                <div class="erro">❌ ${erro}</div>
            `;
            
            btnSubmit.disabled = false;
            btnSubmit.innerText = '🚀 CRIAR IDENTIDADE';
        }
    } catch (err) {
        console.error('❌ Erro de rede:', err);
        document.getElementById('erro-container').innerHTML = `
            <div class="erro">
                ❌ Erro de conexão!<br>
                Verifique se o backend está rodando.
            </div>
        `;
        
        btnSubmit.disabled = false;
        btnSubmit.innerText = '🚀 CRIAR IDENTIDADE';
    }
};