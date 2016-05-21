function Carousel(elem, options){
	var self = this;
	self._ = carousel;
	self.defaults = {
		autoplay: true,//定义轮播图是否自动播放
		delay: 3000,//定义动画自动播放的间隔时间
		speed:750,//定义动画的速度
		//键盘操作上一页，下一页时的keycodes码
		keys:{
			prev: 37,
			next:39
		},
		nav: true,//是否可以按钮控制
		selectors:{
			container: 'ul',
			slides: 'li'
		},
		/*定义动画方式
		fade：淡入淡出
		line：从左向右匀速移动
		buffering：缓冲运动
		*/
		animation:'line',
		activeClass: self._ + 'active',//按钮类
		//滑动的阈值
		swipeThreshold:0.2


	}
	//初始化(因为他们是根据options改变的)
	self.options = {};
	self.parent = null;
	self.container = null;
	self.slides = null;
	self.nav = null;
	self.arrows = [];

	self.total = 0;
	self.current = 0;

	self.prefix = self._ + '-';
	self.eventSuffix = self.prefix + ~~(Math.random()*2e3);

	self.interval = null;
	self.init = function(options){
		self.options = Carousel.extend(self.defaults,options);
		self.container = elem.getElementsByTagName("ul")[0];
		self.container.className = self.prefix + "wrap";
		self.slides = self.container.getElementsByTagName("li");
		self.setup();//初始化容器

		["nav","arrows","keys",'infinite'].forEach(function(item,index,array){
			self.options[item] && self["init"+item]();
		})
		//自动播放
		self.options.autoplay && self.start();
		//一直无限循环
		self.calculateSlides();
		//self.container.trigger()
		
		return self.animate(self.options.index||self.current,'init');

	}


	self.setup = function(){
		elem.className += self.prefix + self.options.animation;
		//检查ul是否为相对或者绝对定位
		var position = document.defaultView.getComputedStyle(elem,null).position||elem.currentStyle.position;
		if(position === 'static') {
			elem.style.position = relative;
		}
		elem.style.overflow = "hidden";
	}

	self.calculateSlides = function(){
		self.slides = self.slides = self.container.getElementsByTagName("li");
		self.total = self.slides.length;
		//设置总宽
		if(self.options.animation !== 'fade'){
			var prop = 'width';
			if(self.option.animation === 'vertical'){
				prop = 'height';
			}
			self.container.style[prop] = (self.total *100) + '%';
			self.slides.style[prop] = (100/self.total) + '%';
		}
	}
	//初始化小按钮
	self.initNav = function(){
		var nav = document.createElement("nav");
		nav.className = self.prefix + 'nav';
		
		for (var i = 0; i < self.slides.length; i++) {
			var span = document.createElement('span');
			span.setAttribute("index",i+1);
			nav.appendChild(span);
		}
		nav.getElementsByTagName("span")[0].className = "on";
		elem.appendChild(nav);

		nav.onclick = function(e){
			//点击span元素时 出现相应的图片 并改变相应span的背景色
			var target = e.target;
			if ((target.tagName).toLowerCase()=="span") {
				var index = target.getAttribute("index");
				self.navStyle();
				self.animate(list,-600*index);
				}
		}
		
	}
	//初始化前后按钮
	self.initArrows = function(){
		
		var prevButton = document.createElement('a');
		prevButton.href = 'javascript:;';
		prevButton.setAttribute("class","arrow");
		prevButton.className = 'arrow prev';
		prevButton.innerHTML = "&lt;";
		elem.appendChild(prevButton);

		var nextButton = document.createElement('a');
		nextButton.href = 'javascript:;';
		nextButton.className = 'arrow next';
		nextButton.innerHTML = "&gt;";
		elem.appendChild(prevButton);

		prevButton.onclick = function(){
			animate(list,parseInt(list.style.left)+600);
			if (index==1) {
				index=5
			}else{
				index-=1;
			}
			
			showButton();
		}

		nextButton.onclick = function(){
			if(index==5){
				index=1
			}else{
				index+=1;
			}
			
			animate(list,parseInt(list.style.left)-600);
			showButton();
		}
	}
	
	self.navStyle = function(){

		for (var i = 0; i < buttons.length; i++) {
			if(buttons[i].className=="on"){
				buttons[i].className="";
				break;
			}
		}
		buttons[index-1].className='on';
		
	}
	self.animate = function(){
		var aniStyle = self.options.animation;
		var end = self.container.offsetLeft - parseInt(document.defaultView.getComputedStyle(elem).width||elem.currentStyle.width)
		
		var timer=null;
			clearInterval(timer);
			timer=setInterval(function(){
				//速度随着现有偏移量和目标偏移量的距离的改变而改变
				if(anistyle === 'line'){
					var speed = self.options.speed; 
				} else {
					var speed = (end - self.container.offsetLeft)/2
				}

				if ((speed > 0 && parseInt(self.container.style.left) < end)||(speed<0&&parseInt(ele.style.left)>end)){
					ele.style.left=ele.offsetLeft+speed+'px';
				}else{
					//当偏移量大于-600或小于-3000时的处理方式
					clearInterval(timer);
					ele.style.left = ele.offsetLeft + 'px';
                    if(parseInt(ele.style.left)>-600){
                        ele.style.left = "-3000px" ;
                    }
                    if(parseInt(ele.style.left)<-3000) {
                        ele.style.left = '-600px';
                    }
				}
			},50);
	}	
		//自动播放
	self.start = function(){
		self.interval = setTimeout(funciton(){
			self.next();
		},self.options.delay);
		return self;
	}

	self.stop = function(){
		clearTimeout(self.interval);
		return self;
	}

	



}
/*深拷贝与浅拷贝：
浅拷贝使拷贝的变量和源变量共用一个内存地址
深拷贝是将拷贝的变量新开辟一个内存地址*/
//将默认属性和用户定义的属性进行合并
Carousel.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;//如果第一个参数为布尔值 表示进行浅复制还是深复制

		// skip the boolean and the target
		target = arguments[ i ] || {};//选取除了布尔值以外的其他参数
		i++;
	}

	//如果参数不是对象或者函数 将target赋值为空对象
	if ( typeof target !== "object" && !typeof target !=="function" ) {
		target = {};
	}

	// （如果i值等于length 只有一个参数，且不是布尔值）
	if ( i === length ) {
		target = this;
		i--;
		console.log(this);
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( Carousel.isPlainObject(copy) || (copyIsArray = copy instanceof Array) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && src instanceof Array ? src : [];

					} else {
						clone = src && Carousel.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = Carousel.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

//检查一个对象，如果被检查的对象是对象字面量，或者new Object方法创建，则返回true
Carousel.isPlainObject = function( obj ){
	var key;

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || Object.prototype.toString.call(obj).slice(1,length-1).split(" ")[1] !== "object" || obj.nodeType || obj == obj.window ) {
			return false;
		}

		try {
			/*obj.constructor:obj对象是否存在constructor属性
			判断在obj实例中，是否含有constructor属性
			判断在obj.constructor对象的原型链中，是否含有isPrototyeof属性*/
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!({}).hasOwnProperty.call(obj, "constructor") &&
				!({}).hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}
			// Support: IE<9
		// 就是处理那些首先循环继承来的属性而不是自身属性
		/*if ( support.ownLast ) {
			for ( key in obj ) {
				return ({}).hasOwnProperty.call( obj, key );
			}
		}*/

		// 对于正常情况，首先循环的是自身属性
    // 如果最后一个属性还会自身属性的话，那么所有的属性都是自身属性
		for ( key in obj ) {}
			console.log("cheng");
		console.log(key);
		return key === undefined || hasOwnPrototype.call( obj, key );
}

//var carousel = new Carousel();
console.log(Carousel.combine(true,{name:"cheng"},{name:"li"}));
