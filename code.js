let listaObjetos = [];
let categoriaActual = 'todas';

filter();

function filter() {
    fetch('palabras.json')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            listaObjetos = data;
            mostrarContenido(listaObjetos);
            configurarFiltro();
            configurarCategorias();
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

function configurarCategorias() {
    const botonesCategorias = document.querySelectorAll('.categoria-btn');
    
    botonesCategorias.forEach(boton => {
        boton.addEventListener('click', function() {
            botonesCategorias.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            categoriaActual = this.dataset.categoria;
            
            const inputBusqueda = document.getElementById('busqueda');
            if (inputBusqueda) {
                inputBusqueda.value = '';
            }
            
            filtrarPorCategoria(categoriaActual);
        });
    });
}

function filtrarPorCategoria(categoria) {
    if (categoria === 'todas') {
        mostrarContenido(listaObjetos);
        return;
    }
    
    const resultados = listaObjetos.filter(obj => obj.categoria === categoria);
    mostrarResultadosCategoria(resultados, categoria);
}

function filtrarPalabras(termino) {
    if (!termino) {
        filtrarPorCategoria(categoriaActual);
        return;
    }

    let objetosFiltrados = listaObjetos;
    
    // Si hay una categoría seleccionada (que no sea 'todas'), filtrar por ella primero
    if (categoriaActual !== 'todas') {
        objetosFiltrados = listaObjetos.filter(obj => obj.categoria === categoriaActual);
    }
    
    const resultados = objetosFiltrados.filter(obj => {
        const nombre = obj.name.toLowerCase();
        const descripcion = obj.description.toLowerCase();
        const id = obj.id.toLowerCase();
        
        return nombre.includes(termino) || 
               descripcion.includes(termino) || 
               id.includes(termino);
    });

    resultados.sort((a, b) => {
        const nombreA = a.name.toLowerCase();
        const nombreB = b.name.toLowerCase();
        
        if (nombreA === termino && nombreB !== termino) return -1;
        if (nombreB === termino && nombreA !== termino) return 1;
        
        const empiezaA = nombreA.startsWith(termino);
        const empiezaB = nombreB.startsWith(termino);
        if (empiezaA && !empiezaB) return -1;
        if (empiezaB && !empiezaA) return 1;
        
        const contieneNombreA = nombreA.includes(termino);
        const contieneNombreB = nombreB.includes(termino);
        if (contieneNombreA && !contieneNombreB) return -1;
        if (contieneNombreB && !contieneNombreA) return 1;
        
        return nombreA.localeCompare(nombreB);
    });

    mostrarResultadosFiltrados(resultados, termino);
}

function mostrarResultadosCategoria(objetos, categoria) {
    const contenidoDiv = document.getElementById('contenido');
    contenidoDiv.innerHTML = '';

    const nombreCategoria = {
        'cuerpo': 'Cuerpo Humano',
        'hogar': 'Hogar',
        'naturaleza': 'Naturaleza',
        'alimentos': 'Alimentos',
        'verbos': 'Acciones/Verbos',
        'familia': 'Familia',
        'emociones': 'Emociones',
        'tiempo': 'Tiempo'
    };

    const encabezado = document.createElement('div');
    encabezado.className = 'resultados-header';
    encabezado.innerHTML = `
        <p>Categoría: <strong>${nombreCategoria[categoria] || categoria}</strong></p>
        <p>Se encontraron <strong>${objetos.length}</strong> palabras en esta categoría</p>
    `;
    contenidoDiv.appendChild(encabezado);

    const objetosLimitados = objetos.slice(0, 10);

    objetosLimitados.forEach(objeto => {
        const elemento = document.createElement('div');
        elemento.className = 'objeto-item';

        elemento.innerHTML = `
            <div class="objeto-resultado" onclick="wiki('${escaparComillas(objeto.name)}', '${escaparComillas(objeto.description)}', '${escaparComillas(objeto.src)}', true)">
                <div class="objeto-header">
                    <h3 class="objeto-nombre">${objeto.name}</h3>
                </div>
            </div>
        `;
        contenidoDiv.appendChild(elemento);
    });
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
    `;
    contenidoDiv.appendChild(encabezado);

    const objetosLimitados = objetos.slice(0, 10);

    objetosLimitados.forEach(objeto => {
        const elemento = document.createElement('div');
        const esDestacado = objeto.name.toLowerCase().startsWith(termino);
        elemento.className = `objeto-item ${esDestacado ? 'destacado' : ''}`;

        const nombreResaltado = resaltarTexto(objeto.name, termino);

        elemento.innerHTML = `
            <div class="objeto-resultado"  onclick="wiki('${escaparComillas(objeto.name)}', '${escaparComillas(objeto.description)}', '${escaparComillas(objeto.src)}', true)">
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

    const objetosLimitados = objetos.slice(0, 10);

    objetosLimitados.forEach(objeto => {
        const elemento = document.createElement('div');
        elemento.className = 'objeto-item';
        elemento.innerHTML = `
            <div class="objeto-resultado"  onclick="wiki('${escaparComillas(objeto.name)}', '${escaparComillas(objeto.description)}', '${escaparComillas(objeto.src)}', true)">
                <div class="objeto-header">
                    <h3 class="objeto-nombre">${objeto.name}</h3>
                </div>
            </div>
        `;
        contenidoDiv.appendChild(elemento);
    });
}

function wiki(nombre, contenido, recurso, titulovisible) {
    let letrasHTML = '<div class="letras-contenedor">';
    for (let i = 0; i < nombre.length; i++) {
        const letra = nombre[i].toLowerCase();
        if (letra.match(/[a-záéíóúñ]/)) {
            letrasHTML += `<img src="sources/${letra}.jpg" class="letra-imagen" alt="${letra}">`;
        } else if (letra === ' ') {
            letrasHTML += '<span class="letra-espacio"></span>';
        }
    }
    letrasHTML += '</div>';
    

    if(titulovisible == true) {
    document.getElementById("contenido-informacion").innerHTML = `
        <h1 class="titulo-palabra">${nombre}</h1>
        <hr>
        <div id="descripcion-contenedor">
            <p class="contenido-palabra">${contenido}</p>
        </div>
        
        ${letrasHTML}
    `;
    } else {
    document.getElementById("contenido-informacion").innerHTML = `
        <h1 class="titulo-palabra">Abecedario</h1>
        <hr>
        <video src="sources/video.mp4" controls></video>
        <div id="descripcion-contenedor">
            <p class="contenido-palabra">${contenido}</p>
        </div>
        
        ${letrasHTML}
    `;
    }
}

function video() {
    wiki("abcdefghijklnmñopqrstuvwkyz", "", "", false);
}