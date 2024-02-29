
/* Registro de usuario */
function CargarSelectPaises(paises){
    /* Función invocada desde FetchPaises que se encarga de popular el select de países en la pantalla de registro */
    const select = document.querySelector("#selectPaises");
    let listaPaises = "";
    paises.forEach(pais => {
        listaPaises += `<ion-select-option value="${pais.id}">${pais.name}</ion-select-option>`;
    });
    select.innerHTML = listaPaises;
}

function Registro(){
    try{
        const usuario = document.querySelector("#txtUsuario").value;
        const password = document.querySelector("#txtPasswordRegistro").value;
        const pais = document.querySelector("#selectPaises").value;
        const calorias = document.querySelector("#txtCalorias").value;
        ValidarDatosRegistro(usuario, password, pais, calorias);
        const user = {
            usuario: usuario,
            password: password,
            idPais: pais,
            caloriasDiarias: calorias
        };
        FetchRegistro(user);
    } catch (error){
        document.querySelector("#mensajeRegistro").innerHTML = error.message;
    }
}

function ValidarDatosRegistro(usuario, password, pais, calorias) {
    if (usuario.trim().length == 0) {
        throw new Error("El nombre es requerido");
    }
    if (password.trim().length < 5) {
        throw new Error("La password debe tener como minimo 5 caracteres");
    }
    if (pais === undefined || pais.trim().length == 0){
        throw new Error("El país es requerido");
    }
    if (pais <= 11 || pais >= 239){
        throw new Error("El país no es válido");
    }
    if (calorias.trim().length == 0) {
        throw new Error("Las calorias son requeridas");
    }
    if(calorias < 0){
        throw new Error("Las calorias no pueden ser negativas");
    }
}

function FetchRegistro(usuario){
    fetch(`${API_URL_BASE}/usuarios.php`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(usuario)
    })
    .then((response) => {
        if(response.status == 200 || response.status == 409){
            return response.json();
        }
        return Promise.reject({error: response.status, msj: "Error al comunicarse con el servidor"})
    })
    .then((data)=>{
        if(data.codigo == 200){
            /* Registro exitoso */
            localStorage.setItem("apiKey", data.apiKey);
            localStorage.setItem("apiId", data.id);
            RegistroExitoso();
        }
        if(data.codigo == 409){
            /* Usuario ya existe */
            RegistroUsuarioExiste();
        }
    })
    .catch((e) => {
        document.querySelector("#mensajeRegistro").innerHTML = e.msj;
    });
}

function RegistroExitoso(){
    document.querySelector("#mensajeRegistro").innerHTML = "Registro exitoso";
    document.querySelector("#txtUsuario").value = "";
    document.querySelector("#txtPasswordRegistro").value = "";
    document.querySelector("#selectPaises").value = "";
    document.querySelector("#txtCalorias").value = "";

    setTimeout(() => {
        RedireccionarUsuario("/");
        ComprobarSiHaySesionActiva();
        document.querySelector("#mensajeLogin").innerHTML = "";
    }, 1000);
}

function RegistroUsuarioExiste(){
    document.querySelector("#mensajeRegistro").innerHTML = "Ya existe un usuario con ese nombre";
    document.querySelector("#txtUsuario").value = "";
    document.querySelector("#txtPasswordRegistro").value = "";
    document.querySelector("#selectPaises").value = "";
    document.querySelector("#txtCalorias").value = "";
}