
/*  Inicio de sesión  */
function Login() {
    try {
        const nombreUsuario = document.querySelector("#txtNombreUsuario").value;
        const password = document.querySelector("#txtPassword").value;

        if (nombreUsuario.trim().length == 0 || password.trim().length == 0) {
            throw new Error("Los datos no son correctos");
        }
        const user = {
            usuario: nombreUsuario,
            password: password
        };
        FetchLogin(user);
    } catch (Error) {
        document.querySelector("#mensajeLogin").innerHTML = `${Error.message}`;
    }
}

function FetchLogin(user){
    const msjLoginP = document.querySelector("#mensajeLogin");
    /* Verificación */
    if(user.email === "" || user.password === ""){
        throw new Error("Los datos están vacíos");
    }

    fetch(`${API_URL_BASE}/login.php`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
    .then((response) => {
        if(response.status == 200 || response.status == 409){
            return response.json();
        }
        return Promise.reject({error: response.status, msj: "Error al comunicarse con el servidor"})
    })
    .then((data) => {
        if(data.codigo=="409"){
            /* Login incorrecto, api retorna 409  */
            LoginIncorrecto();
        }
        if(data.codigo=="200"){
            /* login exitoso */
            localStorage.setItem("apiKey", data.apiKey);
            localStorage.setItem("apiId", data.id);
            localStorage.setItem("apiCaloriasDiarias", data.caloriasDiarias);
            LoginExitoso();
        }
    })
    .catch((error) => {
        (error.response);
        msjLoginP.innerHTML = error.msj;
    });
}

function LoginIncorrecto(){
    /* Informar al usuario y limpiar campos */
    document.querySelector("#mensajeLogin").innerHTML = "Login incorrecto";
    document.querySelector("#txtNombreUsuario").value = "";
    document.querySelector("#txtPassword").value = "";
}

function LoginExitoso(){
    /* Informar al usuario y limpiar campos */
    document.querySelector("#mensajeLogin").innerHTML = "Login exitoso";
    document.querySelector("#txtNombreUsuario").value = "";
    document.querySelector("#txtPassword").value = "";
    /* Esperar 1 segundo para que usuario lea el mensaje y después redireccionar a pantalla pricipal */
    setTimeout(() => {
        RedireccionarUsuario("/");
        ComprobarSiHaySesionActiva();
        document.querySelector("#mensajeLogin").innerHTML = "";
    }, 1000);
}