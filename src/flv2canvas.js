
import flv2canvasLoader from './flv2canvas.loader';

class flv2canvas {
    constructor(options) {
        let loadCtl = new flv2canvasLoader(options);
        let loader = this.loader = loadCtl.createLoader();
        this.load();
    }

    load() { 
        this.loader.load();
    }

    
}
export default flv2canvas;