// Cat Hatcher - Idle clicker egg hatching game with battle system
class CatHatcher {
    constructor() {
        this.name = 'Cat Hatcher';
        this.saveKey = 'cathatcher-save';
        this.breeds = [
            { id: 0, name: 'Tabby', emoji: '🐱', rarity: 'common' },
            { id: 1, name: 'Tuxedo', emoji: '🐈', rarity: 'common' },
            { id: 2, name: 'Orange', emoji: '🟠', rarity: 'common' },
            { id: 3, name: 'Gray', emoji: '🩶', rarity: 'common' },
            { id: 4, name: 'Siamese', emoji: '🐾', rarity: 'rare' },
            { id: 5, name: 'Calico', emoji: '🎨', rarity: 'rare' },
            { id: 6, name: 'Persian', emoji: '👑', rarity: 'rare' },
            { id: 7, name: 'Maine Coon', emoji: '🦁', rarity: 'rare' },
            { id: 8, name: 'Bengal', emoji: '🐆', rarity: 'epic' },
            { id: 9, name: 'Ragdoll', emoji: '🧸', rarity: 'epic' },
            { id: 10, name: 'Sphynx', emoji: '👽', rarity: 'epic' },
            { id: 11, name: 'Scottish Fold', emoji: '🏴', rarity: 'epic' },
            { id: 12, name: 'Snow Leopard', emoji: '❄️', rarity: 'legendary' },
            { id: 13, name: 'Golden', emoji: '✨', rarity: 'legendary' },
            { id: 14, name: 'Cosmic', emoji: '🌌', rarity: 'legendary' }
        ];
        this.rarityConfig = {
            common:    { income: 1, eggCost: 50, statMin: 1, statMax: 5, color: '#a0a0a0' },
            rare:      { income: 5, eggCost: 500, statMin: 3, statMax: 8, color: '#4fc3f7' },
            epic:      { income: 25, eggCost: 5000, statMin: 5, statMax: 12, color: '#ce93d8' },
            legendary: { income: 100, eggCost: 50000, statMin: 8, statMax: 18, color: '#ffd54f' }
        };
        this.upgradesDef = [
            { id: 'clickPower', name: 'Click Power', desc: '+1 click energy', baseCost: 100, scaling: 1.5 },
            { id: 'hatchSpeed', name: 'Hatch Speed', desc: '+1% passive hatch/s', baseCost: 200, scaling: 1.6 },
            { id: 'incomeBoost', name: 'Income Boost', desc: '+10% coin income', baseCost: 500, scaling: 1.8 }
        ];
        this.activeTab = 'hatch';
        this.incomeTimer = null;
        this.hatchTimer = null;
        this.cooldownTimer = null;
        this.battleTimeout = null;
        this.nextCatId = 1;
        this.loadState();
    }

    defaultState() {
        return {
            coins: 100,
            ownedCats: [],
            currentEgg: { rarity: 'common', progress: 0 },
            upgrades: { clickPower: 0, hatchSpeed: 0, incomeBoost: 0 },
            breedCounts: {},
            nextCatId: 1,
            lastOnline: Date.now()
        };
    }

    loadState() {
        try {
            const raw = localStorage.getItem(this.saveKey);
            if (raw) {
                const s = JSON.parse(raw);
                const def = this.defaultState();
                this.coins = s.coins ?? def.coins;
                this.ownedCats = s.ownedCats ?? def.ownedCats;
                this.currentEgg = s.currentEgg ?? def.currentEgg;
                this.upgrades = s.upgrades ?? def.upgrades;
                this.breedCounts = s.breedCounts ?? def.breedCounts;
                this.nextCatId = s.nextCatId ?? def.nextCatId;
                this.lastOnline = s.lastOnline ?? Date.now();
                // Calculate offline earnings
                const elapsed = Math.min(Date.now() - this.lastOnline, 8 * 60 * 60 * 1000);
                const offlineIncome = this.calcIncomePerSec() * (elapsed / 1000);
                if (offlineIncome > 0) {
                    this.coins += Math.floor(offlineIncome);
                    this.offlineEarnings = Math.floor(offlineIncome);
                }
            } else {
                Object.assign(this, this.defaultState());
            }
        } catch {
            Object.assign(this, this.defaultState());
        }
    }

    saveState() {
        localStorage.setItem(this.saveKey, JSON.stringify({
            coins: this.coins,
            ownedCats: this.ownedCats,
            currentEgg: this.currentEgg,
            upgrades: this.upgrades,
            breedCounts: this.breedCounts,
            nextCatId: this.nextCatId,
            lastOnline: Date.now()
        }));
    }

    calcIncomePerSec() {
        const boost = 1 + this.upgrades.incomeBoost * 0.1;
        let total = 0;
        for (const cat of this.ownedCats) {
            const breed = this.breeds[cat.breedId];
            total += this.rarityConfig[breed.rarity].income;
        }
        return total * boost;
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.battleState = null;
        this.selectedBattle = [null, null];
        this.injectStyles();
        this.render();
        this.startTimers();
        if (this.offlineEarnings && this.offlineEarnings > 0) {
            setTimeout(() => {
                this.showNotification(`Welcome back! Earned ${this.formatNum(this.offlineEarnings)} coins while away.`);
                this.offlineEarnings = 0;
            }, 300);
        }
    }

    cleanup() {
        if (this.incomeTimer) clearInterval(this.incomeTimer);
        if (this.hatchTimer) clearInterval(this.hatchTimer);
        if (this.cooldownTimer) clearInterval(this.cooldownTimer);
        if (this.battleTimeout) clearTimeout(this.battleTimeout);
        this.saveState();
        const style = document.getElementById('cathatcher-styles');
        if (style) style.remove();
    }

    startTimers() {
        // Income tick every second
        this.incomeTimer = setInterval(() => {
            const inc = this.calcIncomePerSec();
            if (inc > 0) {
                this.coins += inc / 10; // tick 10x/s for smooth display
                this.coins = Math.floor(this.coins * 100) / 100;
                this.saveState();
                this.updateStatus();
            }
        }, 100);
        // Passive hatch speed
        this.hatchTimer = setInterval(() => {
            if (this.currentEgg && this.upgrades.hatchSpeed > 0) {
                this.currentEgg.progress = Math.min(100, this.currentEgg.progress + this.upgrades.hatchSpeed);
                if (this.activeTab === 'hatch') this.renderHatch();
                if (this.currentEgg.progress >= 100) this.hatchEgg();
            }
        }, 1000);
        // Cooldown tick
        this.cooldownTimer = setInterval(() => {
            let changed = false;
            for (const cat of this.ownedCats) {
                if (cat.trainingCooldown > 0) {
                    cat.trainingCooldown--;
                    changed = true;
                }
            }
            if (changed && this.activeTab === 'cats') this.renderCats();
        }, 1000);
    }

    formatNum(n) {
        if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return Math.floor(n).toString();
    }

    showNotification(msg) {
        const el = document.getElementById('ch-notification');
        if (!el) return;
        el.textContent = msg;
        el.style.display = 'block';
        el.style.opacity = '1';
        setTimeout(() => { el.style.opacity = '0'; setTimeout(() => { el.style.display = 'none'; }, 400); }, 2500);
    }

    updateStatus() {
        if (!this.statusArea) return;
        const income = this.calcIncomePerSec();
        this.statusArea.textContent = `🪙 ${this.formatNum(this.coins)} | 🐱 ${this.ownedCats.length} cats | 💰 ${this.formatNum(income)}/s`;
    }

    render() {
        this.updateStatus();
        this.controlsArea.innerHTML = '';
        // Tab bar
        const tabs = ['hatch', 'cats', 'shop', 'upgrades', 'battle'];
        const tabLabels = { hatch: '🥚 Hatch', cats: '🐱 Cats', shop: '🛒 Shop', upgrades: '⬆️ Upgrades', battle: '⚔️ Battle' };
        let html = '<div class="ch-tabs">';
        for (const t of tabs) {
            html += `<button class="ch-tab ${t === this.activeTab ? 'ch-tab-active' : ''}" data-tab="${t}">${tabLabels[t]}</button>`;
        }
        html += '</div><div id="ch-notification" class="ch-notification" style="display:none"></div><div id="ch-content" class="ch-content"></div>';
        this.gameArea.innerHTML = html;

        this.gameArea.querySelectorAll('.ch-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeTab = btn.dataset.tab;
                this.render();
            });
        });

        this.renderTab();
    }

    renderTab() {
        const c = document.getElementById('ch-content');
        if (!c) return;
        switch (this.activeTab) {
            case 'hatch': this.renderHatch(c); break;
            case 'cats': this.renderCats(c); break;
            case 'shop': this.renderShop(c); break;
            case 'upgrades': this.renderUpgrades(c); break;
            case 'battle': this.renderBattle(c); break;
        }
    }

    renderHatch(container) {
        const c = container || document.getElementById('ch-content');
        if (!c) return;
        const egg = this.currentEgg;
        const cfg = this.rarityConfig[egg.rarity];
        const pct = Math.min(100, egg.progress).toFixed(1);
        const crackClass = pct >= 75 ? 'ch-crack-3' : pct >= 50 ? 'ch-crack-2' : pct >= 25 ? 'ch-crack-1' : '';
        c.innerHTML = `
            <div class="ch-hatch-area">
                <div class="ch-egg-container">
                    <div class="ch-egg ${crackClass}" id="ch-egg" style="--rarity-color: ${cfg.color}">
                        🥚
                        ${pct >= 25 ? '<div class="ch-crack-overlay">🔨</div>' : ''}
                    </div>
                    <div class="ch-egg-label">${egg.rarity.toUpperCase()} EGG</div>
                </div>
                <div class="ch-progress-bar">
                    <div class="ch-progress-fill" style="width: ${pct}%; background: ${cfg.color}"></div>
                    <span class="ch-progress-text">${pct}%</span>
                </div>
                <div class="ch-click-info">Tap the egg! Click Power: ${1 + this.upgrades.clickPower} | Passive: ${this.upgrades.hatchSpeed}%/s</div>
            </div>
        `;
        document.getElementById('ch-egg')?.addEventListener('click', () => this.clickEgg());
    }

    clickEgg() {
        const power = 1 + this.upgrades.clickPower;
        this.currentEgg.progress = Math.min(100, this.currentEgg.progress + power);
        // Wobble animation
        const el = document.getElementById('ch-egg');
        if (el) {
            el.classList.add('ch-wobble');
            setTimeout(() => el.classList.remove('ch-wobble'), 300);
        }
        if (this.currentEgg.progress >= 100) {
            this.hatchEgg();
        } else {
            this.renderHatch();
        }
        this.saveState();
    }

    hatchEgg() {
        const rarity = this.currentEgg.rarity;
        const available = this.breeds.filter(b => b.rarity === rarity);
        const breed = available[Math.floor(Math.random() * available.length)];
        const cfg = this.rarityConfig[rarity];
        const rollStat = () => cfg.statMin + Math.floor(Math.random() * (cfg.statMax - cfg.statMin + 1));
        const count = (this.breedCounts[breed.id] || 0) + 1;
        this.breedCounts[breed.id] = count;
        const cat = {
            id: this.nextCatId++,
            breedId: breed.id,
            name: `${breed.name} #${count}`,
            stats: { atk: rollStat(), def: rollStat(), spd: rollStat(), lck: rollStat() },
            victories: 0,
            trainingCooldown: 0
        };
        this.ownedCats.push(cat);
        this.currentEgg = { rarity: 'common', progress: 0 };
        this.saveState();
        this.showHatchResult(cat, breed);
    }

    showHatchResult(cat, breed) {
        const c = document.getElementById('ch-content');
        if (!c) return;
        const cfg = this.rarityConfig[breed.rarity];
        c.innerHTML = `
            <div class="ch-hatch-result" style="--rarity-color: ${cfg.color}">
                <div class="ch-hatched-emoji">${breed.emoji}</div>
                <h2 style="color: ${cfg.color}">${cat.name}</h2>
                <div class="ch-rarity-badge" style="background: ${cfg.color}">${breed.rarity.toUpperCase()}</div>
                <div class="ch-stats-row">
                    <span>⚔️ ${cat.stats.atk}</span>
                    <span>🛡️ ${cat.stats.def}</span>
                    <span>💨 ${cat.stats.spd}</span>
                    <span>🍀 ${cat.stats.lck}</span>
                </div>
                <button class="ch-btn ch-btn-primary" id="ch-continue">Continue</button>
            </div>
        `;
        document.getElementById('ch-continue')?.addEventListener('click', () => this.renderHatch());
    }

    renderCats(container) {
        const c = container || document.getElementById('ch-content');
        if (!c) return;
        if (this.ownedCats.length === 0) {
            c.innerHTML = '<div class="ch-empty">No cats yet! Hatch an egg to get started.</div>';
            return;
        }
        let html = '<div class="ch-cats-grid">';
        for (const cat of this.ownedCats) {
            const breed = this.breeds[cat.breedId];
            const cfg = this.rarityConfig[breed.rarity];
            const cd = cat.trainingCooldown > 0;
            html += `
                <div class="ch-cat-card" style="border-color: ${cfg.color}">
                    <div class="ch-cat-emoji">${breed.emoji}</div>
                    <div class="ch-cat-name">${cat.name}</div>
                    <div class="ch-rarity-badge ch-badge-sm" style="background: ${cfg.color}">${breed.rarity}</div>
                    <div class="ch-cat-stats">
                        <span>⚔️${cat.stats.atk}</span> <span>🛡️${cat.stats.def}</span>
                        <span>💨${cat.stats.spd}</span> <span>🍀${cat.stats.lck}</span>
                    </div>
                    <div class="ch-cat-victories">🏆 ${cat.victories}</div>
                    ${cd ? `<div class="ch-cooldown">⏱️ ${cat.trainingCooldown}s</div>` : `
                        <div class="ch-train-btns">
                            <button class="ch-btn ch-btn-sm" data-train="${cat.id}" data-stat="atk">⚔️ Train</button>
                            <button class="ch-btn ch-btn-sm" data-train="${cat.id}" data-stat="def">🛡️ Train</button>
                            <button class="ch-btn ch-btn-sm" data-train="${cat.id}" data-stat="spd">💨 Train</button>
                            <button class="ch-btn ch-btn-sm" data-train="${cat.id}" data-stat="lck">🍀 Train</button>
                        </div>
                    `}
                </div>
            `;
        }
        html += '</div>';
        c.innerHTML = html;

        c.querySelectorAll('[data-train]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.trainCat(parseInt(btn.dataset.train), btn.dataset.stat);
            });
        });
    }

    trainCat(catId, stat) {
        const cat = this.ownedCats.find(c => c.id === catId);
        if (!cat || cat.trainingCooldown > 0) return;
        const totalStats = cat.stats.atk + cat.stats.def + cat.stats.spd + cat.stats.lck;
        const cost = 10 + totalStats * 5;
        if (this.coins < cost) {
            this.showNotification(`Need ${this.formatNum(cost)} coins to train!`);
            return;
        }
        this.coins -= cost;
        const gain = 1 + Math.floor(Math.random() * 3);
        cat.stats[stat] += gain;
        cat.trainingCooldown = 60;
        this.saveState();
        this.updateStatus();
        this.showNotification(`${cat.name}: ${stat.toUpperCase()} +${gain}! (Cost: ${cost})`);
        this.renderCats();
    }

    renderShop(container) {
        const c = container || document.getElementById('ch-content');
        if (!c) return;
        const rarities = ['common', 'rare', 'epic', 'legendary'];
        const eggEmojis = { common: '🥚', rare: '🔵', epic: '🟣', legendary: '🌟' };
        let html = '<div class="ch-shop-grid">';
        for (const r of rarities) {
            const cfg = this.rarityConfig[r];
            const canBuy = this.coins >= cfg.eggCost;
            html += `
                <div class="ch-shop-card" style="border-color: ${cfg.color}">
                    <div class="ch-shop-emoji">${eggEmojis[r]}</div>
                    <div class="ch-shop-name">${r.toUpperCase()} EGG</div>
                    <div class="ch-shop-cost">🪙 ${this.formatNum(cfg.eggCost)}</div>
                    <button class="ch-btn ${canBuy ? 'ch-btn-primary' : 'ch-btn-disabled'}" data-buy="${r}" ${canBuy ? '' : 'disabled'}>Buy</button>
                </div>
            `;
        }
        html += '</div>';
        c.innerHTML = html;
        c.querySelectorAll('[data-buy]').forEach(btn => {
            btn.addEventListener('click', () => this.buyEgg(btn.dataset.buy));
        });
    }

    buyEgg(rarity) {
        const cost = this.rarityConfig[rarity].eggCost;
        if (this.coins < cost) return;
        this.coins -= cost;
        this.currentEgg = { rarity, progress: 0 };
        this.saveState();
        this.updateStatus();
        this.activeTab = 'hatch';
        this.render();
        this.showNotification(`Bought a ${rarity} egg!`);
    }

    renderUpgrades(container) {
        const c = container || document.getElementById('ch-content');
        if (!c) return;
        let html = '<div class="ch-upgrades-grid">';
        for (const u of this.upgradesDef) {
            const lvl = this.upgrades[u.id];
            const cost = Math.floor(u.baseCost * Math.pow(u.scaling, lvl));
            const canBuy = this.coins >= cost;
            html += `
                <div class="ch-upgrade-card">
                    <div class="ch-upgrade-name">${u.name}</div>
                    <div class="ch-upgrade-desc">${u.desc}</div>
                    <div class="ch-upgrade-level">Level ${lvl}</div>
                    <div class="ch-upgrade-cost">🪙 ${this.formatNum(cost)}</div>
                    <button class="ch-btn ${canBuy ? 'ch-btn-primary' : 'ch-btn-disabled'}" data-upgrade="${u.id}" ${canBuy ? '' : 'disabled'}>Upgrade</button>
                </div>
            `;
        }
        html += '</div>';
        c.innerHTML = html;
        c.querySelectorAll('[data-upgrade]').forEach(btn => {
            btn.addEventListener('click', () => this.buyUpgrade(btn.dataset.upgrade));
        });
    }

    buyUpgrade(id) {
        const def = this.upgradesDef.find(u => u.id === id);
        const lvl = this.upgrades[id];
        const cost = Math.floor(def.baseCost * Math.pow(def.scaling, lvl));
        if (this.coins < cost) return;
        this.coins -= cost;
        this.upgrades[id]++;
        this.saveState();
        this.updateStatus();
        this.renderUpgrades();
    }

    // === BATTLE SYSTEM ===
    renderBattle(container) {
        const c = container || document.getElementById('ch-content');
        if (!c) return;
        if (this.ownedCats.length < 2) {
            c.innerHTML = '<div class="ch-empty">Need at least 2 cats to battle!</div>';
            return;
        }
        if (this.battleState && this.battleState.active) {
            this.renderBattleArena(c);
            return;
        }

        let html = '<div class="ch-battle-setup">';
        html += '<h3 class="ch-section-title">Choose Cat 1</h3><div class="ch-battle-picker" id="ch-picker1">';
        html += this.renderCatPicker(0);
        html += '</div><h3 class="ch-section-title">Choose Cat 2</h3><div class="ch-battle-picker" id="ch-picker2">';
        html += this.renderCatPicker(1);
        html += '</div>';
        const ready = this.selectedBattle[0] !== null && this.selectedBattle[1] !== null && this.selectedBattle[0] !== this.selectedBattle[1];
        html += `<button class="ch-btn ch-btn-primary ch-btn-lg ${ready ? '' : 'ch-btn-disabled'}" id="ch-fight" ${ready ? '' : 'disabled'}>⚔️ Fight!</button>`;
        html += '</div>';
        c.innerHTML = html;

        c.querySelectorAll('[data-pick]').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = parseInt(btn.dataset.slot);
                const catId = parseInt(btn.dataset.pick);
                this.selectedBattle[slot] = catId;
                this.renderBattle();
            });
        });
        document.getElementById('ch-fight')?.addEventListener('click', () => this.startBattle());
    }

    renderCatPicker(slot) {
        let html = '';
        for (const cat of this.ownedCats) {
            const breed = this.breeds[cat.breedId];
            const cfg = this.rarityConfig[breed.rarity];
            const selected = this.selectedBattle[slot] === cat.id;
            const otherSelected = this.selectedBattle[1 - slot] === cat.id;
            html += `<button class="ch-pick-btn ${selected ? 'ch-pick-selected' : ''} ${otherSelected ? 'ch-pick-other' : ''}"
                data-pick="${cat.id}" data-slot="${slot}" style="border-color: ${cfg.color}">
                ${breed.emoji} ${cat.name}
            </button>`;
        }
        return html;
    }

    rollD20() {
        return 1 + Math.floor(Math.random() * 20);
    }

    startBattle() {
        const cat1 = this.ownedCats.find(c => c.id === this.selectedBattle[0]);
        const cat2 = this.ownedCats.find(c => c.id === this.selectedBattle[1]);
        if (!cat1 || !cat2) return;

        const hp1 = 20 + cat1.stats.def * 2;
        const hp2 = 20 + cat2.stats.def * 2;

        // Initiative
        const init1 = this.rollD20() + cat1.stats.spd;
        const init2 = this.rollD20() + cat2.stats.spd;

        this.battleState = {
            active: true,
            fighters: [
                { cat: cat1, hp: hp1, maxHp: hp1, name: cat1.name },
                { cat: cat2, hp: hp2, maxHp: hp2, name: cat2.name }
            ],
            turn: init1 >= init2 ? 0 : 1,
            log: [`⚔️ BATTLE START!`, `${cat1.name} (SPD ${cat1.stats.spd}+${init1 - cat1.stats.spd}=${init1}) vs ${cat2.name} (SPD ${cat2.stats.spd}+${init2 - cat2.stats.spd}=${init2})`, `${init1 >= init2 ? cat1.name : cat2.name} goes first!`, ''],
            winner: null,
            round: 1
        };
        this.renderBattle();
        this.battleTimeout = setTimeout(() => this.executeTurn(), 1000);
    }

    executeTurn() {
        const bs = this.battleState;
        if (!bs || !bs.active) return;
        const atkIdx = bs.turn;
        const defIdx = 1 - atkIdx;
        const attacker = bs.fighters[atkIdx];
        const defender = bs.fighters[defIdx];

        bs.log.push(`--- Round ${bs.round} ---`);

        const atkRoll = this.rollD20();
        const defRoll = this.rollD20();
        const atkCrit = atkRoll <= attacker.cat.stats.lck;
        const defCrit = defRoll <= defender.cat.stats.lck;
        const atkVal = (atkCrit ? atkRoll * 2 : atkRoll) + attacker.cat.stats.atk;
        const defVal = (defCrit ? defRoll * 2 : defRoll) + defender.cat.stats.def;

        let logLine = `${attacker.name} rolls ${atkRoll}${atkCrit ? ' 🍀CRIT!' : ''}+${attacker.cat.stats.atk}ATK=${atkVal}`;
        logLine += ` vs ${defender.name} ${defRoll}${defCrit ? ' 🍀CRIT!' : ''}+${defender.cat.stats.def}DEF=${defVal}`;

        if (atkVal > defVal) {
            const dmg = Math.max(1, atkVal - defVal);
            defender.hp = Math.max(0, defender.hp - dmg);
            logLine += ` → HIT! ${dmg} damage!`;
        } else {
            logLine += ` → BLOCKED!`;
        }
        bs.log.push(logLine);
        bs.log.push(`${defender.name}: ${defender.hp}/${defender.maxHp} HP`);
        bs.log.push('');

        if (defender.hp <= 0) {
            bs.active = false;
            bs.winner = atkIdx;
            attacker.cat.victories++;
            this.saveState();
            bs.log.push(`🏆 ${attacker.name} WINS!`);
            this.renderBattle();
            return;
        }

        bs.turn = defIdx;
        bs.round++;
        this.renderBattle();
        this.battleTimeout = setTimeout(() => this.executeTurn(), 1500);
    }

    renderBattleArena(container) {
        const c = container || document.getElementById('ch-content');
        if (!c) return;
        const bs = this.battleState;
        const f0 = bs.fighters[0];
        const f1 = bs.fighters[1];
        const b0 = this.breeds[f0.cat.breedId];
        const b1 = this.breeds[f1.cat.breedId];

        let html = `<div class="ch-arena">
            <div class="ch-arena-fighters">
                <div class="ch-fighter ${bs.winner === 0 ? 'ch-fighter-winner' : bs.winner === 1 ? 'ch-fighter-loser' : ''}">
                    <div class="ch-fighter-emoji">${b0.emoji}</div>
                    <div class="ch-fighter-name">${f0.name}</div>
                    <div class="ch-hp-bar"><div class="ch-hp-fill" style="width:${(f0.hp / f0.maxHp) * 100}%; background: ${f0.hp / f0.maxHp > 0.5 ? '#4caf50' : f0.hp / f0.maxHp > 0.25 ? '#ff9800' : '#f44336'}"></div></div>
                    <div class="ch-hp-text">${f0.hp}/${f0.maxHp}</div>
                </div>
                <div class="ch-vs">VS</div>
                <div class="ch-fighter ${bs.winner === 1 ? 'ch-fighter-winner' : bs.winner === 0 ? 'ch-fighter-loser' : ''}">
                    <div class="ch-fighter-emoji">${b1.emoji}</div>
                    <div class="ch-fighter-name">${f1.name}</div>
                    <div class="ch-hp-bar"><div class="ch-hp-fill" style="width:${(f1.hp / f1.maxHp) * 100}%; background: ${f1.hp / f1.maxHp > 0.5 ? '#4caf50' : f1.hp / f1.maxHp > 0.25 ? '#ff9800' : '#f44336'}"></div></div>
                    <div class="ch-hp-text">${f1.hp}/${f1.maxHp}</div>
                </div>
            </div>
            <div class="ch-battle-log" id="ch-log">${bs.log.map(l => `<div>${l || '&nbsp;'}</div>`).join('')}</div>`;
        if (bs.winner !== null) {
            html += `<button class="ch-btn ch-btn-primary ch-btn-lg" id="ch-battle-again">⚔️ Battle Again</button>`;
        }
        html += '</div>';
        c.innerHTML = html;

        const log = document.getElementById('ch-log');
        if (log) log.scrollTop = log.scrollHeight;

        document.getElementById('ch-battle-again')?.addEventListener('click', () => {
            this.battleState = null;
            this.selectedBattle = [null, null];
            this.renderBattle();
        });
    }

    injectStyles() {
        if (document.getElementById('cathatcher-styles')) return;
        const style = document.createElement('style');
        style.id = 'cathatcher-styles';
        style.textContent = `
            .ch-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
            .ch-tab { padding: 8px 12px; border: none; border-radius: 8px; background: var(--surface, #2a2a3e); color: var(--text, #e0e0e0); cursor: pointer; font-size: 13px; flex: 1; min-width: 60px; text-align: center; transition: background 0.2s; }
            .ch-tab-active { background: var(--pink, #f9a8d4); color: #1a1a2e; font-weight: bold; }
            .ch-content { min-height: 300px; }
            .ch-notification { background: var(--lavender, #c084fc); color: #1a1a2e; padding: 8px 16px; border-radius: 8px; text-align: center; margin-bottom: 8px; font-weight: bold; transition: opacity 0.4s; }
            .ch-empty { text-align: center; padding: 40px 20px; color: var(--text-secondary, #aaa); font-size: 16px; }

            /* Hatch */
            .ch-hatch-area { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 20px 0; }
            .ch-egg-container { text-align: center; }
            .ch-egg { font-size: 120px; cursor: pointer; user-select: none; transition: transform 0.1s; filter: drop-shadow(0 0 20px var(--rarity-color)); line-height: 1.2; }
            .ch-egg:active { transform: scale(0.9); }
            .ch-wobble { animation: ch-wobble 0.3s ease; }
            @keyframes ch-wobble { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-10deg); } 75% { transform: rotate(10deg); } }
            .ch-crack-1 { filter: drop-shadow(0 0 20px var(--rarity-color)) brightness(1.1); }
            .ch-crack-2 { filter: drop-shadow(0 0 30px var(--rarity-color)) brightness(1.2); }
            .ch-crack-3 { filter: drop-shadow(0 0 40px var(--rarity-color)) brightness(1.3); animation: ch-shake 0.5s infinite; }
            @keyframes ch-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
            .ch-crack-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 40px; opacity: 0.6; pointer-events: none; }
            .ch-egg-container { position: relative; }
            .ch-egg-label { font-size: 14px; font-weight: bold; margin-top: 8px; color: var(--text-secondary, #aaa); text-transform: uppercase; }
            .ch-progress-bar { width: 80%; max-width: 300px; height: 24px; background: var(--surface, #2a2a3e); border-radius: 12px; overflow: hidden; position: relative; }
            .ch-progress-fill { height: 100%; border-radius: 12px; transition: width 0.2s; }
            .ch-progress-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 12px; font-weight: bold; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
            .ch-click-info { font-size: 12px; color: var(--text-secondary, #aaa); }

            /* Hatch result */
            .ch-hatch-result { text-align: center; padding: 20px; }
            .ch-hatched-emoji { font-size: 80px; animation: ch-pop 0.5s ease; }
            @keyframes ch-pop { 0% { transform: scale(0); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
            .ch-rarity-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold; color: #1a1a2e; margin: 8px 0; }
            .ch-badge-sm { font-size: 10px; padding: 2px 8px; }
            .ch-stats-row { display: flex; gap: 16px; justify-content: center; margin: 12px 0; font-size: 16px; }

            /* Cats grid */
            .ch-cats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
            .ch-cat-card { background: var(--surface, #2a2a3e); border: 2px solid; border-radius: 12px; padding: 12px; text-align: center; }
            .ch-cat-emoji { font-size: 36px; }
            .ch-cat-name { font-weight: bold; font-size: 13px; margin: 4px 0; color: var(--text, #e0e0e0); }
            .ch-cat-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; font-size: 12px; margin: 6px 0; color: var(--text-secondary, #ccc); }
            .ch-cat-victories { font-size: 12px; color: var(--text-secondary, #aaa); margin-bottom: 6px; }
            .ch-cooldown { color: #ff9800; font-size: 12px; font-weight: bold; }
            .ch-train-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }

            /* Shop */
            .ch-shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
            .ch-shop-card { background: var(--surface, #2a2a3e); border: 2px solid; border-radius: 12px; padding: 16px; text-align: center; }
            .ch-shop-emoji { font-size: 48px; }
            .ch-shop-name { font-weight: bold; font-size: 14px; margin: 8px 0 4px; color: var(--text, #e0e0e0); }
            .ch-shop-cost { font-size: 14px; margin-bottom: 8px; color: var(--text-secondary, #ccc); }

            /* Upgrades */
            .ch-upgrades-grid { display: flex; flex-direction: column; gap: 10px; }
            .ch-upgrade-card { background: var(--surface, #2a2a3e); border-radius: 12px; padding: 16px; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
            .ch-upgrade-name { font-weight: bold; font-size: 16px; color: var(--text, #e0e0e0); }
            .ch-upgrade-desc { font-size: 12px; color: var(--text-secondary, #aaa); flex: 1; min-width: 100px; }
            .ch-upgrade-level { font-size: 13px; color: var(--lavender, #c084fc); font-weight: bold; }
            .ch-upgrade-cost { font-size: 13px; margin-right: 8px; }

            /* Battle */
            .ch-battle-setup { display: flex; flex-direction: column; gap: 12px; }
            .ch-section-title { margin: 0; font-size: 14px; color: var(--text, #e0e0e0); }
            .ch-battle-picker { display: flex; flex-wrap: wrap; gap: 6px; }
            .ch-pick-btn { padding: 6px 10px; border: 2px solid; border-radius: 8px; background: var(--surface, #2a2a3e); color: var(--text, #e0e0e0); cursor: pointer; font-size: 12px; }
            .ch-pick-selected { background: var(--pink, #f9a8d4); color: #1a1a2e; font-weight: bold; }
            .ch-pick-other { opacity: 0.4; }

            /* Arena */
            .ch-arena { display: flex; flex-direction: column; gap: 12px; }
            .ch-arena-fighters { display: flex; align-items: center; justify-content: center; gap: 16px; }
            .ch-fighter { text-align: center; flex: 1; max-width: 150px; }
            .ch-fighter-emoji { font-size: 48px; }
            .ch-fighter-name { font-size: 13px; font-weight: bold; color: var(--text, #e0e0e0); margin: 4px 0; }
            .ch-fighter-winner { filter: drop-shadow(0 0 10px gold); }
            .ch-fighter-loser { opacity: 0.4; }
            .ch-vs { font-size: 24px; font-weight: bold; color: var(--pink, #f9a8d4); }
            .ch-hp-bar { width: 100%; height: 12px; background: #333; border-radius: 6px; overflow: hidden; }
            .ch-hp-fill { height: 100%; border-radius: 6px; transition: width 0.3s; }
            .ch-hp-text { font-size: 11px; color: var(--text-secondary, #aaa); }
            .ch-battle-log { background: #111; border-radius: 8px; padding: 12px; max-height: 250px; overflow-y: auto; font-family: monospace; font-size: 12px; color: #0f0; line-height: 1.5; }

            /* Buttons */
            .ch-btn { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: bold; background: var(--surface, #2a2a3e); color: var(--text, #e0e0e0); transition: background 0.2s; touch-action: manipulation; }
            .ch-btn-primary { background: var(--pink, #f9a8d4); color: #1a1a2e; }
            .ch-btn-sm { padding: 4px 8px; font-size: 11px; }
            .ch-btn-lg { padding: 12px 24px; font-size: 16px; align-self: center; margin-top: 8px; }
            .ch-btn-disabled { opacity: 0.4; cursor: not-allowed; }
        `;
        document.head.appendChild(style);
    }
}
