var ParticleSystem = function(){

	// Scene attributes
	this.container;
	this.height;
	this.renderer;
	this.scene;
	this.width;

	// Camera attributes
	this.aspect;
	this.camera;
	this.density = 3;
	this.far = 10000;
	this.near = 0.1;
	this.view_angle = 45;

	// Hidden canvas attributes
	this.canvas;
	this.context;

	// Particles attributes
	this.limits;
	this.nextParticles = {
		"colors":[],
		"vertices":[]
	};
	this.particles;
	this.particleSystem;
	this.particleTexture;
	this.pMaterial;
	this.pivot;
	this.updating = false;

	// Characters
	this.datas;
	this.step = 0;

	// Image attributes
	this.img = new Image();
	this.pathImg = 'img/';
	this.loading = false;

	//tests
	this.cube;
	this.log = [];

};

ParticleSystem.prototype.init = function(){

	var	that = this,
		firstImage = 'goku_01.png',
		promise;

	// Get container for scene canvas
	this.container = document.getElementById('container');
	this.height = window.innerHeight;
	this.width = window.innerWidth;

	// Set aspect for camera
	this.aspect = this.width/this.height;

	// Set renderer for webgl
	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setSize(this.width, this.height);

	// Set camera with PerspectiveCamera
	this.camera = new THREE.PerspectiveCamera(
			this.view_angle,
			this.aspect,
			this.near,
			this.far
		);

	// Set the scene
	this.scene = new THREE.Scene();
	this.scene.add(this.camera);

	// Set z position for camera
	this.camera.position.x = 300;
	this.camera.position.y = -300;
	this.camera.position.z = 1000;

	// Set hidden canvas
	this.canvas = document.createElement('canvas');
	this.context = this.canvas.getContext('2d');

	// Load characters
	this.loadJson().then(function(result){

		that.datas = JSON.parse(result);

		// Load first image from json
		that.loadImage(that.datas.characters[that.step].image).then(function(result){
			that.globalEvents();
		}, function(err){
			console.log(err);
		});

	}, function(err){
		alert(err);
	});
	

};

ParticleSystem.prototype.globalEvents = function(){

	var that = this,
		button = document.getElementById('button'),
		previous = document.getElementById('previous'),
		next = document.getElementById('next');

	button.addEventListener('click', function(){
		that.appendRenderer();
	}, false);

	previous.addEventListener('click', function(){
		that.previousCharacter();
	}, false);

	next.addEventListener('click', function(){
		that.nextCharacter();
	}, false);

};

ParticleSystem.prototype.appendRenderer = function(){

	this.container.appendChild(this.renderer.domElement);

	this.particles = new THREE.Geometry();
	this.particleTexture = THREE.ImageUtils.loadTexture(this.pathImg + "particle.png");

	this.pMaterial = new THREE.PointCloudMaterial({
		blending: THREE.AdditiveBlending,
		map: this.particleTexture,
		size: this.density * 1.5,
		opacity: 1,
		vertexColors:true,
		sizeAttenuation:true
	});

	this.createParticles();

    // create the particle system
    this.particleSystem = new THREE.PointCloud(
        this.particles,
        this.pMaterial);

    // also update the particle system to
	// sort the particles which enables
	// the behaviour we want
	this.particleSystem.sortParticles = true;



    // add it to the scene
    this.particleSystem.position.set(0,0,0);
    this.scene.add(this.particleSystem);

   var geometry = new THREE.BoxGeometry( 100, 100, 100 );
   var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
   this.cube = new THREE.Mesh( geometry, material );
   this.scene.add( this.cube );
   this.cube.position.set(500, 200, 0);

   this.update();
};

ParticleSystem.prototype.createParticles = function(){

	var pixels = this.context.getImageData(0,0,this.img.width,this.img.height),
		step = this.density * 4,
		x = 0,
		y = 0;

	for (var i = 0; i < 30276; i++) {
		var vector = new THREE.Vector3(0,0,0);
		var color = new THREE.Color('black');

		this.particles.vertices.push(vector);
		this.particles.colors.push(color);
	};

	this.changeCharacter();
};

ParticleSystem.prototype.updateParticles = function(){

	var pixels = this.context.getImageData(0,0,this.img.width,this.img.height),
		step = this.density * 4,
		x = 0,
		y = this.img.height,
		i = 0,
		j = 0,
		that = this;

	// this.nextParticles.vertices = [];
	// this.nextParticles.colors   = []; 

	// for (var j = 0; j < this.particles.vertices.length; j++) {
		
	// 	this.particles.colors[j] = new THREE.Color('black');
	// };

	// for (x = 0; x < 174 * 4; i++) {

	// 	if (x<this.img.width *4) {

	// 		if (y >= 0) {

	// 			var p = ((y * this.img.width * 4) + x);

	// 			if(pixels.data[p+3] > 0) {

	// 				var pixelCol	= (pixels.data[p] << 16) + (pixels.data[p+1] << 8) + pixels.data[p+2];
	// 				var color 		= new THREE.Color(pixelCol);
	// 				var vector 		= new THREE.Vector3(-this.img.width/2 + x/4, -y, 0);
					
	// 				// push on the particle
	// 				this.particles.vertices[i] = vector;
	// 				this.particles.colors[i] = color;
	// 			}

	// 			y-= this.density;
	// 		};

	// 		x+= step;

	// 	} else {

	// 		this.particles.vertices[i] = new THREE.Vector3(0,0,0);
	// 		this.particles.colors[i] = new THREE.Color('black');
	// 	}
	// };

	for(x = 0; x < 50000; x+= step) {

    	for(y = this.img.height; y >= 0 ; y -= this.density) {

    		if (x < this.img.width * 4) {
	    		var p = ((y * this.img.width * 4) + x);
	    		
	    		// Grab the actual data from the
	    		// pixel, ignoring any transparent ones
	    		if(pixels.data[p+3] > 0)
			    {
			    	var pixelCol	= (pixels.data[p] << 16) + (pixels.data[p+1] << 8) + pixels.data[p+2];
			    	var color 		= new THREE.Color(pixelCol);
			    	var vector 		= new THREE.Vector3(-this.img.width/2 + x/4, -y, 0);
			    	
			    	// push on the particle
			    	//this.particles.vertices[j] = vector;
			    	//this.particles.colors[j] = color;

    		    	createjs.Tween.get(this.particles.colors[j])
    				    .to({r: color.r, g: color.g, b: color.b}, 2000, createjs.Ease.QuartIn);

    				createjs.Tween.get(this.particles.vertices[j])
    				    .to({z: Math.floor(Math.random()*101) - 50}, 1500, createjs.Ease.QuartIn)
    				    .to({x:vector.x,y:vector.y,z: 0}, 1500, createjs.Ease.QuartIn);

			    } else {
			    	var color 		= new THREE.Color('black');
			    	var vector 		= new THREE.Vector3(-this.img.width/2 + x/4, -y, 0);
			    	
			    	// push on the particle
			    	this.particles.vertices[j] = vector;
			    	this.particles.colors[j] = color;
			    }

    		} else{
    			var color 		= new THREE.Color('black');
    			var vector 		= new THREE.Vector3(-this.img.width/2 + x/4, -y, 0);
    			
    			// push on the particle
    			this.particles.vertices[j] = vector;
    			this.particles.colors[j] = color;
    		}
			
			j++;	
    	}
    }
    //setTimeout(function(){
    //this.particles.__webglParticleCount = this.nextParticles.vertices.length;
    //this.particles.__colorArray = this.particles.__colorArray.slice(0, this.nextParticles.vertices.length*3);
    //this.particles.__vertexArray = this.particles.__vertexArray.slice(0, this.nextParticles.vertices.length*3);
    //},500);
    // this.particles.vertices = this.particles.vertices.slice(0, this.nextParticles.vertices.length);
    // this.particles.colors = this.particles.colors.slice(0, this.nextParticles.vertices.length);
    // this.log.push(pixels);
    // if (this.particles.vertices.length > this.nextParticles.vertices.length) {
    // 	var surplus = this.particles.vertices.length - this.nextParticles.vertices.length,
    // 		end = false;

    // 	this.particles.vertices = this.particles.vertices.splice(0, this.nextParticles.vertices);
    // 	this.particles.colors = this.particles.colors.splice(0, this.nextParticles.vertices);

    // 	for (surplus; surplus < this.particles.vertices.length; surplus++) {
	   //  	// createjs.Tween.get(this.particles.colors[surplus])
			 //   //  .to({r: 0, g: 0, b: 0}, 2000, createjs.Ease.QuartIn);
			 //   this.particles.vertices.splice(surplus, 1);
    // 	};
    // };

 //    this.limits = {
 //    	"limit":[],
 //    	"done":[]
 //    };
 //    for (var i = 0; i < this.particles.vertices.length; i++) {
	// 	this.limits.limit[i] = Math.floor(Math.random()*101) - 50;
	// 	this.limits.done[i] = false;
	// };
};

ParticleSystem.prototype.loadImage = function(image){

	var that = this;

	return new Promise(function(resolve, reject){

		that.img = new Image();
		that.img.src = that.pathImg + image;

		that.img.onload = function(){

			if (that.img.complete) {

				that.canvas.width = that.img.width;
			  	that.canvas.height = that.img.height;

			  	that.context.clearRect(0, 0, 9999, 9999);
				that.context.drawImage(that.img,0,0,that.img.width,that.img.height);

				resolve('Image loaded !');

			} else {
				reject(Error('Image not loaded :( !'));
			}

		};

		that.img.onerror = function(){
			reject(Error('Erreur réseau'));
		}

	});

};

ParticleSystem.prototype.loadJson = function(){

	return new Promise(function(resolve,reject){

		var req = new XMLHttpRequest();
		req.open('GET', 'js/datas.json');

		req.onload = function(){

			if(req.status == 200){
				resolve(req.response)
			} else{
				reject(Error(req.statusText));
			}
		};

		req.onerror = function(){
			reject(Error('Erreur réseau'));
		};

		req.send();
	});

};

ParticleSystem.prototype.previousCharacter = function(){

	this.loading = false;

	if (this.step - 1 >= 0){
		this.step--;
		this.changeCharacter();
	}
};


ParticleSystem.prototype.nextCharacter = function(){

	this.loading = false;

	if (this.step + 1 <= this.datas.characters.length){
		this.step++;
		this.changeCharacter();
	}
};

ParticleSystem.prototype.changeCharacter = function(){

	var that = this;

	if (!this.loading) {

		this.loading = true;

		this.loadImage(this.datas.characters[this.step].image).then(function(result){
			console.log(result);
			that.updating = true;
			that.updateParticles();
		}, function(err){
			console.log(err);
		});
	};
}

ParticleSystem.prototype.update = function(){
	requestAnimationFrame(this.update.bind(this));
	this.render();
};

ParticleSystem.prototype.render = function render(){
	if (this.updating) {
		this.particleSystem.geometry.verticesNeedUpdate = true;
		this.particleSystem.geometry.colorsNeedUpdate = true;

		// var xStep = 1,
		// 	yStep = 4,
		// 	zStep = 0.5;

		// for (var i = 0; i < this.nextParticles.vertices.length; i++) {

		// 	var end = true;

			// if (this.limits.limit[i] > 0 && this.particles.vertices[i].z < this.limits.limit[i] && this.limits.done[i] == false)
			// 	this.particles.vertices[i].z += zStep;
			// else if (this.limits.limit[i] < 0 && this.particles.vertices[i].z > this.limits.limit[i] && this.limits.done[i] == false)
			// 	this.particles.vertices[i].z -= zStep;

			// console.log(this.limits.done[i]);
			
			// if (this.limits.limit[i] > 0 && this.particles.vertices[i].z == this.limits.limit[i] && this.particles.vertices[i].z > 0){
			// 	this.limits.done[i] = true;
			// 	if (this.limits.done[i])
			// 		this.particles.vertices[i].z -= zStep;
			// } else if (this.limits.limit[i] < 0 && this.particles.vertices[i].z == this.limits.limit[i] && this.particles.vertices[i].z < 0){
			// 	this.limits.done[i] = true;
			// 	if (this.limits.done[i])
			// 		this.particles.vertices[i].z += zStep;
			// }


			// if (typeof this.particles.vertices[i] != 'undefined') {

			// 	if (this.nextParticles.vertices[i].x > this.particles.vertices[i].x) {
			// 		if (this.particles.vertices[i].x >= this.nextParticles.vertices[i].x - xStep)
			// 			this.particles.vertices[i].x = this.nextParticles.vertices[i].x;
			// 		else
			// 			this.particles.vertices[i].x += xStep;
			// 	}

			// 	if (this.nextParticles.vertices[i].x < this.particles.vertices[i].x) {
			// 		if (this.particles.vertices[i].x <= this.nextParticles.vertices[i].x + xStep)
			// 			this.particles.vertices[i].x = this.nextParticles.vertices[i].x;
			// 		else
			// 			this.particles.vertices[i].x -= xStep;
			// 	}

			// 	if (this.nextParticles.vertices[i].y > this.particles.vertices[i].y) {
			// 		if (this.particles.vertices[i].y >= this.nextParticles.vertices[i].y - yStep)
			// 			this.particles.vertices[i].y = this.nextParticles.vertices[i].y;
			// 		else
			// 			this.particles.vertices[i].y += yStep;
			// 	}

			// 	if (this.nextParticles.vertices[i].y < this.particles.vertices[i].y) {
			// 		if (this.particles.vertices[i].y <= this.nextParticles.vertices[i].y + yStep)
			// 			this.particles.vertices[i].y = this.nextParticles.vertices[i].y;
			// 		else
			// 			this.particles.vertices[i].y -= yStep;
			// 	}
			// };
		//};

		// var end = true;

		// for (var i = 0; i < this.particles.vertices.length; i++) {
			
		// 	if (this.limits[i] > 0 && this.particles.vertices[i].z < this.limits[i]) {
		// 		this.particles.vertices[i].z += 1;
		// 		end = false;
		// 	} else if (this.limits[i] < 0 && this.particles.vertices[i].z > this.limits[i]) {
		// 		this.particles.vertices[i].z -= 1;
		// 		end = false;
		// 	}

		// 	if(i == this.particles.vertices.length - 1 && end)
		// 		this.changeCharacter();

		// };		
	}

  	this.particleSystem.rotation.y += 0.015;
  	this.cube.rotation.y += 0.015;
  	
	this.renderer.render(this.scene, this.camera);
};

var app = new ParticleSystem();
app.init();