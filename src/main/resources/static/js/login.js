async function logar() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const res = await fetch(`/api/auth/login?email=${email}&senha=${senha}`, { method: 'POST' });
    if(res.ok) {
        const d = await res.json();
        localStorage.setItem('gamerId', d.id);
        window.location.href = '/pages/dashboard.html';
    }
}