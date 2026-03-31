import { Component } from "solid-js";

const AuthCallback: Component = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if(code) {
        window.opener.postMessage(code, import.meta.env.VITE_ORIGIN);
        window.close();
    } else {
        console.error("No code provided in callback URL.");
    }

    return (
        <div>
            Processing login...
        </div>
    );
}

export default AuthCallback;