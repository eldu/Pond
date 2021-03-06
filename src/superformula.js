const THREE = require('three');

// Returns a Vector2 based on 
function polarToCart2D(r, theta) {
	var x = r * Math.cos(theta);
	var y = r * Math.sin(theta);
	return new THREE.Vector2(x, y);
}

// Spherical Product
function polarToCart3D(r1, theta, r2, phi) {
	var x = r1 * Math.cos(theta) * r2 * Math.cos(phi);
	var y = r1 * Math.sin(theta) * r2 * Math.cos(phi);
	var z = r2 * Math.sin(phi);

	var result = new THREE.Vector3(x, y, z);
	return result;
}

function cartToPolar2D(v2, r, theta) {
	r = v2.length();
	theta = Math.atan(v2);
}

// TODO: To Cylinderal Coordinates
function cartToPolar3D(v3, r1, theta, r2, phi) {
}

// Returns radius
function superformulaR(a, b, m, n1, n2, n3, phi) {

	return Math.pow((Math.pow(Math.abs(Math.cos(m * phi * 0.25) / a), n2) + 
		   		     Math.pow(Math.abs(Math.sin(m * phi * 0.25) / b), n3)), -1.0 / n1);
}

function superformulaTo2D(a, b, m, n1, n2, n3, theta) {
	var r = superformulaR(a, b, m, n1, n2, n3, phi);
	return polarToCart2D(r, phi);
}

function superformulaTo3D(a, b, m, n1, n2, n3, theta, aa, bb, mm, nn1, nn2, nn3, phi) {
	var r1 = superformulaR(a, b, m, n1, n2, n3, theta);
	var r2 = superformulaR(aa, bb, mm, nn1, nn2, nn3, phi);

	return polarToCart3D(r1, theta, r2, phi);
}

// Maps a which is originally in range [start1, end1] to [start2, end2]
function map(a, start1, end1, start2, end2) {
	var part = (a - start1) / (end1 - start1);
	return part * (end2 - start2) + start2;
}

// Returns a random number within a range
function randRange(min, max) {
	return (max - min) * Math.random() + min;
}

export default function superformula() {
	this.maxi = 301.0;
	this.maxj = 301.0;
	this.geometry = new THREE.Geometry();  // Superformula Mesh

	// Current State
	this.a = 1.2;
	this.b = 1.1;
	this.m = 14.0;
	this.n1 = 3.0;
	this.n2 = -3.82;
	this.n3 = 1.0;
	this.aa = 1.9;
	this.bb = 0.1;
	this.mm = 29.0;
	this.nn1 = 4.8;
	this.nn2 = -1.8;
	this.nn3 = 1.7;

	// // Old State
	// this.oldState = [this.a, this.b, this.m, this.n1, this.n2, this.n3, this.aa, this.bb, this.mm, this.nn1, this.nn2, this.nn3];
	// // New State
	// this.newState = [this.a, this.b, this.m, this.n1, this.n2, this.n3, this.aa, this.bb, this.mm, this.nn1, this.nn2, this.nn3];

	// Use this to initialize the mesh
	this.init = function() {
		for (var i = 0; i < this.maxi; i++) {
			for (var j = 0; j < this.maxj; j++) {
				this.geometry.vertices[this.getidx(i, j)] = new THREE.Vector3(0.0, 0.0, 0.0);
			}
		}

		var count = 0;
		// Faces along the barrel
		for (var i = 0; i < this.maxi - 1; i++) {
			for (var j = 0; j < this.maxj - 1; j++) {
				// Push triangle faces
				this.geometry.faces.push(new THREE.Face3(this.getidx(i, j), this.getidx(i + 1, j + 1), this.getidx(i, j + 1)));
				// this.geometry.faces[count].color.setHex(0xff0000);
				// count++;
				this.geometry.faces.push(new THREE.Face3(this.getidx(i, j), this.getidx(i + 1, j), this.getidx(i + 1, j + 1)));
				// this.geometry.faces[count].color.setHex(0x00ff00);
				// count++;
			}
		}

		// Seam on barrel
		for (var j = 0; j < this.maxj - 1; j++) {
			this.geometry.faces.push(new THREE.Face3(this.getidx(0, j), this.getidx(this.maxi - 1, j + 1), this.getidx(0, j + 1)));
			this.geometry.faces.push(new THREE.Face3(this.getidx(0, j), this.getidx(this.maxi - 1, j), this.getidx(this.maxi - 1, j + 1)));
		}

		// "Top" and "Bottom" Cap
		for(var i = 0; i < this.maxi - 1; i++) {
			this.geometry.faces.push(new THREE.Face3(this.getidx(0, 0), this.getidx(i, 0), this.getidx(i + 1, 0)));
			this.geometry.faces.push(new THREE.Face3(this.getidx(0, this.maxj - 1), this.getidx(i, this.maxj - 1), this.getidx(i + 1, this.maxj - 1)));
		}

		// Actually calculate the vertices
		this.sfvert();
	}

	this.setState = function(a, b, m, n1, n2, n3, aa, bb, mm, nn1, nn2, nn3) {
		this.a = a;
		this.b = b;
		this.m = m;
		this.n1 = n1;
		this.n2 = n2;
		this.n3 = n3;
		this.aa = aa;
		this.bb = bb;
		this.mm = mm;
		this.nn1 = nn1;
		this.nn2 = nn2;
		this.nn3 = nn3;

		// Update Vertices
		this.sfvert();
	}

	this.getidx = function(i, j) {
		return i * this.maxj + j;
	}

	// Calculates all of the vertices
	this.sfvert = function() {
		for (var i = 0; i < this.maxi; i++) {
			for (var j = 0; j < this.maxj; j++) {
				var u = map(i, 0.0, this.maxi, -Math.PI, Math.PI);
				var v = map(j, 0.0, this.maxj, 0.0, Math.PI/2.0);

				var pt = superformulaTo3D(this.a, this.b, this.m, this.n1, this.n2, this.n3, u, 
										  this.aa, this.bb, this.mm, this.nn1, this.nn2, this.nn3, v);

				this.geometry.vertices[this.getidx(i, j)].set(pt.x, pt.y, pt.z); 
			}
		}

		this.geometry.verticesNeedUpdate = true;
		this.geometry.normalsNeedUpdate = true;	
		// this.geometry.computeFaceNormals();
		// this.geometry.computeVertexNormals(); 	
	}

	// TODO: Random flower generater
	this.randomFlower  = function() {
		// Changing m changes the number of petals
		// Changing mm changed the number of layers of petals
	}

	// TODO: Lerp between old and new state, it will look NIICEEEE.
	// this.update = function() {
	// }
}