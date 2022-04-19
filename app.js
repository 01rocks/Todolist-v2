//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const lodash = require("lodash");

const mongoose= require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-chandan:Test123@cluster0.lb9gw.mongodb.net/todolistDB?retryWrites=true&w=majority");


const itemSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("Item",itemSchema);


const khana = new Item({
  name:"Welcome to your todolist!"
});

const gana = new Item({
  name: "Hit the + button to add a new item"
});

const kaam = new Item({
  name:"<-- Hit this to delete an item"
});



const listSchema = new mongoose.Schema({
  name:String,
  items:[itemSchema]
});

const List = mongoose.model("List",listSchema);



const defaultItems=[khana,gana,kaam];



app.get("/", function(req, res) {




  Item.find(function (err,items){
    if(err){
      console.log("error found while finding the data from database");

    }
    else{


      if(items.length===0){

        Item.insertMany([khana,gana,kaam],function(err){
          if(err){
            console.log("error while inserting");
          }
          else{
            console.log("successfully saved");
          }
        });

res.redirect("/");

      }
      else{

        res.render("list", {listTitle: "Today", newListItems: items});


      }















    }
  })










});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
const listName = req.body.list;
  const a = new Item({
    name:itemName
  })

  if(listName==="Today")
  {


a.save();
res.redirect("/");

}
else{
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(a);
    foundList.save();
    res.redirect("/"+listName);
  });
  }




});

app.post("/delete",function(req,res){

  const checkedItemId= req.body.checkbox;
  const listName= req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log("error found while deleting the item from list");
      }
      else{
        console.log("successfully deleted");
      }
    });
    res.redirect("/");

  }
  else{
    console.log("delete karne ka ab try hoga");

List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,results){
  if(!err){
    console.log("deleted");
    res.redirect("/"+listName);

  }


}
)





  }


});



app.get("/:id", function(req,res){


const listName = lodash.capitalize(req.params.id);










List.findOne({name:listName},function(err,results){
  if(!err)
  {
    if(!results)
    {
      const list = new List({
        name:listName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+listName);


    }
    else{
        res.render("list", {listTitle: results.name, newListItems: results.items});
    }
  }

});


});

app.get("/about", function(req, res){
  res.render("about");
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port,function (){
  console.log("server has started");
});
