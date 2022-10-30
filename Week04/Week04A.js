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

    let testImageData = new ImageArray(imageData.data, imageWidth, imageHeight);
    let calImageData = testImageData.calculate(function (array, position, width) {
        // console.log(array[position-width]);
        let newPixel;
        if (array[position-width] == undefined) {
            newPixel = new ImagePixel([255,255,255,255], 'RGB')
        } else {
            newPixel = new ImagePixel([
                255-array[position-width].R(),
                255-array[position-width].G(),
                255-array[position-width].B(),
                array[position-width].A(),
            ], 'RGB')
        }
        return newPixel
    })
    console.log(testImageData);
    // console.log(calImageData);
    let testRaw = context.createImageData(imageWidth, imageHeight);
    testRaw.data.set(calImageData.raw());
    console.log(testRaw)
    context.putImageData(testRaw, 0, 0);





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
    // context.putImageData(imageData2,0,0);

    console.log(imageData2)

    // view Y gradient
    //  context.putImageData(imageData3,0,0);
}

class Kernel {

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
        console.log(this._data)
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

    /**
     * @param operation
     * function(Array<ImageDataRGBA>, index of pixel, image width) {
     *     return new ImagePixel
     * }
     * @returns {ImageArray}
     */
    calculate(operation) {
        let array = []
        for (let p = 0; p < this._data.length; p++) {
            array.push(operation(this._data, p, this.width()));
        }
        console.log(array);
        return this.fromRGBA(array, this._width, this._height);
    }
}

class ImagePixel {
    constructor(dataArray, mode) {
        if (mode == 'RGB' || mode == null) {
            this._r = dataArray[0]
            this._g = dataArray[1]
            this._b = dataArray[2]
            this._a = dataArray[3] ?? 1
            let hsv = this.rgb2HSV(this._r, this._g, this._b)
            this._h = hsv[0]
            this._s = hsv[1]
            this._v = hsv[2]
            // console.log(this)
        } else if (mode == 'HSV') {
            this._h = dataArray[0]
            this._s = dataArray[1]
            this._v = dataArray[2]
            this._a = dataArray[3] ?? 1
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
        return this._v;
    }
}



