var express = require('express');
var mysql = require('mysql');
var fs = require('fs');
var json2csv = require('json2csv');
var http = require('http');
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
        console.log("open graph.html...");
        res.sendFile('graph.html',{root:__dirname});
    });
});

app.get('/view', (req,res)=>{ // not for access
    var interval = req.query.cnt;
    var offset = 30;
    var count = interval * offset;
    var format = "'%H:%i'";
    
    if(interval > 59)
        format = "'%e{} %H[]'";

    var sql = "select temperature, humidity, co2, dust_pm10, dust_pm25, DATE_FORMAT(time," + format + ") as time from (select * from indoor order by id desc limit "+ String(count) + ") as A order by id asc";

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
 
        console.log(row)

        for(var i=0;i<count;i++){
            if(i%interval == interval - 1) {
                var temperature = t_sum / interval;
                var co2 = co2_sum / interval;
                var dust_pm10 = dust_pm10_sum / interval;
                var dust_pm25 = dust_pm25_sum / interval;
                var humidity = h_sum / interval;
                time = String(row[i].time);
                
                var obj = {}
                obj[time] = [temperature, co2, dust_pm10, dust_pm25, humidity]
                json[parseInt(i/interval)] = obj;

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
        res.append('Data', JSON.stringify(json));
        res.status(200).send();
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

app.get('/write', (req,res)=>{
    console.log(req.query);
    fs.writeFileSync('manual.txt',req.query.manual);
    res.status(200).send();
});

function cal_pollution(table, discomfort){
    var val = new Array();
    val[0] = table.dust_pm10;
    val[1] = table.dust_pm25;
    val[2] = discomfort;
    val[3] = table.co2;

    console.log(val); 
    var std_low = [[0,31,81,151],[0,16,36,76],[0,68,75,80],[0,451,1001,2001]];
    var std_high = [[30,80,150,600],[15,35,75,500],[67,74,79,100],[450,1000,2000,5000]];

    var score_low=[0,51,101,251 ]; 
    var score_high=[50,100,250,500 ];
    var score=0;
    var max=0;
    var field_count=0;
    
    for(var i=0; i<4; i++){
        for(var j=0; j<4; j++){
            if(std_low[i][j]<=val[i]&&val[i]<=std_high[i][j]){
                score=(score_high[j]-score_low[j])/(std_high[i][j]-std_low[i][j])*(val[i]-std_low[i][j])+score_low[j];
                if(max<score)
                    max=score;
                if(j>1)
                    field_count++;                        
            }
        }
    }

    if(field_count==2)
        return max+50;
    else if(field_count>2)
        return max+75;
    else
        return max;
}

function calc_discomfort(table){
    var temperature = table.temperature;
    var humidity = table.humidity;
    return 9/5*temperature-0.55*(1-humidity/100)*(9/5*temperature-26)+32;
}

app.get('/read', (req,res) => {
    var indoor={};
    var outdoor={};
    var manual;
    manual = fs.readFileSync('manual.txt','utf-8');
    console.log(manual);

    if(manual == 2){
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
            var discomfort;
            var indoor_pol;
            var outdoor_pol;

            discomfort = calc_discomfort(indoor);
            indoor_pol = cal_pollution(indoor,discomfort);
            discomfort = calc_discomfort(outdoor);
            outdoor_pol = cal_pollution(outdoor,discomfort);

            console.log(indoor_pol);
            console.log(outdoor_pol);
            if(indoor_pol > outdoor_pol - 10)
                res.send('0');
            else 
                res.send('1');
        }, function (error) {

        });
    }
    else if(manual == 1){
        console.log("manual on");
        res.send('0');
    }
    else{
        console.log("manual off");
        res.send('1');
    }
});


app.listen(port,()=>{
    console.log('listening to port ' + port);
});

