export const DemoObj = class DemoObj {
  constructor(HTMLStringFunction, add, remove, time, ...cbScripts) {
    this.el = null;
    this.htmlMaker = HTMLStringFunction;
    this.add = add;
    this.remove = remove;
    this.time = time;
    this.attached = false;
    this.cbScripts = cbScripts;
  }
  build(message) {
    this.el = document.createElement('div');
    this.el.id = 'DemoDiv';
    this.el.innerHTML = this.htmlMaker();
    this.add(this.el, message);
    this.attached = true;
  }
  destroy(next) {
    this.attached = false;
    this.remove(this.el, next);
  }
};
export const DemoRunner = class DemoRunner {
  constructor(elobjs, destroyCB) {
    this.destroyCB = destroyCB;
    this.elements = elobjs;
    this.index = 0;
    this.to = null;
    this.current = null;

    this.switch = false;
  }
  toggle(){
    if(!this.switch){
      this.run();
      this.switch = true;
    } else{
      this.endRun();
    }
    
  }
  run(message) {
    if (this.index > this.elements.length - 1) return this.endRun();
    const obj = this.elements[this.index];
    this.current = obj;
    this.bindMethods();
    obj.build(message);
    ++this.index;
    this.to = setTimeout(this.destroyCurrentAndRun.bind(this), obj.time);
    const that = this;
    obj.cbScripts.forEach(function(cbScript){
      if (typeof cbScript === 'function') cbScript(that);
    });
  }
  bindMethods() {
    window.demo = {};
    window.demo.stay = this.stay.bind(this);
    window.demo.destroyCurrentAndRun = this.destroyCurrentAndRun.bind(this);
    window.demo.goBack = this.goBack.bind(this);
    window.demo.endRun = this.endRun.bind(this);
  }
  goBack() {
    if (this.index > 1) {
      clearTimeout(this.to);
      this.destroyCurrent();
      this.index = this.index - 2;
      this.run();
    }
  }
  stay() {
    clearTimeout(this.to);
  }
  destroyCurrentAndRun() {
    clearTimeout(this.to);
    this.current.destroy(this.run.bind(this));
  }
  destroyCurrent() {
    clearTimeout(this.to);
    this.current.destroy(function () {});
  }
  endRun() {
    clearTimeout(this.to);
    if (this.current.attached) this.destroyCurrent();
    this.switch = false;
    if (typeof this.destroyCB === 'function') this.destroyCB();
    window.demo = undefined;
    this.index = 0;
    
  }
};