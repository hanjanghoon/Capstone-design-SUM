## 2018 Capstone-design-SUM

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
