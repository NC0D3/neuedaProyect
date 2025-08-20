export default function(app,connection) {

    app.get('/API/market/stock', async (req, res) => {
        if(Object.keys(req.query).length===0){
            try {
                const Response = await fetch('https://finnhub.io/api/v1/stock/symbol?exchange=US&token=d2f2qkpr01qj3egqt150d2f2qkpr01qj3egqt15g');
                const Data = await Response.json();
                const LimitedData = Data.slice(0,10);
                res.status(200).json(LimitedData); // results contains rows returned by server
            } catch (err) {
                console.log(err);
            }
        }else{
            const queryKeys = Object.keys(req.query);
            if(queryKeys[0]=='search'){
                const valor =req.query.search;
                const Response = await fetch(`https://finnhub.io/api/v1/search?q=${valor}&exchange=US&token=d2f2qkpr01qj3egqt150d2f2qkpr01qj3egqt15g`);
                const Data = await Response.json();
                res.status(200).json(Data.result);
            }
        }
    });


    app.get('/API/market/stock-price/:symbol', async (req, res) => {
        try {
            const symbol = req.params.symbol;
            const Response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=d2f2qkpr01qj3egqt150d2f2qkpr01qj3egqt15g`);
            const Data = await Response.json();
            res.status(200).json(Data); // results contains rows returned by server
            
        } catch (err) {
            console.log(err);
        }
    });

    app.post('/API/market/stock-buy',async (req,res) => {
        try{
            const { user_ID, symbol,name,amount,price,date,new_money } = req.body;
            if (!user_ID|| !symbol || !name || !amount || !price || !date || !new_money) {
                return res.status(400).json({
                    success: false,
                    message: 'some data is missing'
                });
            }
            const [resultsmoney] = await connection.execute('INSERT INTO investments(id_user,simbol,name_inv,quantity,buy_price,date_inv) VALUES(?,?,?,?,?,?);',[user_ID, symbol,name,amount,price,date]);
            const [results] = await connection.execute('UPDATE valores SET val = ? WHERE id_val = CONCAT(?,\'USD\')',[new_money,user_ID]);
            return res.status(200).json({
                success: true,
                message: 'The purchase has been made'
            });
        }catch(err){
            console.log(err);
        }
    });

}
