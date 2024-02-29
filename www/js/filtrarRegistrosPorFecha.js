/* 
    Variable requerida por componente "ion-datetime" para filtrar registros por fecha
    https://ionicframework.com/docs/api/datetime#customizing-button-elements 
*/
let datetime = document.querySelector("#calendarioFiltrarPorFecha");

function FiltrarRegistrosPorFecha(){
    let contenido = document.querySelector("#contenedorFiltroPorFecha");
    let registrosEntreFechas = '';

    const fechas = datetime.value;
    if (fechas == undefined || fechas == null || fechas.length == 0 ) {
        contenido.innerHTML = "";
        document.querySelector("#mensajeFiltroPorFecha").innerHTML = "Seleccione al menos una fecha";
        return;
    }

    if(fechas.length>=1 && fechas.length<=2){
        /* let fecha1 = new Date(fechas[0]+ "T00:00:00");
        let fecha2 = new Date(fechas[1]+ "T00:00:00"); */

        let fecha1 = fechas[0];
        let fecha2 ="";
        //si hay una sola fecha, fecha 2 es igual a fecha 1 para no romper la compración
        if(fechas.length == 2){
            fecha2 = fechas[1];
        } else {
            fecha2 = fecha1;
        }
        //si fecha 1 es mayor que fecha 2, se intercambian 
        if(fecha1>fecha2){
            let aux = fecha2;
            fecha2 = fecha1;
            fecha1 = aux;
        }
        registros.forEach(registro => {
            if(registro.fecha>=fecha1 && registro.fecha<=fecha2){
                const URLimagen = ObtenerImagenAlimento(registro.idAlimento, alimentos);
                const nombreAlimento = ObtenerNombreAlimento(registro.idAlimento, alimentos);
                const calorias = ObtenerCaloriasAlimento(registro, registro.idAlimento, alimentos);
                registrosEntreFechas += `
                <ion-card id=${registro.id}>
                    <img src="${URLimagen}" />
                    <ion-card-header>
                        <ion-card-title>${nombreAlimento}</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <p>Calorías: ${calorias}</p>
                    </ion-card-content>
                </ion-card>`;
            }
        });
        //Si no hay registros que cumplan con la condición seleccionada
        if(registrosEntreFechas == ""){
            document.querySelector("#mensajeFiltroPorFecha").innerHTML ="";
            contenido.innerHTML = "No hay registros entre las fechas seleccionadas";
        } else {
            contenido.innerHTML = "";
            document.querySelector("#mensajeFiltroPorFecha").innerHTML = "";
            contenido.innerHTML = registrosEntreFechas;
        }
        //Setea fecha del calendario a fecha de hoy
        datetime.value = new Date().toISOString();

    } else {
        document.querySelector("#mensajeFiltroPorFecha").innerHTML = "Seleccione al menos una fecha";
        contenido.innerHTML ="";
    }
}

function LimpiarCamposFecha(){
    document.querySelector("#mensajeFiltroPorFecha").innerHTML = "";
    document.querySelector("#contenedorFiltroPorFecha").innerHTML = "";
}