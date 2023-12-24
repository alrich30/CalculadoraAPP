/*Logica de App Calculadora*/ 

//Atributos


let isThereMoreThanOneCharacter = false;
let isOperationDone = false;
let isThereAnError = false;
let currentText = $('#numbers').text();
const socket = io();



//funciones
    
/* Esta funcion sirve para mostrar los caracteres en la caja de resultado, producto de presionar
los diferentes botones que hay en la calculadora.*/     
function añadirCaracteres(nuevoCaracter) {

    
    let lastCharacter = currentText[currentText.length - 1];

    if (isThereAnError === true){
        // Si se esta mostrando el mensaje "error" en la calculadora no dejara que siga funcionando
        // hasta que se pulse la tecla "AC"
        return;

    } else if (['-', '*', '+', '/'].includes(lastCharacter) && ['-', '*', '+', '/'].includes(nuevoCaracter)) {
        // Si el usuario intenta ingresar dos operadores aritméticos de manera seguida,
        // el segundo no se generará 
        return;      
    
    }else if (currentText.length == 20){
        
        // Si la barra de resultado se llena, la funcion dejara de 
        // imprimir generar nuevos caracteres
        return;
    
    } else if (currentText === '0' && ['-', '*', '+', '/'].includes(nuevoCaracter)) {

        // Si solo hay hay un caracter que es "0" y
        // si el siguiente caracter es un simbolo matematico, comenzar a acumular.
        isThereMoreThanOneCharacter = true;
        currentText += nuevoCaracter; 
        
    } else if( isThereMoreThanOneCharacter === true || (isOperationDone === true && currentText !== '0')) {
        
        // Si hay mas de un caracter, comenzara a acumular caracteres dentro de la variable currentText
        // Si se ha realizado un operacion y ha dado un valor diferente a '0', tambien comenzara a acumular.
        isOperationDone === false;
        currentText += nuevoCaracter;

    } else if (['1', '2', '3', '4', '5','6','7','8','9','(',')'].includes(nuevoCaracter) || (isOperationDone === true && currentText === '0')){
        
        // Si es el primer caracter es 0, hacer que el primer caracter sea el valor del caracter nuevo
        // Si se ha realizado una operacion y ha dado un valor igual a '0', el nuevo caracter pasará a ser el primero en acumularse

        isOperationDone = false;
        isThereMoreThanOneCharacter = true;
        currentText = nuevoCaracter;

    } 
    // Actualizar el texto en el elemento con ID "numbers"
    $('#numbers').text(currentText);
    
    // Esta funcion hace que se envie un evento llamado "actualizarCaracteres" desde el 
    //cliente al servidor con los caracteres actualizados en la variable "currentText"
    socket.emit('actualizarCaracteres', currentText);
}


/*Esta funcion tiene la tarea de borrar los caracteres que hay en la caja de resultado*/ 

function borrarCaracteres(){

    // Si solo hay un caracter al momento de utilizarse este metodo, el almacenador de caracteres
    // se volvera "0".
    if(currentText.length == 1){
        currentText = '0';
        isThereMoreThanOneCharacter = false;
        $('#numbers').text(currentText);
        socket.emit('caractersDeleted', currentText);

    // Borrar el texto "error" de la calculadora y actualizarlo a "0" 
    } else if(isThereAnError === true) {
        isThereAnError = false;
        isThereMoreThanOneCharacter = false;
        currentText = '0';
        $('#numbers').text(currentText);
        socket.emit('reiniciarCalculadora', currentText);

    // Borrar todos los caracteres a la vez si hay mas de un caracter acumulado y 
    // se ha realizado una operacion matematica  
    } else if(isOperationDone === true){
        currentText = '0';
        isOperationDone = false;
        $('#numbers').text(currentText);
        socket.emit('borrarTodoslosCaracteres', currentText);

    // Borrar los caracteres uno a uno si hay mas de un caracter acumulado y 
    // se ha realizado una operacion matematica.  
    } else {
        currentText = currentText.slice(0, -1);
        $('#numbers').text(currentText);
        socket.emit('borrarUltimoCaracter', currentText);
    }
} 

/* Esta funcion se encargara de realizar las operaciones matematicas, usando la funcion eval() para
transformar el String en un resultado matematico, y luego convertir este de nuevo a formato String. */
function result() {

    // Si la funcion eval() puede resolver la operacion matematica, esta se mostrara en la calculadora
    try {
        let evalResultado = eval(currentText);
        currentText = evalResultado.toString();
        isOperationDone = true; 
        isThereMoreThanOneCharacter = false;
        $('#numbers').text(currentText);
        socket.emit('getResultado', currentText);

        // Si la operacion al evaluarla da un resultado matematico erroneo, se mostrara el texto "error"
        // en la calculadora
    } catch {
        currentText = "error";
        isThereAnError = true;
        $('#numbers').text(currentText);
        socket.emit('getError', currentText)
    }
}


