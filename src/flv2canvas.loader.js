import Polyfill from './utils/polyfill.js';
import IOController from './loader/io-controller';
// install polyfills
Polyfill.install();

function createLoader(optionalConfig) {
    if (optionalConfig && optionalConfig.url) {
        this.ioctl = new IOController(optionalConfig);
        return this.ioctl;
    }
}

// feature detection
function isSupported() {
    return true;
}

let flv2canvasLoader = {};

flv2canvasLoader.createLoader = createLoader;
flv2canvasLoader.isSupported = isSupported;
// flv2canvasLoader.getFeatureList = getFeatureList;

// flv2canvasLoader.BaseLoader = BaseLoader;
// flv2canvasLoader.LoaderStatus = LoaderStatus;
// flv2canvasLoader.LoaderErrors = LoaderErrors;

// flv2canvasLoader.Events = PlayerEvents;
// flv2canvasLoader.ErrorTypes = ErrorTypes;
// flv2canvasLoader.ErrorDetails = ErrorDetails;

// flv2canvasLoader.FlvPlayer = FlvPlayer;
// flv2canvasLoader.LoggingControl = LoggingControl;

Object.defineProperty(flv2canvasLoader, 'version', {
    enumerable: true,
    get: function () {
        // replaced by browserify-versionify transform
        return '__VERSION__';
    }
});
export default flv2canvasLoader;