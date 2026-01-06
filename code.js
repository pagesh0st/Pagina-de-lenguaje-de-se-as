let listaObjetos = [];

filter();

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
        filtrarPalabras(termino);
    });
}

function filtrarPalabras(termino) {
    if (!termino) {
        mostrarContenido(listaObjetos);
        return;
    }

    // Filtrar objetos que contengan el término exacto como subcadena
    const resultados = listaObjetos.filter(obj => {
        const nombre = obj.name.toLowerCase();
        const descripcion = obj.description.toLowerCase();
        const id = obj.id.toLowerCase();
        
        return nombre.includes(termino) || 
               descripcion.includes(termino) || 
               id.includes(termino);
    });

    // Ordenar por relevancia
    resultados.sort((a, b) => {
        const nombreA = a.name.toLowerCase();
        const nombreB = b.name.toLowerCase();
        
        // Coincidencia exacta primero
        if (nombreA === termino && nombreB !== termino) return -1;
        if (nombreB === termino && nombreA !== termino) return 1;
        
        // Empieza con el término
        const empiezaA = nombreA.startsWith(termino);
        const empiezaB = nombreB.startsWith(termino);
        if (empiezaA && !empiezaB) return -1;
        if (empiezaB && !empiezaA) return 1;
        
        // Contiene el término en el nombre
        const contieneNombreA = nombreA.includes(termino);
        const contieneNombreB = nombreB.includes(termino);
        if (contieneNombreA && !contieneNombreB) return -1;
        if (contieneNombreB && !contieneNombreA) return 1;
        
        // Por defecto, orden alfabético
        return nombreA.localeCompare(nombreB);
    });

    mostrarResultadosFiltrados(resultados, termino);
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
        <p class="ayuda-filtro">Mostrando los primeros 5 resultados ordenados por relevancia</p>
    `;
    contenidoDiv.appendChild(encabezado);

    // Limitar a 5 resultados
    const objetosLimitados = objetos.slice(0, 5);

    objetosLimitados.forEach(objeto => {
        const elemento = document.createElement('div');
        const esDestacado = objeto.name.toLowerCase().startsWith(termino);
        elemento.className = `objeto-item ${esDestacado ? 'destacado' : ''}`;

        const nombreResaltado = resaltarTexto(objeto.name, termino);

        elemento.innerHTML = `
            <div class="objeto-resultado"  onclick="wiki('${escaparComillas(objeto.name)}', '${escaparComillas(objeto.description)}', '${escaparComillas(objeto.src)}')">
                <div class="objeto-header" >
                    <h3 class="objeto-nombre">${nombreResaltado}</h3>
                </div>
            </div>
        `;
        contenidoDiv.appendChild(elemento);
    });
}

function resaltarTexto(texto, termino) {
    if (!termino) return texto;
    
    // Escapar caracteres especiales en regex
    const terminoEscapado = termino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${terminoEscapado})`, 'gi');
    return texto.replace(regex, '<span class="resaltado">$1</span>');
}

function escaparComillas(texto) {
    return texto.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function mostrarContenido(objetos) {
    const contenidoDiv = document.getElementById('contenido');
    contenidoDiv.innerHTML = '';

    // Limitar a 5 palabras
    const objetosLimitados = objetos.slice(0, 5);

    objetosLimitados.forEach(objeto => {
        const elemento = document.createElement('div');
        elemento.className = 'objeto-item';
        elemento.innerHTML = `
            <div class="objeto-resultado">
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
        <img src="${recurso}" class="recurso-palabra">
    `;
}