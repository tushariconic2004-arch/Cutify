// --- 1. Background Hearts Floating Effect ---
function createBackgroundHearts() {
    const container = document.getElementById('bgHeartsContainer');
    if (!container) return;

    const maxHearts = 25;
    const hearts = ['❤️', '💖', '💝', '💕', '🌸', '✨'];

    function spawnHeart() {
        if (container.children.length >= maxHearts) return;

        const heartSpan = document.createElement('span');
        heartSpan.className = 'floating-bg-heart';
        heartSpan.innerText = hearts[Math.floor(Math.random() * hearts.length)];
        
        // Random placement parameters
        const xPos = Math.random() * 100;
        const size = 15 + Math.random() * 20;
        const duration = 8 + Math.random() * 10;
        const delay = Math.random() * 5;

        heartSpan.style.setProperty('--x', `${xPos}%`);
        heartSpan.style.setProperty('--size', `${size}px`);
        heartSpan.style.setProperty('--speed', `${duration}s`);
        heartSpan.style.setProperty('--delay', `${delay}s`);

        container.appendChild(heartSpan);

        // Remove element after animation completes
        setTimeout(() => {
            heartSpan.remove();
        }, (duration + delay) * 1000);
    }

    // Initial load batch
    for (let i = 0; i < 15; i++) {
        spawnHeart();
    }

    // Keep spawning new hearts
    setInterval(spawnHeart, 1500);
}

// --- 2. Web Audio API Dreamy Lullaby Sequencer (Retro Music Box) ---
let audioCtx = null;
let synthInterval = null;
let melodyPlaying = false;
let masterGain = null;
let currentNoteIndex = 0;

// Simple melodic note frequencies (Pentatonic-leaning scale for sweet harmony)
const lullabyNotes = [
    { freq: 329.63, duration: 0.4 }, // E4
    { freq: 392.00, duration: 0.4 }, // G4
    { freq: 523.25, duration: 0.8 }, // C5
    { freq: 440.00, duration: 0.4 }, // A4
    { freq: 523.25, duration: 0.4 }, // C5
    { freq: 587.33, duration: 0.8 }, // D5
    { freq: 659.25, duration: 0.4 }, // E5
    { freq: 587.33, duration: 0.4 }, // D5
    { freq: 523.25, duration: 0.4 }, // C5
    { freq: 440.00, duration: 0.4 }, // A4
    { freq: 392.00, duration: 0.8 }, // G4
    { freq: 523.25, duration: 0.8 }, // C5
    
    // Harmony variations
    { freq: 440.00, duration: 0.4 }, // A4
    { freq: 523.25, duration: 0.4 }, // C5
    { freq: 659.25, duration: 0.8 }, // E5
    { freq: 587.33, duration: 0.4 }, // D5
    { freq: 523.25, duration: 0.4 }, // C5
    { freq: 392.00, duration: 0.8 }, // G4
];

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.12, audioCtx.currentTime); // Keep volume cozy & soft
    masterGain.connect(audioCtx.destination);
}

function playNote(freq, type, duration, startTime) {
    if (!audioCtx || audioCtx.state === 'suspended') return;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    // Soft attack, decay, release envelope (music box sound)
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.05); // Attack
    gainNode.gain.setValueAtTime(0.12, startTime + duration - 0.1);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration); // Release
    
    osc.connect(gainNode);
    gainNode.connect(masterGain);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
}

function playSoundEffect(type) {
    if (!audioCtx || audioCtx.state === 'suspended') return;
    
    const time = audioCtx.currentTime;
    if (type === 'catch') {
        // Cute upward chime
        playNote(523.25, 'sine', 0.1, time);
        playNote(659.25, 'sine', 0.1, time + 0.08);
        playNote(783.99, 'sine', 0.15, time + 0.16);
    } else if (type === 'miss') {
        // Soft sad descending note
        playNote(349.23, 'triangle', 0.2, time);
        playNote(261.63, 'triangle', 0.25, time + 0.15);
    } else if (type === 'win') {
        // Triumphant cute arpeggio
        playNote(523.25, 'triangle', 0.15, time);
        playNote(659.25, 'triangle', 0.15, time + 0.1);
        playNote(783.99, 'triangle', 0.15, time + 0.2);
        playNote(1046.50, 'triangle', 0.4, time + 0.3);
    } else if (type === 'pop') {
        // Bubble pop sound
        playNote(880.00, 'sine', 0.05, time);
        playNote(1174.66, 'sine', 0.08, time + 0.04);
    }
}

function startSequencer() {
    if (synthInterval) clearInterval(synthInterval);
    currentNoteIndex = 0;
    synthInterval = setInterval(() => {
        if (!melodyPlaying) return;
        const note = lullabyNotes[currentNoteIndex];
        
        // Root melody
        playNote(note.freq, 'triangle', note.duration, audioCtx.currentTime);
        
        // Soft sine wave harmony notes on alternate beats
        if (currentNoteIndex % 2 === 0) {
            playNote(note.freq * 0.75, 'sine', note.duration, audioCtx.currentTime);
        }
        
        currentNoteIndex = (currentNoteIndex + 1) % lullabyNotes.length;
    }, 450);
}

function toggleMusic() {
    initAudio();
    const btn = document.getElementById('musicToggleBtn');
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    if (!melodyPlaying) {
        melodyPlaying = true;
        btn.classList.add('playing');
        btn.innerHTML = `<i class="fa-solid fa-volume-high"></i><span class="music-note-icon">🎵</span>`;
        startSequencer();
    } else {
        melodyPlaying = false;
        btn.classList.remove('playing');
        btn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
        if (synthInterval) clearInterval(synthInterval);
    }
}

// --- 3. Intro Gift Box Trigger ---
function setupGiftBox() {
    const box = document.getElementById('giftBoxContainer');
    const overlay = document.getElementById('welcomeOverlay');
    const mainApp = document.getElementById('mainApp');

    if (!box) return;

    box.addEventListener('click', () => {
        // Prevent double clicking
        if (box.classList.contains('opened')) return;
        
        box.classList.add('opened');
        
        // Initial soft pop sound
        initAudio();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        playSoundEffect('win');

        // Confetti burst
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ff5e7e', '#ff7675', '#ffd15c', '#9b72ff']
            });
        }, 300);

        // Extra bursts
        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#ff5e7e', '#ffd15c']
            });
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#ff5e7e', '#9b72ff']
            });
        }, 700);

        // Slide overlay up and reveal application
        setTimeout(() => {
            overlay.classList.add('fade-out');
            mainApp.classList.remove('hidden');
            
            // Automatically launch background music once overlay is gone
            setTimeout(() => {
                toggleMusic();
            }, 500);
        }, 1500);
    });
}

// --- 4. Tab Navigation System ---
function setupTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Toggle active classes
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const targetPane = document.getElementById(targetTab);
            if (targetPane) targetPane.classList.add('active');
            
            playSoundEffect('pop');

            // Special game clean up if navigating away from game tab
            if (targetTab !== 'heart-catcher') {
                stopGame();
            }
        });
    });
}

// --- 5. Magic Love Jar Note Popping ---
const loveMessages = [
    "Your laugh is literally my favorite sound in the world. 💖",
    "I love how you get excited about the little details of your day. ✨",
    "You are the first thing I want to talk to when I wake up, and the last when I sleep. 🌙",
    "You make even simple drives or running chores feel like a fun adventure. 🚗",
    "I love how warm, safe, and comforting your hugs feel. 🤗",
    "Thank you for being my safe space, my biggest supporter, and my best friend. 🌸",
    "I am so incredibly proud of your strength, your kindness, and your beautiful mind. 🌟",
    "You make my bad days good, and my good days completely unforgettable. ☀️",
    "I still get sweet little butterflies when I see you smile. 🦋",
    "I love the way you look at me with so much care and warmth. 👀",
    "You support my dreams and make me want to grow every single day. 🌱",
    "Your endless kindness inspires me to be a better person. ❤️",
    "No matter what happens, you are my favorite chapter in my life story. 📖",
    "You make everything feel possible and every dream feel reachable. 🌈",
    "I love you just the way you are—perfect, beautiful, and uniquely you. rose"
];

let messageHistory = [];

function setupLoveJar() {
    const jar = document.getElementById('jarWrapper');
    const noteArea = document.getElementById('noteRevealArea');
    const noteText = document.getElementById('loveNoteText');
    const closeBtn = document.getElementById('closeNoteBtn');
    const innerContainer = document.getElementById('jarHeartsInside');

    if (!jar) return;

    // Populate jar with decorative stationary items
    for (let i = 0; i < 15; i++) {
        const item = document.createElement('span');
        item.className = 'mini-jar-heart';
        item.innerHTML = ['❤️', '💖', '💝', '🍬', '✨'][Math.floor(Math.random() * 5)];
        item.style.setProperty('--b', `${10 + Math.random() * 120}px`);
        item.style.setProperty('--l', `${5 + Math.random() * 80}%`);
        item.style.setProperty('--s', `${12 + Math.random() * 12}px`);
        item.style.setProperty('--d', `${Math.random() * -4}s`);
        innerContainer.appendChild(item);
    }

    jar.addEventListener('click', (e) => {
        playSoundEffect('pop');
        
        // Shake jar graphic
        jar.classList.add('animated-bounce');
        setTimeout(() => {
            jar.classList.remove('animated-bounce');
        }, 500);

        // Spawn floating pop-out heart graphic at jar location
        const clickRect = jar.getBoundingClientRect();
        const heart = document.createElement('div');
        heart.className = 'popping-heart';
        heart.innerHTML = '💖';
        heart.style.left = `${e.clientX - 20}px`;
        heart.style.top = `${e.clientY - 20}px`;
        document.body.appendChild(heart);

        // Remove floating graphic
        setTimeout(() => {
            heart.remove();
        }, 1000);

        // Select a fresh note from pool
        let selectedNote = "";
        if (messageHistory.length >= loveMessages.length) {
            messageHistory = []; // Reset history if all are viewed
        }

        do {
            selectedNote = loveMessages[Math.floor(Math.random() * loveMessages.length)];
        } while (messageHistory.includes(selectedNote));
        
        messageHistory.push(selectedNote);

        // Display note card
        noteText.textContent = selectedNote;
        noteArea.classList.remove('hidden');
        
        // Micro confetti pop
        confetti({
            particleCount: 15,
            spread: 30,
            origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
        });
    });

    closeBtn.addEventListener('click', () => {
        noteArea.classList.add('hidden');
        playSoundEffect('pop');
    });
}

// --- 6. Interactive Bouquet Builder ---
let flowersCount = 0;
const flowerEmojis = {
    rose: '🌹',
    tulip: '🌷',
    sunflower: '🌻',
    daisy: '🌼',
    lavender: '🪻',
    babybreath: '🌾'
};

function setupBouquetBuilder() {
    const stage = document.getElementById('flowersStage');
    const ribbonContainer = document.getElementById('workspaceRibbon');
    const wrapContainer = document.getElementById('workspaceWrap');
    const clearBtn = document.getElementById('clearBouquetBtn');
    const textNote = document.getElementById('bouquetNote');
    const cardNote = document.getElementById('workspaceCardNote');
    const miniCardText = document.getElementById('miniCardText');

    if (!stage) return;

    // Pick Flowers trigger
    document.querySelectorAll('.select-item').forEach(button => {
        button.addEventListener('click', () => {
            const flowerType = button.getAttribute('data-flower');
            const emoji = flowerEmojis[flowerType];
            
            if (emoji) {
                spawnFlower(emoji);
                playSoundEffect('pop');
            }
        });
    });

    // Spawn Flower item
    function spawnFlower(emoji) {
        if (flowersCount >= 30) return; // Prevent performance bottleneck
        
        const f = document.createElement('span');
        f.className = 'flower-obj';
        f.innerText = emoji;
        
        // Spawn around center with slight scattering
        const range = 50;
        const leftVal = 50 + (Math.random() * range - range/2);
        const topVal = 40 + (Math.random() * range - range/2);
        const rotVal = Math.random() * 60 - 30;
        const scaleVal = 0.9 + Math.random() * 0.3;

        f.style.left = `${leftVal}%`;
        f.style.top = `${topVal}%`;
        f.style.setProperty('--rot', `${rotVal}deg`);
        f.style.setProperty('--s', scaleVal);

        // Attach dragging capability
        makeDraggable(f);

        stage.appendChild(f);
        flowersCount++;
    }

    // Make element draggable (Mouse & Touch compatible)
    function makeDraggable(el) {
        let isDragging = false;
        let startX, startY;
        let startLeft, startTop;

        const container = document.getElementById('bouquetWorkspace');

        el.addEventListener('mousedown', dragStart);
        el.addEventListener('touchstart', dragStart, { passive: false });

        function dragStart(e) {
            isDragging = true;
            el.style.zIndex = 100; // Bring to front when dragged
            
            // Support both desktop & mobile
            const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

            startX = clientX;
            startY = clientY;

            // Get current positions in percentage or px
            const rect = el.getBoundingClientRect();
            const parentRect = container.getBoundingClientRect();
            
            startLeft = rect.left - parentRect.left + rect.width / 2;
            startTop = rect.top - parentRect.top + rect.height / 2;

            document.addEventListener('mousemove', dragMove);
            document.addEventListener('touchmove', dragMove, { passive: false });
            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('touchend', dragEnd);
            
            if (e.type === 'touchstart') e.preventDefault();
        }

        function dragMove(e) {
            if (!isDragging) return;

            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

            const dx = clientX - startX;
            const dy = clientY - startY;

            const parentRect = container.getBoundingClientRect();
            
            let newX = startLeft + dx;
            let newY = startTop + dy;

            // Constrain inside bounds
            newX = Math.max(20, Math.min(parentRect.width - 20, newX));
            newY = Math.max(20, Math.min(parentRect.height - 20, newY));

            // Set styling positions as percentages
            el.style.left = `${(newX / parentRect.width) * 100}%`;
            el.style.top = `${(newY / parentRect.height) * 100}%`;
            
            e.preventDefault();
        }

        function dragEnd() {
            isDragging = false;
            el.style.zIndex = 6;
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('touchmove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
            document.removeEventListener('touchend', dragEnd);
        }
    }

    // Wrap selectors
    document.querySelectorAll('.select-wrap').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.select-wrap').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const wrapType = btn.getAttribute('data-wrap');
            wrapContainer.className = 'workspace-wrap';
            wrapContainer.classList.add(`wrap-${wrapType}`);
            playSoundEffect('pop');
        });
    });

    // Ribbon selectors
    document.querySelectorAll('.select-ribbon').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.select-ribbon').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const ribbonType = btn.getAttribute('data-ribbon');
            ribbonContainer.className = 'workspace-ribbon';
            
            if (ribbonType === 'none') {
                ribbonContainer.classList.remove('active');
            } else {
                ribbonContainer.classList.add('active', ribbonType);
                ribbonContainer.innerText = '🎀';
            }
            playSoundEffect('pop');
        });
    });

    // Card Note customization
    textNote.addEventListener('input', () => {
        const val = textNote.value.trim();
        if (val) {
            miniCardText.innerText = val;
            cardNote.classList.remove('hidden');
        } else {
            cardNote.classList.add('hidden');
        }
    });

    // Reset workspace
    clearBtn.addEventListener('click', () => {
        stage.innerHTML = '';
        flowersCount = 0;
        textNote.value = '';
        cardNote.classList.add('hidden');
        
        // Reset defaults
        document.querySelector('[data-wrap="kraft"]').click();
        document.querySelector('[data-ribbon="none"]').click();
        playSoundEffect('miss');
    });
}

// --- 7. Canvas Heart Catcher Game ---
let canvas = null;
let ctx = null;
let gameActive = false;
let score = 0;
let level = 1;
let items = [];
let basket = { x: 200, y: 440, width: 90, height: 40 };
let spawnTimer = null;
let animationFrameId = null;

function setupGame() {
    const startBtn = document.getElementById('startGameBtn');
    const pauseBtn = document.getElementById('pauseGameBtn');
    const startPanel = document.getElementById('gamePanel');
    const gameWrapper = document.getElementById('gameCanvasWrapper');
    const closeLetterBtn = document.getElementById('closeLetterBtn');
    const letterOverlay = document.getElementById('letterReward');

    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    startBtn.addEventListener('click', () => {
        startPanel.classList.add('hidden');
        gameWrapper.classList.remove('hidden');
        initAudio();
        startGame();
    });

    pauseBtn.addEventListener('click', () => {
        stopGame();
        startGame();
    });

    closeLetterBtn.addEventListener('click', () => {
        letterOverlay.classList.add('hidden');
        startPanel.classList.remove('hidden');
    });

    // Track cursor movements over canvas (Mouse + Touch)
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        // Scale appropriately for styling resize
        const scaleX = canvas.width / rect.width;
        const relativeX = (e.clientX - rect.left) * scaleX;
        
        basket.x = relativeX - basket.width / 2;
        clampBasket();
    });

    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const relativeX = (e.touches[0].clientX - rect.left) * scaleX;
            
            basket.x = relativeX - basket.width / 2;
            clampBasket();
            e.preventDefault(); // Prevents rubberbanding scroll on iOS
        }
    }, { passive: false });
}

function clampBasket() {
    if (basket.x < 0) basket.x = 0;
    if (basket.x > canvas.width - basket.width) basket.x = canvas.width - basket.width;
}

function startGame() {
    score = 0;
    level = 1;
    items = [];
    gameActive = true;
    updateStatsDisplay();

    // Spawn falling items scheduler
    if (spawnTimer) clearInterval(spawnTimer);
    spawnTimer = setInterval(spawnItem, 1000);

    // Run game animation loops
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    gameLoop();
}

function stopGame() {
    gameActive = false;
    if (spawnTimer) clearInterval(spawnTimer);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    
    // Clear canvas
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function spawnItem() {
    if (!gameActive) return;

    // Item types: heart, star, obstacle (hot coffee)
    const rand = Math.random();
    let type = 'heart';
    let text = '❤️';
    let size = 26;
    let points = 10;

    if (rand > 0.85) {
        type = 'star';
        text = '⭐';
        size = 28;
        points = 20;
    } else if (rand > 0.68) {
        type = 'coffee';
        text = '☕';
        size = 28;
        points = -15;
    } else {
        // Red, pink, lavender hearts
        text = ['❤️', '💖', '💝', '💕'][Math.floor(Math.random() * 4)];
    }

    const fallSpeed = (2.5 + Math.random() * 2) * (1 + (level - 1) * 0.3);

    items.push({
        x: Math.random() * (canvas.width - 30) + 15,
        y: -30,
        speed: fallSpeed,
        type: type,
        text: text,
        size: size,
        points: points
    });
}

function gameLoop() {
    if (!gameActive) return;

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw cozy background details inside canvas
    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid reference line
    ctx.strokeStyle = 'rgba(255, 94, 126, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }

    // 2. Draw Falling Items
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.y += item.speed;

        ctx.font = `${item.size}px Outfit`;
        ctx.fillText(item.text, item.x, item.y);

        // Check basket collision bounds
        const itemBottom = item.y + item.size / 2;
        const itemLeft = item.x - item.size / 2;
        const itemRight = item.x + item.size / 2;

        if (itemBottom >= basket.y && item.y <= basket.y + basket.height) {
            if (itemRight >= basket.x && itemLeft <= basket.x + basket.width) {
                // Collided!
                score += item.points;
                if (score < 0) score = 0; // Don't drop below 0

                if (item.points > 0) {
                    playSoundEffect('catch');
                    // Mini confetti pop at item location
                    confetti({
                        particleCount: 8,
                        spread: 20,
                        origin: { x: item.x / canvas.width, y: basket.y / canvas.height }
                    });
                } else {
                    playSoundEffect('miss');
                }

                items.splice(i, 1);
                updateStatsDisplay();
                checkWinCondition();
                continue;
            }
        }

        // Remove off-screen items
        if (item.y > canvas.height + 30) {
            items.splice(i, 1);
        }
    }

    // 3. Draw Basket (Wicker pattern)
    ctx.fillStyle = '#d0a98c'; // Brown wicker color
    ctx.beginPath();
    ctx.roundRect(basket.x, basket.y, basket.width, basket.height, [0, 0, 15, 15]);
    ctx.fill();

    // Wicker grid detail
    ctx.strokeStyle = '#b78c6e';
    ctx.lineWidth = 2;
    for (let bx = basket.x + 10; bx < basket.x + basket.width; bx += 12) {
        ctx.beginPath();
        ctx.moveTo(bx, basket.y);
        ctx.lineTo(bx + 4, basket.y + basket.height);
        ctx.stroke();
    }

    // Basket rim (Pink velvet rim)
    ctx.fillStyle = '#ff7675';
    ctx.beginPath();
    ctx.roundRect(basket.x - 3, basket.y - 4, basket.width + 6, 8, 4);
    ctx.fill();
    
    // Bow ornament on basket
    ctx.font = '14px Outfit';
    ctx.fillText('🎀', basket.x + basket.width / 2, basket.y - 1);

    // Call next frame
    animationFrameId = requestAnimationFrame(gameLoop);
}

function updateStatsDisplay() {
    // Determine level thresholds
    if (score < 40) {
        level = 1;
    } else if (score < 80) {
        level = 2;
    } else {
        level = 3;
    }

    document.getElementById('gameScoreVal').innerText = score;
    document.getElementById('liveScore').innerText = score;
    document.getElementById('gameLevelVal').innerText = level;
    document.getElementById('liveLevel').innerText = level;
}

function checkWinCondition() {
    if (score >= 100) {
        stopGame();
        playSoundEffect('win');

        // Large victory explosion!
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#ff5e7e', '#ffd15c', '#2ecc71']
        });

        // Show scroll text overlay
        document.getElementById('gameCanvasWrapper').classList.add('hidden');
        document.getElementById('letterReward').classList.remove('hidden');
    }
}

// --- 8. Footer Runaway Button & Proposal Overlay ---
function setupProposalAndFooter() {
    const btnNo = document.getElementById('btnNo');
    const btnYes = document.getElementById('btnYes');
    const proposalOverlay = document.getElementById('proposalOverlay');
    const closeBtn = document.getElementById('closeProposalOverlayBtn');

    if (!btnNo) return;

    btnNo.addEventListener('mouseover', moveNoButton);
    btnNo.addEventListener('touchstart', (e) => {
        e.preventDefault(); // stop scrolling or regular click on mobile
        moveNoButton();
    });

    function moveNoButton() {
        const margin = 70;
        // Calculate bounds based on viewport
        const maxX = window.innerWidth - btnNo.offsetWidth - margin;
        const maxY = window.innerHeight - btnNo.offsetHeight - margin;

        const randomX = Math.max(margin, Math.floor(Math.random() * maxX));
        const randomY = Math.max(margin, Math.floor(Math.random() * maxY));

        // Shift button to fixed runaway styling
        btnNo.style.position = 'fixed';
        btnNo.style.left = `${randomX}px`;
        btnNo.style.top = `${randomY}px`;
        btnNo.style.zIndex = '9999';
        btnNo.style.transition = 'left 0.2s cubic-bezier(0.19, 1, 0.22, 1), top 0.2s cubic-bezier(0.19, 1, 0.22, 1)';
    }

    btnYes.addEventListener('click', () => {
        initAudio();
        playSoundEffect('win');

        // Continuous heart celebration explosions!
        const duration = 4 * 1000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#ff5e7e', '#ff7675', '#ffd15c']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#ff5e7e', '#9b72ff', '#ffd15c']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());

        // Reveal proposal confirmation overlay
        proposalOverlay.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => {
        proposalOverlay.classList.add('hidden');
        playSoundEffect('pop');
    });
}

// --- 9. Initial Load Orchestration ---
window.addEventListener('DOMContentLoaded', () => {
    createBackgroundHearts();
    setupGiftBox();
    setupTabs();
    setupLoveJar();
    setupBouquetBuilder();
    setupGame();
    setupProposalAndFooter();

    // Bind event to toggle music button
    const musicBtn = document.getElementById('musicToggleBtn');
    if (musicBtn) {
        musicBtn.addEventListener('click', toggleMusic);
    }
});
