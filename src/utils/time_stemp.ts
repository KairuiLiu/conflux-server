class LogicalTimestamp {
  t: number;
  constructor() {
    this.t = 0;
  }

  tick() {
    ++this.t;
  }

  getTime() {
    return this.t;
  }
}

export default new LogicalTimestamp();
