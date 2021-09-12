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
    let i = 0;

    const upName = str => {
        return str[0].toUpperCase() + str.slice(1);
    }

    // LOGIC BELOW

    // 1
    sql = 'SELECT `mushroom`, `price` FROM `mushroom` ORDER BY `price` DESC';
    [rows] = await connection.execute(sql);

    console.log('Grybai:');
    for (const { mushroom, price } of rows) {
        console.log(`${++i}) ${upName(mushroom)} - ${price} EUR/kg`);
    }

    console.log('');
    // 2
    sql = 'SELECT `name` FROM `gatherer`';
    [rows] = await connection.execute(sql);

    const names = rows.map(obj => obj.name);
    console.log(`Grybautojai: ${names.join(', ')}.`);

    console.log('');
    // 3
    sql = 'SELECT `mushroom` \
            FROM `mushroom` \
            WHERE `price` = ( \
                SELECT MAX(`price`) FROM `mushroom` \
            )';
    [rows] = await connection.execute(sql);

    console.log(`Brangiausias grybas yra: ${upName(rows[0].mushroom)}.`);

    console.log('');
    // 4
    sql = 'SELECT `mushroom` \
            FROM `mushroom` \
            WHERE `price` = ( \
                SELECT MIN(`price`) FROM `mushroom` \
            )';
    [rows] = await connection.execute(sql);

    console.log(`Pigiausias grybas yra: ${upName(rows[0].mushroom)}.`);

    console.log('');
    // 5 
    sql = 'SELECT `mushroom`, (1000 / `weight`) as amount \
            FROM `mushroom` ORDER BY `mushroom` ASC';
    [rows] = await connection.execute(sql);

    console.log('Grybai:');
    i = 0;
    for (const item of rows) {
        console.log(`${++i}) ${upName(item.mushroom)} - ${(+item.amount).toFixed(1)}`);
    }

    console.log('');
    // 6 
    sql = 'SELECT `name`, SUM(`count`) as amount \
            FROM `basket` \
            LEFT JOIN `gatherer` \
                ON `gatherer`.`id` = `basket`.`gatherer_id` \
            GROUP BY `basket`.`gatherer_id` \
            ORDER BY `name`';
    [rows] = await connection.execute(sql);

    console.log('Grybu kiekis pas grybautoja:');
    i = 0;
    for (const item of rows) {
        console.log(`${++i}) ${upName(item.name)} - ${item.amount} grybu`);
    }

    // 7
    sql = 'SELECT `name`, SUM(`count` * `price` * `weight`/ 1000) as amount \
            FROM `basket` \
            LEFT JOIN `gatherer` \
                ON `gatherer`.`id` = `basket`.`gatherer_id` \
            LEFT JOIN `mushroom`\
                ON `mushroom`.`id` = `basket`.`mushroom_id` \
            GROUP BY `basket`.`gatherer_id` \
            ORDER BY `amount` DESC';
    // SQL uzrasymo eiliskumas, ka po ko dedam:
    // SELECT + SUM - selectinam ir susumuojam. Naudojam amount
    // LEFT JOIN sujungiam dvi lenteles
    //     ON sulyginam, kas skirtingose lentelese yra bendro
    // GROUP BY grupavimas reiksmiu pagal pasirinkta parametra
    // ORDER BY pagal ka rikiuojam

    [rows] = await connection.execute(sql);

    console.log('Grybu krepselio kainos pas grybautoja:');
    i = 0;
    for (const item of rows) {
        console.log(`${++i}) ${upName(item.name)} - ${+item.amount} EUR`);
    }

    // 8
    // // lang= 'eng' - paduodam default reiksme
    async function mushroomsByRating(lang = 'en') {
        sql = 'SELECT `ratings`.`id`, `name_' + lang + '`, SUM(`count`) as amount\
    FROM `ratings`\
    LEFT JOIN `mushroom`\
    ON `mushroom`.`rating` = `ratings`.`id`\
    LEFT JOIN `basket`\
    ON `basket`.`mushroom_id` = `mushroom`.`id`\
    GROUP BY `ratings`.`id`\
    ORDER BY `ratings`.`id` DESC';
        [rows] = await connection.execute(sql);
        console.log(rows);
    }
    const kalbaLt = mushroomsByRating('lt');
    const kalbaEn = mushroomsByRating('en');

    // Kitas budas, geresnis
    // async function mushroomByRating(lang) {

    //     const langList = ['en', 'lt', 'esp', 'lv'];

    //     lang = langList.includes(lang) ? lang : langList[0];

    //     sql = 'SELECT `ratings`.`id`, `name_' + lang + '`, SUM(`count`) as amount\
    //     FROM `ratings`\
    //     LEFT JOIN `mushroom`\
    //         ON `mushroom`.`rating`=`ratings`.`id`\
    //     LEFT JOIN `basket`\
    //         ON `basket`.`mushroom_id` =`mushroom`.`id`\
    //     GROUP BY `ratings`.`id`\
    //     ORDER BY `ratings`.`id` DESC';

    //     [rows] = await connection.execute(sql);

    //     if (lang === 'lt') {

    //         console.log(`Grybu kiekis pagal ivertinima:`);
    //         for (let { id, name_lt, amount } of rows) {
    //             if (amount == null) {
    //                 amount = 0;
    //             }
    //             console.log(`${id} zvaigzdutes (${name_lt}) - ${amount} grybai`);
    //         }
    //     } else {
    //         console.log('');
    //         console.log(`Mushrooms count by rating:`);
    //         for (let { id, name_en, amount } of rows) {
    //             if (amount == null) {
    //                 amount = 0;
    //             }
    //             console.log(`${id} stars (${name_en}) - ${amount} grybai`);
    //         }
    //     }
    // }
    // await mushroomByRating('lt');
    // await mushroomByRating('en');

    // 9
    sql = 'SELECT `mushroom` as name, `rating`\
    FROM `mushroom`\
    WHERE `rating` >= 4\
    ORDER BY `rating` ASC' ;

    [rows] = await connection.execute(sql);

    let mushroomList = [];

    for (let { name, rating } of rows) {
        mushroomList.push(upName(name))
    }
    console.log('');
    console.log(`Grybai: ${mushroomList.join(', ')}.`);

    //10 
    sql = 'SELECT `mushroom` as name, `rating` \
    FROM `mushroom`\
    WHERE `rating` IN (1, 3, 5)\
    ORDER BY `rating` ASC';
    [rows] = await connection.execute(sql);
    mushroomList = [];

    for (let { name, rating } of rows) {
        mushroomList.push(upName(name))
    }
    console.log(rows);
    console.log(`Grybai: ${mushroomList.join(', ')}.`);

    // // DESTYTOJO 
    // // 1
    // sql = 'SELECT `mushroom`, `price` FROM `mushroom` ORDER BY `price` DESC';
    // [rows] = await connection.execute(sql);

    // console.log('Grybai:');
    // for (const { mushroom, price } of rows) {
    //     console.log(`${++i}) ${upName(mushroom)} - ${price} EUR/kg`);
    // }

    // console.log('');
    // // 2
    // sql = 'SELECT `name` FROM `gatherer`';
    // [rows] = await connection.execute(sql);

    // const names = rows.map(obj => obj.name);
    // console.log(`Grybautojai: ${names.join(', ')}.`);

    // console.log('');
    // // 3
    // sql = 'SELECT `mushroom` \
    //         FROM `mushroom` \
    //         WHERE `price` = ( \
    //             SELECT MAX(`price`) FROM `mushroom` \
    //         )';
    // [rows] = await connection.execute(sql);

    // console.log(`Brangiausias grybas yra: ${upName(rows[0].mushroom)}.`);

    // console.log('');
    // // 4
    // sql = 'SELECT `mushroom` \
    //         FROM `mushroom` \
    //         WHERE `price` = ( \
    //             SELECT MIN(`price`) FROM `mushroom` \
    //         )';
    // [rows] = await connection.execute(sql);

    // console.log(`Pigiausias grybas yra: ${upName(rows[0].mushroom)}.`);

    // console.log('');
    // // 5
    // sql = 'SELECT `mushroom`, (1000 / `weight`) as amount \
    //         FROM `mushroom` ORDER BY `mushroom` ASC';
    // [rows] = await connection.execute(sql);

    // console.log('Grybai:');
    // i = 0;
    // for (const item of rows) {
    //     console.log(`${++i}) ${upName(item.mushroom)} - ${(+item.amount).toFixed(1)}`);
    // }

    // console.log('');
    // // 6
    // sql = 'SELECT `gatherer`.`name`, SUM(`basket`.`count`) as amount \
    //         FROM `basket` \
    //         LEFT JOIN `gatherer` \
    //             ON `gatherer`.`id` = `basket`.`gatherer_id` \
    //         GROUP BY `basket`.`gatherer_id` \
    //         ORDER BY `gatherer`.`name` ASC';
    // [rows] = await connection.execute(sql);

    // console.log('Grybu kiekis pas grybautoja:');
    // i = 0;
    // for (const item of rows) {
    //     console.log(`${++i}) ${upName(item.name)} - ${item.amount} grybu`);
    // }

    // console.log('');
    // // 7
    // sql = 'SELECT `gatherer`.`name`, \
    //             SUM(`basket`.`count` * `mushroom`.`weight` * `mushroom`.`price` / 1000) as totalPrice \
    //         FROM `gatherer` \
    //         LEFT JOIN `basket` \
    //             ON `gatherer`.`id` = `basket`.`gatherer_id` \
    //         LEFT JOIN `mushroom` \
    //             ON `mushroom`.`id` = `basket`.`mushroom_id` \
    //         GROUP BY `gatherer`.`id` \
    //         ORDER BY totalPrice DESC';
    // [rows] = await connection.execute(sql);

    // console.log('Grybu krepselio kainos pas grybautoja:');
    // i = 0;
    // for (const item of rows) {
    //     console.log(`${++i}) ${upName(item.name)} - ${(+item.totalPrice).toFixed(2)} EUR`);
    // }

    // console.log('');
    // // 8
    // async function mushroomsByRating(lang) {
    //     const languages = ['en', 'lt'];
    //     lang = languages.includes(lang) ? lang : languages[0];

    //     const texts = {
    //         title: {
    //             en: 'Mushrooms count by rating',
    //             lt: 'Grybu kiekis pagal ivertinima',
    //         },
    //         stars: {
    //             en: 'stars',
    //             lt: 'zvaigzdutes',
    //         },
    //         mushrooms: {
    //             en: 'mushrooms',
    //             lt: 'grybai',
    //         },
    //     }

    //     const sql = 'SELECT `ratings`.`id`, \
    //                         `ratings`.`name_' + lang + '` as translation, \
    //                         SUM(`basket`.`count`) as amount \
    //                 FROM `ratings` \
    //                 LEFT JOIN `mushroom` \
    //                     ON `ratings`.`id` = `mushroom`.`rating`\
    //                 LEFT JOIN `basket` \
    //                     ON `mushroom`.`id` = `basket`.`mushroom_id`\
    //                 GROUP BY `ratings`.`id` \
    //                 ORDER BY `ratings`.`id` DESC';
    //     const [rows] = await connection.execute(sql);

    //     console.log(`${texts.title[lang]}:`);
    //     for (const item of rows) {
    //         const stars = texts.stars[lang];
    //         const tr = item.translation;
    //         const amount = item.amount ? item.amount : 0;
    //         const mushroom = texts.mushrooms[lang];
    //         console.log(`${item.id} ${stars} (${tr}) - ${amount} ${mushroom}`);
    //     }
    // }

    // await mushroomsByRating('en');
    // console.log('');
    // await mushroomsByRating('lt');

    // console.log('');
    // // 9
    // sql = 'SELECT `mushroom` FROM `mushroom` WHERE `rating` >= 4 ORDER BY `rating` ASC';
    // [rows] = await connection.execute(sql);

    // const mushroom = rows.map(obj => upName(obj.mushroom));
    // console.log(`Grybai: ${mushroom.join(', ')}.`);

    // console.log('');
    // // 10
    // sql = 'SELECT `mushroom` \
    //         FROM `mushroom` \
    //         WHERE `rating` IN (1, 3, 5) \
    //         ORDER BY `rating` ASC';
    // [rows] = await connection.execute(sql);

    // const mushroom135 = rows.map(obj => upName(obj.mushroom));
    // console.log(`Grybai: ${mushroom135.join(', ')}.`);

    // // MY LOGIC BELOW
    // // 1. Isspausdinti, visu grybu pavadinimus ir ju kainas, grybus isrikiuojant nuo brangiausio link pigiausio
    // sql = 'SELECT `mushroom`, `price` FROM `mushroom` ORDER BY `mushroom` .`price` DESC';
    // [rows] = await connection.execute(sql);
    // let price = 0;
    // console.log(`Grybai:`);
    // for (let index = 0; index < rows.length; index++) {
    //     const mushroomName = rows[index].mushroom;
    //     const mushroomNameUpperCase = mushroomName[0].toUpperCase() + mushroomName.slice(1);
    //     const mushroomPrice = rows[index].price;
    //     console.log(`${index + 1}) ${mushroomNameUpperCase} - ${mushroomPrice} EUR/kg`);
    // }

    // // 2. Isspausdinti, visu grybautoju vardus
    // sql = 'SELECT `name` FROM `gatherer`';
    // [rows] = await connection.execute(sql);
    // const uniqueGatherers = rows.map(obj => obj.name);
    // console.log(`Grybautojai: ${uniqueGatherers.join(', ')}.`);

    // // 3. Isspausdinti, brangiausio grybo pavadinima
    // sql = 'SELECT * FROM `mushroom` ORDER BY `mushroom`.`price` DESC';
    // [rows] = await connection.execute(sql);
    // const mushroomHighest = rows[0].mushroom
    // const mushroomHighestNameUpperCase = mushroomHighest.charAt(0).toUpperCase() + mushroomHighest.slice(1);
    // console.log(`Brangiausias grybas yra: ${mushroomHighestNameUpperCase}.`);

    // // 4. Isspausdinti, pigiausio grybo pavadinima
    // sql = ' SELECT * FROM `mushroom` ORDER BY`mushroom`.`price` ASC';
    // [rows] = await connection.execute(sql);
    // const mushroomLowest = rows[0].mushroom;
    // const mushroomLowestNameUpperCase = mushroomLowest.charAt(0).toUpperCase() + mushroomLowest.slice(1);
    // console.log(`Pigiausias grybas yra: ${mushroomLowestNameUpperCase}.`);

    // // 5. Isspausdinti, visu kiek vidutiniskai reikia grybu, jog jie svertu 1 kilograma (suapvalinti iki vieno skaiciaus po kablelio), 
    // // isrikiuojant pagal pavadinima nuo abeceles pradzios link pabaigos
    // sql = 'SELECT * FROM `mushroom` ORDER BY `mushroom`.`mushroom` ASC';
    // [rows] = await connection.execute(sql);
    // console.log(`Grybai:`);
    // for (let index = 0; index < rows.length; index++) {
    //     const mushroomName = rows[index].mushroom;
    //     const mushroomNameUpperCase = mushroomName[0].toUpperCase() + mushroomName.slice(1);
    //     const mushroomWeight = rows[index].weight;
    //     const mushroomsNumberTillKg = (1000 / mushroomWeight).toFixed(1);
    //     console.log(`${index + 1}) ${mushroomNameUpperCase} - ${mushroomsNumberTillKg}`);
    // }

    // // 6. Isspausdinti, visu grybautoju krepselyje esanciu grybu kiekius (issirikiuojant pagal grybautojo varda nuo abeceles pradzios link pabaigos)
    // sql = 'SELECT * FROM `basket`';
    // [rows] = await connection.execute(sql);
    // console.log(rows);

    // // 7.Isspausdinti, visu grybautoju krepseliu kainas (issirikiuojant nuo brangiausio link pigiausio krepselio), suapvalinant iki centu

}

app.init();

module.exports = app;