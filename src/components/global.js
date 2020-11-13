/**
 * Board variables
 */
export const BOARD = {
    COL_SIZE: 'board-col-size',
    ROW_SIZE: 'board-row-size',
}

/**
 * Player tracker
 */
export const PLAYER = {
    ROYAL: {
        MOVES: 2,
        NAME: 'ROYAL'
    },
    COURT: {
        MOVES: 1,
        NAME: 'COURT'
    },
}

export const PHASES = {

}

/**
 * Symbols of game pieces
 */
export const PIECE = {
    KING: {
        SYMBOL: '♛',
        NAME: 'King',
        PLAYER_NAME: PLAYER.ROYAL.NAME,
        COLOR: 'skyblue',
        TOOLTIP: 'The King can move downwards or upwards one step. If the King is captured, the Court player wins.'
    },
    KNIGHT: {
        SYMBOL: '♞',
        NAME: 'Knight',
        PLAYER_NAME: PLAYER.ROYAL.NAME,
        COLOR: 'skyblue',
        TOOLTIP: 'The Knight can move diagonally or laterally any number of steps and turn in any direction. Court pieces in direct line-of-sight of the Knight cannot be moved during the Court player`s turn. Knights can capture any Court piece by moving onto its square. If a Knight captures an Assassin piece, the Royal player wins. If the Knight captures a non-Assassin piece that is not laterally adjacent to the King piece, the Court player wins.'
    },
    POP: {
        SYMBOL: '♟',
        NAME: 'Pop',
        PLAYER_NAME: PLAYER.COURT.NAME,
        COLOR: 'white',
        TOOLTIP: 'The Pop can move diagonally or laterally one step. If the Pop is captured, the Court player wins.'
    },
    MERCHANT: {
        SYMBOL: '♜',
        NAME: 'Merchant',
        PLAYER_NAME: PLAYER.COURT.NAME,
        COLOR: 'yellow',
        TOOLTIP: 'The Merchant can move diagonally or laterally one step. Only played in a Merchant-version of Proc. The Royal replaces a Court piece on both sides of the board after the Court has placed their pieces. Court pieces are not revealed this way. The Royal wins if both Assassins are replaced.'
    },
    ASSASSIN: {
        SYMBOL: '♝',
        NAME: 'Assassin',
        PLAYER_NAME: PLAYER.COURT.NAME,
        COLOR: 'tomato',
        TOOLTIP: 'The Assassin can move laterally any number of steps. The Assassins can swap positions with another Court piece in direct line-of-sight. If the Assassin is captured by a Knight, the Royal wins. The Assassin can capture the King by moving onto its square and there are no Knights one space diagonal or lateral from the King. The Assassin can also capture the King if the King is the only piece in the middle of two diagonally or laterally opposite Assassins. If the King is captured, the Court wins.'
    },
}

/**
 * Converts int into corresponding alphabet
 * @param {*} num
 * @param {*} tail
 */
const baseNum = 26
export const num2Alpha = (num,tail) => {
	const realTail = tail || ''
	if(num===undefined || isNaN(num) || num < 0) return ''    // Ignore invalid num
	if(num<baseNum) return `${String.fromCharCode(num+65)}${realTail}`

	const remainder = num % baseNum
	const quotient = Math.floor(num/baseNum)-1
	return num2Alpha(quotient,`${String.fromCharCode(remainder+65)}${realTail}`)
}

/**
 * Converts alphabets into corresponding int
 * @param {*} tail input string
 * @param {*} num optional
 */
export const alpha2Num = (tail,num) => {
	const realNum = num || 0
	if(tail===undefined) return 0
	const alphaOnly = tail.replace(/[\d]/g,'').toUpperCase() // Reduce string to only alphabets and force uppercase
	if(!alphaOnly.length) return realNum-1  // Start counting from 0

	const val = (alphaOnly.charCodeAt(0)-64) * (26 ** (alphaOnly.length-1)) // Get base-26 val of first alphabet
	const remainder = alphaOnly.replace(/[\D]/,'') // Remove the first alphabet
	return alpha2Num(remainder,realNum+val)
}

/**
 * Converts algebraic notation to int coordinates
 * @param {*} an
 */
export const an2arr = an => {
	if(!an) return [0,0]
	const col = alpha2Num(an.replace(/[\d]/g,''))
	const row = an.replace(/[\D]/g,'')
	return [col,row ? parseInt(row) : 0]    // Ensure int exists else return row === 0
}

/**
 * Converts int coordinates to algebraic notation
 * @param {*} arr
 */
export const arr2an = arr => {
	if(!arr || arr.length !== 2) return 'A1'
	const col = num2Alpha(arr[0])
	const row = arr[1].toString()
	return `${col}${row}`
}

/* const testVals = [0,1,26,27]
const testAlphas = ['A','B','AA','AB']
testVals.forEach(val=>console.info(val,num2Alpha(val),alpha2Num(num2Alpha(val))))
testAlphas.forEach(val=>console.info(val,alpha2Num(val),num2Alpha(alpha2Num(val)))) */

/**
 * Shuffles an input array (clones a copy)
 * @param {*} arr
 */
export const shuffleArray = (arr) => {
    const cloned = JSON.parse(JSON.stringify(arr))
    for (let i = cloned.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [cloned[i], cloned[j]] = [cloned[j], cloned[i]]
    }
    return cloned
}