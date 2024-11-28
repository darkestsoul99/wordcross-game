class ScrabbleGame extends Phaser.Scene {
    constructor() {
        super({ key: 'ScrabbleGame' });
        this.words = [
            "seat", "set", "eat", "east", "tea"
        ];
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
        // Create background
        this.createBackground();
        this.createGrid();
        this.refreshGame();
    }

    update() {
        this.updateBackground();
    }

    refreshGame() {
        console.log("Game refreshed.");
        let startRow = 2;
        let startCol = 3;
        let word = this.words.at(0);
        let currentRow = startRow;
        let currentCol = startCol;
        
        this.writeWord(word, currentCol, currentRow);
    }

    createBackground() {
        const width = this.scale.width;
        const height = this.scale.height;
        const refreshButtonOffset = 50;
        const cloudsOffset = 120;

        this.sky = this.add.tileSprite(width * 0.5 , height * 0.5, width * 0.5, height * 0.5, 'background_1').setScale(2);
        this.skyLine = this.add.tileSprite(width * 0.5 , height * 0.5, width * 0.5, height * 0.5, 'background_2').setScale(2);
        this.cloudsSmall = this.add.tileSprite(width * 0.5 , height * 0.5 + cloudsOffset, width * 0.5, height * 0.5, 'background_3').setScale(2);
        this.cloudsBig = this.add.tileSprite(width * 0.5 , height * 0.5 + cloudsOffset, width * 0.5, height * 0.5, 'background_4').setScale(2);
        this.refreshButton = this.add.image(width - refreshButtonOffset, height - refreshButtonOffset, 'refresh').setScale(0.1);
        this.refreshButton.setInteractive({useHandCursor: true});
        this.refreshButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.refreshGame();
        });
    }

    createGrid() {
        const width = this.scale.width;
        const height = this.scale.height;
    
        this.grid = {
            rows: 7,
            cols: 8,
            cellWidth: 100,
            cellHeight: 100,
            offsetX: (width - (8 * 100)) / 2,
            offsetY: (height - (6 * 100)) / 2
        };
        
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const x = col * this.grid.cellWidth + this.grid.offsetX;
                const y = row * this.grid.cellHeight + this.grid.offsetY;

                const rect = this.add.rectangle(x, y, this.grid.cellWidth, this.grid.cellHeight);
                rect.setStrokeStyle(1, 0x000000);
            }
        }
    }

    updateBackground() {
        this.sky.tilePositionX += 0.2;
        this.skyLine.tilePositionX += 0.3;
        this.cloudsSmall.tilePositionX += 1;
        this.cloudsBig.tilePositionX += 0.5;
    }
    // seat
    writeWord(word, currentCol, currentRow) {
        for (let i = 0; i < word.length; i++) {
            this.writeLetter(word[i], currentCol, currentRow);
            this.words.filter(function(filteredWord) {
                if (filteredWord.startsWith(word[i]) && !filteredWord.match(word)) {
                    console.log("filtered Word found");
                    console.log(filteredWord);
                }
            });
            currentCol++;
        }
    }

    writeLetter(index, currentCol, currentRow) {
        const letter = index;
        const letterFrame = `letter_${letter.toUpperCase()}.png`;

        const x = currentCol * this.grid.cellWidth + this.grid.offsetX;
        const y = currentRow * this.grid.cellHeight + this.grid.offsetY;

        const sprite = this.add.sprite(x, y, 'tiles', letterFrame).setScale(0.3);
    }
}

var config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    scene: ScrabbleGame,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

var game = new Phaser.Game(config);
