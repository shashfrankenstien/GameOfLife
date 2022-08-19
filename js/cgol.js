// https://playgameoflife.com/info

function randomChoice(arr) {
	return arr[Math.floor(Math.random() * arr.length)]
}



class CGOL {
    constructor(rows, cols, color, sleep_time) {
        this.rows = rows
        this.cols = cols
        this.color = color
        this.sleep_time = sleep_time

        this.vgrid = new Array(rows)
        for (let i=0; i<cols; i++)
            this.vgrid[i] = new Array(cols).fill(0)
        this.alive = []
        this.interval = null
    }

    createID(x, y) {
        return `${x}x${y}`
    }

    set(x, y, td_elem) {
        if(this.vgrid[x]!==undefined && this.vgrid[x][y]!==undefined)
            this.vgrid[x][y] = 1
        this.alive = this.alive.filter(e=>!(e.x===x && e.y===y))
        this.alive.push({x,y})

        if (!td_elem)
            td_elem = document.getElementById(this.createID(x, y))
        if (td_elem)
            td_elem.style.backgroundColor = this.color
    }

    delayedSet(x, y, td_elem) {
        if(this.vgrid[x]!==undefined && this.vgrid[x][y]!==undefined)
            this.vgrid[x][y] = 1

        setTimeout(()=>{
            this.alive = this.alive.filter(e=>!(e.x===x && e.y===y))
            this.alive.push({x,y})
        }, 500)

        if (!td_elem)
            td_elem = document.getElementById(this.createID(x, y))
        if (td_elem) {
            td_elem.style.backgroundColor = this.color
            // td_elem.style.border = "thin solid #0000FF";
        }
    }

    unset(x, y, td_elem) {
        if(this.vgrid[x]!==undefined && this.vgrid[x][y]!==undefined)
            this.vgrid[x][y] = 0
        this.alive = this.alive.filter(e=>!(e.x===x && e.y===y))

        if (!td_elem)
            td_elem = document.getElementById(this.createID(x, y))
        if (td_elem) {
            td_elem.style.backgroundColor = ""
            td_elem.style.border = ""
        }
    }

    get(x, y) {
        if(this.vgrid[x]!==undefined && this.vgrid[x][y]!==undefined)
            return this.vgrid[x][y]
    }

    createGrid() {
        let table = document.createElement('table')

        for (let y = 0; y<this.rows; y++) {
            let tr = document.createElement('tr')
            for (let x = 0; x<this.cols; x++) {
                let td = document.createElement('td')
                td.id = this.createID(x, y)
                const handler = (evt)=>{
                    if (evt.buttons!==1) return
                    evt.preventDefault()
                    if(td.style.backgroundColor==="") {
                        this.delayedSet(x, y, td)
                    }
                    // else {
                    //     this.unset(x, y)
                    // }
                }
                td.onmousedown = handler
                td.onmouseenter = handler
                tr.appendChild(td)
            }
            table.appendChild(tr)
        }

        document.getElementById('cgol').appendChild(table)
    }


    setTxtPattern(pattern_obj) {
        const col_offset = pattern_obj.col_offset || 0
        const row_offset = pattern_obj.row_offset || 0
        const alive_char = pattern_obj.alive_char || 'O'
        pattern_obj.pattern.split('\n').forEach((row, row_num)=>{
            [...row].forEach((cell, col_num)=>{
                // console.log(col_num, row_num)
                if(cell==alive_char)
                    this.set(col_num+col_offset, row_num+row_offset)
            })
        })
    }


    setRLEPattern(pattern_obj) {
        // Run Length Encoded
        const col_offset = pattern_obj.col_offset || 0
        const row_offset = pattern_obj.row_offset || 0
        const flip90 = pattern_obj.flip90 || false

        let  lines = pattern_obj.pattern.split('\n')
        lines = lines.filter((l=>(!l.startsWith('#') && !l.startsWith('x') && l.trim()!==''))) // remove meta line

        const pattern = lines.join('')
        // console.log(pattern)

        const setHelper = (col, row)=>{
            if (!flip90)
                this.set(col+col_offset, row+row_offset)
            else
                this.set(row+col_offset, col+row_offset)
        }

        let char_num = 0, row_num = 0, col_num = 0
        while (char_num<pattern.length) {
            const c = pattern[char_num]
            if (c==='!') break
             else {
                let count = parseInt(c)
                if (isNaN(count)) {
                    // console.log(1, pattern[char_num], col_num)
                    if (c==='$') {
                        // console.log(c, col_num)
                        row_num++
                        col_num = 0
                    } else {
                        if (c==='o') {
                            setHelper(col_num, row_num)
                        }
                        col_num++
                    }
                }
                else if (!isNaN(count)) {
                    let new_count = c
                    char_num++ // skip a char
                    while(!isNaN(parseInt(pattern[char_num]))) {
                        new_count += pattern[char_num]
                        char_num++
                    }
                    count = parseInt(new_count)
                    // console.log(count, pattern[char_num], col_num)
                    if (pattern[char_num]==='b') {
                        col_num += count
                    }
                    else if (pattern[char_num]==='o') {
                        for (let m=0; m<count; m++) {
                            setHelper(col_num, row_num)
                            col_num++
                        }
                    }
                    else if (pattern[char_num]==='$') {
                        // console.log(c, col_num)
                        row_num += count
                        col_num = 0
                    }
                }
            }
            char_num++
        }
    }


    getNeighbors(_x, _y) {
        let arr = []
        for (let x = _x-1; x<=_x+1; x++) {
            for (let y = _y-1; y<=_y+1; y++) {
                if (!(x===_x && y===_y)) {
                    arr.push({x, y})
                }
            }
        }
        return arr
    }

    getAliveNeighborsCount(_x, _y) {
        let count = 0
        for (let cell of this.getNeighbors(_x, _y)) {
            if (!(cell.x >= this.cols || cell.y >= this.rows))
                count = count + this.get(cell.x, cell.y)
            // console.log('   ', cell, this.vgrid[cell.x][cell.y])
        }
        return count
    }

    playStep() {
        let birth = []
        let death = []

        for (let cell of this.alive) {
            let society_pop = this.getAliveNeighborsCount(cell.x, cell.y)
            // console.log("cell", cell, society_pop)
            if (society_pop<=1 || society_pop >= 4) {
                death.push(cell)
            }

            let society = this.getNeighbors(cell.x, cell.y)
            for (let nbr of society) {
                let society_pop = this.getAliveNeighborsCount(nbr.x, nbr.y)
                // console.log("nbr", nbr, society_pop)
                if (society_pop===3) {
                    birth.push(nbr)
                }
            }
        }

        birth.forEach(b=>this.set(b.x, b.y))
        death.forEach(b=>this.unset(b.x, b.y))
    }

    start() {
        this.interval = setInterval(()=>this.playStep(), this.sleep_time)
    }

    stop() {
        if(this.interval)
            clearInterval(this.interval)
        this.interval = null
    }
}

