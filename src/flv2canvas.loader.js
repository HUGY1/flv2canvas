import Polyfill from './utils/polyfill.js';
import IOController from './loader/io-controller';
// install polyfills
Polyfill.install();


// feature detection
function isSupported() {
    return true;
}


// flv2canvasLoader.getFeatureList = getFeatureList;

// flv2canvasLoader.BaseLoader = BaseLoader;
// flv2canvasLoader.LoaderStatus = LoaderStatus;
// flv2canvasLoader.LoaderErrors = LoaderErrors;

// flv2canvasLoader.Events = PlayerEvents;
// flv2canvasLoader.ErrorTypes = ErrorTypes;
// flv2canvasLoader.ErrorDetails = ErrorDetails;

// flv2canvasLoader.FlvPlayer = FlvPlayer;
// flv2canvasLoader.LoggingControl = LoggingControl;

class Flv2CanvasLoader {
    constructor(optionalConfig) {
        this._config = optionalConfig;
    }

    createLoader() {
        this.ioctl = new IOController(this._config);
        this.ioctl.onVideoParseDone = this._onVideoParseDone.bind(this);
        this.ioctl.onAudioParseDone = this._onAudioParseDone.bind(this);
        return this.ioctl;
    }

    _onVideoParseDone(data) {
        // post video h264 to woker
    }

    _onAudioParseDone(data) {
        // post audio to woker
    }
}


export default Flv2CanvasLoader;