
import FetchStreamLoader from './fetch-stream-loader.js';
// import MozChunkedLoader from './xhr-moz-chunked-loader.js';
// import {RuntimeException} from '../utils/exception.js';


class IOController {
    constructor(config) {
        console.log(config);
        this._config = config;
        this._selectLoader();
        this._createLoader();

    }

    _selectLoader() {
        if (FetchStreamLoader.isSupported()) {
            this._loaderClass = FetchStreamLoader;
        } 
        // else if (MozChunkedLoader.isSupported()) {
        //     this._loaderClass = MozChunkedLoader;
        // }  else {
        //     throw new RuntimeException('Your browser doesn\'t support xhr with arraybuffer responseType!');
        // }
    }

    _createLoader() {
        this._loader = new this._loaderClass(this._config);
        if (this._loader.needStashBuffer === false) {
            this._enableStash = false;
        }
        // this._loader.onContentLengthKnown = this._onContentLengthKnown.bind(this);
        // this._loader.onURLRedirect = this._onURLRedirect.bind(this);
        // this._loader.onDataArrival = this._onLoaderChunkArrival.bind(this);
        // this._loader.onComplete = this._onLoaderComplete.bind(this);
        // this._loader.onError = this._onLoaderError.bind(this);
    }

    load() {
        this._loader.open();
    }
}

export default IOController;