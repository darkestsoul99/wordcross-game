/**
 * @class WordPlacer
 * @description This class is responsible for placing words on the grid
 */
class WordPlacer {
    constructor(scene) {
        this.scene = scene;
        this.letterSprites = [];
        this.placedWords = new Set();
        this.usedPositions = new Set();
    }

    placeWords(validWords) {
        // Reset the state of the grid
        this.resetState();
        // Place the words randomly on the grid
        this.placeWordsRandomly(validWords);
    }

    resetState() {
        this.letterSprites = [];
        this.usedPositions.clear();
        this.placedWords.clear();
    }

    placeWordsRandomly(words) {
        // Make a copy and shuffle it so we don't modify the original array
        const shuffledWords = [...words].sort(() => Math.random() - 0.5);
        
        shuffledWords.forEach(word => {
            // Only try placing words we haven't placed yet
            if (!this.placedWords.has(word)) {
                this.tryPlaceWord(word);
            }
        });
    }

    tryPlaceWord(word) {
        const validPositions = this.findValidPositions(word); // Find all valid positions for the word
        if (validPositions.length === 0) return false; // If there are no valid positions, return false
        const chosenPosition = validPositions[Math.floor(Math.random() * validPositions.length)]; // Choose a random position from the valid ones
        this.placeWordAtPosition(word, chosenPosition); // Place the word at the chosen position
        
        return true;
    }

    findValidPositions(word) {
        if(this.placedWords.size === 0) {
            // If no words have been placed yet, we can place the word in the center of the grid
            return this.findCenterPositions(word);
        }
        return this.findConnectingPositions(word);
    }

    findCenterPositions(word) {
        const positions = [];
        const gridCenter = Math.floor(this.scene.grid.rows / 2); // Center of the grid

        // Try both horizontal and vertical placement through center
        ['right', 'down'].forEach(direction => {
            if (this.isValidPlacement(word, gridCenter, gridCenter, direction)) {
                positions.push({ row: gridCenter, col: gridCenter, direction });
            }
        });
        return positions;
    }

    
    findConnectingPositions(word) {
        const positions = [];
        const gridSize = this.scene.grid.rows;
        
        // Check all positions in the grid
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                this.checkPositionForConnections(word, row, col, positions);
            }
        }
        return positions;
    }

    checkPositionForConnections(word, row, col, positions) {
        const existingLetter = this.getLetterAt(row, col);
        if (!existingLetter) return; // If there is no letter at the position, return

        word.split('').forEach((letter, index) => {
            if (letter === existingLetter) {
                this.checkDirectionsForPlacement(word, row, col, index, positions); // Check all directions for a connection
            }
        });
    }

    checkDirectionsForPlacement(word, row, col, index, positions) {
        ['right', 'down'].forEach(direction => {
            const startPosition = this.calculateWordStart(row, col, index, direction); // Calculate the start position of the word

            if (this.isValidPlacement(word, startPosition.row, startPosition.col, direction, row, col)) {
                positions.push({ row: startPosition.row, col: startPosition.col, direction });
            }
        });
    }

    isValidPlacement(word, startRow, startCol, direction, intersectionRow = -1, intersectionCol = -1) {
        if (!this.isWithinBoundaries(word, startRow, startCol, direction)) return false;
        if (this.hasAdjacentWords(startRow, startCol, direction, word.length)) return false;
        return this.validateWordPlacement(word, startRow, startCol, direction, intersectionRow, intersectionCol);
    }

    isWithinBoundaries(word, startRow, startCol, direction) {
        if (startRow < 0 || startCol < 0) return false;

        const endRow = direction === 'down' ? startRow + word.length : startRow;
        const endCol = direction === 'right' ? startCol + word.length : startCol;

        return endRow <= this.scene.grid.rows && endCol <= this.scene.grid.cols;
    }

    hasAdjacentWords(startRow, startCol, direction, wordLength) {
        const beforeRow = direction === 'down' ? startRow - 1 : startRow;
        const beforeCol = direction === 'right' ? startCol - 1 : startCol;

        if (this.isValidPosition(beforeRow, beforeCol) && this.getLetterAt(beforeRow, beforeCol)) {
            return true;
        }

        const afterRow = direction === 'down' ? startRow + wordLength : startRow;
        const afterCol = direction === 'right' ? startCol + wordLength : startCol;

        if (this.isValidPosition(afterRow, afterCol) && this.getLetterAt(afterRow, afterCol)) {
            return true;
        }

        return false;
    }

    validateWordPlacement(word, startRow, startCol, direction, intersectionRow, intersectionCol) {
        let hasConnection = false; // Whether the word has a connection to the previous word

        for (let i = 0; i < word.length; i++) {
            const currentPosition = this.calculateLetterPosition(startRow, startCol, i, direction);

            if (currentPosition.row === intersectionRow && currentPosition.col === intersectionCol) {
                hasConnection = true; // If the current position is the intersection, set hasConnection to true
                continue;
            }

            if (this.isPositionUsed(currentPosition.row, currentPosition.col)) return false;

            if (!this.validateCrosswords(currentPosition.row, currentPosition.col, direction, word[i])) return false;
        }
        return this.placedWords.size === 0 || hasConnection; // If it's the first word, or it has a connection, return true
    }

    validateCrosswords(row, col, direction, letter) {
        const adjacentPositions = this.getAdjacentPositions(row, col, direction);
        
        return adjacentPositions.every(pos => {
            if (!this.isValidPosition(pos.row, pos.col)) return true; // If the position is out of bounds, return true

            const adjacentLetter = this.getLetterAt(pos.row, pos.col); // Get the letter at the position
            if (!adjacentLetter) return true; // If there is no letter at the position, return true

            return this.isValidCrossWord(row, col, direction, letter); // Check if the letter is a valid crossword
        });
    }

    // Check if the letter is a valid crossword
    isValidCrossWord(row, col, direction, newLetter) {
        const crossDirection = direction === 'right' ? 'down' : 'right'; // Get the cross direction
        const crossWord = this.getWordInDirection(row, col, crossDirection, newLetter); // Get the word in the cross direction
        return crossWord.length === 1 || this.scene.words.includes(crossWord); // If the word is a single letter or it's in the list of words, return true
    }
    
    // Get the word in a given direction
    getWordInDirection(row, col, direction, letter) {
        let word = letter;
        const isHorizontal = direction === 'right';
        
        // Check both directions from our position
        [-1, 1].forEach(delta => {
            let currentRow = row;
            let currentCol = col;
            
            // Keep going until we hit an empty space or board edge
            while (true) {
                currentRow += isHorizontal ? 0 : delta;
                currentCol += isHorizontal ? delta : 0;
                
                if (!this.isValidPosition(currentRow, currentCol)) break;
                
                const nextLetter = this.getLetterAt(currentRow, currentCol);
                if (!nextLetter) break;
                
                // Add letters to start or end of word based on direction
                word = delta < 0 ? nextLetter + word : word + nextLetter;
            }
        });
        
        return word;
    }

    /**
     * =====================
     * = PLACEMENT FUNCTIONS =
     * =====================
     */

    placeWordAtPosition(word, { row, col, direction }) {
        for (let i = 0; i < word.length; i++) {
            const position = this.calculateLetterPosition(row, col, i, direction);
            // Only place letters in spots that aren't already used
            if (!this.isPositionUsed(position.row, position.col)) {
                this.placeLetter(word[i], position.row, position.col);
                this.markPositionAsUsed(position.row, position.col);
            }
        }
        this.placedWords.add(word);
    }

    // Place a letter at a given position
    placeLetter(letter, row, col) {
        const position = this.scene.grid.cells[row][col];
        const sprite = this.createLetterSprite(letter, position.x, position.y);
        this.animateLetterSprite(sprite, row, col);
        this.letterSprites.push({ sprite, letter, position: { row, col } });
    }

    // Create a letter sprite initially invisible
    createLetterSprite(letter, x, y) {
        return this.scene.add.sprite(x, y, 'tiles', `letter_${letter.toUpperCase()}.png`)
            .setScale(0)
            .setAlpha(0);
    }

    // Animate the letter appearing with a nice pop effect
    animateLetterSprite(sprite, row, col) {
        this.scene.tweens.add({
            targets: sprite,
            scale: 0.3,
            alpha: 1,
            duration: 200,
            ease: 'Back.easeOut',
            delay: (row + col) * 25  // Cascade effect based on position
        });
    }

    /**
     * =====================
     * = HELPER FUNCTIONS =
     * =====================
     */

    isValidPosition(row, col) {
        return row >= 0 && 
               row < this.scene.grid.rows && 
               col >= 0 && 
               col < this.scene.grid.cols;
    }

    getLetterAt(row, col) {
        const letterSprite = this.letterSprites.find(sprite => 
            sprite.position.row === row && sprite.position.col === col
        );
        return letterSprite?.letter || null;
    }

    getAdjacentPositions(row, col, direction) {
        return direction === 'right' 
            ? [{row: row - 1, col}, {row: row + 1, col}]
            : [{row, col: col - 1}, {row, col: col + 1}];
    }

    // Check if a position already has a letter
    isPositionUsed(row, col) {
        return this.usedPositions.has(`${row},${col}`);
    }

    // Mark a position as used
    markPositionAsUsed(row, col) {
        this.usedPositions.add(`${row},${col}`);
    }

    // Helper to figure out where each letter should go based on direction
    calculateLetterPosition(startRow, startCol, index, direction) {
        return {
            row: direction === 'down' ? startRow + index : startRow,
            col: direction === 'right' ? startCol + index : startCol
        };
    }

    calculateWordStart(row, col, index, direction) {
        return {
            row: direction === 'down' ? row - index : row,
            col: direction === 'right' ? col - index : col
        };
    }
}

export default WordPlacer;
