// 取得 HTML 裡的畫布和分數元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

// --- 遊戲參數設定 ---
const gameWidth = canvas.width;
const gameHeight = canvas.height;

// --- 柴犬參數 ---
let shibaX = gameWidth / 2 - 25;
let shibaY = gameHeight - 70;
const shibaWidth = 50;
const shibaHeight = 50;
let shibaSpeed = 5;
let isJumping = false;
let jumpVelocity = 0;
const gravity = 0.5;
const jumpPower = -12;

// --- 雞腿和指甲刀參數 ---
const objectWidth = 30;
const objectHeight = 30;
let objects = [];
let objectSpeed = 2;
let frameCount = 0;

// --- 遊戲狀態 ---
let score = 0;
let lives = 3;
let gameOver = false;

// --- 圖片載入 ---
// 請在此替換成你的 GitHub 儲存庫名稱！
// 例如：如果你的儲存庫是 https://yourusername.github.io/shiba-adventure/
// 則 repoName = 'shiba-adventure';
const repoName = '你的儲存庫名稱'; 

// 判斷當前環境的路徑
// 如果網址包含 'github.io' 和 repoName，就使用 GitHub Pages 的路徑
// 否則，假設是在本機開發，使用相對路徑
const basePath = window.location.href.includes('github.io') && window.location.href.includes(repoName)
    ? './' + repoName + '/'
    : './'; // 本機開發時的路徑

const shibaImg = new Image();
shibaImg.src = basePath + 'shiba.png';

const chickenLegImg = new Image();
chickenLegImg.src = basePath + 'chicken_leg.png';

const nailClipperImg = new Image();
nailClipperImg.src = basePath + 'nail_clipper.png';

let loadedImages = 0;
const totalImages = 3;

function imageLoaded() {
    loadedImages++;
    if (loadedImages === totalImages) {
        gameLoop();
    }
}

shibaImg.onload = imageLoaded;
chickenLegImg.onload = imageLoaded;
nailClipperImg.onload = imageLoaded;

// 隨機產生雞腿或指甲刀
function generateObject() {
    const isNailClipper = Math.random() < 0.5;
    const x = Math.random() * (gameWidth - objectWidth);
    
    objects.push({
        x: x,
        y: -objectHeight,
        img: isNailClipper ? nailClipperImg : chickenLegImg,
        isNailClipper: isNailClipper
    });
}

// 檢查碰撞
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// --- 鍵盤和觸控控制 ---
let rightPressed = false;
let leftPressed = false;

// 鍵盤控制
document.addEventListener('keydown', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if ((e.key === ' ' || e.key === 'ArrowUp') && !isJumping) {
        isJumping = true;
        jumpVelocity = jumpPower;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
});

// 新增：觸控控制
// 檢查按鈕是否存在，因為在開發工具中可能沒按鈕
const leftButton = document.getElementById('left-button');
const rightButton = document.getElementById('right-button');
const jumpButton = document.getElementById('jump-button');

if (leftButton) {
    leftButton.addEventListener('touchstart', (e) => { e.preventDefault(); leftPressed = true; }); // 阻止預設捲動行為
    leftButton.addEventListener('touchend', () => { leftPressed = false; });
    leftButton.addEventListener('mousedown', () => { leftPressed = true; });
    leftButton.addEventListener('mouseup', () => { leftPressed = false; });
}
if (rightButton) {
    rightButton.addEventListener('touchstart', (e) => { e.preventDefault(); rightPressed = true; }); // 阻止預設捲動行為
    rightButton.addEventListener('touchend', () => { rightPressed = false; });
    rightButton.addEventListener('mousedown', () => { rightPressed = true; });
    rightButton.addEventListener('mouseup', () => { rightPressed = false; });
}
if (jumpButton) {
    jumpButton.addEventListener('touchstart', (e) => {
        e.preventDefault(); // 阻止預設捲動行為
        if (!isJumping) {
            isJumping = true;
            jumpVelocity = jumpPower;
        }
    });
    jumpButton.addEventListener('mousedown', () => {
        if (!isJumping) {
            isJumping = true;
            jumpVelocity = jumpPower;
        }
    });
}


// 繪製柴犬
function drawShiba() {
    ctx.drawImage(shibaImg, shibaX, shibaY, shibaWidth, shibaHeight);
}

// 更新分數和生命值顯示
function updateHUD() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
}

// 遊戲主循環
function gameLoop() {
    if (gameOver) {
        ctx.font = '48px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('遊戲結束!', gameWidth / 2, gameHeight / 2);
        ctx.fillText('你的分數: ' + score, gameWidth / 2, gameHeight / 2 + 60);
        return;
    }

    ctx.clearRect(0, 0, gameWidth, gameHeight);
    drawShiba();
    updateHUD();

    frameCount++;
    if (frameCount % 120 === 0) {
        generateObject();
    }
    
    for (let i = 0; i < objects.length; i++) {
        let obj = objects[i];
        
        ctx.drawImage(obj.img, obj.x, obj.y, objectWidth, objectHeight);
        obj.y += objectSpeed;

        if (checkCollision({
            x: shibaX,
            y: shibaY,
            width: shibaWidth,
            height: shibaHeight
        }, {
            x: obj.x,
            y: obj.y,
            width: objectWidth,
            height: objectHeight
        })) {
            if (obj.isNailClipper) {
                lives--;
                if (lives <= 0) {
                    gameOver = true;
                }
            } else {
                score += 10;
            }
            
            objects.splice(i, 1);
            i--;
        }
        
        if (obj.y > gameHeight) {
            objects.splice(i, 1);
            i--;
        }
    }
    
    if (rightPressed && shibaX < gameWidth - shibaWidth) {
        shibaX += shibaSpeed;
    } else if (leftPressed && shibaX > 0) {
        shibaX -= shibaSpeed;
    }

    if (isJumping) {
        shibaY += jumpVelocity;
        jumpVelocity += gravity;
    }
    if (shibaY >= gameHeight - shibaHeight - 20) {
        shibaY = gameHeight - shibaHeight - 20;
        isJumping = false;
        jumpVelocity = 0;
    }

    requestAnimationFrame(gameLoop);
}