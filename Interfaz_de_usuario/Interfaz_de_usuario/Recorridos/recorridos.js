// Función para actualizar la lista de direcciones en la interfaz
function actualizarListaDirecciones() {
    const lista = document.getElementById('listaClientes');
    lista.innerHTML = '';
    direcciones.forEach(direccion => {
        const li = document.createElement('li');
        li.textContent = direccion;
        lista.appendChild(li);
    });
}

// Obtener datos de los clientes desde el localStorage
const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
const direcciones = [];

// Manejar la adición de pedidos
document.getElementById('agregarPedido').addEventListener('click', function() {
    const nombreCliente = document.getElementById('cliente').value.trim();
    console.log('Nombre del cliente ingresado:', nombreCliente);

    // Buscar cliente en la lista
    const cliente = clientes.find(c => c.nombre.trim().toLowerCase() === nombreCliente.toLowerCase());
    console.log('Cliente encontrado:', cliente);

    if (cliente) {
        // Agregar dirección a la lista
        direcciones.push(cliente.direccion);
        actualizarListaDirecciones();
        document.getElementById('cliente').value = "";
    } else {
        alert("Cliente no encontrado.");
    }
});

// Manejar la optimización de la ruta
document.getElementById('optimizarRuta').addEventListener('click', function() {
    if (direcciones.length > 0) {
        // Aquí iría el código para trazar y optimizar la ruta en Google Maps
        // Esto generalmente requiere usar la API de Google Maps para calcular rutas óptimas
        console.log('Optimizar ruta:', direcciones);
    } else {
        alert("No hay direcciones para optimizar.");
    }
});
