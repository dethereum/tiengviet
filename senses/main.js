var vntk = require('vntk');
var dictionary = vntk.dictionary();

const deck = require("../deck.json");
const vocab = deck['children'][2]['notes']


for (let index = 0; index < vocab.length; index++) {
    let note = vocab[index];

    // don't look up proper nouns they all fail
    if (note.fields[2] != "proper_noun") {
        const senses = dictionary.lookup(note.fields[0])

        if (senses) {
            if (senses.length == 1) {
                //console.log(`${note.fields[0]} is monosemous`)
                note.tags.push('tiengviet::meta::meaning::monosemous')
            }

            if (senses.length > 1) {
                note.tags.push('tiengviet::meta::meaning::ambiguous')

                console.log(`\nSenses for ${note.fields[0]} \n`)
                senses.forEach((sense) => {
                    console.log(sense)
                })
            }

            if (senses.length < 1) {
                console.log(`WTF ${note.fields[0]}`)
            }
        } else {
            console.log(`MISS FOR ${note.fields[0]}`)
            note.tags.push('tiengviet::meta::missed_by_vntk')
        }
    }
}

