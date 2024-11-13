/*-- Crear base de datos
CREATE DATABASE soderia;
USE soderia;

-- Tabla Clientes
CREATE TABLE Clientes (
    ID_Cliente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL,
    Email VARCHAR(50),
    Telefono VARCHAR(15),
    Direccion VARCHAR(100),
    Estado ENUM('ACTIVO', 'INACTIVO')
);

-- Tabla Productos
CREATE TABLE Productos (
    ID_Producto INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL,
    Precio DECIMAL(10, 2) NOT NULL,
    Stock INT NOT NULL
);

-- Tabla Transporte
CREATE TABLE Transporte (
    ID_Transporte INT AUTO_INCREMENT PRIMARY KEY,
    Vehiculo VARCHAR(50) NOT NULL,
    Conductor VARCHAR(50) NOT NULL,
    Capacidad INT,
    Disponibilidad BOOLEAN
);

CREATE TABLE Pedidos (
    ID_Pedido INT AUTO_INCREMENT PRIMARY KEY,
    ID_Cliente INT NOT NULL,
    Fecha DATE NOT NULL,
    Estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    FOREIGN KEY (ID_Cliente) REFERENCES Clientes(ID_Cliente),
    Estado ENUM('ACTIVO', 'INACTIVO')
);


CREATE TABLE Detalle_Pedido (
    ID_Detalle INT AUTO_INCREMENT PRIMARY KEY,
    ID_Pedido INT NOT NULL,
    ID_Producto INT NOT NULL,
    Cantidad INT NOT NULL,
    Precio DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (ID_Pedido) REFERENCES Pedidos(ID_Pedido),
    FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto)
);


-- Tabla Recorridos
CREATE TABLE Recorridos (
    ID_Recorrido INT AUTO_INCREMENT PRIMARY KEY,
    Nombre_Conductor VARCHAR(50) NOT NULL,
    Direccion_Local VARCHAR(100) DEFAULT 'Catamarca 332, La Playosa, Córdoba',
    ID_Cliente INT,
    ID_Transporte INT, -- Relación con Transporte
    FOREIGN KEY (ID_Cliente) REFERENCES Clientes(ID_Cliente),
    FOREIGN KEY (ID_Transporte) REFERENCES Transporte(ID_Transporte)
);
ALTER TABLE CLIENTES ADD COLUMNS Estado ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO';
ALTER TABLE Pedidos ADD COLUMN Estado ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO';
*/
SELECT * FROM Pedidos;





