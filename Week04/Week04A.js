// noinspection EqualityComparisonWithCoercionJS

var mouseX;
var mouseY;
const imageObj = new Image ();
imageObj.src = "Test4.png";
//imageObj.src = "pic2.jpg";
console.log( document.body.clientHeight );
const fixCanvas = document.getElementById ('fixCanvas');
const canvasHead = document.getElementById ('headCanvas');
const canvasAverage = document.getElementById('canvasAverage');
const canvasGaussian = document.getElementById('canvasGaussian');
const canvasBilateral = document.getElementById('canvasBilateral');
const canvasSharpen = document.getElementById('canvasSharpen');
const canvasSobel = document.getElementById('canvasSobel');
const canvasScharr = document.getElementById('canvasScharr');
const canvasFeldman = document.getElementById('canvasFeldman');


canvasAverage.style.display = 'none';
canvasBilateral.style.display = "none";
canvasSobel.style.display = 'none';
canvasScharr.style.display = 'none';

imageObj.onload = function () {
    const fixContext = fixCanvas.getContext ('2d');
    const imageWidth = imageObj.width;
    const imageHeight = imageObj.height;

    fixContext.drawImage (imageObj, 0, 0);
    const original = fixContext.getImageData(0, 0, imageWidth, imageHeight);
    const source = new ImageArray (original.data, imageWidth, imageHeight);
    console.log (original)

    let dataHead = source.calculate (function (data, width, height) {
        return new Filter2D(data, width, height).sharpen(3, 1);
    })
    addImage (canvasHead, source, dataHead);
    setTimeout(function () {
        dataHead = null
    }, 500)


    document.getElementById('showAverage').addEventListener('click', () => {
        canvasAverage.style.display = 'block';
        const sourceAverage = new ImageArray (original.data, imageWidth, imageHeight);
        let dataAverage = sourceAverage.calculate(function (data, width, height) {
            return new Filter2D(data, width, height).averageFilter(7);
        })
        addImage(canvasAverage, dataAverage);
    })

    let dataGaussian = source.calculate(function (data, width, height) {
        return new Filter2D(data, width, height).gaussian(5, 2);
    })
    addImage(canvasGaussian, dataGaussian);

    document.getElementById('showBilateral').addEventListener('click', () => {
        canvasBilateral.style.display = "block";
        const sourceBilateral = new ImageArray (original.data, imageWidth, imageHeight);
        let dataBilateral = sourceBilateral.calculate(function (data, width, height) {
            return new Filter2D(data, width, height).bilateral(5, 1);
        })
        addImage(canvasBilateral, dataBilateral);
    })

    let dataSharpen = source.calculate(function (data, width, height) {
        return new Filter2D(data, width, height).sharpen(3, 1);
    })
    addImage(canvasSharpen, dataSharpen);

    document.getElementById('showSobel').addEventListener('click', () => {
        canvasSobel.style.display = "block";
        const sourceSobel = new ImageArray (original.data, imageWidth, imageHeight);
        let dataSobel = sourceSobel.calculate(function (data, width, height) {
            return new Filter2D(data, width, height).sobel();
        })
        addImage(canvasSobel, dataSobel);
    })

    document.getElementById('showScharr').addEventListener('click', () => {
        canvasScharr.style.display = "block";
        const sourceScharr = new ImageArray (original.data, imageWidth, imageHeight);
        let dataScharr = sourceScharr.calculate(function (data, width, height) {
            return new Filter2D(data, width, height).scharr();
        })
        addImage(canvasScharr, dataScharr);
    })

    const sourceFeldman = new ImageArray (original.data, imageWidth, imageHeight);
    let dataFeldman = sourceFeldman.calculate(function (data, width, height) {
        return new Filter2D(data, width, height).feldman();
    })
    addImage(canvasFeldman, dataFeldman);


    function addImage (canvas, data) {
        const context = canvas.getContext ('2d');
        let rawData = context.createImageData (imageWidth, imageHeight);
        rawData.data.set (data.raw ());
        context.putImageData (rawData, 0, 0);
    }
}

class Filter2D {
    constructor(data, width, height) {
        this._data = data;
        this._width = width;
        this._height = height;
    }

    _applyKernelOperation(operation, mode) {
        let array = []
        for (let i = 0; i < this._height; i++) {
            for (let j = 0; j < this._width; j++) {
                // let position = i * this._width + j;
                let pixel = this._kernelOperation(operation, i, j)
                pixel = this._adjustValue(pixel);
                array.push(new ImagePixel(pixel, mode ?? 'RGB'));
            }
        }
        // console.log(array)
        return array;
    }

    _kernelOperation(operation, x, y) {
        return operation(x, y);
    }

    _calculatePixelRGB(kernels, size, position, data, width) {
        let value = [0, 0, 0, 255]
        let mid = (size - 1) / 2
        for (let x = 0; x < size; x++) {
            let ver = x - mid;
            for (let y = 0; y < size; y++) {
                let hor = y - mid
                value[0] += (data[position + width * ver + hor]?.R() ?? 0) * kernels[0][x][y]
                value[1] += (data[position + width * ver + hor]?.G() ?? 0) * kernels[1][x][y]
                value[2] += (data[position + width * ver + hor]?.B() ?? 0) * kernels[2][x][y]
                // value[3] += (this._data[position+this._width*ver+hor]?.A() ?? 0) * kernels[3][x][y]
            }
        }
        // console.log(value)
        return value;
    }

    _calculatePixelHSV() {

    }

    _adjustValue(value) {
        for (let i = 0; i < value.length; i++) {
            if (value[i] > 255) {
                value[i] = 255
            } else if (value[i] < 0) {
                value[i] = 0
            }
        }
        return value
    }

    _expand4Convolution(size) {
        let num = (size-1)/2
        let top = this._data.slice(0, this._width);
        let bottom = this._data.slice(this._data.length-this._width, this._data.length);
        for (let row = 0; row < num; row++) {
            for (let col = 0; col < this._width; col++) {
                this._data.splice(0, 0, top[col])
                this._data.splice(this._data.length, 0, bottom[col])
            }
        }
        this._height += size - 1
        // console.log(this._data)
        for (let index = 0; index < this._height; index += 1) {
            // console.log("LINE")
            let line_start = index * (this._width + size - 1);
            let pixel_start = this._data[line_start];
            let line_end = index * (this._width + size - 1) + this._width + 2;
            let pixel_end = this._data[line_end - 2];
            for (let col = 0; col < ((size-1)/2); col++){
                this._data.splice(line_start, 0, pixel_start);
                this._data.splice(line_end, 0, pixel_end);
            }
        }
        this._width += size - 1
        // console.log(this._data)
    }

    _deletedEdges(array, size) {
        let num = (size-1)/2
        for (let row = 0; row < num; row++) {
            array.splice(0, this._width)
            array.splice((array.length-this._width), this._width)
        }
        // console.log(array)
        this._height -= size - 1
        this._width -= size - 1
        for (let index = 0; index < this._height; index += 1) {
            let line_start = index * this._width;
            let line_end = index * this._width + this._width;
            array.splice(line_start, num);
            array.splice(line_end, num);
        }
        // console.log(array)
        return array;
    }

    _operationBasic(kernel, size, _this) {
        let kernels = [kernel, kernel, kernel]
        return function (x, y) {
            let position = x * _this._width + y;
            return  _this._calculatePixelRGB(kernels, size, position, _this._data, _this._width);
        }
    }

    _operationDifferentiate(kernel1, kernel2, _this) {
        let kernels1 = [kernel1, kernel1, kernel1]
        let kernels2 = [kernel2, kernel2, kernel2]
        return function (x, y) {
            let position = x * _this._width + y;
            let pixelValue = []
            let result1 = _this._calculatePixelRGB(kernels1, 3, position, _this._data, _this._width);
            let result2 = _this._calculatePixelRGB(kernels2, 3, position, _this._data, _this._width);
            // console.log(result1);
            for (let c = 0; c < 4; c++) {
                pixelValue.push(Math.sqrt(result1[c]**2+result2[c]**2));
            }
            return pixelValue
        }
    }

    _operationBilateral(sigma, size, _this) {
        return function (p, q) {
            let kernel = []
            let sum = 0;
            let mid = (size - 1) / 2
            for (let i = 0; i < size; i++) {
                let x = i - mid;
                kernel.push([]);
                for (let j = 0; j < size; j++) {
                    let y = j - mid;
                    let posDX = Math.abs(x);
                    let posDY = Math.abs(y);
                    let distD = Math.exp(-(posDX*posDX+posDY*posDY)/(2*sigma*sigma))
                    let greyD = Math.abs(
                        (_this._data[(p+x)*_this._width+(q+y)]?.V() ?? 0)
                        - (_this._data[p*_this._width+q]?.V() ?? 0)
                    )
                    let value = distD*Math.exp(-(greyD*greyD)/(2*sigma*sigma))
                    kernel[i].push(value);
                    sum += value;
                }
            }
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    kernel[i][j] /= sum;
                }
            }
            let kernels = [kernel, kernel, kernel]
            let position = p * _this._width + q;
            return  _this._calculatePixelRGB(kernels, size, position, _this._data, _this._width);
        }
    }


    _operationBitwise(kernel1, kernel2, _this) {

    }

    _operationMultiChannel(kernelR, kernelG, kernelB, _this) {

    }

    laplacian() {
        let kernel = [[0, 1, 0], [1, -4, 1], [0, 1, 0]]
        return this._applyKernelOperation(
            this._operationBasic(kernel, 3, this)
        )
    }

    sobel() {
        let kernel1 = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]
        let kernel2 = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]]
        return this._applyKernelOperation(
            this._operationDifferentiate(kernel1, kernel2, this)
        )
    }

    feldman() {
        let kernel1 = [[-3, 0, 3], [-10, 0, 10], [-3, 0, 3]]
        let kernel2 = [[-3, -10, -3], [0, 0, 0], [3, 10, 3]]
        return this._applyKernelOperation(
            this._operationDifferentiate(kernel1, kernel2, this)
        )
    }

    scharr() {
        let kernel1 = [[-47, 0, 47], [-162, 0, 162], [-47, 0, 47]]
        let kernel2 = [[-47, -162, -47], [0, 0, 0], [47, 162, 47]]
        return this._applyKernelOperation(
            this._operationDifferentiate(kernel1, kernel2, this)
        )
    }

    sharpen(size, amount) {
        let kernel = []
        let sum = 0;
        let step = 0
        let mid = (size-1)/2
        for (let i = 0; i < size; i++) {
            kernel.push([]);
            for (let j = 0; j < size; j++) {
                if (i == mid && j == mid) {
                    kernel[i].push(1)
                } else if (Math.abs(j - mid) > step) {
                    kernel[i].push(0)
                } else {
                    kernel[i].push(-amount)
                    sum += amount
                }
            }
            if (i < mid) {
                step += 1
            } else {
                step -= 1
            }
        }
        kernel[mid][mid] += sum
        // let kernel = [[0, -1, 0], [-1, 5, -1], [0, -1, 0]]
        return this._applyKernelOperation(
            this._operationBasic(kernel, size, this)
        )
    }

    canny(size) {

    }

    gaussian(size, sigma) {
        sigma = sigma ?? 1
        let kernel = []
        let sum = 0;
        let mid = (size - 1) / 2
        for (let i = 0; i < size; i++) {
            let x = i - mid
            kernel.push([]);
            for (let j = 0; j < size; j++) {
                let y = j - mid
                let value = 1/(2*Math.PI+sigma*sigma)*Math.exp(-(x*x+y*y)/(2*sigma*sigma))
                kernel[i].push(value);
                sum += value;
            }
        }
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                kernel[i][j] /= sum;
            }
        }
        console.log(kernel);
        return this._applyKernelOperation(
            this._operationBasic(kernel, size, this)
        )
    }

    bilateral(size, sigma) {
        this._expand4Convolution(size)
        let array = this._applyKernelOperation(
            this._operationBilateral(sigma, size, this)
        )
        array = this._deletedEdges(array, size)
        return array;
    }

    averageFilter(size) {
        let average = 1 / size**2;
        let kernel = []
        for (let i = 0; i < size; i++) {
            kernel.push([]);
            for (let j = 0; j < size; j++) {
                kernel[i].push(average);
            }
        }
        return this._applyKernelOperation(
            this._operationBasic(kernel, size, this)
        )
    }

    medianFilter(size) {
        //TODO: Median Filter requires a more complex implementation of algorithm
    }

    dilate(image, size) {

    }

    erode(size) {

    }

    adaptiveThreshold(size) {

    }

    directionalChromaticAbberation(size, direction) {
        let kernelR = [];
        let kernelG = [];
        let kernelB = [];
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
        let array = operation(this._data, this._width, this._height);
        // for (let i = 0; i < this._height; i++) {
        //     for (let j = 0; j < this._width; j++) {
        //         array.push(operation(this._data, i, j, this._width));
        //     }
        // }
        // console.log(array);
        return this.fromRGBA(array, this._width, this._height);
    }

    convert2Grey() {

    }
}

class ImagePixel {
    constructor(dataArray, mode) {
        if (mode == 'RGB' || mode == null) {
            this._r = dataArray[0]
            this._g = dataArray[1]
            this._b = dataArray[2]
            this._a = dataArray[3] ?? 255
            let hsv = this.rgb2HSV(this._r, this._g, this._b)
            this._h = hsv[0]
            this._s = hsv[1]
            this._v = hsv[2]
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
        return this._v;
    }
}