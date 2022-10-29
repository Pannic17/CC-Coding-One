// noinspection EqualityComparisonWithCoercionJS

var mouseX;
var mouseY;
var imageObj = new Image();
imageObj.src = "Test2.png";
//imageObj.src = "pic2.jpg";
console.log( document.body.clientHeight );
var canvas = document.getElementById('myCanvas');
var canvas2 = document.getElementById('myCanvas2');


imageObj.onload = function () {
    var context = canvas.getContext('2d');
    var context2 = canvas2.getContext('2d');
    var imageWidth = imageObj.width;
    var imageHeight = imageObj.height;

    context2.drawImage(imageObj, 0, 0);

    var imageData = context2.getImageData(0, 0, imageWidth, imageHeight);
    var data = imageData.data;
    console.log(imageData)

    // This will hold the X gradient
    var imageData2 = context.getImageData(0, 0, imageWidth, imageHeight);

    // This will hold the Y gradient
    var imageData3 = context.getImageData(0, 0, imageWidth, imageHeight);





    // iterate over all pixels
    for(var i = 1; i < imageHeight-1; i++) {

        // This is the row above
        var collm1=(i-1)*imageWidth;
        // This is the row below
        var collp1=(i+1)*imageWidth;

        // loop through each row
        for(var j = 1; j < imageWidth-1; j++) {

            // This is the X gradient
            imageData2.data[((imageWidth * i) + j) * 4] = (-1*(data[((imageWidth * i) + j-1) * 4])) + (data[((imageWidth * i) + j+1) * 4]);
            imageData2.data[((imageWidth * i) + j) * 4+1] = (-1*(data[((imageWidth * i) + j-1) * 4+1])) + (data[((imageWidth * i) + j+1) * 4]);
            imageData2.data[((imageWidth * i) + j) * 4+2] = (-1*(data[((imageWidth * i) + j-1) * 4+2])) + (data[((imageWidth * i) + j+1) * 4]);
            imageData2.data[((imageWidth * i) + j) * 4+3] = 255;

// This is the Y gradient
            imageData3.data[((imageWidth * i) + j) * 4] = (-1*(data[((collm1) + j-1) * 4])) + (data[((collp1) + j+1) * 4]);
            imageData3.data[((imageWidth * i) + j) * 4+1] = (-1*(data[((collm1) + j-1) * 4+1])) + (data[((collp1) + j+1) * 4]);
            imageData3.data[((imageWidth * i) + j) * 4+2] = (-1*(data[((collm1) + j-1) * 4+2])) + (data[((collp1) + j+1) * 4]);
            imageData3.data[((imageWidth * i) + j) * 4+3] = 255;

// Can you calculate the magnitude and direction vector?


        }
    }
    // view X gradient
    context.putImageData(imageData2,0,0);

    console.log(imageData2)

    // view Y gradient
    //  context.putImageData(imageData3,0,0);
}

class ImageArray {
    constructor(imageData, width, height) {
        this._raw = imageData;
        this._data = [];
        this._width = width;
        this._height = height;
        for (let i = 0; i < imageData.length; i += 4) {
            let pixel = imageData.slice(i, i+4);
            this._data.push(new ImageDataRGBA(pixel));
        }
    }

    fromRGBA(rgbaData, width, height) {
        let array = [];
        for (let i = 0; i < rgbaData.length; i++) {
            array.push(rgbaData[i].R())
            array.push(rgbaData[i].G())
            array.push(rgbaData[i].B())
            array.push(rgbaData[i].A())
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

    calculate(operations) {
        let array = []
        for (let p = 0; p < this._width; p++) {
            for (let o = 0; o < operations.length; o++) {
                array.push(operations[o](this, p));
            }
        }
        return this.fromRGBA(array, this._width, this._height);
    }
}

class ImageDataRGBA {
    constructor(dataArray) {
        this._r = dataArray[0]
        this._g = dataArray[1]
        this._b = dataArray[2]
        this._a = dataArray[3]
        this._hsv = this.rgb2HSV()
        this._h = this._hsv[0]
        this._s = this._hsv[1]
        this._v = this._hsv[2]
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

    rgb2HSV() {
        const r = this._r / 255;
        const g = this._g / 255;
        const b = this._b / 255;

        const max = Math.max (r, g, b);
        const min = Math.min (r, g, b);

        let h, s, v = max;
        const d = max - min;
        s = max == 0 ? 0 : d / max;
        if (max == min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [ h, s, v ];
    }

    hsv2RGB() {
        let r, g, b;

        const i = Math.floor (this._h * 6);
        const f = this._h * 6 - i;
        const p = this._v * (1 - this._s);
        const q = this._v * (1 - f * this._s);
        let t = this._v * (1 - (1 - f) * this._s);

        // noinspection CommaExpressionJS
        switch (i % 6) {
            case 0: r = this._s, g = t, b = p; break;
            case 1: r = q, g = this._v, b = p; break;
            case 2: r = p, g = this._v, b = t; break;
            case 3: r = p, g = q, b = this._v; break;
            case 4: r = t, g = p, b = this._v; break;
            case 5: r = this._v, g = p, b = q; break;
        }
        return [ r * 255, g * 255, b * 255 ];
    }

    HSV() {
        return this._hsv;
    }

    H() {
        return this._h;
    }

    S() {
        return this._s;
    }

    V() {
        return this._v;
    }
}



