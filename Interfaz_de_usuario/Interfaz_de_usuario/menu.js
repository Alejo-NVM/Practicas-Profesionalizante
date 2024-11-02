window.onload = function() {
    // Obtener el nombre de usuario de localStorage
    const username = localStorage.getItem('username');

    // Mensajes aleatorios
    const messages = [
        "El único límite para nuestros logros de mañana está en nuestras dudas de hoy.",
        "La única forma de hacer un gran trabajo es amar lo que haces.",
        "No esperes. El tiempo nunca será el justo.",
        "El que madruga, Dios lo ayuda.",
        "El éxito no es definitivo, el fracaso no es fatal: es el coraje de continuar lo que cuenta.",
        "No te dejes desanimar por fracasos. Aprende de ellos y sigue adelante.",
        "La mejor forma de predecir el futuro es crearlo.",
        "Lo que haces hoy puede mejorar todos tus mañanas.",
        "La perseverancia es la clave del éxito.",
        "No cuentes los días, haz que los días cuenten."
    ];

    // Seleccionar un mensaje aleatorio
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    // Mostrar el mensaje personalizado
    const welcomeMessage = document.getElementById('welcome-message');
    if (username) {
        welcomeMessage.innerHTML = `¡Bienvenido, ${username}!<br>${randomMessage}`;
    } else {
        welcomeMessage.innerHTML = `¡Bienvenido!<br>${randomMessage}`;
    }

    // Animaciones de entrada
    setTimeout(() => {
        document.body.style.opacity = 1;
        document.querySelector('.container').style.opacity = 1;
        document.querySelector('.container').style.transform = 'translateY(0)';
        document.querySelector('.sections').style.opacity = 1;
        document.querySelector('.sections').style.transform = 'translateY(0)';
        welcomeMessage.style.opacity = 1;
    }, 500);


};
