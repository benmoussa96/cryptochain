import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Block from './Block';

class Blocks extends Component {
    state = {
        blocks: [],
        blocksLength: 0,
        paginatedId: 1
    };

    componentDidMount() {
        fetch(`${document.location.origin}/api/blocks/length`)
            .then(response => response.json())
            .then(data => this.setState({ blocksLength: data }));

        this.fetchPaginatedBlocks(this.state.paginatedId)();
    }

    fetchPaginatedBlocks = paginatedId => () => {
        fetch(`${document.location.origin}/api/blocks/${paginatedId}`)
            .then(response => response.json())
            .then(data => this.setState({ blocks: data }));
    }

    render() {
        return (
            <div className='Blocks'>
                <div><Link to='/'>Home</Link></div>
                <h3>Blocks</h3>
                <div>
                    {
                        [...Array(Math.ceil(this.state.blocksLength / 5)).keys()].map(key => {
                            const paginatedId = key + 1;

                            return (
                                <span key={key} onClick={this.fetchPaginatedBlocks(paginatedId)}>
                                    <Button bsSize="small" bsStyle="danger">
                                        {paginatedId}
                                    </Button>{' '}
                                </span>
                            )
                        })
                    }
                </div>
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