var OracleDB = require('../oracleDB.js').OracleDB;
var oracle = require('oracle');
var db = new OracleDB();
var Iconv = require('iconv-lite');
var async = require('async');
//录单 业务类型
exports.test = function (req, res, next) {
    db.connection.execute("select ORIGREC, DESCRIPTION, BUSTYPE from BUSINESSTYPE", [], function (err, results) {
        if (err) { console.log("Error executing query:", err); return; }

        var gbkBytes = Iconv.encode(JSON.stringify(results), 'UTF-8');

        //console.log(gbkBytes.toString());
        //res.render('index.html',{res:gbkBytes}); 
        res.json(gbkBytes.toString());
    });

}
//录单 获取科室 
exports.getKS = function (req, res, next) {
    db.connection.execute("select '' as Text, '' as Value from dual union all select  concat(lower(MEM),CLINICDEPT) as Text,CLINICDEPT as Value from CLINICDEPT",
     [], function (err, results) {
         if (err) { console.log("Error executing query:", err); return; }
         var gbkBytes = Iconv.encode(JSON.stringify(results), 'UTF-8');

         res.json(gbkBytes.toString());
     });
}

//录单 送检医生 
exports.getDoctor = function (req, res, next) {
    db.connection.execute("select SENDDOCTORS from RASCLIENTS where RASCLIENTID='吴江市第一人民医院'",
     [], function (err, results) {
         if (err) { console.log("Error executing query:", err); return; }
         var gbkBytes = Iconv.encode(JSON.stringify(results), 'UTF-8');

         var arrs = JSON.parse(gbkBytes.toString())[0].SENDDOCTORS.split(',');

         var result = "[";
         for (var i = 0; i < arrs.length; i++) {

             result += '{"VALUE":"' + arrs[i] + '","TEXT":"' + arrs[i] + '"},';
         }
         result = result.substr(0, result.length - 1);
         result += "]";
         res.json(result);
     });
}


//录单 获取基本类型
exports.getBasicType = function (req, res, next) {
    db.connection.execute("select  t.text from DA_DICT t WHERE T.CLASS='样本类型' AND T.SORT>-1 group by t.text",
     [], function (err, results) {
         if (err) { console.log("Error executing query:", err); return; }
         var gbkBytes = Iconv.encode(JSON.stringify(results), 'UTF-8');
         res.json(gbkBytes.toString());
     });
}

//常用测试
exports.getComUseName = function(req, res, next) {
    var sql = " select t.MNEMONICSYMBOL||'-'||t.TESTNO||'-'||spt.COMMENTS as TEXT,t.TESTCODE as VALUE "
    sql += " from RASCLIENT_TEST rt,TESTS t,SP_TESTS spt,SAMPLE_PROGRAMS sp "
    sql += " where rt.RasClientID ='" + req.query.text + "' and rt.TESTCODE = t.TESTCODE and t.TESTCODE=spt.TESTCODE and sp.SP_CODE=spt.SP_CODE and"
    sql += " spt.PROFILE='Default' and  spt.status='使用中' and sp.PROGNAME ='杭州迪安' order by rt.SORTER desc"
    db.connection.execute(sql, [], function(err, results) {
        if (err) {
            console.log("Error executing query:", err);
            return;
        }
        var gbkBytes = Iconv.encode(JSON.stringify(results), 'UTF-8');
        res.json(gbkBytes.toString());
    });
}


//获取客户套餐
exports.getCombonName = function (req, res, next) {
    var sql="select COMBONAME from RASCLIENTS_COMBO where RASCLIENTID='"+req.query.text+"'"
    db.connection.execute(sql, [], function (err, results) {
         if (err) { console.log("Error executing query:", err); return; }
         var gbkBytes = Iconv.encode(JSON.stringify(results), 'UTF-8');
         res.json(gbkBytes.toString());
     });
}
 
//签约套餐
 exports.getTestGroupName = function(req, res, next) {
     var sql = "select distinct dp.testgroupname,dp.testgroupid "
     sql += " from da_db_rasclientsgroup dp,da_db_testgroupprice de "
     sql += " where dp.testgroupid = de.testgroupid and rasclientid = '"+req.query.text+"'"
     db.connection.execute(sql, [], function(err, results) {
         if (err) {
             console.log("Error executing query:", err);
             return;
         }
         var gbkBytes = Iconv.encode(JSON.stringify(results), 'UTF-8');
         res.json(gbkBytes.toString());
     });
 }
 
//获取送检 单位
exports.getSJDW = function (req, res, next) {
    var query = req.query.q.replace(/(^\s*)|(\s*$)/g, "");
    var sql = "select RASCLIENTID , SHORTNAME,COMPNAME    from RASCLIENTS";
    sql += "  where RASCLIENTID not in ('ABLABS','**NEW**','Internal') and  DEPT = '杭州迪安'	";
    if (query != "") {
        sql += " and RASCLIENTID like'%" + query + "%' or SHORTNAME like '" + query + "%'";
    }
    sql+="  and rownum<="+req.query.max;
    db.connection.execute(sql,
     [], function (err, results) {
         if (err) { console.log("Error executing query:", err); return; }
         var gbkBytes = Iconv.encode(JSON.stringify(results), 'UTF-8');
         res.json(gbkBytes.toString());
     });
}

exports.getTestName = function(req, res, next) {
    var query = req.query.q.replace(/(^\s*)|(\s*$)/g, "");
    var sql = "select T.MNEMONICSYMBOL||' '||A.SP_TESTNO||' '||A.COMMENTS as TEXT,"
    sql += "to_char(A.TESTCODE) as VALUE from SP_TESTS A,SAMPLE_PROGRAMS B,TESTS T "
    sql += "where B.PROGNAME ='杭州迪安' and A.SP_CODE = B.SP_CODE and T.TESTCODE=A.TESTCODE and PROFILE = 'Default' "
    if (query != "") {
        sql += " and (T.MNEMONICSYMBOL like '" + query + "%' or A.SP_TESTNO like '%" + query + "%')"
    }
    sql += "UNION "
    sql += "select C.MNEMONICSYMBOL||' '||C.COMBOTESTNAME as TEXT, "
    sql += "'COMBOTESTS' as VALUE from COMBOTESTS  C "
    sql += "where C.DEPT='杭州迪安' "
    if (query != "") {
        sql += " and (C.MNEMONICSYMBOL like '" + query + "%' or C.COMBOTESTNAME like '%" + query + "%')"
    }
    sql += "order by TEXT";
    db.connection.execute(sql, [], function(err, results) {
        if (err) {
            console.log("Error executing query:", err);
            return;
        }
        var gbkBytes = Iconv.encode(JSON.stringify(results), 'UTF-8');
        res.json(gbkBytes.toString());
    });
}


//获取样本类型
exports.getSampleType = function (req, res, next) {
    var sql = "Select SAMPLE_TYPE from SAMPTYPES where SAMPLE_TYPE <> 'ADHOC' order by SAMPLE_TYPE";
    db.connection.execute(sql,
     [], function (err, results) {
         if (err) { console.log("Error executing query:", err); return; }
         var gbkBytes = Iconv.encode(JSON.stringify(results), 'UTF-8');
         res.send(gbkBytes.toString());
     });
}


exports.getOneSample = function(req, res, next) {

    var barcode = req.query.barcode;
    var sql = "select origrec,samplefrom,sampleto,bussinesstype,barcode,to_char(collectddate,'yyyy-mm-dd hh24:mi:ss') collectddate,";
    sql += "senddate,samplestatus,createdby,createddate,status,dept,sendtime from  patientinformation where  barcode='" + barcode + "'";

    db.connection.execute(sql, [], function(err, results) {
        if (err) {
            console.log("Error executing query:", err);
            return;
        }
        var gbkBytes = Iconv.encode(JSON.stringify(results), 'UTF-8');
        res.json(gbkBytes.toString());
    });
}

//获取样品列表
exports.getSampleList = function (req, res, next) {

var count="(select count(0) from PATIENTINFORMATION p left join USERS u on u.USRNAM = p.CREATEDBY ";
count+=" where p.ispathology='N' and p.CREATEDBY =:1 and p.STATUS =:2 and  p.DEPT =:3 ) as COUNT"
    db.connection.execute("select p.ORIGREC,p.BARCODE,p.STATUS,u.FULLNAME,p.CREATEDDATE,"+count
		  +" from PATIENTINFORMATION p left join USERS u on u.USRNAM = p.CREATEDBY " 
			+" where p.ispathology='N' and p.CREATEDBY =:1 and p.STATUS =:2 and  p.DEPT =:3 "
			+" order by u.FULLNAME ASC,p.ORIGREC ASC ",
     ['HUANGCHAO','新建','杭州迪安'], function (err, results) {
         if (err) { console.log("Error executing query:", err); return; }
         
         var json="";
         json+="{";
      	json+='"total":1,';
      	json+='"rows":';
      	json+="[";
      
       for(var i in results){
        	   json+="{";
        	   json+="\"ORIGREC\":\""+results[i].ORIGREC+"\",\"BARCODE\":\""+results[i].BARCODE+"\",\"FULLNAME\":\""+results[i].FULLNAME+"\",\"COUNT\":\""+results[i].COUNT+"\"";
        		json+="},";
        }
        json=json.substr (0,json.length-1)
         	json+="]";
         json+="}";
         res.send(json);
     });
}
 
			
//获取套餐列表
exports.getSampleGroupList = function (req, res, next) {
	var id=req.query.origrec;
	var sql="select ORIGREC, SAMPLETYPE, STRREPORTTIME, PATIENTORIGREC, SERVGRP, ";
	sql+=" TESTCODE, TESTNO,EQID,TESTCOMEFROM,CODE,RPAD(COMBOTESTNAME, 60, '…')||'【 '||SAMPLETYPE||' 】' COMBOTESTNAME,ISSPLITED,"
	sql+="DEPT,SPLITNO,TO_CHAR(CONTRACTPRICE,'FM9999999.0099') as CONTRACTPRICE,";
	sql+="TO_CHAR(FINALPRICE,'FM9999999.0099') as FINALPRICE ";
	sql+="from PATIENTTESTS where PATIENTORIGREC='"+id+"' order by ORIGREC desc"
    db.connection.execute(sql,
     [], function (err, results) {
         if (err) { console.log("Error executing query:", err); return; }
         var json="";
         json+="{";
      	json+='"total":1,';
      	json+='"rows":';
      	json+="[";
      
       for(var i in results){
        	 json+="{";
        	 json+="\"ORIGREC\":\""+results[i].ORIGREC+"\",\"SAMPLETYPE\":\""+results[i].SAMPLETYPE+"\",\"STRREPORTTIME\":\""+results[i].STRREPORTTIME+"\"";
        	 json+=",\"PATIENTORIGREC\":\""+results[i].PATIENTORIGREC+"\",\"SERVGRP\":\""+results[i].SERVGRP+"\",\"TESTCODE\":\""+results[i].TESTCODE+"\"";
        	 json+=",\"TESTNO\":\""+results[i].TESTNO+"\",\"EQID\":\""+results[i].EQID+"\",\"TESTCOMEFROM\":\""+results[i].TESTCOMEFROM+"\"";
        	 json+=",\"CODE\":\""+results[i].CODE+"\",\"COMBOTESTNAME\":\""+results[i].COMBOTESTNAME+"\",\"ISSPLITED\":\""+results[i].ISSPLITED+"\"";
        	 json+=",\"DEPT\":\""+results[i].DEPT+"\",\"SPLITNO\":\""+results[i].SPLITNO+"\",\"CONTRACTPRICE\":\""+results[i].CONTRACTPRICE+"\"";
        	  json+=",\"FINALPRICE\":\""+results[i].FINALPRICE+"\"";
        	 json+="},";
        }
        if(results.length>0){
            json=json.substr (0,json.length-1)
         }
         json+="]";
         json+="}";
         res.send(json);
     });
}

exports.getBasicTypeInfo = function (req, res, next) {

    db.connection.execute("select T.DESCRIPTION FROM DA_DICT T WHERE T.CLASS='样本类型' AND T.SORT>-1 and t.text='" + unescape(req.query.fiter) + "'",
     [], function (err, results) {
         if (err) { console.log("Error executing query:", err); return; }
         var gbkBytes = Iconv.encode(JSON.stringify(results), 'UTF-8');
         res.json(gbkBytes.toString());
     });
}

//检查送检单位
exports.CheckSJDW = function (req, res, next) {

    db.connection.execute("select count(0)  count from RASCLIENTS where RASCLIENTID='"+unescape(req.query.q)+"'",
     [], function (err, results) {
         if (err) { console.log("Error executing query:", err); return; }
         res.json(results[0].COUNT);
     });
}


//条码检查
exports.CheckBarCode = function (req, res, next) {

    var json = "";
    var code = req.query.barcode;
    async.waterfall([
            function (cb) {
                var sql="select distinct BARCODELENTH from CONFIGURATIONS"
                db.connection.execute(sql, [], function (err, results) {
                    if (err) { console.log("Error executing query:", sql); return; }
                    cb(null, results[0].BARCODELENTH);
                });
            },
        function (n, cb) {
            if (code.length < n) {
                res.json('长度不够');
            } else {
                var sql="select count(0) count  from patientinformation where barcode='" + code + "'"
                db.connection.execute(sql, [], function (err, results) {
                    if (err) { console.log("Error executing query:", sql); return; }
                    cb(null, results[0].COUNT);
                });
            }
        },
        function (n, cb) {
            if (n >= 1) {
                res.json("条码已存在!")
            } else {
            	var date=new Date();
                var sql="insert into patientinformation(sampleto,bussinesstype,barcode,collectddate,senddate,samplestatus,createdby,createddate,status,dept)"
                 +" values(:1,:2,:3,:4,:5,:6,:7,:8,:9,:10)"
                 db.connection.execute(sql,['杭州迪安','常规检测业务',code,new Date(),new Date(),'外观正常','HUANGCHAO',new Date(),'新建','杭州迪安'],
                  function (err, results) {
                    if (err) { console.log("Error executing query:", sql); 
                    return res.json("插入数据错误:"+err) }
                    		res.json(results.updateCount)
                });
            }
        }
    ], function (err, result) {
        console.log(err);
        console.log(result)
    });
}


//修改 sample到送检单位
exports.updateSJDW = function (req, res, next) {

var sjdw=req.query.sjdw;
var barcode=req.query.barcode;
var sql="update patientinformation set SAMPLEFROM='"+sjdw+"',COMPNAME='"+sjdw+"'";
			sql+="where barcode='"+barcode+"'";
    db.connection.execute(sql,
     [], function (err, results) {
         if (err) { console.log("Error executing query:", err); return; }
         res.json(results.updateCount);
     });
}


//修改sample 到接收时间
exports.updateJSSJ = function (req, res, next) {

var jssj=req.query.jssj;
var barcode=req.query.barcode;
var sql="update patientinformation set collectddate=to_date(to_char(collectddate,'yyyy-mm-dd')||' '||'"+jssj+"','yyyy-mm-dd hh24:mi:ss')";
			sql+="where barcode='"+barcode+"'";
    db.connection.execute(sql,
     [], function (err, results) {
         if (err) { console.log("Error executing query:", err); return; }
         res.json(results.updateCount);
     });
}


//修改sampletype
exports.updateSampleGroup = function (req, res, next) {

var origrec=req.query.ORIGREC;
var sampletype=req.query.SAMPLETYPE;
var sql="update PATIENTTESTS set sampletype='"+sampletype+"' where origrec="+origrec;
    db.connection.execute(sql,
     [], function (err, results) {
         if (err) { console.log("Error executing query:", err); return; }
         res.json(results.updateCount);
     });
}


//添加套餐
exports.addTest = function(req, res, next) {
    var code = req.query.code
    var text = req.query.text
    var origrec = req.query.origrec
    if (code == "COMBOTESTS") {
        async.waterfall([
            function(cb) {
                //查询插入项目的id集合
                var sql = "select CT.TESTCODE,C.COMBOTESTNAME from COMBOTESTS_TESTS CT,COMBOTESTS C "
                sql += "  where CT.COMBOTESTNAME=C.COMBOTESTNAME and CT.DEPT = '杭州迪安' and C.DEPT = CT.DEPT and "
                sql += "C.MNEMONICSYMBOL||' '||C.COMBOTESTNAME='" + text + "'"
                db.connection.execute(sql, [], function(err, results) {
                    if (err) {
                        console.log("Error executing query:", err);
                        return;
                    }
                    cb(null, results);
                });
            },
            function(n, cb) {
                var arrs = "";
                for (var i in n) {
                    arrs += n[i].TESTCODE + ",";
                }
                arrs = arrs.substr(0, arrs.length - 1)
                var parames = {};
                parames.arrs = arrs;
                db.connection.execute("SELECT samp_point_step FROM SPEC_SETS WHERE MATCODE = '杭州迪安'", [], function(err, results) {
                    if (err) {
                        console.log("Error executing query:", sql);
                        return res.json("{\"数据库错误:\"" + sql + "\"}");
                    }
                    parames.code = results[0].SAMP_POINT_STEP;
                    cb(null, parames);
                });
            },
            function(n, cb) {
                var code = n.code;
                var arrs = n.arrs;
                var sql = "SELECT COUNT(1) COUNT FROM SP_TESTS WHERE SP_CODE = '" + code + "' AND  STATUS = '停止使用'   AND TESTCODE IN(" + arrs + ")"
                db.connection.execute(sql, [], function(err, results) {
                    if (err) {
                        console.log("Error executing query:", err);
                        return;
                    }
                    if (results[0].COUNT >= 1) {
                        return res.json("{\"err\":\"组合或者套餐中包含停用项目，录入失败。\"}")
                    } else {
                        insertTest(res, arrs, "COMBOTESTS", origrec, text);
                        //return res.json("{\"ok\":\"ok\"}");
                    }
                });
            }
        ], function(err, result) {
            if (err) {
                console.log('addTest()错误')
                return res.json("{\"err\":\"" + err + "\"}")
            }
        });
    } else {
        insertTest(res, code, "SP_TESTS", origrec, text);
    }
}

//插入客户套餐
exports.addCombonName = function(req, res, next) {
    var comname = req.query.comname;
    var text = req.query.text;
    var origrec=req.query.origrec
    async.waterfall([
        function(cb) {
            var sql = "select RASCLIENTS_COMBOTESTS.TESTCODE from RASCLIENTS_COMBOTESTS,rasclients_combo   "
            sql += " where RASCLIENTS_COMBOTESTS.COMBOORIGREC=rasclients_combo.ORIGREC and RASCLIENTS_COMBO.COMBONAME = '" + comname + "' and "
            sql += "rasclients_combo.RASCLIENTID = '" + text + "'"
            db.connection.execute(sql, [], function(err, results) {
                if (err) {
                    console.log("Error executing query:", sql);
                    return;
                }
                cb(null, results)
            })
        },
        function(n, cb) {
            if(n.length>0){
                var codes="";res
                for(var i in n){
                    codes+=n[i].TESTCODE+","
                }
                codes=codes.substr(0,codes.length-1)
                insertTest(res,codes,'RASCLIENTS_COMBO',origrec,text)
            }else{
                 return res.json("{\"ok\":\"ok\"}");
            }
        }
    ], function(err, result){
       if(err){
         return res.json("{\"err\":\"" + err+ "\"}");
       }
    })
}

//插入数据的主键集合, 数据来源,条码主键,选择的项目(套餐)名称
function insertTest(res, codes, type, origrec,text) {
    var newCodes = codes;
    async.waterfall([
        function(cb) {
            var sql = " select testcode from patienttests where patientorigrec=" + origrec;
            db.connection.execute(sql, [], function(err, results) {
                if (err) {
                    console.log("Error executing query:", sql);
                    return res.json( "{\"数据库错误:\""+sql+"\"}");
                }
                for (var i in results) {
                    newCodes += "," + results[i].TESTCODE
                }
                cb(null, newCodes)
            });
        },
        function(n, cb) {
            HasRejectedTests(res, n, type, origrec, function(data) {
                if (data == "ok") {
                    cb(null, n); //这里的codes仅是添加项的id集合
                } else {
                    return res.json( "{\"err\":\"insertTest()错误!\"}");     
                }
            })
        },
        function(n, cb) {
            //查询样本下已经存在的套餐铸件集合
            var sql = "select TESTCODE from PATIENTTESTS where PATIENTORIGREC=" + origrec + " order by TESTCODE "
            db.connection.execute(sql, [], function(err, results) {
                if (err) {
                    console.log("Error executing query:", sql);
                    return res.json( "{\"数据库错误:\""+sql+"\"}");
                }
                var arrs = codes.split(',')
                for (var i in results) {
                    for (var j in arrs) {
                        if (results[i].TESTCODE == arrs[j]) {
                            console.log("插入重复项!你要添加的测试名称或代码是:" + text)
                            return res.json("{\"err\":\"插入重复项!你要添加的测试名称或代码是:" + text+ "\"}");
                        }
                    }
                }
                cb(null, arrs)
            });
        },
        function(n, cb) {
            //这里省略了一大堆的判断和sql查询， 直接插入数据
            //for (var i in n) {
                var sql=" select A.SERVGRP,A.TESTCODE,A.SP_TESTNO,A.SAMPLE_TYPE,"
                        sql+=" A.TESTGROUP,A.REPORTTIME,A.STANDARDCOSTS,A.DEPT,A.EQID"
                        sql+=" from SP_TESTS A,SAMPLE_PROGRAMS B where A.TESTCODE in ("+codes+") and "
                        sql+="B.PROGNAME = '杭州迪安' and A.SP_CODE = B.SP_CODE and B.PRODGROUP='DA' and A.PROFILE = 'Default'"
                db.connection.execute(sql, [], function(err, results) {
                    if (err) {
                        console.log("Error executing query:", sql);
                         return res.json( "{\"数据库错误:\""+sql+"\"}");
                    }
                    cb(null, results)
                });
            //}
        },
        function(n,cb){
            var date=new Date().Format('yyyy-MM-dd hh:mm:ss');
            for(var i in n){
                var sql=" insert into PatientTests (PATIENTORIGREC,SAMPLEFROM,SERVGRP,TESTCODE,TESTNO,SAMPLETYPE,TESTGROUP,STRREPORTTIME,STATUS,"
                    sql+=" CONTRACTPRICE,DEPT, EQID,TESTCOMEFROM,COMBOTESTNAME,FINALPRICE) values ("
                    sql+=origrec+",'杭州迪安员工体检','"+n[i].SERVGRP+"','"+n[i].TESTCODE+"','"+n[i].SP_TESTNO+"','"+n[i].SAMPLE_TYPE+"','"+n[i].TESTGROUP+"',"
                    sql+=   "'"+n[i].REPORTTIME+"','新建',0,'"+n[i].DEPT+"','"+n[i].EQID+"','"+type+"','"+text+"',"+0.00+")"
                db.connection.execute(sql, [], function(err, results) {
                        if (err) {
                            console.log("Error executing query:", sql);
                            return res.json("{\"err\":\"数据库错误:!"+sql+"\"}");
                        }
                });
            }
            cb(null, "")
        }
    ], function(err, results) {
        console.log(results)
       if(err){
         console.log("insertTest()错误")
         return res.json();"{\"err\":\""+er+"\"}"
       }
       return res.json("{\"ok\":\"ok!\"}");
    });
}

//对于停用 、病例冲突  、重复 、禁止录入项的数据检查
function HasRejectedTests(res,codes,type,origrec,callback) {
    async.series([
        function(cb) {
            //病理项
            var sql1 = "    select count(testcode)  count from sp_tests  where testcode in (" + codes + ")"
            sql1 += " and testcode<>'3000215' and testcode<>'3000488' AND TESTCODE<>1172 and testcode<>1175"
            sql1 += " and servgrp like '%病理%' and dept like '%迪安%' "
            db.connection.execute(sql1, [], function(err, results) {
                if (err) {
                    console.log("Error executing query:", sql1);
                    return res.json( "{\"数据库错误:\""+sql+"\"}");
                }
                cb(null, results[0].COUNT)
            });
        },
        function(cb) {
            //非病理项
            var sql2 = "    select count(testcode)  count from sp_tests  where testcode in (" + codes + ")"
            sql2 += " and testcode<>'3000215' and testcode<>'3000488' AND TESTCODE<>1172 and testcode<>1175"
            sql2 += " and not(servgrp like '%病理%' and dept like '%迪安%') "
            db.connection.execute(sql2, [], function(err, results) {
                if (err) {
                    console.log("Error executing query:", sql2);
                     return res.json( "{\"数据库错误:\""+sql+"\"}");
                }
                cb(null, results[0].COUNT)
            });
        },
        function(cb) {
            //检查 是否禁用
            var sql2 = "   select rj.prompt from lims_tests_reject rj,patientinformation pi where pi.origrec="+origrec
            sql2 += " and pi.samplefrom=rj.rasclientid and rj.testcode in  (" + codes + ")  and rownum<2 "
            db.connection.execute(sql2, [], function(err, results) {
                if (err) {
                    console.log("Error executing query:", sql2);
                     return res.json( "{\"数据库错误:\""+sql+"\"}");
                }
                cb(null, results.length)
            });
        },
        function(cb) {
            //检查 是否停止使用
            var sql2 = "  select count(spt.testcode) count from SP_TESTS spt, SAMPLE_PROGRAMS sp "
            sql2 += "where sp.SP_CODE=spt.SP_CODE and spt.PROFILE='Default' and spt.status='停止使用' "
            sql2 += " and sp.PROGNAME ='杭州迪安' and testcode in(" + codes + ")"
            db.connection.execute(sql2, [], function(err, results) {
                if (err) {
                    console.log("Error executing query:", sql2);
                    return res.json( "{\"数据库错误:\""+sql+"\"}");
                }
                cb(null, results[0].COUNT)
            });
        }
    ], function(err, results) {
        if(err){
            console.log("HasRejectedTests(错误)")
           return  res.json("{\"err\":\""+err+"\"}")
        }
        if(results[3]>0){
            console.log("套餐中存在已经停用的项目,请检查")
            return res.json("{\"err\":\"套餐中存在已经停用的项目,请检查!\"}");
         }
         if(results[0]>0&&results[1]>0){
             console.log("病理项目和常规项目不允许同时录入在一个条码下！,请检查")
             return res.json("{\"err\":\"病理项目和常规项目不允许同时录入在一个条码下！\"}");
         }
         if(results[2]>0){
             console.log("套餐中包含了禁止录入项目,请检查")
            return res.json("{\"err\":\"套餐中包含了禁止录入项目,请检查!！\"}");
        }else{
           //return res.send("{\"ok\":\"ok！\"}")
          callback("ok")
        }
    });
}


exports.delAllTest=function(req,res,next){
    var origrec=req.query.origrec;
    var sql="delete PATIENTTESTS where PATIENTORIGREC ="+origrec
    db.connection.execute(sql, [], function(err, results) {
        if (err) {
            console.log("Error executing query:", sql);
            return res.json("{\"数据库错误:\"" + sql + "\"}");
        }
        return res.json("{\"ok\":\"删除了:"+results.updateCount+"条数据\"}")
    });
}

//删除单个分组套餐
exports.delTest = function(req, res, next) {
    var origrec = req.query.origrec;
    async.waterfall([
        function(cb) {
            var sql = " select * from PATIENTTESTS where ORIGREC =" + origrec
            db.connection.execute(sql, [], function(err, results) {
                if (err) {
                    console.log("Error executing query:", sql);
                    return res.json("{\"数据库错误:\"" + sql + "\"}");
                }
                cb(null,results)
            });
        },
        function(n, cb) {
            //var sql = " select * from PATIENTTESTS where  PATIENTORIGREC="+n[0].PATIENTORIGREC+" and sampletype ='" + n[0].SAMPLETYPE
            //sql+="' and combotestname='"+n[0].COMBOTESTNAME+"'"
            var sql=" delete PATIENTTESTS where PATIENTORIGREC="+n[0].PATIENTORIGREC+" and sampletype ='" + n[0].SAMPLETYPE
                sql+="' and combotestname='"+n[0].COMBOTESTNAME+"'"
             db.connection.execute(sql, [], function(err, results) {
                if (err) {
                    console.log("Error executing query:", sql);
                    return res.json("{\"数据库错误:\"" + sql + "\"}");
                }
                cb(null,results)
            });
        }
    ], function(err, results) {
        if (err) {
            return res.json("{\"err\":\"" + err + "\"}")
        }
        return res.json("{\"ok\":\"删除了:"+results.updateCount+"条数据\"}")
    })
}


//删除样本列表
exports.delSampleList = function(req, res, next) {
    var ids = req.query.ids;
    async.waterfall([
        function(cb) {
            var sql = " select count(ORIGREC) count from PATIENTTESTS where PATIENTORIGREC in ("+ids+")"
            db.connection.execute(sql, [], function(err, results) {
                if (err) {
                    console.log("Error executing query:", sql);
                    return res.json("{\"数据库错误:\"" + sql + "\"}");
                }
                cb(null,results)
            });
        },
        function(n, cb) {
          var count=n[0].COUNT;
          if(count>0){
            var sql = " delete from PATIENTTESTS where PATIENTORIGREC in ("+ids+")"
            db.connection.execute(sql, [], function(err, results) {
                if (err) {
                    console.log("Error executing query:", sql);
                    return res.json("{\"数据库错误:\"" + sql + "\"}");
                }
            });
          }
          cb(null,null)
        },
        function(n,cb){
            var sql = " delete from PATIENTINFORMATION where ORIGREC in ("+ids+")"
            db.connection.execute(sql, [], function(err, results) {
                if (err) {
                    console.log("Error executing query:", sql);
                    return res.json("{\"数据库错误:\"" + sql + "\"}");
                }
                cb(null,results)
            });
        }
    ], function(err, results) {
        if (err) {
            return res.json("{\"err\":\"" + err + "\"}")
        }
       return res.json("{\"ok\":\"删除了:"+results.updateCount+"条数据\"}")
    })
}

exports.bindImg = function(req, res, next) {
    var barcode = req.query.barcode;
    var path = req.query.path;
    var date = new Date().Format('yyyy-MM-dd hh:mm:ss');
    var moveHeight = req.query.moveHeight
    async.waterfall([
        function(cb) {
            var sql="select count(0) count from sampleImg where barcode="+barcode
             db.connection.execute(sql, [], function(err, results) {
                if (err) {
                    console.log("Error executing query:", sql);
                    return res.json("{\"数据库错误:\"" + sql + "\"}");
                }
                cb(null,results[0].COUNT)
            });
        },
        function(n, cb) {
            var sql = ""
            if (n >= 1) {
                sql=" update sampleImg set imgpath='"+path+"',moveHeight="+moveHeight+",edittime=to_date('" + date + "','yyyy-mm-dd hh24:mi:ss')" 
                sql+=" where barcode="+barcode
            } else {
                sql = "insert into sampleImg values(null,'" + barcode + "','" + path + "'," + moveHeight + ",'HUANGCHAO',to_date('" + date + "','yyyy-mm-dd hh24:mi:ss'))";
            }
            db.connection.execute(sql, [], function(err, results) {
                if (err) {
                    console.log("Error executing query:", sql);
                    return res.json("{\"数据库错误:\"" + sql + "\"}");
                }
                cb(null,results)
            });
        }
    ], function(err, results) {
          if (err) {
            return res.json("{\"err\":\"" + err + "\"}")
        }
        return res.json("{\"ok\":\"ok!\"}");
    })
}

exports.getSampleImg = function(req, res, next) {
    var barcodes = req.query.barcodes;
    var sql = " select barcode,imgpath from sampleImg where barcode in(" + barcodes + ") order by barcode"
    db.connection.execute(sql, [], function(err, results) {
        if (err) {
            console.log("Error executing query:", sql);
            return res.json("{\"数据库错误:\"" + sql + "\"}");
        }
        res.json(results)
    });
}

//根据图片查找条码
exports.checkSampleImg = function(req, res, next) {
    var filesist = req.query.filesList;
    var sql = " select barcode from sampleImg where imgpath in(" + filesist + ") order by barcode"
    db.connection.execute(sql, [], function(err, results) {
        if (err) {
            console.log("Error executing query:", sql);
            return res.json("{\"数据库错误:\"" + sql + "\"}");
        }
        res.json(results)
    });
}


exports.copySample = function(req, res, next) {
    var begincode = req.query.beginCode;
    var count = req.query.count;
    var origrec = req.query.origrec
    console.log(req.query)
    async.waterfall([
        function(cb) {
            var ids = "";
            var arr = new Array([count]);
            var data = {};
            for (var i = 1; i <= count; i++) {
                arr[i - 1] = parseInt(begincode) + i;
                ids += "'" + (parseInt(begincode) + i) + "',";
            }
            ids = ids.substr(0, ids.length - 1)
            var sql = " select barcode from patientinformation pi where pi.barcode in(" + ids + ")"
            db.connection.execute(sql, [], function(err, results) {
                if (err) {
                    console.log("Error executing query:", sql);
                    return res.json("{\"数据库错误:\"" + sql + "\"}");
                }
                data.results = results;
                data.arr = arr;
                cb(null, data)
            });
        },
        function(n, cb) {
            var allCodes = n.arr; //所有需要复制的条目
            var ExCodes = new Array(); //已经存在的条码
            var codes = new Array() //可用的条码
            for (var i in n.results) {
                ExCodes[i] = n.results[i].BARCODE;
            }
            for (var i in allCodes) {
                var isok = false;
                for (var j in ExCodes) {
                    if (parseInt(ExCodes[j]) === allCodes[i]) {
                        isok = true;
                        break;
                    }
                }
                if (isok == false) {
                    codes.push(allCodes[i])
                }
            }
            for (var i in codes) {
                var sql = "insert into PATIENTINFORMATION A (A.BARCODE,A.SAMPLEFROM, A.SAMPLETO, A.BUSSINESSTYPE,A.COLLECTDDATE, A.SENDDATE,"
                sql += " A.SAMPLESTATUS,A.AGEUNIT,A.CLINICNAME, A.DOCTOR, "
                sql += "A.PATIENTCATEGORY, A.SAMPLENUM, A.DIAGNOSIS, A.REPORTMETHOD, A.COMMENTS, A.EXPRESS,"
                sql += " A.CREATEDBY, A.CREATEDDATE, A.RASCLIENTID, A.ISPATHOLOGY, A.DEPT,A.STATUS,"
                sql += "A.CONTRACTPRICE,A.FINALPRICE,A.COMPNAME) "
                sql += "select '" + codes[i] + "',B.SAMPLEFROM, B.SAMPLETO, B.BUSSINESSTYPE, B.COLLECTDDATE, B.SENDDATE,"
                sql += "B.SAMPLESTATUS, B.AGEUNIT,B.CLINICNAME, B.DOCTOR, "
                sql += "B.PATIENTCATEGORY, B.SAMPLENUM, B.DIAGNOSIS, B.REPORTMETHOD, B.COMMENTS, B.EXPRESS,"
                sql += "B.CREATEDBY, B.CREATEDDATE, B.RASCLIENTID, B.ISPATHOLOGY, B.DEPT,B.STATUS,"
                sql += "B.CONTRACTPRICE,B.FINALPRICE,B.COMPNAME"
                sql += " from PATIENTINFORMATION B "
                sql += " where B.ORIGREC ='" + origrec + "' "
                db.connection.execute(sql, [], function(err, results) {
                    if (err) {
                        console.log("Error executing query:", sql);
                        return res.json("{\"数据库错误:\"" + sql + "\"}");
                    }
                });
            }
             var data = {};
            data.allCodes = allCodes;
            data.codes = codes;
            data.ExCodes = ExCodes;
            cb(null, data);
        },
        function(n, cb) {
            var codes = n.codes;
            for (var i in codes) {
                var sql2 = "insert into PATIENTTESTS (REQUIREREPORTDATE, PATIENTORIGREC,    SERVGRP, TESTCODE, TESTNO, SPLITNO, SAMPLETYPE,"
                    sql2 += "EQID, EQ_NO, SHELFNO, SHELFSERIAL, WORKSHEETDONE, STATUS, ORDNO, PATHRESULT, SAMPLENO, SHAREEQID, NUM, DEPT,"
                    sql2 += "ISNEEDSPLIT, ISSPLITED, FORWARDSERVGRP, NEXTSERVGRP, PRINTED, FAXED, STRREPORTTIME, TUBENUM, PRICE, SAMPLEFROM,"
                    sql2 += "TESTCOMEFROM, CODE, TESTGROUP,COMBOTESTNAME,CONTRACTPRICE,FINALPRICE) "
                    sql2 += "select REQUIREREPORTDATE, (select  origrec from PATIENTINFORMATION where barcode='" + codes[i] + "'), SERVGRP, TESTCODE, TESTNO, SPLITNO, SAMPLETYPE, EQID, EQ_NO, SHELFNO,"
                    sql2 += "SHELFSERIAL, WORKSHEETDONE, STATUS, ORDNO, PATHRESULT, SAMPLENO, SHAREEQID, NUM, DEPT, ISNEEDSPLIT, ISSPLITED, "
                    sql2 += "FORWARDSERVGRP, NEXTSERVGRP, PRINTED, FAXED, STRREPORTTIME, TUBENUM, PRICE, SAMPLEFROM, TESTCOMEFROM, "
                    sql2 += " CODE, TESTGROUP,COMBOTESTNAME,CONTRACTPRICE,FINALPRICE"
                    sql2 += " from PATIENTTESTS where PATIENTORIGREC = '" + origrec + "'"
                db.connection.execute(sql2, [], function(err, results) {
                    if (err) {
                        console.log("Error executing query:", sql2);
                        return res.json("{\"数据库错误:\"" + sql + "\"}");
                    }
                });
        }
         cb(null, n.ExCodes);
    }
    ], function(err, results) {
        if (err) {
            return res.json("{\"err\":\"" + err + "\"}")
        }
        return res.json("{\"ok\":\"重复条码:"+results+"\"}")
    })
}


Date.prototype.Format = function(fmt) 
{ //author: meizz 
  var o = { 
    "M+" : this.getMonth()+1,                 //月份 
    "d+" : this.getDate(),                    //日 
    "h+" : this.getHours(),                   //小时 
    "m+" : this.getMinutes(),                 //分 
    "s+" : this.getSeconds(),                 //秒 
    "q+" : Math.floor((this.getMonth()+3)/3), //季度 
    "S"  : this.getMilliseconds()             //毫秒 
  }; 
  if(/(y+)/.test(fmt)) 
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
  for(var k in o) 
    if(new RegExp("("+ k +")").test(fmt)) 
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length))); 
  return fmt; 
}