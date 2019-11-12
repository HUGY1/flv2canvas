/* eslint-disable no-case-declarations */

import Flv2canvasLoader from './flv2canvas.loader';
import YuvCanvas from './render/yuv-canvas';
class flv2canvas {
    constructor(options) {
        this.playWidth = 0;
        this.playHeight = 0;
        this.videoBuffer = [];
        this.videoDts = [];
        this.startPlay = false;
        this.options = options;

        this.loadCtl = new Flv2canvasLoader(options);
        let loader = this.loader = this.loadCtl.createLoader();
        this.initWorker();
        this.initRender();

    }

    load() {
        this.loader.load();
    }

    play() {
        this.startPlay = true;
    }

    initWorker() {
        this.worker = new Worker(this.options.workFile);
        this.loadCtl.worker = this.worker;
        this.worker.postMessage({
            type: 'Broadway.js - Worker init', options: {
                rgb: false,
                memsize: '',
                reuseMemory: true
            }
        });

        let self = this;
        this.worker.addEventListener('message', function (e) {
            let data = e.data;
            if (data.consoleLog) {
                console.log(data.consoleLog);
                return;
            }

            let type = e.data.type;
            switch (type) {
                case 'playAudio':
                    let typeArr = e.data.buffer;
                    let sampleRate = e.data.sampleRate;
                    let dts = e.data.dts;
                    if (!window.audioCtrl.sampleRate) {
                        console.log('sampleRate', sampleRate);

                        window.audioCtrl.sampleRate = sampleRate;
                    }
                    self.doSaveAudioDts(dts, typeArr);
                    window.audioCtrl.feed(typeArr);
                    break;

                case 'playVideo':
                    let typeArr2 = e.data.buffer;
                    let width = e.data.width;
                    let height = e.data.height;

                    self.onPictureDecoded(typeArr2, width, height, data.infos);
                    break;

                case 'initFinished':
                    self.load();
                    break;
            }

        }, false);

    }

    initRender() {
        this.renderFrame = this.renderFrameWebGL;
        this.createCanvasObj = this.createCanvasWebGL;


        let self = this;

        this.canvasObj = this.createCanvasObj();
        console.log(this.canvasObj);
        document.body.append(this.canvasObj.canvas);

        doRender();
        function doRender() {
            self.interval = requestAnimationFrame(doRender);
            if (self.videoBuffer.length > 70) {
                // self.audioDts = [];
                console.log('丢帧');

                let i = 0;
                while (i <= 15) { // 画面落后丢帧个数
                    self.videoBuffer.shift();
                    //   self.videoDts.shift();
                    i++;
                }
            }


            if (self.videoBuffer[0]) {
                self.renderFrame({
                    canvasObj: self.canvasObj,
                    data: self.videoBuffer[0],
                    width: self.playWidth,
                    height: self.playHeight
                });
                self.videoBuffer.shift();
            } else {
                console.log('没有数据');
            }
        }
    }

    onPictureDecoded(buffer, width, height, infos) {
        this.playWidth = width;
        this.playHeight = height;
        this.videoBuffer.push(new Uint8Array(buffer));
        let self = this;
        if (this.videoBuffer.length > 50 && !this.startPlay) {
            console.log('clear', this.videoBuffer.length, this.videoDts.length);
            this.videoBuffer = [];
            // self.videoDts = []
            let i = 0;
            while (i < 50) {
                self.videoDts.shift();
                i++;
            }
        }
    }

    renderFrameWebGL(options) {
        let canvasObj = options.canvasObj;
        let width = options.width || canvasObj.canvas.width;
        let height = options.height || canvasObj.canvas.height;
        if (canvasObj.canvas.width !== width || canvasObj.canvas.height !== height || !canvasObj.webGLCanvas) {

            canvasObj.canvas.width = width;
            canvasObj.canvas.height = height;
            canvasObj.webGLCanvas = new YuvCanvas({
                canvas: canvasObj.canvas,
                contextOptions: canvasObj.contextOptions,
                width: width,
                height: height
            });
        }

        let ylen = width * height;
        let uvlen = (width / 2) * (height / 2);
        canvasObj.webGLCanvas.drawNextOutputPicture({
            yData: options.data.subarray(0, ylen),
            uData: options.data.subarray(ylen, ylen + uvlen),
            vData: options.data.subarray(ylen + uvlen, ylen + uvlen + uvlen)
        });

        let self = this;
        // self.recycleMemory(options.data);
    }

    createCanvasWebGL(options) {
        let canvasObj = this._createBasicCanvasObj(options);
        // canvasObj.contextOptions = options.contextOptions;
        return canvasObj;
    }

    _createBasicCanvasObj(options) {
        options = options || {};

        let obj = {};
    
        obj.canvas = document.createElement('canvas');
   
        obj.canvas.style.backgroundColor = '#0D0E1B';


        return obj;
    }


}
export default flv2canvas;