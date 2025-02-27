

# 1. MySQL 介绍

## 什么是数据库？

数据库（Database）是按照数据结构来组织、存储和管理数据的仓库。

每个数据库都有一个或多个不同的 API 用于创建，访问，管理，搜索和复制所保存的数据。

我们也可以将数据存储在文件中，但是在文件中读写数据速度相对较慢。

所以，现在我们使用关系型数据库管理系统（RDBMS）来存储和管理大数据量。所谓的关系型数据库，是建立在关系模型基础上的数据库，借助于集合代数等数学概念和方法来处理数据库中的数据。

RDBMS 即关系数据库管理系统(Relational Database Management System)的特点：

- 1.数据以表格的形式出现
- 2.每行为各种记录名称
- 3.每列为记录名称所对应的数据域
- 4.许多的行和列组成一张表单
- 5.若干的表单组成database

------

## RDBMS 术语



在我们开始学习MySQL 数据库前，让我们先了解下RDBMS的一些术语：

- **数据库:** 数据库是一些关联表的集合。
- **数据表:** 表是数据的矩阵。在一个数据库中的表看起来像一个简单的电子表格。
- **列:** 一列(数据元素) 包含了相同类型的数据, 例如邮政编码的数据。
- **行：**一行（元组，或记录）是一组相关的数据，例如一条用户订阅的数据。
- **冗余**：存储两倍数据，冗余降低了性能，但提高了数据的安全性。
- **主键**：主键是唯一的。一个数据表中只能包含一个主键。你可以使用主键来查询数据。
- **外键：**外键用于关联两个表。
- **复合键**：复合键（组合键）将多个列作为一个索引键，一般用于复合索引。
- **索引：**使用索引可快速访问数据库表中的特定信息。索引是对数据库表中一列或多列的值进行排序的一种结构。类似于书籍的目录。
- **参照完整性:** 参照的完整性要求关系中不允许引用不存在的实体。与实体完整性是关系模型必须满足的完整性约束条件，目的是保证数据的一致性。

MySQL 为关系型数据库(Relational Database Management System), 这种所谓的"关系型"可以理解为"表格"的概念, 一个关系型数据库由一个或数个表格组成, 如图所示的一个表格:

- 表头(header): 每一列的名称;
- 列(col): 具有相同数据类型的数据的集合;
- 行(row): 每一行用来描述某条记录的具体信息;
- 值(value): 行的具体信息, 每个值必须与该列的数据类型相同;
- **键(key)**: 键的值在当前列中具有唯一性。

## MySQL数据库

MySQL 是一个关系型数据库管理系统，由瑞典 MySQL AB 公司开发，目前属于 Oracle 公司。MySQL 是一种关联数据库管理系统，关联数据库将数据保存在不同的表中，而不是将所有数据放在一个大仓库内，这样就增加了速度并提高了灵活性。

- MySQL 是开源的，目前隶属于 Oracle 旗下产品。
- MySQL 支持大型的数据库。可以处理拥有上千万条记录的大型数据库。
- MySQL 使用标准的 SQL 数据语言形式。
- MySQL 可以运行于多个系统上，并且支持多种语言。这些编程语言包括 C、C++、Python、Java、Perl、PHP、Eiffel、Ruby 和 Tcl 等。
- MySQL 对 PHP 有很好的支持，PHP 是很适合用于 Web 程序开发。
- MySQL 支持大型数据库，支持 5000 万条记录的数据仓库，32 位系统表文件最大可支持 4GB，64 位系统支持最大的表文件为8TB。
- MySQL 是可以定制的，采用了 GPL 协议，你可以修改源码来开发自己的 MySQL 系统。



# 2. MySQL基础

## 2.1 MySQL的连接

```
[root@host]# mysql -u root -p
Enter password:******
```

在登录成功后会出现 mysql> 命令提示窗口，你可以在上面执行任何 SQL 语句。

以上命令执行后，登录成功输出结果如下:

```
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 2854760 to server version: 5.0.9

Type 'help;' or '\h' for help. Type '\c' to clear the buffer
```

## 2.2 数据的创建

以下命令简单的演示了创建数据库的过程，数据名为 RUNOOB:

```
[root@host]# mysql -u root -p   
Enter password:******  # 登录后进入终端

mysql> create DATABASE RUNOOB;
// 设置指定的字符集
CREATE DATABASE `tets` CHARACTER SET 'utf8mb3' COLLATE 'utf8_bin';
```

+ **注意**: 
  1. <mark>Mysql在连接后进入命令行时, 必须以 分号 `;`来结尾,否则会默认认为这条语句没有结束,从而不会执行</mark>
  2. SQL 语句不区分大小写,但最好以分号`;`来结尾(没有IDE的提示,很容易忘记)
  3. 数据库中,所有的库名,表名,字段名等,都必须为 `xxx_xxx`连接符形式,不能为驼峰形式

## 2.3 drop 命令删除数据库

drop 命令格式：

```
drop database <数据库名>;
```

## 2.4 MySQL 选择数据库

在你连接到 MySQL 数据库后，可能有多个可以操作的数据库，所以你需要选择你要操作的数据库。

从命令提示窗口中选择MySQL数据库

在 mysql> 提示窗口中可以很简单的选择特定的数据库。你可以使用SQL命令来选择指定的数据库。

实例以下实例选取了数据库 RUNOOB:

```
[root@host]# mysql -u root -p
Enter password:******
mysql> use RUNOOB;
Database changed
mysql>
```

执行以上命令后，你就已经成功选择了 RUNOOB 数据库，在后续的操作中都会在 RUNOOB 数据库中执行。

## database的总结:

1. database的创建: `CREATE DATABASE <DATABAS名称>`
2. database的查询:`SHOW DATABASES`
3. database的删除:`drop database <DATABASE名称>`
4. 使用database:  `use <DATABASE名称>`
5. 列出当前 use的databse下的 所有表:`SHOW TABLES;`

# 3. MySQL 数据类型

MySQL 中定义数据字段的类型对你数据库的优化是非常重要的。

MySQL 支持多种类型，大致可以分为三类：**数值、日期/时间和字符串(字符)类型**。

## 数值类型

MySQL 支持所有标准 SQL 数值数据类型。

这些类型包括严格数值数据类型(INTEGER、SMALLINT、DECIMAL 和 NUMERIC)，以及近似数值数据类型(FLOAT、REAL 和 DOUBLE PRECISION)。

关键字INT是INTEGER的同义词，关键字DEC是DECIMAL的同义词。

BIT数据类型保存位字段值，并且支持 MyISAM、MEMORY、InnoDB 和 BDB表。

作为 SQL 标准的扩展，MySQL 也支持整数类型 TINYINT、MEDIUMINT 和 BIGINT。下面的表显示了需要的每个整数类型的存储和范围。

| 类型         | 大小                                     | 范围（有符号）                                               | 范围（无符号）                                               | 用途            |
| :----------- | :--------------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :-------------- |
| TINYINT      | 1 Bytes                                  | (-128，127)                                                  | (0，255)                                                     | 小整数值        |
| SMALLINT     | 2 Bytes                                  | (-32 768，32 767)                                            | (0，65 535)                                                  | 大整数值        |
| MEDIUMINT    | 3 Bytes                                  | (-8 388 608，8 388 607)                                      | (0，16 777 215)                                              | 大整数值        |
| INT或INTEGER | 4 Bytes                                  | (-2 147 483 648，2 147 483 647)                              | (0，4 294 967 295)                                           | 大整数值        |
| BIGINT       | 8 Bytes                                  | (-9,223,372,036,854,775,808，9 223 372 036 854 775 807)      | (0，18 446 744 073 709 551 615)                              | 极大整数值      |
| FLOAT        | 4 Bytes                                  | (-3.402 823 466 E+38，-1.175 494 351 E-38)，0，(1.175 494 351 E-38，3.402 823 466 351 E+38) | 0，(1.175 494 351 E-38，3.402 823 466 E+38)                  | 单精度 浮点数值 |
| DOUBLE       | 8 Bytes                                  | (-1.797 693 134 862 315 7 E+308，-2.225 073 858 507 201 4 E-308)，0，(2.225 073 858 507 201 4 E-308，1.797 693 134 862 315 7 E+308) | 0，(2.225 073 858 507 201 4 E-308，1.797 693 134 862 315 7 E+308) | 双精度 浮点数值 |
| DECIMAL      | 对DECIMAL(M,D) ，如果M>D，为M+2否则为D+2 | 依赖于M和D的值                                               | 依赖于M和D的值                                               | 小数值          |

------

## 日期和时间类型

表示时间值的日期和时间类型为DATETIME、DATE、TIMESTAMP、TIME和YEAR。

每个时间类型有一个有效值范围和一个"零"值，当指定不合法的MySQL不能表示的值时使用"零"值。

TIMESTAMP类型有专有的自动更新特性，将在后面描述。

| 类型      | 大小 ( bytes) | 范围                                                         | 格式                | 用途                     |
| :-------- | :------------ | :----------------------------------------------------------- | :------------------ | :----------------------- |
| DATE      | 3             | 1000-01-01/9999-12-31                                        | YYYY-MM-DD          | 日期值                   |
| TIME      | 3             | '-838:59:59'/'838:59:59'                                     | HH:MM:SS            | 时间值或持续时间         |
| YEAR      | 1             | 1901/2155                                                    | YYYY                | 年份值                   |
| DATETIME  | 8             | '1000-01-01 00:00:00' 到 '9999-12-31 23:59:59'               | YYYY-MM-DD hh:mm:ss | 混合日期和时间值         |
| TIMESTAMP | 4             | '1970-01-01 00:00:01' UTC 到 '2038-01-19 03:14:07' UTC结束时间是第 **2147483647** 秒，北京时间 **2038-1-19 11:14:07**，格林尼治时间 2038年1月19日 凌晨 03:14:07 | YYYY-MM-DD hh:mm:ss | 混合日期和时间值，时间戳 |

------

## 字符串类型

字符串类型指CHAR、VARCHAR、BINARY、VARBINARY、BLOB、TEXT、ENUM和SET。该节描述了这些类型如何工作以及如何在查询中使用这些类型。

| 类型       | 大小                  | 用途                            |
| :--------- | :-------------------- | :------------------------------ |
| CHAR       | 0-255 bytes           | 定长字符串                      |
| VARCHAR    | 0-65535 bytes         | 变长字符串                      |
| TINYBLOB   | 0-255 bytes           | 不超过 255 个字符的二进制字符串 |
| TINYTEXT   | 0-255 bytes           | 短文本字符串                    |
| BLOB       | 0-65 535 bytes        | 二进制形式的长文本数据          |
| TEXT       | 0-65 535 bytes        | 长文本数据                      |
| MEDIUMBLOB | 0-16 777 215 bytes    | 二进制形式的中等长度文本数据    |
| MEDIUMTEXT | 0-16 777 215 bytes    | 中等长度文本数据                |
| LONGBLOB   | 0-4 294 967 295 bytes | 二进制形式的极大文本数据        |
| LONGTEXT   | 0-4 294 967 295 bytes | 极大文本数据                    |

**注意**：char(n) 和 varchar(n) 中括号中 n 代表字符的个数，并不代表字节个数，比如 CHAR(30) 就可以存储 30 个字符。

CHAR 和 VARCHAR 类型类似，但它们保存和检索的方式不同。它们的最大长度和是否尾部空格被保留等方面也不同。在存储或检索过程中不进行大小写转换。

BINARY 和 VARBINARY 类似于 CHAR 和 VARCHAR，不同的是它们包含二进制字符串而不要非二进制字符串。也就是说，它们包含字节字符串而不是字符字符串。这说明它们没有字符集，并且排序和比较基于列值字节的数值值。

BLOB 是一个二进制大对象，可以容纳可变数量的数据。有 4 种 BLOB 类型：TINYBLOB、BLOB、MEDIUMBLOB 和 LONGBLOB。它们区别在于可容纳存储范围不同。

有 4 种 TEXT 类型：TINYTEXT、TEXT、MEDIUMTEXT 和 LONGTEXT。对应的这 4 种 BLOB 类型，可存储的最大长度不同，可根据实际情况选择。



# 4. MySQL创建数据表

1. 创建数据表:`CREATE TABLE IF NOT EXISTS <表名不能为驼峰>`
2. 展示数据表: `desc <表名>`
3. 删除数据表:`DROP TABLE <表名>`

创建MySQL数据表需要以下信息：

- 表名
- 表字段名
- 定义每个表字段

### 语法

以下为创建MySQL数据表的SQL通用语法：

```sql
CREATE TABLE table_name (column_name column_type);
```

```sql
CREATE TABLE IF NOT EXISTS `runoob_tbl`(
   `runoob_id` INT UNSIGNED AUTO_INCREMENT,
   `runoob_title` VARCHAR(100) NOT NULL,
   `runoob_author` VARCHAR(40) NOT NULL,
   `submission_date` DATE,
   PRIMARY KEY ( `runoob_id` )
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

- 如果你不想字段为 **NULL** 可以设置字段的属性为 **NOT NULL**， 在操作数据库时如果输入该字段的数据为**NULL** ，就会报错。(是否必填)
- AUTO_INCREMENT定义列为自增的属性，一般用于主键，数值会自动加1。
- PRIMARY KEY关键字用于定义列为主键。 您可以使用多列来定义主键，列间以逗号分隔。
- ENGINE 设置存储引擎，CHARSET 设置编码。

## 通过命令提示符创建表

通过 mysql> 命令窗口可以很简单的创建MySQL数据表。你可以使用 SQL 语句 **CREATE TABLE** 来创建数据表。

### 实例

以下为创建数据表 runoob_tbl 实例:

```
root@host# mysql -u root -p
Enter password:*******
mysql> use RUNOOB;
Database changed
mysql> CREATE TABLE runoob_tbl(
   -> runoob_id INT NOT NULL AUTO_INCREMENT,
   -> runoob_title VARCHAR(100) NOT NULL,
   -> runoob_author VARCHAR(40) NOT NULL,
   -> submission_date DATE,
   -> PRIMARY KEY ( runoob_id )
   -> )ENGINE=InnoDB DEFAULT CHARSET=utf8;
Query OK, 0 rows affected (0.16 sec)
mysql>
```

**注意：**MySQL命令终止符为分号 **;** 。

**注意：** **->** 是换行符标识，不要复制。

## **总结**:

1. 创建数据表:`CREATE TABLE IF NOT EXISTS 表名且不能为驼峰`
2. 展示数据表结构: `desc 表名`
3. 删除数据表:`DROP TABLE 表名`
4. 重命名表名称: `RENAME TABLE 现有表名称 TO 新表名称;`
5. 给指定表添加字段: `ALTER TABLE 表名 ADD 字段名称 数据类型 [约束条件];`
6. 给表中字段重命名:`ALTER TABLE 表名 CHANGE 现有字段名 新字段名 [约束条件] ;`

# 5. 插入查询数据

## 1. MySQL 插入数据 `INSERT INTO`

MySQL 表中使用 **INSERT INTO** SQL语句来插入数据。

你可以通过 mysql> 命令提示窗口中向数据表中插入数据，或者通过PHP脚本来插入数据。

### 语法

以下为向MySQL数据表插入数据通用的 **INSERT INTO** SQL语法：

```sh
INSERT INTO table_name ( field1, field2,...fieldN )
                       VALUES
                       ( value1, value2,...valueN );
```

如果数据是字符型，必须使用单引号或者双引号，如："value"。

```sh
mysql> use testdatabase
    -> ;
Database changed
mysql> INSERT INTO student_table
    -> (student_name,student_age,student_date)
    -> VALUES
    -> ("李嗣业",23,NOW());
Query OK, 1 row affected (0.03 sec)

mysql> INSERT INTO student_table
    (student_name,student_age,student_date)
    VALUES
    ("宇文泰",18,"2023-03-16 23:44:55");
Query OK, 1 row affected (0.02 sec)
```

## 2. MySQL 查询数据 `SELECT`

MySQL 数据库使用SQL SELECT语句来查询数据。

你可以通过 mysql> 命令提示窗口中在数据库中查询数据，或者通过PHP脚本来查询数据。

### 语法

以下为在MySQL数据库中查询数据通用的 SELECT 语法：

```
SELECT column_name,column_name
FROM table_name
[WHERE Clause]
[LIMIT N][ OFFSET M]
```

- 查询语句中你可以使用一个或者多个表，表之间使用逗号(,)分割，并使用WHERE语句来设定查询条件。
- SELECT 命令可以读取一条或者多条记录。
- 你可以使用星号（*）来代替其他字段，SELECT语句会返回表的所有字段数据
- 你可以使用 WHERE 语句来包含任何条件。
- 你可以使用 LIMIT 属性来设定返回的记录数。
- 你可以通过OFFSET指定SELECT语句开始查询的数据偏移量。默认情况下偏移量为0。

## 总结:

1. 插入数据表

   ```shell
   INSERT INTO table_name ( field1, field2,...fieldN )
                          VALUES
                          ( value1, value2,...valueN );
   ```

   

2. 读取数据表 `select * from <table_name>`;

# 6. MySQL WHERE 子句

我们知道从 MySQL 表中使用 SQL SELECT 语句来读取数据。

如需有条件地从表中选取数据，可将 WHERE 子句添加到 SELECT 语句中。

### 语法

以下是 SQL SELECT 语句使用 WHERE 子句从数据表中读取数据的通用语法：

```sql
SELECT field1, field2,...fieldN FROM table_name1, table_name2...
[WHERE condition1 [AND [OR]] condition2.....
```

- 查询语句中你可以使用一个或者多个表，表之间使用逗号**,** 分割，并使用WHERE语句来设定查询条件。
- 你可以在 WHERE 子句中指定任何条件。
- 你可**以使用 AND 或者 OR 指定一个或多个条件**。
- WHERE 子句也可以运用于 SQL 的 DELETE 或者 UPDATE 命令。
- WHERE 子句类似于程序语言中的 if 条件，根据 MySQL 表中的字段值来读取指定的数据。

以下为**操作符列表，可用于 WHERE 子句中**。

下表中实例假定 A 为 10, B 为 20

| 操作符 | 描述                                                         | 实例                 |
| :----- | :----------------------------------------------------------- | :------------------- |
| =      | 等号，检测两个值是否相等，如果相等返回true                   | (A = B) 返回false。  |
| <>, != | 不等于，检测两个值是否相等，如果不相等返回true               | (A != B) 返回 true。 |
| >      | 大于号，检测左边的值是否大于右边的值, 如果左边的值大于右边的值返回true | (A > B) 返回false。  |
| <      | 小于号，检测左边的值是否小于右边的值, 如果左边的值小于右边的值返回true | (A < B) 返回 true。  |
| >=     | 大于等于号，检测左边的值是否大于或等于右边的值, 如果左边的值大于或等于右边的值返回true | (A >= B) 返回false。 |
| <=     | 小于等于号，检测左边的值是否小于或等于右边的值, 如果左边的值小于或等于右边的值返回true | (A <= B) 返回 true。 |

如果我们想在 MySQL 数据表中读取指定的数据，WHERE 子句是非常有用的。

使用主键来作为 WHERE 子句的条件查询是非常快速的。

如果给定的条件在表中没有任何匹配的记录，那么查询不会返回任何数据。



## 从命令提示符中读取数据

我们将在SQL SELECT语句使用WHERE子句来读取MySQL数据表 runoob_tbl 中的数据：

实例

`student_table`:

`select * from student_table;`

```sql
+------------+--------------+-------------+---------------------+
| student_id | student_name | student_age | student_date        |
+------------+--------------+-------------+---------------------+
|          1 | 李嗣业       |          23 | 2023-03-16 23:43:29 |
|          2 | 宇文泰       |          18 | 2023-03-16 23:44:55 |
|          3 | 宇文邕       |          33 | 1576-03-17 15:08:22 |
+------------+--------------+-------------+---------------------+
```



以下实例将读取 student_table 表中 student_age 字段值小于20 的所有记录：

```sql
select * from student_table where student_age<20;
```

输出结果:

```sql
+------------+--------------+-------------+---------------------+
| student_id | student_name | student_age | student_date        |
+------------+--------------+-------------+---------------------+
|          2 | 宇文泰       |          18 | 2023-03-16 23:44:55 |
+------------+--------------+-------------+---------------------+
1 row in set (0.03 sec)
```

MySQL 的 WHERE 子句的字符串比较是不区分大小写的。 你可以**使用 BINARY 关键字来设定 WHERE 子句的字符串比较是区分大小写的。**

如下实例:



## 总结:

1. where的基础语法: `SELECT field1, field2,...fieldN FROM table_name1, table_name2...[WHERE condition1 [AND [OR]] condition2...`
2. BINARY 使得where子句区分大小写;



# 7. UPDATE  | 更新

如果我们需要修改或更新 MySQL 中的数据，我们可以使用 SQL UPDATE 命令来操作。

### 语法

以下是 UPDATE 命令修改 MySQL 数据表数据的通用 SQL 语法：

```shell
UPDATE 表名 SET field1=new-value1, field2=new-value2
[WHERE Clause]
```

- 你可以同时更新一个或多个字段。
- 你可以在 WHERE 子句中指定任何条件。
- 你可以在一个单独表中同时更新数据。

当你需要更新数据表中指定行的数据时 WHERE 子句是非常有用的。

```shell
mysql> UPDATE HERO_TABLE SET dynasty="周",hero_age=50 where hero_id=2;
Query OK, 1 row affected (0.02 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> select * from hero_table;
+---------+-----------+----------+---------------------+---------+
| hero_id | hero_name | hero_age | birth_date          | dynasty |
+---------+-----------+----------+---------------------+---------+
|       1 | 李嗣业    |       23 | 2023-03-16 23:43:29 | NULL    |
|       2 | 宇文泰    |       50 | 2023-03-16 23:44:55 | 周      |
|       3 | 宇文邕    |       33 | 1576-03-17 15:08:22 | NULL    |
+---------+-----------+----------+---------------------+---------+
3 rows in set (0.10 sec)
```

## 总结:

1. UPDATE的基础用法: `UPDATE 表名 SET field1=new-value1, field2=new-value2[WHERE Clause]`

# 8. DELETE 语句

可以使用 SQL 的 DELETE FROM 命令来**删除** MySQL 数据表中的记录。

### 语法

以下是 SQL DELETE 语句从 MySQL 数据表中删除数据的通用语法：

```
DELETE FROM table_name [WHERE Clause]
```

- 如果没有指定 WHERE 子句，MySQL 表中的所有记录将被删除。
- 你可以在 WHERE 子句中指定任何条件
- 您可以在单个表中一次性删除记录。

当你想删除数据表中指定的记录时 WHERE 子句是非常有用的。

## 从命令行中删除数据

这里我们将在 SQL DELETE 命令中使用 WHERE 子句来删除 MySQL 数据表 `hero_table` 所选的数据。

### 实例

以下实例将删除`hero_table` 表中 hero_id 为4 的记录：

```sql
SELECT * FROM hero_table;

DELETE FROM hero_table WHERE hero_id=4;
```



# 9. LIKE 子句

我们知道在 MySQL 中使用 SQL SELECT 命令来读取数据， 同时我们可以在 SELECT 语句中使用 WHERE 子句来获取指定的记录。

WHERE 子句中可以使用等号 **=** 来设定获取数据的条件，如 "runoob_author = 'RUNOOB.COM'"。

但是有时候我们需要获取 runoob_author 字段含有 "COM" 字符的所有记录，这时我们就需要在 WHERE 子句中使用 SQL LIKE 子句。



**SQL LIKE 子句中使用百分号 %字符来表示任意字符，类似于UNIX或正则表达式中的星号 ***。

**如果没有使用百分号 %, LIKE 子句与等号 = 的效果是一样的。**

### 语法

以下是 SQL SELECT 语句使用 LIKE 子句从数据表中读取数据的通用语法：

```
SELECT field1, field2,...fieldN 
FROM table_name
WHERE field1 LIKE condition1 [AND [OR]] filed2 = 'somevalue'
```

- 你可以在 WHERE 子句中指定任何条件。
- 你可以在 WHERE 子句中使用LIKE子句。
- 你可以使用LIKE子句代替等号 **=**。
- LIKE 通常与 **%** 一同使用，类似于一个元字符的搜索。
- 你可以使用 AND 或者 OR 指定一个或多个条件。
- 你可以在 DELETE 或 UPDATE 命令中使用 WHERE...LIKE 子句来指定条件。

## 在命令提示符中使用 LIKE 子句

以下我们将在 SQL SELECT 命令中使用 WHERE...LIKE 子句来从MySQL数据表`hero_table` 中读取数据。

### 实例

以下是我们将 `hero_table` 表中获取`hero_name` 字段中以`宇文` 为姓氏的的所有记录：

```shell
mysql> SELECT * FROM hero_table WHERE hero_name LIKE "宇文%";
+---------+-----------+----------+---------------------+---------+
| hero_id | hero_name | hero_age | birth_date          | dynasty |
+---------+-----------+----------+---------------------+---------+
|       2 | 宇文泰    |       50 | 2023-03-16 23:44:55 | 周      |
|       3 | 宇文邕    |       33 | 1576-03-17 15:08:22 | NULL    |
+---------+-----------+----------+---------------------+---------+
2 rows in set (0.10 sec)
```



# 10. UNION 操作符

### 描述

MySQL UNION 操作符用于**连接两个以上的 SELECT 语句的结果组合到一个结果集合中。多个 SELECT 语句会删除重复的数据。**

### 语法

MySQL UNION 操作符语法格式：

```
SELECT expression1, expression2, ... expression_n
FROM tables
[WHERE conditions]
UNION [ALL | DISTINCT]
SELECT expression1, expression2, ... expression_n
FROM tables
[WHERE conditions];
```

### 参数

- **expression1, expression2, ... expression_n**: 要检索的列。
- **tables:** 要检索的数据表。
- **WHERE conditions:** 可选， 检索条件。
- **DISTINCT:** 可选，删除结果集中重复的数据。默认情况下 UNION 操作符已经删除了重复数据，所以 DISTINCT 修饰符对结果没啥影响。
- **ALL:** 可选，返回所有结果集，包含重复数据。

### 演示数据库

```bash
mysql> SELECT * FROM APPS;
+----+----------+-------------------------+---------+
| id | app_name | url                     | country |
+----+----------+-------------------------+---------+
|  1 | QQ APP   | http://im.qq.com/       | CN      |
|  2 | QQ APP   | http://im.qq.com/       | CN      |
|  3 | 微博 APP | http://weibo.com/       | CN      |
|  4 | 淘宝 APP | https://www.taobao.com/ | CN      |
|  5 | QQ APP   | http://im.qq.com/       | CN      |
|  6 | 微博 APP | http://weibo.com/       | CN      |
|  7 | 淘宝 APP | https://www.taobao.com/ | CN      |
+----+----------+-------------------------+---------+
7 rows in set (0.04 sec)
mysql> SELECT * FROM websites;
+----+---------------+---------------------------+-------+---------+
| id | site_name     | url                       | alexa | country |
+----+---------------+---------------------------+-------+---------+
|  1 | Google        | https://www.google.cm/    |     1 | USA     |
|  2 | 淘宝          | https://www.taobao.com/   |    13 | CN      |
|  3 | 菜鸟教程      | http://www.runoob.com/    |  4689 | CN      |
|  4 | 微博          | http://weibo.com/         |    20 | CN      |
|  5 | FaceBook      | https://www.facebook.com/ |     3 | USA     |
|  6 | StackOverflow | http://stackoverflow.com/ |     0 | IND     |
+----+---------------+---------------------------+-------+---------+
6 rows in set (0.09 sec)
```

### 1. SQL UNION 实例

下面的 SQL 语句从 "Websites" 和 "apps" 表中选取所有**不同的**country（只有不同的值）：

```bash
mysql> SELECT country FROM websites

UNION
# ALL | DISTINCT all 不去重,distinct 去重,默认为 distinct

SELECT country FROM apps

ORDER BY country;
+---------+
| country |
+---------+
| CN      |
| IND     |
| USA     |
+---------+
3 rows in set (0.12 sec)
```

**注释：**UNION 不能用于列出两个表中所有的country。如果一些网站和APP来自同一个国家，每个国家只会列出一次。UNION 只会选取不同的值。请使用 UNION ALL 来选取重复的值！

### 2. SQL UNION ALL 实例

下面的 SQL 语句使用 UNION ALL 从 "Websites" 和 "apps" 表中选取**所有的**country（也有重复的值）：

```bash
mysql> SELECT country FROM websites

UNION ALL
SELECT country FROM apps

ORDER BY country;
+---------+
| country |
+---------+
| CN      |
| CN      |
| CN      |
| CN      |
| CN      |
| CN      |
| CN      |
| CN      |
| CN      |
| CN      |
| IND     |
| USA     |
| USA     |
+---------+
13 rows in set (0.14 sec)
```

### 3. 带有 WHERE 的 SQL UNION ALL

下面的 SQL 语句使用 UNION ALL 从 "Websites" 和 "apps" 表中选取**所有的**中国(CN)的数据（也有重复的值）：

```bash
mysql> SELECT country,site_name FROM websites
WHERE country="CN"

UNION ALL

SELECT country,app_name FROM apps
WHERE country="CN"

ORDER BY country;
+---------+-----------+
| country | site_name |
+---------+-----------+
| CN      | 淘宝      |
| CN      | 菜鸟教程  |
| CN      | 微博      |
| CN      | QQ APP    |
| CN      | QQ APP    |
| CN      | 微博 APP  |
| CN      | 淘宝 APP  |
| CN      | QQ APP    |
| CN      | 微博 APP  |
| CN      | 淘宝 APP  |
+---------+-----------+
10 rows in set (0.11 sec)
```



# 11 MySQL 排序(`ORDER BY`)

