// --------------------------------APARTADO DE CONEXIÓN------------------------------



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
// Endpoint para obtener clientes (solo activos)
app.get('/api/clientes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Clientes WHERE Estado = "ACTIVO"');
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
// Endpoint para buscar clientes por nombre y estado
app.get('/api/clientes/buscar', async (req, res) => {
    const { nombre = '', estado = '' } = req.query;  // Si no se pasa estado, se trae todo

    try {
        // Si estado está vacío, no filtramos por Estado
        const query = estado ? `
            SELECT * FROM Clientes WHERE Nombre LIKE ? AND Estado = ?
        ` : `
            SELECT * FROM Clientes WHERE Nombre LIKE ?
        `;
        
        const [rows] = await pool.query(query, [`%${nombre}%`, estado].filter(Boolean));  // Eliminar undefined si no hay estado
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error al buscar clientes:", error);
        res.status(500).json({ error: "Error al buscar clientes" });
    }
});

// Endpoint para activar un cliente
app.put('/api/clientes/:id/activar', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('UPDATE Clientes SET Estado = "ACTIVO" WHERE ID_Cliente = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        res.status(200).json({ message: "Cliente activado con éxito" });
    } catch (error) {
        console.error("Error al activar cliente:", error);
        res.status(500).json({ error: "Error al activar cliente" });
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



// Endpoint para cambiar el estado de un cliente a INACTIVO
app.put('/api/clientes/:id/inactivar', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('UPDATE Clientes SET Estado = "INACTIVO" WHERE ID_Cliente = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        res.status(200).json({ message: "Cliente inactivado con éxito" });
    } catch (error) {
        console.error("Error al inactivar cliente:", error);
        res.status(500).json({ error: "Error al inactivar cliente" });
    }
});

// --------------------------------APARTADO DE PEDIDOS------------------------------

// Endpoint para obtener los clientes
app.get('/clientes', async (req, res) => {
    try {
        const [clientes] = await pool.query('SELECT * FROM Clientes WHERE Estado = "ACTIVO"');
        res.json(clientes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint para obtener los productos
app.get('/productos', async (req, res) => {
    try {
        const [productos] = await pool.query('SELECT * FROM Productos WHERE Stock > 0');
        res.json(productos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint para agregar un pedido
app.post('/pedidos', async (req, res) => {
    const { cliente, productos, fecha } = req.body;
    try {
        const [pedidoResult] = await pool.query(
            'INSERT INTO Pedidos (ID_Cliente, Fecha, Estado) VALUES (?, ?, ?)',
            [cliente, fecha, 'ACTIVO']
        );
        const idPedido = pedidoResult.insertId;

        for (let producto of productos) {
            await pool.query(
                'INSERT INTO Detalle_Pedido (ID_Pedido, ID_Producto, Cantidad, Precio) VALUES (?, ?, ?, ?)',
                [idPedido, producto.id, producto.cantidad, producto.precio]
            );
        }

        res.status(201).json({ message: 'Pedido agregado con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint para obtener los pedidos
app.get('/pedidos', async (req, res) => {
    try {
        const [pedidos] = await pool.query(
            `SELECT p.ID_Pedido, c.Nombre AS Cliente, DATE_FORMAT(p.Fecha, '%Y-%m-%d') AS Fecha, p.Estado
            FROM Pedidos p
            JOIN Clientes c ON p.ID_Cliente = c.ID_Cliente
            WHERE p.Estado = "ACTIVO"`
        );

        for (let pedido of pedidos) {
            const [productos] = await pool.query(
                `SELECT pr.Nombre, dp.Cantidad, dp.Precio
                FROM Detalle_Pedido dp
                JOIN Productos pr ON dp.ID_Producto = pr.ID_Producto
                WHERE dp.ID_Pedido = ?`, [pedido.ID_Pedido]
            );

            pedido.Productos = productos.map(producto => ({
                nombre: producto.Nombre,
                cantidad: producto.Cantidad
            }));

            const total = productos.reduce((acc, producto) => acc + (producto.Cantidad * producto.Precio), 0);
            pedido.Total = total;
        }

        res.json(pedidos);
    } catch (err) {
        console.error('Error al cargar los pedidos:', err);
        res.status(500).json({ error: err.message });
    }
});


// Endpoint para cambiar el estado de un pedido a "INACTIVO"
app.put('/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query(
            'UPDATE Pedidos SET Estado = "INACTIVO" WHERE ID_Pedido = ?',
            [id]
        );
        if (result.affectedRows > 0) {
            res.json({ message: 'Estado del pedido actualizado a INACTIVO' });
        } else {
            res.status(404).json({ message: 'Pedido no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Endpoint para obtener pedidos con filtros
app.get('/pedidos/filtro', async (req, res) => {
    const { cliente, fechaDesde, fechaHasta } = req.query;

    let query = `
        SELECT p.ID_Pedido, c.Nombre AS Cliente, DATE_FORMAT(p.Fecha, '%Y-%m-%d') AS Fecha, p.Estado
        FROM Pedidos p
        JOIN Clientes c ON p.ID_Cliente = c.ID_Cliente
        WHERE p.Estado = "ACTIVO"
    `;
    let params = [];

    if (cliente) {
        query += ' AND p.ID_Cliente = ?';
        params.push(cliente);
    }

    if (fechaDesde) {
        query += ' AND p.Fecha >= ?';
        params.push(fechaDesde);
    }

    if (fechaHasta) {
        query += ' AND p.Fecha <= ?';
        params.push(fechaHasta);
    }

    try {
        const [pedidos] = await pool.query(query, params);

        for (let pedido of pedidos) {
            const [productos] = await pool.query(
                `SELECT pr.Nombre, dp.Cantidad, dp.Precio
                FROM Detalle_Pedido dp
                JOIN Productos pr ON dp.ID_Producto = pr.ID_Producto
                WHERE dp.ID_Pedido = ?`, [pedido.ID_Pedido]
            );


            pedido.Productos = productos.map(producto => ({
                nombre: producto.Nombre,
                cantidad: producto.Cantidad
            }));


            const total = productos.reduce((acc, producto) => acc + (producto.Cantidad * producto.Precio), 0);
            pedido.Total = total;
        }

        res.json(pedidos);
    } catch (err) {
        console.error('Error al cargar los pedidos filtrados:', err);
        res.status(500).json({ error: err.message });
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

// Inicia el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
    console.log('Base de datos conectada con éxito.');
});