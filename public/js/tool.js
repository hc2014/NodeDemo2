
function bindSelect(options) {
    if (!options) throw new Error("bindSelect()参数不正确!");
    var _options = {
        url: options.url,//请求地址
        data: options.data,//AJAX参数
        sourceID: options.sourceID,//控件id
        value: options.value,//下拉框绑定到value值
        text: options.text,//绑定到文本
        isdefault: options.isdefault || false,//是否添加默认选项
    }
    
    $.ajax({
        type: 'GET',
        url: _options.url,
        data: _options.data,
        success: function (data) {
            var obj = eval(data);
            if (_options.isdefault === true) {
                $("<option value='请选择'>请选择</option>").appendTo($("#" + _options.sourceID));
            }
            $(obj).each(function (index) {

                var val = obj[index];
                $("<option value='" + val[_options.value] + "'>" + val[_options.text] + "</option>").appendTo($("#" + _options.sourceID));

            });

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest.status);
            console.log(XMLHttpRequest.readyState);
            console.log(textStatus);
        },
        dataType: 'JSON'

    });

}



// 对Date的扩展，将 Date 转化为指定格式的String 
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
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


//拖动改变大小  el2跟该原函数没有什么关系，后期为了动态移动 旋转图标 而添加的
function bindResize(el,el2)
        {
            //初始化参数
            var els = el.style,
            //鼠标的 X 和 Y 轴坐标
            x = y = 0;
            //邪恶的食指
            $(el).mousedown(function (e)
            {
                //按下元素后，计算当前鼠标与对象计算后的坐标
                x = e.clientX - el.offsetWidth,
                y = e.clientY - el.offsetHeight;
                //在支持 setCapture 做些东东
                el.setCapture ? (
                //捕捉焦点
                    el.setCapture(),
                //设置事件
                    el.onmousemove = function (ev)
                    {
                        mouseMove(ev || event);
                    },
                    el.onmouseup = mouseUp
                ) : (
                    //绑定事件
                    $(document).bind("mousemove", mouseMove).bind("mouseup", mouseUp)
                );
                //防止默认事件发生
                e.preventDefault();
            });
            //移动事件
            function mouseMove(e)
            {
                //宇宙超级无敌运算中...
                //els.width = e.clientX - x + 'px',//改变高度

                els.height = e.clientY - y + 'px';
                var top=$(el2).css("top")
                $(el2).css("top",parseInt(els.height)+parseInt(40)-parseInt(24))
               
                //$(el2).css("top",parseInt(top)-parseInt(y));
            }
            //停止事件
            function mouseUp()
            {
                //在支持 releaseCapture 做些东东
                el.releaseCapture ? (
                //释放焦点
                    el.releaseCapture(),
                //移除事件
                    el.onmousemove = el.onmouseup = null
                ) : (
                    //卸载事件
                    $(document).unbind("mousemove", mouseMove).unbind("mouseup", mouseUp)
                );
            }
        }







