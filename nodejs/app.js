var express = require('express');
var mysql = require('mysql');
var fs = require('fs');
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

app.get('/graph', (req,res)=>{
    fs.open('graph.html','r',(err,fd)=>{
        if(err){
            throw err;
        }
        res.sendFile('graph.html',{root:__dirname});
    });
});

app.get('/view', (req,res)=>{
    var count = req.query.cnt;
    var sql = "select * from (select * from indoor order by id desc limit "+ String(count) +") as A order by id asc";
    var offset = 30*(count/900);
    console.log(count);
    console.log(sql);
    console.log(offset);

    connection.query(sql, function(err,row){
        if(err){
            throw err;
            return;
        }
      
        var t_sum = 0;
        var co2_sum = 0;
        var dust_pm25_sum = 0;
        var dust_pm10_sum = 0;
        var h_sum = 0;
        var time= 0;
        var json = [];

        for(var i=0;i<count;i++){
            if(i%offset == offset-1) {
                var temperature = t_sum /offset;
                var co2 = co2_sum / offset;
                var dust_pm10 = dust_pm10_sum / offset;
                var dust_pm25 = dust_pm25_sum / offset;
                var humidity = h_sum /offset;
                time = String(row[i].time);
                
                var obj = {}
                obj[time] = [temperature, co2, dust_pm10, dust_pm25, humidity]
                json[parseInt(i/offset)] = obj;

                t_sum = 0;
                h_sum = 0;
                co2_sum = 0;
                dust_pm25_sum = 0;
                dust_pm10_sum = 0;
            }
            t_sum+=row[i].temperature;
            h_sum+=row[i].humidity;
            co2_sum += row[i].co2;
            dust_pm25_sum += row[i].dust_pm25;
            dust_pm10_sum += row[i].dust_pm10;
        }
      
        fs.open('line_chart.html','r',(err,fd)=> {
            if(err){
                throw err;
            }
            res.sendFile('line_chart.html',{root:__dirname});
            res.append('Data', JSON.stringify(json));;
        });
    });  
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

app.get('/download', (req,res) => {
    console.log('download csv file');
    var tab_name = req.query.tab_name;

    var sql =  'select * from '+ tab_name + ' order by id asc';
    connection.query(sql, function(err,row){
        if(err){
            throw err;
            return;
        }
        var file_name = tab_name + ".csv";
        res.attachment(file_name);
        console.log(file_name);
        var output = json2csv.parse(row);
        res.status(200).send(output);
    });
});

app.get('/read', (req,res) => {
    var indoor={};
    var outdoor={};

    var in_promise = new Promise(function (resolve, reject) {
        var sql = 'select * from indoor order by id desc limit 1';
        connection.query(sql,function(err,row,col){
            if(err){
                throw err;
                return;
            }
            indoor = row[0];
            resolve();
        });
    });

    var out_promise = new Promise(function (resolve, reject) {
        sql = 'select * from outdoor order by id desc limit 1';
        connection.query(sql,function(err,row,col){
            if(err){
                throw err;
                return;
            }
            outdoor = row[0];
            resolve();
        });
    });

    Promise.all([in_promise, out_promise]).then(function (text){
        if(indoor.temperature > 30)
            res.send('0');
        else 
            res.send('1');
    }, function (error) {

    });

});


app.listen(port,()=>{
    console.log('listening to port ' + port);
});

