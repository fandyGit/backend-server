const mongodb=require('./mongodb')
/*mongodb.insert({name:'lutao',password:321321},function (data) {
  console.log('插入数据成功')
  console.log(data);
});*/
/*mongodb.insertMany([
  {
    username:"沃尔玛（WAL-MART STORES)",
    password:123123
  },
  {
    username:"国家电网公司（STATE GRID)",
    password:123123
  },
  {
    username:"荷兰皇家壳牌石油公司（ROYAL DUTCH SHELL)",
    password:123123
  },
],function (data) {
  console.log('插入多条数据成功')
});*/

/*mongodb.deleteOne({name:'luhuan1'},function (data) {
  console.log(data);
});*/


/*mongodb.updateOne({name:'lutao'},{$set:{name:'luhuan'}},function (data) {
  console.log('更新数据成功');
});*/


mongodb.find(null,function (data) {
  console.log('查找的数据:',data);
});
