document.addEventListener("DOMContentLoaded", () => {
    cargarClientes();
    cargarProductos();
    cargarPedidos();

    const form = document.getElementById("pedido-form");
    form.addEventListener("submit", agregarPedido);
});

// Cargar clientes para el formulario de pedidos
async function cargarClientes() {
    const clienteSelect = document.getElementById("cliente");
    try {
        const response = await fetch('http://localhost:3000/clientes');
        const clientes = await response.json();
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.ID_Cliente;
            option.textContent = cliente.Nombre;
            clienteSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    }
}

// Cargar productos disponibles
async function cargarProductos() {
    const productosTable = document.getElementById("productos-tabla");
    try {
        const response = await fetch('http://localhost:3000/productos');
        const productos = await response.json();
        productos.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.Nombre}</td>
                <td>$${producto.Precio}</td>
                <td>${producto.Stock}</td>
                <td><button type="button" onclick="agregarProducto(${producto.ID_Producto}, '${producto.Nombre}', ${producto.Precio}, ${producto.Stock})">+</button></td>
            `;
            productosTable.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Arreglo global para almacenar los productos seleccionados
const productosSeleccionados = [];

// Agregar producto a la lista de productos seleccionados
function agregarProducto(id, nombre, precio, stock) {
    const cantidad = prompt("¿Cuántos deseas agregar?", 1);
    
    // Verificar si la cantidad es válida y no excede el stock disponible
    if (cantidad && cantidad > 0 && cantidad <= stock) {
        // Verificar si el producto ya está en la lista de seleccionados
        const productoExistente = productosSeleccionados.find(producto => producto.id === id);
        if (productoExistente) {
            productoExistente.cantidad += parseInt(cantidad); // Aumenta la cantidad del producto si ya está en la lista
        } else {
            productosSeleccionados.push({ id, nombre, precio, cantidad: parseInt(cantidad) });
        }
        mostrarProductosSeleccionados();
    } else {
        alert("Cantidad no válida o superior al stock disponible.");
    }
}

// Mostrar los productos seleccionados en la lista
function mostrarProductosSeleccionados() {
    const lista = document.getElementById("productos-seleccionados");
    lista.innerHTML = ""; // Limpiar la lista antes de mostrar los productos seleccionados

    productosSeleccionados.forEach(producto => {
        const li = document.createElement('li');
        li.textContent = `${producto.nombre} - $${producto.precio} x ${producto.cantidad}`;
        lista.appendChild(li);
    });
}

// Agregar pedido (enviar todos los productos seleccionados a la API)
async function agregarPedido(event) {
    event.preventDefault();
    const cliente = document.getElementById("cliente").value;
    const fecha = document.getElementById("fecha").value;

    // Verificar que todos los campos estén completos y que haya productos seleccionados
    if (!cliente || !fecha || productosSeleccionados.length === 0) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cliente: cliente,
                productos: productosSeleccionados,
                fecha: fecha
            })
        });

        const result = await response.json();
        alert(result.message);
        cargarPedidos();  // Recargar la lista de pedidos
        productosSeleccionados.length = 0;  // Limpiar la lista de productos seleccionados después de agregar el pedido
        mostrarProductosSeleccionados();  // Actualizar la vista de productos seleccionados
    } catch (error) {
        console.error('Error al agregar pedido:', error);
    }
}

// Cargar pedidos activos
async function cargarPedidos() {
    const pedidosTable = document.getElementById("pedidos-tabla");
    pedidosTable.innerHTML = ""; // Limpiar la tabla antes de recargar

    try {
        const response = await fetch('http://localhost:3000/pedidos');
        const pedidos = await response.json();
        
        pedidos.forEach(pedido => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${pedido.Cliente}</td>
                <td>
                    ${pedido.Productos.map(producto => `${producto.nombre} x ${producto.cantidad}`).join("<br>")}
                </td>
                <td>$${pedido.Total}</td>
                <td>${pedido.Fecha}</td>
                <td><button onclick="cambiarEstadoPedido(${pedido.ID_Pedido})">Marcar como Inactivo</button></td>
            `;
            pedidosTable.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
    }
}


// Cambiar estado de pedido a "INACTIVO"
async function cambiarEstadoPedido(id) {
    try {
        const response = await fetch(`http://localhost:3000/pedidos/${id}`, {
            method: 'PUT'
        });
        const result = await response.json();
        alert(result.message);
        cargarPedidos();  // Recargar la lista de pedidos
    } catch (error) {
        console.error('Error al cambiar estado del pedido:', error);
    }
}
