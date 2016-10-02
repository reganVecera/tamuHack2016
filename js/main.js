Phaser;

var game = new Phaser.Game(1080, 720, Phaser.AUTO, 'canvas', { preload: preload, create: create, update: update });

function preload(){
    game.load.spritesheet('BlockGuy', '../src/BlockGuy32.png', 32, 32, 7); //32*32 frame size, 7 frames in the spritesheet
    //game.load.image('player','../src/left32-white.png');   //use for backgrounds
    
}
var player;
var platforms;
var cursors;
var jumpButton;
function create(){
    game.stage.backgroundColor = '#85b5e1';
    //game.physics.startSystem(Phaser.Phsyics.ARCADE);
    //players = game.add.group();
    //players.enableBody = true;
    
    //Boot physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //Universal gravity
    game.physics.arcade.gravity.y = 300;
    //Creating the player instance at x, y coordinate
    player = game.add.sprite(32, 320, 'BlockGuy');
    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.collideWorldBounds = true;
    player.body.gravity.y = 1000;
    player.body.maxVelocity.y = 500;
    player.body.setSize(32, 32, 5, 16);   //width height x y

    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('turn', [4], 20, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    
    
    
    
}

function update(){
    
}


