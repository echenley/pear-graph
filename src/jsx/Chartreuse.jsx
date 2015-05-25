/* @flow */

'use strict';

// var Router        = require('react-router');
// var RouteHandler  = Router.RouteHandler;
// var Route         = Router.Route;
// var NotFoundRoute = Router.NotFoundRoute;
// var DefaultRoute  = Router.DefaultRoute;
// var Link          = Router.Link;

import React from 'react/addons';

import NavBar from './components/NavBar.jsx';
import Controls from './components/Controls.jsx';
import Graph from './components/Graph.jsx';

import cx from 'classnames';

class Chartreuse extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            hideControls: false,
            fns: [
                // 'sqrt(1-x^2) + (x^2)^(1/3)', // heart
                'sin(x)',
                'sqrt(x)',
                'tan(x)',
                'log(sin(sqrt(x)))'
            ],
            currentFn: 0
        };
    }

    updateFn(i) {
        this.setState({
            currentFn: i
        });
    }

    addFn(fn) {
        let fns = this.state.fns;
        fns.push(fn);

        this.setState({
            fns: fns
        });
    }

    render() {
        let currentFn = this.state.currentFn;
        let chartreuseCx = cx(
            'chartreuse',
            { 'hide-controls': this.state.hideControls }
        );

        return (
            <div className={ chartreuseCx }>
                <NavBar
                    toggleControls={ this.setState.bind(this, { hideControls: !this.state.hideControls }) }
                    controlsHidden={ this.state.hideControls }
                    addFn={ this.addFn.bind(this) }
                />
                <Controls
                    fns={ this.state.fns }
                    addFn={ this.addFn.bind(this) }
                    updateFn={ this.updateFn.bind(this) }
                    currentFn= { currentFn }
                />
                <Graph
                    fn={ this.state.fns[currentFn] }
                />
            </div>
        );
    }
}

// var routes = (
//     <Route handler={ Chartreuse }></Route>
// );

// Router.run(routes, function(Handler, state) {
//     React.render(<Handler params={ state.params } />, document.getElementById('container'));
// });

React.render(<Chartreuse />, document.getElementById('container'));
