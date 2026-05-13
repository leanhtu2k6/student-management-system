document.addEventListener("DOMContentLoaded", fetchStacks);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let isSystemBusy = false; 
let opsCount = 0; 

function showMessage(msg, isError = false) {
    const box = document.getElementById('status-bar');
    box.textContent = msg;
    box.style.borderLeftColor = isError ? "#ff3366" : "#0066ff";
    box.style.color = isError ? "#ff3366" : "#0066ff";
}

function updateOpsCount() {
    opsCount++;
    document.getElementById('ping-pong-count').innerText = opsCount;
}

async function fetchStacks() {
    const res = await fetch('/api/get_stacks');
    const data = await res.json();
    renderStacks(data.mainStack, data.tempStack);
    document.getElementById('total-students').innerText = data.mainStack.length;
}

function renderStacks(main, temp) {
    const mainCont = document.getElementById('main-container');
    const tempCont = document.getElementById('temp-container');
    
    mainCont.innerHTML = '';
    [...main].reverse().forEach((student) => {
        mainCont.innerHTML += `
            <div class="stack-item">
                <div>
                    <div class="item-id">${student.id}</div>
                    <div class="item-name">${student.name}</div>
                </div>
                <div class="item-gpa">${student.gpa}</div>
            </div>`;
    });

    tempCont.innerHTML = '';
    [...temp].reverse().forEach((student) => {
        tempCont.innerHTML += `
            <div class="stack-item temp-item">
                <div>
                    <div class="item-id">Buffer ID:</div>
                    <div class="item-name">${student.id}</div>
                </div>
            </div>`;
    });
    
    updateTopBorders();
}

function updateTopBorders() {
    const mainCont = document.getElementById('main-container');
    const tempCont = document.getElementById('temp-container');
    
    Array.from(mainCont.children).forEach(c => c.classList.remove('top'));
    if(mainCont.firstElementChild) {
        mainCont.firstElementChild.classList.add('top');
        mainCont.scrollTop = 0; 
    }
    
    Array.from(tempCont.children).forEach(c => c.classList.remove('top-t'));
    if(tempCont.firstElementChild) {
        tempCont.firstElementChild.classList.add('top-t');
        tempCont.scrollTop = 0; 
    }
}

async function addStudent() {
    if (isSystemBusy) return showMessage('⏳ Hệ thống đang bận xử lý...', true);
    
    const id = document.getElementById('stuId').value.trim();
    const name = document.getElementById('stuName').value.trim();
    const gpa = document.getElementById('stuGpa').value.trim();
    const isStep = document.getElementById('stepMode').checked;

    if (!id || !name || !gpa) return showMessage('Vui lòng nhập đủ thông tin!', true);

    isSystemBusy = true; 
    opsCount = 0; 
    document.getElementById('ping-pong-count').innerText = 0;

    try {
        if(isStep) {
            let mainCont = document.getElementById('main-container');
            let tempCont = document.getElementById('temp-container');
            let found = false;

            if (mainCont.children.length > 0) {
                showMessage('⏳ Chạy "Silent Search" kiểm tra trùng lặp ID...');
                await sleep(800);
            }

            while(mainCont.children.length > 0) {
                let item = mainCont.firstElementChild;
                let idText = item.querySelector('.item-id').innerText.trim();
                
                tempCont.prepend(item); 
                item.classList.add('temp-item');
                updateTopBorders();
                updateOpsCount(); 
                await sleep(400); 

                if(idText === id) { 
                    found = true;
                    break;
                }
            }
            
            if (mainCont.children.length > 0 || tempCont.children.length > 0) {
                showMessage(found ? '❌ Phát hiện trùng lặp! Khôi phục Main...' : '✅ ID hợp lệ! Khôi phục Main...');
                await sleep(600);
            }

            while(tempCont.children.length > 0) {
                let item = tempCont.firstElementChild;
                mainCont.prepend(item);
                item.classList.remove('temp-item');
                updateTopBorders();
                updateOpsCount(); 
                await sleep(400);
            }

            if (found) {
                showMessage('❌ Lỗi: ID đã tồn tại trong hệ thống!', true);
                isSystemBusy = false;
                return; 
            }
        }

        const res = await fetch('/api/add', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name, gpa })
        });
        const data = await res.json();
        
        showMessage(data.message, data.status === 'error');
        if (data.status === 'success') {
            document.getElementById('stuId').value = '';
            document.getElementById('stuName').value = '';
            document.getElementById('stuGpa').value = '';
            await fetchStacks(); 
        }
    } finally {
        isSystemBusy = false; 
    }
}

async function deleteStudent() {
    if (isSystemBusy) return showMessage('⏳ Hệ thống đang bận xử lý...', true);

    const id = document.getElementById('delId').value.trim();
    const isStep = document.getElementById('stepMode').checked;

    if (!id) return showMessage('Vui lòng nhập ID cần xóa!', true);

    isSystemBusy = true;
    opsCount = 0; 
    document.getElementById('ping-pong-count').innerText = 0;

    try {
        if(isStep) {
            showMessage('⏳ Bước 1: Popping sang Temp để tìm kiếm...');
            let mainCont = document.getElementById('main-container');
            let tempCont = document.getElementById('temp-container');
            
            while(mainCont.children.length > 0) {
                let item = mainCont.firstElementChild;
                let idText = item.querySelector('.item-id').innerText.trim();
                
                if(idText === id) {
                    item.remove(); 
                    showMessage(`✅ Đã vứt bỏ ID ${id}. Bước 2: Đổ ngược về Main...`);
                    updateTopBorders();
                    await sleep(1000);
                    break;
                } else {
                    tempCont.prepend(item);
                    item.classList.add('temp-item');
                    updateTopBorders();
                    updateOpsCount(); 
                    await sleep(400);
                }
            }
            
            while(tempCont.children.length > 0) {
                let item = tempCont.firstElementChild;
                mainCont.prepend(item);
                item.classList.remove('temp-item');
                updateTopBorders();
                updateOpsCount(); 
                await sleep(400);
            }
        }

        const res = await fetch('/api/delete', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await res.json();
        
        showMessage(data.message, data.status === 'error');
        if (data.status === 'success') document.getElementById('delId').value = '';
        await fetchStacks();
    } finally {
        isSystemBusy = false;
    }
}

async function sortStack() {
    if (isSystemBusy) return showMessage('⏳ Hệ thống đang bận xử lý...', true);

    const isStep = document.getElementById('stepMode').checked;
    isSystemBusy = true;
    opsCount = 0; 
    document.getElementById('ping-pong-count').innerText = 0;

    try {
        if(isStep) {
            showMessage('⏳ Bắt đầu Dual-Stack Insertion Sort...');
            let mainCont = document.getElementById('main-container');
            let tempCont = document.getElementById('temp-container');
            
            while(mainCont.children.length > 0) {
                let current = mainCont.firstElementChild;
                let currentGpa = parseFloat(current.querySelector('.item-gpa').innerText);
                
                mainCont.removeChild(current);
                current.classList.add('temp-item');
                updateOpsCount(); 
                
                while(tempCont.children.length > 0) {
                    let topTemp = tempCont.firstElementChild;
                    let topTempGpa = parseFloat(topTemp.querySelector('.item-gpa').innerText);
                    
                    if(topTempGpa < currentGpa) {
                        mainCont.prepend(topTemp);
                        topTemp.classList.remove('temp-item');
                        updateOpsCount(); 
                        showMessage(`🔄 Trả GPA ${topTempGpa} về Main vì nhỏ hơn ${currentGpa}`);
                        updateTopBorders();
                        await sleep(600);
                    } else {
                        break;
                    }
                }
                
                tempCont.prepend(current);
                updateTopBorders();
                await sleep(600);
            }
            
            showMessage('✅ Phân loại xong. Đang đổ từ Temp về Main...');
            while(tempCont.children.length > 0) {
                let item = tempCont.firstElementChild;
                mainCont.prepend(item);
                item.classList.remove('temp-item');
                updateTopBorders();
                updateOpsCount(); 
                await sleep(400);
            }
        }

        const res = await fetch('/api/sort', { method: 'POST' });
        const data = await res.json();
        showMessage(data.message);
        await fetchStacks();
    } finally {
        isSystemBusy = false;
    }
}

const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
const cubes = [];
const numCubes = 50;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const colors = [
    { fill: '#e6f0ff', stroke: '#0066ff' }, 
    { fill: '#fdfbfb', stroke: '#ddd' }, 
    { fill: '#fdf3f8', stroke: '#ff3366' }, 
    { fill: '#f5fdfc', stroke: '#00d4ff' }, 
    { fill: '#e0c3fc', stroke: '#c77dff' }  
];

class Cube {
    constructor() { this.reset(); }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * 5 + 1; 
        this.baseSize = Math.random() * 20 + 10;
        this.size = this.baseSize * (this.z / 3); 
        this.opacity = Math.random() * 0.4 + 0.1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedX = (Math.random() - 0.5) * 0.3 * this.z;
        this.speedY = (Math.random() - 1) * 0.5 * this.z; 
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.005;
        this.time = Math.random() * 1000;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        this.time += 0.05;
        this.opacity = (Math.sin(this.time) * 0.15 + 0.2) * (this.z / 3);
        if (this.y < -this.size * 2 || this.x < -this.size * 2 || this.x > canvas.width + this.size * 2) {
            this.reset();
            this.y = canvas.height + this.size; 
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        const s = this.size;
        const h = s * 0.4; 

        ctx.fillStyle = this.color.stroke;
        ctx.fillRect(-s/2, -s/2, s, s);

        ctx.fillStyle = this.color.fill;
        ctx.beginPath();
        ctx.moveTo(-s/2, -s/2); ctx.lineTo(-s/2 - h, -s/2 + h); ctx.lineTo(-s/2 - h, s/2 + h); ctx.lineTo(-s/2, s/2);
        ctx.closePath(); ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-s/2, s/2); ctx.lineTo(-s/2 - h, s/2 + h); ctx.lineTo(s/2 - h, s/2 + h); ctx.lineTo(s/2, s/2);
        ctx.closePath(); ctx.fill();

        ctx.translate(-h, h); 
        ctx.fillStyle = this.color.fill;
        ctx.fillRect(-s/2, -s/2, s, s);
        ctx.lineWidth = 1; ctx.strokeStyle = this.color.stroke; ctx.strokeRect(-s/2, -s/2, s, s);
        ctx.restore();
    }
}

function initCubes() { for (let i = 0; i < numCubes; i++) cubes.push(new Cube()); }
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < cubes.length; i++) { cubes[i].update(); cubes[i].draw(ctx); }
    requestAnimationFrame(animate);
}

initCubes();
animate();