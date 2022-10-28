// noinspection EqualityComparisonWithCoercionJS

// import {convertDegrees2Radians} from "./utils";

let canvas;
let context;
let randomLines;
let flowField;
let animation;

window.onload = function () {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.style.background = 'black';
    // context.globalCompositeOperation = "destination-over";
    // context.fillStyle = "rgba(0,0,0,1)";
    // context.fillRect(0,0, canvas.width, canvas.height);

    // initCanvas();
    context.fillStyle = 'green';
    context.strokeStyle = 'yellow';
    context.lineWidth = 30;
    context.lineCap = 'round';

    let size = 200;
    let level = 4;
    let sides = 3;
    let scale = 0.5;
    let degree = 45;
    let branches = 2;
    context.save();
    // context.translate(canvas.width/2, canvas.height/2);
    context.scale(1,1);
    context.rotate(0);

    drawSnowFlake(size, level, sides, scale, degree, branches);
}

function drawSnowFlake(size, level, sides, scale, degree, branches) {
    drawFractal(sides, level);

    function drawBranch(level) {
        if (level != 0) {
            context.beginPath();
            context.moveTo(0,0);
            context.lineTo(size, 0);
            context.stroke();

            for (let i=0; i<branches; i++) {
                context.save();
                context.translate(size-(size/branches)*i, 0);
                context.rotate(convertDegrees2Radians(degree));
                context.scale(scale,scale);
                drawBranch(level-1)
                context.restore();

                context.save();
                context.translate(size-(size/branches)*i, 0);
                context.rotate(-convertDegrees2Radians(degree));
                context.scale(scale,scale);
                drawBranch(level-1)
                context.restore();
            }

        } else return;
    }

    function drawFractal(sides, level) {
        context.save();
        context.translate(canvas.width/2, canvas.height/2);
        // context.scale(1,1);
        // context.rotate(0);
        for (let i=0; i<sides; i++) {
            // context.beginPath();
            // context.moveTo(0,0);
            // context.lineTo(size, 0);
            // context.stroke();
            context.rotate(Math.PI*2/sides);
            drawBranch(level);
            // context.scale(0.9,1);
        }
        context.restore();
    }
}



window.addEventListener('resize', function () {
    // cancelAnimationFrame(randomLines.animation);
    cancelAnimationFrame(flowField.animation);
    initCanvas();
})

window.addEventListener('mousemove', function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
})

const mouse = {
    x: window.innerWidth/2,
    y: window.innerHeight/2,
}

function animate() {
    context.clearRect(0,0, canvas.width, canvas.height);
    // drawColorRect();
    // randomLines.animate();
    flowField.animate(Date.now());
    animation = requestAnimationFrame(animate);
}

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // randomLines = new RandomLinesEffect(context, canvas.width, canvas.height);
    flowField = new FlowFieldEffect(context, canvas.width, canvas.height);
    animate();
}

function drawColorRect() {
    for (let i=0; i<6; i++) {
        for (let j=0; j<6; j++) {
            context.fillStyle = 'rgb(' + Math.floor(255-42.5*i) + ',' +
                Math.floor(255-42.5*j) + ',0)';
            context.fillRect(j*25,i*25,25,25);
        }
    }
}



function convertDegrees2Radians(degree) {
    return degree * Math.PI / 180
}


class RandomLinesEffect {
    _context;
    _width;
    _height;
    animation;

    constructor(ctx, width, height) {
        this._context = ctx;
        this._width = width;
        this._height = height;
        this._count = 0;
        this.r = 200;
        this.x = window.innerWidth/2;
        this.y = window.innerHeight/2;
        this.list = [];
        console.log(this.x)
        console.log('load flow field');
        // this.draw(10, 10)
    }

    draw(x, y, a, life) {
        const length = 500;
        this._context.beginPath();
        this._context.moveTo(x, y);

        this._context.strokeStyle = 'rgba(253, 150, 38, '+ a +')';
        var ranX = Math.random();
        var ranY = Math.random();
        this._context.lineTo(
            x + Math.cos(life) * this._width/4,
            y + Math.sin(life) * this._width/4
            // x + length,
            // y + length
        );
        this._context.stroke();
    }

    generateList() {
        let total = 400
        let limit = 200
        if (this._count <= total) {
            this._count += 1;
            this.r = this._count * 20 + 100;
            // console.log(this.x)
            // let sqrX = (this._count-limit)/limit
            // let funY = -(sqrX*sqrX) + 1
            let slice = 0;
            for (let i=0; i<this.list.length; i++) {
                let life = this.list[i].life + 1;
                if (life <= limit) {
                    let factor = this.getFactor(life, limit);
                    this.list[i] = {
                        x: this.x+Math.cos(this.r+i)*100*Math.sin(this.r/5)*factor,
                        y: this.y+Math.sin(this.r+i)*100*Math.cos(this.r/5)*factor,
                        a: factor,
                        life: life
                    }
                    // console.log(this.list[i].a)
                    this.draw(this.list[i].x, this.list[i].y, this.list[i].a, this.list[i].life);
                } else {
                    slice += 1;
                }
            }
            console.log(this.list)
            this.list = this.list.slice(slice, this.list.length);
            if (this._count <= total - limit) {
                for (let i=0; i<1; i++) {
                    let life = 1;
                    let factor = this.getFactor(life, limit);
                    this.list.push({
                        x: this.x+Math.cos(this.r+i)*100*Math.sin(this.r/5)*factor,
                        y: this.y+Math.sin(this.r+i)*100*Math.cos(this.r/5)*factor,
                        a: factor,
                        life: life
                    });
                    this.draw(this.list[i].x, this.list[i].y, this.list[i].a, this.list[i].life);
                }
            }
            // if (this.list.length === 0) {
            //     cancelAnimationFrame(this.animation);
            // }
        }
    }

    getFactor(life, limit) {
        let midC = limit / 2
        let sqrX = (life-midC)/midC
        if ((-(sqrX*sqrX) + 1)>0) {
            return -(sqrX*sqrX) + 1
        } else {
            return 0
        }

    }

    animate() {
        this.generateList();
        // let limit = 50
        // if (this._count <= limit) {
        //     this._count += 1;
        //     this.r = this._count * 20 + 100;
        //     // console.log(this.x)
        //     let sqrX = (this._count-limit)/limit
        //     let funY = -(sqrX*sqrX) + 1
        //     for (let i=0; i<30; i++) {
        //         this.draw(
        //             this.x+Math.cos(this.r+i)*100*Math.sin(this.r/5)*funY,
        //             this.y+Math.sin(this.r+i)*100*Math.cos(this.r/5)*funY,
        //             this._count
        //         );
        //     }
        // }
        // console.log('animate flow field');
        // this.animation = requestAnimationFrame(this.animate.bind(this));
    }
}

class FlowFieldEffect {
    _context;
    _width;
    _height;
    animation;
    gradient;

    constructor(ctx, width, height) {
        this._context = ctx;
        // this._context.strokeStyle = 'rgba(255, 255, 255, 1)';
        this._context.lineWidth = 1;
        this._width = width;
        this._height = height;
        this._count = 0;
        this.r = 0;
        this.x = window.innerWidth/2;
        this.y = window.innerHeight/2;
        this.lastTime = 0;
        this.interval = 1000/60;
        this.timer = 0;
        this.cellSize = 15;
        this.v = 0.03;
        console.log('load flow field');
        // this.draw(10, 10)

        this.createGradient();
        this._context.strokeStyle = this.gradient;
    }

    createGradient() {
        this.gradient = this._context.createLinearGradient(0, 0, this._width, this._height);
        this.gradient.addColorStop(0.1, "#FFAABB");
        this.gradient.addColorStop(0.5, "#ffffff");
        this.gradient.addColorStop(0.9, "#55DDFF");
    }

    drawLine(r, x, y) {
        let positionX = x;
        let positionY = y;
        let deltaX = mouse.x - positionX;
        let deltaY = mouse.y - positionY;
        let distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
        const length = distance/8;
        // console.log(x)
        let directionX = Math.abs((mouse.x - this._width)/this._width);
        let directionY = Math.abs((mouse.y - this._height)/this._height);
        this._context.beginPath();
        this._context.moveTo(x, y);
        this._context.lineTo(x+Math.cos(r)*directionX*length, y+Math.sin(r)*directionY*length);
        this._context.stroke();
    }

    getAngle(r) {

    }

    animate(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        // this._count += 1;
        // this.r = this._count * 0.1;
        // this.x = Math.sin(this._count * 0.05) + this.x;
        // this.y = Math.cos(this._count * 0.02) + this.y;
        // console.log(deltaTime);
        this.r+=this.v;
        if (this.r > 10 || this.r < -10) {
            this.v *= -1;
        }
        for (let y=0; y<this._height; y+=this.cellSize) {
            for (let x=0; x<this._width; x+=this.cellSize) {
                const r = (Math.cos(x*0.01) + Math.sin(y*0.01)) * this.r;
                this.drawLine(r, x, y);
            }
        }
        // if (this.timer > this.interval) {
        //
        //     this.timer = 0;
        //
        // } else {
        //     this.timer += deltaTime;
        // }

        // console.log('animate flow field');
        // this.animation = requestAnimationFrame(this.animate.bind(this));
    }
}