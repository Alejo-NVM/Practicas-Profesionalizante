document.addEventListener("DOMContentLoaded", () => {
    const stockTable = document.querySelector("#stock-table tbody");
    const stockEntryForm = document.getElementById("stock-entry-form");
    const alertMessages = document.getElementById("alert-messages");
    const productoSelect = document.getElementById("producto-stock");

    const stockData = [];

    // Cargar productos desde la API al cargar la página
    async function cargarProductosDesdeAPI() {
        try {
            const response = await fetch('http://localhost:3000/api/productos');
            const productos = await response.json();

            productos.forEach(producto => {
                const option = document.createElement('option');
                option.value = producto.ID_Producto; // Usamos el ID del producto
                option.textContent = `${producto.Nombre} - $${producto.Precio}`; // Texto visible
                productoSelect.appendChild(option); // Añadimos la opción al select
            });

            // Inicializar stockData
            productos.forEach(producto => {
                const stockItem = {
                    product: producto.Nombre,
                    quantity: 0,
                    price: producto.Precio,
                    lastExitDate: null,
                    alert: ''
                };
                stockData.push(stockItem);
            });
            updateStockTable();
        } catch (error) {
            console.error('Error al cargar los productos desde la API:', error);
        }
    }

    // Llamamos a la función para cargar los productos
    cargarProductosDesdeAPI();

    // Agregar un producto al stock
    stockEntryForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const productoId = productoSelect.value; // Cambié el nombre para coincidir con el de la API
        const quantity = parseInt(e.target['cantidad-stock'].value);
    
        if (isNaN(quantity) || quantity <= 0) {
            alert('Por favor, ingresa una cantidad válida.');
            return;
        }
    
        let stockItem = stockData.find(item => item.product === productoSelect.options[productoSelect.selectedIndex].text.split(" - ")[0]);
    
        if (stockItem) {
            stockItem.quantity += quantity;
        } else {
            stockItem = {
                product: productoSelect.options[productoSelect.selectedIndex].text.split(" - ")[0],
                quantity,
                price: 0,
                lastExitDate: null
            };
            stockData.push(stockItem);
        }
    
        try {
            const response = await fetch('http://localhost:3000/api/agregar-stock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productoId, cantidad: quantity }), // Usamos productoId aquí
            });
    
            if (!response.ok) {
                throw new Error('Error al agregar stock');
            }
    
            const result = await response.json();
            alert(result.mensaje);
        } catch (error) {
            console.error('Error al agregar stock:', error);
        }
    
        updateStockTable();
        stockEntryForm.reset();
    });
    
    // Actualizar la tabla de stock
    function updateStockTable() {
        stockData.sort((a, b) => a.product.localeCompare(b.product));

        stockTable.innerHTML = stockData.map(item => `
            <tr>
                <td>${item.product}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${item.lastExitDate ? item.lastExitDate.toLocaleString() : 'N/A'}</td>
                <td>${item.alert ? '⚠️ ' + item.alert : ''}</td>
            </tr>
        `).join(""); // Actualiza el HTML de la tabla
    }

    // Función para verificar alertas
    function checkAlerts(stockItem) {
        const alertThreshold = 3;
        if (stockItem.quantity <= alertThreshold) {
            stockItem.alert = "Stock bajo: Reabastecer pronto.";
            alertMessages.innerHTML = `<p>⚠️ Alerta: ${stockItem.product} tiene un stock muy bajo. Quedan solo ${stockItem.quantity} unidades.</p>`;
        } else {
            stockItem.alert = "";
        }
    }
});
