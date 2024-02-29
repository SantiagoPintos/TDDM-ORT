const API_URL_BASE = `https://calcount.develotion.com/`;
const API_URL_IMG = `https://calcount.develotion.com/imgs/`;
const ruteo = document.querySelector("#ruteo");
/* 
    registros es una variable global que almacena una copia de los registros recibidos desde la api, es utilizada para renderizar registros en varios lugares
    de la aplicación sin tener que consultar a la api nuevamente, tambíen es modificada cada vez que el usuario agrega o elimina un registro.
*/
let registros = [];
/* 
    alimentos es una variable global que almacena una copia de los alimentos recibidos desde la api.
*/
let alimentos = [];

/* 
    array que almacena la lista de posibles países para el registro de usuarios
*/
let listaPaisesRegistro = [];


Inicializar();

function Inicializar() {
    OcultarPantallas();
    AgregarEventos();
    ComprobarSiHaySesionActiva();
}

function OcultarPantallas() {
    let pantallas = document.querySelectorAll(".ion-page");
    for (let i = 1; i < pantallas.length; i++) {
        pantallas[i].style.display = "none";
    }
}

function CerrarMenu() {
    document.querySelector("#menu").close();
}

function AgregarEventos() {
    ruteo.addEventListener("ionRouteWillChange", Navegar);
    document.querySelector("#btnLogin").addEventListener("click", Login);
    document.querySelector("#btnRegistro").addEventListener("click", Registro);
    document.querySelector("#btnLogout").addEventListener("click", CerrarSesion);
    document.querySelector("#btnRegistrarAlimento").addEventListener("click", AgregarAlimento);
    document.querySelector("#btnFiltrarRegistrosPorFecha").addEventListener("click", FiltrarRegistrosPorFecha);
    document.querySelector("#btnCantidadUsuarios").addEventListener("click", ObtenerUsuariosPorPais);
}

function Navegar(evt) {
    OcultarPantallas();
    switch (evt.detail.to) {
        case "/":
            FetchPaises();
            FetchListaAlimentos();
            LimpiarCamposListado();
            document.querySelector("#inicio").style.display = "block";
            break;
        case "/login":
            document.querySelector("#login").style.display = "block";
            break;
        case "/filtrarFecha":
            LimpiarCamposFecha();
            document.querySelector("#filtrarFecha").style.display = "block";
            break;
        case "/informeCalorias":
            MostrarCalculosDeCalorias();
            document.querySelector("#informeCalorias").style.display = "block";
            break;
        case "/registro":
            document.querySelector("#registro").style.display = "block";
            break;
        case "/logout":
            document.querySelector("#logout").style.display = "block";
            break;
        case "/registroAlimento":
            LimpiarCampos();
            document.querySelector("#registroAlimento").style.display = "block";
            break;
        case "/mapa":
            CargarMapaYMarcadores();
            document.querySelector("#mapa").style.display = "block";
            break;
        case "/mapaUsuarios":
            LimpiarCamposMapaUsuarios();
            document.querySelector("#mapaUsuarios").style.display = "block";
            break;            
        default:
            document.querySelector("#registro").style.display = "block"; 
            break;
    }
}

/* Función que se ejecuta al inicio de la app para verificar si existe una sesión activa */
function ComprobarSiHaySesionActiva(){
    const apiKey = localStorage.getItem("apiKey");
    if(apiKey != null && apiKey != undefined && apiKey != ""){
        /* Si existe una sesión activa, redirigir a la pantalla de logout */
        RedireccionarUsuario("/");
        MostrarOpcionesUsuarioLogueado();
    } else {
        RedireccionarUsuario("/login");
        MostrarOpcionesUsuarioNoLogueado();
    }
}

/* Función para redireccionar usuario a donde sea necesario */
function RedireccionarUsuario(url){
    ruteo.push(url);
}


/* Funciones para mostrar/ocultar opciones del menú correspondientes a usuarios logueados/no logueados */
function MostrarOpcionesUsuarioLogueado(){
    const opcionesLogueado = document.querySelectorAll(".logueado");
    const opcionesNoLogueado = document.querySelectorAll(".noLogueado");
    opcionesLogueado.forEach(opcion => {
        opcion.style.display = "block";
    });
    opcionesNoLogueado.forEach(opcion => {
        opcion.style.display = "none";
    });
}
function MostrarOpcionesUsuarioNoLogueado(){
    const opcionesLogueado = document.querySelectorAll(".logueado");
    const opcionesNoLogueado = document.querySelectorAll(".noLogueado");
    opcionesLogueado.forEach(opcion => {
        opcion.style.display = "none";
    });
    opcionesNoLogueado.forEach(opcion => {
        opcion.style.display = "block";
    });
}

function CerrarSesion(){
    registros = [];
    alimentos = [];
    localStorage.clear();
    document.querySelector("#mensajeLogout").innerHTML = "Sesión cerrada";
    setTimeout(() => {
        RedireccionarUsuario("/login");
        ComprobarSiHaySesionActiva();
        document.querySelector("#mensajeLogout").innerHTML = "";
    }, 1000);
}

/* 
    Función para obtener lista de alimentos, se invoca al cargar la aplicación porque de esta manera nos permite obtener la lista de alimentos y las id de imágenes necesarias para 
    cargar las tarjetas de alimentos en la pantalla de inicio 
*/
function FetchListaAlimentos(){
    const key = localStorage.getItem("apiKey");
    const idUser = localStorage.getItem("apiId");

    fetch(`${API_URL_BASE}/alimentos.php`,{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "apiKey": key,
            "idUser": idUser
        },
    })
    .then((response) => {
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
    .then((data) => {
        if(data.codigo=="200"){
            /* Cargar alimentos */
            alimentos = data.alimentos;
            FetchListaRegistros(data.alimentos);
            CargarSelectRegistroAlimentos(data.alimentos);
            DetectarUnidadSeleccionada(data.alimentos);
        }   
    })
    .catch((e) => {
        document.querySelector("#mensajeRegistroAlimento").innerHTML = e.message;
    })
}


/* 
    Función para obtener lista de registros, se invoca al cargar la aplicación para obtener la lista de registros
*/
function FetchPaises(){
    fetch(`${API_URL_BASE}/paises.php`,{
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then((response) => {
        if(response.status == 200){
            return response.json();
        }
        return Promise.reject({error: response.status, msj: "Error al comunicarse con el servidor"})
    })
    .then((data) => {
        if(data.codigo=="200"){
            /* Cargar select */
            CargarSelectPaises(data.paises);
            listaPaisesRegistro = data.paises;
        } else {
            throw new Error("Error al cargar los países");
        }   
    })
    .catch((e) => {
        document.querySelector("#mensajeRegistro").innerHTML = e.msj;
    })
}
