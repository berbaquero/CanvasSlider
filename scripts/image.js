let Image = (() => {

	const Mode = {
		SQUARE: 1,
		PORTRAIT: 2,
		LANDSCAPE: 3
	};

	let getList = () => document.querySelectorAll('body > img');

	let getMode = (image) => {
		const width = image.width,
			height = image.height;

		let mode;

		if (width === height) {
			mode = Mode.SQUARE;
		} else if (width > height) {
			mode = Mode.LANDSCAPE;
		} else {
			mode = Mode.PORTRAIT;
		}
		return mode;
	};

	let getNewFitDimension = (imageWidth, imageHeight, canvasWidth, canvasHeight) => {
		let ratio = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);
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

export default Image;
