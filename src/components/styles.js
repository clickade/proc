import styled from 'styled-components'

/**
 * Tile wrapper
 */
export const Tile = styled.div`
    display: inline-block;
    padding: .5em;
    width: 1.5em;
    height: 1.5em;
    border: solid white ${props=>props.borderless ? '0em' : '.05em'};
    text-Align: center;
    background-color: ${props=>props.backgroundColor || ''};
`

/**
 * Board wrapper
 */
export const Board = styled.div`
    display: grid;
    grid-template-columns: repeat(${props=>props.cols || 1},1fr);
    grid-template-rows: repeat(${props=>props.rows || 1},1fr);
`

export const Piece = styled.div`
    cursor: grab;
    color: ${props=>props.color || 'white'};
`