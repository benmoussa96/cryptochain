import React, { Component } from 'react';

class App extends Component {
    state = {
        walletInfo: {}
    };

    componentDidMount() {
        fetch('http://localhost:3000/api/wallet-info')
            .then(response => response.json())
            .then(data => this.setState({ walletInfo: data }));
    }

    render() {
        const { address, balance } = this.state.walletInfo;

        return (
            <div>
                <div>Cryptochain from React App component!</div>
                <div>Address: {address}</div>
                <div>Balance: {balance}</div>
            </div>
        );
    }
}

export default App;