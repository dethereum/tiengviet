import json

from bs4 import BeautifulSoup
from pyvi import ViTokenizer, ViPosTagger

tag_prefix = "tiengviet::meta::"

pos_tags = {
    'A': 'Adjective',
    'C': 'Coordinating_conjunction',
    'E': 'Preposition',
    'I': 'Interjection',
    'L': 'Determiner',
    'M': 'Numeral',
    'N': 'Common_noun',
    'Nc': 'Noun_Classifier',
    'Ny': 'Noun_abbreviation',
    'Np': 'Proper_noun',
    'Nu': 'Unit_noun',
    'P': 'Pronoun',
    'R': 'Adverb',
    'S': 'Subordinating_conjunction',
    'T': 'Auxiliary',
    'V': 'Verb',
    'X': 'Unknown',
    'F': 'Filtered_out_(punctuation)',
}

def unique(list1):
    unique_list = []

    for x in list1:
        if x not in unique_list:
            unique_list.append(x)

    return unique_list

def get_notes_data():
    json_file = open('../deck.json')
    anki = json.load(json_file)

    # hard code vocab deck path
    notes = anki['children'][1]["notes"]

    for note in notes:
        audio_field = note['fields'][4]
        x = ViTokenizer.tokenize(note['fields'][0])
        tokens, pos = ViPosTagger.postagging(ViTokenizer.tokenize(note['fields'][0]))

        note['fields'][5] = audio_field.split(':')[1].replace("]", "")

        if len(tokens) > 1:
            note["tags"].append(tag_prefix + "pos::na")
            note['fields'][2] = 'N/A'
        else:
            note["tags"].append(tag_prefix + "pos::" + pos_tags[pos[0]])
            note['fields'][2] = pos_tags[pos[0]]

        sortable_field = note['fields'][0]
        
        for fno, field in enumerate(note['fields']):
            bs_field = BeautifulSoup(field, "html.parser")
            
            if bool(bs_field.find()):
                note['fields'][fno] = bs_field.get_text().strip()


        note["tags"].append(tag_prefix + "processed")
        note["tags"] = sorted(unique(note["tags"]), key=str.lower)


    json_out = open('../deck.json', 'w')
    json_out.write(json.dumps(anki, indent=4, ensure_ascii=False))

    json_file.close()
    json_out.close()

def main():
    get_notes_data()

if __name__ == "__main__":
    main()