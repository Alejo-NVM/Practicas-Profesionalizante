const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a la base de datos 
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '43133536Alee',
    database: 'entrega6',
    port: 3306,
  
});

// --------------------------------APARTADO DE PRODUCTOS------------------------------
// Endpoint para obtener productos
app.get('/api/productos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Productos');
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        res.status(500).json({ error: "Error al obtener los productos" });
    }
});

// Endpoint para agregar un nuevo producto
app.post('/api/productos', async (req, res) => {
    const { nombre, precio, stock } = req.body;

    if (!nombre || isNaN(precio) || isNaN(stock) || stock < 0) {
        return res.status(400).json({ error: "Datos faltantes o inválidos" });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO Productos (Nombre, Precio, Stock) VALUES (?, ?, ?)',
            [nombre, precio, stock]
        );
        res.status(201).json({ id: result.insertId, nombre, precio, stock });
    } catch (error) {
        console.error("Error al agregar producto:", error);
        res.status(500).json({ error: "Error al agregar producto" });
    }
});

// Endpoint para agregar stock
app.post('/api/agregar-stock', async (req, res) => {
    const { productoId, cantidad } = req.body;

    if (!productoId || isNaN(cantidad) || cantidad <= 0) {
        return res.status(400).json({ error: "Datos faltantes o inválidos" });
    }

    try {
        const [result] = await pool.query(
            'UPDATE Productos SET Stock = Stock + ? WHERE ID_Producto = ?',
            [cantidad, productoId]
        );

        // Verifica si se actualizó algún registro
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.status(200).json({ mensaje: "Stock actualizado con éxito" });
    } catch (error) {
        console.error("Error al actualizar el stock:", error);
        res.status(500).json({ error: "Error al actualizar el stock" });
    }
});
// --------------------------------APARTADO DE CLIENTES------------------------------
// Endpoint para obtener clientes
app.get('/api/clientes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Clientes');
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error al obtener los clientes:", error);
        res.status(500).json({ error: "Error al obtener los clientes" });
    }
});

// Endpoint para agregar un nuevo cliente
app.post('/api/clientes', async (req, res) => {
    const { nombre, email, telefono, direccion, barrio, ciudad } = req.body;

    if (!nombre || !email || !telefono || !direccion || !barrio || !ciudad) {
        return res.status(400).json({ error: "Datos faltantes" });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO Clientes (Nombre, Email, Telefono, Direccion, Barrio, Ciudad) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, email, telefono, direccion, barrio, ciudad]
        );
        res.status(201).json({ id: result.insertId, nombre, email, telefono, direccion, barrio, ciudad });
    } catch (error) {
        console.error("Error al agregar cliente:", error);
        res.status(500).json({ error: "Error al agregar cliente" });
    }
});

// Endpoint para obtener un cliente por su ID
app.get('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const [rows] = await pool.query('SELECT * FROM Clientes WHERE ID_Cliente = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error al obtener el cliente:", error);
        res.status(500).json({ error: "Error al obtener el cliente" });
    }
});

// Endpoint para actualizar un cliente existente
app.put('/api/clientes/:id', async (req, res) => {
    const id = req.params.id;
    const { nombre, email, telefono, direccion, barrio, ciudad } = req.body;

    if (!nombre || !email || !telefono || !direccion || !barrio || !ciudad) {
        return res.status(400).json({ error: "Datos faltantes o inválidos" });
    }

    try {
        const query = `UPDATE Clientes SET Nombre = ?, Email = ?, Telefono = ?, Direccion = ?, Barrio = ?, Ciudad = ? WHERE ID_Cliente = ?`;
        const values = [nombre, email, telefono, direccion, barrio, ciudad, id];

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        res.json({ id: id, nombre, email, telefono, direccion, barrio, ciudad });
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        return res.status(500).json({ error: 'Error al actualizar cliente' });
    }
});



// Endpoint para eliminar un cliente
app.delete('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM Clientes WHERE ID_Cliente = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        res.status(204).send(); 
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        res.status(500).json({ error: "Error al eliminar cliente" });
    }
});

// --------------------------------APARTADO DE PEDIDOS------------------------------

// Endpoint para agregar un nuevo pedido
app.post('/api/pedidos', async (req, res) => {
    const { clienteId, total, fecha, productos } = req.body;

    if (!clienteId || !total || !fecha || !Array.isArray(productos)) {
        return res.status(400).json({ error: "Datos faltantes o inválidos" });
    }

    try {
        // Insertar el pedido
        const [result] = await pool.query(
            'INSERT INTO Pedidos (ID_Cliente, Total, Fecha_Entrega) VALUES (?, ?, ?)',
            [clienteId, total, fecha]
        );
        const nuevoPedidoId = result.insertId;

        // Insertar cada producto en la tabla Detalle_Pedido
        const detalleQueries = productos.map(producto => {
            return pool.query(
                'INSERT INTO Detalle_Pedido (ID_Pedido, ID_Producto, Cantidad, Precio_Unitario) VALUES (?, ?, ?, ?)',
                [nuevoPedidoId, producto.id, producto.cantidad, producto.precio] // Asegúrate de que se está pasando el ID correcto
            );
        });
        
        await Promise.all(detalleQueries);

        // Devolver el nuevo pedido
        res.status(201).json({
            id: nuevoPedidoId,
            clienteId,
            total,
            fecha,
            productos
        });
    } catch (error) {
        console.error("Error al agregar pedido:", error);
        res.status(500).json({ error: "Error al agregar pedido" });
    }
});




// Endpoint para obtener todos los pedidos con detalles de productos
app.get('/api/pedidos', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT P.ID_Pedido, C.Nombre AS Cliente, P.Total, P.Fecha_Entrega, 
                   GROUP_CONCAT(CONCAT(DP.Cantidad, ' x ', PR.Nombre) SEPARATOR ', ') AS Productos
            FROM Pedidos P
            JOIN Clientes C ON P.ID_Cliente = C.ID_Cliente
            LEFT JOIN Detalle_Pedido DP ON P.ID_Pedido = DP.ID_Pedido
            LEFT JOIN Productos PR ON DP.ID_Producto = PR.ID_Producto
            GROUP BY P.ID_Pedido, C.Nombre, P.Total, P.Fecha_Entrega
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error al obtener pedidos:", error);
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
});


// Endpoint para eliminar un pedido
app.delete('/api/pedidos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM Pedidos WHERE ID_Pedido = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }
        res.status(204).send(); 
    } catch (error) {
        console.error("Error al eliminar pedido:", error);
        res.status(500).json({ error: "Error al eliminar pedido" });
    }
});

// --------------------------------APARTADO DE Detalle_Pedido------------------------------
app.get('/api/detalle-pedidos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Detalle_Pedido');
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error al obtener detalles de pedidos:", error);
        res.status(500).json({ error: "Error al obtener detalles de pedidos" });
    }
});

// --------------------------------APARTADO DE CONEXIÓN------------------------------
// Inicia el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
    console.log('Base de datos conectada con éxito.');
});
