'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var fs = require('fs');
//var url = "mongodb://localhost:27017/learnyoumongo"
var assert = require('assert');
//var MongoClient = require('mongodb').MongoClient;



var app = express();
require('dotenv').load();
//require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);

//scheema
var urlSchema = mongoose.Schema({
    url: String,short_url:String
});

var urlModel= mongoose.model('urls', urlSchema);


//app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
//app.use('/public', express.static(process.cwd() + '/public'));
//app.use('/common', express.static(process.cwd() + '/app/common'));
/*
app.use(session({
	secret: 'secretClementine',
	resave: false,
	saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
*/
app.get('*', function(req, res){
    
    var sub_url = req.url.slice(1);
    console.log("GET for %s", sub_url)
    if ( sub_url=="favicon.ico")
        return;
    
    if (sub_url !="")
    {
        if ( check_url(sub_url) )
        {
              console.log("Make short url")
              make_short_url(sub_url,res);   // var action =  {error:false,redirect:false,data: result}
        }
        else
        {
            var diget_re = /\d+/
            if (diget_re.test(sub_url))
            {
                
                 urlModel.findOne({ 'short_url': sub_url }, { url: true}, function (err, result) {  //
                 //console.log("result: %s, url: %s", result,sub_url)  
                  if (err){ 
                     console.log("error in redirect!!! %s", err)  
                     res.writeHeader(200, {"Content-Type": "text/html"});  
                     res.end("Error with redirection. Come back later!");
                     return ;
                   }
                  else
                    {
                    if (result == null)  
                        {   console.log("write header for text this link does not exists")
                            res.writeHeader(200, {"Content-Type": "text/html"}); 
                            res.end("This link dosn`t exists!");  
                            return ; } 
                            else {
                                console.log("Redirecting to %s", result.url) 
                                res.writeHeader(302, {'Location': result.url}); 
                                console.log("Redirect done") 
                                res.end();
                                return } 
                        } //end of else
                 });
            return;         
            } //end of if  is this is a only digets
           res.end( '{"Success": False}' );   
           return
        }
        
    }
    else {
    fs.readFile('./index.html',"utf8", function (err, html) {
        if (err) {
            throw err; 
        }   
            res.writeHeader(200, {"Content-Type": "text/html"});  
            res.write(html);  
            res.end(); 
            return;
    });
    }
});

var check_url = function(url)
{
    var mask_http = new RegExp ("^(http)s??://(.+)");  // \..+$    //check for http:// or https://
    if 	(!mask_http.test(url))
        { return false; }
    else
     {
       var url_withouthttp = mask_http.exec(url)[2]  ;  
      }
      
    var check_for_dot = new RegExp ("(\\.).");  //check for dotes  
    if 	(!check_for_dot.test(url_withouthttp))
        { console.log("test dali ima dot:   ", check_for_dot.test(url_withouthttp),url_withouthttp)	;
            return false; }
    else
     {
       var check_for_secDots = new RegExp ("\\.{2,}");  //check for dotes 
       //console.log(check_for_secDots.test(url_withouthttp),url,url_withouthttp);
      if (!check_for_secDots.test(url_withouthttp) )
       {  return true;}
       else
       {return false;}
      }
     
    //console.log( mask_http.test(url),url,url_withouthttp)	;
    };


var make_short_url = function (sub_url,res)
{
    var mask_nohttp = new RegExp ("^(http)s??://(.+)");  // \..+$    //check for http:// or https://
    //var url_withouthttp = mask_nohttp.exec(sub_url)[2]  ;  
    
     urlModel.findOne({ 'url': sub_url }, { url: true, short_url: true}, function (err, result) {  //
     console.log("result: %s, url: %s", result,sub_url)  
      if (err){ 
         console.log("error!!! %s", err)  
         res.writeHeader(200, {"Content-Type": "text/html"});  
         res.end("Error with DB");
         return ;
       }
      else
        {
        if (result == null)  
            {var shortUrl = createShortUrl();
             // трябва да се генерира случайно число и да се проверява дали няма подобно в базата данни 
              urlModel.create({ url: sub_url ,short_url:shortUrl }, function (err, result) {
                if (err) {console.log("Error in save"); res.end("Error with DB");  return ; } //return {error:true};
                else {
                    console.log("Return after success in creating") 
                    res.writeHeader(200, {"Content-Type": "text/html"});  
                    res.end("{short_url: https:url-shortener-krasytod-1.c9users.io/"+ result.short_url+",original_url: "+result.url+"}");
                    return } //{error:false,redirect:false,data: result};
                })  
            }
        else
         {
          console.log("Return after the key is found  %s",result)    
          //res.writeHead(302, {'Location': result.url});
         // res.end();
          res.end("{short_url: "+ result.short_url+",original_url: "+result.url+"}");  //redirect?
          return  ;   //{error:false,redirect:true,data: result}
         }
        }
      console.log("tuk ne trqbva da stiga")    
      return ;  });
    return ;

};



var createShortUrl = function()
 {
 // use random to generate a number from 100 000 to 999999
 var min = 100000
 var max = 1000000 
 var random_num =  Math.floor (Math.random() * (max - min) + min);  // Returns a random number between min (inclusive) and max (exclusive)
 random_num =random_num.toString();

 //return the new number
return random_num;
       }


//routes(app, passport);





var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});