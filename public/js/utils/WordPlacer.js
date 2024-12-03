/**
 * @class WordPlacer
 * @description This class is responsible for placing words on the grid
 */
class WordPlacer {
    /**
     * Creates a new WordPlacer instance to handle word placement on the game grid
     */
    constructor(scene) {
        this.scene = scene; // The scene that the word placer belongs to
        this.letterSprites = []; // An array to store the letter sprites
        this.placedWords = new Set(); // A set to store the placed words
        this.usedPositions = new Set(); // A set to store the positions of the used letters
    }

    /**
     * Places a collection of words on the game grid by first resetting the grid state
     * and then randomly placing each word while ensuring valid intersections
     */
    placeWords(validWords) {
        // Reset the state of the grid
        this.resetState();
        // Place the words randomly on the grid
        this.placeWordsRandomly(validWords);
    }

    /**
     * Resets the grid state by clearing all letter sprites, used positions and placed words
     * Called before placing a new set of words
     */
    resetState() {
        this.letterSprites = [];
        this.usedPositions.clear();
        this.placedWords.clear();
    }

    /**
     * Takes an array of words, shuffles them randomly, and attempts to place each word
     * on the grid while maintaining valid intersections with existing words
     */
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

    /**
     * Attempts to place a single word on the grid by finding valid positions and randomly
     * selecting one. Returns true if placement was successful, false otherwise.
     */
    tryPlaceWord(word) {
        const validPositions = this.findValidPositions(word); // Find all valid positions for the word
        if (validPositions.length === 0) return false; // If there are no valid positions, return false
        const chosenPosition = validPositions[Math.floor(Math.random() * validPositions.length)]; // Choose a random position from the valid ones
        this.placeWordAtPosition(word, chosenPosition); // Place the word at the chosen position
        
        return true;
    }

    /**
     * Finds all valid positions where a word can be placed on the grid. For the first word,
     * finds center positions. For subsequent words, finds positions that create valid intersections.
     */
    findValidPositions(word) {
        if(this.placedWords.size === 0) {
            // If no words have been placed yet, we can place the word in the center of the grid
            return this.findCenterPositions(word);
        }
        return this.findConnectingPositions(word); // Find connecting positions for the word
    }

    /**
     * Finds valid positions in the center of the grid for placing the first word.
     * Tries both horizontal and vertical orientations through the grid center.
     */
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

    /**
     * Searches the entire grid for valid positions where the word can connect with
     * existing words through letter intersections
     */
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

    /**
     * Checks if a specific grid position can form valid connections with the given word
     * by looking for matching letters and testing possible placements
     */
    checkPositionForConnections(word, row, col, positions) {
        const existingLetter = this.getLetterAt(row, col);
        if (!existingLetter) return; // If there is no letter at the position, return

        word.split('').forEach((letter, index) => {
            if (letter === existingLetter) {
                this.checkDirectionsForPlacement(word, row, col, index, positions); // Check all directions for a connection
            }
        });
    }

    /**
     * Tests both horizontal and vertical directions from a position to see if the word
     * can be validly placed while intersecting at the given letter index
     */
    checkDirectionsForPlacement(word, row, col, index, positions) {
        ['right', 'down'].forEach(direction => {
            const startPosition = this.calculateWordStart(row, col, index, direction); // Calculate the start position of the word

            if (this.isValidPlacement(word, startPosition.row, startPosition.col, direction, row, col)) {
                positions.push({ row: startPosition.row, col: startPosition.col, direction });
            }
        });
    }

    /**
     * Comprehensive check to determine if a word placement is valid by verifying boundaries,
     * adjacent words, and intersections. All conditions must pass for placement to be valid.
     */ 
    isValidPlacement(word, startRow, startCol, direction, intersectionRow = -1, intersectionCol = -1) {
        if (!this.isWithinBoundaries(word, startRow, startCol, direction)) return false;
        if (this.hasAdjacentWords(startRow, startCol, direction, word.length)) return false;
        return this.validateWordPlacement(word, startRow, startCol, direction, intersectionRow, intersectionCol);
    }

    /**
     * Verifies that a word placement stays within the grid boundaries
     */
    isWithinBoundaries(word, startRow, startCol, direction) {
        if (startRow < 0 || startCol < 0) return false;

        const endRow = direction === 'down' ? startRow + word.length : startRow;
        const endCol = direction === 'right' ? startCol + word.length : startCol;

        return endRow <= this.scene.grid.rows && endCol <= this.scene.grid.cols;
    }

    /**
     * Checks if there are any adjacent words that would make the placement invalid
     * by looking at positions before and after the word placement
     */
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

    /**
     * Validates the placement of a word by checking each letter position for conflicts
     * and ensuring proper connections with existing words
     */ 
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

    /**
     * Validates that any crosswords formed by the placement are valid words
     */
    validateCrosswords(row, col, direction, letter) {
        const adjacentPositions = this.getAdjacentPositions(row, col, direction);
        
        return adjacentPositions.every(pos => {
            if (!this.isValidPosition(pos.row, pos.col)) return true; // If the position is out of bounds, return true

            const adjacentLetter = this.getLetterAt(pos.row, pos.col); // Get the letter at the position
            if (!adjacentLetter) return true; // If there is no letter at the position, return true

            return this.isValidCrossWord(row, col, direction, letter); // Check if the letter is a valid crossword
        });
    }

    /**
     * Checks if a letter placement creates valid crosswords in the perpendicular direction
     */
    isValidCrossWord(row, col, direction, newLetter) {
        const crossDirection = direction === 'right' ? 'down' : 'right'; // Get the cross direction
        const crossWord = this.getWordInDirection(row, col, crossDirection, newLetter); // Get the word in the cross direction
        return crossWord.length === 1 || this.scene.words.includes(crossWord); // If the word is a single letter or it's in the list of words, return true
    }
    
    /**
     * Retrieves the word formed in a given direction from a position
     */
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

    /**
     * Places a word on the grid at the specified position and direction
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

    /**
     * Places a single letter on the grid with animation
     */
    placeLetter(letter, row, col) {
        const position = this.scene.grid.cells[row][col];
        const sprite = this.createLetterSprite(letter, position.x, position.y);
        this.animateLetterSprite(sprite, row, col);
        this.letterSprites.push({ sprite, letter, position: { row, col } });
    }

    /**
     * Creates an initially invisible sprite for a letter
     */
    createLetterSprite(letter, x, y) {
        return this.scene.add.sprite(x, y, 'tiles', `letter_${letter.toUpperCase()}.png`)
            .setScale(0)
            .setAlpha(0);
    }

    /**
     * Animates a letter sprite appearing with a pop effect
     */
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

    /**
     * Checks if a grid position is within bounds
     */
    isValidPosition(row, col) {
        return row >= 0 && 
               row < this.scene.grid.rows && 
               col >= 0 && 
               col < this.scene.grid.cols;
    }

    /**
     * Retrieves the letter at a grid position
     */
    getLetterAt(row, col) {
        const letterSprite = this.letterSprites.find(sprite => 
            sprite.position.row === row && sprite.position.col === col
        );
        return letterSprite?.letter || null;
    }

    /**
     * Gets adjacent positions based on word direction
     */
    getAdjacentPositions(row, col, direction) {
        return direction === 'right' 
            ? [{row: row - 1, col}, {row: row + 1, col}]
            : [{row, col: col - 1}, {row, col: col + 1}];
    }

    /**
     * Checks if a grid position is already occupied
     */
    isPositionUsed(row, col) {
        return this.usedPositions.has(`${row},${col}`);
    }

    /**
     * Marks a grid position as occupied
     */
    markPositionAsUsed(row, col) {
        this.usedPositions.add(`${row},${col}`);
    }

    /**
     * Calculates position for a letter in a word based on direction
     */
    calculateLetterPosition(startRow, startCol, index, direction) {
        return {
            row: direction === 'down' ? startRow + index : startRow,
            col: direction === 'right' ? startCol + index : startCol
        };
    }

    /**
     * Calculates starting position for a word based on intersection
     */
    calculateWordStart(row, col, index, direction) {
        return {
            row: direction === 'down' ? row - index : row,
            col: direction === 'right' ? col - index : col
        };
    }
}

export default WordPlacer;
