let Canvas = (function() {

	let sliderEl = document.getElementById('cc-slider'),
		sliderContext = sliderEl.getContext('2d');

	let create = (width, height) => {
		let newCanvas = document.createElement('canvas');
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

export default Canvas;
