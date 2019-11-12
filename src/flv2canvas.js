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
        this.canvasObj = {};
        this.loadCtl = new Flv2canvasLoader(options);
        this.loadCtl.saveDts = this._saveDts.bind(this);
        this.loader = this.loadCtl.createLoader();
        this.initWorker();
        this.initRender();

    }

    load() {
        this.loader.load();
    }

    play() {
        this.startPlay = true;
    }

    stop() {
        this.startPlay = false;
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
        let self = this;
        this.renderFrame = this.renderFrameWebGL;

    
        this.canvasObj.canvas = this.options.canvasDom;

        let last = Date.now();
        let frameTimestamp = 0;
        let diffTime = 0;

        doRender();
        function doRender() {

            self.interval = requestAnimationFrame(doRender);
            if (!self.startPlay) return;

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


            if (self.videoDts.length === 0) {
                last = Date.now();
                return;
            }

            let now = Date.now();
            frameTimestamp = frameTimestamp + (now - last);

            last = Date.now();

            /// 控制每一帧播放时间
            // videoDts为视频播放的时间轴
            if (frameTimestamp > (self.videoDts[1] - self.videoDts[0]) || frameTimestamp === (self.videoDts[1] - self.videoDts[0])) {

                if (frameTimestamp > (self.videoDts[1] - self.videoDts[0])) {
                    diffTime += frameTimestamp - (self.videoDts[1] - self.videoDts[0]);
                }
                if (diffTime >= 63) {
                    diffTime = 0;
                    self.videoBuffer.shift();
                    self.videoDts.shift();
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
                    // console.log('没有数据');
                }

                frameTimestamp = 0;
                self.videoDts.shift();
            } 
        }
    }

    _saveDts(dts) {

        let videoDts = this.videoDts;
        if (videoDts.length === 0) {
            this.videoDts.push(dts);
        } else if (videoDts.length === 1) {
            if (dts > videoDts[0]) {
                this.videoDts.push(dts);
            } else {
                this.videoDts.unshift(dts);
            }
        }
        else {
            let isPush = false;
            for (let i = 0; i < this.videoDts.length; i++) {
                if (dts < this.videoDts[i] || dts === this.videoDts[i]) {

                    let arr1 = videoDts.slice(0, i);
                    let arr2 = videoDts.slice(i, videoDts.length);
                    arr1.push(dts);
                    this.videoDts = arr1.concat(arr2);

                    isPush = true;
                    break;
                }
            }

            if (!isPush) {
                this.videoDts.push(dts);
            }

        }


    }

    onPictureDecoded(buffer, width, height, infos) {
        if (document.hidden) return;
        this.playWidth = width;
        this.playHeight = height;
        this.videoBuffer.push(new Uint8Array(buffer));
        let self = this;
        if (this.videoBuffer.length > 50 && !this.startPlay) {
            console.log('clear', this.videoBuffer.length, this.videoDts.length);
            this.videoBuffer = [];
            self.videoDts = [];
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



}
export default flv2canvas;