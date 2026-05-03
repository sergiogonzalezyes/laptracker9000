"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcaster = void 0;
const events_1 = require("events");
class Broadcaster extends events_1.EventEmitter {
    emit(event, payload) {
        return super.emit('live', payload);
    }
    on(event, listener) {
        return super.on('live', listener);
    }
    broadcast(payload) {
        this.emit('live', payload);
    }
}
exports.broadcaster = new Broadcaster();
exports.broadcaster.setMaxListeners(200); // support many SSE clients
