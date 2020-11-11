# PROC

## Running the project

1. Clone this repo to your machine.
2. Install Node and npm.
3. Run <code>npm install</code> in your cloned folder.
4. Run <code>npm start</code> in your cloned folder.
5. <code>localhost:3000</code> should load in your default browser automatically after a minute. Otherwise, do that manually.

## Objective

- Just a random board game built to practice React and game design in general.
- Created with the MVC framework in mind:
	- Model resides as state in App component.
	- Controller resides in App component (indicated by "handleXYZ" nomenclature).
	- View branches from Board component.
	- Subject to change.

## Gameplay

- Basic idea of the game:
	- 2 players:
		1. Royal player
			- x01 King
			- x02 Knights
		2. Court player
			- x02 Assassins (positions always unknown to Court player, looks like a Pop to them)
			- x0N Pops, depending on size of the board.
			- x0N Merchants, depending on size of the board.

	- Players take alternate turns:
		- Royal player moves 2 different pieces during their turn.
		- Court player moves 1 piece and converts a Pop into a Mechant (Revealing that it isn't an Assassin).

	- Royal player win conditions:
		1. Move the King piece onto E1.
		2. Capture any Assassin piece.

	- Court player win conditions:
		1. Capture the King piece.
		2. Trick the Royal player into capturing a non-Assassin piece.

- Piece rules:

	``` Each tile can only hold one piece. Pieces either move into an empty tile or capture the occupant piece if permitted. ```

	- King:
		1. Move one tile vertically.
		2. Leap over one Knight onto an empty tile.
		3. Can capture any Court piece.

	- Knight:
		1. Move any number of tiles laterally or diagonally. Cannot leap over other pieces this way.
		2. Can capture any Court piece.

	- Pop / Merchant:
		1. Move one tile laterally or diagonally. Can leap over one other Court piece this way.

	- Assassin:
		1. Move one tile laterally or diagonally. Can leap over one other Court piece this way. Can capture the King this way.
		2. Can swap positions with another Court piece directly laterally or diagonally opposite itself. No range limit to this swap.
		3. If a King is positioned laterally or diagonally in between two Assassins, the King is captured.

## Notes

- Knowledge is valuable to the Royal player. Balance gameplay on this principle.
- P2P networking to be added in later. WebRTC probably.
- Set a few test scenarios.

## Built with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
