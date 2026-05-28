// =========================
// SPLASH SCREEN SCENE
// =========================

class SplashScreen extends Phaser.Scene {
    constructor() {
        super({ key: "SplashScreen" });
        this.timeElapsed = 0;
    }

    preload() {
        // Load assets needed for splash screen
        this.load.image("splash", "assets/splash.png");
    }

    create() {
        // Background
        this.add.rectangle(360, 640, 720, 1280, 0xdaeb87);

        // Decorative animals
        this.add.sprite(360, 640, "splash").setDisplaySize(720, 1280).setAlpha(0.7);

        // Title
        const titleText = this.add.text(360, 50, "Animal Escape Run", {
            fontSize: "48px",
            fill: "#000",
            fontStyle: "bold",
            align: "center"
        }).setOrigin(0.5);

        titleText.setShadow(2, 2, "#fff", 2);

        // Start instruction
        const startText = this.add.text(360, 1250, "Tap / Click to Start", {
            fontSize: "42px",
            fontWeight: "bold",
            fill: "#000",
            align: "center"
        }).setOrigin(0.5);

        startText.setShadow(2, 2, "#fff", 2);

        // Input listener
        this.input.on("pointerdown", () => {
            this.scene.start("AnimalSelection");
        });

        this.input.keyboard.on("keydown", () => {
            this.scene.start("AnimalSelection");
        });

        // Auto-transition after 4 seconds
        this.time.delayedCall(4000, () => {
            if (this.scene.isActive()) {
                this.scene.start("AnimalSelection");
            }
        });
    }

    update() {
        // Can add animations here in future
    }
}

// =========================
// ANIMAL SELECTION SCENE
// =========================

class AnimalSelection extends Phaser.Scene {
    constructor() {
        super({ key: "AnimalSelection" });
        this.selectedAnimal = "goat";
    }

    preload() {
        this.load.image("goat", "assets/goat.png");
        this.load.image("sheep", "assets/sheep.png");
        this.load.image("cow", "assets/cow.png");
        this.load.image("camel", "assets/camel.png");
    }

    create() {
        // Background
        this.add.rectangle(360, 640, 720, 1280, 0xdaeb87);

        // Title
        this.add.text(360, 100, "Select your animal", {
            fontSize: "40px",
            fill: "#000",
            fontStyle: "bold",
            align: "center"
        }).setOrigin(0.5);

        // Animal options - 2x2 grid
        const animals = ["goat", "sheep", "cow", "camel"];
        const positions = [
            { x: 220, y: 400 },
            { x: 500, y: 400 },
            { x: 220, y: 700 },
            { x: 500, y: 700 }
        ];

        animals.forEach((animal, index) => {
            const pos = positions[index];
            
            // Create animal sprite
            const sprite = this.add.sprite(pos.x, pos.y, animal);
            sprite.setDisplaySize(150, 150);
            sprite.setDepth(5);
            sprite.setInteractive();
            sprite.on("pointerdown", () => this.selectAnimal(animal));
            sprite.on("pointerover", () => {
                // sprite.setScale(1.01);
                sprite.setTint(0xf0f0fa);
            });
            sprite.on("pointerout", () => {
                // sprite.setScale(1.0);
                sprite.clearTint();
            });

            // Label
            this.add.text(pos.x, pos.y + 100, animal.toUpperCase(), {
                fontSize: "18px",
                fill: "#000",
                align: "center"
            }).setOrigin(0.5);
        });

        // Instructions
        this.add.text(360, 1100, "Click an animal to select", {
            fontSize: "24px",
            fill: "#000",
            align: "center"
        }).setOrigin(0.5);
    }

    selectAnimal(animal) {
        // Pass selected animal to MainGame
        this.scene.start("MainGame", { selectedAnimal: animal });
    }
}

// =========================
// MAIN GAME SCENE
// =========================

class MainGame extends Phaser.Scene {
    constructor() {
        super({ key: "MainGame" });
        
        // Game state
        this.player = null;
        this.cursors = null;
        this.spaceKey = null;

        this.leftSide = null;
        this.rightSide = null;
        this.road = null;
        this.laneLines = null;

        this.obstacles = [];

        this.score = 0;
        this.scoreText = null;

        this.gameOver = false;

        this.lanes = [225, 360, 495];
        this.currentLane = 1;
        
        this.selectedAnimal = "goat";
    }

    init(data) {
        // Receive selected animal from AnimalSelection
        if (data && data.selectedAnimal) {
            this.selectedAnimal = data.selectedAnimal;
        }
    }

    preload() {
        this.load.image("grassL", "assets/left.png");
        this.load.image("grassR", "assets/right.png");
        this.load.image("road", "assets/road.png");
        this.load.image("lanes", "assets/lanes.png");

        this.load.image("goat", "assets/goat.png");
        this.load.image("sheep", "assets/sheep.png");
        this.load.image("cow", "assets/cow.png");
        this.load.image("camel", "assets/camel.png");

        this.load.image("knife", "assets/knife.png");
    }

    create() {
        // Reset game state
        this.gameOver = false;
        this.score = 0;
        this.currentLane = 1;
        this.obstacles = [];

        // =====================
        // LAYERS (ROAD SYSTEM)
        // =====================

        this.leftSide = this.add.tileSprite(0, 640, 135, 1280, "grassL")
            .setOrigin(0, 0.5)
            .setDepth(0);

        this.rightSide = this.add.tileSprite(720, 640, 135, 1280, "grassR")
            .setOrigin(1, 0.5)
            .setDepth(0);

        this.road = this.add.tileSprite(360, 640, 450, 1280, "road")
            .setDepth(1);

        this.laneLines = this.add.tileSprite(360, 640, 450, 1280, "lanes")
            .setDepth(2);

        // =====================
        // PLAYER
        // =====================

        const floorY = 1140;
        const playerY = floorY - 70;
        this.player = this.physics.add.sprite(this.lanes[this.currentLane], playerY, this.selectedAnimal);

        this.player.setDisplaySize(140, 140);
        this.player.setDepth(5);
        this.player.setCollideWorldBounds(true);

        // better hitbox aligned to sprite bottom
        this.player.body.setSize(60, 80);
        this.player.body.setOffset(40, 60);

        // invisible floor line to stop player at y=1140
        const floor = this.add.rectangle(360, floorY, 720, 10, 0x000000, 0);
        this.physics.add.existing(floor, true);
        this.physics.add.collider(this.player, floor);

        // =====================
        // INPUT
        // =====================

        this.cursors = this.input.keyboard.createCursorKeys();

        this.spaceKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        // =====================
        // UI
        // =====================

        this.scoreText = this.add.text(30, 30, "Score: 0", {
            fontSize: "34px",
            fill: "#f00",
            fontStyle: "bold"
        }).setDepth(10);

        this.scoreText.setShadow(2, 2, "#000", 2);

        // =====================
        // SPAWN LOOP
        // =====================

        this.time.addEvent({
            delay: 1200,
            loop: true,
            callback: () => this.spawnObstacle()
        });

        // =====================
        // SCORE LOOP
        // =====================

        this.time.addEvent({
            delay: 120,
            loop: true,
            callback: () => {
                if (!this.gameOver) {
                    this.score++;
                    this.scoreText.setText("Score: " + this.score);
                }
            }
        });
    }

    update() {
        if (this.gameOver) return;

        // =====================
        // SCROLL ENVIRONMENT
        // =====================

        this.leftSide.tilePositionY -= 10;
        this.rightSide.tilePositionY -= 10;
        this.road.tilePositionY -= 14;
        this.laneLines.tilePositionY -= 14;

        // =====================
        // CONTROLS
        // =====================

        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) this.moveLeft();
        if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) this.moveRight();

        if (
            (Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
             Phaser.Input.Keyboard.JustDown(this.spaceKey))
            && this.player.body.blocked.down
        ) {
            this.player.setVelocityY(-900);
        }

        // =====================
        // OBSTACLE UPDATE
        // =====================

        for (let i = this.obstacles.length - 1; i >= 0; i--) {

            let o = this.obstacles[i];

            // move forward (towards player)
            o.y += o.speed;

            // scale as it approaches
            let scale = 0.3 + (o.y / 1280);
            o.setDisplaySize(90 * scale, 90 * scale);

            // collision check
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, o.x, o.y) < 70) {
                this.hitGameOver();
                return;
            }

            // cleanup
            if (o.y > 1400) {
                o.destroy();
                this.obstacles.splice(i, 1);
            }
        }
    }

    spawnObstacle() {
        if (this.gameOver) return;

        const types = ["knife", "sheep", "cow", "camel"];
        const type = types[Phaser.Math.Between(0, types.length - 1)];

        const laneIndex = Phaser.Math.Between(0, 2);

        let o = this.add.sprite(this.lanes[laneIndex], 0, type);

        o.setDisplaySize(80, 80);
        o.setDepth(3);

        o.speed = Phaser.Math.Between(6, 10);

        this.obstacles.push(o);
    }

    moveLeft() {
        if (this.currentLane > 0) {
            this.currentLane--;

            this.tweens.add({
                targets: this.player,
                x: this.lanes[this.currentLane],
                duration: 120
            });
        }
    }

    moveRight() {
        if (this.currentLane < 2) {
            this.currentLane++;

            this.tweens.add({
                targets: this.player,
                x: this.lanes[this.currentLane],
                duration: 120
            });
        }
    }

    hitGameOver() {
        if (this.gameOver) return;

        this.gameOver = true;

        this.player.setTint(0xff0000);

        this.physics.pause();

        this.add.rectangle(360, 640, 520, 300, 0x000000, 0.8)
            .setDepth(20);

        this.add.text(220, 520, "GAME OVER", {
            fontSize: "50px",
            fill: "#ff4444",
            fontStyle: "bold"
        }).setDepth(21);

        this.add.text(240, 600, "Score: " + this.score, {
            fontSize: "32px",
            fill: "#f44"
        }).setDepth(21);

        this.add.text(220, 680, "Click to Return to Menu", {
            fontSize: "22px",
            fill: "#f44"
        }).setDepth(21);

        // Allow returning to splash screen
        this.input.once("pointerdown", () => {
            this.scene.start("SplashScreen");
        });
    }
}

// =========================
// GAME CONFIG
// =========================

const config = {

    type: Phaser.AUTO,

    width: 720,
    height: 1280,

    parent: "game-container",

    backgroundColor: "#daeb87",

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 1700 },
            debug: false
        }
    },

    scene: [SplashScreen, AnimalSelection, MainGame]
};

new Phaser.Game(config);