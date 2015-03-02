var express = require('express');

var app     = express();
var server  = require('http').createServer(app);
var bodyParser = require('body-parser');//处理cookie的模块
var ejs = require('ejs');
var fs=require('fs');
var SMB2 = require('smb2');
var mult=require('connect-multiparty');
var businessType = require('./routes/businesstype');
var async = require('async');

//设置模板为html
app.engine('.html', ejs.__express);
app.set('view engine','html');
app.set('views',__dirname+"/views");
app.set('view option',{layout:false});
app.use(express.static(__dirname+'/public'));
app.use(mult({ uploadDir: __dirname+'/temp' }));

app.use(bodyParser.json({limit:'20mb'}));
app.use(bodyParser.urlencoded({ extended: true,limit:'20mb'}));
//设置起始页面
app.get('/',function(req,res,next){
	res.render('sampleInput.html')
});

app.get('/views/sampleInput.html',function(req,res,next){
	if(req.query.type==="businessType"){
			businessType.test(req,res,next)
	}else if(req.query.type==="getKS"){
		businessType.getKS(req,res,next)
	}else if(req.query.type==="getDoctor"){
		businessType.getDoctor(req,res,next)
	}else if(req.query.type==="getBasicType"){
		businessType.getBasicType(req,res,next)
	}else if(req.query.type==="getBasicTypeInfo"){
		businessType.getBasicTypeInfo(req,res,next)
	}else if(req.query.type==="getSJDW"){
		businessType.getSJDW(req,res,next)
	}else if(req.query.type==="getTestName"){
		businessType.getTestName(req,res,next)
	}else if(req.query.type==="getCombonName"){
		businessType.getCombonName(req,res,next)
	}else if(req.query.type==="getComUseName"){
		businessType.getComUseName(req,res,next)
	}else if(req.query.type==="getTestGroupName"){
		businessType.getTestGroupName(req,res,next)
	}else if(req.query.type==="getSampleType"){
		businessType.getSampleType(req,res,next)
	}else if(req.query.type==="CheckBarCode"){
		businessType.CheckBarCode(req,res,next)
	}else if(req.query.type==="getSampleList"){
		businessType.getSampleList(req,res,next)
	}else if(req.query.type==="getSampleGroupList"){
		businessType.getSampleGroupList(req,res,next)
	}else if(req.query.type==="getOneSample"){
		businessType.getOneSample(req,res,next)
	}else if(req.query.type==="CheckSJDW"){
		businessType.CheckSJDW(req,res,next)
	}else if(req.query.type==="updateJSSJ"){
		businessType.updateJSSJ(req,res,next)
	}else if(req.query.type==="updateSJDW"){
		businessType.updateSJDW(req,res,next)
	}else if(req.query.type==="updateSampleGroup"){
		businessType.updateSampleGroup(req,res,next)
	}else if(req.query.type==="addTest"){
		console.log(req.query)
		businessType.addTest(req,res,next)
	}else if(req.query.type==="addCombonName"){
		businessType.addCombonName(req,res,next)
	}else if(req.query.type==="delTest"){
		businessType.delTuploadest(req,res,next)
	}else if(req.query.type==="delAllTest"){
		businessType.delAllTest(req,res,next)
	}else if(req.query.type==="delSampleList"){
		businessType.delSampleList(req,res,next)
	}else if(req.query.type==="copySample"){
		businessType.copySample(req,res,next)
	}else if(req.query.type==="bindImg"){
		businessType.bindImg(req,res,next)
	}else if(req.query.type==="getSampleImg"){
		businessType.getSampleImg(req,res,next)
	}else if(req.query.type==="checkSampleImg"){
		businessType.checkSampleImg(req,res,next)
	}else{
		console.log(req.url);
	}
});
//操作共享盘文件的代码例子
app.post('/views/test.html', function(req, res, next) {
	if (req.body.type == "close") {
		smb2Client.readdir('', function(err, files) {
			console.log(files);
			res.json("ok2222")
		});

	} else {
		smb2Client.readdir('', function(err, files) {
			console.log(files);
			res.json("ok1111")
		});
	}
})

app.post('/views/dosomething.html', function(req, res, next) {
	if (req.body.type == "saveImg") {
		var path = req.body.path.split('/');
		path.reverse();
		var filename = path[0].split('.')[0] //不含后缀名的文件名
		var suffixname = path[0].split('.')[1] //后缀名
		var newpath = __dirname + "/public/upload/" + filename + "." + suffixname; //源文件的路径
		var imgData = req.body.imgData;
		var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
		var new_path = __dirname + "/public/upload/" + filename + ".png"; //新文件的路径
		var returnpath = "/upload/" + filename + ".png"
		var dataBuffer = new Buffer(base64Data, 'base64');
		var i = fs.existsSync(newpath)
		if (i == true) {
			fs.unlinkSync(newpath, function(err) {
				if (err) {
					console.log(err)
				}
			})
		}

		fs.writeFile(new_path, dataBuffer, function(err) {
			if (err) {
				console.log(err)
				res.json(err);
			} else {
				res.json("{\"ok\":\"" + returnpath + "\"}")
			}
		});
	}
});

// var smb2Client = new SMB2({
// 	share: '\\\\192.168.0.111\\备份目录',
// 	domain: 'WORKGROUP',
// 	username: 'bbs',
// 	password: 'hzbbs'
// });
var smb2Client = new SMB2({
	share: '\\\\192.168.19.177\\test',
	domain: 'WORKGROUP',
	username: 'hc',
	password: '215324'
});
//\\192.168.0.111
app.get('/views/dosomething.html', function(req, res, next) {
	if (req.query.type == "movefile") {
		var arr = req.query.arr.split(',');
		async.each(arr, function(item, callback) {
			var tmp_path = __dirname + "/public/temp/" + item
			var new_path = __dirname + "/public/upload/" + item;

			var fullpath = req.query.fullpath;
			fullpath = fullpath == "" ? path : fullpath + "\\" + item
			console.log(fullpath)
			fs.rename(tmp_path, new_path, function(err) {
				if (err) {
					console.log(err)
				} else{
					smb2Client.unlink(fullpath, function(err) {
						if (err) throw err;
						console.log(fullpath+"已经被删除");
					});
				}
			})

		}, function(err) {
			 return res.json("{\"err\":\"" + err + "\"}")
		});
		return res.json("{\"ok\":\"ok\"}")
	} else if (req.query.type == "getCloudFile") {
		var path = req.query.path || ""
		if (req.query.fullpath != undefined) {

			var fullpath = req.query.fullpath;
			fullpath = fullpath == "" ? path : fullpath + "\\" + path

			smb2Client.readFile(fullpath, function(err, data) {
				if (err) {
					console.log(err)
				}
				fs.writeFile(__dirname + "/public/temp/" + path, data, function(err) {
					if (err) throw err;
					return res.json(path)
				});
			});
		} else {
			smb2Client.readdir(path, function(err, files) {
				var json = "";
				if(files){
					json += "{";
					json += '"total":1,';
					json += '"rows":';
					json += "[";
					for (var i in files) {
						//console.log(files[i])
						json += "{";
						json += "\"filename\":\"" + files[i] + "\""
						var arr = files[i].split('.')

						if (arr[arr.length - 1].toLocaleUpperCase() == "JPG" || arr[arr.length - 1].toLocaleUpperCase() == "PNG" || arr[arr.length - 1].toLocaleUpperCase() == "JEPG") {
							json += ",\"type\":\"文件\""
						} else {
							json += ",\"type\":\"文件夹\""
						}
						json += "},";
					}
					json = json.substr(0, json.length - 1)
					json += "]";
					json += "}";
				}else{
					json="no"	
				}			
				res.send(json);
			});
		}
	}
})
app.post('/views/upload.html',function(req,res,next){

	var obj = req.files.file;  
	var tmp_path = obj.path;  
	var new_path = __dirname+"/public/upload/"+obj.name;
	var i=fs.existsSync(new_path)
	if(i==true){
		return res.json("{\"exists\":\"" + obj.name + "\"}")
	}
	fs.rename(tmp_path,new_path,function(err){  
		if(err){  
			res.json("{\"err\":\"err\"}")
		}
		else{
			return res.json("{\"ok\":\"/upload/" + obj.name + "\"}")
		}
	}) 
});
server.listen(3000);
console.log("3000端口启动了!!")