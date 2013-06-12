var ollie = false,
		isJumping = false,
		flip = false,
		moveParallax = 5000;

function saveScore(){
	if(window.localStorage){
		if(localStorage.getItem('highscore')){
			var storedHighScore = parseInt(localStorage.getItem('highscore'));
			if((parseInt(window.zPoints, 10) > (parseInt(storedHighScore, 10))) || storedHighScore === null) {
				localStorage.setItem('highscore', window.zPoints);
				console.log(storedHighScore, window.zPoints);
			}
		} else {
			localStorage.setItem('highscore', window.zPoints);
		}
	}
}

ig.module(
	'game.main'
)
.requires(
	'impact.game',
	'impact.entity',
	'impact.collision-map',
	'impact.background-map',
	'impact.font',
	'plugins.tween',
	'game.system.eventChain',
	'plugins.parallax'
)
.defines(function(){
	EntityBox = ig.Entity.extend({

		collides: ig.Entity.COLLIDES.FIXED,
		size: { x:100, y:50 },
		animSheet: new ig.AnimationSheet( 'images/box.png', 92, 29 ),
		type: ig.Entity.TYPE.B,

		init: function( x, y, settings ) {
			this.addAnim( 'idle', 0.1, [0] );
			this.parent( x, y, settings );
		},

		update: function() {
			this.parent();
			this.pos.x -= 4;
			if( this.pos.x - ig.game.screen.x < -32 ) {
				this.kill();
			}
		},

		pickup: function() {
			this.kill();
		}
	});


	EntityStairs = ig.Entity.extend({

		collides: ig.Entity.COLLIDES.FIXED,
		size: { x:87, y:100 },
		animSheet: new ig.AnimationSheet( 'images/stairs.png', 87, 45 ),
		type: ig.Entity.TYPE.B,

		init: function( x, y, settings ) {
			this.addAnim( 'idle', 0.1, [0] );
			this.parent( x, y, settings );
		},

		update: function() {
			this.parent();
			this.pos.x -= 4;
			if( this.pos.x - ig.game.screen.x < -32 ) {
				this.kill();
			}
		},

		pickup: function() {
			this.kill();
		}
	});



	EntityPlayer = ig.Entity.extend({
		player1:null,
		collides: ig.Entity.COLLIDES.ACTIVE,
		size: {x:100, y:100},
		type: ig.Entity.TYPE.A,
		checkAgainst: ig.Entity.TYPE.B,
		animSheet: new ig.AnimationSheet( 'images/spritesheets/spritesheet.png', 150, 115 ),

		init: function ( x , y, settings ) {
			this.addAnim( 'idle', 0.1, [
				74, 74, 74, 74,74, 74, 74, 73,72, 71, 69, 68, 67, 66, 65, 64, 63, 62,74, 74, 74
			]);
			this.addAnim( 'flip', 0.1, [
				38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26,
				25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14
			]);
			this.addAnim( 'ollie', 0.1, [
				60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50,
				49, 48, 47, 46, 45, 44, 43, 42, 41, 40, 39
			]);
			this.addAnim( 'fall', 0.5, [
				13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0
			], true);
		/*	this.chain = EventChain(this)
				.wait(.15)
				.then(function(){
					if(Math.random()*1 < .3){
						var jump  = new ig.Sound( 'media/jump.ogg' );
						jump.play();
						this.currentAnim = this.anims.ollie;
					} else {
						this.currentAnim = this.anims.flip;
					}
				})
				.then(function(){
					this.pos.y = 150;
				})
				.wait(1.3)
				.then(function(){
					this.pos.y = 192;
					ollie = false;
					this.currentAnim = this.anims.idle;
				})
				.repeat();
*/
			this.parent( x, y, settings );
			player1 = this;
		},

		tweenerFunc : function () {
			var jumpTween = this.tween({pos: { y: 130}}, 0.6,{easing:ig.Tween.Easing.Sinusoidal.EaseOut});
			var flyTween = this.tween({pos: { y: 120}}, 0.4,{easing:ig.Tween.Easing.Sinusoidal.EaseOut,delay:0.2});
			var fallTween = this.tween({pos: { y: 192}}, 0.2,{easing:ig.Tween.Easing.Sinusoidal.EaseOut,
				onComplete:function(){
					player1.resetAnimation();
				}
			});
			var jump  = new ig.Sound( 'media/jump.ogg' );
			jump.play();

			if(Math.random()*1 < .3){
				this.currentAnim = this.anims.ollie;
			} else {
				this.currentAnim = this.anims.flip;
			}
			jumpTween.chain(flyTween);
			flyTween.chain(fallTween);
			jumpTween.start();
		},

		resetAnimation: function () {
			this.TweenOnce = false;
			ollie = false;
			this.currentAnim = this.anims.idle;
		},

		update: function () {
			if ( ollie === true && !player1.TweenOnce ) {
				this.tweenerFunc();
      			this.TweenOnce = true;
    		}

			this.parent();
		},

		check: function( other ) {
			this.currentAnim = this.anims.fall;
			moveParallax = 1000;
			var dead = new ig.Sound( 'media/boom.ogg' );

			ig.music.stop();
			dead.play();

			window.setTimeout(function(){
				ig.system.stopRunLoop.call(ig.system);
				document.querySelector('#play_pause').style.display = 'none';
				document.querySelector('#gameover_modal').style.display = 'block';
				saveScore();
			}, 1550);
		}
	});

	GameLoader = ig.Loader.extend({
		draw: function() {
			var w = ig.system.realWidth,
					h = ig.system.realHeight;
			ig.system.context.fillStyle = '#000000';
			ig.system.context.fillRect( 0, 0, w, h );

			var percentage = (this.status * 100).round() + '%';
			ig.system.context.fillStyle = '#ffffff';
			ig.system.context.fillText( percentage, w/2,  h/2 );
		}
	});

	StickSk8rGame = ig.Game.extend({
		// Load a font
		font: new ig.Font( 'images/fonts/kartoon.font.png' ),
		fontRed: new ig.Font( 'images/fonts/kartoon.font.red.png' ),
		parallax: null,
		player: null,

		init: function() {
			// Initialize your game here; bind keys etc.
			this.parallax = new Parallax();
			this.parallax.add('images/parallax/grid.png', {distance: 100, y: 0});
			this.parallax.add('images/parallax/cloud.png', {distance: 90, y: 30});
			this.parallax.add('images/parallax/cloud2.png', {distance: 70, y: 90});
			this.parallax.add('images/parallax/mountain.png', {distance: 40, y: 140});
			this.parallax.add('images/parallax/buildings.png', {distance: 20, y: 120});
			this.timer = new ig.Timer();
			this.player = this.spawnEntity( EntityPlayer, 20, 192 );
			this.chain = EventChain(this)
				.wait(3)
				.then(function(){
					this.placeBox();
				})
				.repeat();

			ig.music.add( 'media/jumpshot.ogg' );
			ig.music.volume = 0.5;
			ig.music.play();

		},

		placeBox: function() {
			// Randomly find a free spot for the coin, max 12 tries
			var y = 272;//ig.system.height-45;
			var x = ig.system.width; //ig.system.realWidth;
			if(Math.random()*1 < .6){
				this.spawnEntity( EntityBox, x, y );
			}else{
				this.spawnEntity( EntityStairs, x, y );
			}
		},

		update: function() {
			this.parallax.move(moveParallax);
			this.chain();
			this.parent();

			if (this.timer.delta() > 0) {
				this.points = (this.timer.delta() / 1.8).toFixed(1);
			}
		},

		draw: function() {
			// Draw all entities and backgroundMaps
			this.parent();
			this.parallax.draw();

			for( var i = 0; i < this.entities.length; i++ ) {
				this.entities[i].draw();
			}
			// Add your own drawing code here
			var x = ig.system.width/2,
					y = ig.system.height/2;
					window.zPoints = this.points.replace(/^(-?)0+/,'$1').replace('.', '');

			// this.font.draw( 'StIcK Sk8teR', x, y, ig.Font.ALIGN.CENTER );
			this.font.draw( 'Points:', 10, 9, ig.Font.ALIGN.LEFT );
			this.font.draw( window.zPoints, 120, 9, ig.Font.ALIGN.LEFT );
			if(window.localStorage){
				if(window.localStorage.getItem('highscore') !== null){
					this.font.draw( 'High Score:', 10, 30, ig.Font.ALIGN.LEFT );
					this.fontRed.draw( window.localStorage.getItem('highscore'), 190, 30, ig.Font.ALIGN.LEFT );
				}
			}

		}
	});

	// Start the Game with 60fps, a resolution of 320x240, scaled
	// up by a factor of 2
	var w = window.innerWidth,
		h = window.innerHeight;

	new ig.Image('images/parallax/grid.png');
	new ig.Image('images/parallax/buildings.png');
	new ig.Image('images/parallax/mountain.png');
	new ig.Image('images/parallax/cloud.png');
	new ig.Image('images/parallax/cloud2.png');
	new ig.Image('images/icons/icon128.png');

	// width and height are inverted
	// for forcing landscape gaming
	ig.main( '#canvas', StickSk8rGame, 60, w, h, 1, GameLoader);
});

document.addEventListener('DOMContentLoaded', function(){
	var btnPlayPause = document.getElementById('play_pause'),
			modalGameOver = document.getElementById('gameover_modal'),
			$canvas = document.getElementById('canvas');

	btnPlayPause.addEventListener('click', function(e){
		e.preventDefault();
		if(this.className.indexOf('paused') === -1){
			ig.system.stopRunLoop.call(ig.system);
			ig.music.pause();
			this.className += ' paused';
		} else {
			ig.system.startRunLoop.call(ig.system);
			ig.music.play();
			this.className = this.className.replace('paused', '').replace(' ', '');
		}
	});

	modalGameOver.addEventListener('click', function(e){
		window.location.reload();
	});

	$canvas.addEventListener('click', function () {
		if ( ollie === false ) {
			ollie = true;
		} else {
			isJumping = true;
		}
	});

}, false);

