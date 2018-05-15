var express = require('express');
var mysql = require('mysql');
var cron = require('node-cron');
var json2csv = require('json2csv');
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

app.get('/download', (req,res) => {
    console.log('download csv file');
    var tab_name = req.query.tab_name;

    var sql =  'select * from '+ tab_name + ' order by id asc';
    connection.query(sql, function(err,row){
        if(err){
            throw err;
            return;
        }
        if(tab_name == 'indoor')
            res.attachment('indoor.csv');
        else if(tab_name == 'outdoor');
            res.attachment('outdoor.csv');
        var output = json2csv.parse(row);
        res.status(200).send(output);
    });
});

app.get('/read', (req,res) => {
    var sql = 'select * from indoor order by id desc limit 1';
    var indoor={};
    var outdoor={};
    connection.query(sql,function(err,row,col){
        if(err){
            throw err;
            return;
        }
        indoor = row[0];
        console.log(indoor);
    });
    sql = 'select * from outdoor order by id desc limit 1';
    connection.query(sql,function(err,row,col){
        if(err){
            throw err;
            return;
        }
        outdoor = row[0];
        console.log(outdoor);
    });

    console.log(indoor.temperature, outdoor.temperature);

    
    if(indoor.temperature > outdoor.temperature+2){
        res.send('0');
        console.log('0');
    }
    else {
        res.send('1');
        console.log('1');
    }
});

app.listen(port,()=>{
    console.log('listening to port ' + port);
});

