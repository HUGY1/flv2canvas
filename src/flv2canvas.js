/* eslint-disable no-case-declarations */

import flv2canvasLoader from './flv2canvas.loader';

class flv2canvas {
    constructor(options) {
        this.playWidth = 0;
        this.playHeight = 0;
        this.videoBuffer = [];
        this.videoDts = [];
        this.startPlay = false;
        this.options = options;

        this.loadCtl = new flv2canvasLoader(options);
        let loader = this.loader = this.loadCtl.createLoader();
        this.initWorker();

       
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

                    self.onPictureDecoded(typeArr, width, height, data.infos);
                    break;

                case 'initFinished':
                    self.load();
                    break;
            }

        }, false);

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
}
export default flv2canvas;