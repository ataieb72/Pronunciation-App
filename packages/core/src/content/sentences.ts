/**
 * Everyday sentences for clear-speech pairs (product-design §4; elocution-focus §6). Each one is
 * loaded with the word endings that mumblers drop:
 * - French: a consonant plus l or r at the end (-ble, -tre, -dre, -pre, -cle, and the same family
 *   such as -bre, -vre). In casual Paris French most such nouns lost at least one sound
 *   (mumbling-note §6 [Moderate]).
 * - English: final stops and clusters (asked, helped, world, texts).
 * The baseline sentences are held out: they never appear in practice, so later Checks can reuse
 * them without item learning.
 */
export type Language = 'en' | 'fr';

export interface SentenceItem {
  readonly id: string;
  readonly language: Language;
  readonly text: string;
  /** Words that carry a target ending, in lower case, as `wordsOf` splits them. */
  readonly targets: readonly string[];
}

type Row = readonly [text: string, targets: readonly string[]];

function bank(language: Language, prefix: string, rows: readonly Row[]): readonly SentenceItem[] {
  return rows.map(([text, targets], i) => ({ id: `${language}-${prefix}${String(i + 1).padStart(2, '0')}`, language, text, targets }));
}

const EN_PRACTICE: readonly Row[] = [
  ['Sam asked me to fix the front door this weekend.', ['asked', 'fix', 'front', 'weekend']],
  ['She texted me twice before the meeting started.', ['texted', 'started']],
  ['We walked to the market and bought fresh bread.', ['walked', 'market', 'bought', 'bread']],
  ['He missed the last bus, so he took a cab.', ['missed', 'last', 'took', 'cab']],
  ['Could you send me the list of tasks by Friday?', ['send', 'list', 'tasks']],
  ['I kept the receipt in the top drawer of my desk.', ['kept', 'receipt', 'top', 'desk']],
  ['The kids played in the park until it got dark.', ['played', 'park', 'got', 'dark']],
  ['My friend moved to a flat near the old port.', ['friend', 'moved', 'flat', 'old', 'port']],
  ['We stopped for a snack on the way back.', ['stopped', 'snack', 'back']],
  ['I think the last test was harder than the first.', ['think', 'last', 'test', 'first']],
  ['Please lock the back door before you go to bed.', ['lock', 'back', 'bed']],
  ['He fixed the old bike and took it to work.', ['fixed', 'old', 'took', 'work']],
  ['Can you pick up some milk and bread on your way home?', ['pick', 'milk', 'bread']],
  ['I left my coat at the office last night.', ['left', 'coat', 'last', 'night']],
  ['The doctor asked me to rest for a week.', ['asked', 'rest', 'week']],
  ['We talked about the project over breakfast.', ['talked', 'project', 'breakfast']],
  ['She called her dad and told him the good news.', ['called', 'dad', 'told', 'good']],
  ['I need at least eight hours of sleep to think straight.', ['need', 'least', 'eight', 'think', 'straight']],
  ['Our flight landed an hour late because of the wind.', ['flight', 'landed', 'wind']],
  ['He worked late and missed dinner with his friends.', ['worked', 'missed', 'friends']],
  ['I paid for the tickets and kept the change.', ['paid', 'tickets', 'kept']],
  ['The shop next to the bank closed at six.', ['shop', 'next', 'bank', 'closed', 'six']],
  ['We watched a great film at the club last week.', ['watched', 'great', 'club', 'last', 'week']],
  ['Please check the facts before you post it online.', ['check', 'facts', 'post']],
  ['I dropped my phone and cracked the screen.', ['dropped', 'cracked']],
  ['My aunt baked a big cake for our street party.', ['aunt', 'baked', 'big', 'street']],
  ['He jumped out of bed when the alarm went off.', ['jumped', 'bed', 'went']],
  ['We split the bill and took a cab back home.', ['split', 'took', 'cab', 'back']],
  ['Could you help me lift the desk into the flat?', ['help', 'lift', 'desk', 'flat']],
  ['I booked a table for eight at the Greek place.', ['booked', 'eight', 'greek']],
  ['The printer jammed again, so I fixed it myself.', ['jammed', 'fixed']],
  ['She thanked us and packed her bags for the trip.', ['thanked', 'packed', 'bags', 'trip']],
  ['I spent the whole weekend cleaning the kitchen.', ['spent', 'weekend']],
  ['The coffee was cold, so I asked for another cup.', ['cold', 'asked', 'cup']],
  ['He locked the car and left the keys inside.', ['locked', 'left']],
  ['We planned a short trip to the coast in August.', ['planned', 'short', 'trip', 'coast', 'august']],
  ['I finished the report just before the deadline.', ['finished', 'report', 'just']],
  ['The cat slept on the chair next to the heater.', ['cat', 'slept', 'next']],
  ['My neighbour lent me his drill last month.', ['lent', 'last']],
  ['Text me the address and I will meet you there.', ['text', 'meet']],
];

const EN_BASELINE: readonly Row[] = [
  ['I asked her to help me with the world map.', ['asked', 'help', 'world', 'map']],
  ['We walked back to the hotel after the last show.', ['walked', 'back', 'last']],
  ['He dropped the bags and locked the front door.', ['dropped', 'bags', 'locked', 'front']],
  ['She kept the old desk and sold the rest.', ['kept', 'old', 'desk', 'sold', 'rest']],
  ['I think the next bus stops right outside the park.', ['think', 'next', 'stops', 'right', 'park']],
  ['They missed the start of the match last night.', ['missed', 'start', 'last', 'night']],
  ['My friend fixed the leak under the sink.', ['friend', 'fixed', 'leak', 'sink']],
  ['Could you text me the times when you get back?', ['text', 'get', 'back']],
];

const FR_PRACTICE: readonly Row[] = [
  ['Il faut prendre le train avant quatre heures.', ['prendre', 'quatre']],
  ['N’oublie pas de mettre la lettre à la poste.', ['mettre', 'lettre']],
  ['Mon oncle habite au centre de la ville.', ['oncle', 'centre']],
  ['C’est possible de se voir samedi après le théâtre ?', ['possible', 'théâtre']],
  ['Il faut attendre quatre minutes pour le prochain bus.', ['attendre', 'quatre']],
  ['Je n’arrive pas à comprendre votre message.', ['comprendre', 'votre']],
  ['Notre chambre est simple mais très agréable.', ['notre', 'chambre', 'simple', 'agréable']],
  ['Elle a perdu sa montre entre deux stations.', ['montre', 'entre']],
  ['On se retrouve à quatre heures devant notre immeuble.', ['quatre', 'notre']],
  ['Il a rangé les livres sur la table de la cuisine.', ['livres', 'table']],
  ['Tu peux mettre le sucre sur la table ?', ['mettre', 'sucre', 'table']],
  ['Ce meuble est trop large pour notre salon.', ['meuble', 'notre']],
  ['Il faut descendre au prochain arrêt pour le centre.', ['descendre', 'centre']],
  ['Je vais rendre la clé à notre voisin.', ['rendre', 'notre']],
  ['Votre dossier est prêt, il suffit de répondre au mail.', ['votre', 'répondre']],
  ['C’est impossible de se garer près du centre le samedi.', ['impossible', 'centre']],
  ['Je préfère l’autre table, près de la fenêtre.', ['autre', 'table', 'fenêtre']],
  ['Mon frère cherche un appartement propre près du centre.', ['propre', 'centre']],
  ['On peut prendre un verre ensemble après le travail.', ['prendre', 'ensemble']],
  ['Tu peux répondre à ton oncle ce soir ?', ['répondre', 'oncle']],
  ['Nous allons vendre notre vieille voiture en octobre.', ['vendre', 'notre', 'octobre']],
  ['Le spectacle commence à vingt heures au théâtre.', ['spectacle', 'théâtre']],
  ['Je n’ai pas pu entendre le numéro de la chambre.', ['entendre', 'chambre']],
  ['Il fait doux, c’est agréable de lire un livre dehors.', ['agréable', 'livre']],
  ['Il faut quatre œufs et un peu de sucre pour la pâte.', ['quatre', 'sucre']],
  ['Mon oncle a acheté un vélo pour aller au centre.', ['oncle', 'centre']],
  ['Il semble que notre voisin soit parti en vacances.', ['semble', 'notre']],
  ['Les enfants se sont assis en cercle autour de la table.', ['cercle', 'table']],
  ['Il faut attendre ton oncle devant la porte.', ['attendre', 'oncle']],
  ['C’est un problème simple, on peut le régler ensemble.', ['simple', 'ensemble']],
  ['Tu peux prendre l’autre chaise, je reste debout.', ['prendre', 'autre']],
  ['La réunion est prévue le quatre octobre à dix heures.', ['quatre', 'octobre']],
  ['Mon fils est capable de lire un livre en une soirée.', ['capable', 'livre']],
  ['J’ai laissé ma montre sur le meuble de l’entrée.', ['montre', 'meuble']],
  ['Ils vont reprendre le travail le quatre septembre.', ['reprendre', 'quatre', 'septembre']],
  ['Un litre de lait et du sucre, c’est tout ce qu’il faut.', ['litre', 'sucre']],
  ['On se retrouve entre midi et deux devant votre bureau.', ['entre', 'votre']],
  ['Ce badge va te permettre d’entrer dans l’autre bâtiment.', ['permettre', 'autre']],
  ['Il faut descendre la poubelle avant huit heures, c’est possible ?', ['descendre', 'possible']],
  ['Le centre sportif ouvre à quatre heures le dimanche.', ['centre', 'quatre']],
];

const FR_BASELINE: readonly Row[] = [
  ['Le ministre a pris la table du fond.', ['ministre', 'table']],
  ['Il faut prendre l’autre route pour aller au centre.', ['prendre', 'autre', 'centre']],
  ['Notre oncle vient dîner le quatre octobre.', ['notre', 'oncle', 'quatre', 'octobre']],
  ['C’est possible d’ouvrir la fenêtre de la chambre ?', ['possible', 'fenêtre', 'chambre']],
  ['Elle doit rendre le livre à la bibliothèque.', ['rendre', 'livre']],
  ['Je dois répondre à votre lettre avant ce soir.', ['répondre', 'votre', 'lettre']],
  ['Le spectacle était agréable, mais un peu trop long.', ['spectacle', 'agréable']],
  ['On va attendre ensemble devant le théâtre.', ['attendre', 'ensemble', 'théâtre']],
];

export const PRACTICE_SENTENCES: Readonly<Record<Language, readonly SentenceItem[]>> = {
  en: bank('en', 'p', EN_PRACTICE),
  fr: bank('fr', 'p', FR_PRACTICE),
};

export const BASELINE_SENTENCES: Readonly<Record<Language, readonly SentenceItem[]>> = {
  en: bank('en', 'base-', EN_BASELINE),
  fr: bank('fr', 'base-', FR_BASELINE),
};

/** Lower-case words; apostrophes and punctuation split words (l’autre → l, autre). */
export function wordsOf(text: string): string[] {
  return text.toLowerCase().match(/\p{L}+/gu) ?? [];
}

/**
 * Whether a word ends the way the bank needs (spelling rules that match the sounds for the
 * chosen words): English, a final stop or x, or a stop plus s; French, a consonant plus l or r
 * plus a silent e (-ble, -tre, -dre, -pre, -cle, -bre, -vre …), plural s allowed.
 */
export function hasTargetEnding(language: Language, word: string): boolean {
  const w = word.toLowerCase();
  return language === 'en' ? /(?:[bdgkptx]|[bdgkpt]s)$/.test(w) : /[bcdfgptv][lr]es?$/.test(w);
}
