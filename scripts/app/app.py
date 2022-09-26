import json

def get_notes_data():
    json_file = open('../deck.json')
    anki = json.load(json_file)

    # hard code vocab deck path
    notes = anki['children'][1]["notes"]

    for note in notes:
        audio_field = note['fields'][4]
        note['fields'][5] = audio_field.split(':')[1].replace("]", "")


    json_out = open('../deck.json', 'w')
    json_out.write(json.dumps(anki, indent=4, ensure_ascii=False))

    json_file.close()
    json_out.close()

def main():
    get_notes_data()

if __name__ == "__main__":
    main()