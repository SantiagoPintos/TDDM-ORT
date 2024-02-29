let map;
let latitudDispositivo = 0;
let longitudDispositivo = 0;

//función invocada desde Navegar() en main.js
function CargarMapaYMarcadores(){
    ObtenerCoordenadas();
    AgregarEstilosMapa("map");
    setTimeout(() => {
        if (map != null) {
            map.remove();
        }
        MostrarMapa(latitudDispositivo, longitudDispositivo, "map");
        CargarMarcadorUsuario();
    }, 2000);
}

//Agrega estilos al div contenedor
function AgregarEstilosMapa(idParrafo){
    const mapa = document.querySelector(`#${idParrafo}`);
    mapa.style.width = "100%";
    mapa.style.height = "75%";
    mapa.style.margin = "auto";
}


function ObtenerCoordenadas(){
    navigator.geolocation.getCurrentPosition(GuardarPosicionDispositivo, MostrarError);
}

function GuardarPosicionDispositivo(posicion) {
    latitudDispositivo = posicion.coords.latitude;
    longitudDispositivo = posicion.coords.longitude;
}

function MostrarError(error) {
    console.error(error.message);
    document.querySelector("#mapaMsj").innerHTML = "No se pudo obtener la ubicación del dispositivo";
}


//zoom=6 es el valor por defecto
function MostrarMapa(latitud, longitud, idParrfo, zoom=6){
    map = L.map(`${idParrfo}`).setView([latitud,longitud], zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}


function CargarMarcadorUsuario(){
    if (map != null) {
        map.remove();
    }
    MostrarMapa(latitudDispositivo, longitudDispositivo, "map");
    const marker = L.marker([latitudDispositivo,longitudDispositivo]).addTo(map);
    marker.bindPopup("<b>Usted está aquí</b>").openPopup();
}
