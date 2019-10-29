
import FetchStreamLoader from './fetch-stream-loader.js';
// import MozChunkedLoader from './xhr-moz-chunked-loader.js';
// import {RuntimeException} from '../utils/exception.js';
import EventEmitter from 'events';
import FLVDemuxer from '../demux/flv-demuxer.js';


class IOController {
    constructor(config) {
        console.log(config);
        this._config = config;
        this._selectLoader();
        this._createLoader();
        this._emitter = new EventEmitter();
        console.log(this._emitter);

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
        this._loader.onDataArrival = this._onInitChunkArrival.bind(this);
        this._loader.open();
    }

    _onInitChunkArrival(data, byteStart) {
        let probeData = null;
        let consumed = 0;
        if (byteStart > 0) {
            // IOController seeked immediately after opened, byteStart > 0 callback may received
            this._demuxer.bindDataSource(this._loader);

            consumed = this._demuxer.parseChunks(data, byteStart);
        } else if ((probeData = FLVDemuxer.probe(data)).match) {
            // Always create new FLVDemuxer
            this._demuxer = new FLVDemuxer(probeData, this._config);
            this._demuxer.onVideoParseDone = this._onVideoParseDone.bind(this);
            this._demuxer.onAudioParseDone = this._onAudioParseDone.bind(this);

            // if (!this._remuxer) {
            //     this._remuxer = new MP4Remuxer(this._config);
            // }

            // let mds = this._mediaDataSource;
            // if (mds.duration != undefined && !isNaN(mds.duration)) {
            //     this._demuxer.overridedDuration = mds.duration;
            // }
            // if (typeof mds.hasAudio === 'boolean') {
            //     this._demuxer.overridedHasAudio = mds.hasAudio;
            // }
            // if (typeof mds.hasVideo === 'boolean') {
            //     this._demuxer.overridedHasVideo = mds.hasVideo;
            // }

            // this._demuxer.timestampBase = mds.segments[this._currentSegmentIndex].timestampBase;

            // this._demuxer.onError = this._onDemuxException.bind(this);
            // this._demuxer.onMediaInfo = this._onMediaInfo.bind(this);
            // this._demuxer.onMetaDataArrived = this._onMetaDataArrived.bind(this);
            this._demuxer.onScriptDataArrived = this._onScriptDataArrived.bind(this);

            // this._remuxer.bindDataSource(this._demuxer
            //              .bindDataSource(this._ioctl
            // ));

            // this._remuxer.onInitSegment = this._onRemuxerInitSegmentArrival.bind(this);
            // this._remuxer.onMediaSegment = this._onRemuxerMediaSegmentArrival.bind(this);

            consumed = this._demuxer.parseChunks(data, byteStart);
        } else {
            probeData = null;
            // Log.e(this.TAG, 'Non-FLV, Unsupported media type!');
       
        }

        return consumed;
    }

    _onScriptDataArrived(data) {
        // this._emitter.emit(TransmuxingEvents.SCRIPTDATA_ARRIVED, data);
    }

    _onVideoParseDone(data) {
        console.log('_onVideoParseDone', data);
    }

    _onAudioParseDone(data) {
        console.log('_onAudioParseDone', data);
    }
}

export default IOController;