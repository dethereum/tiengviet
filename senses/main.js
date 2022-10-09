const fs = require('fs')

const vntk = require('vntk');

const deck = require("../deck.json");


const dictionary = vntk.dictionary();
const vocab = deck['children'][2]['notes']

const blacklist = [
    'thư giãn',
    'chảnh'
]

const countPosFrequency = (my_list) => {
    // Creating an empty dictionary
    const pos_freq = my_list.reduce((acc, { pos }) => {
        if (acc[pos]) {
            return { ...acc, [pos]: acc[pos] + 1 }
        } else {
            return { ...acc, [pos]: 1 }
        }
    }, {})

    console.log(pos_freq)

    const pos_keys = Object.keys(pos_freq);
    const hasUniqueMeanings = pos_keys.reduce((acc, cur) => {
        if (!acc) return false;

        return pos_freq[cur] > 1 ? false : true
    }, true)

    return hasUniqueMeanings
}




for (let index = 0; index < vocab.length; index++) {
    let note = vocab[index];

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
            if (senses.length == 1) {
                note.tags.push('tiengviet::meta::meaning::monosemous')
            }

            if (senses.length > 1) {
                const hasUniqueMeanings = countPosFrequency(senses)
                note.tags.push(`tiengviet::meta::meaning::${hasUniqueMeanings ? 'uniq_and_ambigious' : 'ambigious'}`)
            }

            if (senses.length < 1) {
                console.log(`WTF ${note.fields[0]}`)
            }
        } else {
            console.log(`MISS FOR ${note.fields[0]}`)
            note.tags.push('tiengviet::meta::missed_by_vntk')
        }
    }

    note.tags = [...new Set(note.tags.map((tag) => tag == 'tiengviet::meta::processed' ? 'tiengviet::meta::processed_by_vntk' : tag))]
    vocab[index] = note;
}

deck['children'][2]['notes'] = vocab;
const jsonString = JSON.stringify(deck, null, 4);

fs.writeFile("../deck.json", jsonString, err => {
    if (err) {
        console.log('Error writing file', err)
    } else {
        console.log('Successfully wrote file')
    }
})
