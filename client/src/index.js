import './app/assets/fonts/fonts';

import React from 'react';
import ReactDOM from 'react-dom';

import './index.scss';
import 'invoker-layout/grid.module.scss';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import './datepicker_override.scss';

import App from './app/App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
