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
        // Battle picker UI state (not persisted)
        this.pickerSlot = 0;
        this.pickerSort = 'name';
        this.pickerFilter = 'all';
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
                    <div class="ch-cat-name-row" id="ch-name-row-${cat.id}">
                        <span class="ch-cat-name">${cat.name}</span>
                        <button class="ch-rename-btn" data-rename="${cat.id}" title="Rename">✏️</button>
                    </div>
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
        c.querySelectorAll('[data-rename]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.renameCat(parseInt(btn.dataset.rename));
            });
        });
    }

    renameCat(catId) {
        const cat = this.ownedCats.find(c => c.id === catId);
        if (!cat) return;
        const row = document.getElementById(`ch-name-row-${catId}`);
        if (!row) return;
        row.innerHTML = `<input class="ch-rename-input" type="text" maxlength="20" value="${cat.name.replace(/"/g, '&quot;')}">`;
        const input = row.querySelector('.ch-rename-input');
        input.focus();
        input.select();
        const commit = () => {
            const val = input.value.trim();
            if (val && val.length <= 20) {
                cat.name = val;
                this.saveState();
            }
            this.renderCats();
        };
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); commit(); }
            if (e.key === 'Escape') { this.renderCats(); }
        });
        input.addEventListener('blur', commit);
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
        if (this.battleState && this.battleState.winner !== null) {
            this.renderBattleArena(c);
            return;
        }

        // --- Improved Battle Selection UI ---
        const s0 = this.selectedBattle[0] !== null ? this.ownedCats.find(c => c.id === this.selectedBattle[0]) : null;
        const s1 = this.selectedBattle[1] !== null ? this.ownedCats.find(c => c.id === this.selectedBattle[1]) : null;

        const renderSlot = (cat, slotIdx) => {
            if (!cat) {
                return `<div class="ch-vs-slot ch-vs-slot-empty" data-slotclick="${slotIdx}">
                    <div class="ch-vs-slot-placeholder">Tap to choose</div>
                </div>`;
            }
            const breed = this.breeds[cat.breedId];
            const cfg = this.rarityConfig[breed.rarity];
            const totalPower = cat.stats.atk + cat.stats.def + cat.stats.spd + cat.stats.lck;
            return `<div class="ch-vs-slot ch-vs-slot-filled" data-slotclick="${slotIdx}">
                <div class="ch-vs-slot-emoji">${breed.emoji}</div>
                <div class="ch-vs-slot-name">${cat.name}</div>
                <div class="ch-rarity-badge ch-badge-sm" style="background: ${cfg.color}">${breed.rarity}</div>
                <div class="ch-vs-slot-power">⚡ ${totalPower}</div>
            </div>`;
        };

        const ready = s0 && s1 && this.selectedBattle[0] !== this.selectedBattle[1];

        let html = '<div class="ch-battle-setup">';
        // VS Display
        html += `<div class="ch-vs-display">
            ${renderSlot(s0, 0)}
            <div class="ch-vs-divider">VS</div>
            ${renderSlot(s1, 1)}
        </div>`;

        // Slot tabs
        html += `<div class="ch-slot-tabs">
            <button class="ch-slot-tab ${this.pickerSlot === 0 ? 'ch-slot-tab-active' : ''}" data-slottab="0">Cat 1</button>
            <button class="ch-slot-tab ${this.pickerSlot === 1 ? 'ch-slot-tab-active' : ''}" data-slottab="1">Cat 2</button>
        </div>`;

        // Sort & Filter toolbar
        html += `<div class="ch-picker-toolbar">
            <select class="ch-picker-sort" id="ch-picker-sort">
                <option value="name" ${this.pickerSort === 'name' ? 'selected' : ''}>Name</option>
                <option value="rarity" ${this.pickerSort === 'rarity' ? 'selected' : ''}>Rarity</option>
                <option value="power" ${this.pickerSort === 'power' ? 'selected' : ''}>Power</option>
                <option value="victories" ${this.pickerSort === 'victories' ? 'selected' : ''}>Victories</option>
            </select>
            <div class="ch-filter-chips">
                ${['all', 'common', 'rare', 'epic', 'legendary'].map(r =>
                    `<button class="ch-filter-chip ${this.pickerFilter === r ? 'ch-filter-chip-active' : ''}" data-filter="${r}">${r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}</button>`
                ).join('')}
            </div>
        </div>`;

        // Cat picker list
        html += `<div class="ch-picker-list" id="ch-picker-list">`;
        html += this.renderPickerList();
        html += `</div>`;

        // Fight button
        html += `<button class="ch-btn ch-btn-primary ch-btn-lg ${ready ? '' : 'ch-btn-disabled'}" id="ch-fight" ${ready ? '' : 'disabled'}>⚔️ Fight!</button>`;
        html += '</div>';
        c.innerHTML = html;

        // Event listeners
        c.querySelectorAll('[data-slotclick]').forEach(el => {
            el.addEventListener('click', () => {
                this.pickerSlot = parseInt(el.dataset.slotclick);
                this.renderBattle();
            });
        });
        c.querySelectorAll('[data-slottab]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.pickerSlot = parseInt(btn.dataset.slottab);
                this.renderBattle();
            });
        });
        document.getElementById('ch-picker-sort')?.addEventListener('change', (e) => {
            this.pickerSort = e.target.value;
            const list = document.getElementById('ch-picker-list');
            if (list) { list.innerHTML = this.renderPickerList(); this.bindPickerClicks(list); }
        });
        c.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.pickerFilter = btn.dataset.filter;
                this.renderBattle();
            });
        });
        this.bindPickerClicks(c);
        document.getElementById('ch-fight')?.addEventListener('click', () => this.startBattle());
    }

    bindPickerClicks(container) {
        container.querySelectorAll('[data-pickcat]').forEach(el => {
            el.addEventListener('click', () => {
                const catId = parseInt(el.dataset.pickcat);
                const otherSlot = 1 - this.pickerSlot;
                if (this.selectedBattle[otherSlot] === catId) return;
                this.selectedBattle[this.pickerSlot] = catId;
                this.renderBattle();
            });
        });
    }

    getFilteredSortedCats() {
        const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
        let cats = [...this.ownedCats];
        if (this.pickerFilter !== 'all') {
            cats = cats.filter(cat => this.breeds[cat.breedId].rarity === this.pickerFilter);
        }
        switch (this.pickerSort) {
            case 'name': cats.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'rarity': cats.sort((a, b) => rarityOrder[this.breeds[b.breedId].rarity] - rarityOrder[this.breeds[a.breedId].rarity]); break;
            case 'power': cats.sort((a, b) => (b.stats.atk + b.stats.def + b.stats.spd + b.stats.lck) - (a.stats.atk + a.stats.def + a.stats.spd + a.stats.lck)); break;
            case 'victories': cats.sort((a, b) => b.victories - a.victories); break;
        }
        return cats;
    }

    renderPickerList() {
        const cats = this.getFilteredSortedCats();
        const otherSlot = 1 - this.pickerSlot;
        let html = '';
        for (const cat of cats) {
            const breed = this.breeds[cat.breedId];
            const cfg = this.rarityConfig[breed.rarity];
            const selected = this.selectedBattle[this.pickerSlot] === cat.id;
            const otherSelected = this.selectedBattle[otherSlot] === cat.id;
            const totalPower = cat.stats.atk + cat.stats.def + cat.stats.spd + cat.stats.lck;
            html += `<div class="ch-picker-card ${selected ? 'ch-picker-card-selected' : ''} ${otherSelected ? 'ch-picker-card-disabled' : ''}" data-pickcat="${cat.id}">
                <span class="ch-picker-card-emoji">${breed.emoji}</span>
                <div class="ch-picker-card-info">
                    <span class="ch-picker-card-name">${cat.name}</span>
                    <span class="ch-rarity-badge ch-badge-sm" style="background: ${cfg.color}">${breed.rarity}</span>
                </div>
                <div class="ch-picker-card-right">
                    <span class="ch-picker-card-power">⚡${totalPower}</span>
                    <span class="ch-picker-card-wins">🏆${cat.victories}</span>
                </div>
            </div>`;
        }
        if (cats.length === 0) {
            html = '<div class="ch-empty">No cats match this filter.</div>';
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
            turnLog: [],
            log: [],
            winner: null,
            round: 1,
            showingPause: false
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
        const atkBreed = this.breeds[attacker.cat.breedId];
        const defBreed = this.breeds[defender.cat.breedId];

        const atkRoll = this.rollD20();
        const defRoll = this.rollD20();
        const atkCrit = atkRoll <= attacker.cat.stats.lck;
        const defCrit = defRoll <= defender.cat.stats.lck;
        const atkTotal = (atkCrit ? atkRoll * 2 : atkRoll) + attacker.cat.stats.atk;
        const defTotal = (defCrit ? defRoll * 2 : defRoll) + defender.cat.stats.def;
        const hit = atkTotal > defTotal;
        const damage = hit ? Math.max(1, atkTotal - defTotal) : 0;

        if (hit) {
            defender.hp = Math.max(0, defender.hp - damage);
        }

        bs.turnLog.push({
            round: bs.round,
            attackerName: attacker.name,
            attackerEmoji: atkBreed.emoji,
            defenderName: defender.name,
            defenderEmoji: defBreed.emoji,
            atkRoll,
            defRoll,
            atkCrit,
            defCrit,
            atkTotal,
            defTotal,
            hit,
            damage
        });

        if (defender.hp <= 0) {
            bs.active = false;
            bs.winner = atkIdx;
            attacker.cat.victories++;
            this.saveState();
            this.renderBattle();
            return;
        }

        bs.turn = defIdx;
        bs.round++;
        this.renderBattle();
        this.battleTimeout = setTimeout(() => this.executeTurn(), 2500);
    }

    renderBattleArena(container) {
        const c = container || document.getElementById('ch-content');
        if (!c) return;
        const bs = this.battleState;
        const f0 = bs.fighters[0];
        const f1 = bs.fighters[1];
        const b0 = this.breeds[f0.cat.breedId];
        const b1 = this.breeds[f1.cat.breedId];

        const hpClass = (f) => {
            const pct = f.hp / f.maxHp;
            if (pct < 0.25) return 'ch-hp-critical';
            if (pct < 0.5) return 'ch-hp-low';
            return '';
        };

        let html = `<div class="ch-arena">
            <div class="ch-arena-fighters">
                <div class="ch-fighter-card ${bs.winner === 0 ? 'ch-fighter-winner' : bs.winner === 1 ? 'ch-fighter-loser' : ''}">
                    <div class="ch-fighter-emoji">${b0.emoji}</div>
                    <div class="ch-fighter-name">${f0.name}</div>
                    <div class="ch-hp-bar-outer">
                        <div class="ch-hp-fill-new ${hpClass(f0)}" style="width:${(f0.hp / f0.maxHp) * 100}%"></div>
                    </div>
                    <div class="ch-hp-text">${f0.hp}/${f0.maxHp}</div>
                </div>
                <div class="ch-vs-battle">⚔️</div>
                <div class="ch-fighter-card ${bs.winner === 1 ? 'ch-fighter-winner' : bs.winner === 0 ? 'ch-fighter-loser' : ''}">
                    <div class="ch-fighter-emoji">${b1.emoji}</div>
                    <div class="ch-fighter-name">${f1.name}</div>
                    <div class="ch-hp-bar-outer">
                        <div class="ch-hp-fill-new ${hpClass(f1)}" style="width:${(f1.hp / f1.maxHp) * 100}%"></div>
                    </div>
                    <div class="ch-hp-text">${f1.hp}/${f1.maxHp}</div>
                </div>
            </div>`;

        if (bs.winner !== null) {
            // Victory screen
            const winner = bs.fighters[bs.winner];
            const winBreed = this.breeds[winner.cat.breedId];
            html += `<div class="ch-victory-card">
                <div class="ch-victory-emoji">${winBreed.emoji}</div>
                <div class="ch-victory-title">VICTORY!</div>
                <div class="ch-victory-name">${winner.name}</div>
                <button class="ch-btn ch-btn-primary ch-btn-lg" id="ch-battle-again">⚔️ Battle Again</button>
            </div>`;
        } else {
            // Turn feed
            html += `<div class="ch-turn-feed" id="ch-turn-feed">`;
            if (bs.active && bs.turnLog.length === 0) {
                html += `<div class="ch-battle-pause"><span class="ch-pause-icon">⚔️</span></div>`;
            }
            for (let i = 0; i < bs.turnLog.length; i++) {
                const t = bs.turnLog[i];
                const isNew = i === bs.turnLog.length - 1;
                const borderClass = t.atkCrit || t.defCrit ? 'ch-turn-crit' : t.hit ? 'ch-turn-hit' : 'ch-turn-block';
                html += `<div class="ch-turn-card ${borderClass} ${isNew ? 'ch-turn-card-new' : ''}">
                    <div class="ch-turn-header">
                        <span>${t.attackerEmoji} ${t.attackerName}</span>
                        <span class="ch-turn-round">R${t.round}</span>
                    </div>
                    <div class="ch-turn-dice">
                        <span class="ch-dice-box ${t.atkCrit ? 'ch-dice-crit' : ''}">🎲 ${t.atkRoll}${t.atkCrit ? '×2' : ''}+${t.atkTotal - (t.atkCrit ? t.atkRoll * 2 : t.atkRoll)}=${t.atkTotal}</span>
                        <span class="ch-dice-vs">vs</span>
                        <span class="ch-dice-box ${t.defCrit ? 'ch-dice-crit' : ''}">🎲 ${t.defRoll}${t.defCrit ? '×2' : ''}+${t.defTotal - (t.defCrit ? t.defRoll * 2 : t.defRoll)}=${t.defTotal}</span>
                    </div>
                    <div class="ch-turn-result ${t.hit ? 'ch-result-hit' : 'ch-result-block'}">
                        ${t.hit ? `HIT! -${t.damage} HP` : 'BLOCKED!'}
                    </div>
                    ${(t.atkCrit || t.defCrit) ? '<div class="ch-crit-badge">CRIT!</div>' : ''}
                </div>`;
            }
            html += `</div>`;
        }
        html += '</div>';
        c.innerHTML = html;

        const feed = document.getElementById('ch-turn-feed');
        if (feed) feed.scrollTop = feed.scrollHeight;

        document.getElementById('ch-battle-again')?.addEventListener('click', () => {
            this.battleState = null;
            this.selectedBattle = [null, null];
            this.pickerSlot = 0;
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
            .ch-egg-container { text-align: center; position: relative; }
            .ch-egg { font-size: 120px; cursor: pointer; user-select: none; transition: transform 0.1s; filter: drop-shadow(0 0 20px var(--rarity-color)); line-height: 1.2; }
            .ch-egg:active { transform: scale(0.9); }
            .ch-wobble { animation: ch-wobble 0.3s ease; }
            @keyframes ch-wobble { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-10deg); } 75% { transform: rotate(10deg); } }
            .ch-crack-1 { filter: drop-shadow(0 0 20px var(--rarity-color)) brightness(1.1); }
            .ch-crack-2 { filter: drop-shadow(0 0 30px var(--rarity-color)) brightness(1.2); }
            .ch-crack-3 { filter: drop-shadow(0 0 40px var(--rarity-color)) brightness(1.3); animation: ch-shake 0.5s infinite; }
            @keyframes ch-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
            .ch-crack-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 40px; opacity: 0.6; pointer-events: none; }
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
            .ch-cat-name { font-weight: bold; font-size: 13px; color: var(--text, #e0e0e0); }
            .ch-cat-name-row { display: flex; align-items: center; justify-content: center; gap: 4px; margin: 4px 0; }
            .ch-rename-btn { background: none; border: none; cursor: pointer; font-size: 14px; padding: 2px; opacity: 0.5; transition: opacity 0.2s; }
            .ch-rename-btn:hover { opacity: 1; }
            .ch-rename-input { width: 100%; max-width: 140px; padding: 4px 8px; border: 2px solid var(--pink, #f9a8d4); border-radius: 6px; background: var(--surface, #2a2a3e); color: var(--text, #e0e0e0); font-size: 13px; font-weight: bold; text-align: center; outline: none; font-family: 'Nunito', sans-serif; }
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

            /* === Battle Selection === */
            .ch-battle-setup { display: flex; flex-direction: column; gap: 12px; }
            .ch-vs-display { display: flex; align-items: center; gap: 8px; justify-content: center; margin-bottom: 4px; }
            .ch-vs-slot { flex: 1; max-width: 160px; min-height: 100px; border-radius: 12px; padding: 12px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; cursor: pointer; transition: all 0.2s; }
            .ch-vs-slot-empty { border: 2px dashed var(--text-secondary, #666); background: transparent; }
            .ch-vs-slot-filled { border: 2px solid var(--pink, #f9a8d4); background: var(--gradient-card, #2a2a3e); }
            .ch-vs-slot-placeholder { color: var(--text-secondary, #aaa); font-size: 13px; }
            .ch-vs-slot-emoji { font-size: 40px; }
            .ch-vs-slot-name { font-family: 'Fredoka', sans-serif; font-size: 13px; font-weight: 600; color: var(--text, #e0e0e0); }
            .ch-vs-slot-power { font-size: 12px; color: var(--lavender, #c084fc); font-weight: bold; }
            .ch-vs-divider { font-family: 'Fredoka', sans-serif; font-size: 24px; font-weight: 700; color: var(--pink, #f9a8d4); }

            .ch-slot-tabs { display: flex; gap: 6px; }
            .ch-slot-tab { flex: 1; padding: 8px; border: 2px solid var(--surface, #2a2a3e); border-radius: 8px; background: var(--surface, #2a2a3e); color: var(--text, #e0e0e0); cursor: pointer; font-family: 'Fredoka', sans-serif; font-size: 14px; font-weight: 500; transition: all 0.2s; }
            .ch-slot-tab-active { background: var(--pink, #f9a8d4); color: #1a1a2e; border-color: var(--pink, #f9a8d4); font-weight: 700; }

            .ch-picker-toolbar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
            .ch-picker-sort { padding: 6px 10px; border-radius: 8px; border: 1px solid var(--surface, #444); background: var(--surface, #2a2a3e); color: var(--text, #e0e0e0); font-size: 12px; font-family: 'Nunito', sans-serif; }
            .ch-filter-chips { display: flex; gap: 4px; flex-wrap: wrap; }
            .ch-filter-chip { padding: 4px 10px; border-radius: 20px; border: none; background: var(--surface, #2a2a3e); color: var(--text, #e0e0e0); font-size: 11px; cursor: pointer; transition: all 0.2s; font-family: 'Nunito', sans-serif; }
            .ch-filter-chip-active { background: var(--lavender, #c084fc); color: #1a1a2e; font-weight: bold; }

            .ch-picker-list { max-height: 260px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
            .ch-picker-card { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: var(--surface, #2a2a3e); border: 2px solid transparent; cursor: pointer; min-height: 52px; touch-action: manipulation; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
            .ch-picker-card:hover { border-color: var(--pink, #f9a8d4); transform: translateX(4px); }
            .ch-picker-card-selected { border-color: var(--pink, #f9a8d4); background: var(--gradient-card, linear-gradient(145deg, #2a2a3e, #3a3a4e)); }
            .ch-picker-card-disabled { opacity: 0.35; pointer-events: none; }
            .ch-picker-card-emoji { font-size: 28px; }
            .ch-picker-card-info { flex: 1; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
            .ch-picker-card-name { font-weight: bold; font-size: 13px; color: var(--text, #e0e0e0); }
            .ch-picker-card-right { display: flex; flex-direction: column; align-items: flex-end; font-size: 11px; color: var(--text-secondary, #aaa); gap: 2px; }
            .ch-picker-card-power { color: var(--lavender, #c084fc); font-weight: bold; }

            /* === Battle Arena (Stylized) === */
            .ch-arena { display: flex; flex-direction: column; gap: 12px; }
            .ch-arena-fighters { display: flex; align-items: center; justify-content: center; gap: 12px; }
            .ch-fighter-card { text-align: center; flex: 1; max-width: 160px; padding: 12px; border-radius: 12px; background: var(--gradient-card, #2a2a3e); box-shadow: 0 4px 12px var(--shadow-soft, rgba(0,0,0,0.1)); transition: all 0.3s; }
            .ch-fighter-emoji { font-size: 48px; }
            .ch-fighter-name { font-family: 'Fredoka', sans-serif; font-size: 13px; font-weight: 600; color: var(--text, #e0e0e0); margin: 4px 0; }
            .ch-fighter-winner { filter: drop-shadow(0 0 12px gold); }
            .ch-fighter-loser { opacity: 0.4; }
            .ch-vs-battle { font-size: 28px; animation: ch-pulse-swords 2s ease-in-out infinite; }
            @keyframes ch-pulse-swords { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }

            .ch-hp-bar-outer { width: 100%; height: 10px; background: rgba(0,0,0,0.2); border-radius: 5px; overflow: hidden; margin-top: 4px; }
            .ch-hp-fill-new { height: 100%; border-radius: 5px; background: #4caf50; transition: width 0.5s ease; }
            .ch-hp-low { background: #ff9800 !important; }
            .ch-hp-critical { background: #f44336 !important; animation: ch-hp-flash 0.6s ease-in-out infinite; }
            @keyframes ch-hp-flash { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
            .ch-hp-text { font-size: 11px; color: var(--text-secondary, #aaa); margin-top: 2px; }

            /* Turn feed */
            .ch-turn-feed { max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding: 4px 0; }
            .ch-battle-pause { text-align: center; padding: 20px; }
            .ch-pause-icon { font-size: 40px; display: inline-block; animation: ch-pulse-swords 1.5s ease-in-out infinite; }

            .ch-turn-card { background: var(--gradient-card, #2a2a3e); border-radius: 10px; padding: 10px 12px; border-left: 4px solid var(--sky, #7BBFDE); animation: ch-turn-slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
            .ch-turn-card-new { }
            .ch-turn-hit { border-left-color: var(--pink-deep, #FF5C85); }
            .ch-turn-block { border-left-color: var(--sky-deep, #4FADD4); }
            .ch-turn-crit { border-left-color: #ffd54f; }
            @keyframes ch-turn-slide-in { 0% { opacity: 0; transform: translateX(-20px); } 100% { opacity: 1; transform: translateX(0); } }

            .ch-turn-header { display: flex; justify-content: space-between; align-items: center; font-family: 'Fredoka', sans-serif; font-size: 13px; font-weight: 600; color: var(--text, #e0e0e0); margin-bottom: 4px; }
            .ch-turn-round { font-size: 11px; color: var(--text-secondary, #aaa); font-weight: normal; }

            .ch-turn-dice { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; flex-wrap: wrap; }
            .ch-dice-box { font-size: 11px; padding: 3px 8px; border-radius: 6px; background: var(--surface, rgba(0,0,0,0.15)); color: var(--text, #e0e0e0); font-family: 'Nunito', sans-serif; font-weight: 600; }
            .ch-dice-crit { background: rgba(255, 213, 79, 0.25); color: #ffd54f; }
            .ch-dice-vs { font-size: 10px; color: var(--text-secondary, #aaa); }

            .ch-turn-result { font-family: 'Fredoka', sans-serif; font-size: 14px; font-weight: 600; }
            .ch-result-hit { color: var(--pink-deep, #FF5C85); }
            .ch-result-block { color: var(--sky-deep, #4FADD4); }

            .ch-crit-badge { display: inline-block; background: linear-gradient(135deg, #ffd54f, #ffb300); color: #1a1a2e; font-size: 10px; font-weight: bold; padding: 2px 10px; border-radius: 20px; margin-top: 4px; animation: ch-crit-pulse 1s ease-in-out infinite; }
            @keyframes ch-crit-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }

            /* Victory screen */
            .ch-victory-card { background: linear-gradient(135deg, var(--pink, #FFB5C5), var(--lavender, #C9B8E8), var(--sky, #B5D8EB)); border-radius: 16px; padding: 32px 20px; text-align: center; margin-top: 8px; }
            .ch-victory-emoji { font-size: 80px; animation: ch-bounce-winner 1s ease-in-out infinite; }
            @keyframes ch-bounce-winner { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
            .ch-victory-title { font-family: 'Fredoka', sans-serif; font-size: 32px; font-weight: 700; color: #1a1a2e; margin: 8px 0 4px; }
            .ch-victory-name { font-family: 'Fredoka', sans-serif; font-size: 18px; font-weight: 600; color: #333; margin-bottom: 16px; }

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
