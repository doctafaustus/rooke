import './style.css';
import Phaser from 'phaser';

// Game scene
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.player = null;
    this.cat = null;
    this.cursors = null;
    this.dialogBox = null;
    this.dialogText = null;
    this.isShowingDialog = false;
  }

  preload() {
    // Load the cat image
    this.load.image('cat', '/cat.png');
    // Load the house image
    this.load.image('house', '/house.png');
  }

  create() {
    // Create a simple town background (black ground)
    this.add.rectangle(0, 0, 1024, 768, 0x000000).setOrigin(0);

    // Create static physics group for houses
    this.houses = this.physics.add.staticGroup();

    const house1 = this.houses.create(100, 100, 'house');
    house1.setScale(0.3);
    house1.refreshBody();

    const house2 = this.houses.create(600, 100, 'house');
    house2.setScale(0.25);
    house2.refreshBody();

    const house3 = this.houses.create(350, 400, 'house');
    house3.setScale(0.25);
    house3.refreshBody();

    // Create player (blue square) with physics
    this.player = this.add.rectangle(512, 384, 32, 32, 0x3498db);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Add collision between player and houses
    this.physics.add.collider(this.player, this.houses);

    // Create NPC cat using the loaded image
    this.cat = this.add.image(200, 300, 'cat');
    this.cat.setScale(0.2); // Adjust scale if needed

    // Create dialog box (hidden initially)
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

    // Enable keyboard input
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

    // Add instructions
    this.add.text(10, 10, 'Arrow keys or WASD to move\nSpace to talk to cat', {
      fontSize: '16px',
      color: '#333333',
    });
  }

  update() {
    if (this.isShowingDialog) {
      // Close dialog with space
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.hideDialog();
      }
      return;
    }

    // Player movement with physics
    const speed = 320;
    this.player.body.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.body.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.body.setVelocityY(speed);
    }

    // Check if player is near cat and presses space
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

// Phaser game configuration
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

// Create the game
const game = new Phaser.Game(config);
