class ScrabbleGame extends Phaser.Scene {
    constructor() {
        super({ key: 'ScrabbleGame' });
        this.letters = ["s", "e", "t", "s", "e"];
        this.letterTiles = [];
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
        const width = this.scale.width;
        const height = this.scale.height;
        const offset = 50;

        this.sky = this.add.tileSprite(width * 0.5 , height * 0.5, width * 0.5, height * 0.5, 'background_1').setScale(2);
        this.skyLine = this.add.tileSprite(width * 0.5 , height * 0.5, width * 0.5, height * 0.5, 'background_2').setScale(2);
        this.cloudsSmall = this.add.tileSprite(width * 0.5 , height * 0.5, width * 0.5, height * 0.5, 'background_3').setScale(2);
        this.cloudsBig = this.add.tileSprite(width * 0.5 , height * 0.5, width * 0.5, height * 0.5, 'background_4').setScale(2);
        this.add.image(width - offset, height - offset, 'refresh').setScale(0.1);

        let xOffset = 100;

        for (let i = 0; i < this.letters.length; i++) {
            const letter = this.letters[i];

            const letterFrame = `letter_${letter.toUpperCase()}.png`;

            const sprite = this.add.sprite(xOffset, 100, 'tiles', letterFrame).setScale(0.3);
            this.letterTiles.push(sprite);
            
            xOffset += 120;
        }
    }

    update() {
        this.sky.tilePositionX += 0.1;
        this.skyLine.tilePositionX += 0.2;
        this.cloudsSmall.tilePositionX += 0.5;
        this.cloudsBig.tilePositionX += 0.3;
    }

    static gameLogic() {

    }
}

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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
