const form = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const body = document.body;

// Definir los usuarios y contraseñas válidas
const usuarios = [
    { username: "Alejo Martinez", password: "43133536" },
    { username: "Lautaro Martinez", password: "2024" },
    { username: "Empleado random", password: "123" }
];

// Función para actualizar el fondo
function updateBackground() {
    const usernameLength = usernameInput.value.length;
    const passwordLength = passwordInput.value.length;
    const totalLength = usernameLength + passwordLength;

    const percentage = Math.min(totalLength * 3.5, 100);
    body.style.backgroundImage = `linear-gradient(180deg, #02f5fd ${100 - percentage}%, #0213ff ${percentage}%)`;
}

// Verificar credenciales
function verificarCredenciales() {
    const usuarioIngresado = usernameInput.value;
    const contrasenaIngresada = passwordInput.value;

    // Buscar si las credenciales coinciden con algún usuario en el arreglo
    return usuarios.some(usuario => 
        usuario.username === usuarioIngresado && usuario.password === contrasenaIngresada
    );
}

// Escuchar eventos de escritura en ambos campos
usernameInput.addEventListener('input', updateBackground);
passwordInput.addEventListener('input', updateBackground);

// Verificación al enviar el formulario
form.addEventListener('submit', function(event) {
    event.preventDefault(); // Evita el envío del formulario
    
    // Verificar si las credenciales son correctas
    if (verificarCredenciales()) {
        const username = usernameInput.value;
        localStorage.setItem('username', username); // Almacenar el nombre de usuario

        // Redirigir a la página de destino
        window.location.href = 'pagina-destino.html';
    } else {
        alert('Usuario o contraseña incorrectos. Intenta de nuevo.');
    }
});
