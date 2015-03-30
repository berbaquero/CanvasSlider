(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Canvas = (function () {

	var sliderEl = document.getElementById("cc-slider"),
	    sliderContext = sliderEl.getContext("2d");

	var create = function (width, height) {
		var newCanvas = document.createElement("canvas");
		newCanvas.width = width;
		newCanvas.height = height;
		return newCanvas;
	};

	return {
		sliderEl: sliderEl,
		sliderCtx: sliderContext,
		create: create
	};
})();

module.exports = Canvas;

},{}],2:[function(require,module,exports){
"use strict";

var Image = (function () {

	var Mode = {
		SQUARE: 1,
		PORTRAIT: 2,
		LANDSCAPE: 3
	};

	var getList = function () {
		return document.querySelectorAll("body > img");
	};

	var getMode = function (image) {
		var width = image.width,
		    height = image.height;

		var mode = undefined;

		if (width === height) {
			mode = Mode.SQUARE;
		} else if (width > height) {
			mode = Mode.LANDSCAPE;
		} else {
			mode = Mode.PORTRAIT;
		}
		return mode;
	};

	var getNewFitDimension = function (imageWidth, imageHeight, canvasWidth, canvasHeight) {
		var ratio = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);
		return {
			width: imageWidth * ratio,
			height: imageHeight * ratio
		};
	};

	return {
		Mode: Mode,
		getMode: getMode,
		getNewFitDimension: getNewFitDimension,
		getList: getList
	};
})();

module.exports = Image;

},{}],3:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

//import El from './elements.js';

var Image = _interopRequire(require("./image.js"));

var Canvas = _interopRequire(require("./canvas.js"));

var imagesArray = [],
    sourceCanvas = undefined,
    totalSliderWidth = undefined,

// coordinates of Slider
sliderX = undefined,
    sliderY = undefined,

// dimensions of Slider
sliderWidth = undefined,
    sliderHeight = undefined,

// Initial State
initialX = 0,
    // coordinate when starting drag
initialSliderX = 0,
    // point where slider starts drawing
latestX = 0;

var initApp = function () {
	// Get slider coordinates
	sliderX = Canvas.sliderEl.offsetLeft;
	sliderY = Canvas.sliderEl.offsetTop;
	sliderWidth = Canvas.sliderEl.width;
	sliderHeight = Canvas.sliderEl.height;

	var images = Image.getList(),
	    totalImagesWidth = getTotalImagesWidth(images);

	// This is the canvas that will contain
	// all the loaded images in a row,
	// and serves as the source for the slider to draw from
	sourceCanvas = Canvas.create(totalImagesWidth, 500);

	for (var i = 0, l = images.length; i < l; i++) {
		var image = images[i];
		addImage(image, sourceCanvas);
	}

	// Initial draw of the image source Canvas
	// into the Slider canvas
	var sliderCanvasCtx = Canvas.sliderEl.getContext("2d");
	sliderCanvasCtx.drawImage(sourceCanvas, 0, 0);
};

var getTotalImagesWidth = function (images) {
	return images.length * sliderWidth;
};

var getLastImageWidth = function () {
	var totalWidth = imagesArray.length * sliderWidth;
	totalSliderWidth = totalWidth;
	return totalWidth;
};

var addImage = function (image, canvas) {
	var canvasContext = canvas.getContext("2d"),
	    size = Image.getNewFitDimension(image.width, image.height, sliderWidth, sliderHeight),
	    mode = Image.getMode(image);

	if (mode === Image.Mode.PORTRAIT || mode === Image.Mode.SQUARE) {
		var remaining = sliderWidth - size.width,
		    rectWidth = remaining / 2,
		    startX = getLastImageWidth();
		// Draw first rect
		canvasContext.fillRect(startX, 0, rectWidth, sliderHeight);
		// Draw image
		canvasContext.drawImage(image, startX + rectWidth, 0, size.width, size.height);
		// Draw second react
		canvasContext.fillRect(startX + rectWidth + size.width, 0, rectWidth, sliderHeight);
	}

	if (mode === Image.Mode.LANDSCAPE) {
		var remaining = sliderHeight - size.height,
		    rectHeight = remaining / 2,
		    startX = getLastImageWidth();
		// Draw first rect
		canvasContext.fillRect(startX, 0, sliderWidth, rectHeight);
		// Draw image
		canvasContext.drawImage(image, startX, rectHeight, size.width, size.height);
		// Draw second react
		canvasContext.fillRect(startX, rectHeight + size.height, sliderWidth, rectHeight);
	}

	imagesArray.push(image);
};

var onDrag = function (event) {
	requestAnimationFrame(function () {
		redraw(event.clientX);
	});
};

var redraw = function (newX) {
	// get the difference between the initial point clicked
	// and the dragged distance
	var distanceDragged = newX - sliderX,
	    diff = distanceDragged - initialX;

	// the difference needs to be reversed for Canvas API.
	diff = diff * -1;
	draw(diff);
};

var draw = function (pixels) {
	var pixelsToMove = pixels + initialSliderX;

	if (pixelsToMove < 0 || pixelsToMove > totalSliderWidth) {
		// If reached slider bounds, do nothing more
		return;
	}

	Canvas.sliderCtx.drawImage(sourceCanvas,
	// subset taken from source canvas
	pixelsToMove, 0, sliderWidth, sliderHeight, 0, 0, sliderWidth, sliderHeight);

	latestX = pixels;
};

var lastCalc = function () {
	// When the dragging stops

	// update the last drawn subset point
	initialSliderX += latestX;

	// Reset slider to max bounds if reached limits
	if (initialSliderX < 0) {
		initialSliderX = 0;
	}
	if (initialSliderX > totalSliderWidth) {
		initialSliderX = totalSliderWidth;
	}
};

// Init Mouse listeners

Canvas.sliderEl.addEventListener("mousedown", function (event) {
	// When dragging begins

	// Get initial point clicked
	initialX = event.clientX - sliderX;

	Canvas.sliderEl.addEventListener("mousemove", onDrag);
	Canvas.sliderEl.addEventListener("mouseup", onMouseUp);
	Canvas.sliderEl.addEventListener("mouseleave", onMouseLeave);
});

var onMouseUp = function () {
	Canvas.sliderEl.removeEventListener("mousemove", onDrag);
	lastCalc();
};

var onMouseLeave = function () {
	Canvas.sliderEl.removeEventListener("mousemove", onDrag);
	lastCalc();
};

// Initialize after the images in the document are all loaded
window.addEventListener("load", initApp);

},{"./canvas.js":1,"./image.js":2}]},{},[3]);
