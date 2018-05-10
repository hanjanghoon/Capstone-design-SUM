var express = require('express');
var mysql = require('mysql');
var cron =require('node-cron');

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

function insert_db(query)
{
    var data = {};
    data.dust_i = query.dust_i;
    data.co2_i = query.co2_i;
    data.temperature_i = query.temperature_i;
    data.humidity_i = query.humidity_i;
    
    data.dust_o = query.dust_o;
    data.co2_o = query.co2_o;
    data.temperature_o = query.temperature_o;
    data.humidity_o = query.humidity_o;

    data.fan = query.fan;
    var sql = connection.query('insert into sensor set ?', data, function(err,row,col){
        if(err) throw err;
        console.log('databasse insertion don = %j',data);
    });
}

app.get('/insert',(req,res)=>{
    var query = req.query;
    insert_db(query);
    res.send('Database insertion done');
});

cron.schedule('0,10,20,30,40,50 * * * * *', function(req,res){
    var sql = 'select * from sensors';
    connection.query(sql,function(err,row,col){
        if(err){
            throw err;
            return;
        }
        console.log(row);
    });
});

app.listen(port,()=>{
    console.log('listening to port ' + port);
});

