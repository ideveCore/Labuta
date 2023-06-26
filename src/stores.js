class Writable {
  constructor(initial_value) {
    this._value = initial_value;
  }
  subscribe(callback) {
    return callback(this._value)
  }
  update(callback) {
    this._value = callback()
  }
}

export const timer_state = new Writable('stopped');
export const data = new Writable([]);
export const application = new Writable(null);

