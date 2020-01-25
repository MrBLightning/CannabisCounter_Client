import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './shared/store'
import config from './shared/config'

ReactDOM.render((<Provider store={store} >
    <BrowserRouter basename={config.BASENAME}>
        <App />
    </BrowserRouter>
</Provider>), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();

// changed unregister to register to enable PWA - progressive web app
// we also need to change the manifest.json file to link to our app images
serviceWorker.register();

