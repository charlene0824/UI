;(function($){
	console.log('aaa');
	var Dialog = function(config){
		console.log('bbb');
		var _this = this;
		//默认参数设置
		this.config = {
			//对话框的宽高
			width:'auto',
			height:'auto',
			//对话框的提示信息
			message:null,
			//对话框的类型
			type:'waiting',
			//按钮配置
			buttons:null,
			//弹出框延迟多久关闭
			delay:null,
			//对话框的遮罩透明度
			maskOpacity:null,
			//是否添加动画
			effect:null
		}
		//默认参数扩展
		if(config && $.isPlainObject(config)){
			$.extend(this.config,config);
		} else {
			this.isConfig = true;
		}
		//创建基本的DOM
		this.body = $('body');
		//创建遮罩层
		this.mask = $('<div class="cover-dialog"></div>');
		//创建弹出框
		this.win = $('<div class = "dialog-window"></div>');
		//创建弹出框头部
		
		this.winHeader = $('<div class = "dialog-header"></div>');
		//创建提示信息
		this.winContent = $('<div class = "dialog-content"></div>');
		//创建弹出框按钮组
		this.winFooter = $('<div class = "dialog-footer"></div>');
		// 渲染DOM
		this.create();
	}
	//记录弹框层级
	Dialog.zIndex = 10000;
	Dialog.prototype.create = function(){
		//创建弹出框
		var _this_ = this;
		var config = this.config;
		var mask = this.mask;
		var win = this.win;
		var header = this.winHeader;
		var content = this.winContent;
		var footer = this.winFooter;
		var body = this.body;
		//增加弹框层级
		Dialog.zIndex++;
		this.mask.css('zIndex',Dialog.zIndex);

		//如果没有传递任何配置参数 就弹出一个等待图标形式的弹框
		if(this.isConfig){
			win.append(header.addClass('waiting'));
			
			mask.append(win);
			body.append(mask);
		} else {
			//根据不同参数 创建相应的弹出框
			header.addClass(config.type);
			win.append(header);
			//如果传了信息文本
			if(config.message){
				content.html(config.message);
				win.append(content);
			}
			//按钮组
			if(config.buttons){
				win.append(footer);
				//----------------------------------
				
				this.createButtons(config.buttons,footer);
			
			}

			//插入到页面
			mask.append(win);
			body.append(mask);
			//设置对话框的宽高
			if(config.width != 'auto'){
				win.width(config.width); 
			}
			if(config.height != 'auto'){
				win.width(config.height);
			}
			//对话框遮罩透明度
			if(config.maskOpacity){
				mask.css('backgroundColor','rgba(0,0,0'+ config.maskOpacity + ')')
			}
			//设置弹出框弹出后多久关闭
			if(config.delay && config.delay !=0 ){
				
				window.setTimeout(function(){_this_.close();},config.delay);
			}
			if(config.effect){
				this.animation();
			}
		}

	}
	Dialog.prototype.close = function(){
		this.mask.remove();
	}
	//根据配置参数的buttons 创建按钮列表
	Dialog.prototype.createButtons = function(buttons,footer){
		console.log(buttons);
		var _this_ = this;
		$(buttons).each(function(i){
			console.log(this.type);
			var type = this.type?" class = '"+ this.type + "'":'';
			console.log(type);
			var btnText = this.text ? this.text : '按钮' + (++i);
			var callback = this.callback ? this.callback : null;
			var button = $('<button ' +type + '>' + btnText + '</button>');
			if(callback){
				button.tap(function(){
					//当callback的返回值为false时 表示不关闭弹出框
					var isClose = callback();
					if(isClose != false){
						_this_.close();
					}
				})
			}else {
				//当不绑定回调的时候 弹出框消失
				button.tap(function(){
					_this_.close()
				})
			}
			
			footer.append(button);
		})

	}
	Dialog.prototype.animation = function(){
		var _this_ = this;
		this.win.css('-webkit-transform','scale(0,0)');
		setTimeout(function(){
			_this_.win.css('-webkit-transform','scale(1,1)');
		},300);
		
	}
	window.Dialog = Dialog;
	$.dialog = function(config){
		return new Dialog(config);
	}

})(Zepto);