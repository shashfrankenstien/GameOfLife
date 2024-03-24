const PATTERNS = {}

class Pattern {
    constructor(name, pattern, options={}) {
        this.name = name
        this.flip90 = options.flip90 || false
        this.comments = null
        this.alive_char = null
        this.type = null
        this.pattern = null
        this.parse(pattern)
    }

    parse(pattern) {
        // for TXT type patterns:
        //  - comments start with # or !
        //  - non comment lines overall should have only 2 unique characters
        //      - "." for dead cell and any other character for alive cell (ex: "*" or "O")
        //
        // for Run Length Encoded (RLE) type patterns:
        //  - comments can start with # or ! (optional)
        //  - pattern starts with "x =" and ends with "!" as the last character
        //  - any lines after pattern ends can be used as additional comments
        //
        let lines = pattern.split('\n').map(l=>l.trim())
        let comments = lines.filter(l=>(l.startsWith('#') || l.startsWith('!'))) // save obvious comments
        this.comments = comments.join('\n')

        let pat_lines = lines.filter((l=>(!l.startsWith('#') && !l.startsWith('!') && l.trim()!==''))) // remove comment line

        // testing for TXT
        // Split the string to make array
        let unique_chars = new Set(pat_lines.join("").split(""))
        unique_chars = [...unique_chars]
        if (unique_chars.length === 2 && unique_chars.includes('.')) {
            this.alive_char = unique_chars.filter(c=>(c!='.'))[0]
            this.type = 'TXT'
            this.pattern = pat_lines.join('\n')
            return
        }

        // testing for RLE
        if (pat_lines[0].startsWith("x =")) {
            pat_lines = pat_lines.slice(1) // remove "x =" line
        }

        const final_rle = []
        let end_reached = false
        for (let l of pat_lines) {
            if (end_reached) {
                this.comments += '\n' + l
            } else {
                final_rle.push(l)
            }
            if (l.endsWith("!")) {
                end_reached = true
            }
        }
        this.type = 'RLE'
        this.pattern = final_rle.join("")
    }

    static async fromFileURL(filename) {
        return fetch(`pattern_files/${filename}`).then(res=>{
            return res.text()
        }).then(r=>{
            return new Pattern(filename.replace('.lif', ''), r)
        })
    }

    static async loadAll() {
        return fetch('pattern_files.txt').then(res=>{
            return res.text()
        }).then(r=>{
            var promises = [];

            for (let a of r.split('\n')) {
                if (a.trim()) {
                    promises.push(
                        Pattern.fromFileURL(a.trim()).then(p=>{
                            PATTERNS[p.name] = p
                        }).catch(e=>console.log(a, e))
                    )
                }
            }
            return Promise.all(promises)
        })
    }
}

