import {Fragment} from 'react'
import {Tile,Board,Piece} from './styles'
import {num2Alpha} from './global'

/**
 * Renders the board
 * @param {*} param0
 */
export const GameBoard = ({rowSize,colSize,pieces,legalTiles,handleDragStart,handleDragOver,handleDrop,handleDoubleClick}) => {
	const boardState = rowSize && colSize ? new Array(rowSize).fill(new Array(colSize).fill(0)) : undefined
	if(!boardState || !pieces) return null

	// Convert array into dict
	const gamePieces = pieces.reduce((temp,piece)=>{
		return {
			...temp,
			[piece.an]: piece
		}
	},{})

	return <Board cols={colSize+2} rows={rowSize+1}>
		{   [...new Array(colSize+2).fill(0)].map((col,colIndex)=><Tile key={colIndex} borderless>{colIndex > 0 && colIndex < colSize+1 && num2Alpha(colIndex-1)}</Tile>) }

		{	boardState.map((row,rowIndex)=><Fragment>
				<Tile key={rowIndex} borderless>{rowSize-rowIndex}</Tile>
				{    row.map((col,colIndex)=>{
						const an = `${num2Alpha(colIndex)}${rowSize-rowIndex}`
						const color = gamePieces[an] ? gamePieces[an].COLOR : ''
						const backgroundColor = legalTiles && legalTiles.indexOf(an) > -1 ? 'rgba(255,235,59,.1)' : ''
						return <Tile
							key={an}
							id={an}
							data-tile={JSON.stringify({an,piece:gamePieces[an]})}
							onDragOver={handleDragOver}
							onDrop={handleDrop}
							backgroundColor={backgroundColor}
						>
							{	gamePieces[an] ?
								<Piece
									id={gamePieces[an].SYMBOL}
									data-piece={JSON.stringify(gamePieces[an])}
									data-tile={JSON.stringify({an,piece:gamePieces[an]})}
									onDragStart={handleDragStart}
									color={color}
									draggable
									onDoubleClick={handleDoubleClick}
								>{gamePieces[an].SYMBOL}</Piece>
							: <Piece data-tile={JSON.stringify({an,piece:gamePieces[an]})}  color={'rgba(255,255,255,.1)'}>{false && an}</Piece>}
						</Tile>
					})
				}
				<Tile key={rowIndex+rowSize} borderless></Tile>
			</Fragment>
			)
		}
	</Board>
}

export const SideBoard = ({rowSize,colSize,pieces,legalTiles,handleDragStart,handleDragOver,handleDrop,handleDoubleClick}) => {
	const boardState = rowSize && colSize ? new Array(rowSize).fill(new Array(colSize).fill(0)) : undefined
	if(!boardState || !pieces) return null

	// Convert array into dict
	const gamePieces = pieces.reduce((temp,piece)=>{
		return {
			...temp,
			[piece.an]: piece
		}
	},{})

	return <Board cols={colSize+2} rows={rowSize+1}>
		{   [...new Array(colSize+2).fill(0)].map((col,colIndex)=><Tile key={colIndex} borderless/>) }

		{	boardState.map((row,rowIndex)=><Fragment>
				<Tile key={rowIndex} borderless>{rowSize-rowIndex}</Tile>
				{    row.map((col,colIndex)=>{
						const an = `${num2Alpha(colIndex)}${rowSize-rowIndex}`
						const color = gamePieces[an] ? gamePieces[an].COLOR : ''
						const backgroundColor = legalTiles && legalTiles.indexOf(an) > -1 ? 'rgba(255,235,59,.1)' : ''
						return <Tile
							key={an}
							id={an}
							data-tile={JSON.stringify({an,piece:gamePieces[an]})}
							onDragOver={handleDragOver}
							onDrop={handleDrop}
							backgroundColor={backgroundColor}
						>
							{	gamePieces[an] ?
								<Piece
									id={gamePieces[an].SYMBOL}
									data-piece={JSON.stringify(gamePieces[an])}
									data-tile={JSON.stringify({an,piece:gamePieces[an]})}
									onDragStart={handleDragStart}
									color={color}
									draggable
									onDoubleClick={handleDoubleClick}
								>{gamePieces[an].SYMBOL}</Piece>
							: <Piece data-tile={JSON.stringify({an,piece:gamePieces[an]})}  color={'rgba(255,255,255,.1)'}>{false && an}</Piece>}
						</Tile>
					})
				}
				<Tile key={rowIndex+rowSize} borderless></Tile>
			</Fragment>
			)
		}
	</Board>
}