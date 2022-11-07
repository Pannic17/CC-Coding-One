function loadSource (source) {
    if (source) {
        let threshold = 15
        let dataHead = source.calculate (function (data, width, height) {
            let array = new Filter2D(data, width, height).sharpen(3, 1);
            array = new Filter2D(array, width, height).erode(1, threshold);
            array = new Filter2D(array, width, height).gaussian(3);
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

class Effect {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.fontSize = 5;
        this.columns = this.width/this.fontSize;
        this.symbols = []
        this._initialize();
    }

    _initialize() {
        for (let i = 0; i < this.columns; i++) {
            this.symbols[i] = new Symbol(i, 0, this.fontSize, this.height);
        }
    }
}

function addImage(canvas, data) {
    const context = canvas.getContext('2d');
    let rawData = context.createImageData(400, 400);
    rawData.data.set(data.raw ());
    context.putImageData(rawData, 0, 0);
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
        return function (p, q) {
            let position = p * _this._width + q;
            return  _this._calculatePixelRGB(kernels, size, position, _this._data, _this._width);
        }
    }

    _operationDifferentiate(kernel1, kernel2, _this) {
        let kernels1 = [kernel1, kernel1, kernel1]
        let kernels2 = [kernel2, kernel2, kernel2]
        return function (p, q) {
            let position = p * _this._width + q;
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

    _operationAdaptive(_this, sigma, size, adaptive) {
        return function (p, q) {
            let kernel = []
            let sum = 0;
            let mid = (size - 1) / 2
            for (let i = 0; i < size; i++) {
                let x = i - mid;
                kernel.push([]);
                for (let j = 0; j < size; j++) {
                    let y = j - mid;
                    let value = adaptive(sigma, x, y, p, q, _this._width, _this._data)
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
            return _this._calculatePixelRGB(kernels, size, position, _this._data, _this._width);
        }
    }

    _operationMultiChannel(kernelR, kernelG, kernelB, _this, size) {
        let kernels = [kernelR, kernelG, kernelB];
        return function (p, q) {
            let position = p * _this._width + q;
            return  _this._calculatePixelRGB(kernels, size, position, _this._data, _this._width);
        }
    }

    grey() {
        let array = new ImageArray([], this._width, this._height).fromArray(this._data, this._width, this._height)
        return array.convert2Grey().dataRGBA()
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
        // let array = new ImageArray([], this._width, this._height).fromRGBA(this._data, this._width, this._height)
        this._data = this.grey();
        let kernel1 = [[-3, 0, 3], [-10, 0, 10], [-3, 0, 3]]
        let kernel2 = [[-3, -10, -3], [0, 0, 0], [3, 10, 3]]
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
        //TODO: TOO Complex
    }

    gaussian(size, sigma) {
        sigma = sigma ?? 1
        let kernel = this._getGaussianKernel(size, sigma)
        return this._applyKernelOperation(
            this._operationBasic(kernel, size, this)
        )
    }

    _getGaussianKernel(size, sigma) {
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
        return kernel
    }

    bilateral(size, sigma) {
        this._expand4Convolution(size)
        let array = this._applyKernelOperation(
            this._operationAdaptive(this, sigma, size, this._adaptiveBilateral)
        )
        return this._deletedEdges(array, size)
    }

    _adaptiveBilateral(sigma, x, y, p, q, width, data) {
        let posDX = Math.abs(x);
        let posDY = Math.abs(y);
        let distD = Math.exp(-(posDX*posDX+posDY*posDY)/(2*sigma*sigma))
        let greyD = Math.abs(
            (data[(p+x)*width+(q+y)]?.V() ?? 0)
            - (data[p*width+q]?.V() ?? 0)
        )
        return distD*Math.exp(-(greyD*greyD)/(2*sigma*sigma))
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

    dilate(size, threshold) {
        this._data = this.adaptiveThresholdAverage(threshold)
        return this._applyKernelOperation(
            this._operationMorphological(this, size, false)
        )
    }

    erode(size, threshold) {
        this._data = this.adaptiveThresholdAverage(threshold)
        return this._applyKernelOperation(
            this._operationMorphological(this, size, true)
        )
    }

    _operationMorphological(_this, size, inv) {
        inv = inv ?? false
        return function (p, q) {
            let value = [0, 0, 0, 255]
            let channel = inv ? 255 : 0
            let mid = (size - 1) / 2
            for (let i = 0; i < size; i++) {
                let x = i - mid;
                for (let j = 0; j < size; j++) {
                    let y = j - mid;
                    if (_this._data[(p+x)*_this._width+(q+y)]?.V() >= 1 && inv == false) {
                        channel = 255; break;
                    } else if (_this._data[(p+x)*_this._width+(q+y)]?.V() <= 0 && inv == true) {
                        channel = 0; break;
                    }
                }
            }
            value[0] = channel;
            value[1] = channel;
            value[2] = channel;
            return value;
        }
    }

    adaptiveThresholdAverage(size) {
        this._data = this.gaussian(size, 1)
        // let array = new ImageArray([], this._width, this._height).fromRGBA(this._data, this._width, this._height)
        this._data = this.grey();
        let average = 1 / size**2;
        let kernel = []
        for (let i = 0; i < size; i++) {
            kernel.push([]);
            for (let j = 0; j < size; j++) {
                kernel[i].push(average);
            }
        }
        return this._applyKernelOperation(
            this._operationAdaptiveThreshold(this, size, kernel)
        )
    }

    adaptiveThresholdGaussian(size, sigma) {
        sigma = sigma ?? 1
        // let array = new ImageArray([], this._width, this._height).fromRGBA(this._data, this._width, this._height)
        this._data = this.grey();
        let kernel = this._getGaussianKernel(size, sigma);
        return this._applyKernelOperation(
            this._operationAdaptiveThreshold(this, size, kernel)
        )
    }

    _bitwiseThreshold(position, data, threshold) {
        let value = [0, 0, 0, 255]
        let over = (data[position]?.V() ?? 1) >= threshold ?? 0;
        value[0] = over ? 255 : 0
        value[1] = over ? 255 : 0
        value[2] = over ? 255 : 0
        // console.log(value)
        return value;
    }

    _operationAdaptiveThreshold(_this, size, kernel) {
        return function (p, q) {
            let threshold = 0;
            let mid = (size - 1) / 2
            for (let i = 0; i < size; i++) {
                let x = i - mid;
                kernel.push([]);
                for (let j = 0; j < size; j++) {
                    let y = j - mid;
                    threshold += _this._data[(p+x)*_this._width+(q+y)]?.V() * kernel[i][j]
                }
            }
            // console.log(threshold)
            let position = p * _this._width + q;
            return _this._bitwiseThreshold(position, _this._data, threshold-((threshold-0.5)/20));
        }
    }

    chromaticAberration(offset) {
        let size = offset * 2 + 1;
        let kernelR = []
        let kernelG = []
        let kernelB = []
        for (let i = 0; i < size; i++) {
            kernelR.push([]);
            kernelG.push([]);
            kernelB.push([]);
            for (let j = 0; j < size; j++) {
                kernelR[i].push(0);
                kernelG[i].push(0);
                kernelB[i].push(0);
            }
        }
        let short = Math.floor(offset/2)
        kernelR[0][0] = 1;
        kernelG[offset*2][short] = 1;
        kernelB[short][offset*2] = 1;
        console.log(kernelR)
        console.log(kernelG)
        console.log(kernelB)
        return this._applyKernelOperation(
            this._operationMultiChannel(kernelR, kernelG, kernelB, this, size)
        )
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