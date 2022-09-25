import { Component } from "../shared/component";
import { defineComponent } from "../shared/decorators";
import { DOMFactory } from "../shared/factory";

@defineComponent
export class SpinLoader extends Component {
    static styles = `
        .loader {
            border: 12px solid #88C0D0;
            border-top: 12px solid #5E81AC;
            border-radius: 50%;
            width: 64px;
            height: 64px;

            animation: spin 2s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;

    render() {
        return <div class="loader"></div>
    }
}