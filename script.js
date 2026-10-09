const cocaZero = "Coca-Cola Zero";
let estoquecocaZero = 36;
const estoquemincocaZero = 9;

const agua = "Água s/ Gás"
let estoqueAgua = 3;
const estoqueminAgua = 12;

if (estoquecocaZero <= estoquemincocaZero){
    console.log("Comprar urgente: " + cocaZero);
}
else if (estoquecocaZero <=16){
    console.log("Pedir ao fornecedor:  " + cocaZero);
}
else {
    console.log("Estoque suficiente de: " + cocaZero);
}

console.log("Quantidade atual de: " + cocaZero , estoquecocaZero);

if (estoqueAgua <= estoqueminAgua){
    console.log("Comprar urgente: " + agua);
}
else if (estoqueAgua <=24){
    console.log("Pedir ao fornecedor: " + agua);
}
else{
    console.log("Estoque suficiente de" + agua);
}

console.log("Quantidade atual de:  " + agua , estoqueAgua);