/* 
    Función recibe copia local de lista de alimentos para pasárselo a CargarTarjetas en caso de que
    petición sea 200/401
*/
function FetchListaRegistros(alimentos){
    let key = localStorage.getItem("apiKey");
    let idUser = localStorage.getItem("apiId");
    fetch(`${API_URL_BASE}/registros.php?idUsuario=${idUser}`,{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "apiKey": key,
            "idUser": idUser,
        }
    })
    .then((response) => {
        if(response.status == 200 || response.status == 401){
            return response.json();
        }
        return Promise.reject({error: response.status, msj: "Error al comunicarse con el servidor"});
    })
    .then((data)=>{
        if(data.codigo == 200){
            registros = data.registros;
            CargarTarjetas(data.registros, alimentos);
        }
        if(data.codigo == 401){
            /* No autorizado, cerrar sesión y redirigir a login */
            setTimeout(() => {
                /* Esperar un segundo y cerrar sesión */
                CerrarSesion();
            }, 1000);
            return Promise.reject({error: response.status, msj: "Debe iniciar sesión para continuar"}) 
        }
    })
    .catch((error) => {
        document.querySelector("#mensajeListado").value = "";
        document.querySelector("#mensajeListado").innerHTML = error.message;
        console.error(error.message);
    });
};


/* 
    Carga ion-cards en interfaz, recibe la lista de registros obtenida desde la API y una copia de la lista de alimentos
    de esta forma se puede obtener datos sobre cada alimento consumido sin consumir su respectiva API nuevamente
*/
function CargarTarjetas(lista, alimentos){
    const content = document.querySelector("#contenidoTarjetas");
    
    if(lista.length == 0 || lista == undefined || lista == null){
        content.innerHTML = "No tienes alimentos registrados hasta el momento";
        return;
    }
    let tarjetas = ``;

    lista.forEach(registro => {
        const URLimagen = ObtenerImagenAlimento(registro.idAlimento, alimentos);
        const nombreAlimento = ObtenerNombreAlimento(registro.idAlimento, alimentos);
        const calorias = ObtenerCaloriasAlimento(registro, registro.idAlimento, alimentos);

        tarjetas += `
        <ion-card id=${registro.id}>
            <img src="${URLimagen}" />
            <ion-card-header>
                <ion-card-title>${nombreAlimento}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
                <p>Calorías: ${calorias}</p>
                <ion-button onclick='EliminarRegistro("${registro.id}")'>Eliminar registro</ion-button>
            </ion-card-content>
        </ion-card>`;
    });

    content.innerHTML = tarjetas;
}


/* 
    idAlimento: id del alimento a obtener el nombre
    alimentos: array (copia local) de alimentos
    retorna: id/url de imagen a cargar + formato de la misma, ej: 1.png
*/
function ObtenerImagenAlimento(idAlimento, alimentos){
    let img= ``;
    alimentos.forEach(alimento => {
        if(alimento.id == idAlimento){
            img = `${API_URL_IMG}${alimento.imagen}.png`;
        }
    });
    return img;
}


/* 
    idAlimento: id del alimento a obtener el nombre
    alimentos: array (copia local) de alimentos
*/
function ObtenerNombreAlimento(idAlimento, alimentos){
    let nombre = "";
    alimentos.forEach(alimento => {
        if(alimento.id == idAlimento){
            nombre = alimento.nombre;
        }
    });
    return nombre;
}

/* 
    registro: lista de alimentos consumidos por usuario 
    idAlimento: id del alimento del registro
    alimentos: lista de alimentos (copia local)
*/
function ObtenerCaloriasAlimento(registro, idAlimento, alimentos){
    let calorias = 0;
    alimentos.forEach(alimento => {
        if(alimento.id == idAlimento){ 
            /* 
                Calorías se calculan con regla de tres, teniendo en cuenta: porción, cal. X porción y cant. que comió.
                También se debe extraer el último caracter de porción ya que contiene la unidad
                Se usa Math.round para redondear el resultado en caso de que sea decimal
            */   
            calorias = Math.round((alimento.calorias * registro.cantidad) / alimento.porcion.slice(0, -1));
        }
    });
    return calorias;
}

/* 
    Elimina registro de copia local y envía DELETE a api
*/
function EliminarRegistro(idRegistro){
    let key = localStorage.getItem("apiKey");
    let idUser = localStorage.getItem("apiId");
    fetch(`${API_URL_BASE}/registros.php?idRegistro=${idRegistro}`,{
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "apiKey": key,
            "idUser": idUser,
        }
    })
    .then((response) => {
        if(response.status == 200 || response.status == 401){
            return response.json();
        }
        return Promise.reject({error: response.status, msj: "Error al comunicarse con el servidor"});
    })
    .then((data)=>{
        if(data.codigo == 200){
            /* Funcion que elimina registro de la copia local */
            EliminarRegistroLocal(idRegistro);
            EliminarExitoso(idRegistro);
        }
        if(data.codigo == 401){
            /* No autorizado, cerrar sesión y redirigir a login */
            setTimeout(() => {
                /* Esperar un segundo y cerrar sesión */
                CerrarSesion();
            }, 1000);
            return Promise.reject({error: response.status, msj: "Debe iniciar sesión para continuar"}) 
        }
        if(data.codigo == 404){
            /* Registro no existe en servidor o no corresponde al usuario */
            document.querySelector("#mensajeListado").innerHTML = "Registro no encontrado";
        }
    })
}

/* 
    Una vez confirmada la eliminación del registro desde api y array muestra mensaje de confirmación
*/
function EliminarExitoso(idRegistro){
    document.getElementById(`${idRegistro}`).innerHTML = "Registro eliminado correctamente";
    const content = document.querySelector("#contenidoTarjetas");
    
    setTimeout(() => {
        /* 
            Esperar un segundo y eliminar la tarjeta,
            remove() borra elemento del DOM: https://developer.mozilla.org/en-US/docs/Web/API/Element/remove
        */
       document.getElementById(`${idRegistro}`).remove();


       if(registros.length === 0 || registros == undefined || registros == null){
           content.innerHTML = "No tienes alimentos registrados hasta el momento";
       }
    }, 1000);
    
}

function LimpiarCamposListado(){
    document.querySelector("#mensajeListado").innerHTML = ``;
}


/* Función que elimina registro del array (copia local) de los registros */
function EliminarRegistroLocal(idRegistro){
    /*  
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
        Filter crea una copia del array con la condición que se le pase como argumento,
        por lo tanto, si se filtra por id diferente al que se quiere eliminar, se obtiene un array sin el registro que se quiere eliminar
    */
    registros = registros.filter(registro => registro.id != idRegistro);
}