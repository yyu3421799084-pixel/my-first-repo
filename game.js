// ==================== 全局游戏状态 ====================
const gameState = {
    currentUser: null,
    currentLevel: 1,
    score: 0,
    lives: 3,
    coins: 0,
    time: 300,
    isPaused: false,
    musicMuted: false,
    gameRunning: false
};

// ==================== 关卡配置 ====================
const levels = [
    { number: 1, name: '草原世界', difficulty: 'easy', unlocked: true, stars: 0 },
    { number: 2, name: '地下迷宫', difficulty: 'easy', unlocked: false, stars: 0 },
    { number: 3, name: '云端城堡', difficulty: 'medium', unlocked: false, stars: 0 },
    { number: 4, name: '火焰山谷', difficulty: 'medium', unlocked: false, stars: 0 },
    { number: 5, name: '冰雪王国', difficulty: 'medium', unlocked: false, stars: 0 },
    { number: 6, name: '沙漠遗迹', difficulty: 'hard', unlocked: false, stars: 0 },
    { number: 7, name: '幽灵城堡', difficulty: 'hard', unlocked: false, stars: 0 },
    { number: 8, name: '最终决战', difficulty: 'hard', unlocked: false, stars: 0 }
];

// ==================== 用户数据管理 ====================
function saveUserData() {
    const users = JSON.parse(localStorage.getItem('marioUsers') || '{}');
    if (gameState.currentUser) {
        users[gameState.currentUser] = {
            password: users[gameState.currentUser].password,
            levels: levels,
            highScore: Math.max(users[gameState.currentUser].highScore || 0, gameState.score),
            totalCoins: (users[gameState.currentUser].totalCoins || 0) + gameState.coins
        };
        localStorage.setItem('marioUsers', JSON.stringify(users));
    }
}

function loadUserData() {
    const users = JSON.parse(localStorage.getItem('marioUsers') || '{}');
    if (gameState.currentUser && users[gameState.currentUser]) {
        const userData = users[gameState.currentUser];
        if (userData.levels) {
            levels.splice(0, levels.length, ...userData.levels);
        }
    }
}

// ==================== 登录注册功能 ====================
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = event.target;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🙈';
        icon.classList.add('hide');
    } else {
        input.type = 'password';
        icon.textContent = '👁️';
        icon.classList.remove('hide');
    }
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        alert('请填写完整信息！');
        return;
    }

    const users = JSON.parse(localStorage.getItem('marioUsers') || '{}');
    if (users[username] && users[username].password === password) {
        gameState.currentUser = username;
        loadUserData();
        document.getElementById('currentUser').textContent = username;
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('mainMenu').style.display = 'flex';
        playBackgroundMusic();
    } else {
        alert('用户名或密码错误！');
    }
}

function handleRegister() {
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (!username || !password || !confirmPassword) {
        alert('请填写完整信息！');
        return;
    }

    if (password !== confirmPassword) {
        alert('两次密码不一致！');
        return;
    }

    const users = JSON.parse(localStorage.getItem('marioUsers') || '{}');
    if (users[username]) {
        alert('用户名已存在！');
        return;
    }

    users[username] = {
        password: password,
        levels: JSON.parse(JSON.stringify(levels)),
        highScore: 0,
        totalCoins: 0,
        registeredAt: new Date().toISOString(),
        displayName: username
    };
    localStorage.setItem('marioUsers', JSON.stringify(users));
    alert('注册成功！请登录');
    showLogin();
}

function logout() {
    saveUserData();
    gameState.currentUser = null;
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

// ==================== 音乐控制 ====================
function playBackgroundMusic() {
    const music = document.getElementById('bgMusic');
    music.volume = 0.3;
    music.play().catch(e => console.log('音乐播放需要用户交互'));
}

function toggleMusic() {
    const music = document.getElementById('bgMusic');
    const control = document.getElementById('musicControl');
    
    if (gameState.musicMuted) {
        music.play();
        control.classList.remove('muted');
        gameState.musicMuted = false;
    } else {
        music.pause();
        control.classList.add('muted');
        gameState.musicMuted = true;
    }
}

// ==================== 页面导航 ====================
function showLevelSelect() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('levelSelect').style.display = 'block';
    renderLevels();
}

function showLeaderboard() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('leaderboard').style.display = 'block';
    renderLeaderboard();
}

function backToMenu() {
    document.getElementById('levelSelect').style.display = 'none';
    document.getElementById('leaderboard').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
}

// ==================== 渲染关卡 ====================
function renderLevels() {
    const grid = document.getElementById('levelGrid');
    grid.innerHTML = '';
    
    levels.forEach(level => {
        const card = document.createElement('div');
        card.className = 'level-card' + (level.unlocked ? '' : ' locked');
        card.innerHTML = `
            <div class="level-number">关卡 ${level.number}</div>
            <div>${level.name}</div>
            <div class="level-stars">${'⭐'.repeat(level.stars)}${'☆'.repeat(3 - level.stars)}</div>
            <div class="difficulty ${level.difficulty}">
                ${level.difficulty === 'easy' ? '简单' : level.difficulty === 'medium' ? '中等' : '困难'}
            </div>
        `;
        
        if (level.unlocked) {
            card.onclick = () => startLevel(level.number);
        }
        
        grid.appendChild(card);
    });
}

// ==================== 渲染排行榜 ====================
function renderLeaderboard() {
    const rankList = document.getElementById('rankList');
    const users = JSON.parse(localStorage.getItem('marioUsers') || '{}');
    
    const rankings = Object.entries(users)
        .filter(([username, data]) => data.registeredAt) // 只显示已注册用户
        .map(([username, data]) => ({
            username: data.displayName || username,
            score: data.highScore || 0
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    rankList.innerHTML = rankings.map((rank, index) => {
        let positionClass = '';
        if (index === 0) positionClass = 'gold';
        else if (index === 1) positionClass = 'silver';
        else if (index === 2) positionClass = 'bronze';
        
        return `
            <div class="rank-item">
                <div class="rank-position ${positionClass}">#${index + 1}</div>
                <div class="rank-info">
                    <div class="rank-name">${rank.username}</div>
                </div>
                <div class="rank-score">${rank.score}</div>
            </div>
        `;
    }).join('');
}

// ==================== 游戏变量 ====================
let canvas, ctx;
let player, platforms, enemies, coins, traps, spikes, fallingObjects, fruits, pipes, boxes, mushrooms, rotatingPlatforms;
let keys = {};
let gameLoop;
let timeInterval;
let cameraOffsetX = 0; // 摄像机X轴偏移
let levelWidth = 3000; // 关卡宽度
let isUnderground = false; // 是否在地下
let undergroundPlatforms = []; // 地下平台
let undergroundEnemies = []; // 地下敌人
let undergroundCoins = []; // 地下金币
let exitPipe = null; // 出口管道

// ==================== 开始关卡 ====================
function startLevel(levelNum) {
    gameState.currentLevel = levelNum;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.coins = 0;
    gameState.time = 300;
    gameState.isPaused = false;
    gameState.gameRunning = true;
    cameraOffsetX = 0; // 重置摄像机

    document.getElementById('levelSelect').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    
    // 停止之前的游戏循环
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
        gameLoop = null;
    }
    if (timeInterval) {
        clearInterval(timeInterval);
        timeInterval = null;
    }
    
    initGame();
    showHint('使用方向键移动，空格键跳跃！');
}

// ==================== 初始化游戏 ====================
function initGame() {
    canvas = document.getElementById('gameCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');

    // 初始化玩家
    player = {
        x: 100,
        y: canvas.height - 150,
        width: 40,
        height: 40,
        velocityX: 0,
        velocityY: 0,
        speed: 3,
        jumpPower: 12,
        gravity: 0.4,
        onGround: false,
        isBig: false,
        normalWidth: 40,
        normalHeight: 40,
        bigWidth: 50,
        bigHeight: 60,
        canDoubleJump: true,
        hasDoubleJumped: false
    };

    // 根据关卡设置不同的游戏元素
    const level = gameState.currentLevel;
    
    // 关卡1: 草原世界 - 简单入门
    if (level === 1) {
        levelWidth = 3000;
        isUnderground = false;
        
        platforms = [
            { x: 0, y: canvas.height - 50, width: levelWidth, height: 50 },
            { x: 300, y: canvas.height - 200, width: 200, height: 20 },
            { x: 600, y: canvas.height - 250, width: 200, height: 20, moving: true, moveSpeed: 1, moveRange: 80, initialY: canvas.height - 250, direction: 1, moveType: 'vertical' },
            { x: 900, y: canvas.height - 200, width: 200, height: 20, moving: true, moveSpeed: 2, moveRange: 150, initialX: 900, direction: 1, moveType: 'horizontal' },
            { x: 1200, y: canvas.height - 300, width: 200, height: 20, moving: true, moveSpeed: 1.5, moveRange: 100, initialY: canvas.height - 300, direction: 1, moveType: 'vertical' },
            { x: 1500, y: canvas.height - 250, width: 200, height: 20, moving: true, moveSpeed: 1.5, moveRange: 120, initialX: 1500, direction: 1, moveType: 'horizontal' },
            { x: 1800, y: canvas.height - 300, width: 200, height: 20, moving: true, moveSpeed: 1, moveRange: 60, initialY: canvas.height - 300, direction: -1, moveType: 'vertical' },
            { x: 2100, y: canvas.height - 200, width: 200, height: 20, moving: true, moveSpeed: 2, moveRange: 100, initialX: 2100, direction: 1, moveType: 'horizontal' },
            { x: 2400, y: canvas.height - 250, width: 200, height: 20 }
        ];
        
        enemies = [
            { x: 400, y: canvas.height - 90, width: 40, height: 40, velocityX: 1, direction: 1 },
            { x: 1000, y: canvas.height - 240, width: 40, height: 40, velocityX: 1, direction: 1 },
            { x: 1600, y: canvas.height - 90, width: 40, height: 40, velocityX: 1, direction: 1 },
            { x: 2200, y: canvas.height - 240, width: 40, height: 40, velocityX: 1, direction: 1 }
        ];
        
        coins = [
            { x: 350, y: canvas.height - 250, width: 30, height: 30, collected: false },
            { x: 650, y: canvas.height - 300, width: 30, height: 30, collected: false },
            { x: 950, y: canvas.height - 250, width: 30, height: 30, collected: false },
            { x: 1250, y: canvas.height - 350, width: 30, height: 30, collected: false },
            { x: 1550, y: canvas.height - 300, width: 30, height: 30, collected: false },
            { x: 1850, y: canvas.height - 350, width: 30, height: 30, collected: false },
            { x: 2150, y: canvas.height - 250, width: 30, height: 30, collected: false }
        ];
        
        traps = [];
        spikes = [];
        
        fallingObjects = [
            { x: 500, y: -50, width: 35, height: 35, velocityY: 0, gravity: 0.3, respawnTimer: 0, respawnInterval: 200, active: true },
            { x: 1300, y: -50, width: 35, height: 35, velocityY: 0, gravity: 0.3, respawnTimer: 0, respawnInterval: 180, active: true }
        ];
        
        fruits = [
            { x: 700, y: canvas.height - 300, width: 30, height: 30, collected: false },
            { x: 1400, y: canvas.height - 350, width: 30, height: 30, collected: false },
            { x: 2000, y: canvas.height - 300, width: 30, height: 30, collected: false }
        ];
        
        // 箱子
        boxes = [
            { x: 500, y: canvas.height - 270, width: 40, height: 40, hit: false, content: 'mushroom' },
            { x: 800, y: canvas.height - 320, width: 40, height: 40, hit: false, content: 'coin' },
            { x: 1300, y: canvas.height - 370, width: 40, height: 40, hit: false, content: 'empty' },
            { x: 1700, y: canvas.height - 320, width: 40, height: 40, hit: false, content: 'enemy' },
            { x: 2200, y: canvas.height - 270, width: 40, height: 40, hit: false, content: 'coin' }
        ];
        
        // 蘑菇
        mushrooms = [
            { x: 400, y: canvas.height - 90, width: 30, height: 30, collected: false, moving: false },
            { x: 1000, y: canvas.height - 240, width: 30, height: 30, collected: false, moving: true, velocityX: 1.5, direction: 1, moveRange: 100, initialX: 1000 },
            { x: 1900, y: canvas.height - 90, width: 30, height: 30, collected: false, moving: false }
        ];
        
        // 旋转平台
        rotatingPlatforms = [
            { x: 1200, y: canvas.height - 300, width: 120, height: 20, angle: 0, rotationSpeed: 0.02, centerX: 1260, centerY: canvas.height - 290 },
            { x: 2400, y: canvas.height - 250, width: 120, height: 20, angle: 0, rotationSpeed: 0.015, centerX: 2460, centerY: canvas.height - 240 }
        ];
        
        // 管道入口
        pipes = [
            { x: 800, y: canvas.height - 130, width: 60, height: 80, type: 'entrance', fake: false },
            { x: 1100, y: canvas.height - 130, width: 60, height: 80, type: 'entrance', fake: true }
        ];
        
        // 地下场景配置
        undergroundPlatforms = [
            { x: 0, y: canvas.height - 50, width: 2000, height: 50 },
            { x: 200, y: canvas.height - 150, width: 150, height: 20, moving: true, moveSpeed: 1.5, moveRange: 60, initialY: canvas.height - 150, direction: 1, moveType: 'vertical' },
            { x: 450, y: canvas.height - 220, width: 150, height: 20, moving: true, moveSpeed: 2, moveRange: 100, initialX: 450, direction: 1, moveType: 'horizontal' },
            { x: 700, y: canvas.height - 150, width: 150, height: 20, moving: true, moveSpeed: 1.8, moveRange: 80, initialY: canvas.height - 150, direction: -1, moveType: 'vertical' },
            { x: 950, y: canvas.height - 250, width: 150, height: 20, moving: true, moveSpeed: 1.5, moveRange: 90, initialX: 950, direction: 1, moveType: 'horizontal' },
            { x: 1200, y: canvas.height - 180, width: 150, height: 20, moving: true, moveSpeed: 1.5, moveRange: 70, initialY: canvas.height - 180, direction: 1, moveType: 'vertical' },
            { x: 1500, y: canvas.height - 150, width: 150, height: 20, moving: true, moveSpeed: 2, moveRange: 110, initialX: 1500, direction: 1, moveType: 'horizontal' }
        ];
        
        undergroundEnemies = [
            { x: 300, y: canvas.height - 90, width: 40, height: 40, velocityX: 2, direction: 1 },
            { x: 600, y: canvas.height - 260, width: 40, height: 40, velocityX: 2, direction: 1 },
            { x: 1100, y: canvas.height - 290, width: 40, height: 40, velocityX: 2, direction: 1 }
        ];
        
        undergroundCoins = [
            { x: 250, y: canvas.height - 200, width: 30, height: 30, collected: false },
            { x: 500, y: canvas.height - 270, width: 30, height: 30, collected: false },
            { x: 750, y: canvas.height - 200, width: 30, height: 30, collected: false },
            { x: 1000, y: canvas.height - 300, width: 30, height: 30, collected: false },
            { x: 1250, y: canvas.height - 230, width: 30, height: 30, collected: false },
            { x: 1550, y: canvas.height - 200, width: 30, height: 30, collected: false }
        ];
        
        // 出口管道
        exitPipe = { x: 1700, y: canvas.height - 130, width: 60, height: 80, type: 'exit' };
    }
    
    // 关卡2: 地下迷宫 - 引入陷阱
    else if (level === 2) {
        levelWidth = 3500;
        isUnderground = false;
        
        platforms = [
            { x: 0, y: canvas.height - 50, width: levelWidth, height: 50 },
            { x: 250, y: canvas.height - 180, width: 150, height: 20, moving: true, moveSpeed: 1.2, moveRange: 70, initialY: canvas.height - 180, direction: 1, moveType: 'vertical' },
            { x: 500, y: canvas.height - 280, width: 150, height: 20, moving: true, moveSpeed: 2, moveRange: 130, initialX: 500, direction: 1, moveType: 'horizontal' },
            { x: 750, y: canvas.height - 200, width: 150, height: 20, moving: true, moveSpeed: 1.5, moveRange: 90, initialY: canvas.height - 200, direction: -1, moveType: 'vertical' },
            { x: 1000, y: canvas.height - 350, width: 150, height: 20, moving: true, moveSpeed: 1.8, moveRange: 100, initialX: 1000, direction: 1, moveType: 'horizontal' },
            { x: 1300, y: canvas.height - 250, width: 200, height: 20, moving: true, moveSpeed: 1.8, moveRange: 100, initialY: canvas.height - 250, direction: 1, moveType: 'vertical' },
            { x: 1600, y: canvas.height - 350, width: 150, height: 20, moving: true, moveSpeed: 2.2, moveRange: 140, initialX: 1600, direction: 1, moveType: 'horizontal' },
            { x: 1900, y: canvas.height - 250, width: 150, height: 20, moving: true, moveSpeed: 1.3, moveRange: 80, initialY: canvas.height - 250, direction: -1, moveType: 'vertical' },
            { x: 2200, y: canvas.height - 300, width: 150, height: 20, moving: true, moveSpeed: 1.5, moveRange: 120, initialX: 2200, direction: 1, moveType: 'horizontal' },
            { x: 2500, y: canvas.height - 200, width: 150, height: 20 },
            { x: 2800, y: canvas.height - 300, width: 200, height: 20 }
        ];
        
        enemies = [
            { x: 300, y: canvas.height - 90, width: 40, height: 40, velocityX: 1.2, direction: 1 },
            { x: 550, y: canvas.height - 320, width: 40, height: 40, velocityX: 1.2, direction: 1 },
            { x: 1050, y: canvas.height - 390, width: 40, height: 40, velocityX: 1.2, direction: 1 },
            { x: 1650, y: canvas.height - 390, width: 40, height: 40, velocityX: 1.2, direction: 1 },
            { x: 2250, y: canvas.height - 340, width: 40, height: 40, velocityX: 1.2, direction: 1 }
        ];
        
        coins = [
            { x: 300, y: canvas.height - 230, width: 30, height: 30, collected: false },
            { x: 550, y: canvas.height - 330, width: 30, height: 30, collected: false },
            { x: 800, y: canvas.height - 250, width: 30, height: 30, collected: false },
            { x: 1050, y: canvas.height - 400, width: 30, height: 30, collected: false },
            { x: 1350, y: canvas.height - 300, width: 30, height: 30, collected: false },
            { x: 1650, y: canvas.height - 400, width: 30, height: 30, collected: false },
            { x: 1950, y: canvas.height - 300, width: 30, height: 30, collected: false },
            { x: 2250, y: canvas.height - 350, width: 30, height: 30, collected: false }
        ];
        
        traps = [
            { x: 650, y: canvas.height - 230, width: 120, height: 20, falling: false, fallSpeed: 0 },
            { x: 1450, y: canvas.height - 300, width: 120, height: 20, falling: false, fallSpeed: 0 }
        ];
        
        spikes = [
            { x: 450, y: canvas.height - 50, width: 60, height: 30, active: false, timer: 0, interval: 120 },
            { x: 1100, y: canvas.height - 50, width: 60, height: 30, active: false, timer: 0, interval: 110 }
        ];
        
        fallingObjects = [
            { x: 600, y: -50, width: 35, height: 35, velocityY: 0, gravity: 0.35, respawnTimer: 0, respawnInterval: 180, active: true },
            { x: 1200, y: -50, width: 35, height: 35, velocityY: 0, gravity: 0.35, respawnTimer: 0, respawnInterval: 160, active: true },
            { x: 2000, y: -50, width: 35, height: 35, velocityY: 0, gravity: 0.35, respawnTimer: 0, respawnInterval: 170, active: true }
        ];
        
        fruits = [
            { x: 400, y: canvas.height - 230, width: 30, height: 30, collected: false },
            { x: 1100, y: canvas.height - 400, width: 30, height: 30, collected: false },
            { x: 1700, y: canvas.height - 400, width: 30, height: 30, collected: false },
            { x: 2600, y: canvas.height - 350, width: 30, height: 30, collected: false }
        ];
        
        // 箱子
        boxes = [
            { x: 600, y: canvas.height - 250, width: 40, height: 40, hit: false, content: 'coin' },
            { x: 950, y: canvas.height - 370, width: 40, height: 40, hit: false, content: 'mushroom' },
            { x: 1350, y: canvas.height - 280, width: 40, height: 40, hit: false, content: 'enemy' },
            { x: 1700, y: canvas.height - 370, width: 40, height: 40, hit: false, content: 'empty' },
            { x: 2100, y: canvas.height - 330, width: 40, height: 40, hit: false, content: 'coin' },
            { x: 2500, y: canvas.height - 230, width: 40, height: 40, hit: false, content: 'mushroom' }
        ];
        
        // 蘑菇
        mushrooms = [
            { x: 350, y: canvas.height - 90, width: 30, height: 30, collected: false, moving: false },
            { x: 800, y: canvas.height - 240, width: 30, height: 30, collected: false, moving: true, velocityX: 2, direction: 1, moveRange: 120, initialX: 800 },
            { x: 1200, y: canvas.height - 390, width: 30, height: 30, collected: false, moving: false },
            { x: 1800, y: canvas.height - 290, width: 30, height: 30, collected: false, moving: true, velocityX: 1.8, direction: 1, moveRange: 150, initialX: 1800 },
            { x: 2300, y: canvas.height - 340, width: 30, height: 30, collected: false, moving: true, velocityX: 1.5, direction: -1, moveRange: 100, initialX: 2300 }
        ];
        
        // 旋转平台
        rotatingPlatforms = [
            { x: 700, y: canvas.height - 280, width: 120, height: 20, angle: 0, rotationSpeed: 0.025, centerX: 760, centerY: canvas.height - 270 },
            { x: 1400, y: canvas.height - 350, width: 120, height: 20, angle: 0, rotationSpeed: 0.02, centerX: 1460, centerY: canvas.height - 340 },
            { x: 2100, y: canvas.height - 280, width: 120, height: 20, angle: 0, rotationSpeed: 0.018, centerX: 2160, centerY: canvas.height - 270 }
        ];
        
        // 管道入口
        pipes = [
            { x: 900, y: canvas.height - 130, width: 60, height: 80, type: 'entrance', fake: true },
            { x: 1150, y: canvas.height - 130, width: 60, height: 80, type: 'entrance', fake: false },
            { x: 1800, y: canvas.height - 130, width: 60, height: 80, type: 'entrance', fake: true }
        ];
        
        // 地下场景
        undergroundPlatforms = [
            { x: 0, y: canvas.height - 50, width: 2500, height: 50 },
            { x: 200, y: canvas.height - 180, width: 120, height: 20, moving: true, moveSpeed: 1.8, moveRange: 70, initialY: canvas.height - 180, direction: 1, moveType: 'vertical' },
            { x: 400, y: canvas.height - 280, width: 120, height: 20, moving: true, moveSpeed: 2, moveRange: 100, initialX: 400, direction: 1, moveType: 'horizontal' },
            { x: 600, y: canvas.height - 200, width: 120, height: 20, moving: true, moveSpeed: 2, moveRange: 90, initialY: canvas.height - 200, direction: -1, moveType: 'vertical' },
            { x: 800, y: canvas.height - 320, width: 120, height: 20, moving: true, moveSpeed: 2.2, moveRange: 110, initialX: 800, direction: 1, moveType: 'horizontal' },
            { x: 1000, y: canvas.height - 220, width: 120, height: 20, moving: true, moveSpeed: 1.5, moveRange: 80, initialY: canvas.height - 220, direction: 1, moveType: 'vertical' },
            { x: 1200, y: canvas.height - 300, width: 120, height: 20, moving: true, moveSpeed: 1.8, moveRange: 90, initialX: 1200, direction: 1, moveType: 'horizontal' },
            { x: 1400, y: canvas.height - 200, width: 120, height: 20, moving: true, moveSpeed: 2.2, moveRange: 100, initialY: canvas.height - 200, direction: -1, moveType: 'vertical' },
            { x: 1600, y: canvas.height - 280, width: 120, height: 20, moving: true, moveSpeed: 2, moveRange: 120, initialX: 1600, direction: 1, moveType: 'horizontal' },
            { x: 1800, y: canvas.height - 180, width: 120, height: 20, moving: true, moveSpeed: 1.8, moveRange: 70, initialY: canvas.height - 180, direction: 1, moveType: 'vertical' },
            { x: 2000, y: canvas.height - 250, width: 120, height: 20, moving: true, moveSpeed: 2.5, moveRange: 130, initialX: 2000, direction: 1, moveType: 'horizontal' }
        ];
        
        undergroundEnemies = [
            { x: 300, y: canvas.height - 90, width: 40, height: 40, velocityX: 2.5, direction: 1 },
            { x: 500, y: canvas.height - 220, width: 40, height: 40, velocityX: 2.5, direction: 1 },
            { x: 850, y: canvas.height - 360, width: 40, height: 40, velocityX: 2.5, direction: 1 },
            { x: 1300, y: canvas.height - 340, width: 40, height: 40, velocityX: 2.5, direction: 1 }
        ];
        
        undergroundCoins = [
            { x: 250, y: canvas.height - 230, width: 30, height: 30, collected: false },
            { x: 450, y: canvas.height - 330, width: 30, height: 30, collected: false },
            { x: 650, y: canvas.height - 250, width: 30, height: 30, collected: false },
            { x: 850, y: canvas.height - 370, width: 30, height: 30, collected: false },
            { x: 1050, y: canvas.height - 270, width: 30, height: 30, collected: false },
            { x: 1250, y: canvas.height - 350, width: 30, height: 30, collected: false },
            { x: 1450, y: canvas.height - 250, width: 30, height: 30, collected: false },
            { x: 1650, y: canvas.height - 330, width: 30, height: 30, collected: false }
        ];
        
        exitPipe = { x: 2200, y: canvas.height - 130, width: 60, height: 80, type: 'exit' };
    }
    
    // 关卡3: 云端城堡 - 高平台跳跃
    else if (level === 3) {
        levelWidth = 4000;
        
        platforms = [
            { x: 0, y: canvas.height - 50, width: 300, height: 50 },
            { x: 400, y: canvas.height - 200, width: 150, height: 20, moving: true, moveSpeed: 2, moveRange: 100, initialY: canvas.height - 200, direction: 1, moveType: 'vertical' },
            { x: 650, y: canvas.height - 350, width: 150, height: 20, moving: true, moveSpeed: 2.5, moveRange: 150, initialX: 650, direction: 1, moveType: 'horizontal' },
            { x: 900, y: canvas.height - 450, width: 150, height: 20, moving: true, moveSpeed: 1.5, moveRange: 80, initialY: canvas.height - 450, direction: -1, moveType: 'vertical' },
            { x: 1150, y: canvas.height - 350, width: 150, height: 20, moving: true, moveSpeed: 2, moveRange: 130, initialX: 1150, direction: 1, moveType: 'horizontal' },
            { x: 1400, y: canvas.height - 200, width: 150, height: 20, moving: true, moveSpeed: 2.2, moveRange: 120, initialY: canvas.height - 200, direction: 1, moveType: 'vertical' },
            { x: 1700, y: canvas.height - 350, width: 150, height: 20, moving: true, moveSpeed: 2.5, moveRange: 140, initialX: 1700, direction: 1, moveType: 'horizontal' },
            { x: 1950, y: canvas.height - 450, width: 150, height: 20, moving: true, moveSpeed: 1.8, moveRange: 90, initialY: canvas.height - 450, direction: -1, moveType: 'vertical' },
            { x: 2200, y: canvas.height - 350, width: 150, height: 20, moving: true, moveSpeed: 2.2, moveRange: 120, initialX: 2200, direction: 1, moveType: 'horizontal' },
            { x: 2500, y: canvas.height - 250, width: 150, height: 20, moving: true, moveSpeed: 2, moveRange: 100, initialY: canvas.height - 250, direction: 1, moveType: 'vertical' },
            { x: 2800, y: canvas.height - 350, width: 150, height: 20, moving: true, moveSpeed: 1.8, moveRange: 110, initialX: 2800, direction: 1, moveType: 'horizontal' },
            { x: 3100, y: canvas.height - 200, width: 150, height: 20, moving: true, moveSpeed: 2, moveRange: 100, initialY: canvas.height - 200, direction: 1, moveType: 'vertical' },
            { x: 3350, y: canvas.height - 150, width: 150, height: 20 },
            { x: 3600, y: canvas.height - 100, width: 150, height: 20 },
            { x: 3850, y: canvas.height - 50, width: 150, height: 50 }
        ];
        
        enemies = [
            { x: 450, y: canvas.height - 240, width: 40, height: 40, velocityX: 1.5, direction: 1 },
            { x: 700, y: canvas.height - 390, width: 40, height: 40, velocityX: 1.5, direction: 1 },
            { x: 1200, y: canvas.height - 390, width: 40, height: 40, velocityX: 1.5, direction: 1 },
            { x: 1750, y: canvas.height - 390, width: 40, height: 40, velocityX: 1.5, direction: 1 },
            { x: 2250, y: canvas.height - 390, width: 40, height: 40, velocityX: 1.5, direction: 1 },
            { x: 2850, y: canvas.height - 390, width: 40, height: 40, velocityX: 1.5, direction: 1 },
            { x: 3150, y: canvas.height - 240, width: 40, height: 40, velocityX: 1.5, direction: 1 },
            { x: 3450, y: canvas.height - 190, width: 40, height: 40, velocityX: 1.5, direction: 1 }
        ];
        
        coins = [
            { x: 450, y: canvas.height - 250, width: 30, height: 30, collected: false },
            { x: 700, y: canvas.height - 400, width: 30, height: 30, collected: false },
            { x: 950, y: canvas.height - 500, width: 30, height: 30, collected: false },
            { x: 1200, y: canvas.height - 400, width: 30, height: 30, collected: false },
            { x: 1450, y: canvas.height - 250, width: 30, height: 30, collected: false },
            { x: 1750, y: canvas.height - 400, width: 30, height: 30, collected: false },
            { x: 2000, y: canvas.height - 500, width: 30, height: 30, collected: false },
            { x: 2250, y: canvas.height - 400, width: 30, height: 30, collected: false },
            { x: 2550, y: canvas.height - 300, width: 30, height: 30, collected: false },
            { x: 2850, y: canvas.height - 400, width: 30, height: 30, collected: false },
            { x: 3150, y: canvas.height - 250, width: 30, height: 30, collected: false },
            { x: 3400, y: canvas.height - 200, width: 30, height: 30, collected: false },
            { x: 3650, y: canvas.height - 150, width: 30, height: 30, collected: false }
        ];
        
        traps = [
            { x: 550, y: canvas.height - 300, width: 100, height: 20, falling: false, fallSpeed: 0 },
            { x: 1050, y: canvas.height - 400, width: 100, height: 20, falling: false, fallSpeed: 0 },
            { x: 1850, y: canvas.height - 500, width: 100, height: 20, falling: false, fallSpeed: 0 },
            { x: 2650, y: canvas.height - 400, width: 100, height: 20, falling: false, fallSpeed: 0 },
            { x: 3250, y: canvas.height - 250, width: 100, height: 20, falling: false, fallSpeed: 0 }
        ];
        
        spikes = [
            { x: 350, y: canvas.height - 50, width: 50, height: 30, active: false, timer: 0, interval: 100 },
            { x: 850, y: canvas.height - 50, width: 50, height: 30, active: false, timer: 0, interval: 90 },
            { x: 1650, y: canvas.height - 50, width: 50, height: 30, active: false, timer: 0, interval: 95 }
        ];
        
        fallingObjects = [
            { x: 800, y: -50, width: 35, height: 35, velocityY: 0, gravity: 0.4, respawnTimer: 0, respawnInterval: 150, active: true },
            { x: 1500, y: -50, width: 35, height: 35, velocityY: 0, gravity: 0.4, respawnTimer: 0, respawnInterval: 140, active: true },
            { x: 2300, y: -50, width: 35, height: 35, velocityY: 0, gravity: 0.4, respawnTimer: 0, respawnInterval: 145, active: true },
            { x: 3000, y: -50, width: 35, height: 35, velocityY: 0, gravity: 0.4, respawnTimer: 0, respawnInterval: 155, active: true }
        ];
        
        fruits = [
            { x: 550, y: canvas.height - 350, width: 30, height: 30, collected: false },
            { x: 1300, y: canvas.height - 400, width: 30, height: 30, collected: false },
            { x: 2100, y: canvas.height - 500, width: 30, height: 30, collected: false },
            { x: 2900, y: canvas.height - 400, width: 30, height: 30, collected: false }
        ];
        
        // 箱子
        boxes = [
            { x: 450, y: canvas.height - 230, width: 40, height: 40, hit: false, content: 'mushroom' },
            { x: 750, y: canvas.height - 380, width: 40, height: 40, hit: false, content: 'coin' },
            { x: 1050, y: canvas.height - 480, width: 40, height: 40, hit: false, content: 'enemy' },
            { x: 1450, y: canvas.height - 230, width: 40, height: 40, hit: false, content: 'empty' },
            { x: 1800, y: canvas.height - 380, width: 40, height: 40, hit: false, content: 'coin' },
            { x: 2300, y: canvas.height - 380, width: 40, height: 40, hit: false, content: 'mushroom' },
            { x: 2700, y: canvas.height - 380, width: 40, height: 40, hit: false, content: 'coin' }
        ];
        
        // 蘑菇
        mushrooms = [
            { x: 350, y: canvas.height - 240, width: 30, height: 30, collected: false, moving: false },
            { x: 600, y: canvas.height - 390, width: 30, height: 30, collected: false, moving: true, velocityX: 2.2, direction: 1, moveRange: 130, initialX: 600 },
            { x: 950, y: canvas.height - 490, width: 30, height: 30, collected: false, moving: false },
            { x: 1250, y: canvas.height - 390, width: 30, height: 30, collected: false, moving: true, velocityX: 2, direction: 1, moveRange: 140, initialX: 1250 },
            { x: 1650, y: canvas.height - 240, width: 30, height: 30, collected: false, moving: false },
            { x: 2050, y: canvas.height - 490, width: 30, height: 30, collected: false, moving: true, velocityX: 1.8, direction: -1, moveRange: 120, initialX: 2050 },
            { x: 2600, y: canvas.height - 390, width: 30, height: 30, collected: false, moving: true, velocityX: 2.5, direction: 1, moveRange: 150, initialX: 2600 }
        ];
        
        // 管道入口
        pipes = [
            { x: 1200, y: canvas.height - 130, width: 60, height: 80, type: 'entrance', fake: false },
            { x: 1600, y: canvas.height - 130, width: 60, height: 80, type: 'entrance', fake: true },
            { x: 2400, y: canvas.height - 130, width: 60, height: 80, type: 'entrance', fake: true }
        ];
        
        // 地下场景
        undergroundPlatforms = [
            { x: 0, y: canvas.height - 50, width: 3000, height: 50 },
            { x: 200, y: canvas.height - 180, width: 120, height: 20, moving: true, moveSpeed: 2, moveRange: 80, initialY: canvas.height - 180, direction: 1, moveType: 'vertical' },
            { x: 400, y: canvas.height - 300, width: 120, height: 20, moving: true, moveSpeed: 2.5, moveRange: 120, initialX: 400, direction: 1, moveType: 'horizontal' },
            { x: 600, y: canvas.height - 220, width: 120, height: 20, moving: true, moveSpeed: 2.2, moveRange: 100, initialY: canvas.height - 220, direction: -1, moveType: 'vertical' },
            { x: 800, y: canvas.height - 350, width: 120, height: 20, moving: true, moveSpeed: 2, moveRange: 130, initialX: 800, direction: 1, moveType: 'horizontal' },
            { x: 1000, y: canvas.height - 250, width: 120, height: 20, moving: true, moveSpeed: 1.8, moveRange: 90, initialY: canvas.height - 250, direction: 1, moveType: 'vertical' },
            { x: 1200, y: canvas.height - 320, width: 120, height: 20, moving: true, moveSpeed: 2.3, moveRange: 140, initialX: 1200, direction: 1, moveType: 'horizontal' },
            { x: 1400, y: canvas.height - 200, width: 120, height: 20, moving: true, moveSpeed: 2, moveRange: 100, initialY: canvas.height - 200, direction: -1, moveType: 'vertical' },
            { x: 1600, y: canvas.height - 300, width: 120, height: 20, moving: true, moveSpeed: 2.5, moveRange: 150, initialX: 1600, direction: 1, moveType: 'horizontal' },
            { x: 1800, y: canvas.height - 180, width: 120, height: 20, moving: true, moveSpeed: 2, moveRange: 80, initialY: canvas.height - 180, direction: 1, moveType: 'vertical' },
            { x: 2000, y: canvas.height - 280, width: 120, height: 20, moving: true, moveSpeed: 2.2, moveRange: 120, initialX: 2000, direction: 1, moveType: 'horizontal' },
            { x: 2200, y: canvas.height - 200, width: 120, height: 20, moving: true, moveSpeed: 1.8, moveRange: 90, initialY: canvas.height - 200, direction: -1, moveType: 'vertical' },
            { x: 2400, y: canvas.height - 320, width: 120, height: 20, moving: true, moveSpeed: 2.5, moveRange: 130, initialX: 2400, direction: 1, moveType: 'horizontal' }
        ];
        
        undergroundEnemies = [
            { x: 300, y: canvas.height - 90, width: 40, height: 40, velocityX: 3, direction: 1 },
            { x: 500, y: canvas.height - 220, width: 40, height: 40, velocityX: 3, direction: 1 },
            { x: 750, y: canvas.height - 260, width: 40, height: 40, velocityX: 3, direction: 1 },
            { x: 1000, y: canvas.height - 390, width: 40, height: 40, velocityX: 3, direction: 1 },
            { x: 1300, y: canvas.height - 360, width: 40, height: 40, velocityX: 3, direction: 1 },
            { x: 1700, y: canvas.height - 340, width: 40, height: 40, velocityX: 3, direction: 1 },
            { x: 2100, y: canvas.height - 240, width: 40, height: 40, velocityX: 3, direction: 1 }
        ];
        
        undergroundCoins = [
            { x: 250, y: canvas.height - 230, width: 30, height: 30, collected: false },
            { x: 450, y: canvas.height - 350, width: 30, height: 30, collected: false },
            { x: 650, y: canvas.height - 270, width: 30, height: 30, collected: false },
            { x: 850, y: canvas.height - 400, width: 30, height: 30, collected: false },
            { x: 1050, y: canvas.height - 300, width: 30, height: 30, collected: false },
            { x: 1250, y: canvas.height - 370, width: 30, height: 30, collected: false },
            { x: 1450, y: canvas.height - 250, width: 30, height: 30, collected: false },
            { x: 1650, y: canvas.height - 350, width: 30, height: 30, collected: false },
            { x: 1850, y: canvas.height - 230, width: 30, height: 30, collected: false },
            { x: 2050, y: canvas.height - 330, width: 30, height: 30, collected: false },
            { x: 2250, y: canvas.height - 250, width: 30, height: 30, collected: false }
        ];
        
        exitPipe = { x: 2600, y: canvas.height - 130, width: 60, height: 80, type: 'exit' };
        
        // 旋转平台
        rotatingPlatforms = [
            { x: 500, y: canvas.height - 300, width: 120, height: 20, angle: 0, rotationSpeed: 0.03, centerX: 560, centerY: canvas.height - 290 },
            { x: 1100, y: canvas.height - 400, width: 120, height: 20, angle: 0, rotationSpeed: 0.025, centerX: 1160, centerY: canvas.height - 390 },
            { x: 1900, y: canvas.height - 400, width: 120, height: 20, angle: 0, rotationSpeed: 0.022, centerX: 1960, centerY: canvas.height - 390 },
            { x: 2600, y: canvas.height - 300, width: 120, height: 20, angle: 0, rotationSpeed: 0.02, centerX: 2660, centerY: canvas.height - 290 }
        ];
    }
    
    // 关卡3-8保持原有难度，添加坠落物和果实
    else {
        isUnderground = false;
        
        // 为其他关卡设置默认值
        levelWidth = 3000 + (level * 500);
        fallingObjects = [];
        fruits = [];
        pipes = [];
        undergroundPlatforms = [];
        undergroundEnemies = [];
        undergroundCoins = [];
        exitPipe = null;
        boxes = [];
        mushrooms = [];
        
        // 根据关卡添加对应数量的坠落物和果实
        for (let i = 0; i < level; i++) {
            fallingObjects.push({
                x: 600 + i * 400,
                y: -50,
                width: 35,
                height: 35,
                velocityY: 0,
                gravity: 0.3 + level * 0.05,
                respawnTimer: 0,
                respawnInterval: 200 - level * 10,
                active: true
            });
        }
        
        for (let i = 0; i < Math.floor(level / 2) + 2; i++) {
            fruits.push({
                x: 500 + i * 500,
                y: canvas.height - 250 - i * 30,
                width: 30,
                height: 30,
                collected: false
            });
        }
        
        // 添加箱子
        const boxContents = ['mushroom', 'coin', 'empty', 'enemy'];
        for (let i = 0; i < level + 2; i++) {
            boxes.push({
                x: 400 + i * 350,
                y: canvas.height - 200 - (i % 3) * 50,
                width: 40,
                height: 40,
                hit: false,
                content: boxContents[i % 4]
            });
        }
        
        // 添加蘑菇
        for (let i = 0; i < level + 1; i++) {
            mushrooms.push({
                x: 450 + i * 400,
                y: canvas.height - 150 - (i % 4) * 60,
                width: 30,
                height: 30,
                collected: false,
                moving: i % 2 === 1, // 奇数编号的蘑菇会移动
                velocityX: 1.5 + Math.random(),
                direction: i % 3 === 0 ? -1 : 1,
                moveRange: 100 + i * 10,
                initialX: 450 + i * 400
            });
        }
        
        // 添加旋转平台
        rotatingPlatforms = [];
        for (let i = 0; i < Math.floor(level / 2) + 1; i++) {
            const x = 600 + i * 500;
            const y = canvas.height - 250 - (i % 3) * 80;
            rotatingPlatforms.push({
                x: x,
                y: y,
                width: 120,
                height: 20,
                angle: 0,
                rotationSpeed: 0.015 + i * 0.005,
                centerX: x + 60,
                centerY: y + 10
            });
        }
    }
    
    // 更新UI
    updateUI();

    // 启动游戏循环
    if (gameLoop) cancelAnimationFrame(gameLoop);
    
    // 确保画布已经准备就绪
    ctx = canvas.getContext('2d');
    
    // 立即启动游戏循环
    function startGameLoop() {
        gameLoop = requestAnimationFrame(update);
    }
    startGameLoop();

    // 启动计时器
    if (timeInterval) clearInterval(timeInterval);
    timeInterval = setInterval(() => {
        if (!gameState.isPaused && gameState.gameRunning) {
            gameState.time--;
            if (gameState.time <= 0) {
                gameState.lives--;
                if (gameState.lives > 0) {
                    gameState.time = 300;
                    resetPlayerPosition();
                    showHint('时间到！重新开始');
                } else {
                    endGame(false);
                }
            }
            updateUI();
        }
    }, 1000);
}

// ==================== 游戏主循环 ====================
function update() {
    if (!gameState.isPaused && gameState.gameRunning) {
        // 更新摄像机位置（跟随玩家）
        updateCamera();
        
        // 清空画布，根据场景设置不同背景色
        if (isUnderground) {
            ctx.fillStyle = '#2c3e50'; // 地下深色背景
        } else {
            ctx.fillStyle = '#5c94fc'; // 地面蓝天背景
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 保存当前状态并应用摄像机偏移
        ctx.save();
        ctx.translate(-cameraOffsetX, 0);

        // 绘制云朵背景（仅地面）
        if (!isUnderground) {
            drawClouds();
        }

        // 更新玩家
        updatePlayer();

        // 更新移动平台
        updateMovingPlatforms();
        
        // 更新移动蘑菇
        updateMovingMushrooms();
        
        // 更新旋转平台
        updateRotatingPlatforms();

        // 根据场景更新不同的敌人
        if (isUnderground) {
            updateUndergroundEnemies();
        } else {
            updateEnemies();
        }

        // 更新陷阱（仅地面）
        if (!isUnderground) {
            updateTraps();
            updateSpikes();
            updateFallingObjects();
        }
        
        // 更新果实（检测收集）
        updateFruits();

        // 绘制所有元素
        if (isUnderground) {
            drawUndergroundPlatforms();
            drawUndergroundCoins();
            drawUndergroundEnemies();
            drawExitPipe();
        } else {
            drawPlatforms();
            drawRotatingPlatforms();
            drawTraps();
            drawSpikes();
            drawCoins();
            drawFruits();
            drawMushrooms();
            drawFallingObjects();
            drawEnemies();
            drawPipes();
            drawBoxes();
        }
        
        drawPlayer();
        
        // 恢复画布状态
        ctx.restore();
    }

    // 继续游戏循环
    if (gameState.gameRunning) {
        gameLoop = requestAnimationFrame(update);
    }
}

// ==================== 绘制云朵 ====================
function updateCamera() {
    // 当玩家接近屏幕右侧时，摄像机跟随
    const playerScreenX = player.x - cameraOffsetX;
    
    if (playerScreenX > canvas.width * 0.6) {
        cameraOffsetX = player.x - canvas.width * 0.6;
    }
    
    // 当玩家接近屏幕左侧时，摄像机回退
    if (playerScreenX < canvas.width * 0.3 && cameraOffsetX > 0) {
        cameraOffsetX = player.x - canvas.width * 0.3;
    }
    
    // 限制摄像机范围
    if (cameraOffsetX < 0) cameraOffsetX = 0;
    if (cameraOffsetX > levelWidth - canvas.width) {
        cameraOffsetX = levelWidth - canvas.width;
    }
}

function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 10; i++) {
        const x = (i * 400 + Date.now() / 50) % (levelWidth + 200) - 100;
        const y = 100 + (i % 3) * 80;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.arc(x + 30, y, 40, 0, Math.PI * 2);
        ctx.arc(x + 60, y, 30, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ==================== 更新玩家 ====================
function updatePlayer() {
    // 处理输入
    if (keys['ArrowLeft']) {
        player.velocityX = -player.speed;
    } else if (keys['ArrowRight']) {
        player.velocityX = player.speed;
    } else {
        player.velocityX *= 0.8;
    }

    if (keys[' '] && (player.onGround || player.canDoubleJump)) {
        if (player.onGround) {
            // 第一段跳
            player.velocityY = -player.jumpPower;
            player.onGround = false;
            player.canDoubleJump = true;
            player.hasDoubleJumped = false;
        } else if (player.canDoubleJump && !player.hasDoubleJumped && !player.onGround) {
            // 二段跳
            player.velocityY = -player.jumpPower * 0.9;
            player.canDoubleJump = false;
            player.hasDoubleJumped = true;
        }
        keys[' '] = false; // 防止长按连续跳
    }
    
    // 重置二段跳
    if (player.onGround) {
        player.canDoubleJump = true;
        player.hasDoubleJumped = false;
    }

    // 应用重力
    player.velocityY += player.gravity;

    // 更新位置
    player.x += player.velocityX;
    player.y += player.velocityY;

    // 边界检测（考虑关卡宽度）
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > levelWidth) player.x = levelWidth - player.width;

    // 平台碰撞检测
    player.onGround = false;
    const currentPlatforms = isUnderground ? undergroundPlatforms : platforms;
    currentPlatforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            if (player.velocityY > 0) {
                // 从上往下掉落，站在平台上
                if (player.y + player.height - player.velocityY <= platform.y + 10) {
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    player.onGround = true;
                }
            } else if (player.velocityY < 0) {
                // 从下往上跳跃，撞到平台底部
                if (player.y - player.velocityY >= platform.y + platform.height - 10) {
                    player.y = platform.y + platform.height;
                    player.velocityY = 0;
                }
            }
        }
    });
    
    // 旋转平台碰撞检测
    if (!isUnderground && rotatingPlatforms) {
        rotatingPlatforms.forEach(platform => {
            // 计算玩家中心点
            const playerCenterX = player.x + player.width / 2;
            const playerBottom = player.y + player.height;
            
            // 计算平台的旋转后的顶部Y坐标（近似）
            const platformTopY = platform.centerY - platform.height / 2 * Math.abs(Math.cos(platform.angle));
            
            // 检测玩家是否在平台上方
            const dx = playerCenterX - platform.centerX;
            const dy = playerBottom - platformTopY;
            
            // 判断玩家是否在平台水平范围内
            const inHorizontalRange = Math.abs(dx) < platform.width / 2;
            const nearPlatform = dy > -10 && dy < 20;
            
            if (inHorizontalRange && nearPlatform && player.velocityY >= 0) {
                const normalizedAngle = ((platform.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
                
                // 当平台旋转到接近水平时，玩家可以站立
                if (normalizedAngle < Math.PI / 4 || normalizedAngle > Math.PI * 7 / 4) {
                    // 平台接近水平，玩家可以站立
                    player.y = platformTopY - player.height;
                    player.velocityY = 0;
                    player.onGround = true;
                } else if (normalizedAngle > Math.PI / 3 && normalizedAngle < Math.PI * 2 / 3) {
                    // 平台倾斜较大，玩家滑落
                    player.onGround = false;
                } else if (normalizedAngle > Math.PI * 4 / 3 && normalizedAngle < Math.PI * 5 / 3) {
                    // 平台倾斜较大，玩家滑落
                    player.onGround = false;
                }
            }
        });
    }
    
    // 箱子碰撞检测
    boxes.forEach(box => {
        if (!box.hit && checkCollision(player, box)) {
            if (player.velocityY < 0 && player.y > box.y) {
                // 从下往上顶到箱子
                hitBox(box);
                player.y = box.y + box.height;
                player.velocityY = 0;
            }
        }
    });

    // 陷阱平台碰撞
    traps.forEach(trap => {
        if (!trap.falling && checkCollision(player, trap)) {
            if (player.velocityY > 0) {
                // 从上往下掉落，站在平台上并触发陷阱
                if (player.y + player.height - player.velocityY <= trap.y + 10) {
                    player.y = trap.y - player.height;
                    player.velocityY = 0;
                    player.onGround = true;
                    trap.falling = true;
                }
            } else if (player.velocityY < 0) {
                // 从下往上跳跃，撞到平台底部
                if (player.y - player.velocityY >= trap.y + trap.height - 10) {
                    player.y = trap.y + trap.height;
                    player.velocityY = 0;
                }
            }
        }
    });

    // 金币收集
    const currentCoins = isUnderground ? undergroundCoins : coins;
    currentCoins.forEach(coin => {
        if (!coin.collected && checkCollision(player, coin)) {
            coin.collected = true;
            gameState.coins++;
            gameState.score += 100;
            updateUI();
            showHint('+100 分！');
        }
    });

    // 果实收集
    fruits.forEach(fruit => {
        if (!fruit.collected && checkCollision(player, fruit)) {
            fruit.collected = true;
            gameState.lives++;
            updateUI();
            showHint('+1 生命！❤️');
        }
    });
    
    // 蘑菇收集
    mushrooms.forEach(mushroom => {
        if (!mushroom.collected && checkCollision(player, mushroom)) {
            mushroom.collected = true;
            growPlayer();
            gameState.score += 100;
            showHint('获得蘑菇！变大了！🍄');
        }
    });

    // 敌人碰撞
    const currentEnemies = isUnderground ? undergroundEnemies : enemies;
    currentEnemies.forEach(enemy => {
        if (checkCollision(player, enemy)) {
            if (player.velocityY > 0 && player.y < enemy.y) {
                // 踩踏敌人
                gameState.score += 200;
                enemy.x = -100;
                showHint('消灭敌人 +200 分！');
            } else {
                // 受到伤害
                if (player.isBig) {
                    // 变大状态下受伤，变小但不扣血
                    shrinkPlayer();
                    showHint('变小了！⚠️');
                } else {
                    // 正常状态下受伤，扣血
                    takeDamage();
                }
            }
        }
    });

    // 尖刺碰撞
    spikes.forEach(spike => {
        if (spike.active && checkCollision(player, spike)) {
            takeDamage();
        }
    });

    // 坠落物碰撞
    fallingObjects.forEach(obj => {
        if (obj.active && checkCollision(player, obj)) {
            takeDamage();
        }
    });
    
    // 管道碰撞检测
    if (!isUnderground) {
        pipes.forEach(pipe => {
            if (checkCollision(player, pipe)) {
                if (keys['ArrowDown']) {
                    if (pipe.fake) {
                        // 假管道，扣血
                        takeDamage();
                        showHint('假管道！-1生命 💀');
                    } else {
                        // 真管道，进入地下
                        enterUnderground();
                    }
                } else if (!player.pipeHintShown) {
                    showHint('按下方向键↓进入管道');
                    player.pipeHintShown = true;
                    setTimeout(() => { player.pipeHintShown = false; }, 3000);
                }
            }
        });
    } else {
        // 地下场景出口检测
        if (exitPipe && checkCollision(player, exitPipe)) {
            if (keys['ArrowDown']) {
                exitUnderground();
            } else if (!player.pipeHintShown) {
                showHint('按下方向键↓离开地下');
                player.pipeHintShown = true;
                setTimeout(() => { player.pipeHintShown = false; }, 3000);
            }
        }
    }

    // 掉落检测
    if (player.y > canvas.height) {
        if (player.isBig) {
            shrinkPlayer();
        }
        takeDamage();
        resetPlayerPosition();
    }

    // 胜利条件（到达关卡末尾）
    if (player.x > levelWidth - 200) {
        endGame(true);
    }
}

// ==================== 更新敌人 ====================
function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.x += enemy.velocityX * enemy.direction;
        
        // 敌人转向逻辑
        if (enemy.x <= 200 || enemy.x >= levelWidth - 200) {
            enemy.direction *= -1;
        }
    });
}

// ==================== 更新地下敌人 ====================
function updateUndergroundEnemies() {
    undergroundEnemies.forEach(enemy => {
        enemy.x += enemy.velocityX * enemy.direction;
        
        // 敌人转向逻辑
        if (enemy.x <= 100 || enemy.x >= 1900) {
            enemy.direction *= -1;
        }
    });
}

// ==================== 更新移动平台 ====================
function updateMovingPlatforms() {
    const currentPlatforms = isUnderground ? undergroundPlatforms : platforms;
    
    currentPlatforms.forEach(platform => {
        if (platform.moving) {
            if (platform.moveType === 'vertical') {
                // 垂直移动（上下）
                platform.y += platform.moveSpeed * platform.direction;
                
                // 检查是否超出移动范围
                if (platform.direction > 0) {
                    // 向下移动
                    if (platform.y >= platform.initialY + platform.moveRange) {
                        platform.direction = -1;
                    }
                } else {
                    // 向上移动
                    if (platform.y <= platform.initialY - platform.moveRange) {
                        platform.direction = 1;
                    }
                }
                
                // 如果玩家站在移动平台上，玩家随平台垂直移动
                if (player.onGround) {
                    const onPlatform = player.x + player.width > platform.x && 
                                      player.x < platform.x + platform.width &&
                                      Math.abs(player.y + player.height - platform.y) < 5;
                    if (onPlatform) {
                        player.y += platform.moveSpeed * platform.direction;
                    }
                }
            } else if (platform.moveType === 'horizontal') {
                // 水平移动（左右）
                platform.x += platform.moveSpeed * platform.direction;
                
                // 检查是否超出移动范围
                if (platform.direction > 0) {
                    // 向右移动
                    if (platform.x >= platform.initialX + platform.moveRange) {
                        platform.direction = -1;
                    }
                } else {
                    // 向左移动
                    if (platform.x <= platform.initialX - platform.moveRange) {
                        platform.direction = 1;
                    }
                }
                
                // 如果玩家站在移动平台上，玩家随平台水平移动
                if (player.onGround) {
                    const onPlatform = player.x + player.width > platform.x && 
                                      player.x < platform.x + platform.width &&
                                      Math.abs(player.y + player.height - platform.y) < 5;
                    if (onPlatform) {
                        player.x += platform.moveSpeed * platform.direction;
                    }
                }
            }
        }
    });
}

// ==================== 更新移动蘑菇 ====================
function updateMovingMushrooms() {
    mushrooms.forEach(mushroom => {
        if (mushroom.moving && !mushroom.collected) {
            // 左右移动
            mushroom.x += mushroom.velocityX * mushroom.direction;
            
            // 检查是否超出移动范围
            if (mushroom.direction > 0) {
                // 向右移动
                if (mushroom.x >= mushroom.initialX + mushroom.moveRange) {
                    mushroom.direction = -1;
                }
            } else {
                // 向左移动
                if (mushroom.x <= mushroom.initialX - mushroom.moveRange) {
                    mushroom.direction = 1;
                }
            }
        }
    });
}

// ==================== 更新旋转平台 ====================
function updateRotatingPlatforms() {
    if (rotatingPlatforms) {
        rotatingPlatforms.forEach(platform => {
            platform.angle += platform.rotationSpeed;
            if (platform.angle > Math.PI * 2) {
                platform.angle -= Math.PI * 2;
            }
        });
    }
}

// ==================== 绘制旋转平台 ====================
function drawRotatingPlatforms() {
    if (rotatingPlatforms) {
        rotatingPlatforms.forEach(platform => {
            ctx.save();
            ctx.translate(platform.centerX, platform.centerY);
            ctx.rotate(platform.angle);
            
            // 绘制平台
            ctx.fillStyle = '#e67e22';
            ctx.fillRect(-platform.width / 2, -platform.height / 2, platform.width, platform.height);
            
            // 绘制边框
            ctx.strokeStyle = '#d35400';
            ctx.lineWidth = 2;
            ctx.strokeRect(-platform.width / 2, -platform.height / 2, platform.width, platform.height);
            
            ctx.restore();
        });
    }
}

// ==================== 更新陷阱 ====================
function updateTraps() {
    traps.forEach(trap => {
        if (trap.falling) {
            trap.fallSpeed += 0.5;
            trap.y += trap.fallSpeed;
            
            if (trap.y > canvas.height) {
                trap.y = canvas.height + 100;
            }
        }
    });
}

// ==================== 更新尖刺 ====================
function updateSpikes() {
    spikes.forEach(spike => {
        spike.timer++;
        if (spike.timer >= spike.interval) {
            spike.active = !spike.active;
            spike.timer = 0;
        }
    });
}

// ==================== 更新坠落物 ====================
function updateFallingObjects() {
    fallingObjects.forEach(obj => {
        if (obj.active) {
            // 应用重力
            obj.velocityY += obj.gravity;
            obj.y += obj.velocityY;
            
            // 如果掉出屏幕，重置
            if (obj.y > canvas.height) {
                obj.active = false;
                obj.respawnTimer = 0;
            }
        } else {
            // 重生计时
            obj.respawnTimer++;
            if (obj.respawnTimer >= obj.respawnInterval) {
                obj.y = -50;
                obj.velocityY = 0;
                obj.active = true;
                obj.respawnTimer = 0;
            }
        }
    });
}

// ==================== 更新果实 ====================
function updateFruits() {
    // 果实收集在updatePlayer中处理
}

// ==================== 进入地下场景 ====================
function enterUnderground() {
    isUnderground = true;
    player.x = 100;
    player.y = canvas.height - 150;
    player.velocityX = 0;
    player.velocityY = 0;
    cameraOffsetX = 0;
    
    // 切换背景色
    ctx.fillStyle = '#2c3e50';
    
    showHint('进入地下通道！');
}

// ==================== 离开地下场景 ====================
function exitUnderground() {
    isUnderground = false;
    player.x = 100;
    player.y = canvas.height - 150;
    player.velocityX = 0;
    player.velocityY = 0;
    cameraOffsetX = 0;
    
    showHint('返回地面！');
}

// ==================== 顶箱子功能 ====================
function hitBox(box) {
    box.hit = true;
    
    if (box.content === 'mushroom') {
        // 蘑菇：变大
        growPlayer();
        gameState.score += 100;
        showHint('获得蘑菇！变大了！🍄');
    } else if (box.content === 'coin') {
        // 金币
        gameState.coins++;
        gameState.score += 100;
        updateUI();
        showHint('+100 分！🪙');
    } else if (box.content === 'enemy') {
        // 怪兽：扣血
        if (player.isBig) {
            shrinkPlayer();
            showHint('箱子里的怪兽！变小了！👾');
        } else {
            takeDamage();
            showHint('箱子里的怪兽！-1生命 👾');
        }
    } else if (box.content === 'empty') {
        // 空箱子
        showHint('空箱子！📦');
    }
}

// ==================== 玩家变大 ====================
function growPlayer() {
    if (!player.isBig) {
        player.isBig = true;
        player.y -= (player.bigHeight - player.height); // 调整位置
        player.width = player.bigWidth;
        player.height = player.bigHeight;
    }
}

// ==================== 玩家变小 ====================
function shrinkPlayer() {
    if (player.isBig) {
        player.isBig = false;
        player.width = player.normalWidth;
        player.height = player.normalHeight;
    }
}

// ==================== 绘制玩家 ====================
function drawPlayer() {
    // 玩家身体
    if (player.isBig) {
        ctx.fillStyle = '#9b59b6'; // 变大时显示紫色
    } else {
        ctx.fillStyle = '#e74c3c';
    }
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // 绘制眼睛
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 10, player.y + 10, 8, 8);
    ctx.fillRect(player.x + 22, player.y + 10, 8, 8);
    
    // 绘制帽子
    if (player.isBig) {
        ctx.fillStyle = '#8e44ad';
    } else {
        ctx.fillStyle = '#c0392b';
    }
    ctx.fillRect(player.x, player.y - 10, player.width, 10);
}

// ==================== 绘制平台 ====================
function drawPlatforms() {
    platforms.forEach(platform => {
        if (platform.moving) {
            // 移动平台使用不同颜色
            ctx.fillStyle = '#e67e22';
        } else {
            ctx.fillStyle = '#8B4513';
        }
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // 绘制草地纹理
        if (platform.moving) {
            ctx.fillStyle = '#d35400';
        } else {
            ctx.fillStyle = '#27ae60';
        }
        ctx.fillRect(platform.x, platform.y, platform.width, 5);
    });
}

// ==================== 绘制陷阱 ====================
function drawTraps() {
    traps.forEach(trap => {
        ctx.fillStyle = trap.falling ? '#e67e22' : '#d35400';
        ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
        
        // 警告标记
        if (!trap.falling) {
            ctx.fillStyle = 'yellow';
            ctx.font = '20px Arial';
            ctx.fillText('!', trap.x + trap.width / 2 - 5, trap.y - 10);
        }
    });
}

// ==================== 绘制尖刺 ====================
function drawSpikes() {
    spikes.forEach(spike => {
        if (spike.active) {
            ctx.fillStyle = '#95a5a6';
            ctx.beginPath();
            for (let i = 0; i < spike.width; i += 10) {
                ctx.moveTo(spike.x + i, spike.y + spike.height);
                ctx.lineTo(spike.x + i + 5, spike.y);
                ctx.lineTo(spike.x + i + 10, spike.y + spike.height);
            }
            ctx.closePath();
            ctx.fill();
        }
    });
}

// ==================== 绘制金币 ====================
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#f39c12';
            ctx.font = '20px Arial';
            ctx.fillText('$', coin.x + 8, coin.y + 22);
        }
    });
}

// ==================== 绘制敌人 ====================
function drawEnemies() {
    ctx.fillStyle = '#9b59b6';
    enemies.forEach(enemy => {
        if (enemy.x > -100) {
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // 绘制眼睛
            ctx.fillStyle = 'white';
            ctx.fillRect(enemy.x + 8, enemy.y + 10, 6, 6);
            ctx.fillRect(enemy.x + 26, enemy.y + 10, 6, 6);
            ctx.fillStyle = '#9b59b6';
        }
    });
}

// ==================== 绘制坠落物 ====================
function drawFallingObjects() {
    fallingObjects.forEach(obj => {
        if (obj.active) {
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            // 绘制三角形坠落物
            ctx.moveTo(obj.x + obj.width / 2, obj.y);
            ctx.lineTo(obj.x, obj.y + obj.height);
            ctx.lineTo(obj.x + obj.width, obj.y + obj.height);
            ctx.closePath();
            ctx.fill();
            
            // 添加警告效果
            ctx.strokeStyle = '#c0392b';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

// ==================== 绘制果实 ====================
function drawFruits() {
    fruits.forEach(fruit => {
        if (!fruit.collected) {
            // 绘制心形果实
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            const x = fruit.x + fruit.width / 2;
            const y = fruit.y + fruit.height / 2;
            const size = fruit.width / 2;
            
            ctx.moveTo(x, y + size / 2);
            ctx.bezierCurveTo(x, y - size / 2, x - size * 1.5, y - size / 2, x - size * 1.5, y);
            ctx.bezierCurveTo(x - size * 1.5, y + size / 2, x, y + size * 1.5, x, y + size * 2);
            ctx.bezierCurveTo(x, y + size * 1.5, x + size * 1.5, y + size / 2, x + size * 1.5, y);
            ctx.bezierCurveTo(x + size * 1.5, y - size / 2, x, y - size / 2, x, y + size / 2);
            ctx.fill();
            
            // 添加光泽
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(x - size / 3, y, size / 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// ==================== 绘制管道 ====================
function drawPipes() {
    pipes.forEach(pipe => {
        // 绘制管道主体（真假都是绿色）
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
        
        // 绘制管道顶部
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(pipe.x - 5, pipe.y, pipe.width + 10, 10);
        
        // 绘制管道边缘
        ctx.strokeStyle = '#229954';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, pipe.y, pipe.width, pipe.height);
        
        // 绘制向下箭头提示
        ctx.fillStyle = 'yellow';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('↓', pipe.x + pipe.width / 2 - 7, pipe.y - 10);
    });
}

// ==================== 绘制出口管道 ====================
function drawExitPipe() {
    if (exitPipe) {
        // 绘制管道主体
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(exitPipe.x, exitPipe.y, exitPipe.width, exitPipe.height);
        
        // 绘制管道顶部
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(exitPipe.x - 5, exitPipe.y, exitPipe.width + 10, 10);
        
        // 绘制管道边缘
        ctx.strokeStyle = '#d35400';
        ctx.lineWidth = 3;
        ctx.strokeRect(exitPipe.x, exitPipe.y, exitPipe.width, exitPipe.height);
        
        // 绘制向下箭头提示
        ctx.fillStyle = 'yellow';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('↓', exitPipe.x + exitPipe.width / 2 - 7, exitPipe.y - 10);
    }
}

// ==================== 绘制地下平台 ====================
function drawUndergroundPlatforms() {
    undergroundPlatforms.forEach(platform => {
        if (platform.moving) {
            // 移动平台使用不同颜色
            ctx.fillStyle = '#8e44ad';
        } else {
            ctx.fillStyle = '#34495e';
        }
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // 绘制岩石纹理
        if (platform.moving) {
            ctx.fillStyle = '#9b59b6';
        } else {
            ctx.fillStyle = '#2c3e50';
        }
        ctx.fillRect(platform.x, platform.y, platform.width, 5);
    });
}

// ==================== 绘制地下金币 ====================
function drawUndergroundCoins() {
    undergroundCoins.forEach(coin => {
        if (!coin.collected) {
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#f39c12';
            ctx.font = '20px Arial';
            ctx.fillText('$', coin.x + 8, coin.y + 22);
        }
    });
}

// ==================== 绘制地下敌人 ====================
function drawUndergroundEnemies() {
    ctx.fillStyle = '#8e44ad';
    undergroundEnemies.forEach(enemy => {
        if (enemy.x > -100) {
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // 绘制眼睛
            ctx.fillStyle = 'red';
            ctx.fillRect(enemy.x + 8, enemy.y + 10, 6, 6);
            ctx.fillRect(enemy.x + 26, enemy.y + 10, 6, 6);
            ctx.fillStyle = '#8e44ad';
        }
    });
}

// ==================== 绘制箱子 ====================
function drawBoxes() {
    boxes.forEach(box => {
        if (box.hit) {
            // 已经被顶过的箱子，显示为灰色
            ctx.fillStyle = '#7f8c8d';
        } else {
            // 未被顶过的箱子，显示为黄色
            ctx.fillStyle = '#f39c12';
        }
        ctx.fillRect(box.x, box.y, box.width, box.height);
        
        // 绘制问号（未被顶过的箱子）
        if (!box.hit) {
            ctx.fillStyle = 'white';
            ctx.font = 'bold 30px Arial';
            ctx.fillText('?', box.x + 12, box.y + 32);
        }
        
        // 绘制边框
        ctx.strokeStyle = '#d35400';
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
    });
}

// ==================== 绘制蘑菇 ====================
function drawMushrooms() {
    mushrooms.forEach(mushroom => {
        if (!mushroom.collected) {
            // 绘制蘑菇帽
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(mushroom.x + mushroom.width / 2, mushroom.y + 10, 12, Math.PI, 0, false);
            ctx.fill();
            
            // 绘制白点
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(mushroom.x + mushroom.width / 2 - 5, mushroom.y + 8, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(mushroom.x + mushroom.width / 2 + 5, mushroom.y + 8, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // 绘制蘑菇柄
            ctx.fillStyle = '#ecf0f1';
            ctx.fillRect(mushroom.x + mushroom.width / 2 - 5, mushroom.y + 10, 10, 15);
        }
    });
}

// ==================== 碰撞检测 ====================
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// ==================== 受到伤害 ====================
function takeDamage() {
    gameState.lives--;
    updateUI();
    
    if (gameState.lives > 0) {
        resetPlayerPosition();
        showHint('受到伤害！小心！');
    } else {
        endGame(false);
    }
}

// ==================== 重置玩家位置 ====================
function resetPlayerPosition() {
    player.x = 100;
    player.y = canvas.height - 150;
    player.velocityX = 0;
    player.velocityY = 0;
    cameraOffsetX = 0; // 重置摄像机
    isUnderground = false; // 重置为地面场景
}

// ==================== 更新UI ====================
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('time').textContent = gameState.time;
    document.getElementById('coins').textContent = gameState.coins;
}

// ==================== 显示提示 ====================
function showHint(text) {
    const hint = document.getElementById('hint');
    hint.textContent = text;
    hint.style.display = 'block';
    
    setTimeout(() => {
        hint.style.display = 'none';
    }, 3000);
}

// ==================== 暂停游戏 ====================
function pauseGame() {
    gameState.isPaused = true;
    document.getElementById('pauseMenu').style.display = 'block';
}

// ==================== 继续游戏 ====================
function resumeGame() {
    gameState.isPaused = false;
    document.getElementById('pauseMenu').style.display = 'none';
}

// ==================== 重新开始关卡 ====================
function restartLevel() {
    // 隐藏所有菜单
    document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    
    // 停止当前游戏循环和计时器
    if (gameLoop) cancelAnimationFrame(gameLoop);
    if (timeInterval) clearInterval(timeInterval);
    
    // 重新开始当前关卡
    startLevel(gameState.currentLevel);
}

// ==================== 下一关 ====================
function nextLevel() {
    // 隐藏游戏结束面板
    document.getElementById('gameOver').style.display = 'none';
    
    // 停止当前游戏循环和计时器
    if (gameLoop) cancelAnimationFrame(gameLoop);
    if (timeInterval) clearInterval(timeInterval);
    
    const nextLevelNum = gameState.currentLevel + 1;
    if (nextLevelNum <= levels.length) {
        levels[nextLevelNum - 1].unlocked = true;
        saveUserData();
        // 启动下一关
        startLevel(nextLevelNum);
    } else {
        showHint('恭喜通关所有关卡！');
        quitToMenu();
    }
}

// ==================== 退出到菜单 ====================
function quitToMenu() {
    gameState.gameRunning = false;
    if (gameLoop) cancelAnimationFrame(gameLoop);
    if (timeInterval) clearInterval(timeInterval);
    
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
    
    saveUserData();
}

// ==================== 游戏结束 ====================
function endGame(won) {
    gameState.gameRunning = false;
    
    // 停止游戏循环和计时器
    if (gameLoop) cancelAnimationFrame(gameLoop);
    if (timeInterval) clearInterval(timeInterval);
    
    const gameOverDiv = document.getElementById('gameOver');
    const title = document.getElementById('gameOverTitle');
    const finalScore = document.getElementById('finalScore');
    
    if (won) {
        title.textContent = '🎉 关卡完成！🎉';
        gameState.score += gameState.time * 10;
        
        // 更新星级
        const levelIndex = gameState.currentLevel - 1;
        levels[levelIndex].stars = Math.min(3, Math.floor(gameState.score / 1000));
        
        // 解锁下一关
        if (gameState.currentLevel < levels.length) {
            levels[gameState.currentLevel].unlocked = true;
        }
    } else {
        title.textContent = '💀 游戏结束 💀';
    }
    
    finalScore.textContent = gameState.score;
    gameOverDiv.style.display = 'block';
    
    saveUserData();
}

// ==================== 键盘事件监听 ====================
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// ==================== 触屏控制 ====================
function initTouchControls() {
    const touchLeft = document.getElementById('touchLeft');
    const touchRight = document.getElementById('touchRight');
    const touchJump = document.getElementById('touchJump');
    
    if (touchLeft) {
        touchLeft.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys['ArrowLeft'] = true;
        });
        touchLeft.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys['ArrowLeft'] = false;
        });
    }
    
    if (touchRight) {
        touchRight.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys['ArrowRight'] = true;
        });
        touchRight.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys['ArrowRight'] = false;
        });
    }
    
    if (touchJump) {
        touchJump.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys[' '] = true;
        });
        touchJump.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys[' '] = false;
        });
    }
}

// 初始化触屏控制
initTouchControls();

// ==================== 窗口大小调整 ====================
window.addEventListener('resize', () => {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});

// ==================== 页面加载初始化 ====================
window.addEventListener('load', () => {
    // 检查是否有已登录用户
    const savedUser = localStorage.getItem('currentMarioUser');
    if (savedUser) {
        gameState.currentUser = savedUser;
        loadUserData();
        document.getElementById('currentUser').textContent = savedUser;
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('mainMenu').style.display = 'flex';
        playBackgroundMusic();
    }
});

// ==================== 页面卸载前保存 ====================
window.addEventListener('beforeunload', () => {
    if (gameState.currentUser) {
        localStorage.setItem('currentMarioUser', gameState.currentUser);
        saveUserData();
    }
});