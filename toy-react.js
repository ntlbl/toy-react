const RENDER_TO_DOM = Symbol("render to dom");

export class Component {
    constructor() {
        this.props = Object.create(null);
        this.children = [];
        this._root = null;
        this._range = null;
    }

    setAttribute(name, value) {
        this.props[name] = value;
    }

    appendChild(component) {
        this.children.push(component);
    }

    get vdom() {
        return this.render().vdom;
    }

    get vchildren() {
        return this.children.map(child => child.vdom);
    }

    [RENDER_TO_DOM](range) { // 另一个写法 ——_renderToDOM
        this._range = range;
        this.render()[RENDER_TO_DOM](range);
    }

    rerender() {  // 重新绘制
        let oldRange = this._range;

        let range = document.createRange();
        range.setStart(oldRange.startContainer, oldRange.startOffset);
        range.setEnd(oldRange.startContainer, oldRange.startOffset);
        this[RENDER_TO_DOM](range);

        oldRange.setStart(range.endContainer, range.endOffset);
        oldRange.deleteContents();
    }

    setState(newState) {
        if (this.state === null || typeof this.state !== "object") {
            this.state = newState;
            this.rerender();
            return;
        }
        let merge = function (oldState, newState) {
            for (let p in newState) {
                if (oldState[p] === null || typeof oldState[p] !== "object") {
                    oldState[p] = newState[p];
                } else {
                    merge(oldState[p], newState[p]);
                }
            }
        }
        merge(this.state, newState);
        this.rerender();
    }
}

class ElementWrapper extends Component {
    constructor(type) {
        super(type);
        this.type = type;
    }
    /*
    setAttribute(name, value){
        if(name.match(/^on([\s\S]+)$/)){
            // 以小写开头
            this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value);
        } else {
            if (name === "className"){
                this.root.setAttribute("class", value);
            } else {
                this.root.setAttribute(name, value);
            }
        }
        this.root.setAttribute(name, value);
    }
    appendChild(component) {
        let range = document.createRange();
        range.setStart(this.root, this.root.childNodes.length);
        range.setEnd(this.root, this.root.childNodes.length);
        component[RENDER_TO_DOM](range);
    }*/
    get vdom(){
        return this;
    }
    [RENDER_TO_DOM](range){ // 另一个写法 ——_renderToDOM
        range.deleteContents();

        let root = document.createElement(this.type);
        for(let name in this.props){
            let value =this.props[name];
            if(name.match(/^on([\s\S]+)$/)){
                // 以小写开头
                root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value);
            } else {
                if (name === "className"){
                    root.setAttribute("class", value);
                } else {
                    root.setAttribute(name, value);
                }
            }
        }

        for(let child of this.children) { //children is array
            let childRange = document.createRange();
            childRange.setStart(root, root.childNodes.length);
            childRange.setEnd(root, root.childNodes.length);
            child[RENDER_TO_DOM](childRange);
        }

        range.insertNode(root);
    }
}

class TextWrapper extends Component{
    constructor(content) {
        super(content);
        this.type = "#text";
        this.content = content;
        this.root = document.createTextNode(content);
    }
    get vdom(){
        return this
    }
    [RENDER_TO_DOM](range){ // 另一个写法 ——_renderToDOM
        range.deleteContents();
        range.insertNode(this.root);
    }
}



export function createElement(type, attributes, ...children){
    let e;
    if (typeof type === "string"){
        e = new ElementWrapper(type);
    } else {
        e = new type;
    }

    for(let p in attributes){
        e.setAttribute(p, attributes[p]);
    }
    let insertChild = (children) => {
        for (let child of children) {
            if (typeof child === "string") {
                child = new TextWrapper(child);
            }
            if (child === null){
                continue;
            }
            if ((typeof child === "object") && (child instanceof Array)) {
                insertChild(child);
            } else {
                e.appendChild(child);
            }
        }
    }
    insertChild(children);

    return e;
}

export function render(component, parentElement) {
    let range = document.createRange();
    range.setStart(parentElement,0);
    range.setEnd(parentElement,parentElement.childNodes.length);
    range.deleteContents();
    component[RENDER_TO_DOM](range);
}

