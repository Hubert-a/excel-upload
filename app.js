const express = require("express");

var app = express(); 
const body_parser = require('body-parser')
const multer = require("multer");
const xlstojson = require("xls-to-json-lc");
const xlsxtojson = require("xlsx-to-json-lc");

const xlsx = require('xlsx')


app.use(body_parser.json());  
app.set('view engine', 'ejs')


var storage = multer.diskStorage({ 
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});

var upload = multer({ 
                storage: storage,
                fileFilter : function(req, file, callback) { //file filter
                    if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                        return callback(new Error('Wrong extension type'));
                    }
                    callback(null, true);
                }
            }).single('file');

app.post('/upload', function(req, res) {
    var exceltojson;
    upload(req,res,function(err){
        if(err){
             res.json({error_code:1,err_desc:err});
             return;
        }
        if(!req.file){
            res.json({error_code:1,err_desc:"No file passed"});

            return;
        }
        
         
        if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        console.log(req.file.path);
        try {
            exceltojson({
                input: req.file.path,
                output: null, 
                lowerCaseHeaders:true
            }, function(err,result){
                if(err) {
                    return res.json({error_code:1,err_desc:err, data: null});
                    
                     
                } 
                // res.json({error_code:0,err_desc:null, data: result}); //this is where to send json object to view
                res.render('upload', {error_code:1, err_desc:null,  data:result})
            });
        } catch (e){
            res.json({error_code:1,err_desc:"Corupted excel file"});
        }
    })
   
});


app.get('/',function(req,res){
    res.render('index');
});

app.listen('3000', function(){
    console.log('running on 3000...');
});
