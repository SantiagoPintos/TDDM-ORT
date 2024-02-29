let latitudDispositivoUsuarios = 0;
let longitudDispositivoUSuarios = 0;

function ObtenerUsuariosPorPais() {
    const cantUsuarios = document.querySelector("#cantUsuarios").value;
    if (cantUsuarios.trim().length == 0 || isNaN(cantUsuarios) || cantUsuarios <= 0) {
        document.querySelector("#mapaMsjCantidadUsuarios").innerHTML = "Ingrese un número válido";
        //Oculta mapa en caso de valor inválido para que no se muestre en caso de que haya una ejecución previa
        document.querySelector("#mapCantidadUsuarios").style.display = "none";
        return;
    }
    if (map != null) {
        map.remove();
    }
    FetchObtenerUsuariosPorPais(cantUsuarios);
}

function FetchObtenerUsuariosPorPais(cantUsuarios){
    //Muestra mapa en caso de que se haya ocultado por un valor inválido previo
    document.querySelector("#mapCantidadUsuarios").style.display = "block";

    const apiKey = localStorage.getItem("apiKey");
    const userId = localStorage.getItem("apiId");

    fetch(`${API_URL_BASE}/usuariosPorPais.php`,{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "apiKey": apiKey,
            "idUser": userId
        }
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
            VerificarCantidadUsuarios(data.paises, cantUsuarios)
        }
    })
    .catch((error) => {
        (error.response);
        document.querySelector("#mapaMsjCantidadUsuarios").innerHTML = error.message;
    });
}


function VerificarCantidadUsuarios(paises, cantUsuarios){
    let paisesConMasUsuarios = [];

    //Se recorre la lista de países y se verifica si la cantidad de usuarios es mayor a la ingresada por el usuario
    paises.forEach(pais => {
        if(pais.cantidadDeUsuarios > cantUsuarios){
            let encontrado = false;
            //Recorre lista de países almacenados en el registro, cuando encuentra id de país, lo agrega a la lista
            //esto se hace porque API usuariosPorPais retorna mas países que API paises 
            for(let i = 0; !encontrado && i<listaPaisesRegistro.length; i++){
                if(pais.id == listaPaisesRegistro[i].id){
                    //se crea nueva variable para no modificar la lista original
                    let paisAGuardar = listaPaisesRegistro[i];

                    //Se agrega la cantidad de usuarios al objeto país antes de pushearlo al nuevo array, de esta manera podemos acceder a la cantidad de usuarios
                    paisAGuardar.cantidadDeUsuarios = pais.cantidadDeUsuarios;
                    paisesConMasUsuarios.push(paisAGuardar);
                    encontrado = true;
                }
            }
        }
    });
    if(paisesConMasUsuarios.length > 0){
        //Si hay países con más usuarios, se muestra el mapa
        MostrarMapaUsuarios(paisesConMasUsuarios);
        MostrarMarcadoresPaises(paisesConMasUsuarios);
        document.querySelector("#mapaMsjCantidadUsuarios").innerHTML = "Estos son los países con más usuarios, seleccione el país para ver la cantidad";
    } else {
        document.querySelector("#mapaMsjCantidadUsuarios").innerHTML = "No hay países con más usuarios que la cantidad ingresada";
    }
}

function MostrarMapaUsuarios(paises){
    (paises);
    AgregarEstilosMapa("mapCantidadUsuarios");
    let coordenadas = [];
    //Si hay más de un país, se muestra el mapa en el centro de latam
    if(paises.length > 1){
        coordenadas = [
            longitud = -18.58,
            latitud = -60.49
        ];
    } else {
        coordenadas = [
            latitud = paises[0].latitude, 
            longitud = paises[0].longitude
        ];
    }

    //coordenadas[0] = latitud; coordenadas[1] = longitud
    MostrarMapa(coordenadas[0], coordenadas[1], "mapCantidadUsuarios", 3);
}

function MostrarMarcadoresPaises(paises){
    if (map != null) {
        map.remove();
    }
    MostrarMapaUsuarios(paises);

    for(let i=0; i<paises.length; i++){
        let pais = paises[i];
        L.marker([pais.latitude,pais.longitude]).addTo(map).bindPopup(`<b>${pais.name} tiene ${pais.cantidadDeUsuarios} usuarios</b>`);
    }
}   

function LimpiarCamposMapaUsuarios(){
    document.querySelector("#cantUsuarios").value = "";
    document.querySelector("#mapaMsjCantidadUsuarios").innerHTML = "";
    document.querySelector("#mapCantidadUsuarios").value = "";
}