import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Block from './Block';

class Blocks extends Component {
    state = {
        blocks: []
    };

    componentDidMount() {
        fetch('http://localhost:3000/api/blocks')
            .then(response => response.json())
            .then(data => this.setState({ blocks: data }));
    }

    render() {
        console.log('Blocks:', this.state);

        return (
            <div className='Blocks'>
                <div><Link to='/'>Home</Link></div>
                <h3>Blocks</h3>
                {
                    this.state.blocks.map(block => {
                        return (
                            <Block key={block.hash} block={block} />
                        )
                    })
                }
            </div>
        );
    }
}

export default Blocks;