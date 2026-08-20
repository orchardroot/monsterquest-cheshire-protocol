// =============================================================
// MonsterQuest v2 — js/data/dialogue.js  (data workstream)
// MQ.Data.dialogue — shared NPC chatter pools by town and archetype.
//
// A pool is  MQ.Data.define('dialogue', id, {kind, key, lines:[Line]})
//   kind ∈ 'archetype' | 'town' | 'weather' | 'phase' | 'generic'
//   Line = "string"  |  {t:"string", phase:[..], weather:[..], chapter:[min,max], cond:"flag expr"}
//
// The world/story workstreams call MQ.Data.chatter({town, archetype, ...})
// and get one line back, filtered by time of day, weather, chapter and
// (if MQ.Flags is loaded) a flag condition. Nothing here runs game logic.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const D = MQ.Data;
  const U = MQ.U;

  function POOL(id, kind, key, lines) {
    return D.define("dialogue", id, { kind: kind, key: key, lines: lines });
  }
  // conditional line helpers
  function night(t) { return { t: t, phase: ["night"] }; }
  function dusk(t) { return { t: t, phase: ["dusk", "night"] }; }
  function morn(t) { return { t: t, phase: ["dawn", "day"] }; }
  function rain(t) { return { t: t, weather: ["rain"] }; }
  function fog(t) { return { t: t, weather: ["fog"] }; }
  function windy(t) { return { t: t, weather: ["wind"] }; }
  function sun(t) { return { t: t, weather: ["sun"] }; }
  function late(t, from) { return { t: t, chapter: [from || 8, 99] }; }

  // =================================================================
  // ARCHETYPES
  // =================================================================
  POOL("arch_kid", "archetype", "kid", [
    "I've got a SPARKIT. It lives behind the telly and my mum's not to know.",
    "My brother says if you stand on the 108 Steps and shout, something answers. He's a liar though.",
    "Do you want to see my rock? It's not a monster. It's just a good rock.",
    "I'm not allowed past the bridge. You can go past the bridge. That's not fair, is it.",
    "Miss says the county's changed. I've been here nine years and it's exactly the same.",
    night("I'm allowed out this late. I am. Don't tell anyone you saw me being allowed."),
    night("The moths go mad round the mill lights. I counted a hundred and stopped because it was boring."),
    rain("It's not proper rain. Proper rain goes sideways. This is just wet air."),
    fog("Fog's got people in it today. Not real people. Blurry ones. They don't say anything back."),
    morn("I'm doing a project on monsters. Can I write down what yours is called and spell it wrong?"),
    windy("The wind blew my crisps out of my hand and a bird got them. That bird planned that."),
    "Grandad says there were more of them when he was little. Grandad says that about everything.",
    "If you catch one you have to look after it forever. That's the rule. I read it.",
    late("There's a countdown on the noticeboard outside the town hall. Nobody will tell me what it's counting.", 5),
    "I'm going to be a Sysadmin when I'm big. Not a trainer. A Sysadmin. They get chairs."
  ]);

  POOL("arch_granny", "archetype", "granny", [
    "You want to eat something. You've got a look about you like you've been walking since Tuesday.",
    "I've lived here sixty-one years and I've never once needed to go to Manchester. Not once.",
    "They've put a new sign up. It's the wrong way round but nobody wants to be the one to say.",
    "My husband kept one of those. Fed it out of his own bowl. I'll say no more.",
    "In my day you didn't catch them, you just let them get on with it and they let you get on with it.",
    rain("Well, it's rain. We know what to do with rain. Come in off it, that's what."),
    fog("Fog like this, my mother used to say, is the county having a think."),
    sun("Sun. In this county. I've put the washing out and I don't trust it for a minute."),
    night("You shouldn't be out. Nothing good happens after ten and nothing at all after eleven."),
    "There's a woman in Knutsford tells fortunes. She told me I'd have a long life. I was sixty-eight.",
    "That cat of yours has a face on it. Cats know things. Don't argue with a cat.",
    "They keep saying it's all changing. It's been all changing since 1974 and here we still are.",
    windy("Wind off the Peak. Puts my hip out every year, regular as a bus that runs."),
    late("The lad from the paper came round asking about the masts. I gave him a biscuit and no comment.", 4),
    "You'll want the top road, not the bottom road. The bottom road's flooded and pretending not to be."
  ]);

  POOL("arch_walker", "archetype", "walker", [
    "Twelve miles today. Could've been fourteen but there was a stile with an opinion.",
    "Sandstone Trail if you're asking. Frodsham to Whitchurch. Two days if you're honest, three if you're sensible.",
    "Waymarks are good round here. It's the gates that'll finish you.",
    "You'll want boots. That's not a suggestion, that's the whole of my advice.",
    "There's a bench at the top with a plaque on it. Read the plaque. Then sit down and think about it.",
    rain("Wet? This is Cheshire. You've dressed for it or you haven't, and you haven't."),
    fog("Compass and a map. Not a phone. The phone will lie to you politely and then run out."),
    windy("It's blowing a hooley on the ridge. Grand, if you like being shouted at by geography."),
    morn("Out early. Best bit of the day and there's nobody in it, which is the point of it."),
    dusk("I'll be down before proper dark. Probably. There's a torch in here somewhere."),
    "Met a peregrine on the crag doing about a hundred and eighty. Made my day, that.",
    "Seven counties from the Old Pale on a clear one. I've counted six twice and given up.",
    "The Gritstone Trail's the honest one. Sandstone's prettier. Do both and stop asking me.",
    late("There's fewer people on the hills lately. Whatever's going on, the hills have noticed.", 6),
    "Cows. Watch the cows. Everyone worries about the monsters and it's always the cows."
  ]);

  POOL("arch_sysadmin", "archetype", "sysadmin", [
    "Patched it Tuesday. Broke it Tuesday. Fixed it Wednesday. That's the whole job.",
    "If it's in a rack and it's warm, it's working. If it's in a rack and it's silent, run.",
    "I've got a PEEPCAM in the comms room. I didn't put it there. It's tidier than I am.",
    "Backups are fine. Restores are the question. Nobody ever tests the question.",
    "Never trust a monitoring dashboard that's all green. Green means the check is broken.",
    night("Change window. Two in the morning, every time. Nobody has ever explained why the servers care."),
    night("Nights are better. Nothing's on fire and nobody's asking me to reset their password."),
    rain("Roof leak in the second aisle. There's a bucket. The bucket has a ticket number."),
    "Someone plugged a kettle into the UPS. I know who. I'm choosing my moment.",
    "You want a Patch Cable? Take one. Take three. They breed in that cupboard, I'm certain of it.",
    "Ada trained me. Ada trained everyone. Ada would like it noted that she trained everyone.",
    late("The CUTOVER thing. We've all seen the memo. Nobody's seen the plan.", 5),
    late("Agents are jammed half the county over. Try turning it off and on again, they said. It has been off.", 9),
    "Documentation exists. It's in a shared drive. The shared drive is the documentation's problem now.",
    "Cyber-types nest in anything with a fan. Don't leave a laptop open. Don't leave a fridge open."
  ]);

  POOL("arch_cultist", "archetype", "cultist", [
    "Kellan says the water remembers. Kellan says a lot of things. Some of them are about water.",
    "You look tired. You look like someone who would benefit from a simple instruction.",
    "We meet at the lido. Bring nothing. Bring nobody. Bring an open mind and a towel.",
    "It isn't a cult. It's a group. Groups have newsletters. Cults have newsletters as well, admittedly.",
    "Just paste it in. That's all. It's one line. One line and everything gets easier.",
    night("The hymn goes better at night. Everything goes better at night, that's the trouble with night."),
    fog("The fog is a kindness. It stops you having to decide where to look."),
    rain("Rain is the county agreeing with us. That's not doctrine, that's just observably true."),
    "I gave them my old life and they gave me a lanyard. On balance I'm up.",
    "You've a monster there that trusts you. Ask yourself why. Then ask yourself who taught you to ask.",
    "Nobody is asking you to believe anything. We're asking you to run one small command.",
    late("There are more of us since the countdown started. Fear is a very effective recruiter.", 7),
    "Kellan was a hydrologist. That's the bit people leave out. He knows exactly what water does.",
    "We don't take money. We take attention. It's worth more and nobody misses it until later.",
    "If you say no, that's fine. We'll ask again on Thursday, and Thursday is a weaker day for everyone."
  ]);

  POOL("arch_stuffer", "archetype", "stuffer", [
    "Nothing to see. Just a lad with a laptop in a lay-by. Perfectly normal, that.",
    "We rent the fleeces. The sheep don't mind. Nobody's asked the sheep.",
    "Residential addresses. Real ones. Real as anything else round here, anyway.",
    "One password, four hundred sites. People are consistent. That's not our fault, that's people.",
    fog("Fog's good for business. Best weather there is if your business is not being looked at."),
    fog("Don't come through the bank. Not because of us. Because of what else likes fog."),
    night("Night shift. Traffic looks more normal at night, which is a lie we all benefit from."),
    "You're not police. Police wear the same coat but they walk different.",
    "PUPPETACCT's not a monster, it's a workflow. Give it a birthday and it'll behave.",
    "We're contractors. Everyone's a contractor. Ask who pays and you'll be here a fortnight.",
    late("The Stack's hiring. Everyone's hiring. Nobody's saying for what.", 8),
    "Tell you what, I'll move on. Not because you asked. Because the light's gone funny.",
    "Farming compute off a Cheshire hillside. My nan did the same with sheep and she was on telly for it.",
    "It's not theft. It's re-use. There's a difference and the difference is a very good solicitor.",
    rain("Rain gets in the boxes. That's the whole risk model, that is. Rain.")
  ]);

  POOL("arch_farmer", "archetype", "farmer", [
    "Gate. Behind you. Shut it. Thank you. That's the conversation.",
    "Three hundred acres, four hundred sheep and one working dog who is currently asleep in the car.",
    "SHEEPWIRE's the same as any other sheep, only it takes the fence with it.",
    "They came round offering money for the hilltop. I said what for. They said signal. I said no.",
    "You want a MISTEWE, do you. Everyone wants a MISTEWE until they've heard one at four in the morning.",
    rain("It'll do the grass good. It always does the grass good. The grass has never once thanked me."),
    sun("Two days of this and the ground's like a road. Farming's just complaining with paperwork."),
    windy("Lost a sheet off the barn roof. It's in the next field pretending to be a pond."),
    morn("Been up since four. Not for effect. Because the cows are Cheshire cows and they don't lie in."),
    night("Something's been at the feed store. Something with hands. That narrows it, doesn't it."),
    "Hedge wants laying. I know it wants laying. Cadoc's booked till March.",
    "My grandfather had a PITPONY. Loved it more than any of us and we all understood why.",
    late("Fewer birds this year. Fewer of everything. You notice it in a field before you notice it anywhere.", 6),
    "Ramble if you like. Just don't ramble through the middle. Round the edge, like a decent person.",
    "Cheese show's Saturday. Bring nothing, buy everything, that's how it works."
  ]);

  POOL("arch_fisher", "archetype", "fisher", [
    "Four hours. One perch. I'd call that a result and my wife would call that four hours.",
    "Weighted line for the canal, carbon for the Dee. Anyone who tells you different is selling rods.",
    "There's a trout at Y Berllan that only rises to Welsh. I've learned nine words and none of them worked.",
    "Roe's the bait and roe's the prize. Circular, fishing. That's the appeal.",
    "Don't fish the Flashes at dawn unless you want to meet what's underneath the Flashes at dawn.",
    dusk("Dawn and dusk. That's when the legendary table opens. Everything else is practice."),
    night("Ghost tier tonight, if you've the lens for it. If you haven't, you'll just get cold."),
    rain("Rain lifts the fish. Rain lifts everything except the mood on the bank."),
    fog("Can't see the float. Doesn't matter. You feel it before you see it, always did."),
    "Angler Doug buys anything with fins. Doesn't ask where. Doesn't want to know where.",
    "Caught a bottle out of the canal at Anderton once. There was something in it. I put it back.",
    "The salmon go up the Chester weir on the tide. Four thousand years they've done it. Weir's the newcomer.",
    "VOLTEEL shorted the swing bridge again. Council says coincidence. Council says a lot.",
    morn("First light, still water, nobody about. You can keep your gyms."),
    "Never eat what you catch round here. Not because it's bad. Because it might look at you."
  ]);

  POOL("arch_station", "archetype", "station", [
    "The 11:42 is running. That's not a promise, that's a current position.",
    "Platform two for Crewe. Platform two for everything, really. Platform one is decorative.",
    "Railcard? Right. That gets you the network. Don't lose it, they don't do seconds.",
    "Signal box does its own thing after midnight. We've stopped writing it up.",
    "Mind the gap. It's a proper gap here, not a token one.",
    night("Last one's gone. There's a bench, there's a heater, there's a vending machine that lies."),
    night("Something moves the levers at three. It's not a person. We've checked. Twice, with a person."),
    rain("Rain gets in at the north end. Has done since 1937. It'll be sorted in the next century."),
    fog("Fog working. Everything's cautious. You'll get there, you'll just get there slowly and thoughtfully."),
    "Crewe's the hub. Everything in this county goes through Crewe eventually, including people who'd rather not.",
    "Whistle's not for you. Whistle's for the guard. If you run for it I have to write a form.",
    late("We're short-staffed. Everyone's short-staffed. Have you seen the countdown on the notice board?", 5),
    "There's a POLTERGRID in the telemetry. It doesn't stop trains. It just moves what isn't connected.",
    "Buffet's shut. Buffet's been shut since the refurbishment, which was also shut.",
    morn("First train out is the best train out. Empty, clean, and nobody talks to you.")
  ]);

  POOL("arch_publican", "archetype", "publican", [
    "Perry's on. Perry's always on. It's from Y Berllan and it'll take the roof off you.",
    "You can heal your team in here for the price of a pint. That's not policy. That's hospitality.",
    "Two rooms upstairs. Both cold. Both cheap. Take the one at the back.",
    "The rematch board's by the dartboard. Sign it and someone will find you, which is the risk.",
    "I've had a BARGEMOG asleep on the bar since Tuesday. Regulars have started buying it drinks.",
    night("Last orders. I mean it this time. I say that every night and I mean it about twice a year."),
    night("Lock-in's a rumour. Rumours are how this pub advertises."),
    rain("Everyone comes in when it rains. Best weather there is, commercially speaking."),
    sun("Sun's out, pub's empty. Everybody's in a beer garden that hasn't got a roof for when it stops."),
    "Elm Stout, Salt Mead, Damson Fire. Mam-gu's recipes. Don't drink the third one standing up.",
    "Kellan's lot came in once. Ordered water. Just water. Cleared the snug in eleven minutes.",
    late("Trade's odd lately. Same faces, less talking. That's a bad sign in a pub.", 7),
    "Food's a pie or a different pie. Both good. Ask the cat which, it's never wrong.",
    "Quiz is Thursday. Last week's winning team was three sysadmins and something in a rucksack.",
    "You want the Cat and Fiddle for the view and this place for the beer. Don't mix them up."
  ]);

  POOL("arch_trainer", "archetype", "trainer", [
    "Six badges. Six. Everyone acts like that's nothing and it is not nothing.",
    "Type chart's not a strategy. It's a spelling test. Strategy is what you do on turn three.",
    "I built my whole team round one gear slot. Don't do that. I'm telling you as a friend.",
    "Overdrive changes everything. Learn when it fills, not just what it does.",
    "Battled a leader's rematch team and lost in four turns. Best four turns I've had all year.",
    night("Night tables are different. Same route, different county, after nine."),
    "The Arena's in Warrington. Bring PP. HP refills, PP doesn't, and that's the whole trick of it.",
    "Traded a monster off a lad in Sandbach. It won't obey me. Fair enough, honestly.",
    "You get one temperament and you live with it. Like people, only more honest about it.",
    late("Everyone's teams are getting stranger. Mine included. Something's tuning them.", 9),
    "Casebook Marks buy a respec. I've respecced four times. I am not a well man.",
    "Don't over-level. You'll win and you'll learn nothing and then Mo will take you apart."
  ]);

  POOL("arch_tourist", "archetype", "tourist", [
    "We came for the salt museum. There's a whole museum. About salt. It was excellent.",
    "Is this the Cheshire with the cat? Everyone keeps saying it's not that Cheshire.",
    "Nine hundred years of history and the gift shop only sells fudge. I'm not complaining, I bought fudge.",
    "The crooked house leans. That's it. That's the attraction. I've taken forty photographs.",
    rain("The forecast said light showers. I would like to speak to the forecast."),
    fog("We've paid for a view. There is no view. There is a sign describing the view."),
    "Somebody told me there's a bear. In Congleton. A whole bear. Is there a bear?",
    "We did the Rows this morning. Two levels of shops. Two! Chester's showing off and it's earned it.",
    "The zoo's got a penguin missing. Nobody seems worried. Should we be worried?",
    "I've seen four castles and I'm told two of them are follies and I refuse to be told which."
  ]);

  POOL("arch_ranger", "archetype", "ranger", [
    "Stick to the boardwalk. The Moss is nine metres deep and extremely patient.",
    "Bird count's down. Insect count's down. Monster count's up. Draw your own conclusions.",
    "Don't feed anything. Once you've fed it, it's yours, and it will find where you live.",
    "The night glade's closed. It's not closed for the wildlife's sake, put it that way.",
    dusk("Gates lock at dusk. If you're in, you're in for the night. People have been in for the night."),
    morn("Deer count at six. If you want to help, be quiet and don't wear orange."),
    "Heather burns on rotation. Everyone rings up furious. Everyone rings up furious every year.",
    "We've had a legendary sighting logged three times this month. I've filed it under weather.",
    fog("Fog on the Moss and there's shapes in it doing shape things. Walk on. Don't engage."),
    "The peat's an archive. Everything that's gone in is still in. That's not romantic, that's chemistry."
  ]);

  // =================================================================
  // TOWNS
  // =================================================================
  function TOWN(map, lines) { POOL("town_" + map, "town", map, lines); }

  TOWN("macclesfield", [
    "Silk built this town and then left it standing there holding the loom.",
    "One hundred and eight steps up to the church. Somebody counted. Somebody always counts.",
    "Treacle Market's the last Sunday. Come hungry, come early, come with cash.",
    "Paradise Mill's still got the Jacquard looms upstairs. They still work. That's the unsettling bit.",
    night("The mill windows light up at night and there's nobody renting the mill.")
  ]);
  TOWN("bollington", [
    "White Nancy's up there. It's a folly. It doesn't do anything. That's what a folly is.",
    "Clarence Mill's flats now. Very nice flats. Very haunted flats, but very nice.",
    "Happy Valley, they call it. Nobody's ever explained the name and nobody wants it explained.",
    "Cyclists come through here at forty. Downhill. Screaming. It's a local feature.",
    night("Moths on the mill lights. Thousands of them. It's the best free thing in the county.")
  ]);
  TOWN("prestbury", [
    "More cameras than people. The people are fine with it, which is the interesting part.",
    "Damsons in the hedges behind the church. Take some. Nobody here eats fruit off a hedge.",
    "There's a footballer's house with gates like a small airport. He's very nice, apparently.",
    "The Priest's House has been standing since 1448 and has never once been fashionable, which is why it's still there."
  ]);
  TOWN("poynton", [
    "The pit closed in 1935 and the ponies never quite got the memo.",
    "Poynton Pool's where every trainer in this county caught their first fish and lied about the size.",
    "We took the traffic lights out and the traffic got better. Nobody's forgiven us for being right.",
    "Anson Museum's got engines you can start. Ask nicely. Wear ear defenders."
  ]);
  TOWN("lyme_park", [
    "The Cage on the hill was a hunting lodge, then a lock-up, then a folly. Career of two halves.",
    "Red deer everywhere and every one of them thinks it owns the drive.",
    "Bowstones are up on the ridge. Saxon, probably. Nobody's certain and nobody's in a hurry.",
    fog("You can lose a car park in this fog. I've done it. Twice.")
  ]);
  TOWN("teggs_nose", [
    "Quarry's finished. The stone's in half the walls between here and Buxton.",
    "Cat and Fiddle's the second-highest pub in England and it will tell you so on the way in.",
    "Shutlingsloe's the little pointy one. Half an hour up, ten minutes down, three days of legs.",
    windy("Wind up here has taken a hat off every member of my family.")
  ]);
  TOWN("wilmslow", [
    "Turing lived here. There's a plaque. There should be more than a plaque.",
    "The Carrs floods every winter and everyone acts surprised every winter.",
    "Ada's gym is a substation with a door on it. She'll tell you that's deliberate.",
    "Lindow's out that way. Don't go in the soft bit. Everyone knows which the soft bit is except visitors."
  ]);
  TOWN("styal", [
    "Quarry Bank's wheel is the biggest working one in Europe and it will not let you forget it.",
    "The Apprentice House is where the children slept. Two to a bed. They put that on the ticket.",
    "There's a fridge in one of the cottages with something living in it. National Trust are aware.",
    night("The wheelhouse turns at night when the sluice is shut. Ask the mill. The mill won't say.")
  ]);
  TOWN("lindow_moss", [
    "They found a man in the peat. Then another. Then a bit of a third.",
    "Bog's been cut for a thousand years and it's still got things in it we haven't met.",
    "Boardwalk or nothing. That's not a rule, that's an obituary avoided.",
    fog("Wisps out on the Moss tonight. Follow one and you'll be a story by morning.")
  ]);
  TOWN("alderley_edge", [
    "The knights sleep under the Edge and the wizard keeps the door. Ask any child; they'll tell you straight.",
    "Wizard's Well has words cut over it. Say them properly or don't say them at all.",
    "Copper mines go down further than the surveys admit. The surveys know. The surveys are being polite.",
    night("Stormy Point at night is the only place in Cheshire I won't go, and I've been in the Stack.")
  ]);
  TOWN("knutsford", [
    "Gaskell wrote Cranford here and everyone's been talking about each other ever since.",
    "The sand patterns outside the doors are a wedding thing. Nobody remembers starting it.",
    "Bookshop sells Skill Cards bound as chapters. Two thousand credits and a bit of a lecture.",
    "There's a penny-farthing museum. Yes. There is. No, I don't know either."
  ]);
  TOWN("tatton_park", [
    "Thousand acres, two herds, one hall and a Japanese garden that cost more than the hall.",
    "The census tent's counting antler patterns. Eight of them. They want all eight and they want them today.",
    "Old Hall's the Tudor one. Something still runs battles in there after midnight.",
    "Catmint grows by the walled garden. Don't carry it near a cat. Any cat. Any."
  ]);
  TOWN("holmes_chapel", [
    "Signal box is Grade II and haunted, in that order of importance to the council.",
    "The viaduct at Twemlow has twenty-three arches and every one of them is awake.",
    "Bakery does a vanilla slice that has ended friendships.",
    night("Levers move at three. There's nothing on the other end of them. Hasn't been since 1994.")
  ]);
  TOWN("jodrell_bank", [
    "The dish has been listening since 1957 and it has heard three things worth writing down.",
    "You can hear it move. Great big thing, and it moves like it's being careful.",
    "Arboretum's lovely. Everyone comes for the dish and leaves talking about the trees.",
    late("It's gone quiet up there. That's the wrong direction for a radio telescope to go.", 10)
  ]);
  TOWN("congleton", [
    "The town sold its Bible to buy a bear. We've never lived it down and we've never tried.",
    "Beartown, they call it. Say it fondly or say it somewhere else.",
    "Otis runs the gym out of the old bear pit. He'll tell you the pit's a metaphor. It isn't.",
    "The Cloud's up there. Half an hour, and the whole county underneath you."
  ]);
  TOWN("sandbach", [
    "Two Saxon crosses in the square. Broken up once, put back wrong, still standing.",
    "The shrine revives a fainted team once a day. Don't ask how. Ask the crosses.",
    "Bounty board's outside the town hall. Three a day, clue text only, no maps.",
    night("Night market in the square. Half of it's food and half of it's trainers looking for a fight.")
  ]);
  TOWN("crewe", [
    "Everything in this county goes through Crewe. Everything. Including things that would rather not.",
    "The Works built eight thousand locomotives. Eight thousand. Some of them are still cross about being retired.",
    "Di's gym is a roundhouse with the turntable still working. Mind your feet.",
    "Heritage centre's got an APT in the shed. It tilts. It shouldn't, any more, but it does."
  ]);
  TOWN("nantwich", [
    "Brine springs. Roman salt town. Then a fire in 1583 that Queen Elizabeth paid to fix.",
    "The lido's brine-fed and open all year. It's not warm. It's never been warm.",
    "Cheese show's the biggest in the country and the judging is taken extremely seriously.",
    rain("Rain on the brine pool makes a sound like applause. Nell says that's coincidence.")
  ]);
  TOWN("y_berllan", [
    "Croeso. It's Welsh for welcome and it's the first word anyone learns here.",
    "Mam-gu's orchard, Mam-gu's press, Mam-gu's rules. Learn the rules.",
    "No wild monsters in the orchard. Not because there aren't any. Because they were asked.",
    "The perry takes a year and a fortnight. Everyone asks about the fortnight. Nobody gets an answer."
  ]);
  TOWN("middlewich", [
    "Three canals meet here. There's a folk festival about it and it is genuinely enormous.",
    "Big Lock's the widest on the Trent and Mersey. Boaters get emotional about it.",
    "Carys will licence your boat if she likes the look of you. It's a whole system and it works.",
    night("The choir practises late. What they're singing isn't in the hymn book and everyone knows it.")
  ]);
  TOWN("winsford", [
    "The Flashes are collapsed mine workings full of water. Now they're a nature reserve. Cheshire, that.",
    "DeepStore's two hundred metres down and holds the nation's paperwork at a steady fourteen degrees.",
    "Something surfaces in the Flashes at dawn. The birders have stopped putting it in the log.",
    "Biggest rock salt mine in the country. Everything you grit a road with started here."
  ]);
  TOWN("northwich", [
    "The whole town subsided. Twice. They jacked the buildings up and carried on.",
    "Lion Salt Works ran open pans till 1986. You can still smell it when the wind's right.",
    "Weaver Hall's the museum. Ask about the back stair. Don't ask in front of the curator.",
    "The galleries under here are a white cathedral. Jack takes people down and brings most of them back."
  ]);
  TOWN("anderton", [
    "The boat lift. Fifty foot of cast iron lifting boats between two waterways since 1875.",
    "It's called the Cathedral of the Canals and for once the nickname is earned.",
    "Something big lives in the caisson. It helped once. It says never again.",
    fog("Fog on the Weaver and the lift disappears from the top down. Very calming. Very wrong.")
  ]);
  TOWN("great_budworth", [
    "Prettiest village in Cheshire, and it knows, and it has a plaque about knowing.",
    "The bells are eight and the ringers are seven and it's been that way for a decade.",
    "Nothing has been built here since 1911 and the village considers that a good run.",
    dusk("Practice night. If you hear them from the ridge you'll stop walking, everyone does.")
  ]);
  TOWN("lymm", [
    "The Cross is sandstone and it's been the middle of everything since before anyone counted.",
    "Lymm Dam's man-made. Made for a road. Now it's the best water in the borough.",
    "Painter comes down every Thursday and does the same view. It's different every time, apparently.",
    night("Night fishing at the dam. Different fish. Different everything, after dark.")
  ]);
  TOWN("warrington", [
    "Transporter Bridge. It carried whole trains across on a gondola. Now it carries arguments.",
    "The arcade's got a machine that lies to you. Everyone knows which one. Nobody unplugs it.",
    "Mo runs her gym out of a live network operations centre. That's not showing off, that's just where she works.",
    "Arena's in the old market hall. Five tiers. Nobody's beaten obsidian twice."
  ]);
  TOWN("daresbury", [
    "Carroll was born here and the church windows have got the whole cast in stained glass.",
    "The lab's got a particle accelerator and a very relaxed attitude to what gets out of it.",
    "There's a cat here that's mostly grin and it has been here longer than the church.",
    night("The mirror in the vestry shows the room a second late. Verger says it's the glass. It isn't the glass.")
  ]);
  TOWN("runcorn", [
    "Chemicals built this town, and then the chemicals stayed.",
    "Two bridges, one old, one new, and a very long-running argument about both.",
    "Ria's gym is a working reagent lab. Sign the form. Actually read the form.",
    "The Priory's Norman and it's got a garden that shouldn't grow anything and grows everything."
  ]);
  TOWN("frodsham", [
    "The hill's got a memorial on it and a view of two counties and a very good bench.",
    "Beacon's been lit for the Armada, two jubilees and one genuine misunderstanding.",
    "Marsh out that way. Waders or nothing. The marsh does not negotiate.",
    dusk("There's a woman sits on that bench at dusk. Doesn't talk much. Knows everything.")
  ]);
  TOWN("delamere_forest", [
    "Blakemere Moss was a lake, then a forest, then a lake again. Somebody keeps changing their mind.",
    "Old Pale's the top. Seven counties on a clear day, which is about four days a year.",
    "Glow-worms in the night glades in June. Bring the lamp. Don't bring a torch, it ruins it.",
    night("Something stands in the water at the Moss and it is not a tree, whatever the sign says.")
  ]);
  TOWN("tarporley", [
    "Hunt's been here since 1762 and hasn't hunted anything since 2005, and both facts are cherished.",
    "Cadoc lays hedges the Cheshire way. Steep, thick, and stock-proof for thirty years.",
    "High Street's got more listed buildings than shops, which is the whole planning dispute in one sentence.",
    "Billhook's the tool. Cheshire pattern. One edge, one hook, one job."
  ]);
  TOWN("beeston_castle", [
    "The well's three hundred and seventy feet deep and Richard the Second's treasure is at the bottom. Allegedly.",
    "Best view in Cheshire and there's no argument about it, which for Cheshire is remarkable.",
    "Peckforton's the fake one across the valley. Victorian. Gorgeous. Absolutely a fake.",
    windy("Storm bird nests on the crag. When the wind turns you'll know it's home.")
  ]);
  TOWN("chester", [
    "Two thousand years of walls and you can walk the whole circuit in an hour if nobody stops you.",
    "The Rows are two levels of shops, medieval, and nowhere else on earth has them.",
    "Roman amphitheatre's the biggest in Britain and it's under a car park's worth of grass.",
    night("The Twentieth Legion still walks the Northgate stretch. They ask for a password nobody has.")
  ]);
  TOWN("chester_zoo", [
    "Fifteen thousand animals and one of them has escaped and gone up the canal.",
    "The giraffes browse the hedges over the fence at four in the morning. Nobody stops them.",
    "Keeper Ama knows every animal by name and half of them by opinion.",
    "There's a red panda with a smouldering tail. There's a bucket. There has never been a fire."
  ]);
  TOWN("ellesmere_port", [
    "Boat museum's got the biggest floating collection in the world and about nine visitors.",
    "The outlet's got everything and the docks have got everything else.",
    "The refinery flare burns off in a pattern. Somebody's answering. Nobody knows which shift.",
    night("There's a narrowboat moored on the far side that's the mirror of one on this side.")
  ]);
  TOWN("ince_marshes", [
    "Marsh, mud, birds, pylons and a very quiet cooling-water intake nobody talks about.",
    "Waders or don't. There isn't a third option and the marsh will demonstrate that.",
    "Everything that flies up the estuary stops here first. Everything.",
    fog("Fog comes off the Mersey in a wall. You can watch it arrive. You can't watch it leave.")
  ]);
  TOWN("parkgate", [
    "The tide went out in 1900 and never came back. There's still a promenade and no sea.",
    "Ice cream shop's been here longer than the marsh and takes precedence in local affections.",
    "On a spring tide the water comes right up and everything living in the grass comes out at once.",
    dusk("Watch the marsh at dusk. Something goes out with a tide that stopped a hundred years ago.")
  ]);

  // =================================================================
  // WEATHER & TIME GENERIC POOLS
  // =================================================================
  POOL("weather_rain", "weather", "rain", [
    "Wet again. You'll want to be somewhere else, and so will everything you're carrying.",
    "It'll ease off. It won't, but it'll feel like it might, and that's nearly the same.",
    "Water-types are cocky in this. Let them be. They get about four days a year.",
    "Rain's the county's default. Anything else is the county showing off.",
    "Careful on the ledges. Gritstone in the wet is a decision you make once."
  ]);
  POOL("weather_fog", "weather", "fog", [
    "Can't see the church and I'm stood next to the church.",
    "Fog brings the proxy things out. Keep moving, keep your accuracy up, don't answer anything.",
    "You'll hear more than you see today. That's not always an improvement.",
    "Goggles if you've got them. Torch if you haven't. Neither if you're brave and stupid."
  ]);
  POOL("weather_wind", "weather", "wind", [
    "Off the ridge and straight through everything you're wearing.",
    "Bug-types hate this. Flying-types are insufferable about it.",
    "Hold your hat and your opinions. You'll lose one of them.",
    "Charge moves land instantly in this. Somebody worked that out and now everyone knows."
  ]);
  POOL("weather_sun", "weather", "sun", [
    "Sun. Actual sun. Half the county's outside taking photographs of the sky.",
    "Enjoy it. It's an event, not a season.",
    "Everything with a fire in it is showing off today.",
    "Two days of this and there'll be a hosepipe ban and a lot of very smug Grass-types."
  ]);
  POOL("phase_night", "phase", "night", [
    "Different county after dark. Same roads, different residents.",
    "Night tables. Half of what's out now you'll never see at two in the afternoon.",
    "Care centre's open. Care centres are always open. That's the one reliable thing.",
    "If something's grinning at you, it's fine. If it's grinning and fading, walk on."
  ]);
  POOL("phase_dawn", "phase", "dawn", [
    "Best hour of the day and nobody's in it.",
    "Dawn table's open at the water. Won't be for long.",
    "Everything looks solvable at this hour. It isn't, but it looks it."
  ]);
  POOL("phase_dusk", "phase", "dusk", [
    "Light's going. Get where you're going or get comfortable.",
    "Owls up. That's your cue, one way or the other.",
    "Dusk's the honest hour. Everything's a silhouette and nothing's pretending."
  ]);
  POOL("generic", "generic", null, [
    "Grand day for it. Whatever it is you're doing.",
    "Alright.",
    "You want the Care centre? Blue roof. Everything with a blue roof is a Care centre.",
    "Mind how you go.",
    "Not from round here, are you. Don't worry, neither's half the town now.",
    "There's a bench up there if your legs have had enough of your ambitions.",
    "Someone said there's a countdown on the noticeboards. I've stopped reading noticeboards.",
    "That's a good-looking team you've got. Don't let it go to their heads."
  ]);

  // =================================================================
  // Public API
  // =================================================================
  function eligible(line, ctx) {
    if (typeof line === "string") return true;
    if (line.phase && line.phase.indexOf(ctx.phase) < 0) return false;
    if (line.weather && line.weather.indexOf(ctx.weather) < 0) return false;
    if (line.chapter) {
      const ch = ctx.chapter === undefined ? 1 : ctx.chapter;
      if (ch < line.chapter[0] || ch > line.chapter[1]) return false;
    }
    if (line.cond && MQ.Flags && MQ.Flags.test && !MQ.Flags.test(line.cond)) return false;
    return true;
  }
  function textOf(line) { return typeof line === "string" ? line : line.t; }

  D.dialoguePool = function (kind, key) { return D.dialogue[(kind === "generic" ? "generic" : kind + "_" + key)] || null; };

  // Every line currently valid for the context, most specific first.
  D.chatterLines = function (opts) {
    opts = opts || {};
    const ctx = {
      phase: opts.phase || (MQ.Clock ? MQ.Clock.phase : "day"),
      weather: opts.weather || (MQ.Clock ? MQ.Clock.weather : "clear"),
      chapter: opts.chapter !== undefined ? opts.chapter : (MQ.Flags ? MQ.Flags.chapter : 1)
    };
    const out = [];
    const add = function (pool, weight) {
      if (!pool) return;
      for (let i = 0; i < pool.lines.length; i++) {
        const ln = pool.lines[i];
        if (eligible(ln, ctx)) out.push({ text: textOf(ln), weight: weight, from: pool.id });
      }
    };
    if (opts.town) add(D.dialogue["town_" + opts.town], 4);
    if (opts.archetype) add(D.dialogue["arch_" + opts.archetype], 3);
    if (opts.weatherPool !== false) add(D.dialogue["weather_" + ctx.weather], 1);
    if (opts.phasePool !== false) add(D.dialogue["phase_" + ctx.phase], 1);
    if (!out.length || opts.generic) add(D.dialogue.generic, 1);
    return out;
  };

  // One line, weighted towards the most specific pool available.
  D.chatter = function (opts) {
    opts = opts || {};
    const lines = D.chatterLines(opts);
    if (!lines.length) return "Alright.";
    const rnd = opts.rnd || (opts.seed !== undefined ? U.rng(opts.seed) : Math.random);
    let total = 0;
    for (let i = 0; i < lines.length; i++) total += lines[i].weight;
    let r = rnd() * total;
    for (let i = 0; i < lines.length; i++) { r -= lines[i].weight; if (r <= 0) return lines[i].text; }
    return lines[lines.length - 1].text;
  };
  // A small bundle for an NPC that should say the same thing all session.
  D.chatterFor = function (npcId, opts) {
    opts = opts || {};
    opts.seed = npcId + "|" + (opts.phase || (MQ.Clock ? MQ.Clock.phase : "day"));
    return D.chatter(opts);
  };
  D.archetypes = function () { return D.filter("dialogue", function (p) { return p.kind === "archetype"; }).map(function (p) { return p.key; }); };
  D.chatterTowns = function () { return D.filter("dialogue", function (p) { return p.kind === "town"; }).map(function (p) { return p.key; }); };
  D.chatterLineCount = function () {
    let n = 0;
    D.each("dialogue", function (p) { n += p.lines.length; });
    return n;
  };

  // ---- validation -------------------------------------------------
  const PHASES = { dawn: 1, day: 1, dusk: 1, night: 1 };
  const WEATHERS = { clear: 1, rain: 1, fog: 1, wind: 1, sun: 1, snow: 1 };
  D.validators.push(function (err) {
    const seen = {};
    D.each("dialogue", function (p, id) {
      if (["archetype", "town", "weather", "phase", "generic"].indexOf(p.kind) < 0) err("dialogue/" + id + ": bad kind '" + p.kind + "'");
      if (!p.lines || !p.lines.length) err("dialogue/" + id + ": empty pool");
      for (let i = 0; i < (p.lines || []).length; i++) {
        const ln = p.lines[i];
        const t = textOf(ln);
        if (!t || t.length < 8) err("dialogue/" + id + ": line " + i + " is too short");
        if (seen[t]) err("dialogue/" + id + ": duplicate line (also in " + seen[t] + "): " + t.slice(0, 40));
        seen[t] = id;
        if (typeof ln !== "string") {
          for (let j = 0; j < (ln.phase || []).length; j++) if (!PHASES[ln.phase[j]]) err("dialogue/" + id + ": bad phase '" + ln.phase[j] + "'");
          for (let j = 0; j < (ln.weather || []).length; j++) if (!WEATHERS[ln.weather[j]]) err("dialogue/" + id + ": bad weather '" + ln.weather[j] + "'");
          if (ln.chapter && !(ln.chapter.length === 2 && ln.chapter[0] <= ln.chapter[1])) err("dialogue/" + id + ": bad chapter range");
        }
      }
    });
    const total = D.chatterLineCount();
    if (total < 300) err("dialogue: only " + total + " lines (design target is 300+)");
  });
})();
