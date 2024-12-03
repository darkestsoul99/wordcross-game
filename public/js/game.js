import WordPlacer from './utils/WordPlacer.js';

class ScrabbleGame extends Phaser.Scene {
    constructor() {
        super({ key: 'ScrabbleGame' });
        this.words = [
            "seat", "set", "eat", "east", "tea"
        ]; // The words that will be used in the game
        this.gridConfig = {
            rows: 7,
            cols: 7,
            cellWidth: 100,
            cellHeight: 100
        } // The configuration for the grid
    }

    preload() {
        this.load.image('background_1', '../assets/background/1.png');
        this.load.image('background_2', '../assets/background/2.png');
        this.load.image('background_3', '../assets/background/3.png');
        this.load.image('background_4', '../assets/background/4.png');

        this.load.image('refresh', '../assets/refresh.png');
        this.load.atlasXML(
            'tiles',
            '../assets/Spritesheet/blue_spritesheet.png',
            '../assets/Spritesheet/blue_spritesheet.xml'
        );
    }

    create() {
        this.createBackground();
        this.createGrid();
        this.wordPlacer = new WordPlacer(this);
        this.refreshGame();
    }

    update() {
        this.updateBackground();
    }

    /**
     * Update the background images to create a scrolling effect
     * **/
    updateBackground() {
        this.sky.tilePositionX += 0.2;
        this.skyLine.tilePositionX += 0.3;
        this.cloudsSmall.tilePositionX += 1;
        this.cloudsBig.tilePositionX += 0.5;
    }

    /**
     * Refresh the game by clearing the board and placing new words
     * **/
    refreshGame() {
        this.clearBoard();
        this.wordPlacer.placeWords(this.words);
    }

    /**
     * Clear the board by destroying all tiles
     * **/
    clearBoard() {
        this.children.list
            .filter(child => child.texture?.key === 'tiles')
            .forEach(child => child.destroy());
    }

    createBackground() {
        const width = this.scale.width;
        const height = this.scale.height;
        const refreshButtonOffset = 50;
        const cloudsOffset = 120;
        
        // Sky images
        this.sky = this.add.tileSprite(width * 0.5 , height * 0.5, width * 0.5, height * 0.5, 'background_1').setScale(2);
        this.skyLine = this.add.tileSprite(width * 0.5 , height * 0.5, width * 0.5, height * 0.5, 'background_2').setScale(2);
        this.cloudsSmall = this.add.tileSprite(width * 0.5 , height * 0.5 + cloudsOffset, width * 0.5, height * 0.5, 'background_3').setScale(2);
        this.cloudsBig = this.add.tileSprite(width * 0.5 , height * 0.5 + cloudsOffset, width * 0.5, height * 0.5, 'background_4').setScale(2);
        
        // Refresh button
        this.refreshButton = this.add.image(width - refreshButtonOffset, height - refreshButtonOffset, 'refresh').setScale(0.1);
        this.refreshButton.setInteractive({useHandCursor: true}).on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.refreshGame();
            this.refreshButton.disableInteractive();
            this.tweens.add({
                targets: this.refreshButton,
                rotation: this.refreshButton.rotation + Math.PI * 2,
                duration: 500,
                ease: 'Cubic.easeInOut',
                onComplete: () => {
                    this.refreshButton.setInteractive({useHandCursor: true});
                }
            });
        }); // Refresh button is set to interactive and when clicked, it refreshes the game, and rotates 360 degrees for a cool effect
    }

    /**
     * Create the grid by initializing the grid data and creating the cells
     * **/
    createGrid() {
        this.initializeGridData();
        this.createGridCells();
    }

    initializeGridData() {
        const { rows, cols, cellWidth, cellHeight } = this.gridConfig;
        
        this.grid = {
            rows,
            cols,
            cellWidth,
            cellHeight,
            offsetX: (this.scale.width - (cols * cellWidth)) / 2,
            offsetY: 100,
            cells: Array(rows).fill().map(() => Array(cols).fill(null)) // a 2D array to store cell data
        }; // Initialize the grid data
    }

    /**
     * Create the cells by iterating through the grid and creating the cells
     * **/
    createGridCells() {
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const position = this.calculateCellPosition(row, col);
                this.createCell(position, row, col);
            }
        }
    }

    /**
     * Create a cell at a given position
     * @param {Object} position - An object containing the x and y coordinates of the cell
     * @param {number} row - The row index of the cell
     * @param {number} col - The column index of the cell
     * **/
    createCell(position, row, col) {
        const cell = this.createCellBackground(position);
        const border = this.createCellBorder(position);
        const shadow = this.createCellShadow(position);

        this.grid.cells[row][col] = { x: position.x, y: position.y, rect: cell, border, shadow };

        this.setupCellInteraction(cell, border);
    }

    /**
     * =====================
     * = HELPER FUNCTIONS =
     * =====================
     */

    /**
     * Calculate the position of a cell based on its row and column
     * **/
    calculateCellPosition(row, col) {
        return {
            x: col * this.grid.cellWidth + this.grid.offsetX,
            y: row * this.grid.cellHeight + this.grid.offsetY
        };
    }

    /**
     * Create the background of a cell
     * **/
    createCellBackground(position) {
        return this.add.rectangle(
            position.x, 
            position.y, 
            this.grid.cellWidth - 4, 
            this.grid.cellHeight - 4, 
            0xffffff, 
            0.2
        );
    }

    /**
     * Create the border of a cell
     * **/
    createCellBorder(position) {
        const border = this.add.rectangle(
            position.x, 
            position.y, 
            this.grid.cellWidth, 
            this.grid.cellHeight
        );
        border.setStrokeStyle(2, 0x4a90e2);
        return border;
    }

    /**
     * Create the shadow of a cell
     * **/
    createCellShadow(position) {
        const shadow = this.add.rectangle(
            position.x + 2, 
            position.y + 2, 
            this.grid.cellWidth - 4, 
            this.grid.cellHeight - 4
        );
        shadow.setStrokeStyle(1, 0x000000, 0.1);
        return shadow;
    }

    /**
     * Setup the interaction for a cell
     * **/
    setupCellInteraction(cell, border) {
        cell.setInteractive()
            .on('pointerover', () => {
                cell.setFillStyle(0x4a90e2, 0.1);
                border.setStrokeStyle(2, 0x2171cd);
            })
            .on('pointerout', () => {
                cell.setFillStyle(0xffffff, 0.2);
                border.setStrokeStyle(2, 0x4a90e2);
            });
    }
}

var config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    scene: ScrabbleGame
};

var game = new Phaser.Game(config);
