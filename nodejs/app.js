var express = require('express');
var mysql = require('mysql');
var cron = require('node-cron');

var app = express();
var port = 3000;

var connection = mysql.createConnection({
    host : 'localhost',
    port : 3306,
    user : 'root',
    password : '1234',
    database : 'sum_db',
});

connection.connect(function(err){
    if(err){
        console.error('mysql connection error');
        console.error(err);
        throw err;
    }
    console.log('mysql connected');
});

app.get('/update',(req, res)=>{
    var query = req.query;
    
    function insert_db(query)
    {
        var sql = "INSERT INTO " + query.tab_name + " (dust_pm25, dust_pm10, humidity, temperature, co2) VALUES ?";
        var value = [
            [query.dust_pm25, query.dust_pm10, query.humidity, query.temperature, query.co2]
        ];
        connection.query(sql, [value], function(err,res){
            if(err) throw err;
            console.log(res);
        });    
    }
    insert_db(query);
    
    res.send(query);
});

/*
cron.schedule('0,10,20,30,40,50 * * * * *', function(req,res){
    var sql = 'select * from indoor';
    connection.query(sql,function(err,row,col){
        if(err){
            throw err;
            return;
        }
        console.log(row);
    });
    sql = 'select * from outdoor';
    connection.query(sql,function(err,row,col){
        if(err){
            throw err;
            return;
        }
        console.log(row);
    });
});
*/

app.listen(port,()=>{
    console.log('listening to port ' + port);
});

