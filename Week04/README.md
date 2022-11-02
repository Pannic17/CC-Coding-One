# Week 04 by PanNic  
  
## A. About the Program: Core  
Self-implemented `ImageArray` & `ImagePixel` class to manage pixels of `ImageData`  
Built-in conversion between raw `ImageData` and self-implemented `ImageArray`  
Automatically calculate HSV value to enable manipulation of HSV together with RGB  
Simply use `ImageArray.calculate()` function to calculate pixel values  

#### ImageArray.calculate(function)  
``` javascript
ImageArray.calculate(function(array, width, height) {  
  return Array<ImagePixel>;  
})  
```
  
Input a function that re-calculate every pixel according to the input function operation and return a new `ImageArray`
##### Parameters
`array`: the reformat ImageArray of original image  
`width`: the width of original image  
`height`: the height of original image  
`new ImagePixel`: new pixel value after calculation  
  
## B. Kernels and Filters
Implemented `Filter2D` class that contains lots of built-in filters based on convolutional kernel  

### Built-in Filters
**Blur & Sharpen**: average filter, bilateral filter, gaussian filter, sharpen  
**Morphological Transformation**: adaptive thresholding(average/gaussian), erosion, dilation  
**Edge Detection**: sobel, sobel-feldman, scharr, laplacian, canny  
**Color Correction**: chromatic aberration  
  
`Filter2D(data, width, height)`  
  
Initialized a filter object that processes image data with input width & height  

`.grey()`convert the input image to grey-scale image

### Blur & Sharpen

`.averageFilter(size)`  
Value of generated kernel matrix is evenly distributed according to size.  
`size`: size of the kernel, must be even number  

`.gaussian(size, sigma)`  
Perform a Gaussian blur effect that values in the kernel follow normal distribution.  
`size`: size of the kernel, must be even number  
`sigma`: sigma value of normal distribution, the higher, the more blur  

`.bilateral(size, sigma)`  
Bilateral filter smooths the image by both Gaussian and Grey-Scale gradient thus blurs the images and keeps information at the same time. The kernel of bilateral filter is calculated dynamically to adapt to the different grey-scale gradient of each pixel.  
**Reference**  https://homepages.inf.ed.ac.uk/rbf/CVonline/LOCAL_COPIES/MANDUCHI1/Bilateral_Filtering.html  
`size`: size of the kernel, must be even number  
`sigma`: sigma value of normal distribution, the higher, the more blur  

`.sharpen(size, amount)`  
Sharpen effect uses an inverted laplacian operator to stress the edges of the image.  
`size`: size of the kernel, must be even number  
`amount`: sharpen level, range 0 to 1  

### Edge Detection

`.laplacian()`  
Laplacian operator uses an eclipse or cross kernel rather than square one, thus focus on the edges of the image.  
*The built-in laplacian operator kernel size is 3.*  

`.sobel()`  
Sobel operator is an edge detection algorithm. Sobel algorithm computes the gradient from both vertical & horizontal and then calculate the differentiated distance of the gradient. Thus performs the edge detection.  
**Reference**  https://en.wikipedia.org/wiki/Sobel_operator  
*The built-in sobel operator kernel size is 3.*

`.scharr()`  
Scharr operator is a utilized sobel operator that increases the adjust-weight when calculating differentiate distances and uses grey-scale image as input.  
**Reference**  https://docs.opencv.org/4.x/d5/d0f/tutorial_py_gradients.html  
*The built-in scharr operator kernel size is 3.*  

`.feldman()`  
Sobel-Feldman operator is a utilized sobel operator that use an adjusted weight.  
*The built-in sobel-feldman operator kernel size is 3.*  

### Morphological Transformation

`adaptiveThresholdAverage(size)`  
**Image Binarization** is the process that convert image to black white image for further processing. For pixels with grey-scale value that is over the threshold, the pixel will be truncate to white, otherwise to black  
**Reference**  https://docs.opencv.org/4.x/d7/d4d/tutorial_py_thresholding.html  
Adaptive Average Threshold dynamically calculate the threshold value of each pixel, The threshold will be the mean of all pixels inside the kernel.  
`size`: size of the kernel, must be even number, the larger, the less information are kept  

`.adaptiveThresholdGaussian(size, sigma)`  
Adaptive Gaussian Threshold dynamically calculate the threshold value of each pixel, The threshold will be the weighted gaussian of all pixels inside the kernel.  
`size`: size of the kernel, must be even number, the larger, the less information are kept  
`sigma`: sigma value of normal distribution, the lower, the more concentrate  

`.dilate(size, threshold)`  
Dilate effect will extend the white border of a binary image. When processing Dilate effect, an Adaptive Average Threshold filter will apply to convert the original image to binary.  
`size`: size of the kernel, must be even number, the larger, the more pixels expanded  
`threshold`: the threshold size of adaptive average threshold  

`.erode(size, threshold)`  
Erode effect will shrink the white border of a binary image. When processing Dilate effect, an Adaptive Average Threshold filter will apply to convert the original image to binary.  
`size`: size of the kernel, must be even number, the larger, the more pixels shrink  
`threshold`: the threshold size of adaptive average threshold  

### Color Correction

`.chromaticAberration(offset)`  
Chromatic Aberration is also called spherochromatism. It is the seperation of different channels of RGB values  
**Reference**  https://en.wikipedia.org/wiki/Chromatic_aberration  
*This implementation of chromatic aberration fix the angle at approximately 60 degrees with fixed channel direction*  
`offset`: the offset of channels to origin, the larger, the more obvious  

### Functions
```
_applyKernelOperation(operation, mode)
_kernelOperation(operation, x, y)
_calculatePixelRGB(kernels, size, position, data, width)
_getGaussianKernel(size, sigma)
_adaptiveBilateral(sigma, x, y, p, q, width, data)
_adjustValue(value)
_expand4Convolution(size)
_deleteEdges(array, size)
_operationBasic(kernel, size, _this)
_operationDifferentiate(kernel1, kernel2, _this)
_operationAdaptive(_this, sigma, size, adaptive)
_operationMultiChannel(kernelR, kernelG, kernelB, _this, size)
_operationMorphological(_this, size, inv)
_operationAdaptiveThreshold(_this, size, kernel)
_bitwiseThreshold(position, data, threshold)
```
