const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');

let fireworks = [];
let particles = [];
let hearts = [];
let confetti = [];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

class Firework {
    constructor(x, y) {
        this.x = x;
        this.y = canvas.height;
        this.targetY = y;
        this.speed = 5;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    }

    update() {
        if (this.y > this.targetY) {
            this.y -= this.speed;
            return true;
        }
        return false;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8
        };
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.velocity.y += 0.1;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
        return this.alpha > 0;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

class Heart {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20;
        this.size = Math.random() * 20 + 10;
        this.speed = Math.random() * 2 + 1;
        this.alpha = 1;
    }

    update() {
        this.y -= this.speed;
        this.x += Math.sin(this.y / 50) * 2;
        if (this.y < -50) this.alpha -= 0.01;
        return this.alpha > 0;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.font = `${this.size}px Arial`;
        ctx.fillText('❤️', this.x, this.y);
        ctx.restore();
    }
}

class Confetti {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = Math.random() * 10 + 5;
        this.speed = Math.random() * 3 + 2;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
    }

    update() {
        this.y += this.speed;
        this.x += Math.sin(this.y / 50) * 1;
        this.rotation += this.rotationSpeed;
        return this.y < canvas.height + 20;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

function createFirework() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.5 + 50;
    fireworks.push(new Firework(x, y));
}

function explode(x, y, color) {
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fireworks = fireworks.filter(fw => {
        const alive = fw.update();
        fw.draw();
        if (!alive) {
            explode(fw.x, fw.y, fw.color);
        }
        return alive;
    });

    particles = particles.filter(p => {
        const alive = p.update();
        p.draw();
        return alive;
    });

    hearts = hearts.filter(h => {
        const alive = h.update();
        h.draw();
        return alive;
    });

    confetti = confetti.filter(c => {
        const alive = c.update();
        c.draw();
        return alive;
    });

    requestAnimationFrame(animate);
}

let animationInterval;

function startCelebration() {
    const modal = document.getElementById('birthdayModal');
    modal.classList.add('active');

    animationInterval = setInterval(() => {
        createFirework();
        if (Math.random() > 0.7) hearts.push(new Heart());
        if (Math.random() > 0.8) confetti.push(new Confetti());
    }, 300);

    animate();
}

document.addEventListener('DOMContentLoaded', () => {
    const heartTrigger = document.querySelector('.secret-heart-trigger');
    if (heartTrigger) {
        heartTrigger.addEventListener('click', startCelebration);
    }
});

document.querySelector('.close-birthday-btn').addEventListener('click', () => {
    const modal = document.getElementById('birthdayModal');
    modal.classList.remove('active');
    clearInterval(animationInterval);
    fireworks = [];
    particles = [];
    hearts = [];
    confetti = [];
});