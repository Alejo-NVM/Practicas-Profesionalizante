document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password'); 
    if (!username || !password) {
        
        window.location.href = '../error.html';  
        return;  
    }

   
    loadClientes();
});
// Función para cargar clientes desde la API
function loadClientes() {
    fetch('http://localhost:3000/api/clientes')
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById('clientes-tabla');
            table.innerHTML = ''; 
            
            data.forEach(addRow); 
        })
        .catch(error => console.error('Error al obtener los clientes:', error));
}

// Formulario para agregar/editar cliente
document.getElementById('cliente-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const barrio = document.getElementById('barrio').value.trim();
    const ciudad = document.getElementById('ciudad').value.trim();

    const form = document.getElementById('cliente-form');
    const editingId = form.dataset.editingId;

    if (editingId) {
      
        fetch(`http://localhost:3000/api/clientes/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, telefono, direccion, barrio, ciudad }),
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al actualizar cliente');
            return response.json();
        })
        .then(cliente => {
            loadClientes(); 
            form.reset();
            delete form.dataset.editingId;
            document.querySelector("button[type='submit']").innerText = 'Agregar Cliente';
            alert('Cliente actualizado con éxito.'); 
        })
        .catch(error => console.error('Error al actualizar cliente:', error));

    } else {
     
        fetch('http://localhost:3000/api/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, telefono, direccion, barrio, ciudad }),
        })
        .then(response => response.json())
        .then(cliente => {
            addRow(cliente); 
            form.reset();
            loadClientes(); 
            alert('Cliente agregado con éxito.'); 
        })
        .catch(error => console.error('Error al agregar cliente:', error));
    }
});

// Cargar clientes desde la API al iniciar
window.addEventListener('load', function () {
    loadClientes(); 
});



// Función para agregar una nueva fila
function addRow(cliente) {
    const table = document.getElementById('clientes-tabla');
    const newRow = table.insertRow();
    newRow.dataset.id = cliente.ID_Cliente;

    newRow.insertCell(0).innerText = cliente.Nombre;
    newRow.insertCell(1).innerText = cliente.Email;
    newRow.insertCell(2).innerText = cliente.Telefono;
    newRow.insertCell(3).innerText = cliente.Direccion;
    newRow.insertCell(4).innerText = cliente.Barrio; 
    newRow.insertCell(5).innerText = cliente.Ciudad;
    const actionsCell = newRow.insertCell(6);

   
    if (cliente.Estado === 'ACTIVO') {
        createDeleteButton(actionsCell, cliente.ID_Cliente); 
    } else if (cliente.Estado === 'INACTIVO') {
        createActivateButton(actionsCell, cliente.ID_Cliente); 
    }

    createEditButton(actionsCell, newRow, cliente); 
}


// Función para crear el botón de inactivar
function createDeleteButton(actionsCell, clienteId) {
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Inactivar';
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', function() {
        const confirmDelete = confirm('¿Estás seguro de que deseas inactivar este cliente?');
        if (confirmDelete) {
            fetch(`http://localhost:3000/api/clientes/${clienteId}/inactivar`, {
                method: 'PUT',
            })
            .then(response => {
                if (!response.ok) throw new Error('Error al inactivar cliente');
                return response.json();
            })
            .then(() => {
                loadClientes(); 
                alert('Cliente inactivado con éxito.');
            })
            .catch(error => console.error('Error al inactivar cliente:', error));
        }
    });
    actionsCell.appendChild(deleteButton);
}


// Función para crear el botón de editar
function createEditButton(actionsCell, row, cliente) {
    const editButton = document.createElement('button');
    editButton.innerText = 'Editar';
    editButton.classList.add('edit-btn');
    editButton.addEventListener('click', function() {
        document.getElementById('nombre').value = cliente.Nombre;
        document.getElementById('email').value = cliente.Email;
        document.getElementById('telefono').value = cliente.Telefono;
        document.getElementById('direccion').value = cliente.Direccion;
        document.getElementById('barrio').value = cliente.Barrio;
        document.getElementById('ciudad').value = cliente.Ciudad;
        document.getElementById('cliente-form').dataset.editingId = cliente.ID_Cliente;
        document.querySelector("button[type='submit']").innerText = 'Guardar Cliente';
    });
    actionsCell.appendChild(editButton);
}
document.getElementById('buscar-clientes-btn').addEventListener('click', function() {
    const nombre = document.getElementById('busqueda-nombre').value.trim();
    const verInactivos = document.getElementById('ver-inactivos').checked;
    const estado = verInactivos ? '' : 'ACTIVO';  

    const url = `http://localhost:3000/api/clientes/buscar?nombre=${encodeURIComponent(nombre)}&estado=${estado}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById('clientes-tabla');
            table.innerHTML = ''; 
            
            data.forEach(addRow); 
        })
        .catch(error => console.error('Error al buscar clientes:', error));
});

function createActivateButton(actionsCell, clienteId) {
    const activateButton = document.createElement('button');
    activateButton.innerText = 'Activar';
    activateButton.classList.add('activate-btn');
    activateButton.addEventListener('click', function() {
        fetch(`http://localhost:3000/api/clientes/${clienteId}/activar`, {
            method: 'PUT',
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al activar cliente');
            return response.json();
        })
        .then(() => {
            loadClientes(); 
            alert('Cliente activado con éxito.');
        })
        .catch(error => console.error('Error al activar cliente:', error));
    });
    actionsCell.appendChild(activateButton);
}
