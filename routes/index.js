var express = require('express');
var router = express.Router();

const mongodb=require('mongodb')
const ObjectId=mongodb.ObjectId;

const mongodb_user=require('../utils/mongodb')
const mongodb_goods=require('../utils/mongodb_goods')

//登录页面
router.post('/login', function(req, res, next) {
  const {username,password}=req.body;
  mongodb_user.find({username,password},function (data) {
    // console.log('find----data:',data)
    if(data.length>0){
      // 生成一个cookie(userid: user._id), 并交给浏览器保存
      res.cookie('userid', data[0]._id, {maxAge: 1000*60*60*24})
      res.send({code:0,msg:'登录成功'})
    }else{
      res.send({code:1,msg:'你没有登录权限'});
    }
  })

});
//商品分类
router.get('/shop_manger',(req,res)=>{
  mongodb_goods.find(null,data=>{
    res.send({code:0,data});//返回所有的数据
  })
}),
//商品分类
router.get('/shop_manger/goodsclassify',(req,res)=>{
  const page=Number(req.query.page);
  const limit=Number(req.query.limit);
  let start=(page-1)*limit;
 mongodb_goods.find(null,data=>{
   let shops=[];
   let obj={};
   let count=0;
   data.forEach(item=>{
     if(!obj[item.type]){
       shops.push({
         id:count++,
         type:item.type,
         data:[item],
       })
       obj[item.type]=item.type;
     }else{
       shops.forEach(shop=>{
         if(shop.type===item.type){
           shop.data.push(item);
           return;
         }
       })
     }
   });
   let totalLen=shops.length;
   shops=shops.slice(start,start+limit);
   let shopsMsg={
     totalLen,
     shops,
   }
   res.send(shopsMsg);
 })
}),
//商品分类
router.get('/shop_manger/goodslist',(req,res)=>{
  const {page,limit}=req.query;
  let start=Number((page-1)*limit);
  mongodb_goods.skip(start,limit*1,data=>{
    res.send({code:0,data});
  })
}),
//修改密码
router.post('/shop_manger/changepassword', function(req, res, next) {
  //传递过来旧密码和新密码
  const {oldPass,newPass}=req.body;
  //获取当前用户名的id
  const userid=req.cookies.userid;
  const where = {_id:ObjectId(userid)}
  mongodb_user.find(where,data=>{
    if(data[0].password===oldPass){
      mongodb_user.updateOne(where,{$set:{password:newPass}},function (data) {
        res.send({code:0,msg:"密码修改成功"})
      });
    }else{
      res.send({code:1,msg:"密码修改失败"})
    }
  })
});
//添加商品
router.post('/shop_manger/goodslist/addgoods',function (req,res) {
  const {type,gc_name,price,sale}=req.body;
  mongodb_goods.insert({type,gc_name,price,sale},data=>{
    // console.log('添加的商品',data.ops[0])
    if(data.result.ok===1){
      res.send({code:0,data:data.ops[0]});
    }
  })
})
//删除一条或者多条数据
router.post('/shop_manger/goodslist/deletegoods',function (req,res) {
  const objId=req.body;
  // console.log(objId)
  const count=objId.length-1;
  objId.forEach((item,index)=>{
    mongodb_goods.deleteOne({_id:ObjectId(item._id)},data=>{
      //console.log('删除成功————————',data)//如何标记删除多条成功
      if(data.result.ok===1&&index===count){
        res.send({code:0,msg:'删除数据成功'});
      }
    })
  })
})
//更新用户信息数据
router.post('/shop_manger/goodslist/modifieddata',function (req,res) {
  // const {username,nickname,sex,imgs,phone,email,remarks}=req.body;
  res.writeHead(200,{
    'Content-Type':'text/html;charset=utf-8',
    'Access-Control-Allow-Origin':'*'
  });
  const modifidata=req.body;
  const userid=req.cookies.userid;
  const objId={_id:ObjectId(userid)};
  const objUpdate={$set:modifidata}
  mongodb_user.updateOne(objId,objUpdate,data=>{
    if(data.result.ok===1){
      res.send({code:0,msg:'更新用户信息成功'});
    }else{
      res.send({code:1,msg:'更新用户信息失败'});
    }
  })
})
//删除同类商品
router.post('/shop_manger/goodsclassify/classifydelete',function (req,res) {
  const {type}=req.body;
  // console.log(type);
  mongodb_goods.remove({type},data=>{
    // console.log('删除数据：',data);
    if(data.result.ok===1){
      res.send({code:0,msg:'删除数据成功'})
    }
  })

})
//搜索同类型商品数据
router.post('/shop_manger/searchgoods',function (req,res) {
  const {keyword,classify}=req.body;
  let obj={
    type:classify,
    'gc_name':{
      $regex:keyword,
      $options:'m'
    }
  }
  mongodb_goods.find(obj,data=>{
    // console.log(data);
    if(data.length>0){
      res.send({code:0,data})
    }else{
      res.send({code:1,msg:'没有查询到任何数据'});
    }
  })
})
//编辑商品
router.post('/shop_manger/goodslist/editgoods/:id',function (req,res) {
  const id=req.params.id;
  const {type,gc_name,price,sale}=req.body;
   // console.log(id,type,gc_name,price,sale);
  let obj={$set:{
      type,
      gc_name,
      price,
      sale,
      edit:'primary'
      }
 }
  mongodb_goods.updateOne({_id:ObjectId(id)},obj,data=>{
  // console.log('updateOne',data);
  if(data.result.ok===1){
    mongodb_goods.find({_id:ObjectId(id)},data=>{
      // console.log('find:',data)
      if(data.length>0){
        res.send({code:0,data});
      }else{
        res.send({code:0,msg:'查找编辑商品失败'});
      }
    })
  }else{
  res.send({code:1,msg:'编辑商品失败'});
  }
  })
})
module.exports = router;
