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

    // Add some simple town elements (houses)
    const house1 = this.add.image(100, 100, 'house');
    house1.setScale(0.3);

    const house2 = this.add.image(600, 100, 'house');
    house2.setScale(0.25);

    const house3 = this.add.image(350, 400, 'house');
    house3.setScale(0.25);

    // Create player (blue square)
    this.player = this.add.rectangle(512, 384, 32, 32, 0x3498db);

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

    // Player movement
    const speed = 6;
    let moved = false;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.x -= speed;
      moved = true;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.x += speed;
      moved = true;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.y -= speed;
      moved = true;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.y += speed;
      moved = true;
    }

    // Keep player in bounds
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, 1008);
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, 752);

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
  scene: [GameScene],
  parent: 'game-container',
};

// Create the game
const game = new Phaser.Game(config);
