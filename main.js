import {createElement, Component, render} from "./toy-react.js"

class MyComponent extends Component{
    constructor() {
        super();
        this.state = {
            a:1,
            b:2
        }
    }
    render() {
        return <div>
            <h1>My Component</h1>
            <button onclick={()=>{this.setState({a: this.state.a+1});}}>Add</button> <br/>
            <span>{this.state.a.toString()}</span> <br/>
            <span>{this.state.b.toString()}</span> <br/>
            {this.children}
        </div>
    }
}


render(<MyComponent id="a" class="c">
    <div>abc</div>
    <div>efg</div>
    <div>123456</div>
</MyComponent>, document.body);

// https://reactjs.org/tutorial/tutorial.html
// Final Result.