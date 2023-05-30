class Writable {
  constructor(initial_value) {
    this._value = initial_value;
    this._listeners = []
  }
  subscribe(callback) {
    return callback(this._value)
  }
  update(callback) {
    this._value = callback()
    this.emit_changes()
  }
  $(listener) {
    this._listeners.push(listener)
  }
  emit_changes() {
    for (const listener of this._listeners) {
      listener(this._value)
    }
  }
}

export const timer_state = new Writable('stopped');
export const data = new Writable([]);
export const Application = new Writable(null);
export const navigation = new Writable(null);
