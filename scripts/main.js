//import El from './elements.js';
import Image from './image.js';
import Canvas from './canvas.js';

let imagesArray = [],
	sourceCanvas,
	totalSliderWidth,
	// coordinates of Slider
	sliderX,
	sliderY,
	// dimensions of Slider
	sliderWidth,
	sliderHeight,
	// Initial State
	initialX = 0, // coordinate when starting drag
	initialSliderX = 0, // point where slider starts drawing
	latestX = 0;

let initApp = () => {
	// Get slider coordinates
	sliderX = Canvas.sliderEl.offsetLeft;
	sliderY = Canvas.sliderEl.offsetTop;
	sliderWidth = Canvas.sliderEl.width;
	sliderHeight = Canvas.sliderEl.height;

	let images = Image.getList(),
		totalImagesWidth = getTotalImagesWidth(images);

	// This is the canvas that will contain
	// all the loaded images in a row,
	// and serves as the source for the slider to draw from
	sourceCanvas = Canvas.create(totalImagesWidth, 500);

	for(var i = 0, l = images.length; i < l; i++) {
		let image = images[i];
		addImage(image, sourceCanvas);
	}

	// Initial draw of the image source Canvas
	// into the Slider canvas
	let sliderCanvasCtx = Canvas.sliderEl.getContext('2d');
	sliderCanvasCtx.drawImage(sourceCanvas, 0, 0);
};

let getTotalImagesWidth = (images) => {
	return images.length * sliderWidth;
};

let getLastImageWidth = () => {
	let totalWidth = imagesArray.length * sliderWidth;
	totalSliderWidth = totalWidth;
	return totalWidth;
};

let addImage = (image, canvas) => {
	let canvasContext = canvas.getContext('2d'),
		size = Image.getNewFitDimension(image.width, image.height, sliderWidth, sliderHeight),
		mode = Image.getMode(image);

	if (mode === Image.Mode.PORTRAIT ||
		mode === Image.Mode.SQUARE) {
		let remaining = sliderWidth - size.width,
			rectWidth = remaining / 2,
			startX = getLastImageWidth();
		// Draw first rect
		canvasContext.fillRect(startX, 0, rectWidth, sliderHeight);
		// Draw image
		canvasContext.drawImage(image, (startX + rectWidth), 0, size.width, size.height);
		// Draw second react
		canvasContext.fillRect((startX + rectWidth + size.width), 0, rectWidth, sliderHeight);
	}

	if (mode === Image.Mode.LANDSCAPE) {
		let remaining = sliderHeight - size.height,
			rectHeight = remaining / 2,
			startX = getLastImageWidth();
		// Draw first rect
		canvasContext.fillRect(startX, 0, sliderWidth, rectHeight);
		// Draw image
		canvasContext.drawImage(image, startX, rectHeight, size.width, size.height);
		// Draw second react
		canvasContext.fillRect(startX, (rectHeight + size.height), sliderWidth, rectHeight);
	}

	imagesArray.push(image);
};

let onDrag = (event) => {
	requestAnimationFrame(() => {
		redraw(event.clientX);
	});
};

let redraw = (newX) => {
	// get the difference between the initial point clicked
	// and the dragged distance
	let distanceDragged = newX - sliderX,
		diff = (distanceDragged - initialX);

	// the difference needs to be reversed for Canvas API.
	diff = diff * -1;
	draw(diff);
};

let draw = (pixels) => {
	let pixelsToMove = (pixels + initialSliderX);

	if (pixelsToMove < 0 || pixelsToMove > totalSliderWidth) {
		// If reached slider bounds, do nothing more
		return;
	}

	Canvas.sliderCtx.drawImage(
		sourceCanvas,
		// subset taken from source canvas
		pixelsToMove, 0, sliderWidth, sliderHeight,
		0, 0, sliderWidth, sliderHeight);

	latestX = pixels;
};

let lastCalc = () => {
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

Canvas.sliderEl.addEventListener('mousedown', (event) => {
	// When dragging begins

	// Get initial point clicked
	initialX = event.clientX - sliderX;

	Canvas.sliderEl.addEventListener('mousemove', onDrag);
	Canvas.sliderEl.addEventListener('mouseup', onMouseUp);
	Canvas.sliderEl.addEventListener('mouseleave', onMouseLeave);
});

let onMouseUp = () => {
	Canvas.sliderEl.removeEventListener('mousemove', onDrag);
	lastCalc();
};

let onMouseLeave = () => {
	Canvas.sliderEl.removeEventListener('mousemove', onDrag);
	lastCalc();
};

// Initialize after the images in the document are all loaded
window.addEventListener('load', initApp);
