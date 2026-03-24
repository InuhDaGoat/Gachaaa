const STORAGE_KEY = "gachaaa_supabase_config";
const PLAYER_STATE_KEY = "gachaaa_player_state_v2";
const PULL_COST = 160;
const FULL_POTENTIAL_COST = 1140;

const elements = [
  "Api",
  "Air",
  "Angin",
  "Tanah",
  "Listrik",
  "Es",
  "Cahaya",
  "Bayangan",
  "Chaos",
  "Order",
  "Abyss",
  "Void",
  "Sky",
  "Summit"
];

const baseCharacters = [
  { name: "Zarok", rarity: "Mythical", signatureWeapon: "Abyss Rend", lore: "Raja retakan dimensi." },
  { name: "Alice", rarity: "Mythical", signatureWeapon: "Chrono Lotus", lore: "Penyihir waktu dari Sky Atlas." },
  { name: "Astra", rarity: "Legendary", lore: "Ksatria solar realm." },
  { name: "Cyrene", rarity: "Legendary", lore: "Ratu ombak kuno." },
  { name: "Elowen", rarity: "Epic", lore: "Penjaga hutan summit." },
  { name: "Brakk", rarity: "Epic", lore: "Tank perang batu." },
  { name: "Galen", rarity: "Rare", lore: "Teknisi petir." },
  { name: "Dorian", rarity: "Rare", lore: "Pemburu malam." }
];

// Database Karakter (Sesuai Lore sebelumnya)
const CHARACTER_DB = [
  { id: 1, name: "Reza", rarity: "Mythical", element: "Summit", role: "Warrior", weapon: "Greatsword" },
  { id: 2, name: "Cyntia", rarity: "Legendary", element: "Sky", role: "Mage", weapon: "Staff" },
  { id: 3, name: "Axel", rarity: "Legendary", element: "Solar", role: "Ranger", weapon: "Bow" },
  { id: 4, name: "Iwan", rarity: "Epic", element: "Void", role: "Assassin", weapon: "Dagger" },
  { id: 5, name: "Budi", rarity: "Epic", element: "Abyss", role: "Mage", weapon: "Book" },
  { id: 6, name: "Rina", rarity: "Rare", element: "Nature", role: "Ranger", weapon: "Bow" },
  { id: 7, name: "Agus", rarity: "Rare", element: "Iron", role: "Warrior", weapon: "Shield" },
];

class GameEngine {
  constructor() {
    this.state = this.loadData();
    this.updateUI();
    this.bindEvents();
  }

  loadData() {
    const defaultData = {
      gems: 10000,
      pityCount: 0,
      inventory: [],
      labyrinthFloor: 0,
      currentShopBanner: 1
    };
    const savedData = localStorage.getItem('gachaRPGData');
    return savedData ? JSON.parse(savedData) : defaultData;
  }

  saveData() {
    localStorage.setItem('gachaRPGData', JSON.stringify(this.state));
  }

  bindEvents() {
    const btnGacha = document.getElementById('gachaButton');
    const btnCloseGacha = document.getElementById('close-gacha');
    if(btnCloseGacha) btnCloseGacha.onclick = () => this.hideGachaVisual();
  }

  updateUI() {
    document.getElementById('gems').innerText = this.state.gems.toLocaleString();
    document.getElementById('pityCount').innerText = this.state.pityCount;
    this.saveData();
  }

  // --- Gacha System with Visuals ---

  pullGacha() {
    const cost = 1600;
    if (this.state.gems < cost) {
      alert("Gems tidak cukup untuk melakukan pemanggilan 10x.");
      return;
    }

    this.state.gems -= cost;
    this.updateUI();
    this.showGachaVisual();

    let results = [];
    for (let i = 0; i < 10; i++) {
      results.push(this.drawSingle());
    }

    // Tampilkan hasil secara visual setelah jeda animasi "rift"
    setTimeout(() => {
      this.renderGachaCards(results);
    }, 1500); 
  }

  drawSingle() {
    this.state.pityCount++;
    let drawn;

    if (this.state.pityCount >= 90) {
      this.state.pityCount = 0;
      drawn = this.getRandomCharacter("Legendary");
    } else {
      let roll = Math.random();
      if (roll < 0.006) { // 0.6% Mythical
        drawn = this.getRandomCharacter("Mythical");
        this.state.pityCount = 0;
      } else if (roll < 0.06) { // 6% Legendary
        drawn = this.getRandomCharacter("Legendary");
        this.state.pityCount = 0;
      } else if (roll < 0.2) { // 20% Epic
        drawn = this.getRandomCharacter("Epic");
      } else {
        drawn = this.getRandomCharacter("Rare");
      }
    }

    this.state.inventory.push(drawn.id);
    this.saveData();
    return drawn;
  }

  getRandomCharacter(rarity) {
    const charsByRarity = CHARACTER_DB.filter(c => c.rarity === rarity);
    return charsByRarity[Math.floor(Math.random() * charsByRarity.length)];
  }

  // --- Visualisasi Kartu Gacha ---

  showGachaVisual() {
    const overlay = document.getElementById('gacha-overlay');
    const visual = document.getElementById('gacha-results-visual');
    overlay.classList.remove('hidden');
    overlay.classList.add('animate'); // Mulai animasi rift blur
    visual.classList.add('hidden'); // Sembunyikan hasil dulu
  }

  hideGachaVisual() {
    const overlay = document.getElementById('gacha-overlay');
    overlay.classList.add('hidden');
    overlay.classList.remove('animate');
    this.openInventory(); // Pindah ke inventory setelah gacha
  }

  renderGachaCards(results) {
    const container = document.getElementById('gacha-card-container');
    const visual = document.getElementById('gacha-results-visual');
    visual.classList.remove('hidden'); // Tampilkan box hasil
    container.innerHTML = ''; // Reset container

    results.forEach((char, index) => {
      // Buat elemen kartu
      const card = document.createElement('div');
      card.className = `gacha-card card-${char.rarity}`;
      
      // Delay animasi kartu satu per satu
      card.style.animationDelay = `${index * 0.1}s`;

      card.innerHTML = `
        <div class="name">${char.name}</div>
        <div class="rarity">${char.rarity} (${char.element})</div>
      `;

      container.appendChild(card);
    });
  }

  // --- Inventory System (Visual) ---

  openInventory() {
    const display = document.getElementById('content-display');
    display.innerHTML = '<h2>Inventaris Pahlawan</h2><div class="gacha-card-container inventory-grid"></div>';
    
    if(this.state.inventory.length === 0) {
      display.innerHTML += '<p class="log-text">Panggil pahlawan untuk mengisi inventaris.</p>';
      return;
    }

    const container = display.querySelector('.inventory-grid');
    
    // Kelompokkan inventory (karena hanya menyimpan ID)
    let invCounts = {};
    this.state.inventory.forEach(id => invCounts[id] = (invCounts[id] || 0) + 1);

    // Tampilkan inventory sebagai kartu kecil
    Object.keys(invCounts).forEach(id => {
      const char = CHARACTER_DB.find(c => c.id == id);
      const card = document.createElement('div');
      card.className = `gacha-card card-${char.rarity}`;
      card.style.transform = 'scale(0.85)'; // Lebih kecil untuk grid inventory
      card.style.margin = '-10px'; 
      card.innerHTML = `
        <div class="name">${char.name}</div>
        <div class="rarity">P${invCounts[id]} / ${char.role}</div>
      `;
      container.appendChild(card);
    });
  }

  // --- Placeholder untuk Menu Lain ---
  openShop() { document.getElementById('content-display').innerHTML = '<h2>Pasar Astral</h2><p>Toko koin & gems masih dalam pengembangan.</p>'; }
  openPityShop() { document.getElementById('content-display').innerHTML = '<h2>Toko Takdir (Pity)</h2><p>Pity Shop: Tukar pity untuk jaminan legendary.</p>'; }
  openLabyrinth() { document.getElementById('content-display').innerHTML = '<h2>Labyrinth Dimensi</h2><p>Fitur roguelike masih dalam pengembangan.</p>'; }

  resetData() {
    if(confirm("Apakah kamu yakin ingin mereset semua data? Gems & Inventory akan kembali seperti semula.")) {
      localStorage.removeItem('gachaRPGData');
      location.reload();
    }
  }
}

// Inisialisasi Game
const game = new GameEngine();

const newCharacters = [
  "Nyx","Orion","Kael","Rhea","Valk","Mira","Talon","Seris","Eidon","Lumia",
  "Ragnar","Kairo","Selene","Noctis","Iris","Fenra","Oberon","Pyra","Zeph","Triton",
  "Auron","Vesper","Yuna","Helios","Morr","Quill","Sable","Riven","Thorne","Lyra"
].map((name, idx) => ({
  name,
  rarity: idx < 4 ? "Mythical" : idx < 12 ? "Legendary" : idx < 22 ? "Epic" : "Rare",
  signatureWeapon: idx < 4 ? `${name} Sigil Edge` : undefined,
  lore: `${name} adalah pejuang dari wilayah ${elements[idx % elements.length]}.`
}));

const characters = [...baseCharacters, ...newCharacters].map((c, idx) => ({
  ...c,
  featured: c.rarity === "Mythical" && idx % 2 === 0,
  basePower: c.rarity === "Mythical" ? 980 - (idx % 5) * 20 : c.rarity === "Legendary" ? 820 - (idx % 5) * 15 : c.rarity === "Epic" ? 680 - (idx % 7) * 10 : 560 - (idx % 8) * 8,
  elements: [elements[idx % elements.length], elements[(idx + 3) % elements.length], elements[(idx + 7) % elements.length]].slice(
    0,
    (idx % 3) + 1
  )
}));

const rateTable = [
  { rarity: "Mythical", chance: 0.03 },
  { rarity: "Legendary", chance: 0.12 },
  { rarity: "Epic", chance: 0.33 },
  { rarity: "Rare", chance: 0.52 }
];

const evoReward = { Mythical: 180, Legendary: 120, Epic: 80, Rare: 50 };

const shopItems = [
  // General Shop (Gold)
  { id: "c1", name: "EXP Slime (Small)", tab: "general", currency: "gold", cost: 120, type: "consumable", effect: "hero_xp_1000" },
  { id: "c2", name: "EXP Slime (Medium)", tab: "general", currency: "gold", cost: 380, type: "consumable", effect: "hero_xp_5000" },
  { id: "c3", name: "EXP Slime (Large)", tab: "general", currency: "gold", cost: 1200, type: "consumable", effect: "hero_xp_20000" },
  { id: "c4", name: "Instant Level Up Scroll", tab: "general", currency: "gold", cost: 2000, type: "consumable", effect: "level_plus_1" },
  { id: "c5", name: "Stamina Potion", tab: "general", currency: "gold", cost: 350, type: "consumable", effect: "stamina_50" },
  { id: "c6", name: "Energy Drink", tab: "general", currency: "gold", cost: 420, type: "consumable", effect: "skill_reset" },
  { id: "c7", name: "Training Dummy", tab: "general", currency: "gold", cost: 500, type: "consumable", effect: "talent_upgrade" },
  { id: "c8", name: "Knowledge Tome", tab: "general", currency: "gold", cost: 480, type: "consumable", effect: "unlock_lore" },
  { id: "c9", name: "Reset Stone", tab: "premium", currency: "gems", cost: 180, type: "consumable", effect: "reset_level" },
  { id: "c10", name: "Hero Soul Fragment", tab: "general", currency: "gold", cost: 260, type: "consumable", effect: "soul_fragment" },

  { id: "r1", name: "Relic Dust", tab: "general", currency: "gold", cost: 240, type: "material", effect: "relic_forge" },
  { id: "r2", name: "Void Crystal", tab: "black", currency: "gold", cost: 1400, type: "material", effect: "void_upgrade" },
  { id: "r3", name: "Chaos Core", tab: "black", currency: "gems", cost: 210, type: "material", effect: "mythic_evolve" },
  { id: "r4", name: "Sub-stat Reroll Stone", tab: "premium", currency: "gems", cost: 90, type: "material", effect: "reroll_sub" },
  { id: "r5", name: "Main-stat Transmuter", tab: "premium", currency: "gems", cost: 220, type: "material", effect: "reroll_main" },
  { id: "r6", name: "Artifact EXP Bottle (S)", tab: "general", currency: "gold", cost: 180, type: "artifact", power: 20, effect: "artifact_xp_500" },
  { id: "r7", name: "Artifact EXP Bottle (L)", tab: "general", currency: "gold", cost: 540, type: "artifact", power: 45, effect: "artifact_xp_2500" },
  { id: "r8", name: "Protection Charm", tab: "black", currency: "gold", cost: 1700, type: "material", effect: "protect_relic" },
  { id: "r9", name: "Success Rate Oil", tab: "general", currency: "gold", cost: 600, type: "material", effect: "forge_rate_10" },
  { id: "r10", name: "Polished Mirror", tab: "premium", currency: "gems", cost: 250, type: "artifact", power: 80, effect: "dup_4star" },

  { id: "a1", name: "Fire Essence", tab: "general", currency: "gold", cost: 550, type: "material", effect: "awake_fire" },
  { id: "a2", name: "Water Essence", tab: "general", currency: "gold", cost: 550, type: "material", effect: "awake_water" },
  { id: "a3", name: "Dark Essence", tab: "general", currency: "gold", cost: 620, type: "material", effect: "awake_dark" },
  { id: "a4", name: "Light Essence", tab: "general", currency: "gold", cost: 620, type: "material", effect: "awake_light" },
  { id: "a5", name: "Order Shard", tab: "black", currency: "gems", cost: 130, type: "material", effect: "order_upgrade" },
  { id: "a6", name: "Chaos Shard", tab: "black", currency: "gems", cost: 130, type: "material", effect: "chaos_upgrade" },
  { id: "a7", name: "Universal Evo Token", tab: "premium", currency: "gems", cost: 60, type: "material", effect: "evo_token" },
  { id: "a8", name: "Limit Break Stone", tab: "premium", currency: "gems", cost: 210, type: "material", effect: "level_cap_100" },
  { id: "a9", name: "Constellation Star", tab: "premium", currency: "gems", cost: 320, type: "material", effect: "constellation_plus" },
  { id: "a10", name: "Primordial Spark", tab: "black", currency: "gems", cost: 400, type: "material", effect: "new_game_plus" },

  { id: "g1", name: "Iron Gauntlet", tab: "general", currency: "gold", cost: 700, type: "armor", power: 60 },
  { id: "g2", name: "Steel Plate Mail", tab: "premium", currency: "gems", cost: 140, type: "armor", power: 140 },
  { id: "g3", name: "Ring of Life", tab: "general", currency: "gold", cost: 650, type: "accessory", power: 50 },
  { id: "g4", name: "Necklace of Haste", tab: "general", currency: "gold", cost: 660, type: "accessory", power: 54 },
  { id: "g5", name: "Cloak of Invisibility", tab: "premium", currency: "gems", cost: 100, type: "gear", power: 65 },
  { id: "g6", name: "Boots of Hermes", tab: "general", currency: "gold", cost: 630, type: "gear", power: 52 },
  { id: "g7", name: "Earrings of Wisdom", tab: "general", currency: "gold", cost: 620, type: "accessory", power: 53 },
  { id: "g8", name: "Belt of Giant", tab: "general", currency: "gold", cost: 640, type: "gear", power: 58 },
  { id: "g9", name: "Signature Weapon Mold", tab: "black", currency: "gold", cost: 2200, type: "weapon", power: 120 },
  { id: "g10", name: "Ornament Box", tab: "premium", currency: "gems", cost: 90, type: "accessory", power: 70 },

  { id: "s1", name: "Gacha Ticket (Normal)", tab: "premium", currency: "gems", cost: 40, type: "ticket", effect: "normal_ticket" },
  { id: "s2", name: "Mythical Ticket", tab: "premium", currency: "gems", cost: 220, type: "ticket", effect: "mythic_ticket" },
  { id: "s3", name: "Weapon Gacha Ticket", tab: "premium", currency: "gems", cost: 80, type: "ticket", effect: "weapon_ticket" },
  { id: "s4", name: "Skin Coupon", tab: "premium", currency: "gems", cost: 160, type: "ticket", effect: "skin_coupon" },
  { id: "s5", name: "Guild Contribution Medal", tab: "general", currency: "gold", cost: 900, type: "material", effect: "guild_point_500" },
  { id: "s6", name: "Name Change Card", tab: "premium", currency: "gems", cost: 50, type: "ticket", effect: "rename" },
  { id: "s7", name: "Housing Furniture Box", tab: "general", currency: "gold", cost: 780, type: "ticket", effect: "dorm_furniture" },
  { id: "s8", name: "Double Gold Card", tab: "premium", currency: "gems", cost: 80, type: "ticket", effect: "double_gold_1h" },
  { id: "s9", name: "Double Drop Card", tab: "premium", currency: "gems", cost: 80, type: "ticket", effect: "double_drop_1h" },
  { id: "s10", name: "Mystery Box", tab: "black", currency: "gems", cost: 120, type: "ticket", effect: "mystery" }
];

const artifactSlots = ["artifact1", "artifact2", "artifact3", "artifact4", "artifact5"];
const armorSlots = ["armor1", "armor2", "armor3", "armor4"];
const singleSlots = ["weapon", "relic", "accessory", "gear"];
const allSlots = [...artifactSlots, ...armorSlots, ...singleSlots, "constellation", "talent"];

const eventState = {
  name: "Festival of Void-Sky",
  description: "Dungeon memberi +30% event point. Kumpulkan 1000 point untuk hadiah Mythical ticket.",
  rewardThreshold: 1000
};

const campaignChapters = [
  {
    title: "1. Primordial: The Beginning of Light",
    summary:
      "Player terbangun sebagai The First Soul di dunia kosong. Kumpulkan percikan Api, Air, Angin, Tanah untuk membentuk daratan.",
    boss: "Formless Echo"
  },
  {
    title: "2. Present: The Age of Heroes",
    summary:
      "Dunia berkembang, faksi Tech/Martial/Elemental berebut kuasa. Player menjaga perdamaian sambil merekrut hero seperti Noctis dan Angela.",
    boss: "War Regent Arcton"
  },
  {
    title: "3. New World: The Great Discovery",
    summary:
      "Benua melayang ditemukan. Apexis Cluster diaktifkan untuk pertahanan, namun membuka gerbang terlarang.",
    boss: "Apexis Prime Drone"
  },
  {
    title: "4. Abyss Invasion: The Purple Infection",
    summary:
      "Gerbang Abyss meledak, infeksi ungu menyebar, Achlys Alice lahir dari tragedi. Mode horde dan seal gate dimulai.",
    boss: "Abyss Queen Achlys Alice"
  },
  {
    title: "5. The Great Void: The Silent Vacuum",
    summary:
      "Void menghapus warna dan realitas. Cari Omniversal Akashic untuk memulihkan dunia yang terhapus.",
    boss: "Null Devourer"
  },
  {
    title: "6. Chaos and Order: The Divine War",
    summary:
      "Order dan Chaos turun tangan. Player harus memilih jalur aturan absolut atau kebebasan liar.",
    boss: "Genesis Shar"
  },
  {
    title: "7. Future: The Neon Redemption",
    summary:
      "Umat manusia kabur ke masa depan cyberpunk. Lawan AI gila sambil mencari cara menambal masa lalu.",
    boss: "Omega Magistrate AI"
  },
  {
    title: "8. Apocalypse: The Falling Stars",
    summary:
      "Rencana time travel gagal. Bintang jatuh, lautan mendidih, evakuasi menuju The Last Bastion.",
    boss: "Meteor Seraph"
  },
  {
    title: "9. Armageddon: The Final Stand",
    summary:
      "Abyss, Chaos, Order, dan manusia bertempur di padang akhir. Semua build gacha diuji habis-habisan.",
    boss: "Everblight Shah Torre"
  },
  {
    title: "10. The End: The Great Reset",
    summary:
      "Semua hancur dan player kembali ke kehampaan awal. Tekan Reset untuk New Game+ dengan dunia lebih brutal.",
    boss: "The Reset Core"
  }
];

const el = {
  gemsValue: document.getElementById("gemsValue"),
  goldValue: document.getElementById("goldValue"),
  evoTokenValue: document.getElementById("evoTokenValue"),
  pityValue: document.getElementById("pityValue"),
  rankScoreValue: document.getElementById("rankScoreValue"),
  eventPointValue: document.getElementById("eventPointValue"),
  dailyRewardButton: document.getElementById("dailyRewardButton"),
  gachaButton: document.getElementById("gachaButton"),
  evolveButton: document.getElementById("evolveButton"),
  result: document.getElementById("result"),
  runDungeonButton: document.getElementById("runDungeonButton"),
  dungeonLog: document.getElementById("dungeonLog"),
  eventInfo: document.getElementById("eventInfo"),
  eventClaimButton: document.getElementById("eventClaimButton"),
  eventLog: document.getElementById("eventLog"),
  shopList: document.getElementById("shopList"),
  shopInfo: document.getElementById("shopInfo"),
  shopTabGeneral: document.getElementById("shopTabGeneral"),
  shopTabPremium: document.getElementById("shopTabPremium"),
  shopTabBlackMarket: document.getElementById("shopTabBlackMarket"),
  inventoryList: document.getElementById("inventoryList"),
  characterSelect: document.getElementById("characterSelect"),
  characterDetail: document.getElementById("characterDetail"),
  equipGrid: document.getElementById("equipGrid"),
  teamSelectors: document.getElementById("teamSelectors"),
  resonanceOutput: document.getElementById("resonanceOutput"),
  leaderboard: document.getElementById("leaderboard"),
  loreText: document.getElementById("loreText"),
  supabaseUrl: document.getElementById("supabaseUrl"),
  supabaseKey: document.getElementById("supabaseKey"),
  saveConfigButton: document.getElementById("saveConfigButton"),
  disconnectButton: document.getElementById("disconnectButton"),
  supabaseStatus: document.getElementById("supabaseStatus"),
  awakenButton: document.getElementById("awakenButton"),
  weaponGachaButton: document.getElementById("weaponGachaButton"),
  skillTreeButton: document.getElementById("skillTreeButton"),
  petRollButton: document.getElementById("petRollButton"),
  progressionLog: document.getElementById("progressionLog"),
  petInfo: document.getElementById("petInfo"),
  exchangeButton: document.getElementById("exchangeButton"),
  monthlyPassButton: document.getElementById("monthlyPassButton"),
  topupButton: document.getElementById("topupButton"),
  blackMarketButton: document.getElementById("blackMarketButton"),
  economyLog: document.getElementById("economyLog"),
  blackMarketList: document.getElementById("blackMarketList"),
  reactionTestButton: document.getElementById("reactionTestButton"),
  autoBattleButton: document.getElementById("autoBattleButton"),
  bossButton: document.getElementById("bossButton"),
  comboButton: document.getElementById("comboButton"),
  towerButton: document.getElementById("towerButton"),
  battleLog: document.getElementById("battleLog"),
  friendPointButton: document.getElementById("friendPointButton"),
  mercenaryButton: document.getElementById("mercenaryButton"),
  guildButton: document.getElementById("guildButton"),
  dormButton: document.getElementById("dormButton"),
  galleryButton: document.getElementById("galleryButton"),
  voiceButton: document.getElementById("voiceButton"),
  socialLog: document.getElementById("socialLog"),
  chatLog: document.getElementById("chatLog"),
  breakGaugeButton: document.getElementById("breakGaugeButton"),
  hazardButton: document.getElementById("hazardButton"),
  supportSlotButton: document.getElementById("supportSlotButton"),
  chainComboButton: document.getElementById("chainComboButton"),
  ultimateSpeedButton: document.getElementById("ultimateSpeedButton"),
  deepBattleLog: document.getElementById("deepBattleLog"),
  signatureResonanceButton: document.getElementById("signatureResonanceButton"),
  relicAugmentButton: document.getElementById("relicAugmentButton"),
  talentAwakeningButton: document.getElementById("talentAwakeningButton"),
  bondButton: document.getElementById("bondButton"),
  growthLog: document.getElementById("growthLog"),
  guildRaidButton: document.getElementById("guildRaidButton"),
  rentMercButton: document.getElementById("rentMercButton"),
  guildSkillButton: document.getElementById("guildSkillButton"),
  guildLog: document.getElementById("guildLog"),
  dispatchButton: document.getElementById("dispatchButton"),
  checkinButton: document.getElementById("checkinButton"),
  battlePassButton: document.getElementById("battlePassButton"),
  secretShopButton: document.getElementById("secretShopButton"),
  lifestyleLog: document.getElementById("lifestyleLog"),
  secretShopList: document.getElementById("secretShopList"),
  roguelikeButton: document.getElementById("roguelikeButton"),
  survivalButton: document.getElementById("survivalButton"),
  bossRushButton: document.getElementById("bossRushButton"),
  miniGameButton: document.getElementById("miniGameButton"),
  contentLog: document.getElementById("contentLog")
};

const state = {
  gems: 3200,
  gold: 5000,
  evoTokens: 0,
  pity: 0,
  guaranteedFeatured: false,
  rankScore: 1200,
  eventPoint: 0,
  inventory: [],
  owned: {},
  fullPotential: {},
  selectedCharacter: "",
  lastPulled: "",
  awakening: {},
  skillTree: {},
  pets: [],
  selectedPet: "",
  wishlist: [],
  scraps: 0,
  monthlyPass: 0,
  firstTopupUsed: false,
  blackMarket: [],
  friendshipPoints: 0,
  guildLevel: 1,
  dormLevel: 1,
  galleryCount: 0,
  towerFloor: 1,
  autoPriority: "Balanced",
  breakGauge: 100,
  stunTurns: 0,
  hazardTurn: 0,
  shieldActive: false,
  supportSlots: ["", ""],
  ultimateSkip: false,
  ultiSpeed: 1,
  bond: {},
  guildRaidHP: 1000000000000,
  guildAttackBuff: 0,
  dispatch: null,
  checkinDays: 0,
  battlePassXP: 0,
  premiumPass: false,
  secretShop: [],
  roguelikeFloor: 0,
  survivalWave: 0,
  shopTab: "general",
  stamina: 100,
  normalTickets: 0,
  mythicalTickets: 0,
  weaponTickets: 0
};

for (const c of characters) {
  state.owned[c.name] = 0;
  state.fullPotential[c.name] = false;
  state.awakening[c.name] = 0;
  state.skillTree[c.name] = { offense: 0, defense: 0 };
  state.bond[c.name] = 0;
}

let supabaseClient = null;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFrom(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function saveState() {
  localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem(PLAYER_STATE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed);
  } catch {
    // ignore
  }
}

function updateHUD() {
  el.gemsValue.textContent = state.gems;
  el.goldValue.textContent = state.gold;
  el.evoTokenValue.textContent = state.evoTokens;
  el.pityValue.textContent = `${state.pity}/20`;
  el.rankScoreValue.textContent = state.rankScore;
  el.eventPointValue.textContent = state.eventPoint;
}

function chooseRarity() {
  if (state.pity + 1 >= 20) return "Mythical";
  const roll = Math.random();
  let sum = 0;
  for (const r of rateTable) {
    sum += r.chance;
    if (roll <= sum) return r.rarity;
  }
  return "Rare";
}

function gachaPull() {
  if (state.gems < PULL_COST) return (el.result.textContent = "Gems tidak cukup.");
  state.gems -= PULL_COST;

  const rarity = chooseRarity();
  let pool = characters.filter((c) => c.rarity === rarity);
  if (rarity === "Mythical" && state.wishlist.length) {
    const wishPool = pool.filter((c) => state.wishlist.includes(c.name));
    if (wishPool.length && Math.random() < 0.7) pool = wishPool;
  }
  if (rarity === "Mythical" && state.guaranteedFeatured) {
    pool = pool.filter((c) => c.featured);
  }

  const char = randomFrom(pool);
  state.lastPulled = char.name;
  state.selectedCharacter = char.name;
  state.owned[char.name] = Math.min((state.owned[char.name] || 0) + 1, 6);
  state.evoTokens += evoReward[char.rarity] || 50;
  state.scraps += rarity === "Rare" ? 2 : 1;

  if (rarity === "Mythical") {
    state.pity = 0;
    state.guaranteedFeatured = !char.featured;
  } else {
    state.pity += 1;
  }

  const power = computeCharacterPower(char.name);
  const sig = char.rarity === "Mythical" ? `<p>Signature Weapon: <strong>${char.signatureWeapon}</strong></p>` : "";

  el.result.innerHTML = `
    <h3>${char.name} (${char.rarity})</h3>
    <p>Elemen: ${char.elements.join(", ")}</p>
    <p>Constellation: C${state.owned[char.name]}</p>
    <p>Power: ${power}</p>
    ${sig}
  `;

  renderCharacterSelect();
  renderCharacterDetail();
  renderResonance();
  saveState();
  updateHUD();
  savePullToSupabase(char, power);
}

function evolveSelected() {
  const name = state.selectedCharacter || state.lastPulled;
  if (!name) return (el.result.textContent = "Belum ada karakter dipilih.");
  if (state.fullPotential[name]) return (el.result.textContent = `${name} sudah full potensi.`);
  if (state.evoTokens < FULL_POTENTIAL_COST) return (el.result.textContent = "Evo token kurang.");

  state.evoTokens -= FULL_POTENTIAL_COST;
  state.fullPotential[name] = true;
  el.result.textContent = `${name} berhasil evolusi ke FULL POTENSI.`;
  renderCharacterDetail();
  saveState();
  updateHUD();
}

function runDungeon() {
  const selected = state.selectedCharacter;
  if (!selected) return (el.dungeonLog.textContent = "Pilih karakter dulu.");

  const power = computeCharacterPower(selected);
  const enemy = 5000 + randomInt(-700, 1200);
  const win = power >= enemy * 0.65;

  if (win) {
    const gold = randomInt(350, 650);
    const eventPt = randomInt(80, 130);
    state.gold += gold;
    state.rankScore += 30;
    state.eventPoint += Math.round(eventPt * 1.3);
    el.dungeonLog.textContent = `MENANG! +${gold} gold, +30 rank, +${Math.round(eventPt * 1.3)} event point.`;
  } else {
    state.rankScore = Math.max(0, state.rankScore - 10);
    el.dungeonLog.textContent = "Kalah tipis. Rank -10.";
  }

  renderLeaderboard();
  saveState();
  updateHUD();
}

function getItemsByTab(tab) {
  if (tab === "black") {
    const pool = shopItems.filter((item) => item.tab === "black");
    return pool.sort(() => Math.random() - 0.5).slice(0, 10);
  }
  return shopItems.filter((item) => item.tab === tab);
}

function renderShop() {
  const tab = state.shopTab || "general";
  const items = getItemsByTab(tab);
  el.shopInfo.textContent =
    tab === "general"
      ? "General Shop (pakai Gold): EXP, stamina, material dasar."
      : tab === "premium"
      ? "Premium Shop (pakai Gems): ticket, skin, reset, item premium."
      : "Black Market (acak & langka): diskon besar, stok terbatas.";

  el.shopList.innerHTML = "";
  for (const item of items) {
    const row = document.createElement("div");
    row.className = "shop-item";
    const powerText = item.power ? ` | +${item.power} power` : "";
    row.innerHTML = `<span>${item.name} - ${item.cost} ${item.currency}${powerText}</span>`;
    const btn = document.createElement("button");
    btn.textContent = "Beli";
    btn.type = "button";
    btn.onclick = () => buyItem(item);
    row.appendChild(btn);
    el.shopList.appendChild(row);
  }
}

function applyItemEffect(item) {
  switch (item.effect) {
    case "stamina_50":
      state.stamina = Math.min(200, (state.stamina || 0) + 50);
      break;
    case "normal_ticket":
      state.normalTickets += 1;
      break;
    case "mythic_ticket":
      state.mythicalTickets += 1;
      break;
    case "weapon_ticket":
      state.weaponTickets += 1;
      break;
    case "evo_token":
      state.evoTokens += 50;
      break;
    case "guild_point_500":
      state.guildAttackBuff += 1;
      break;
    case "double_gold_1h":
      state.gold += 400;
      break;
    case "mystery": {
      if (Math.random() < 0.08) {
        const m = characters.find((c) => c.rarity === "Mythical");
        if (m) state.owned[m.name] = Math.min(6, (state.owned[m.name] || 0) + 1);
      }
      break;
    }
    default:
      break;
  }
}

function buyItem(item) {
  const canBuy = item.currency === "gold" ? state.gold >= item.cost : state.gems >= item.cost;
  if (!canBuy) return;

  if (item.currency === "gold") state.gold -= item.cost;
  else state.gems -= item.cost;

  state.inventory.push({ ...item, uid: `${item.id}-${Date.now()}-${Math.random()}` });
  applyItemEffect(item);
  renderInventory();
  renderCharacterSelect();
  renderCharacterDetail();
  saveState();
  updateHUD();
}

function renderInventory() {
  el.inventoryList.innerHTML = "";
  if (state.inventory.length === 0) {
    el.inventoryList.innerHTML = "<li>Inventory kosong.</li>";
    return;
  }
  state.inventory.slice(-20).forEach((i) => {
    const li = document.createElement("li");
    li.textContent = `${i.name} [${i.type}] (+${i.power})`;
    el.inventoryList.appendChild(li);
  });
}

function getCharacterByName(name) {
  return characters.find((c) => c.name === name);
}

function computeCharacterPower(name) {
  const character = getCharacterByName(name);
  if (!character) return 0;

  const base = character.basePower;
  const constellation = state.owned[name] || 0;
  const fullPot = state.fullPotential[name] ? 1.35 : 1;
  const loadout = state.loadout?.[name] || {};
  let equipPower = 0;

  for (const slot of [...artifactSlots, ...armorSlots, ...singleSlots]) {
    if (loadout[slot]) {
      const it = state.inventory.find((x) => x.uid === loadout[slot]);
      if (it) equipPower += it.power;
    }
  }

  const talent = Number(loadout.talent || 1);
  return Math.round((base + equipPower) * (1 + constellation * 0.08) * fullPot * (1 + talent * 0.02));
}

function renderCharacterSelect() {
  const ownedNames = Object.keys(state.owned).filter((name) => state.owned[name] > 0);
  el.characterSelect.innerHTML = ownedNames.length
    ? ownedNames.map((name) => `<option value="${name}">${name} (C${state.owned[name]})</option>`).join("")
    : "<option value=''>Belum ada</option>";

  if (!state.selectedCharacter && ownedNames.length) state.selectedCharacter = ownedNames[0];
  if (state.selectedCharacter) el.characterSelect.value = state.selectedCharacter;
}

function initLoadoutIfMissing(name) {
  if (!state.loadout) state.loadout = {};
  if (!state.loadout[name]) {
    state.loadout[name] = {
      artifact1: "",
      artifact2: "",
      artifact3: "",
      artifact4: "",
      artifact5: "",
      armor1: "",
      armor2: "",
      armor3: "",
      armor4: "",
      weapon: "",
      relic: "",
      accessory: "",
      gear: "",
      constellation: state.owned[name] || 0,
      talent: 1
    };
  }
}

function itemsByType(type) {
  return state.inventory.filter((i) => i.type === type);
}

function renderLoadout() {
  const name = state.selectedCharacter;
  el.equipGrid.innerHTML = "";
  if (!name) return;

  initLoadoutIfMissing(name);
  const loadout = state.loadout[name];

  for (const slot of allSlots) {
    const wrapper = document.createElement("div");
    wrapper.className = "slot-box";
    const label = document.createElement("label");
    label.textContent = slot;
    const select = document.createElement("select");

    if (slot === "constellation") {
      select.innerHTML = Array.from({ length: 7 }, (_, i) => `<option value="${i}">C${i}</option>`).join("");
      select.value = String(state.owned[name] || 0);
      select.disabled = true;
    } else if (slot === "talent") {
      select.innerHTML = Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}">Talent ${i + 1}</option>`).join("");
      select.value = String(loadout.talent || 1);
      select.onchange = () => {
        loadout.talent = Number(select.value);
        renderCharacterDetail();
        saveState();
      };
    } else {
      const type = slot.startsWith("artifact") ? "artifact" : slot.startsWith("armor") ? "armor" : slot;
      const options = itemsByType(type);
      select.innerHTML = [`<option value="">- none -</option>`, ...options.map((i) => `<option value="${i.uid}">${i.name}</option>`)].join("");
      select.value = loadout[slot] || "";
      select.onchange = () => {
        loadout[slot] = select.value;
        renderCharacterDetail();
        saveState();
      };
    }

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    el.equipGrid.appendChild(wrapper);
  }
}

function renderCharacterDetail() {
  const name = state.selectedCharacter;
  if (!name) return (el.characterDetail.textContent = "Belum ada karakter.");
  const c = getCharacterByName(name);
  const pow = computeCharacterPower(name);
  const sig = c.rarity === "Mythical" ? `Signature Weapon: ${c.signatureWeapon}` : "";

  el.characterDetail.innerHTML = `
    <p><strong>${c.name}</strong> - ${c.rarity}</p>
    <p>Elemen: ${c.elements.join(", ")}</p>
    <p>Constellation: C${state.owned[name]}</p>
    <p>Talent: ${state.loadout?.[name]?.talent || 1}</p>
    <p>Status: ${state.fullPotential[name] ? "FULL POTENSI" : "Normal"}</p>
    <p>Power: ${pow}</p>
    <p>${sig}</p>
    <p>Lore: ${c.lore}</p>
  `;
  renderLoadout();
}

function renderTeamSelectors() {
  el.teamSelectors.innerHTML = "";
  const ownedNames = Object.keys(state.owned).filter((name) => state.owned[name] > 0);

  for (let i = 0; i < 4; i += 1) {
    const sel = document.createElement("select");
    sel.dataset.idx = String(i);
    sel.innerHTML = [`<option value="">Slot ${i + 1}</option>`, ...ownedNames.map((n) => `<option value="${n}">${n}</option>`)].join("");
    sel.onchange = renderResonance;
    el.teamSelectors.appendChild(sel);
  }
}

function renderResonance() {
  const picks = [...el.teamSelectors.querySelectorAll("select")].map((s) => s.value).filter(Boolean);
  if (!picks.length) return (el.resonanceOutput.textContent = "Belum ada team.");

  const counter = {};
  for (const name of picks) {
    const c = getCharacterByName(name);
    c.elements.forEach((e) => {
      counter[e] = (counter[e] || 0) + 1;
    });
  }

  const active = Object.entries(counter)
    .filter(([, v]) => v >= 2)
    .map(([k, v]) => `${k} Resonance Lv${Math.min(3, v - 1)}`);

  el.resonanceOutput.textContent = active.length ? active.join(" | ") : "Belum ada resonance aktif.";
}

function renderLeaderboard() {
  const bots = [
    { name: "Nova", score: 3500 },
    { name: "Kenshi", score: 3200 },
    { name: "Aoki", score: 2800 },
    { name: "Rin", score: 2400 }
  ];

  const rows = [...bots, { name: "You", score: state.rankScore }]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((r) => `<li>${r.name} - ${r.score}</li>`)
    .join("");

  el.leaderboard.innerHTML = rows;
}

function renderEvent() {
  el.eventInfo.textContent = `${eventState.name}: ${eventState.description}`;
}

function claimEvent() {
  if (state.eventPoint < eventState.rewardThreshold) {
    el.eventLog.textContent = `Butuh ${eventState.rewardThreshold - state.eventPoint} point lagi.`;
    return;
  }

  state.eventPoint -= eventState.rewardThreshold;
  state.gems += 800;
  state.evoTokens += 240;
  el.eventLog.textContent = "Hadiah event claimed: +800 gems, +240 evo token.";
  saveState();
  updateHUD();
}

function renderLore() {
  el.loreText.innerHTML = campaignChapters
    .map(
      (chapter) => `
      <article class="timeline-card">
        <h3>${chapter.title}</h3>
        <p>${chapter.summary}</p>
        <p><strong>Boss Chapter:</strong> ${chapter.boss}</p>
      </article>
    `
    )
    .join("");
}

function setSupabaseStatus(msg, isError = false) {
  el.supabaseStatus.textContent = msg;
  el.supabaseStatus.style.color = isError ? "#fecaca" : "#bfdbfe";
}

function getConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function initSupabase(url, key) {
  if (!window.supabase?.createClient) return setSupabaseStatus("SDK Supabase tidak termuat.", true);
  supabaseClient = window.supabase.createClient(url, key);
  setSupabaseStatus("Supabase aktif.");
}

async function savePullToSupabase(char, power) {
  if (!supabaseClient) return;
  const { error } = await supabaseClient.from("gacha_history").insert({
    character_name: char.name,
    rarity: char.rarity,
    elements: char.elements,
    constellation: state.owned[char.name],
    power_score: power,
    evo_tokens_after_pull: state.evoTokens,
    full_potential: state.fullPotential[char.name],
    event_point: state.eventPoint,
    rank_score: state.rankScore,
    rolled_at: new Date().toISOString()
  });

  if (error) setSupabaseStatus(`Gagal simpan: ${error.message}`, true);
}



function refreshBlackMarket() {
  state.blackMarket = Array.from({ length: 3 }, () => randomFrom(shopItems)).map((item, idx) => ({
    ...item,
    cost: Math.round(item.cost * (0.4 + idx * 0.15))
  }));
  el.blackMarketList.innerHTML = state.blackMarket
    .map((item) => `<div class="shop-item"><span>${item.name} - ${item.cost} gold</span><button type="button" data-bm="${item.id}">Buy</button></div>`)
    .join("");

  [...el.blackMarketList.querySelectorAll("button[data-bm]")].forEach((btn, idx) => {
    btn.onclick = () => {
      const item = state.blackMarket[idx];
      if (!item || state.gold < item.cost) return;
      state.gold -= item.cost;
      state.inventory.push({ ...item, uid: `${item.id}-bm-${Date.now()}-${Math.random()}` });
      el.economyLog.textContent = `Black Market purchase: ${item.name}`;
      renderInventory();
      updateHUD();
      saveState();
    };
  });
}

function emitChat(message) {
  const current = el.chatLog.textContent ? `${el.chatLog.textContent}\n` : "";
  el.chatLog.textContent = `${current}${message}`.split("\n").slice(-5).join("\n");
}

function playVoiceLine() {
  const name = state.selectedCharacter || state.lastPulled;
  if (!name) return (el.socialLog.textContent = "Pilih karakter dulu untuk voice line.");
  const lines = [
    `${name}: 'Kemenangan adalah takdirku.'`,
    `${name}: 'Aku siap bertarung kapan pun.'`,
    `${name}: 'Jangan remehkan kekuatanku.'`
  ];
  el.socialLog.textContent = randomFrom(lines);
}

function runAdvancedFeatures(action) {
  const selected = state.selectedCharacter || state.lastPulled;
  switch (action) {
    case "awakening": {
      if (!selected) return (el.progressionLog.textContent = "Pilih karakter dulu.");
      if ((state.awakening[selected] || 0) >= 3) return (el.progressionLog.textContent = `${selected} sudah Awakening MAX.`);
      if (state.gold < 2000) return (el.progressionLog.textContent = "Gold kurang untuk Awakening.");
      state.gold -= 2000;
      state.awakening[selected] += 1;
      el.progressionLog.textContent = `${selected} Awakening +1 (nama karakter bersinar).`;
      break;
    }
    case "skill": {
      if (!selected) return (el.progressionLog.textContent = "Pilih karakter dulu.");
      const tree = state.skillTree[selected] || { offense: 0, defense: 0 };
      if (state.gold < 500) return (el.progressionLog.textContent = "Gold kurang untuk skill tree.");
      state.gold -= 500;
      if (tree.offense <= tree.defense) tree.offense += 1;
      else tree.defense += 1;
      state.skillTree[selected] = tree;
      el.progressionLog.textContent = `${selected} skill tree upgraded (Off ${tree.offense} / Def ${tree.defense}).`;
      break;
    }
    case "weaponGacha": {
      if (state.gems < 120) return (el.progressionLog.textContent = "Gems kurang untuk weapon gacha.");
      state.gems -= 120;
      const candidates = shopItems.filter((i) => i.type === "weapon");
      const weapon = randomFrom(candidates);
      state.inventory.push({ ...weapon, uid: `${weapon.id}-wg-${Date.now()}`, power: weapon.power + randomInt(20, 80) });
      el.progressionLog.textContent = `Weapon gacha dapat ${weapon.name}.`;
      emitChat(`System: Player mendapatkan weapon ${weapon.name}!`);
      renderInventory();
      break;
    }
    case "pet": {
      const petNames = ["Drako", "Mochi", "VoltFox", "AstraCat", "VoidPup"];
      const pet = randomFrom(petNames);
      state.pets.push(pet);
      state.selectedPet = pet;
      el.petInfo.textContent = `Pet baru: ${pet} (pasif +3% tim).`;
      break;
    }
    case "reaction": {
      const reactions = ["Vaporize x2", "Melt x1.8", "Shock Chain", "Abyss Rupture", "Void Collapse"];
      el.battleLog.textContent = `Elemental Reaction aktif: ${randomFrom(reactions)}.`;
      break;
    }
    case "auto": {
      const opts = ["Balanced", "Burst First", "Heal First", "Shield First"];
      const idx = (opts.indexOf(state.autoPriority) + 1) % opts.length;
      state.autoPriority = opts[idx];
      el.battleLog.textContent = `Auto-battle priority: ${state.autoPriority}.`;
      break;
    }
    case "boss": {
      if (!selected) return (el.battleLog.textContent = "Pilih karakter dulu.");
      const c = getCharacterByName(selected);
      const shieldElement = randomFrom(elements);
      const pass = c.elements.includes(shieldElement);
      el.battleLog.textContent = pass
        ? `Shield boss (${shieldElement}) pecah! kamu menang.`
        : `Shield boss kebal ${shieldElement}. butuh elemen sesuai.`;
      break;
    }
    case "combo": {
      const comboPairs = [["Noctis", "Angela"], ["Zarok", "Alice"], ["Nyx", "Rhea"]];
      const hit = comboPairs.find((pair) => pair.every((n) => state.owned[n] > 0));
      el.battleLog.textContent = hit ? `Combo Ultimate aktif: ${hit.join(" + ")}!` : "Belum ada pair combo aktif.";
      break;
    }
    case "tower": {
      const req = randomFrom(elements);
      const selectedChar = getCharacterByName(selected || "");
      if (!selectedChar || !selectedChar.elements.includes(req)) {
        el.battleLog.textContent = `Tower hari ini hanya elemen ${req}. Karakter tidak memenuhi.`;
      } else {
        state.towerFloor += 1;
        state.rankScore += 50;
        el.battleLog.textContent = `Tower clear! Floor sekarang ${state.towerFloor}. +50 rank.`;
        renderLeaderboard();
      }
      break;
    }
    case "exchange": {
      if (state.scraps < 10) {
        state.scraps += 3;
        el.economyLog.textContent = `Scrap belum cukup. Scrap saat ini ${state.scraps}/10.`;
      } else {
        state.scraps -= 10;
        state.gems += 160;
        el.economyLog.textContent = "Exchange sukses: 10 scrap -> 160 gems.";
      }
      break;
    }
    case "monthly": {
      if (state.monthlyPass > 0) return (el.economyLog.textContent = "Monthly pass masih aktif.");
      if (state.gold < 3000) return (el.economyLog.textContent = "Gold kurang untuk monthly pass.");
      state.gold -= 3000;
      state.monthlyPass = 30;
      el.economyLog.textContent = "Monthly pass aktif 30 hari.";
      break;
    }
    case "topup": {
      const base = 500;
      const gain = state.firstTopupUsed ? base : base * 2;
      state.firstTopupUsed = true;
      state.gems += gain;
      el.economyLog.textContent = `Topup sukses +${gain} gems.`;
      break;
    }
    case "friend": {
      state.friendshipPoints += 20;
      emitChat("System: Kamu mengirim friendship points ke teman.");
      el.socialLog.textContent = `Friendship point: ${state.friendshipPoints}.`;
      break;
    }
    case "mercenary": {
      const strong = Object.keys(state.owned).sort((a, b) => computeCharacterPower(b) - computeCharacterPower(a))[0];
      el.socialLog.textContent = strong ? `${strong} dibagikan sebagai mercenary.` : "Belum ada karakter.";
      break;
    }
    case "guild": {
      if (state.gold < 1000) return (el.socialLog.textContent = "Gold kurang untuk upgrade guild.");
      state.gold -= 1000;
      state.guildLevel += 1;
      el.socialLog.textContent = `Guild Territory naik ke Lv.${state.guildLevel} (+buff tim).`;
      break;
    }
    case "dorm": {
      state.dormLevel += 1;
      state.gems += 50;
      el.socialLog.textContent = `Dorm dihias! Lv.${state.dormLevel}. Bonus +50 gems.`;
      break;
    }
    case "gallery": {
      state.galleryCount = Object.values(state.owned).filter((v) => v > 0).length;
      const bonus = state.galleryCount * 5;
      state.gems += bonus;
      el.socialLog.textContent = `Gallery update ${state.galleryCount} entri. Bonus +${bonus} gems.`;
      break;
    }
    default:
      break;
  }

  updateHUD();
  renderCharacterDetail();
  saveState();
}



function refreshSecretShop() {
  state.secretShop = Array.from({ length: 3 }, () => randomFrom(shopItems)).map((item) => ({
    ...item,
    cost: Math.max(50, Math.round(item.cost * 0.1))
  }));
  el.secretShopList.innerHTML = state.secretShop
    .map((item, idx) => `<div class="shop-item"><span>${item.name} (${item.cost}g)</span><button type="button" data-secret="${idx}">Buy</button></div>`)
    .join("");

  [...el.secretShopList.querySelectorAll("button[data-secret]")].forEach((btn) => {
    btn.onclick = () => {
      const item = state.secretShop[Number(btn.dataset.secret)];
      if (!item || state.gold < item.cost) return;
      state.gold -= item.cost;
      state.inventory.push({ ...item, uid: `${item.id}-secret-${Date.now()}-${Math.random()}` });
      el.lifestyleLog.textContent = `Secret Shop purchase: ${item.name}.`;
      renderInventory();
      updateHUD();
      saveState();
    };
  });
}

function runDeepSystems(action) {
  const selected = state.selectedCharacter || state.lastPulled;
  switch (action) {
    case "breakGauge": {
      const hit = randomInt(12, 30);
      state.breakGauge = Math.max(0, state.breakGauge - hit);
      if (state.breakGauge === 0) {
        state.stunTurns = 2;
        state.breakGauge = 100;
        el.deepBattleLog.textContent = "BREAK! Musuh Stun 2 turn, damage x2 aktif.";
      } else {
        el.deepBattleLog.textContent = `Gauge turun ${hit}. Sisa ${state.breakGauge}.`;
      }
      break;
    }
    case "hazard": {
      state.hazardTurn += 1;
      if (state.hazardTurn % 3 === 0) {
        const dmg = state.shieldActive ? 0 : randomInt(120, 220);
        el.deepBattleLog.textContent = dmg
          ? `Void Hazard aktif! Semua unit kena ${dmg} dmg.`
          : "Void Hazard aktif tapi shield menahan damage.";
      } else {
        el.deepBattleLog.textContent = `Turn ${state.hazardTurn}: hazard belum aktif.`;
      }
      break;
    }
    case "support": {
      if (!selected) return (el.deepBattleLog.textContent = "Pilih unit dulu.");
      if (!state.supportSlots[0]) state.supportSlots[0] = selected;
      else if (!state.supportSlots[1]) state.supportSlots[1] = selected;
      else state.supportSlots = [selected, state.supportSlots[0]];
      el.deepBattleLog.textContent = `Support Slot: ${state.supportSlots.filter(Boolean).join(" / ")}`;
      break;
    }
    case "chain": {
      const follow = Math.random() < 0.2;
      el.deepBattleLog.textContent = follow ? "Chain Combo aktif! Follow-up attack terjadi." : "Chain Combo gagal proc.";
      break;
    }
    case "ulti": {
      state.ultimateSkip = !state.ultimateSkip;
      state.ultiSpeed = state.ultimateSkip ? 3 : state.ultiSpeed === 1 ? 2 : 1;
      el.deepBattleLog.textContent = `Ulti mode: ${state.ultimateSkip ? "SKIP" : "NORMAL"} | Speed x${state.ultiSpeed}`;
      break;
    }
    case "signature": {
      if (!selected) return (el.growthLog.textContent = "Pilih karakter dulu.");
      const c = getCharacterByName(selected);
      if (c.rarity !== "Mythical") return (el.growthLog.textContent = `${selected} bukan Mythical.`);
      const hasSig = state.inventory.some((i) => i.type === "weapon" && i.name.toLowerCase().includes(selected.toLowerCase().slice(0, 3)));
      el.growthLog.textContent = hasSig
        ? `${selected} Signature Resonance aktif! Aura khusus menyala.`
        : `${selected} belum pakai signature weapon.`;
      break;
    }
    case "relic": {
      const relic = state.inventory.find((i) => i.type === "relic");
      if (!relic) return (el.growthLog.textContent = "Tidak ada relic untuk di-augment.");
      const bonus = randomInt(5, 30);
      relic.power += bonus;
      el.growthLog.textContent = `Relic ${relic.name} reroll sukses +${bonus} power.`;
      break;
    }
    case "talentAwk": {
      if (!selected) return (el.growthLog.textContent = "Pilih karakter dulu.");
      if ((state.owned[selected] || 0) < 6) return (el.growthLog.textContent = "Butuh C6 untuk Talent Awakening.");
      state.skillTree[selected].offense += 2;
      el.growthLog.textContent = `${selected} Talent Awakening: skill berubah jadi AoE.`;
      break;
    }
    case "bond": {
      if (!selected) return (el.growthLog.textContent = "Pilih karakter dulu.");
      state.bond[selected] = (state.bond[selected] || 0) + 1;
      const lv = state.bond[selected];
      el.growthLog.textContent = lv >= 10
        ? `${selected} Bond Lv.10! Bonus stat + voice line rahasia terbuka.`
        : `${selected} Bond naik ke Lv.${lv}.`;
      break;
    }
    case "guildRaid": {
      const dmg = randomInt(5_000_000, 25_000_000);
      state.guildRaidHP = Math.max(0, state.guildRaidHP - dmg);
      state.gold += 500;
      el.guildLog.textContent = `Raid damage ${dmg.toLocaleString()}! Sisa HP boss: ${state.guildRaidHP.toLocaleString()}`;
      break;
    }
    case "rent": {
      const income = randomInt(80, 220);
      state.gold += income;
      state.friendshipPoints += 15;
      el.guildLog.textContent = `Mercenary rent sukses +${income} gold +15 friendship.`;
      break;
    }
    case "guildSkill": {
      if (state.gold < 1200) return (el.guildLog.textContent = "Gold kurang untuk guild skill.");
      state.gold -= 1200;
      state.guildAttackBuff += 1;
      el.guildLog.textContent = `Guild ATK buff naik ke Lv.${state.guildAttackBuff}.`;
      break;
    }
    case "dispatch": {
      const hours = randomInt(8, 20);
      const reward = randomInt(300, 900);
      state.gold += reward;
      state.dispatch = { hours, reward };
      el.lifestyleLog.textContent = `Dispatch ${hours} jam selesai. Dapat ${reward} gold + material.`;
      break;
    }
    case "checkin": {
      state.checkinDays = Math.min(30, state.checkinDays + 1);
      if (state.checkinDays === 30) {
        state.gems += 1000;
        el.lifestyleLog.textContent = "Check-in hari 30! Legendary reward unlocked +1000 gems.";
      } else {
        el.lifestyleLog.textContent = `Check-in day ${state.checkinDays}/30.`;
      }
      break;
    }
    case "pass": {
      state.battlePassXP += 120;
      if (state.battlePassXP >= 1000 && !state.premiumPass) {
        state.premiumPass = true;
        el.lifestyleLog.textContent = "Battle Pass level up! Premium skin voucher unlocked.";
      } else {
        el.lifestyleLog.textContent = `Battle Pass XP: ${state.battlePassXP}/1000.`;
      }
      break;
    }
    case "roguelike": {
      state.roguelikeFloor += 1;
      const buffs = ["+20% ATK", "+15% Shield", "+25% Crit", "+30% Heal"];
      el.contentLog.textContent = `Labyrinth Floor ${state.roguelikeFloor} clear. Pilih buff: ${randomFrom(buffs)}.`;
      break;
    }
    case "survival": {
      state.survivalWave += randomInt(1, 3);
      const gain = state.survivalWave * 20;
      state.gold += gain;
      el.contentLog.textContent = `Survival wave ${state.survivalWave}. Reward ${gain} gold.`;
      break;
    }
    case "bossRush": {
      const clear = Math.random() < 0.45;
      if (clear) {
        state.rankScore += 250;
        el.contentLog.textContent = "Boss Rush 1-10 clear tanpa jeda healing! +250 rank.";
      } else {
        el.contentLog.textContent = "Boss Rush gagal di chapter akhir. Coba build baru.";
      }
      renderLeaderboard();
      break;
    }
    case "minigame": {
      const gold = randomInt(40, 140);
      state.gold += gold;
      el.contentLog.textContent = `Mini-game lobby selesai. Dapat ${gold} gold.`;
      break;
    }
    default:
      break;
  }

  updateHUD();
  renderCharacterDetail();
  saveState();
}

function bindEvents() {
  el.dailyRewardButton.onclick = () => {
    state.gems += 160;
    state.gold += 300;
    if (state.monthlyPass > 0) {
      state.gems += 90;
      state.monthlyPass -= 1;
    }
    saveState();
    updateHUD();
  };
  el.gachaButton.onclick = gachaPull;
  el.evolveButton.onclick = evolveSelected;
  el.runDungeonButton.onclick = runDungeon;
  el.eventClaimButton.onclick = claimEvent;

  el.shopTabGeneral.onclick = () => {
    state.shopTab = "general";
    state.shopTab = state.shopTab || "general";
  renderShop();
    saveState();
  };
  el.shopTabPremium.onclick = () => {
    state.shopTab = "premium";
    renderShop();
    saveState();
  };
  el.shopTabBlackMarket.onclick = () => {
    state.shopTab = "black";
    renderShop();
    saveState();
  };

  el.awakenButton.onclick = () => runAdvancedFeatures("awakening");
  el.weaponGachaButton.onclick = () => runAdvancedFeatures("weaponGacha");
  el.skillTreeButton.onclick = () => runAdvancedFeatures("skill");
  el.petRollButton.onclick = () => runAdvancedFeatures("pet");
  el.exchangeButton.onclick = () => runAdvancedFeatures("exchange");
  el.monthlyPassButton.onclick = () => runAdvancedFeatures("monthly");
  el.topupButton.onclick = () => runAdvancedFeatures("topup");
  el.blackMarketButton.onclick = refreshBlackMarket;
  el.reactionTestButton.onclick = () => runAdvancedFeatures("reaction");
  el.autoBattleButton.onclick = () => runAdvancedFeatures("auto");
  el.bossButton.onclick = () => runAdvancedFeatures("boss");
  el.comboButton.onclick = () => runAdvancedFeatures("combo");
  el.towerButton.onclick = () => runAdvancedFeatures("tower");
  el.friendPointButton.onclick = () => runAdvancedFeatures("friend");
  el.mercenaryButton.onclick = () => runAdvancedFeatures("mercenary");
  el.guildButton.onclick = () => runAdvancedFeatures("guild");
  el.dormButton.onclick = () => runAdvancedFeatures("dorm");
  el.galleryButton.onclick = () => runAdvancedFeatures("gallery");
  el.voiceButton.onclick = playVoiceLine;

  el.breakGaugeButton.onclick = () => runDeepSystems("breakGauge");
  el.hazardButton.onclick = () => runDeepSystems("hazard");
  el.supportSlotButton.onclick = () => runDeepSystems("support");
  el.chainComboButton.onclick = () => runDeepSystems("chain");
  el.ultimateSpeedButton.onclick = () => runDeepSystems("ulti");
  el.signatureResonanceButton.onclick = () => runDeepSystems("signature");
  el.relicAugmentButton.onclick = () => runDeepSystems("relic");
  el.talentAwakeningButton.onclick = () => runDeepSystems("talentAwk");
  el.bondButton.onclick = () => runDeepSystems("bond");
  el.guildRaidButton.onclick = () => runDeepSystems("guildRaid");
  el.rentMercButton.onclick = () => runDeepSystems("rent");
  el.guildSkillButton.onclick = () => runDeepSystems("guildSkill");
  el.dispatchButton.onclick = () => runDeepSystems("dispatch");
  el.checkinButton.onclick = () => runDeepSystems("checkin");
  el.battlePassButton.onclick = () => runDeepSystems("pass");
  el.secretShopButton.onclick = refreshSecretShop;
  el.roguelikeButton.onclick = () => runDeepSystems("roguelike");
  el.survivalButton.onclick = () => runDeepSystems("survival");
  el.bossRushButton.onclick = () => runDeepSystems("bossRush");
  el.miniGameButton.onclick = () => runDeepSystems("minigame");

  el.characterSelect.onchange = () => {
    state.selectedCharacter = el.characterSelect.value;
    renderCharacterDetail();
    saveState();
  };

  el.saveConfigButton.onclick = () => {
    const url = el.supabaseUrl.value.trim();
    const key = el.supabaseKey.value.trim();
    if (!url || !key) return setSupabaseStatus("URL/Key wajib diisi.", true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ url, key }));
    initSupabase(url, key);
  };

  el.disconnectButton.onclick = () => {
    localStorage.removeItem(STORAGE_KEY);
    supabaseClient = null;
    setSupabaseStatus("Supabase disconnected.");
  };
}

function bootstrap() {
  loadState();
  bindEvents();
  renderShop();
  renderInventory();
  renderCharacterSelect();
  renderCharacterDetail();
  renderTeamSelectors();
  renderResonance();
  renderLeaderboard();
  renderEvent();
  renderLore();
  refreshBlackMarket();
  refreshSecretShop();
  state.wishlist = state.wishlist?.length ? state.wishlist : characters.slice(0, 5).map((c) => c.name);
  emitChat("System: Player X baru saja mendapatkan Zarok!");
  updateHUD();

  const cfg = getConfig();
  if (cfg?.url && cfg?.key) {
    el.supabaseUrl.value = cfg.url;
    el.supabaseKey.value = cfg.key;
    initSupabase(cfg.url, cfg.key);
  }
}

bootstrap();

