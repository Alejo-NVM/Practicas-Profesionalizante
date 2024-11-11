document.addEventListener("DOMContentLoaded", () => {
    cargarClientes();
    cargarProductos();
    cargarPedidos();

    const form = document.getElementById("pedido-form");
    form.addEventListener("submit", agregarPedido);

    const filtroForm = document.getElementById("filtro-form");
    filtroForm.addEventListener("submit", filtrarPedidos); 
});




// Cargar clientes para el formulario de pedidos
async function cargarClientes() {
    const clienteSelects = document.querySelectorAll("#cliente, #filtro-cliente"); 
    try {
        const response = await fetch('http://localhost:3000/clientes');
        const clientes = await response.json();

        clienteSelects.forEach(clienteSelect => {
           
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "Seleccione un cliente";
            clienteSelect.appendChild(defaultOption);

            clientes.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.ID_Cliente;
                option.textContent = cliente.Nombre;
                clienteSelect.appendChild(option);
            });

          
            clienteSelect.addEventListener('change', () => {
                if (clienteSelect.value !== "") {
                    defaultOption.disabled = true;
                }
            });
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
               
                <td><button type="button" onclick="agregarProducto(${producto.ID_Producto}, '${producto.Nombre}', ${producto.Precio}, ${producto.Stock})">+</button></td>
            `;
            productosTable.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}


const productosSeleccionados = [];

// Agregar producto a la lista de productos seleccionados
function agregarProducto(id, nombre, precio, stock) {
    const cantidad = prompt("¿Cuántos deseas agregar?", 1);
    

    if (cantidad && cantidad > 0 && cantidad <= stock) {
        const productoExistente = productosSeleccionados.find(producto => producto.id === id);
        if (productoExistente) {
            productoExistente.cantidad += parseInt(cantidad); 
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
    lista.innerHTML = ""; 

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
        cargarPedidos();  
        productosSeleccionados.length = 0;  
        mostrarProductosSeleccionados(); 
    } catch (error) {
        console.error('Error al agregar pedido:', error);
    }
}

// Función para cargar todos los pedidos
async function cargarPedidos() {
    try {
        const response = await fetch('http://localhost:3000/pedidos');  
        const pedidos = await response.json();
        console.log("Todos los pedidos:", pedidos);  

        const pedidosTable = document.getElementById("pedidos-tabla");
        pedidosTable.innerHTML = "";  

        if (pedidos.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="5">No se encontraron pedidos.</td>`;
            pedidosTable.appendChild(row);
        } else {
            pedidos.forEach(pedido => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${pedido.Cliente}</td>
                    <td>${pedido.Productos.map(producto => `${producto.nombre} x ${producto.cantidad}`).join("<br>")}</td>
                    <td>$${pedido.Total}</td>
                    <td>${pedido.Fecha}</td>
                    <td><button onclick="cambiarEstadoPedido(${pedido.ID_Pedido})">Marcar como Inactivo</button></td>
                `;
                pedidosTable.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error al cargar todos los pedidos:', error);
    }
}

// Función para aplicar el filtro
async function filtrarPedidos(event) {
    event.preventDefault();  

    const fechaInicio = document.getElementById("filtro-fecha-desde").value;
    const fechaFin = document.getElementById("filtro-fecha-hasta").value;
    
    if (fechaInicio && fechaFin && new Date(fechaFin) < new Date(fechaInicio)) {
        alert("La fecha de fin no puede ser anterior a la fecha de inicio.");
        return; 
    }

    // Obtener los demás valores del filtro
    const cliente = document.getElementById("filtro-cliente").value;

    try {
        const response = await fetch(`http://localhost:3000/pedidos/filtro?cliente=${cliente}&fechaDesde=${fechaInicio}&fechaHasta=${fechaFin}`);
        const pedidos = await response.json();
        console.log("Pedidos filtrados:", pedidos);  

        const pedidosTable = document.getElementById("pedidos-tabla");
        pedidosTable.innerHTML = "";  

        if (pedidos.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="5">No se encontraron pedidos con los filtros aplicados.</td>`;
            pedidosTable.appendChild(row);
        } else {
            pedidos.forEach(pedido => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${pedido.Cliente}</td>
                    <td>${pedido.Productos.map(producto => `${producto.nombre} x ${producto.cantidad}`).join("<br>")}</td>
                    <td>$${pedido.Total}</td>
                    <td>${pedido.Fecha}</td>
                    <td><button onclick="cambiarEstadoPedido(${pedido.ID_Pedido})">Marcar como Inactivo</button></td>
                `;
                pedidosTable.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error al filtrar pedidos:', error);
    }
}

// Función para limpiar los filtros
function limpiarFiltros() {
    document.getElementById("filtro-cliente").value = "";
    document.getElementById("filtro-fecha-desde").value = "";
    document.getElementById("filtro-fecha-hasta").value = "";

    const pedidosTable = document.getElementById("pedidos-tabla");
    pedidosTable.innerHTML = "";  

    cargarPedidos();  
}

// Asignar el evento al botón de limpiar filtros
document.getElementById("limpiar-filtros").addEventListener("click", limpiarFiltros);

// Cambiar estado de pedido a "INACTIVO"
async function cambiarEstadoPedido(id) {
    try {
        const response = await fetch(`http://localhost:3000/pedidos/${id}`, {
            method: 'PUT'
        });
        const result = await response.json();
        alert(result.message);
        cargarPedidos();  
    } catch (error) {
        console.error('Error al cambiar estado del pedido:', error);
    }
}