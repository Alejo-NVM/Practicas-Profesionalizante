document.addEventListener('DOMContentLoaded', function() {
    cargarClientes();
    cargarProductos();
});

// Mueve la declaración de productosSeleccionados fuera de la función
const productosSeleccionados = [];

// Doble clic en la tabla de productos para seleccionar
document.getElementById('stock-table').addEventListener('dblclick', function(event) {
    const fila = event.target.closest('tr');
    if (!fila) return;

    const nombreProducto = fila.cells[0].innerText;
    const precioProducto = parseFloat(fila.cells[1].innerText);
    const stockProducto = parseInt(fila.cells[2].innerText);
    const cantidadPedido = prompt(`¿Cuántas unidades de ${nombreProducto} desea agregar al pedido?`, "1");
    const cantidad = parseInt(cantidadPedido);

    if (isNaN(cantidad) || cantidad <= 0 || cantidad > stockProducto) {
        alert('Por favor, ingresa una cantidad válida.');
        return;
    }

    // Verifica si el producto ya está en la lista
    const productoExistente = productosSeleccionados.find(p => p.nombre === nombreProducto);
    if (productoExistente) {
        productoExistente.cantidad += cantidad; // Sumar cantidad si ya existe
    } else {
        productosSeleccionados.push({ nombre: nombreProducto, cantidad, precio: precioProducto });
    }

    updateProductosSeleccionados();
});

// Actualiza la lista de productos seleccionados en el DOM
function updateProductosSeleccionados() {
    const listaProductos = document.getElementById('productos-seleccionados');
    listaProductos.innerHTML = '';

    productosSeleccionados.forEach(producto => {
        const li = document.createElement('li');
        li.textContent = `${producto.nombre} x ${producto.cantidad}`;
        listaProductos.appendChild(li);
    });
}

// Manejo del formulario de pedidos
document.getElementById('pedido-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const clienteId = document.getElementById('cliente').value;
    const fecha = document.getElementById('fecha').value;

    if (clienteId && productosSeleccionados.length > 0 && fecha) {
        let total = 0;

        productosSeleccionados.forEach(producto => {
            const subtotal = producto.precio * producto.cantidad;
            total += subtotal;
        });

        agregarPedido(clienteId, total, fecha);
        productosSeleccionados.length = 0; // Limpiar la lista de productos seleccionados
        updateProductosSeleccionados();
        this.reset();
    } else {
        alert("Por favor, completa todos los campos correctamente.");
    }
});

// Función para cargar clientes desde la API
async function cargarClientes() {
    try {
        const response = await fetch('http://localhost:3000/api/clientes');
        const clientes = await response.json();

        const clienteSelect = document.getElementById('cliente');
        clienteSelect.innerHTML = '<option value="">Seleccione un cliente</option>';

        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.ID_Cliente; // Asegúrate de que la propiedad sea correcta
            option.textContent = cliente.Nombre; // Asegúrate de que la propiedad sea correcta
            clienteSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar los clientes:', error);
    }
}

// Función para cargar productos
async function cargarProductos() {
    try {
        const response = await fetch('http://localhost:3000/api/productos');
        const productos = await response.json();

        const stockTableBody = document.querySelector('#stock-table tbody');
        stockTableBody.innerHTML = '';

        productos.forEach(producto => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${producto.Nombre}</td>
                <td>${parseFloat(producto.Precio).toFixed(2)}</td>
                <td>${producto.Stock}</td>
            `;
            stockTableBody.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
}

// Función para agregar el pedido a la API
async function agregarPedido(clienteId, total, fecha) {
    try {
        const response = await fetch('http://localhost:3000/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clienteId, total, fecha, productos: productosSeleccionados }),
        });

        if (response.ok) {
            const newPedido = await response.json();
            mostrarPedidoEnTabla(newPedido, clienteId); // Mostrar el nuevo pedido en la tabla
        } else {
            console.error('Error al agregar el pedido:', await response.json());
        }
    } catch (error) {
        console.error('Error en la solicitud para agregar pedido:', error);
    }
}

// Función para mostrar el pedido en la tabla
function mostrarPedidoEnTabla(pedido, clienteId) {
    const table = document.getElementById('pedidos-tabla').querySelector('tbody');
    const clienteNombre = document.querySelector(`#cliente option[value='${clienteId}']`).textContent; // Obtener el nombre del cliente
    const newRow = table.insertRow();
    newRow.insertCell(0).innerText = clienteNombre; // Nombre del cliente
    newRow.insertCell(1).innerText = pedido.productos.map(p => `${p.nombre} x${p.cantidad}`).join(', '); // Productos en el pedido
    newRow.insertCell(2).innerText = pedido.total.toFixed(2); // Total del pedido
    newRow.insertCell(3).innerText = pedido.fecha; // Fecha del pedido
}
