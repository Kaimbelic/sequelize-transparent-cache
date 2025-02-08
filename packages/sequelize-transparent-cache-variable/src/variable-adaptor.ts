class VariableAdaptor {
  store: Record<string, any>;

  constructor(store: Record<string, any> = {}) {
    this.store = store;
  }

  _ensureModel(model: string): void {
    if (!this.store[model]) {
      this.store[model] = {};
    }
  }

  set([model, ...ids]: string[], value: any): Promise<void> {
    this._ensureModel(model);

    this.store[model][ids.join()] = JSON.stringify(value);
    return Promise.resolve();
  }

  get([model, ...ids]: string[]): Promise<any> {
    this._ensureModel(model);
    const data = this.store[model][ids.join()];

    return Promise.resolve(data ? JSON.parse(data) : data);
  }

  del([model, ...ids]: string[]): Promise<void> {
    this._ensureModel(model);

    delete this.store[model][ids.join()];
    return Promise.resolve();
  }
}

export default VariableAdaptor;
