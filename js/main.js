
const cgol = new CGOL(120, 240, "green", 100)
cgol.createGrid()

document.getElementById('clear-btn').onclick = () => {
    cgol.createGrid()
}




Pattern.loadAll().then(()=>{
    // cgol.setPattern(PATTERNS['puffer_synthesis'])

    // cgol.setRLEPattern(PATTERNS['3engine'])

    const select = document.getElementById('pattern-select')

    for(let name in PATTERNS) {
        const opt = document.createElement('option')
        opt.value = name
        opt.innerText = name
        select.appendChild(opt)
    }


    select.onchange = ()=>{
        console.log(select.value)
        cgol.pattern_pending = PATTERNS[select.value]
    }

    cgol.onclick = ()=>{
        select.value = 'dot'
    }

})


cgol.start()
// setTimeout(()=>cgol.start(), 3000)
// setInterval(()=>cgol.color=randomChoice(["red","blue","green","yellow"]),20000)
