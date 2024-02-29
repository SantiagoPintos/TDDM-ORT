function MostrarCalculosDeCalorias(){
    CalcularCaloriasTotales();
    CalcularCaloriasDiarias();
}

function CalcularCaloriasTotales(){
    let contenedor = document.querySelector("#contenedorInformeCaloriasTotales");
    
    if(registros.length == 0){
        contenedor.innerHTML = 'No tienes alimentos registrados hasta el momento';
    } else {
        let caloriasTotales = 0;
        registros.forEach(alimento => {
            caloriasTotales += ObtenerCaloriasAlimento(alimento, alimento.idAlimento, alimentos);
        });
        contenedor.innerHTML = `
        <ion-card>
            <ion-card-header>
                <ion-card-title>Calorías totales</ion-card-title>
            </ion-card-header>
        
            <ion-card-content>
                Has ingerido ${caloriasTotales} calorías hasta la fecha.
            </ion-card-content>
        </ion-card>
        `;
    }
}

function CalcularCaloriasDiarias(){
    let contenedor = document.querySelector("#contenedorInformeCaloriasDiarias");
    
    if(registros.length == 0){
        contenedor.innerHTML = 'No tienes alimentos registrados hasta el momento';
    } else {
        let caloriasDiarias = 0;
        const caloriasMaximasDiarias = localStorage.getItem("apiCaloriasDiarias");
        let colorTexto = "";


        const fecha = new Date();
        //Obtiene la fecha en formato ISO, pero en string, así que se usa slpit para quitar la parte de la hora ya que en los registros de la api solo está con fecha
        let fechaHoy = fecha.toISOString().split("T")[0];

        registros.forEach(alimento => {
            if(alimento.fecha == fechaHoy){
                caloriasDiarias += ObtenerCaloriasAlimento(alimento, alimento.idAlimento, alimentos);
            }
        });

        let caloriasConDescuento = caloriasMaximasDiarias*0.9;
        if(caloriasDiarias > caloriasMaximasDiarias){
            colorTexto = "danger";
            ("colorTexto: ",colorTexto);
        } else if (caloriasDiarias >= caloriasConDescuento && caloriasDiarias <= caloriasMaximasDiarias){
            colorTexto = "warning";
            ("colorTexto: ",colorTexto);
        } else {
            colorTexto = "success";
            ("colorTexto: ",colorTexto);
        }

        contenedor.innerHTML = `
        <ion-card>
            <ion-card-header>
                <ion-card-title>Calorías diarias</ion-card-title>
            </ion-card-header>
        
            <ion-card-content>
                <ion-text color="${colorTexto}">Has ingerido ${caloriasDiarias} calorías hoy.</ion-text>
            </ion-card-content>
        </ion-card>
        `;
    }
}
