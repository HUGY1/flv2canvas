
import flv2canvasLoader from './flv2canvas.loader';

class  flv2canvas {
    constructor(options) {
        let loader = this.loader = flv2canvasLoader.createLoader(options);
        this.load();
    }

    load() { 
        this.loader.load();
    }
}
export default flv2canvas;