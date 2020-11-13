import {Component} from 'react'
import {GameBoard, SideBoard} from './components/board'
import {BOARD, PIECE, arr2an, shuffleArray, an2arr, PLAYER} from './components/global'

export default class App extends Component {
	constructor(props){
		super(props)

		this.state = {
			title: 'PROC',
			[BOARD.COL_SIZE]: 9,
			[BOARD.ROW_SIZE]: 10,
		}

		document.title = 'Proc | The Game'
	}

	componentDidMount(){
		this.resetBoard()	// Also serves to initialize the board
		this.checkNextPlayer()	// Init player
	}

	/**
	 * Deducts 1 move from current movesLeft then checks for next player
	 */
	checkMovesLeft = () => {
		this.setState({
			movesLeft: this.state.movesLeft - 1
		},this.checkNextPlayer)
	}

	/**
	 * Toggles current player based on moves left, resets moves left if player changes
	 */
	checkNextPlayer = () => {
		const nextPlayer = this.state.movesLeft ? this.state.player : (this.state.player === PLAYER.COURT ? PLAYER.ROYAL : PLAYER.COURT)
		this.setState({
			player: nextPlayer,
			movesLeft: this.state.player !== nextPlayer ? nextPlayer.MOVES : this.state.movesLeft
		})
	}

	/**
	* Sets default positions of all pieces in play
	*/
	resetBoard = () => {
		// Proc needs a bare min 9x4 board size
		if(this.state[BOARD.COL_SIZE] < 7 || this.state[BOARD.ROW_SIZE] < 4) return this.setState({pieces:[]})

		const rowIsOdd = this.state[BOARD.ROW_SIZE] % 2	// Determine the template position of Court pieces based on board row size

		// Generate AN positions for the court pieces for leftmost columns
		const col0 = [...new Array(this.state[BOARD.ROW_SIZE]).fill(0)].map((row,index)=>{
			if(index % 2 === (rowIsOdd ? 0 : 1) && index > 1){
				return arr2an([0,index])
			}
			return null
		}).filter(piece=>piece!==null)
		const col1 = [...new Array(this.state[BOARD.ROW_SIZE]).fill(0)].map((row,index)=>{
			if(index % 2 === (rowIsOdd ? 1 : 0) && index > 1){
				return arr2an([1,index])
			}
			return null
		}).filter(piece=>piece!==null)
		const courtLeft = shuffleArray([...col0,...col1])

		// Generate AN positions for the court pieces for rightmost columns
		const colLast0 = [...new Array(this.state[BOARD.ROW_SIZE]).fill(0)].map((row,index)=>{
			if(index % 2 === (rowIsOdd ? 0 : 1) && index > 1){
				return arr2an([this.state[BOARD.COL_SIZE]-1,index])
			}
			return null
		}).filter(piece=>piece!==null)
		const colLast1 = [...new Array(this.state[BOARD.ROW_SIZE]).fill(0)].map((row,index)=>{
			if(index % 2 === (rowIsOdd ? 1 : 0) && index > 1){
				return arr2an([this.state[BOARD.COL_SIZE]-2,index])
			}
			return null
		}).filter(piece=>piece!==null)
		const courtRight = shuffleArray([...colLast0,...colLast1])

		// Assign Court pieces randomly to generated AN positions
		const piecesLeft = shuffleArray([PIECE.ASSASSIN,...new Array(courtLeft.length-1).fill(PIECE.POP)])
		const piecesRight = shuffleArray([PIECE.ASSASSIN,...new Array(courtRight.length-1).fill(PIECE.POP)])

		// Assign Royal pieces their AN positions and append Court pieces
		const pieces = [
			{
				...PIECE.KING, an: arr2an([Math.floor(this.state[BOARD.COL_SIZE]/2),this.state[BOARD.ROW_SIZE]]),
			},
			...[
				arr2an([Math.floor(this.state[BOARD.COL_SIZE]/2)-1,this.state[BOARD.ROW_SIZE]]),
				arr2an([Math.floor(this.state[BOARD.COL_SIZE]/2)+1,this.state[BOARD.ROW_SIZE]]),
			].map(an=>{return {
				...PIECE.KNIGHT, an
			}}),
			...courtLeft.map((an,index)=>{
				return {
					...piecesLeft[index], an
				}
			}),
			...courtRight.map((an,index)=>{
				return {
					...piecesRight[index], an
				}
			}),
		].map((piece,index)=>{	// Give pieces their index
			return {
				...piece,
				index
			}
		})

		this.setState({pieces})
	}

	/**
	 * Checks all possible legal moves for target piece, returns array of AN positions piece can legally move onto
	 * @param {*} piece piece dict
	 */
	checkMoves = (piece) => {
		const {pieces} = this.state
		const occupiedTiles = pieces.map(piece=>piece.an)	// Get array of AN of all pieces
		const coords = an2arr(piece.an)
		const maxRange = Math.max(this.state[BOARD.COL_SIZE],this.state[BOARD.ROW_SIZE])	// Get max length of board to calculate movement range
		if([PIECE.POP.NAME,PIECE.MERCHANT.NAME].includes(piece.NAME)){
			return [
				...this.checkRangeBoundary(this.addRange([coords],1)),	// Basic range of 1
				...this.checkRangeBoundary(this.checkLeapPieces(this.addRange([coords],1),[PIECE.POP,PIECE.MERCHANT,PIECE.ASSASSIN])),	// Can leap over adjacent Court pieces
			].map(coords=>arr2an(coords)).filter(an=>an!==piece.an && !occupiedTiles.includes(an))
		}
		if(piece.NAME===PIECE.KING.NAME){
			const ediblePieces = pieces.filter(piece=>[PIECE.KNIGHT].every(edible=>edible.NAME!==piece.NAME)).map(piece=>piece.an)	// Kings can capture anything but Knights
			return [
				[coords[0],coords[1]-1],	// Can move up
				[coords[0],coords[1]+1],	// Can move down
			].map(coords=>arr2an(coords)).filter(an=>an!==piece.an && (!occupiedTiles.includes(an)||ediblePieces.includes(an)))
		}
		if(piece.NAME===PIECE.KNIGHT.NAME){
			const ediblePieces = pieces.filter(piece=>[PIECE.KNIGHT,PIECE.KING].every(edible=>edible.NAME!==piece.NAME)).map(piece=>piece.an)	// Knights can capture Court pieces
			return [
				...this.checkRangePieces(this.checkRangeBoundary(this.addRange([coords],maxRange))),	// Moves like a QUEEN
			].map(coords=>arr2an(coords)).filter(an=>an!==piece.an && (!occupiedTiles.includes(an)||ediblePieces.includes(an)))
		}
		if(piece.NAME===PIECE.ASSASSIN.NAME){
			const ediblePieces = pieces.filter(piece=>[PIECE.ASSASSIN,PIECE.POP,PIECE.MERCHANT,PIECE.KING].some(edible=>edible.NAME===piece.NAME)).map(piece=>piece.an)	// Assassins can Kings and swap with Court pieces
			return [
				...this.checkRangeBoundary(this.addRange([coords],1)),	// Basic range of 1
				...this.checkRangeBoundary(this.checkLeapPieces(this.addRange([coords],1),[PIECE.POP,PIECE.MERCHANT,PIECE.ASSASSIN])),	// Can leap over adjacent Court pieces
				...this.checkSwapPieces(this.checkRangeBoundary(this.addRange([coords],maxRange)),[PIECE.POP,PIECE.MERCHANT,PIECE.ASSASSIN])	// Can swap with Court pieces in range
			].map(coords=>arr2an(coords)).filter(an=>an!==piece.an && (!occupiedTiles.includes(an)||ediblePieces.includes(an)))
		}
		return []
	}

	/**
	 * Returns total movement range of a piece (recursive)
	 * @param {[[]]} coords [[x,y]] initial coordinates
	 * @param {*} range range
	 */
	addRange = (coords,range) => {
		if(!range) return coords
		return this.addRange([
			...coords,
			[coords[0][0]-range,coords[0][1]-range],
			[coords[0][0]-range,coords[0][1]],
			[coords[0][0]-range,coords[0][1]+range],
			[coords[0][0],coords[0][1]-range],
			[coords[0][0],coords[0][1]+range],
			[coords[0][0]+range,coords[0][1]-range],
			[coords[0][0]+range,coords[0][1]],
			[coords[0][0]+range,coords[0][1]+range],
		],--range)
	}

	/**
	 * Truncates array of coords to the inside of board boundary
	 * @param {[[]]} coords [[x,y],[x,y],...] initial list of coordinates
	 */
	checkRangeBoundary = coords => {
		// Movement does not exceed board boundary
		return coords.filter(coord=>coord[0] >= 0 && coord[1] >= 0 && coord[0] <= this.state[BOARD.COL_SIZE] && coord[1] <= this.state[BOARD.ROW_SIZE])
	}

	/**
	 * Truncates array of coords to the first encountered piece per direction
	 * @param {[[]]} coords [[x,y],[x,y],...] initial list of coordinates
	 */
	checkRangePieces = coords => {
		const {pieces} = this.state
		const coordsAN = coords.map(coord=>arr2an(coord))	// Convert coords into list of AN
		const piecesCoords = pieces.map(piece=>piece.an).filter(an=>coordsAN.includes(an)).map(an=>an2arr(an))	// Take only pieces within range of center piece
		const piecesCoordsNormalized = piecesCoords.map(coord=>[coord[0]-coords[0][0],coord[1]-coords[0][1]])	// Normalize pieces coords taking center piece as (0,0)
		const rangeCoordsNormalized = coords.map(coord=>[coord[0]-coords[0][0],coord[1]-coords[0][1]])	// Normalize range coords taking center piece as (0,0)

		// Truncate range
		const rangeCoordsTruncated = rangeCoordsNormalized.filter(coord=>{
			// Filter x-axis coords	[0,y]
			if(!coord[0] && coord[1]){
				let piecesCol = piecesCoordsNormalized.filter(coord=>!coord[0])	// x-axis pieces
				if(coord[1]>0){
					piecesCol = piecesCol.filter(coord=>coord[1]>0)
					return piecesCol.every(piece=>coord[1]<=piece[1])
				}
				if(coord[1]<0){
					piecesCol = piecesCol.filter(coord=>coord[1]<0)
					return piecesCol.every(piece=>coord[1]>=piece[1])
				}
			}
			// Filter y-axis coords [x,0]
			if(coord[0] && !coord[1]){
				let piecesRow = piecesCoordsNormalized.filter(coord=>!coord[1])	// y-axis pieces
				if(coord[0]>0){
					piecesRow = piecesRow.filter(coord=>coord[0]>0)
					return piecesRow.every(piece=>coord[0]<=piece[0])
				}
				if(coord[0]<0){
					piecesRow = piecesRow.filter(coord=>coord[0]<0)
					return piecesRow.every(piece=>coord[0]>=piece[0])
				}
			}
			// Filter diagonal pieces
			let piecesDiag = piecesCoordsNormalized.filter(coord=>coord[0]&&coord[1])	// diagonal pieces
			if(coord[0]>0 && coord[1]>0){
				piecesDiag = piecesDiag.filter(coord=>coord[0]>0 && coord[1]>0)
				return piecesDiag.every(piece=>coord[0]<=piece[0] && coord[1]<=piece[1])
			}
			if(coord[0]>0 && coord[1]<0){
				piecesDiag = piecesDiag.filter(coord=>coord[0]>0 && coord[1]<0)
				return piecesDiag.every(piece=>coord[0]<=piece[0] && coord[1]>=piece[1])
			}
			if(coord[0]<0 && coord[1]>0){
				piecesDiag = piecesDiag.filter(coord=>coord[0]<0 && coord[1]>0)
				return piecesDiag.every(piece=>coord[0]>=piece[0] && coord[1]<=piece[1])
			}
			if(coord[0]<0 && coord[1]<0){
				piecesDiag = piecesDiag.filter(coord=>coord[0]<0 && coord[1]<0)
				return piecesDiag.every(piece=>coord[0]>=piece[0] && coord[1]>=piece[1])
			}
			return false
		})

		return rangeCoordsTruncated.map(coord=>[coord[0]+coords[0][0],coord[1]+coords[0][1]])	// De-normalize valid range taking center piece as origin
	}

	/**
	 * Truncates array of coords to the first encountered piece per direction and add +1 range in that direction (to simulate leaping)
	 * @param {[[]]} coords [[x,y],[x,y],...] initial list of coordinates
	 * @param {[]} allowedPieces [{}] list of valid pieces to leap over
	 */
	checkLeapPieces = (coords,allowedPieces) => {
		allowedPieces = allowedPieces || []

		const {pieces} = this.state
		const coordsAN = coords.map(coord=>arr2an(coord))	// Convert coords into list of AN
		const piecesAllowed = pieces.filter(piece=>allowedPieces.some(allowed=>allowed.NAME===piece.NAME))
		const piecesCoords = piecesAllowed.map(piece=>piece.an).filter(an=>coordsAN.includes(an)).map(an=>an2arr(an))	// Take only pieces within range of center piece
		const piecesCoordsNormalized = piecesCoords.map(coord=>[coord[0]-coords[0][0],coord[1]-coords[0][1]])	// Normalize pieces coords taking center piece as (0,0)
		const rangeCoordsNormalized = coords.map(coord=>[coord[0]-coords[0][0],coord[1]-coords[0][1]])	// Normalize range coords taking center piece as (0,0)

		// Truncate pieces and add +1 range to piece position in that direction from origin
		const rangeCoordsTruncated = piecesCoordsNormalized.reduce((temp,coord)=>{
			// Filter x-axis coords	[0,y]
			let newCoord
			if(!coord[0] && coord[1]){
				let piecesCol = rangeCoordsNormalized.filter(coord=>!coord[0])	// x-axis pieces
				if(coord[1]>0){	// Range is above origin
					piecesCol = piecesCol.filter(coord=>coord[1]>0)
					newCoord = piecesCol.every(piece=>coord[1]<=piece[1]) && [coord[0],coord[1]+1]
				}
				else if(coord[1]<0){	// Range is below origin
					piecesCol = piecesCol.filter(coord=>coord[1]<0)
					newCoord = piecesCol.every(piece=>coord[1]>=piece[1]) && [coord[0],coord[1]-1]
				}
			}
			// Filter y-axis coords [x,0]
			else if(coord[0] && !coord[1]){
				let piecesRow = rangeCoordsNormalized.filter(coord=>!coord[1])	// y-axis pieces
				if(coord[0]>0){	// Range is right of origin
					piecesRow = piecesRow.filter(coord=>coord[0]>0)
					newCoord = piecesRow.every(piece=>coord[0]<=piece[0]) && [coord[0]+1,coord[1]]
				}
				else if(coord[0]<0){	// Range is left of origin
					piecesRow = piecesRow.filter(coord=>coord[0]<0)
					newCoord = piecesRow.every(piece=>coord[0]>=piece[0]) && [coord[0]-1,coord[1]]
				}
			}
			else {
				// Filter diagonal pieces
				let piecesDiag = rangeCoordsNormalized.filter(coord=>coord[0]&&coord[1])	// diagonal pieces
				if(coord[0]>0 && coord[1]>0){	// Range is upper-right of origin
					piecesDiag = piecesDiag.filter(coord=>coord[0]>0 && coord[1]>0)
					newCoord = piecesDiag.every(piece=>coord[0]<=piece[0] && coord[1]<=piece[1]) && [coord[0]+1,coord[1]+1]
				}
				if(coord[0]>0 && coord[1]<0){	// Range is lower-right of origin
					piecesDiag = piecesDiag.filter(coord=>coord[0]>0 && coord[1]<0)
					newCoord = piecesDiag.every(piece=>coord[0]<=piece[0] && coord[1]>=piece[1]) && [coord[0]+1,coord[1]-1]
				}
				if(coord[0]<0 && coord[1]>0){	// Range is upper-left of origin
					piecesDiag = piecesDiag.filter(coord=>coord[0]<0 && coord[1]>0)
					newCoord = piecesDiag.every(piece=>coord[0]>=piece[0] && coord[1]<=piece[1]) && [coord[0]-1,coord[1]+1]
				}
				if(coord[0]<0 && coord[1]<0){	// Range is lower-left of origin
					piecesDiag = piecesDiag.filter(coord=>coord[0]<0 && coord[1]<0)
					newCoord = piecesDiag.every(piece=>coord[0]>=piece[0] && coord[1]>=piece[1]) && [coord[0]-1,coord[1]-1]
				}
			}
			return [
				...temp,
				newCoord
			]
		},[]).filter(coord=>coord)	// Retain only valid coordinates

		return rangeCoordsTruncated.map(coord=>[coord[0]+coords[0][0],coord[1]+coords[0][1]])	// De-normalize valid range taking center piece as origin
	}

	/**
	 * Truncates array of coords to the first encountered piece in range per direction
	 * @param {[[]]} coords [[x,y],[x,y],...] initial list of coordinates
	 * @param {[]} allowedPieces [{}] list of valid pieces to leap over
	 */
	checkSwapPieces = (coords,allowedPieces) => {
		allowedPieces = allowedPieces || []

		const {pieces} = this.state
		const coordsAN = coords.map(coord=>arr2an(coord))	// Convert coords into list of AN
		const piecesAllowed = pieces.filter(piece=>allowedPieces.some(allowed=>allowed.NAME===piece.NAME))
		const piecesInRange = piecesAllowed.filter(piece=>coords.some(coord=>arr2an(coord)===piece.an))
		const piecesCoords = piecesInRange.map(piece=>piece.an).filter(an=>coordsAN.includes(an)).map(an=>an2arr(an))	// Take only pieces within range of center piece
		const piecesCoordsNormalized = piecesCoords.map(coord=>[coord[0]-coords[0][0],coord[1]-coords[0][1]])	// Normalize pieces coords taking center piece as (0,0)

		// Truncate range
		const rangeCoordsTruncated = piecesCoordsNormalized.filter(coord=>{
			// Filter x-axis coords	[0,y]
			if(!coord[0] && coord[1]){
				let piecesCol = piecesCoordsNormalized.filter(coord=>!coord[0])	// x-axis pieces
				if(coord[1]>0){
					piecesCol = piecesCol.filter(coord=>coord[1]>0)
					return piecesCol.every(piece=>coord[1]<=piece[1])
				}
				if(coord[1]<0){
					piecesCol = piecesCol.filter(coord=>coord[1]<0)
					return piecesCol.every(piece=>coord[1]>=piece[1])
				}
			}
			// Filter y-axis coords [x,0]
			if(coord[0] && !coord[1]){
				let piecesRow = piecesCoordsNormalized.filter(coord=>!coord[1])	// y-axis pieces
				if(coord[0]>0){
					piecesRow = piecesRow.filter(coord=>coord[0]>0)
					return piecesRow.every(piece=>coord[0]<=piece[0])
				}
				if(coord[0]<0){
					piecesRow = piecesRow.filter(coord=>coord[0]<0)
					return piecesRow.every(piece=>coord[0]>=piece[0])
				}
			}
			// Filter diagonal pieces
			let piecesDiag = piecesCoordsNormalized.filter(coord=>coord[0]&&coord[1])	// diagonal pieces
			if(coord[0]>0 && coord[1]>0){
				piecesDiag = piecesDiag.filter(coord=>coord[0]>0 && coord[1]>0)
				return piecesDiag.every(piece=>coord[0]<=piece[0] && coord[1]<=piece[1])
			}
			if(coord[0]>0 && coord[1]<0){
				piecesDiag = piecesDiag.filter(coord=>coord[0]>0 && coord[1]<0)
				return piecesDiag.every(piece=>coord[0]<=piece[0] && coord[1]>=piece[1])
			}
			if(coord[0]<0 && coord[1]>0){
				piecesDiag = piecesDiag.filter(coord=>coord[0]<0 && coord[1]>0)
				return piecesDiag.every(piece=>coord[0]>=piece[0] && coord[1]<=piece[1])
			}
			if(coord[0]<0 && coord[1]<0){
				piecesDiag = piecesDiag.filter(coord=>coord[0]<0 && coord[1]<0)
				return piecesDiag.every(piece=>coord[0]>=piece[0] && coord[1]>=piece[1])
			}
			return false
		})


		return rangeCoordsTruncated.map(coord=>[coord[0]+coords[0][0],coord[1]+coords[0][1]])	// De-normalize valid range taking center piece as origin
	}

	/**
	 * Logic handling dragging pieces
	 * @param {*} e event
	 */
	handleDragStart = e => {
		e.dataTransfer.setData('piece',e.target.getAttribute('data-piece'))
		e.dataTransfer.dropEffect = 'link'	// Allows dragdrop

		// Highlight tiles to indicate legal movement
		this.setState({
			legalTiles: this.checkMoves(JSON.parse(e.target.getAttribute('data-piece')))
		})
	}

	/**
	 * Logic allowing dropping of pieces on tile
	 * @param {*} e event
	 */
	handleDragOver = e => {
		//const targetTile = JSON.parse(e.target.getAttribute('data-tile'))
		e.preventDefault()	// Activates dragdrop
		e.dataTransfer.dropEffect = 'link'	// Allows dragdrop
	}

	/**
	 * Logic executing dropping pieces on a target tile
	 * @param {*} e event
	 */
	handleDrop = e => {
		e.preventDefault()	// Activates dragdrop
		const dropPiece = JSON.parse(e.dataTransfer.getData('piece'))
		const targetTile = JSON.parse(e.target.getAttribute('data-tile'))

		this.setState({legalTiles:[]})

		// Check for no-drop conditions
		if(!targetTile || dropPiece.an === targetTile.an) return // We don't care about self-drops
		if(!this.state.legalTiles.includes(targetTile.an)) return // Tile is not on legalTiles list

		// Update AN of piece
		const {pieces} = this.state

		// If drop piece is an Assassin and tile pieces are Court pieces, execute a swap instad of a capture
		if(targetTile.piece && dropPiece.NAME === PIECE.ASSASSIN.NAME && dropPiece.PLAYER_NAME === targetTile.piece.PLAYER_NAME) return this.setState({
			pieces: [
				...pieces.filter(piece=>![dropPiece.an,targetTile.an].includes(piece.an)),
				{
					...dropPiece,
					an: targetTile.an
				},
				{
					...targetTile.piece,
					an: dropPiece.an,
				}
			]
		},this.checkMovesLeft)

		// Move piece into new position (implies capture)
		this.setState({
			pieces: [
				...pieces.filter(doc=>doc.an!==dropPiece.an),
				{
					...dropPiece,
					an: targetTile.an
				}
			]
		},this.checkMovesLeft)
	}

	/**
	 * Logic executing conversion of pieces
	 * @param {*} e event
	 */
	handleDoubleClick = e => {
		const targetPiece = JSON.parse(e.target.getAttribute('data-piece'))

		if(targetPiece.NAME === PIECE.POP.NAME){
			const {pieces} = this.state
			this.setState({
				pieces: [
					...pieces.filter(piece=>piece.an!==targetPiece.an),
					{
						...PIECE.MERCHANT,
						index: targetPiece.index,
						an: targetPiece.an
					}
				]
			})
		}
	}

	render(){
		const {player,movesLeft,pieces,legalTiles} = this.state
		return <div style={{fontSize:'.8em'}}>
			<h1 style={{textAlign:'center',margin:'0em',color: player && player.NAME===PLAYER.ROYAL.NAME ? 'skyblue' : 'tomato'}}>{player ? `${player.NAME}'S TURN` : 'PROC'}</h1>
			<h3 style={{textAlign:'center',margin:'0em',color: player && player.NAME===PLAYER.ROYAL.NAME ? 'skyblue' : 'tomato'}}>{player ? `${movesLeft} move${movesLeft>1?'s':''} left` : ''}</h3>
			<div style={{display:'inline-block'}}>
				<GameBoard
					rowSize={this.state[BOARD.ROW_SIZE]}
					colSize={this.state[BOARD.COL_SIZE]}
					{...{
						pieces, legalTiles,
						handleDragOver: this.handleDragOver,
						handleDragStart: this.handleDragStart,
						handleDrop: this.handleDrop,
						handleDoubleClick: this.handleDoubleClick
					}}
				/>
			</div>
			<div style={{display:'inline-block'}}>
				<SideBoard
					rowSize={this.state[BOARD.ROW_SIZE]}
					colSize={1}
					{...{
						pieces: [], legalTiles,
						handleDragStart: this.handleDragStart,
					}}
				/>
			</div>
		</div>
	}
}