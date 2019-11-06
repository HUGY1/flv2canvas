
import flv2canvasLoader from './flv2canvas.loader';

class flv2canvas {
    constructor(options) {
        this.loadCtl = new flv2canvasLoader(options);
        let loader = this.loader = this.loadCtl.createLoader();
        this.initWorker();
    }

    load() {
        this.loader.load();
    }

    initWorker() {
        this.worker = new Worker('/dist/flv2canvas.decoder.js');
        this.loadCtl.worker = this.worker;
        this.worker.postMessage({
            type: "Broadway.js - Worker init", options: {
                rgb: false,
                memsize: '',
                reuseMemory: true
            }
        });

        let self = this;
        this.worker.addEventListener('message', function (e) {
            var data = e.data;
            if (data.consoleLog) {
                console.log(data.consoleLog);
                return;
            };

            var type = e.data.type;
            switch (type) {
                case "playAudio":
                    var typeArr = e.data.buffer;
                    var sampleRate = e.data.sampleRate;
                    var dts = e.data.dts;
                    if (!window.audioCtrl.sampleRate) {
                        console.log('sampleRate', sampleRate)

                        window.audioCtrl.sampleRate = sampleRate;
                    }
                    self.doSaveAudioDts(dts, typeArr);
                    window.audioCtrl.feed(typeArr);
                    break;

                case "playVideo":
                    var typeArr = e.data.buffer;
                    var width = e.data.width;
                    var height = e.data.height;

                    console.log(width,height)
                    // onPictureDecoded.call(self, typeArr, width, height, data.infos);
                    break;

                case "initFinished":
                    self.load()
                    break;
            }

        }, false);

    }


}
export default flv2canvas;