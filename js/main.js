
// const cgol = new CGOL(200, 400, "blue", 155)
const cgol = new CGOL(100, 200, "blue", 100)
cgol.createGrid()

cgol.setTxtPattern({
    pattern: duelingbanjosp24gun,
    col_offset: 30,
    row_offset: 10
})

cgol.setTxtPattern({
    pattern: xwsstagalong_spaceship,
    col_offset: 150,
    row_offset: 10
})


// cgol.setTxtPattern({
//     pattern: p45_glider_gun,
//     col_offset: 100,
//     row_offset: 30
// })

cgol.setRLEPattern({
    pattern: gosper_glider_gun,
    col_offset: 120,
    row_offset: 40
})

cgol.setRLEPattern({
    pattern: barge_spaceship,
    col_offset: 30,
    row_offset: 70,
    flip90: true
})

cgol.setRLEPattern({
    pattern: puffer_synthesis,
    col_offset: 120,
    row_offset: 50,
    // flip90: true
})


setTimeout(()=>cgol.start(), 3000)
// cgol.start()
setInterval(()=>cgol.color=randomChoice(["red","blue","green","yellow"]),20000)
