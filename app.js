//jshint esversion:6


const express = require("express");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const _ = require("lodash");


const app = express();

mongoose.connect("mongodb+srv://admin-faizan:Test123@cluster0.ubiuxxt.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemSchema = new mongoose.Schema({

  name:String

});

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name:"welcome to your todo list"
});

 const item2 = new Item({
   name:"hit the + button to add a new item"
 });
  const item3 = new Item({
    name:"<-- Hit this to delete an item"
  });

  const defaultItems = [item1,item2,item3];

  const listSchema = {
    name:String,
    items:[itemSchema]
  };

  const List = mongoose.model("List",listSchema);


  





app.use(bodyParser.urlencoded({extented:true})); //its complusory for using body-parser
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.get("/",function(req,res){


  Item.find({},function(err,foundItems){

if(foundItems.length === 0){

     Item.insertMany(defaultItems,function(err){
    if(err){
      console.log(err);
    }else{

      console.log("data inserted");

    }

     });

res.redirect("/");
 }
 else{
  res.render("List",{listTitle: "Today",newListItems: foundItems});
 }
  
     
  });


 });





app.get("/:customListName",function(req,res){
 
const customListName = _.capitalize(req.params.customListName);
List.findOne({name:customListName},function(err,foundList){

  if(!err){

      if(!foundList){
              const list = new List({
                    name:customListName,
                    items:defaultItems
                   });
                    list.save();
                    res.redirect("/" + customListName);
      }else{
          res.render("list",{listTitle:customListName,newListItems:foundList.items});

      }
  } 

});
 });



// });


// home post rout


app.post("/",function(req,res){

const listName = req.body.button;
 const itemName = req.body.newItem;

 const item = new Item({
  name:itemName
 });

 if(listName === "Today"){
  item.save();

res.redirect("/");

 }else{

  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);


  });
 
}
});
 

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

 if(listName === "Today"){

  Item.deleteOne({_id:checkedItemId},(err)=>{
    if(err){
      console.log(err);
    }else{
      console.log("deleted item");
       res.redirect("/");
    }
  });

 }else{
   List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,results){
   res.redirect("/"+listName);
   });
  
 }



 
});




app.listen(3000,function(){
	console.log("server started on port :3000");
});
