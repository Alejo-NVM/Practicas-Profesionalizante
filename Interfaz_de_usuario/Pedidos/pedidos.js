document.addEventListener('DOMContentLoaded', function() {
    cargarClientes();
    cargarProductos();
    cargarPedidos();
});

// Mueve la declaración de productosSeleccionados fuera de la función
const productosSeleccionados = [];

// Función para cargar pedidos desde la API
async function cargarPedidos() {
    try {
        const response = await fetch('http://localhost:3000/api/pedidos');
        const pedidos = await response.json();
        
        const table = document.getElementById('pedidos-tabla');
        table.innerHTML = ''; // Limpiar la tabla antes de cargar los nuevos pedidos

        pedidos.forEach(pedido => {
            mostrarPedidoEnTabla(pedido);
        });
    } catch (error) {
        console.error('Error al cargar los pedidos:', error);
    }
}

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
document.getElementById('pedido-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const clienteId = document.getElementById('cliente').value;
    const fecha = document.getElementById('fecha').value;

    if (clienteId && productosSeleccionados.length > 0 && fecha) {
        let total = 0;

        productosSeleccionados.forEach(producto => {
            const subtotal = producto.precio * producto.cantidad;
            total += subtotal;
        });

        await agregarPedido(clienteId, total, fecha);
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
        const productosConId = productosSeleccionados.map(producto => ({
            id: producto.id, // Asegúrate de que aquí estés usando el ID correcto
            cantidad: producto.cantidad,
            precio: producto.precio
        }));

        const response = await fetch('http://localhost:3000/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clienteId, total, fecha, productos: productosConId }),
        });

        if (response.ok) {
            await cargarPedidos(); // Llama a cargarPedidos para refrescar la tabla
        } else {
            console.error('Error al agregar el pedido:', await response.json());
        }
    } catch (error) {
        console.error('Error en la solicitud para agregar pedido:', error);
    }
}

// Modifica esta función para mostrar correctamente los pedidos en la tabla
function mostrarPedidoEnTabla(pedido) {
    const table = document.getElementById('pedidos-tabla');
    const newRow = table.insertRow();

    newRow.insertCell(0).innerText = pedido.Cliente; // Nombre del cliente
    newRow.insertCell(1).innerText = pedido.Productos || 'Sin productos'; // Mostrar productos del pedido
    newRow.insertCell(2).innerText = parseFloat(pedido.Total).toFixed(2); // Total del pedido
    newRow.insertCell(3).innerText = new Date(pedido.Fecha_Entrega).toLocaleDateString(); // Fecha del pedido

    // Agrega la columna de acciones (ej. editar o eliminar)
    const accionesCell = newRow.insertCell(4);
    
    // Botón de eliminar
    const eliminarBtn = document.createElement('button');
    eliminarBtn.textContent = 'Eliminar';
    eliminarBtn.onclick = () => {
        eliminarPedido(pedido.ID_Pedido);
    };
    accionesCell.appendChild(eliminarBtn);
    
    // Botón de editar
    const editarBtn = document.createElement('button');
    editarBtn.textContent = 'Editar';
    editarBtn.onclick = () => {
        editarPedido(pedido); // Llama a la función de editar
    };
    accionesCell.appendChild(editarBtn);
}

// Función para eliminar un pedido
async function eliminarPedido(pedidoId) {
    try {
        const response = await fetch(`http://localhost:3000/api/pedidos/${pedidoId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            await cargarPedidos(); // Vuelve a cargar la lista de pedidos
        } else {
            const error = await response.json();
            console.error('Error al eliminar pedido:', error);
        }
    } catch (error) {
        console.error('Error en la solicitud para eliminar pedido:', error);
    }
}

// Función para editar un pedido
async function editarPedido(pedido) {
    const clienteId = prompt("Ingrese el nuevo ID del cliente:", pedido.ClienteID);
    const fecha = prompt("Ingrese la nueva fecha de entrega:", new Date(pedido.Fecha_Entrega).toISOString().split('T')[0]);
    
    // Aquí asumiendo que `productosSeleccionados` se debe actualizar si se va a cambiar los productos del pedido
    // Por simplicidad, no se está manejando aquí. Puedes implementar la lógica según tu necesidad.

    if (clienteId && fecha) {
        const total = pedido.Total; // Puedes calcular el nuevo total si cambias los productos
        
        try {
            const response = await fetch(`http://localhost:3000/api/pedidos/${pedido.ID_Pedido}`, {
                method: 'PUT', // O PATCH, dependiendo de tu API
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ clienteId, total, fecha, productos: pedido.Productos }), // Asegúrate de que sea el formato correcto
            });

            if (response.ok) {
                await cargarPedidos(); // Vuelve a cargar la lista de pedidos
            } else {
                console.error('Error al editar el pedido:', await response.json());
            }
        } catch (error) {
            console.error('Error en la solicitud para editar pedido:', error);
        }
    } else {
        alert("Por favor, completa todos los campos correctamente.");
    }
}
