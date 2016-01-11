// This is a hackish prototype.

function copy(obj: Object) {
    var copy = {};
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
            copy[attr] = obj[attr];
        }
    }
    return copy;
}

class VectorClock {
    private vector: {[id: string]: number};
    
    get length() : number {
        return this.devices.length;
    }

    get(device: string) {
        return this.vector[device];
    }
    
    set(device: string, val: number) {
        this.vector[device] = val;
    }

    constructor(private devices: string[]) {
        this.vector = {};
        devices.forEach((device) => {
           this.vector[device] = 0; 
        });
    }

    isBefore(b: VectorClock) : boolean {
        var foundStrictLess = false;
        for (var i = 0; i < this.devices.length; ++i) {
            var device = this.devices[i];
            if (this.get(device) > b.get(device)) {
                return false;
            }
            if (this.get(device) < b.get(device)) {
                foundStrictLess = true;
            }
        }
        return foundStrictLess;
    }
    
    inc(deviceId: string, vc?: VectorClock) {
        this.set(deviceId, this.get(deviceId) + 1);
        if (vc) {
            this.devices.forEach((device) => {
                this.set(device, Math.max(vc.get(device), this.get(device)));
            });
        }
    }
    
    copy() : VectorClock {
        var vc = new VectorClock(this.devices);
        this.devices.forEach((device) => {
            vc.set(device, this.get(device));
        });
        
        return vc;
    } 
}

var globalTime = 0;
abstract class Operation {
    id: number;
    vc: VectorClock;
    timestamp: number;
    
    constructor(public deviceId: string, public data: any) {
        this.timestamp = ++globalTime;
        this.id = this.timestamp; // Prototype
    }
    
    isBefore(op: Operation) : boolean {
        return this.vc.isBefore(op.vc);
    }
}

class CreateOperation extends Operation {
    
}

class UpdateOperation extends Operation {
    constructor(deviceId: string, public entity_id: string, public key: string, data: any) {
        super(deviceId, data);
    }
}

class ConcurrentOperationsSet {
    private operations: UpdateOperation[] = [];
    
    push(op: UpdateOperation) {
        this.operations.push(op);
    }
    
    get isEmpty() {
        return this.operations.length == 0;
    }
    
    getLast() {
        if (this.isEmpty) {
            throw new TypeError('there are no operations in this set');
        }
        var last = this.operations[0];
        for (var i = 1; i < this.operations.length; ++i) {
            var op = this.operations[i];
            if (op.timestamp > last.timestamp) {
                last = op;
            }
            else if (op.timestamp == last.timestamp) {
                last = op.deviceId < last.deviceId ? op : last;
            }
        }
        return last;
    }
}

class OperationList {
    private operations: Operation[];
    
    constructor(operations: Operation[]) {
        this.operations = [];
        this.sort(operations)
    }
    
    forEachCreateOperation(f: (op: CreateOperation) => void) {
        this.operations.forEach(function(op) {
            if (op instanceof CreateOperation) {
                f(op);
            }
        })
    }
    
    getLastUpdateDiffs(entity_id: string, key: string) : ConcurrentOperationsSet {
        // This is O(n)
        var diffs = new ConcurrentOperationsSet();
        var last: UpdateOperation = undefined;
        for (var i = this.operations.length - 1; i >= 0; --i) {
            var op = this.operations[i];
            if (op instanceof UpdateOperation && op.entity_id == entity_id && op.key == key) {
                if (!last) {
                    last = op;
                    diffs.push(op);
                } else if (!op.isBefore(last)) {
                    diffs.push(op);
                }
            }
        }
        return diffs;
    }
    
    getChangedEntities() {
        var entities: {[id: string]: string[]} = {};
        this.operations.forEach((op) => {
           if (op instanceof UpdateOperation) {
               entities[op.entity_id] = (entities[op.entity_id] || []);
               if (entities[op.entity_id].indexOf(op.key) === -1) {
                   entities[op.entity_id].push(op.key);
               } 
           } 
        });
        return entities;
    }
    
    private sort(operations: Operation[]) {
        // We have a _partial_ order defined on VectorClock.
        // JavaScript's sort(sortFunc) method is not suited
        // for this case (?).
        // What we want, is a topological order. We implement a
        // naive version of Tarjan's algorithm. This can be done in O(n^2).
        
        var marked: { [id: string] : boolean} = {};
        operations.map((op) => {
            marked[op.id] = false;  
        });
        var unmarkedNodes = operations.length;
        
        var visit = (n: Operation) => {
            if (!marked[n.id]) {
                operations.filter((op) => { return n.isBefore(op) }).forEach((m) => {
                   visit(m); 
                });
                marked[n.id] = true;
                unmarkedNodes -= 1;
                this.operations.unshift(n);
            }
        }
        
        while (unmarkedNodes > 0) {
            var n = operations.find((op) => { return !marked[op.id] });
            visit(n);
        }
    }
}

// Map of deviceId => list of operations (log)
var dropbox: { [id: string] : Operation[] } = {};

class SyncEventManager {
    private opCache: Operation[] = [];
    constructor(private deviceId: string) {
        if (!dropbox[this.deviceId]) {
            dropbox[this.deviceId] = [];    
        }
    }
    
    syncNewOperation(op: Operation) {
        this.opCache.push(op);
    }
    
    flushCache() {
        dropbox[this.deviceId] = dropbox[this.deviceId].concat(this.opCache);
        this.opCache = [];
    }
    
    sync() {
        var devices: string[] = [this.deviceId];
        
        /** Get all relevant operations from devices **/
        var alreadyAppliedOps = dropbox[this.deviceId].map((op) => {
            return op.id;
        });
        var ops: Operation[] = dropbox[this.deviceId].slice(); // copy
        
        function opInOps(op: Operation, ops: Operation[]) {
            var index = ops.findIndex((o) => {
                return o.id == op.id; 
            });
            return index !== -1;
        }
        
        for (var deviceId in dropbox) {
            if (dropbox.hasOwnProperty(deviceId) && deviceId !== this.deviceId) {
                // Iterate over all other devices
                devices.push(deviceId);
                dropbox[deviceId].forEach((op) => {
                    // Add all operations from other devices which weren't applied already
                    // and are not in ops.
                    
                    // This implementation is inefficient (Prototype)
                    if (alreadyAppliedOps.indexOf(op.id) === -1 && !opInOps(op, ops)) {
                        ops.push(op);
                    }
                });
            }
        }
        
        /** Build vector clocks **/
        
        function buildClock(op: Operation) {
            // This function is also not very efficient
            if (typeof op.vc !== 'undefined') {
                return;
            }
            var myLog = dropbox[op.deviceId];
            var pos = myLog.findIndex((o) => {
                return o.id == op.id;
            });
            if (pos == 0) {
                op.vc = new VectorClock(devices);
                op.vc.inc(op.deviceId);
            }
            else {
                // Get the last operation before 'op' which
                // originated from the same device as 'op'.
                var prevOpSameDevice = pos;
                for (var i = pos - 1; i >= 0; --i) {
                    if (myLog[i].deviceId == op.deviceId) {
                        prevOpSameDevice = i;
                        break;
                    }
                }
                
                if (prevOpSameDevice == pos) {
                    // This was the first.
                    op.vc = new VectorClock(devices);
                    prevOpSameDevice = -1;
                } else {
                    buildClock(myLog[prevOpSameDevice]);
                    op.vc = myLog[prevOpSameDevice].vc.copy();
                }
                
                for (var i = prevOpSameDevice + 1; i < pos; ++i) {
                    op.vc.inc(op.deviceId, myLog[i].vc);
                }
                op.vc.inc(op.deviceId);
            }
        }
        
        ops.forEach((op) => {
            buildClock(op);
        })
        
        /** Schedule **/
        var opList = new OperationList(ops);
        
        /** Apply operations **/
        opList.forEachCreateOperation((op) => {
            // First changes who create entities
            if (alreadyAppliedOps.indexOf(op.id) === -1) {
                this._eventCallback(op);
            }
        })
        
        var entityChangedKeys = opList.getChangedEntities();
        Object.keys(entityChangedKeys).forEach((entity_id) => {
            entityChangedKeys[entity_id].forEach((key) => {
                var concurrentDiffs = opList.getLastUpdateDiffs(entity_id, key);
                var last = concurrentDiffs.getLast();
                this._eventCallback(last);
            });
        });
        
        // Put changes back into log (so other devics know the vector count)
        ops.forEach((op) => {
           if (alreadyAppliedOps.indexOf(op.id) === -1) {
               dropbox[this.deviceId].push(op);
           } 
        });
    }
    
    private _eventCallback: (op: Operation) => void;
    set eventCallback(cb: (op: Operation) => void) {
        this._eventCallback = cb;
    }
}

class Device {
    private syncManager: SyncEventManager;
    static entityIdCount = 0;
    
    localStore: { [index: string] : any } = {}; 
    
    // Formats:
    //  Catgeory: {type, name, budget, id}
    //  Transaction: {type, catgeoryId, amount, id}
    
    constructor(public name: string) {
        this.syncManager = new SyncEventManager(name);
        this.syncManager.eventCallback = (op: Operation) => {
            if (op instanceof CreateOperation) {
                this.localStore[op.data.id] = copy(op.data);
            }
            else if (op instanceof UpdateOperation) {
                this.localStore[op.entity_id][op.key] = op.data;
            }
        };
    }
    
    createCategory(name: string, budget: number) : string {
        Device.entityIdCount += 1;
        var id = String(Device.entityIdCount);
        var category = {'type': 'category',
            'name': name, 'budget': budget,
            'id': id};
        this.localStore[Device.entityIdCount] = category;
        var createOperation = new CreateOperation(this.name, copy(category));
        this.syncManager.syncNewOperation(createOperation);
        return id;
    }
    
    createTransaction(categoryId: string, amount: number) : string {
        Device.entityIdCount += 1;
        var id = String(Device.entityIdCount);
        var transaction = {'type': 'transaction',
            'categoryId': categoryId, 'amount': amount,
            'id': id};
        this.localStore[Device.entityIdCount] = transaction;
        var createOperation = new CreateOperation(this.name, copy(transaction));
        this.syncManager.syncNewOperation(createOperation);
        return id;
    }
    
    edit(id: string, key: string, value: any) : void {
        this.localStore[id][key] = value;
        var updateOperation = new UpdateOperation(this.name, id, key, value);
        this.syncManager.syncNewOperation(updateOperation);
    }
    
    pull() {
        this.syncManager.sync();
    }
    
    push() {
        this.syncManager.flushCache();
    }
    
    printState() {
        console.log("# State of device '" + this.name + "' #");
        var categories = Object.keys(this.localStore).filter((entId) => {
            return this.localStore[entId].type == 'category';
        }).map((entId) => { return this.localStore[entId]; });
        
        categories.forEach((category) => {
            console.log("  Category '" + category.name + "' has budget value " + category.budget);
            
            var transactions = Object.keys(this.localStore).filter((entId) => {
                var transaction = this.localStore[entId]; 
                return transaction.type == 'transaction' && transaction.categoryId == category.id;
            }).map((entId) => { return this.localStore[entId]; });
            var balance = category.budget;
            transactions.forEach((transaction) => {
                console.log("    - Transaction of " + transaction.amount);
                balance += transaction.amount;
            })
            console.log("  (Balance: " + balance + ")\n");
        });
    }
}

export = Device;