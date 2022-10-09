export const searchDictionary = (term) => {
    dictionary.words.forEach((wd, i) => {
        if (wd.startsWith(term)) {
            console.log(wd)
            console.log(i)
            const s = dictionary.lookup(wd)
            console.log(s)
        }
    })
}

export const makeAlternateDictSearch = (dict) => (term) => {
    const def_keys = Object.keys(dict.definitions)

    const hits = keys.reduce((acc, cur) => {
        if(cur.includes("thư")) {
            const v = dict.definitions[cur]
    
            return {...acc, [cur]: v}
        } 
        return acc;
        
    }, {})
    
    console.log(hits)
}