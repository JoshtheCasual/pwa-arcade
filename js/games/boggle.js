class Boggle {
    constructor() {
        this.name = 'Boggle';
        this.grid = [];
        this.foundWords = [];
        this.allWords = [];
        this.currentInput = '';
        this.score = 0;
        this.timeLeft = 180;
        this.timer = null;
        this.roundOver = false;
        this.dice = [
            'AAEEGN','ABBJOO','ACHOPS','AFFKPS','AOOTTW','CIMOTU','DEILRX','DELRVY',
            'DISTTY','EEGHNW','EEINSU','EHRTVW','EIOSST','ELRTTY','HIMNQU','HLNNRZ'
        ];
        this.dictionary = null;
    }

    init(gameArea, statusArea, controlsArea) {
        this.gameArea = gameArea;
        this.statusArea = statusArea;
        this.controlsArea = controlsArea;
        this.buildDictionary();
        this.reset();
    }

    buildDictionary() {
        const words = [
            'ace','ache','acme','acne','acre','act','add','ado','ads','aft','age','aged','ago','aid','aide','aim',
            'air','aisle','ale','all','ally','also','alter','and','angel','anger','angle','ant','ante','any','ape',
            'apt','arc','arch','are','area','aria','ark','arm','art','ash','ask','ate','atop','auto','avid','awe',
            'awl','axe','aye','back','bad','bag','bail','bait','bake','bald','bale','ball','ban','band','bane',
            'bang','bank','bar','bare','bark','barn','base','bash','bask','bass','bat','batch','bath','bay','bead',
            'beak','beam','bean','bear','beat','bed','bee','beef','been','beer','bell','belt','bend','bent','best',
            'bet','bid','big','bike','bill','bin','bind','bird','bit','bite','blade','blame','bland','blank',
            'blast','blaze','bleak','bleed','blend','bless','blew','blind','bliss','blitz','bloat','blob','block',
            'bloke','blond','blood','bloom','blow','blown','blue','blur','blurt','blush','board','boast','boat',
            'body','bog','boil','bold','bolt','bomb','bond','bone','bonus','book','boom','boost','boot','bore',
            'born','boss','both','bout','bow','bowl','box','boy','brace','brad','brag','braid','brain','brake',
            'brand','brass','brave','bread','break','breed','brew','brick','bride','brief','brim','bring','brink',
            'brisk','broad','broil','broke','brook','broom','broth','brown','brush','buck','bud','bug','build',
            'bulk','bull','bump','bunch','bunk','burn','burst','bus','bush','bust','busy','but','buy','cab','cage',
            'cake','call','calm','came','camp','can','cane','cap','cape','car','card','care','carol','carry','cart',
            'case','cash','cast','cat','catch','cave','cell','chain','chair','chalk','champ','chance','change',
            'chant','chap','charm','chart','chase','chat','cheap','cheat','check','cheek','cheer','chess','chest',
            'chew','chief','child','chill','chin','chip','choir','choke','chord','chore','chose','chunk','cite',
            'city','clad','claim','clam','clamp','clan','clap','clash','clasp','class','claw','clay','clean',
            'clear','clerk','click','cliff','climb','cling','clip','cloak','clock','clone','close','cloth',
            'cloud','clown','club','clue','clump','clung','coach','coal','coast','coat','code','coil','coin',
            'cold','comet','comic','cone','cook','cool','cope','copy','coral','cord','core','cork','corn',
            'cost','cosy','couch','could','count','court','cover','cow','crack','craft','cramp','crane','crash',
            'crate','crawl','crazy','creak','cream','creek','creep','crest','crew','crime','crisp','cross',
            'crowd','crown','crude','crush','cry','cube','cult','cup','curb','cure','curl','curve','cut','cute',
            'cycle','dad','daily','dam','damp','dance','dare','dark','darn','dart','dash','data','date','dawn',
            'day','dead','deaf','deal','dear','death','debt','decay','deck','deed','deem','deep','deer','delay',
            'delta','den','dense','dent','deny','desk','detail','dew','dial','dice','did','die','diet','dig',
            'dim','dime','dine','dip','dire','dirt','disc','dish','disk','ditch','dive','dock','dog','doll',
            'dome','done','doom','door','dose','dot','doubt','dough','dove','down','doze','draft','drag','drain',
            'drake','drama','drank','drape','draw','drawn','dread','dream','dress','drew','dried','drift','drill',
            'drink','drip','drive','drop','drove','drum','dry','duck','due','duel','duet','dug','duke','dull',
            'dumb','dump','dune','dung','dusk','dust','duty','dye','each','eagle','ear','earl','earn','earth',
            'ease','east','easy','eat','echo','edge','edit','eel','egg','eight','either','elbow','elder','elect',
            'elite','elm','else','emit','end','enemy','enjoy','enter','entry','equal','era','error','escape',
            'essay','eve','even','event','ever','every','evil','exact','exam','excel','exit','eye','face','fact',
            'fade','fail','faint','fair','fairy','faith','fake','fall','fame','fan','fancy','fang','far','fare',
            'farm','fast','fat','fate','fault','favor','fear','feast','feat','fed','fee','feed','feel','feet',
            'fell','felt','fence','fern','ferry','fest','fetch','fever','few','fiber','field','fiend','fierce',
            'fig','fight','file','fill','film','final','find','fine','fire','firm','first','fish','fist','fit',
            'five','fix','flag','flake','flame','flap','flare','flash','flask','flat','flaw','flea','fled','flee',
            'flesh','flew','flex','flick','flies','fling','flip','flit','float','flock','flood','floor','flop',
            'flour','flow','fluid','flung','flush','fly','foam','fog','foil','fold','folk','fond','font','food',
            'fool','foot','for','force','ford','form','fort','forth','foul','found','four','fox','frame','frank',
            'fraud','free','fresh','fret','frog','from','front','frost','frown','froze','fruit','fry','fuel',
            'full','fun','fund','fur','fury','fuse','fuss','gain','gale','game','gang','gap','gape','gas','gasp',
            'gate','gauge','gave','gaze','gear','gem','gene','ghost','giant','gift','girl','give','glad','glam',
            'gland','glare','glass','gleam','glee','glide','glimpse','globe','gloom','glory','gloss','glow',
            'glue','gnaw','goal','goat','god','goes','gold','golf','gone','good','goose','gorge','got','govern',
            'gown','grab','grace','grade','grain','grand','grant','grape','graph','grasp','grass','grave','gray',
            'graze','great','greed','green','greet','grew','grey','grief','grill','grim','grin','grind','grip',
            'groan','groom','gross','ground','group','grove','grow','grown','growth','guard','guess','guest',
            'guide','guilt','gulf','gum','gun','guru','gust','gut','gym','habit','hack','had','hail','hair',
            'half','hall','halt','ham','hammer','hand','handle','hang','happen','happy','harbor','hard','hare',
            'harm','harp','harsh','has','haste','hat','hatch','hate','haul','have','hawk','hay','head','heal',
            'health','heap','hear','heard','heart','heat','hedge','heel','height','held','hell','hello','help',
            'hem','hen','her','herb','herd','here','hero','hid','hide','high','hike','hill','him','hind','hint',
            'hip','hire','his','hit','hive','hog','hold','hole','hollow','holy','home','honest','honey','honor',
            'hood','hook','hope','horn','horse','host','hot','hotel','hound','hour','house','how','howl','hub',
            'hue','hug','huge','hull','human','humble','humor','hundred','hung','hunt','hurl','hurry','hurt',
            'hut','ice','icy','idea','idle','idol','ill','image','immune','impact','imply','import','impose',
            'inch','income','index','indoor','infant','inform','inject','ink','inn','inner','input','insect',
            'inside','insist','install','instant','insult','intact','intend','intent','into','invade','invent',
            'invest','invite','iron','island','isolate','issue','itch','item','ivory','ivy','jab','jack','jade',
            'jail','jam','jar','jaw','jazz','jean','jelly','jet','jewel','job','jog','join','joint','joke','jolly',
            'jolt','journal','journey','joy','judge','jug','juice','jump','jungle','junior','jury','just','keen',
            'keep','kept','key','kick','kid','kill','kind','king','kiss','kit','kite','knee','kneel','knew',
            'knife','knit','knob','knock','knot','know','known','lab','lace','lack','lad','laden','lady','lag',
            'laid','lake','lamb','lame','lamp','land','lane','lap','large','laser','lash','lass','last','late',
            'latin','laugh','launch','lava','law','lawn','lay','layer','lazy','lead','leaf','leak','lean','leap',
            'learn','lease','least','leave','led','left','leg','lemon','lend','lens','lent','less','lesson','let',
            'level','lever','lid','lie','life','lift','light','like','limb','lime','limit','limp','line','linen',
            'link','lion','lip','list','lit','live','load','loaf','loan','lobby','local','lock','lodge','log',
            'lone','long','look','loop','loose','lord','lose','loss','lost','lot','loud','love','low','loyal',
            'luck','lump','lunch','lung','lure','lurk','lush','mad','made','magic','maid','mail','main','major',
            'make','male','mall','malt','man','manor','map','march','margin','mark','market','mars','marsh',
            'mask','mass','mast','master','match','mate','math','matter','may','mayor','maze','meal','mean',
            'meat','medal','media','medium','meet','melt','member','memory','men','mend','mental','menu','mercy',
            'mere','merge','merit','mesh','mess','met','metal','method','mid','mild','mile','milk','mill','mime',
            'mind','mine','minor','mint','minus','mirror','miss','mist','mix','moan','moat','mob','mock','mode',
            'model','modern','modest','moist','mold','mole','mom','moment','money','monk','month','mood','moon',
            'moral','more','morning','moss','most','moth','mother','motion','motor','mount','mourn','mouse',
            'mouth','move','much','mud','mug','mule','muscle','museum','music','must','mute','myth','nag','nail',
            'name','nap','narrow','nasty','native','nature','naval','navy','near','neat','neck','need','nerve',
            'nest','net','never','new','news','next','nice','nick','night','nine','nod','noise','none','noon',
            'norm','normal','north','nose','not','note','nothing','notice','notion','novel','now','nowhere',
            'nuclear','nude','number','nurse','nut','oak','oar','oat','obey','object','obtain','obvious','occur',
            'ocean','odd','odds','off','offend','offer','office','often','oil','old','olive','omen','omit','once',
            'one','onion','only','onto','open','opera','opinion','oppose','option','oral','orange','orbit',
            'order','organ','origin','other','ought','ounce','our','out','outer','output','outrage','outside',
            'oval','oven','over','owe','owl','own','owner','pace','pack','pad','page','paid','pail','pain',
            'paint','pair','pale','palm','pan','panel','panic','pant','paper','parade','parent','park','part',
            'partly','party','pass','past','paste','pat','patch','path','patient','patrol','pattern','pause',
            'pave','paw','pay','peace','peach','peak','peal','pearl','peasant','peck','peculiar','peel','peer',
            'pen','penalty','pencil','penny','people','pepper','per','perfect','perform','perhaps','period',
            'permit','person','pet','phase','phone','photo','phrase','physics','piano','pick','picture','pie',
            'piece','pig','pike','pile','pill','pilot','pin','pinch','pine','pink','pint','pipe','pit','pitch',
            'pity','place','plain','plan','plane','planet','plant','plate','platform','play','player','plea',
            'plead','please','pledge','plenty','plot','plough','pluck','plug','plum','plumb','plump','plunge',
            'plus','pocket','pod','poem','poet','poetry','point','poison','poke','pole','police','policy',
            'polish','polite','poll','pond','pool','poor','pop','popular','pork','port','pose','position',
            'possess','possible','post','pot','potato','pound','pour','poverty','powder','power','praise','pray',
            'prayer','precious','predict','prefer','prepare','present','preserve','president','press','pressure',
            'pretend','pretty','prevent','previous','price','pride','priest','primary','prince','princess',
            'principal','print','prior','prison','private','prize','problem','proceed','process','produce',
            'product','profile','profit','program','progress','project','promise','promote','prompt','proof',
            'proper','property','proposal','propose','prospect','protect','protest','proud','prove','provide',
            'pub','public','pull','pulse','pump','punch','pupil','purchase','pure','purple','purpose','purse',
            'pursue','push','put','puzzle','queen','query','quest','question','quick','quid','quiet','quilt',
            'quit','quite','quote','race','rack','radar','rage','raid','rail','rain','raise','rally','ram',
            'ramp','ran','ranch','random','range','rank','rapid','rare','rash','rat','rate','rather','ratio',
            'raw','ray','reach','react','read','ready','real','reality','realize','really','realm','rear',
            'reason','rebel','recall','receive','recent','recipe','reckon','record','recover','red','reduce',
            'reed','reef','reel','refer','reflect','reform','refuse','region','register','regret','regular',
            'reign','reject','relate','release','relief','religion','rely','remain','remark','remedy','remember',
            'remind','remote','remove','rent','repair','repeat','replace','reply','report','represent','request',
            'require','rescue','research','reserve','resign','resist','resolve','resort','resource','respect',
            'respond','rest','restore','result','retain','retire','retreat','return','reveal','revenue','review',
            'revolt','reward','rhythm','rib','rice','rich','rid','ride','ridge','rifle','right','rigid','rim',
            'ring','riot','rip','ripe','rise','risk','rite','rival','river','road','roar','roast','rob','robe',
            'robin','rock','rod','rode','role','roll','roman','romantic','roof','room','root','rope','rose',
            'rot','rotate','rough','round','route','routine','row','royal','rub','rude','rug','ruin','rule',
            'ruler','rumor','run','rural','rush','rust','sack','sacred','sad','safe','sage','said','sail',
            'saint','sake','salad','salary','sale','salt','same','sample','sand','sat','sauce','save','saw',
            'say','scale','scan','scene','scent','school','science','scope','score','scout','scrap','scratch',
            'scream','screen','script','sea','seal','search','season','seat','second','secret','section','sector',
            'secure','see','seed','seek','seem','seen','seize','select','self','sell','send','senior','sense',
            'sent','sentence','separate','series','serious','serve','service','session','set','settle','seven',
            'severe','sew','shade','shadow','shaft','shake','shall','shame','shape','share','shark','sharp',
            'shatter','shave','she','shed','sheep','sheer','sheet','shelf','shell','shelter','shift','shine',
            'ship','shirt','shock','shoe','shoot','shop','shore','short','shot','should','shoulder','shout',
            'shove','show','shower','shrink','shut','shy','sick','side','siege','sigh','sight','sign','signal',
            'silence','silent','silk','silly','silver','similar','simple','sin','since','sing','sink','sir','sit',
            'site','six','size','ski','skill','skin','skip','skirt','skull','sky','slab','slam','slap','slash',
            'slate','slave','slay','sleep','slept','slew','slice','slid','slide','slight','slim','sling','slip',
            'slit','slope','slot','slow','slug','slump','smack','small','smart','smash','smell','smile','smoke',
            'smooth','snap','snare','snatch','sneak','snow','soak','soap','soar','sob','social','sock','soft',
            'soil','solar','sold','soldier','sole','solid','solve','some','son','song','soon','sorry','sort',
            'sought','soul','sound','soup','source','south','space','span','spare','spark','speak','special',
            'speech','speed','spell','spend','spent','sphere','spice','spider','spike','spill','spin','spine',
            'spiral','spirit','spit','splash','split','spoke','sponsor','spoon','sport','spot','spouse','spray',
            'spread','spring','spy','squad','square','squeeze','stable','stack','staff','stage','stagger','stain',
            'stair','stake','stale','stalk','stall','stamp','stance','stand','standard','star','stare','stark',
            'start','state','status','stay','steady','steal','steam','steel','steep','steer','stem','step',
            'stern','stick','stiff','still','sting','stir','stock','stomach','stone','stood','stop','store',
            'storm','story','stout','stove','straight','strain','strand','strange','strap','strategy','straw',
            'stream','street','strength','stress','stretch','strict','stride','strike','string','strip','stripe',
            'strive','stroke','strong','struck','struggle','stuck','study','stuff','stupid','style','subject',
            'submit','subtle','succeed','such','suck','sudden','sue','suffer','sugar','suggest','suit','sum',
            'summer','summit','sun','super','supper','supply','support','suppose','sure','surface','surge',
            'surplus','surprise','surround','survey','survive','suspect','suspend','sustain','swallow','swamp',
            'swan','swap','swear','sweat','sweep','sweet','swell','swept','swift','swim','swing','switch',
            'sword','swore','sworn','swung','symbol','sympathy','system','tab','table','tackle','tact','tail',
            'take','tale','talent','talk','tall','tame','tan','tank','tap','tape','target','task','taste','tax',
            'tea','teach','team','tear','temple','ten','tenant','tend','tender','tennis','tense','tent','tenure',
            'term','terms','terror','test','text','than','thank','that','the','theme','then','theory','there',
            'these','thick','thief','thin','thing','think','third','this','thorn','those','though','thought',
            'thread','threat','three','threw','thrill','thrive','throat','throne','through','throw','thrust',
            'thud','thumb','thus','tick','ticket','tide','tidy','tie','tier','tight','tile','till','tilt',
            'timber','time','tin','tiny','tip','tire','tired','tissue','title','toe','toll','tomb','tone',
            'tongue','tonight','too','took','tool','tooth','top','topic','tore','torn','toss','total','touch',
            'tough','tour','toward','tower','town','trace','track','trade','tradition','traffic','trail','train',
            'trait','trap','trash','travel','tray','treasure','treat','treaty','tree','tremble','trend','trial',
            'tribe','tribute','trick','tried','trigger','trim','trio','trip','triumph','troop','trophy','trouble',
            'trousers','truck','true','truly','trunk','trust','truth','try','tube','tuck','tuesday','tumble',
            'tune','tunnel','turn','tutor','twelve','twenty','twice','twin','twist','two','type','ugly','ultimate',
            'umbrella','unable','uncle','under','undergo','understand','undertake','undo','unfair','uniform',
            'union','unique','unit','unite','unity','universe','university','unknown','unless','unlike','unlikely',
            'until','unusual','upper','upset','urban','urge','urgent','use','used','useful','user','usual',
            'utility','utter','vacant','vague','vain','valid','valley','valuable','value','van','vanish','vary',
            'vast','vein','venture','verb','verdict','verse','version','versus','very','vessel','veteran','via',
            'victim','victory','video','view','village','violate','violence','virgin','virtue','visible','vision',
            'visit','visitor','visual','vital','vivid','vocal','voice','volume','voluntary','volunteer','vote',
            'voyage','vulnerable','wade','wage','wagon','waist','wait','wake','walk','wall','wander','want','war',
            'ward','warm','warn','warrant','warrior','wash','waste','watch','water','wave','way','weak','wealth',
            'weapon','wear','weather','web','wedding','wednesday','weed','week','weigh','weight','welcome','well',
            'went','were','west','western','wet','what','wheat','wheel','when','where','which','while','whip',
            'whisper','white','who','whole','whom','whose','why','wide','wife','wild','will','willing','win',
            'wind','window','wine','wing','winner','winter','wipe','wire','wisdom','wise','wish','wit','witch',
            'with','withdraw','witness','woke','wolf','woman','wonder','wood','wool','word','wore','work',
            'worker','world','worm','worried','worry','worse','worship','worst','worth','worthy','would','wound',
            'wrap','wrath','wreck','write','writer','wrong','wrote','yard','year','yell','yellow','yes',
            'yesterday','yet','yield','young','yours','youth','zeal','zero','zone'
        ];
        this.dictionary = new Set(words);
    }

    reset() {
        if (this.timer) clearInterval(this.timer);
        this.foundWords = [];
        this.currentInput = '';
        this.score = 0;
        this.timeLeft = 180;
        this.roundOver = false;
        this.rollDice();
        this.allWords = this.findAllWords();
        this.timer = setInterval(() => {
            if (this.roundOver) return;
            this.timeLeft--;
            if (this.timeLeft <= 0) {
                this.roundOver = true;
                clearInterval(this.timer);
                app.showSnackbar(`Time's up! Score: ${this.score}`);
            }
            this.render();
        }, 1000);
        this.render();
    }

    rollDice() {
        const shuffled = [...this.dice];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        this.grid = [];
        for (let r = 0; r < 4; r++) {
            const row = [];
            for (let c = 0; c < 4; c++) {
                const die = shuffled[r * 4 + c];
                let face = die[Math.floor(Math.random() * die.length)];
                if (face === 'Q') face = 'Qu';
                row.push(face);
            }
            this.grid.push(row);
        }
    }

    findAllWords() {
        const found = new Set();
        const visited = Array.from({ length: 4 }, () => Array(4).fill(false));
        const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

        const dfs = (r, c, word) => {
            const lower = word.toLowerCase();
            if (lower.length >= 3 && this.dictionary.has(lower)) found.add(lower);
            if (word.length >= 8) return;

            for (const [dr, dc] of dirs) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4 && !visited[nr][nc]) {
                    visited[nr][nc] = true;
                    dfs(nr, nc, word + this.grid[nr][nc]);
                    visited[nr][nc] = false;
                }
            }
        };

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                visited[r][c] = true;
                dfs(r, c, this.grid[r][c]);
                visited[r][c] = false;
            }
        }
        return [...found];
    }

    wordScore(word) {
        const len = word.length;
        if (len <= 4) return 1;
        if (len === 5) return 2;
        if (len === 6) return 3;
        if (len === 7) return 5;
        return 11;
    }

    submitWord() {
        const word = this.currentInput.toLowerCase().trim();
        this.currentInput = '';
        if (word.length < 3) { app.showSnackbar('Word must be 3+ letters'); this.render(); return; }
        if (this.foundWords.includes(word)) { app.showSnackbar('Already found!'); this.render(); return; }
        if (!this.allWords.includes(word)) { app.showSnackbar('Not a valid word'); this.render(); return; }
        this.foundWords.push(word);
        const pts = this.wordScore(word);
        this.score += pts;
        app.showSnackbar(`+${pts} "${word}"`);
        this.render();
    }

    formatTime(s) {
        const m = Math.floor(s / 60);
        return `${m}:${(s % 60).toString().padStart(2, '0')}`;
    }

    render() {
        this.statusArea.innerHTML = `<div style="display:flex;gap:16px;justify-content:center;font-family:'Fredoka',sans-serif;">
            <span>Score: ${this.score}</span>
            <span>Time: ${this.formatTime(this.timeLeft)}</span>
            <span>Found: ${this.foundWords.length}/${this.allWords.length}</span>
        </div>`;

        let html = '<div style="max-width:360px;margin:0 auto;font-family:\'Fredoka\',sans-serif;">';

        // Grid
        html += '<div style="display:grid;grid-template-columns:repeat(4,64px);gap:6px;justify-content:center;margin-bottom:12px;">';
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                html += `<div style="
                    width:64px;height:64px;background:var(--cream);border-radius:12px;
                    display:flex;align-items:center;justify-content:center;
                    font-size:22px;font-weight:700;color:var(--text);
                    box-shadow:0 4px 12px var(--shadow-soft);
                ">${this.grid[r][c]}</div>`;
            }
        }
        html += '</div>';

        if (!this.roundOver) {
            // Input
            html += `<div style="display:flex;gap:8px;margin-bottom:12px;">
                <input type="text" id="boggle-input" value="${this.currentInput}" placeholder="Type a word..."
                    style="flex:1;padding:10px 16px;border:2px solid var(--lavender);border-radius:50px;
                    font-family:'Fredoka',sans-serif;font-size:16px;background:var(--cream);color:var(--text);outline:none;">
                <button id="boggle-submit" class="btn btn-primary" style="padding:10px 20px;">Go</button>
            </div>`;
        }

        // Found words
        if (this.foundWords.length > 0) {
            html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">';
            for (const w of this.foundWords) {
                html += `<span style="padding:4px 10px;background:var(--mint);border-radius:20px;font-size:13px;color:#fff;">${w} (+${this.wordScore(w)})</span>`;
            }
            html += '</div>';
        }

        // End screen
        if (this.roundOver) {
            const missed = this.allWords.filter(w => !this.foundWords.includes(w));
            if (missed.length > 0) {
                html += '<div style="margin-top:12px;"><strong>Missed words:</strong><div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">';
                for (const w of missed.slice(0, 40)) {
                    html += `<span style="padding:2px 8px;background:var(--shadow-soft);border-radius:12px;font-size:12px;">${w}</span>`;
                }
                if (missed.length > 40) html += `<span style="font-size:12px;">...and ${missed.length - 40} more</span>`;
                html += '</div></div>';
            }
        }

        html += '</div>';
        this.gameArea.innerHTML = html;

        if (!this.roundOver) {
            const input = document.getElementById('boggle-input');
            input.focus();
            input.addEventListener('input', (e) => { this.currentInput = e.target.value; });
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.submitWord(); });
            document.getElementById('boggle-submit').addEventListener('click', () => this.submitWord());
        }

        this.controlsArea.innerHTML = `<button class="btn btn-primary" id="boggle-new">New Board</button>`;
        document.getElementById('boggle-new').addEventListener('click', () => this.reset());
    }

    cleanup() {
        if (this.timer) clearInterval(this.timer);
        this.gameArea.innerHTML = '';
        this.statusArea.innerHTML = '';
        this.controlsArea.innerHTML = '';
    }
}
