let listaObjetos = [];

filter()

function filter() {
    fetch('palabras.json')
        .then(response => response.json())
        .then(data => {
            console.log(data);

            listaObjetos = data;

            mostrarContenido(listaObjetos);

            configurarFiltro();
        })
        .catch(error => console.error('Error:', error));
}

function configurarFiltro() {
    const inputBusqueda = document.getElementById('busqueda');

    if (!inputBusqueda) {
        console.error('No se encontró el input de búsqueda. Asegúrate de tener un input con id="busqueda"');
        return;
    }

    inputBusqueda.addEventListener('input', function () {
        const termino = this.value.trim().toLowerCase();
        filtrarYResaltar(termino);
    });
}

function filtrarYResaltar(termino) {
    if (!termino) {
        mostrarContenido(listaObjetos);
        return;
    }

    const objetosFiltrados = listaObjetos.map(obj => ({ ...obj }));

    objetosFiltrados.forEach(obj => {
        obj.puntuacion = calcularPuntuacionCoincidencia(obj, termino);
    });

    const objetosConCoincidencias = objetosFiltrados.filter(obj => obj.puntuacion > 0);

    objetosConCoincidencias.sort((a, b) => b.puntuacion - a.puntuacion);

    mostrarResultadosFiltrados(objetosConCoincidencias, termino);
}

function calcularPuntuacionCoincidencia(objeto, termino) {
    let puntuacion = 0;
    const nombre = objeto.name.toLowerCase();
    const descripcion = objeto.description.toLowerCase();
    const id = objeto.id.toLowerCase();

    if (nombre === termino) {
        puntuacion += 100;
    }

    if (nombre.includes(termino)) {
        puntuacion += 50;
        if (nombre.startsWith(termino)) {
            puntuacion += 20;
        }
    }

    if (descripcion.includes(termino)) {
        puntuacion += 10;
    }

    if (id.includes(termino)) {
        puntuacion += 5;
    }

    const palabrasNombre = nombre.split(/\s+/);
    palabrasNombre.forEach(palabra => {
        if (palabra.startsWith(termino)) {
            puntuacion += 15;
        }
    });

    return puntuacion;
}

function mostrarResultadosFiltrados(objetos, termino) {
    const contenidoDiv = document.getElementById('contenido');

    contenidoDiv.innerHTML = '';

    if (objetos.length === 0) {
        contenidoDiv.innerHTML = `
            <div class="sin-resultados">
                <p>No se encontraron resultados para: <strong>"${termino}"</strong></p>
            </div>
        `;
        return;
    }

    const encabezado = document.createElement('div');
    encabezado.className = 'resultados-header';
    encabezado.innerHTML = `
        <p>Se encontraron <strong>${objetos.length}</strong> resultados para: <strong>"${termino}"</strong></p>
        <p class="ayuda-filtro">Los resultados están ordenados por relevancia</p>
    `;
    contenidoDiv.appendChild(encabezado);

    objetos.forEach((objeto, index) => {
        const elemento = document.createElement('div');
        elemento.className = `objeto-item ${objeto.puntuacion >= 70 ? 'destacado' : ''}`;

        const nombreResaltado = resaltarTexto(objeto.name, termino);
        const descripcionResaltada = resaltarTexto(
            objeto.description.substring(0, 150) + (objeto.description.length > 150 ? '...' : ''),
            termino
        );

        elemento.innerHTML = `
<div class = "objeto-resultado">
            <div class="objeto-header">
                <h3 class="objeto-nombre" onclick="wiki('${objeto.name}', '${objeto.description}', '${objeto.src}')">${nombreResaltado}</h3>
            </div>
        </div>
        `;
        contenidoDiv.appendChild(elemento);
    });
}

function resaltarTexto(texto, termino) {
    if (!termino) return texto;

    const regex = new RegExp(`(${termino})`, 'gi');
    return texto.replace(regex, '<span class="resaltado">$1</span>');
}

function mostrarContenido(objetos) {
    const contenidoDiv = document.getElementById('contenido');

    contenidoDiv.innerHTML = '';

    objetos.forEach((objeto, index) => {
        const elemento = document.createElement('div');
        elemento.className = 'objeto-item';
        elemento.innerHTML = `
        <div class = "objeto-resultado">
            <div class="objeto-header">
                <h3 class="objeto-nombre">${objeto.name}</h3>
            </div>
        </div>
        `;
        contenidoDiv.appendChild(elemento);
    });
}

function wiki(nombre, contenido, recurso) {
    document.getElementById("contenido-informacion").innerHTML = `
            <h1 class="titulo-palabra">${nombre}</h1>
            <hr>
            <div id="descripcion-contenedor">
                <p class="contenido-palabra">${contenido}</p>
            </div>
            <img src="${recurso} class="recurso-palabra">
    `;
}