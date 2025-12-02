import './style.css';
import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    this.player = null;
    this.cat = null;
    this.cursors = null;

    this.dialogBox = null;
    this.dialogText = null;
    this.isShowingDialog = false;

    this.walls = null;
    this.pit = null;
  }

  preload() {
    this.load.image('cat', '/cat.png');
    this.load.image('house', '/house.png');
    this.load.image('level1', '/cave.jpg'); // your map art
    this.load.spritesheet('rooke', '/char-rooke-sprite-sheet.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  create() {
    // 🗺️ Background map
    this.add.image(0, 0, 'level1').setOrigin(0).setDepth(-10);

    // 🧭 Click-to-log coordinates
    this.input.on('pointerdown', (pointer) => {
      console.log(`Clicked at x=${pointer.x}, y=${pointer.y}`);
    });

    // 🧍 Player FIRST
    this.player = this.add.sprite(512, 380, 'rooke', 0);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Create animations for 8 directions
    if (!this.anims.exists('down')) {
      this.anims.create({ key: 'down', frames: [{ key: 'rooke', frame: 0 }], frameRate: 10 });
      this.anims.create({ key: 'down-right', frames: [{ key: 'rooke', frame: 1 }], frameRate: 10 });
      this.anims.create({ key: 'right', frames: [{ key: 'rooke', frame: 2 }], frameRate: 10 });
      this.anims.create({ key: 'up-right', frames: [{ key: 'rooke', frame: 3 }], frameRate: 10 });
      this.anims.create({ key: 'up', frames: [{ key: 'rooke', frame: 4 }], frameRate: 10 });
      this.anims.create({ key: 'up-left', frames: [{ key: 'rooke', frame: 5 }], frameRate: 10 });
      this.anims.create({ key: 'left', frames: [{ key: 'rooke', frame: 6 }], frameRate: 10 });
      this.anims.create({ key: 'down-left', frames: [{ key: 'rooke', frame: 7 }], frameRate: 10 });
    }

    // 🐱 NPC cat
    this.cat = this.add.image(200, 300, 'cat').setScale(0.2);

    // 🚧 Walls
    this.walls = this.physics.add.staticGroup();

    const makeWall = (x, y, w, h) => {
      const r = this.add.rectangle(x, y, w, h, 0xff0000, 0.25); // visible for debug
      this.physics.add.existing(r, true); // static body
      this.walls.add(r);
      return r;
    };

    // rough guesses – tune with the coordinate logger
    makeWall(512, 60, 900, 120); // top
    makeWall(70, 384, 140, 650); // left
    makeWall(512, 740, 900, 120); // bottom
    makeWall(960, 350, 150, 500); // right

    // Player collides with walls
    this.physics.add.collider(this.player, this.walls);

    // 🕳️ Pit area
    this.pit = this.add.rectangle(780, 580, 380, 260, 0x00ff00, 0.25); // visible for now
    this.physics.add.existing(this.pit, true);

    // Player overlap → fall in
    this.physics.add.overlap(this.player, this.pit, this.handlePit, null, this);

    // 💬 Dialog box
    this.dialogBox = this.add.rectangle(512, 680, 600, 100, 0x000000, 0.8);
    this.dialogBox.setStrokeStyle(2, 0xffffff);
    this.dialogBox.setVisible(false);

    this.dialogText = this.add
      .text(512, 680, '', {
        fontSize: '20px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);
    this.dialogText.setVisible(false);

    // 🎮 Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    this.add.text(
      10,
      10,
      'Click anywhere to log coordinates.\nWASD/Arrows to move.\nSpace to talk to cat.',
      {
        fontSize: '16px',
        color: '#ffffff',
      }
    );
  }

  handlePit() {
    // Check if already falling to prevent multiple triggers
    if (this.player.isFalling) return;
    this.player.isFalling = true;

    // Store current velocity direction for forward fall
    const velocityX = this.player.body.velocity.x;
    const velocityY = this.player.body.velocity.y;

    // Disable physics body
    this.player.body.enable = false;

    // Simple forward fall into pit
    this.tweens.add({
      targets: this.player,
      x: this.player.x + velocityX, // Keep moving forward
      y: this.player.y + velocityY + 200, // Fall downward into pit
      scaleX: 0.3, // Shrink to simulate distance
      scaleY: 0.3,
      alpha: 0, // Fade out
      duration: 1000,
      ease: 'Linear',
      onComplete: () => {
        this.scene.restart();
      },
    });
  }

  update() {
    if (this.isShowingDialog) {
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.hideDialog();
      }
      return;
    }

    const speed = 380;
    this.player.body.setVelocity(0);

    let moveX = 0;
    let moveY = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.body.setVelocityX(-speed);
      moveX = -1;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.body.setVelocityX(speed);
      moveX = 1;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.body.setVelocityY(-speed);
      moveY = -1;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.body.setVelocityY(speed);
      moveY = 1;
    }

    // Update sprite frame based on direction
    if (moveX !== 0 || moveY !== 0) {
      if (moveY === -1 && moveX === 0) {
        this.player.setFrame(4); // up
      } else if (moveY === 1 && moveX === 0) {
        this.player.setFrame(0); // down
      } else if (moveX === -1 && moveY === 0) {
        this.player.setFrame(6); // left
      } else if (moveX === 1 && moveY === 0) {
        this.player.setFrame(2); // right
      } else if (moveY === -1 && moveX === -1) {
        this.player.setFrame(5); // up-left
      } else if (moveY === -1 && moveX === 1) {
        this.player.setFrame(3); // up-right
      } else if (moveY === 1 && moveX === -1) {
        this.player.setFrame(7); // down-left
      } else if (moveY === 1 && moveX === 1) {
        this.player.setFrame(1); // down-right
      }
    }

    const distanceToCat = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.cat.x,
      this.cat.y
    );

    if (distanceToCat < 60 && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.showDialog("Hey kid... don't bother me.");
    }
  }

  showDialog(text) {
    this.isShowingDialog = true;
    this.dialogBox.setVisible(true);
    this.dialogText.setText(text);
    this.dialogText.setVisible(true);
  }

  hideDialog() {
    this.isShowingDialog = false;
    this.dialogBox.setVisible(false);
    this.dialogText.setVisible(false);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  backgroundColor: '#000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [GameScene],
  parent: 'game-container',
};

const game = new Phaser.Game(config);
