const WORLD_WIDTH = tile(62); //100*32 = 3200
const WORLD_HEIGHT = tile(62); //50*32 = 1600

var game = new Phaser.Game(1000, 800, Phaser.AUTO, '', { preload: preload, create: create, update: update });


function preload() {
    game.load.spritesheet('player', '../src/BlockGuy32.png', 32, 32, 7); //32*32 frame size, 7 frames in the spritesheet
    game.stage.backgroundColor = '#85b5e1';
    game.load.image('cloud', '../src/cloud.png');
    game.load.spritesheet('lava', '../src/Imported piskel.png', 32, 32, 2); //32*32 frame size, 2 frames in the spritesheet 
    game.load.image('platform1', '../phaser-2.6.2/resources/tutorials/04 Advanced TypeScript Projects/assets/loader.png');
    game.load.image('platformr', '../src/red.png');
    game.load.image('platformb','../src/blue.png');
    game.load.image('fireball', '../src/8bitFireball.png');
    game.load.image('iceball', '../src/8bitIceball.png');
    game.load.audio('laser', '../src/Laser.mp3');
    game.load.spritesheet('reaper', '../src/reaper64.png', 64, 64, 2); //64*64 frame size, 2 frames in the spritesheet
}
var text;
var player;
var varianceX;
var varianceY;
var reaper;
var platformr;
var platformb;
var platformDeath;
var cursors;
var jumpButton;
var facing = 'left';
var facingReaper = 'left';
var background;
var laser_sound;
var keys;
var shootButton;
var bulletTime = 2; //delay between shots
var bullet;
var bullets;
var last_touched_p;
var lastBlinked = new Date();
var blinkCooldown = 1000;
var leftButton, rightButton, downButton, blinkButton;
var angle;
var currentPlatformColor;
var red_platform=0, blue_platform = 1;

function create() {

   
    game.world.setBounds(0, 0, 2000, 2000);
    game.input.mouse.capture = true;
    
    //Player
    player = game.add.sprite(tile(Math.floor((Math.random() * 61)+1)), tile(4) , 'player');
    game.physics.arcade.enable(player);
    player.enableBody = true;
    player.body.collideWorldBounds = true;
    player.body.maxVelocity.x = 400;
    player.body.maxVelocity.y = 300;
    player.body.velocity.x = 0;
    player.body.setSize(32, 32, 0, 0);   //collision size, width height x-offset y-offset
    player.animations.add('left', [0, 1], 10, true);  //sprite position, fps, TRUE for idk lol
    player.animations.add('idle', [2, 3, 4], 10, true);
    player.animations.add('right', [5, 6], 10, true);
    player.body.collideWorldBounds = true;
    player.body.gravity.y = 700;
    game.camera.follow(player);
    
    var style = { font: "32px Arial", fill: "#ff0044", wordWrap: true, wordWrapWidth: player.width, align: "center", };
    
    //Bullet
    bullets = game.add.group();
    bullets.enableBody = true;
  //  bullets.createMultiple(10, 'bullet');
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetBullet, this);
    bullets.setAll('checkWorldBounds', true);
    
    //Platforms
    platformr = game.add.physicsGroup();
    platformb = game.add.physicsGroup();
 
    varianceX = 5
    varianceY = 3
    for(var i = 1; i < 62; i += 4){
        for(var j = 3; j < 62; j += 5){
            if(Math.random() >= 0.5){
                platformr.create(tile(j+Math.floor((Math.random() * varianceX)-varianceX)), 
                tile(i+Math.floor((Math.random() * varianceY)-varianceY)), 'platformr');
            }
            else{
                platformb.create(tile(j+Math.floor((Math.random() * varianceX)-varianceX)), 
                tile(i+Math.floor((Math.random() * varianceY)-varianceY)), 'platformb');
            }
        }
    }
            
            
            /*platforms = game.add.physicsGroup();
 
    for(var i = 1; i < 62; i += 4){
        for(var j = 3; j < 62; j += 5){
            platforms.create(tile(j+Math.floor((Math.random() * varianceX)-varianceX)), 
            tile(i+Math.floor((Math.random() * varianceY)-varianceY)), randomPlatform());
            
        }
    }
    */

    

    //Controls
    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.W);
    blinkButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    leftButton = game.input.keyboard.addKey(Phaser.Keyboard.A);
    rightButton = game.input.keyboard.addKey(Phaser.Keyboard.D);
    downButton = game.input.keyboard.addKey(Phaser.Keyboard.S);

    //THE FLOOR IS LAVA
    platformDeath = game.add.physicsGroup();
    var lavagrid = [WORLD_WIDTH/32+1];
    for (var i = 0; i < WORLD_WIDTH/32+1; i++){
        lavagrid[i] = platformDeath.create(tile(i), tile((WORLD_HEIGHT/32)), 'lava');
        lavagrid[i].body.immovable = true;
        lavagrid[i].body.allowGravity = false;
        lavagrid[i].body.setSize(32, 32, 0, 0);
        lavagrid[i].animations.add('flicker', [0, 1], 12, true);  //sprite position, fps, TRUE for idk lol
        lavagrid[i].animations.play('flicker');
    }
    
    
    //GRIM REAPER
    reaper = game.add.sprite(tile(10), tile(30), 'reaper');
    reaper.anchor.setTo(0.5, 0.5);
    game.physics.arcade.enable(reaper);
    reaper.body.allowRotation = false;
    reaper.enableBody = true;
    reaper.body.collideWorldBounds = true;
    reaper.body.gravity.y = 0;    //<--reaper gotta fly!
    reaper.body.velocity.x = 0;
    reaper.body.setSize(64, 64, 0, 0);   //collision size, width height x-offset y-offset
    reaper.animations.add('left', [0], 0, true);  //sprite position, fps, TRUE for idk lol
    reaper.animations.add('right', [1], 0, true);
    reaper.body.collideWorldBounds = true;
    
    //Platform collision
    platformr.setAll('body.immovable', true); //AFTER platforms created
    platformb.setAll('body.immovable', true);
    platformDeath.setAll('body.immovable', true);
    
   
}

function update(){
    player.body.maxVelocity.x = 400;
    player.body.maxVelocity.y = 300;
    player.body.acceleration.x = 0;
    player.body.acceleration.y = 0;
    reaper.rotation = game.physics.arcade.moveToObject(reaper, player, 100);
    
    //reaper.rotation = game.physics.arcade.moveToPointer(reaper, 150, game.input.activePointer, 0);
    game.physics.arcade.collide(platformDeath, player, gameOver);
    game.physics.arcade.collide(reaper, player, gameOver);
    game.physics.arcade.collide(platformr, player);
    game.physics.arcade.collide(platformb, player);
    game.physics.arcade.collide(reaper, bullets);
    // game.physics.arcade.collide(player, layer);
   
    
    
    //Weapon systems
   (game.physics.arcade.collide(platformb, player,setBlue()));
   (game.physics.arcade.collide(platformr, player, setRed()));

    if (game.input.activePointer.isDown)
    {
        game.sound.play('laser');
        fireBullet();
    }
    //Player movement
    
    if (jumpButton.isDown){
        if(player.body.onFloor() || player.body.touching.down) {
            player.body.velocity.y = -1200;
        }
        
        if(blinkButton.isDown){
            if((Date.now()-lastBlinked) > blinkCooldown){
                player.body.maxVelocity.y = 2000;
                player.body.velocity.y = -2000;
                player.body.acceleration.y = +9000;
                lastBlinked = Date.now();
            }
        }
    }
    if (leftButton.isDown){
        if (player.body.velocity.x > 0){
            player.body.acceleration.x = -2400;
        }
        else {
            player.body.acceleration.x = -1800;
        }
        
        if (facing != 'left')
        {
            player.animations.play('left');
            facing = 'left';
        }
        
        if(blinkButton.isDown){
            if((Date.now()-lastBlinked) > blinkCooldown){
                player.body.maxVelocity.x = 2000;
                player.body.velocity.x = -2000;
                player.body.acceleration.x = +9000;
                lastBlinked = Date.now();
            }
        }
    }
    else if(rightButton.isDown){
        if(player.body.velocity.x < 0){
            player.body.acceleration.x = 2400;
        }
        else{
            player.body.acceleration.x = 1800;
        }
        
        if(facing != 'right')
        {
            player.animations.play('right');
            facing = 'right';
        }
        
        if(blinkButton.isDown){
            if((Date.now()-lastBlinked) > blinkCooldown){
                player.body.maxVelocity.x = 2000;
                player.body.velocity.x = 2000;
                player.body.acceleration.x = -9000;
                lastBlinked = Date.now();
            }
        }
        
        
    }
    else{
        //smoothing out deceleration from friction
        if (player.body.velocity.x > 10){
            player.body.acceleration.x = -2400;
        }
        else if(player.body.velocity.x < -10){
            player.body.acceleration.x = 2400;
        }
        else if(player.body.velocity.x > 0.01){
            player.body.acceleration.x = -50;
        }
        else if(player.body.velocity.x < -0.01){
            player.body.acceleration.x = 50;
        }
        else{
            player.body.acceleration.x = 0;
            player.body.velocity.x = 0;
        }
        
        if (facing != 'idle')
        {
            player.animations.play('idle');
            facing = 'idle';
        }
    }
    
    //Reaper movements
    if(reaper.body.velocity.x > 0){
        facingReaper = 'right';
        reaper.animations.play('right');
    }
    else{
        facingReaper = 'left';
        reaper.animations.play('left');
    }
}
function fireBullet () {
    if(blue_platform)    //platform is blue
        bullets.createMultiple(1, 'iceball');
    else if(red_platform)
        bullets.createMultiple(1, 'fireball');
    else
        bulletTime=bulletTime;
    
    if (game.time.now > bulletTime)
    {
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            bulletTime = game.time.now + 250;
            bullet.reset(player.x - 8, player.y - 8);
            game.physics.arcade.moveToPointer(bullet, 700);
        }
    }

}

//  Called if the bullet goes out of the screen
function resetBullet (bullet) {
    bullet.kill();
}
function tile(x){
    return x*32;
}
function setRed(){
    
    red_platform = 1;
    blue_platform = 0;
    
}
function setBlue(){
    red_platform = 0;
    blue_platform = 1;
}

function gameOver(){
    player.kill();
    game.state.restart();
}

