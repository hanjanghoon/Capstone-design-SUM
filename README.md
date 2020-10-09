## 2018 Capstone-design-SUM

자동 환기 시스템

### 2018.05.09

* Setup Ubuntu Server
* Make DataBase table for testing -> Insert Clear

|Field           |Type          |Null  |Key  |Default            |Extra                        | 
|:--------------:|:------------:|:----:|:---:|:-----------------:|:---------------------------:|   
| id             | int(11)      | NO   | PRI | NULL              | auto_increment              |
| micro_dust_i   | decimal(5,2) | NO   |     | NULL              |                             |
| co2_i          | decimal(5,2) | NO   |     | NULL              |                             |
| temperature_i  | decimal(3,2) | NO   |     | NULL              |                             |
| humidity_i     | decimal(3,2) | NO   |     | NULL              |                             |
| li_intensity_i | decimal(5,2) | NO   |     | NULL              |                             |
| micro_dust_o   | decimal(5,2) | NO   |     | NULL              |                             |
| co2_o          | decimal(5,2) | NO   |     | NULL              |                             |
| temperature_o  | decimal(3,2) | NO   |     | NULL              |                             |
| humidity_o     | decimal(3,2) | NO   |     | NULL              |                             |
| li_intensity_o | decimal(5,2) | NO   |     | NULL              |                             |
| date           | datetime     | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |


### 2018.05.13

* Server connection
* DataBase table fixed for asynchronization
* DataBase insertion, selection test

table 1 : indoor, table 2 : outdoor

|Field           |Type          |Null  |Key  |Default            |Extra                        | 
|:--------------:|:------------:|:----:|:---:|:-----------------:|:---------------------------:|   
| id             | int(11)      | NO   | PRI | NULL              | auto_increment              |
| dust_pm25      | decimal(5,2) | YES  |     | NULL              |                             |
| dust_pm10      | decimal(5,2) | YES  |     | NULL              |                             |
| humidity       | decimal(5,2) | YES  |     | NULL              |                             |
| temperature    | decimal(4,2) | YES  |     | NULL              |                             |
| co2            | int(4)       | YES  |     | NULL              |                             |
| time           | timestamp    | no   |     | CURRENT_TIMESTAMP |                             |


### 2018.05.16
* Server - Arduino Connection (fan control)
* CSV download added
[indoor data download](http://ec2-13-209-19-156.ap-northeast-2.compute.amazonaws.com:3000/download?tab_name=indoor)
[outdoor data download](http://ec2-13-209-19-156.ap-northeast-2.compute.amazonaws.com:3000/download?tab_name=outdoor)

### 2018.05.17 ~ 06.01
* Server - graph visualization added
* Server - manual control functionality added
* Server - auto ventilation determination method added
* Arduino interval fix
* Arduino validation rule added



