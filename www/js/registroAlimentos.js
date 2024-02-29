/* Función para cargar alimentos en select*/
function CargarSelectRegistroAlimentos(alimentos){
    const select = document.querySelector("#selectAlimento");
    let listaAlimentos = "";
    alimentos.forEach(alimento => {
        listaAlimentos += `<ion-select-option value="${alimento.id}">${alimento.nombre}</ion-select-option>`;
    });
    select.innerHTML = listaAlimentos;
}

/* Función para detectar opción seleccionada de ion-select en tiempo real y marcar la unidad correspondiente */
function DetectarUnidadSeleccionada(alimentos){
    const select = document.querySelector("#selectAlimento");
    select.addEventListener("ionChange", (evt) => {
        const idAlimento = evt.detail.value;
        const alimento = alimentos.find(alimento => alimento.id == idAlimento);
        /* Obtener el último caracter de porción para saber la unidad */
        const unidad = alimento.porcion.charAt(alimento.porcion.length-1);
        /* Popula campo de texto desabilitado para hacer visible la unidad */
        if(unidad == "g"){
            document.querySelector("#txtUnidad").value = "Gramos";
        } else if (unidad == "u"){
            document.querySelector("#txtUnidad").value = "Unidades";
        } else {
            document.querySelector("#txtUnidad").value = "Mililitros";
        }
    });
}

function ValidarDatosRegistroAlimento(alimento, cantidad, unidad, fecha){
    if(alimento == undefined || alimento == "" || alimento == null){
        throw new Error("Debe ingresar un alimento")
    }
    if(isNaN(cantidad)){
        throw new Error("La cantidad debe ser un número")
    }
    if(cantidad == undefined || cantidad == 0 || cantidad < 0 || cantidad == ""){
        throw new Error("Debe ingresar una cantidad correcta")
    }
    if(unidad != "Gramos" && unidad != "Unidades" && unidad != "Mililitros"){
        throw new Error("Unidad incorrecta")
    }
    if(fecha == undefined || fecha == "" || fecha == null){
        throw new Error("Debe ingresar una fecha")
    }
    //Formato de fecha obtenido del componente calendario: 2024-02-14T15:04:00
    //La variable "fecha" es un string, por lo que se debe convertir a un objeto Date para poder utilizar sus métodos
    fecha = new Date(fecha);
    const hoy = new Date();

    //fecha del día anterior
    let ayer = new Date();
    ayer.setDate(hoy.getDate()-1);

    //Setea horas, minutos y segundos de "ayer" y "fecha" para que sean iguales y poder comparar SOLO la fecha
    ayer.setHours(0,0,0,0);
    fecha.setHours(0,0,0,0);

    if(fecha<ayer){
        throw new Error("La fecha ingresada no puede ser anterior a ayer");
    }
    if(fecha>hoy){
        throw new Error("La fecha ingresada no puede ser posterior a hoy");
    }
}


function AgregarAlimento(){
    //Se limpia mensaje de error de ejecuciones anteriores
    document.querySelector("#mensajeRegistroAlimento").innerHTML = "";

    //se obtiene id de alimento
    const alimento = document.querySelector("#selectAlimento").value;
    const cantidad = document.querySelector("#txtCantidad").value;
    const unidad = document.querySelector("#txtUnidad").value;
    const fecha = document.querySelector("#calendario").value;
    try{
        ValidarDatosRegistroAlimento(alimento, cantidad, unidad, fecha);
        FetchAgregarAlimento(alimento, cantidad, fecha);
    }catch(error){
        console.error(error.message);
        document.querySelector("#mensajeRegistroAlimento").innerHTML = error.message;
    }
}


function FetchAgregarAlimento(alimento, cantidad, fecha){
    let key = localStorage.getItem("apiKey");
    let idUser = localStorage.getItem("apiId");
    let registro = {
        idAlimento: alimento,
        idUsuario: idUser,
        cantidad: cantidad,
        fecha: fecha
    }
    fetch(`${API_URL_BASE}/registros.php`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apiKey": key,
            "idUser": idUser
        },
        body: JSON.stringify(registro)
    })
    .then((response) => {
        (response.status);
        if(response.status == 200){
            return response.json();
        }
        if(response.status == 401){
            setTimeout(() => {
                /* Esperar un segundo y cerrar sesión */
                CerrarSesion();
            }, 1000);
            return Promise.reject({error: response.status, msj: "Debe iniciar sesión para continuar"}) 
        }
        return Promise.reject({error: response.status, msj: "Error al comunicarse con el servidor"})
    })
    .then((data)=>{
        if(data.codigo == 200){
            RegistroAlimentoExitoso();
            /* Actualizar lista de registros para evitar delay en caso de que el usuario vaya a la pantalla principal */
            FetchListaRegistros(alimentos);
        }
    })
    .catch((e) => {
        console.error(e.msj);
        document.querySelector("#mensajeRegistroAlimento").innerHTML = e.msj;
    });
}

function RegistroAlimentoExitoso(){
    document.querySelector("#txtCantidad").value = "";
    document.querySelector("#mensajeRegistroAlimento").innerHTML = "Alimento registrado correctamente"
}

function LimpiarCampos(){
    document.querySelector("#mensajeRegistroAlimento").innerHTML = "";
}
