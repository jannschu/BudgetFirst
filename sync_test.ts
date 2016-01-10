import Device = require('./sync_prototype');

var D1 = new Device("Frank");
var D2 = new Device("Anna");
var D3 = new Device("Ito");

function print() {
    D1.printState();
    D2.printState();
    D3.printState();
}

function sync() {
    D1.sync();
    D2.sync();
    D3.sync();
}

console.log("## Case 1: Do something on D1, sync it to D2, D3. ##")
var booze = D1.createCategory('Booze', 100);
var jack = D1.createTransaction(booze, -20);

D1.push();
sync();
print();

console.log("\n## Case 2: Do something on D1 and D2, sync both changes. ##") 
D2.edit(jack, 'amount', -23.99);
D1.edit(booze, 'name', 'Bouze');

D1.push();
sync();
print();

console.log("\n## Case 3: Conflict, last-wins ##");
D3.edit(jack, 'amount', -4.99);
D2.edit(jack, 'amount', -10); // this should win
D3.push(); D2.push();
sync();
print();