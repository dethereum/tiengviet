const fs = require('fs')

const vntk = require('vntk');
const { nanoid } = require('nanoid');

const deck = require("../deck.json");

const DECK_MAP = {
    'VOCAB': 2,
    'COMPLEX_VOCAB': 0
}

const PHRASE_MODEL_UUID = "6f97455a-3ca6-11ed-b75d-e7ec0f58ddc6"

const dictionary = vntk.dictionary();

// THESE VIET WORDS ARE DELETED IN THE DECK NOW
const blacklist = [
    'thư giãn',
    'chảnh'
]

const getCleanExample = (example) => {
    if (example.includes(" ~ ")) {
        const split = example.split(" ~ ")

        return split[0]
    }

    return example
}

const createPhraseNotesFromAmbiVocab = (note, senses) => {
    senses.forEach(({ example, definition }) => {
        if (example) {
            const sentence = getCleanExample(example);

            const phrase_note = {
                "__type__": "Note",
                "fields": [
                    sentence,
                    note.fields[0],
                    definition,
                    note.fields[4],
                    ""
                ],
                "guid": nanoid(10),
                "note_model_uuid": PHRASE_MODEL_UUID,
                "tags": [
                    "tiengviet::meta::processed_by_vntk",
                    "tiengviet::meta::auto_gen",
                    "tiengviet::meta::needs_expert_review",
                    `tiengviet::meta::by_word::${note.fields[0].replace(" ", "_")}`
                ]
            }

            deck['children'][3]['notes'].push(phrase_note)
        }

    })
}

const getProcessedNotes = (notes) => {
    for (let index = 0; index < notes.length; index++) {
        let note = notes[index];

        if (note.tags.includes("tiengviet::meta::processed_by_vntk")) {
            continue;
        }

        if (!note.tags.includes("tiengviet::meta::processed")) {
            throw new Error('needs to be preprocessed by python')
        }

        // don't look up proper nouns (they all fail) OR blacklisted words
        if (note.fields[2] != "proper_noun" && !blacklist.includes(note.fields[0])) {
            const senses = dictionary.lookup(note.fields[0])

            if (senses) {
                console.log(`HIT FOR ${note.fields[0]}`)
                if (senses.length == 1) {
                    note.tags.push('tiengviet::meta::meaning::monosemous')
                }

                if (senses.length > 1) {
                    note.tags.push('tiengviet::meta::meaning::ambigious')
                    note.tags.push(`tiengviet::meta::by_word::${note.fields[0].replace(" ", "_")}`)
                    createPhraseNotesFromAmbiVocab(note, senses)
                }

                if (senses.length < 1) {
                    console.log(`WTF ${note.fields[0]}`)
                }
            } else {
                console.log(`MISS FOR ${note.fields[0]}`)
                note.tags.push('tiengviet::meta::missed_by_vntk')
            }
        }

        // if note is for proper noun tag it with one meaning
        if (note.fields[2] == "proper_noun") {
            note.tags.push('tiengviet::meta::meaning::monosemous')
        }

        note.tags = [...new Set(note.tags.map((tag) => tag == 'tiengviet::meta::processed' ? 'tiengviet::meta::processed_by_vntk' : tag))]
        notes[index] = note;
    }

    return notes;
}

// PROCESS DECKS OF INTEREST (vocab)
deck['children'][DECK_MAP['VOCAB']]['notes'] = getProcessedNotes(deck['children'][DECK_MAP['VOCAB']]['notes'])

// UPDATE DECK WITH NLP INFORMATION
const jsonString = JSON.stringify(deck, null, 4);

fs.writeFile("../deck.json", jsonString, err => {
    if (err) {
        console.log('Error writing file', err)
    } else {
        console.log('Successfully wrote file')
    }
})
