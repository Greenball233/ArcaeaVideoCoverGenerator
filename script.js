const canvas = document.getElementById("cover");
const ctx = canvas.getContext("2d");
const start = document.getElementById("start");
const backgroundFile = document.getElementById("background-file");
const coverFile = document.getElementById("cover-file");
const mainColorInput = document.getElementById("main-color");
const mainAlphaInput = document.getElementById("main-alpha");
const useBlurInput = document.getElementById("use-blur");
const blurRangeInput = document.getElementById("blur-range");
const blurColorInput = document.getElementById("blur-color");
const blurAlphaInput = document.getElementById("blur-alpha");
const downloadButton = document.getElementById("download");
const shadowColorInput = document.getElementById("shadow-color");
const songTitleInput = document.getElementById("song-title");
const songArtistInput = document.getElementById("song-artist");
const diffInput = document.getElementById("song-diff");
const diffColors = [
    `10, 130, 190`,
    `100, 140, 60`,
    `80, 25, 75`,
    `130, 35, 40`
];
const minValue = [0.2, -0.1, -0.1]
const minValueAlpha = [-0.1, -0.1, -0.05, -0.2];
const ratingInput = document.getElementById("song-rating");
let backgroundUrl = "";
let coverUrl = "";

window.addEventListener("load", function() {
    backgroundFile.disabled = false;
    coverFile.disabled = false;
});
mainAlphaInput.addEventListener("change", function() {
    if (this.value > 1) {
        this.value = 1;
    }
    if (this.value < 0) {
        this.value = 0;
    }
    if (this.value === null) {
        this.value = 0.5;
    }
});
blurRangeInput.addEventListener("change", function() {
    if (this.value > 20) {
        this.value = 20;
    }
    if (this.value < 0) {
        this.value = 0;
    }
    if (this.value === null) {
        this.value = 14.3;
    }
});
backgroundFile.addEventListener("change", readBackground)
coverFile.addEventListener("change", readCover);
start.addEventListener("click", draw);
downloadButton.addEventListener("click", download);

function resizeCanvas(isBili) {
    canvas.width = isBili ? 1146 : 1920;
    canvas.height = isBili ? 717 : 1080;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackGround();
}

function drawBackGround() {
    const background = new Image();
    background.src = (backgroundUrl === "") ? "" : backgroundUrl;
    background.onload = function() {
        if (useBlurInput.checked) {
            let blurBackground = new Image();
            blurBackground.src = blurImage(background, parseFloat(blurRangeInput.value));
            blurBackground.onload = function() {
                ctx.drawImage(blurBackground, 0, 0, canvas.width, canvas.height);
                ctx.fillStyle = set16ToRgb(blurColorInput.value, parseFloat(blurAlphaInput.value), 0, 0);
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawTopLeftMask();
            }
        } else {
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
            drawTopLeftMask();
        }
    }
}

function drawTopLeftMask() {
    let topTitleMaskCanvas = document.createElement("canvas");
    topTitleMaskCanvas.width = canvas.width;
    topTitleMaskCanvas.height = canvas.height;
    let ctx1 = topTitleMaskCanvas.getContext("2d");
    let mask = [
        0, 0,
        0, 0.2 * canvas.height,
        0.475 * canvas.width - 0.2 * canvas.height, 0.2 * canvas.height,
        0.475 * canvas.width, 0
    ];
    polygon(mask, ctx1, set16ToRgb(mainColorInput.value, 0.5, 0, 0), false);
    let topTitleMaskImage = new Image();
    topTitleMaskImage.src = topTitleMaskCanvas.toDataURL("image/png");
    topTitleMaskImage.onload = function() {
        ctx.drawImage(topTitleMaskImage, 0, 0);
        topTitleMaskCanvas.remove();
        drawDiffMask();
    }
}

function drawDiffMask() {
    let diffMaskCanvas = document.createElement("canvas");
    diffMaskCanvas.width = canvas.width;
    diffMaskCanvas.height = canvas.height;
    let ctx1 = diffMaskCanvas.getContext("2d");
    let mask = [
        0.6 * canvas.width, 0.2 * canvas.height,
        0.6 * canvas.width + 0.2 * canvas.height, 0,
        canvas.width, 0,
        canvas.width, 0.2 * canvas.height
    ];
    polygon(mask, ctx1, "rgba(" + diffColors[diffInput.selectedIndex] + ", " + (89 / 255.0 - minValueAlpha[3]) + ")", false);
    let diffMaskImage = new Image();
    diffMaskImage.src = diffMaskCanvas.toDataURL("image/png");
    diffMaskImage.onload = function() {
        ctx.drawImage(diffMaskImage, 0, 0);
        diffMaskCanvas.remove();
        drawTopTitle();
    }
}

function drawTopTitle() {
    let topTitleCanvas = document.createElement("canvas");
    topTitleCanvas.width = canvas.width;
    topTitleCanvas.height = canvas.height;
    let ctx1 = topTitleCanvas.getContext("2d");
    ctx1.fillStyle = "#FFF";
    ctx1.shadowColor = `rgba(0, 0, 0, ${64/255.0})`;
    ctx1.shadowOffsetX = 5;
    ctx1.shadowOffsetY = 5;
    ctx1.font = 0.065 * canvas.height + "px RobotoCondensed Regular";
    ctx1.textBaseline = "middle";
    ctx1.fillText("Arcaea Fanmade", 5, topTitleCanvas.height / 2);
    let topTitleImage = new Image();
    topTitleImage.src = topTitleCanvas.toDataURL("image/png");
    topTitleImage.onload = function() {
        ctx.drawImage(topTitleImage, 0.05 * canvas.width - 5, -0.4 * canvas.height, canvas.width, canvas.height);
        topTitleCanvas.remove();
        drawDiff();
    };
}

function drawDiff() {
    let diffCanvas = document.createElement("canvas");
    diffCanvas.width = canvas.width;
    diffCanvas.height = canvas.height;
    let ctx1 = diffCanvas.getContext("2d");
    ctx1.fillStyle = "#FFF";
    ctx1.lineWidth = 10;
    ctx1.strokeStyle = "rgba(" + diffColors[diffInput.selectedIndex] + ", " + 0.5 + ")";
    ctx1.font = 0.065 * canvas.height + "px RobotoCondensed Regular";
    ctx1.textBaseline = "middle";
    let rating = parseInt(ratingInput.value);
    let diff = diffInput.value + " " + ((rating === 0 || isNaN(rating)) ? "?" : rating);
    ctx1.strokeText(diff, 5, diffCanvas.height / 2);
    ctx1.fillText(diff, 5, diffCanvas.height / 2);
    let qwq = ctx1.measureText(diff).width;
    let topTitleImage = new Image();
    topTitleImage.src = diffCanvas.toDataURL("image/png");
    topTitleImage.onload = function() {
        ctx.drawImage(topTitleImage, (0.35 * canvas.width - qwq) / 2 + 0.65 * canvas.width, -0.4 * canvas.height, canvas.width, canvas.height);
        diffCanvas.remove();
        drawCoverMask()
    };
}

function drawCoverMask() {
    let y = 0.225 * canvas.height;
    let side = canvas.width / 3;
    let coverMaskCanvas = document.createElement("canvas");
    coverMaskCanvas.width = canvas.width;
    coverMaskCanvas.height = canvas.height;
    let ctx1 = coverMaskCanvas.getContext("2d");
    ctx1.fillStyle = set16ToRgb(mainColorInput.value, parseFloat(mainAlphaInput.value), minValue[2], minValueAlpha[2]);
    ctx.fillRect((canvas.width - side) / 2, y, side, canvas.height - y)
    coverMaskCanvas.remove();
    drawCoverShadow(y);
}

function drawCoverShadow(maskY) {
    let side = canvas.width / 3.75;
    changeImageColor(".\\song_shadow.png", shadowColorInput.value, function (imgData){
        let changedShadow = new Image();
        changedShadow.src = imgData;
        changedShadow.onload = function() {
            let shadowCanvas = document.createElement("canvas");
            shadowCanvas.width = changedShadow.width * side / 256;
            shadowCanvas.height = changedShadow.height * side / 256;
            let ctx1 =shadowCanvas.getContext("2d");
            ctx1.drawImage(changedShadow, 0, 0, shadowCanvas.width, shadowCanvas.height)
            let shadowImage = new Image();
            shadowImage.src = shadowCanvas.toDataURL("image/png");
            shadowImage.onload = function() {
                let y = maskY + (canvas.width / 3 - side) / 2;
                ctx.drawImage(shadowImage, (canvas.width - shadowImage.width) / 2, y - (changedShadow.height - 256) * side / 512);
                shadowCanvas.remove();
                drawCover(side, y);
            }
        }
    })
}

function drawCover(side, y) {
    let coverImage = new Image();
    coverImage.src = coverUrl;
    coverImage.onload = function() {
        ctx.drawImage(coverImage, (canvas.width - side) / 2, y, side, side)
        drawCenterMask()
    };
}

function drawCenterMask() {
    let centerMaskCanvas = document.createElement("canvas");
    centerMaskCanvas.width = canvas.width;
    centerMaskCanvas.height = canvas.height;
    let ctx1 = centerMaskCanvas.getContext("2d");
    ctx1.fillStyle = set16ToRgb(mainColorInput.value, parseFloat(mainAlphaInput.value), minValue[0], minValueAlpha[0]);
    let centerY = 0.775 * centerMaskCanvas.height;
    ctx1.fillRect(0, centerY, centerMaskCanvas.width, canvas.height - centerY);
    ctx1.save();
    let y = 0.474 * centerMaskCanvas.height;
    let left = [
        0, y,
        0, centerMaskCanvas.height,
        Math.sqrt(3) * (centerMaskCanvas.height - y), centerMaskCanvas.height
    ];
    let right = [
        centerMaskCanvas.width, y,
        centerMaskCanvas.width, canvas.height,
        centerMaskCanvas.width - Math.sqrt(3) * (canvas.height - y), canvas.height
    ];
    polygon(left, ctx1, "#FFF", 1, 0, 0, true);
    polygon(right, ctx1, "#FFF", 1, 0, 0, true);
    let centerMaskImage = new Image();
    centerMaskImage.src = centerMaskCanvas.toDataURL("image/png");
    centerMaskImage.onload = function() {
        ctx.drawImage(centerMaskImage, 0, 0);
        centerMaskCanvas.remove();
        drawBottomLRMask(left, right, centerY);
    };
}

function drawBottomLRMask(left, right, centerY) {
    let bottomLRMaskCanvas = document.createElement("canvas");
    bottomLRMaskCanvas.width = canvas.width;
    bottomLRMaskCanvas.height = canvas.height;
    let ctx1 = bottomLRMaskCanvas.getContext("2d");
    polygon(left, ctx1, set16ToRgb(mainColorInput.value, parseFloat(mainAlphaInput.value), minValue[1], minValueAlpha[1]), false);
    polygon(right, ctx1, set16ToRgb(mainColorInput.value, parseFloat(mainAlphaInput.value), minValue[1], minValueAlpha[1]), false);
    let bottomLRMaskImage = new Image();
    bottomLRMaskImage.src = bottomLRMaskCanvas.toDataURL("image/png");
    bottomLRMaskImage.onload = function() {
        ctx.drawImage(bottomLRMaskImage, 0, 0);
        bottomLRMaskCanvas.remove();
        drawTextAndShadow(centerY);
    };
}

function drawTextAndShadow(y) {
    let shadowImage = new Image();
    shadowImage.src = ".\\text_shadow.png";
    shadowImage.onload = function() {
        let shadowCanvas = document.createElement("canvas");

        let textCanvas = document.createElement("canvas");
        textCanvas.width = canvas.width;
        textCanvas.height = canvas.height;
        let ctx1 = shadowCanvas.getContext("2d");
        let ctx2 = textCanvas.getContext("2d");
        ctx1.textAlign = "center";
        ctx2.textAlign = "center";
        ctx2.fillStyle = "#FFF";
        ctx2.shadowColor = `rgba(0, 0, 0, ${64/255.0})`;
        ctx2.shadowOffsetX = 5;
        ctx2.shadowOffsetY = 5;
        let titleSize = 0.065 * textCanvas.height
        ctx2.font = titleSize + "px RobotoCondensed Regular";
        let titleLength = ctx2.measureText(songTitleInput.value).width;
        ctx2.fillText(songTitleInput.value, textCanvas.width / 2, y + titleSize);
        ctx2.save();
        let artistSize = 0.05 * textCanvas.height;
        ctx2.font = artistSize + "px RobotoCondensed Regular";
        let artistLength = ctx2.measureText(songArtistInput.value).width
        ctx2.fillText(songArtistInput.value, textCanvas.width / 2, y + titleSize + artistSize);
        ctx2.save();
        let length;
        if (titleLength === artistLength) length = titleLength/10.0;
        else length = Math.max(titleLength, artistLength);
        shadowCanvas.width = length;
        shadowCanvas.height = 2 * titleSize;
        ctx1.drawImage(shadowImage, 0, 0, shadowCanvas.width, shadowCanvas.height);
        let qwq = new Image();
        qwq.src = shadowCanvas.toDataURL();
        qwq.onload = function() {
            ctx.drawImage(qwq, (canvas.width - shadowCanvas.width) / 2, y);
            let textImage = new Image();
            textImage.src = textCanvas.toDataURL("image/png");
            textImage.onload = function() {
                ctx.drawImage(textImage, 0, 0);
                shadowCanvas.remove();
                textCanvas.remove();
            }
        }
    }
}

function blurImage(image, range) {
    let blurCanvas = document.createElement("canvas");
    blurCanvas.setAttribute("id", "blur-canvas");
    blurCanvas.width = image.width;
    blurCanvas.height = image.height;
    let ctx = blurCanvas.getContext("2d");
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, blurCanvas.width, blurCanvas.height);
    StackBlur.canvasRGBA(blurCanvas, 0, 0, image.width, image.height, range / 2);
    let output = blurCanvas.toDataURL("image/png");
    blurCanvas.remove();
    return output;
}

function readBackground() {
    let fileReader = new FileReader();
    if (backgroundFile.files.length < 1) return;
    let file = backgroundFile.files[0];
    fileReader.readAsDataURL(file);
    if (fileReader.error) {
        setError('错误：无法读取文件', "background-message");
        return;
    }
    fileReader.onprogress = progress => {
        const size = file.size;
        setLog("读取进度：" + Math.floor(progress.loaded / size * 100) + "%", "background-message");
    };
    fileReader.onloadend = function readEnd() {
        setLog("读取完毕！", "background-message");
        backgroundUrl = fileReader.result.substring(0);
        backgroundFile.disabled = true;
    };
}

function readCover() {
    let fileReader = new FileReader();
    if (coverFile.files.length < 1) return;
    let file = coverFile.files[0];
    fileReader.readAsDataURL(file);
    if (fileReader.error) {
        setError('错误：无法读取文件', "cover-message");
        return;
    }
    fileReader.onprogress = progress => {
        const size = file.size;
        setLog("读取进度：" + Math.floor(progress.loaded / size * 100) + "%", "cover-message");
    };
    fileReader.onloadend = function readEnd() {
        setLog("读取完毕！", "cover-message");
        coverUrl = fileReader.result.substring(0);
        coverFile.disabled = true;
    };
}

function setLog(msg, id) {
    let msgBox = document.getElementById(id);
    msgBox.style.color = "black";
    msgBox.innerHTML = msg;
}

function setError(msg, id) {
    let msgBox = document.getElementById(id);
    msgBox.style.color = "red";
    msgBox.innerHTML = msg;
}

function set16ToRgb(str, alpha, cOffset, aOffset) {
    const reg = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    if (!reg.test(str)) {
        return;
    }
    let newStr = (str.toLowerCase()).replace(/#/g, '')
    let len = newStr.length;
    if (len === 3) {
        let t = ''
        for (let i = 0; i < len; i++) {
            t += newStr.slice(i, i + 1).concat(newStr.slice(i, i + 1))
        }
        newStr = t
    }
    let arr = []; //将字符串分隔，两个两个的分隔
    for (let i = 0; i < 6; i = i + 2) {
        let s = newStr.slice(i, i + 2)
        arr.push(parseInt("0x" + s))
    }
    if (cOffset !== undefined && cOffset !== 0) {
        for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.round(arr[i] - (cOffset * 255.0));
        }
    }
    let fAlpha = parseFloat(alpha);
    if (aOffset !== undefined && aOffset !== 0) fAlpha -= aOffset;
    arr.push(fAlpha);
    return "rgba(" + arr.join(",") + ")";
}

function download() {
    const downloadElement = document.createElement("a");
    downloadElement.download = "歌曲封面_" + songTitleInput.value;
    downloadElement.href = canvas.toDataURL("image/png");
    document.body.appendChild(downloadElement);
    downloadElement.click();
    downloadElement.remove();
}

function changeImageColor(imgUrl, color = "#00ff7f", callback) {
    let img = new Image();
    img.src = imgUrl;
    let newR = parseInt("0x" + color.substr(1, 2));
    let newG = parseInt("0x" + color.substr(3, 2));
    let newB = parseInt("0x" + color.substr(5, 2));
    img.onload = function() {
        let width = img.width, height = img.height, canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        let imageData = ctx.getImageData(0, 0, width, height), data = imageData.data;
        let i = 0;
        while (i < data.length) {
            i++;
            i++;
            i++;
            let a = data[i++];
            if (a === 255) {
                data[i - 1] = 255;
            } else {
                data[i - 4] = newR;
                data[i - 3] = newG;
                data[i - 2] = newB;
                data[i - 1] = a;
            }
        }
        ctx.putImageData(imageData, 0, 0);
        let imgData = canvas.toDataURL("image/png");
        if (callback != null) callback && callback(imgData);
    };
    return img;
}

function polygon(poly, context, style, useClear) {
    if (useClear) context.globalCompositeOperation = "destination-out";
    context.fillStyle = style;
    context.strokeStyle = style;
    context.lineWidth = 1;
    if ((poly.length % 2) !== 0) return;
    context.beginPath();
    context.moveTo(poly[0], poly[1]);

    for (let i = 2; i < poly.length; i += 2) {
        context.lineTo(poly[i], poly[i + 1]);
    }
    context.closePath();
    context.fill();
    context.stroke();
    if (useClear) context.globalCompositeOperation = "source-over";
}
