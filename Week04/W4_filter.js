import {Filter2D} from "./Week04A";

function loadSource (source) {
    if (source) {
        let threshold = 15
        let dataHead = source.calculate (function (data, width, height) {
            let array = new Filter2D(data, width, height).sharpen(3, 1);
            array = new Filter2D(array, width, height).erode(1, threshold);
            array = new Filter2D(array, width, height).bilateral(3, 1);
            return array;
            // return new Filter2D(array, width, height).gaussian(3, 1);
        })
        postMessage(dataHead);
        // addImage(headCanvas, dataHead);
    }
}

addEventListener('message', function (e) {
    let raw = e;

    console.log(raw.data)

    loadSource(new ImageArray(raw.data, 400, 400));
})

class Symbol {
    constructor(x, y, fontSize, canvasHeight) {
        this.characters = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.x = x;
        this.y = y;
        this.fontSize = fontSize;
        this.text = '';
        this.canvasHeight = canvasHeight;
    }

    draw(context) {
        this.text = this.characters.charAt(Math.floor(Math.random()*this.characters.length));
        context.fillStyle = '#0aff0a';
        context.fillText(this.text, this.x * this.fontSize, this.y * this.fontSize);
        if (this.y * this.fontSize > this.canvasHeight) {
            this.y = 0;
        } else {
            this.y += 1;
        }
    }
}

class ImageArray {
    constructor(imageData, width, height) {
        this._raw = imageData;
        this._data = [];
        this._width = width;
        this._height = height;
        for (let i = 0; i < imageData.length; i += 4) {
            let pixel = imageData.slice(i, i+4);
            // console.log("RUN")
            this._data.push(new ImagePixel(pixel, 'RGB'));
            // console.log(this._data[i/4])
        }
        // console.log(this._data)
    }

    fromArray(pixelData, width, height) {
        let array = [];
        for (let i = 0; i < pixelData.length; i++) {
            array.push(pixelData[i].R())
            array.push(pixelData[i].G())
            array.push(pixelData[i].B())
            array.push(pixelData[i].A())
        }
        return new ImageArray(array, width, height);
    }

    raw() {
        return this._raw;
    }

    dataRGBA() {
        return this._data;
    }

    width() {
        return this._width;
    }

    height() {
        return this._height;
    }

    /**
     * @param operation
     * function(Array<ImageDataRGBA>, index of pixel, image width) {
     *     return new ImagePixel
     * }
     * @returns {ImageArray}
     */
    calculate(operation) {
        let array = operation(this._data, this._width, this._height);
        return this.fromArray(array, this._width, this._height);
    }

    convert2Grey() {
        let array = [];
        for (let i = 0; i < this._height; i++) {
            for (let j = 0; j < this._width; j++) {
                let pixel = this._data[i*this._width+j]
                let grey = pixel.R()*0.299 + pixel.G()*0.587 + pixel.B()*0.114
                array.push(new ImagePixel([grey, grey, grey, 255], 'RGB'));
            }
        }
        return this.fromArray(array, this._width, this._height);
    }
}

class ImagePixel {
    constructor(dataArray, mode) {
        if (mode == 'RGB' || mode == null) {
            this._r = dataArray[0]
            this._g = dataArray[1]
            this._b = dataArray[2]
            this._a = dataArray[3] ?? 255

            // console.log(this)
        } else if (mode == 'HSV') {
            this._h = dataArray[0]
            this._s = dataArray[1]
            this._v = dataArray[2]
            this._a = dataArray[3] ?? 255
            let rgb = this.hsv2RGB(this._h, this._s, this._v)
            this._r = rgb[0]
            this._g = rgb[1]
            this._b = rgb[2]
        }
    }

    R() {
        return this._r
    }

    G() {
        return this._g
    }

    B() {
        return this._b
    }

    A() {
        return this._a
    }

    rgb2HSV(r, g, b) {
        const ar = r / 255;
        const ag = g / 255;
        const ab = b / 255;

        const max = Math.max (ar, ag, ab);
        const min = Math.min (ar, ag, ab);

        let h, s, v = max;
        const d = max - min;
        s = max == 0 ? 0 : d / max;
        if (max == min) {
            h = 0;
        } else {
            switch (max) {
                case ar: h = (ag - ab) / d + (ag < ab ? 6 : 0); break;
                case ag: h = (ab - ar) / d + 2; break;
                case ab: h = (ar - ag) / d + 4; break;
            }
            h /= 6;
        }
        return [ h, s, v ];
    }

    hsv2RGB(h, s, v) {
        let r, g, b;

        const i = Math.floor (h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);

        // noinspection CommaExpressionJS
        switch (i % 6) {
            case 0: r = s, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return [ r * 255, g * 255, b * 255 ];
    }

    H() {
        return this._h;
    }

    S() {
        return this._s;
    }

    V() {
        let hsv = this.rgb2HSV(this._r, this._g, this._b)
        this._h = hsv[0]
        this._s = hsv[1]
        this._v = hsv[2]
        return this._v;
    }
}