const mysql = require('mysql2/promise');

const app = {}

app.init = async () => {
    // prisijungti prie duomenu bazes
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'mushroom',
    });

    let sql = '';
    let rows = [];

    // LOGIC BELOW
    // 1. Isspausdinti, visu grybu pavadinimus ir ju kainas, grybus isrikiuojant nuo brangiausio link pigiausio
    sql = 'SELECT `mushroom`, `price` FROM `mushroom` ORDER BY `mushroom` .`price` DESC';
    [rows] = await connection.execute(sql);

    let price = 0;
    console.log(`Grybai:`);
    for (let index = 0; index < rows.length; index++) {
        const mushroomName = rows[index].mushroom;
        const mushroomPrice = rows[index].price;
        console.log(`${index + 1}) ${mushroomName} ${mushroomPrice}`);
    }

    // 2. Isspausdinti, visu grybautoju vardus

    // 3. Isspausdinti, brangiausio grybo pavadinima

    // 4. Isspausdinti, pigiausio grybo pavadinima

    // 5. Isspausdinti, visu kiek vidutiniskai reikia grybu, jog jie svertu 1 kilograma (suapvalinti iki vieno skaiciaus po kablelio), 
    // isrikiuojant pagal pavadinima nuo abeceles pradzios link pabaigos

    // 6. Isspausdinti, visu grybautoju krepselyje esanciu grybu kiekius (issirikiuojant pagal grybautojo varda nuo abeceles pradzios link pabaigos)

    // 7.Isspausdinti, visu grybautoju krepseliu kainas (issirikiuojant nuo brangiausio link pigiausio krepselio), suapvalinant iki centu

}

app.init();

module.exports = app;