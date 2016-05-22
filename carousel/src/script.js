(function(window,document){

	function Carousel( elem,options ){
		var self = this;
		self._ = carousel;
		self.defaults = {
			autoplay: true,//定义轮播图是否自动播放
			delay: 3000,//定义动画自动播放的间隔时间
			speed: "50%", //定义动画的速度
			arrows: {
				prevButton: true,
				nextButton: true

			},

			index:1,
			nav: {},//是否可以按钮控制
		
			/*定义动画方式
			line：从左向右匀速移动
			buffering：缓冲运动
			*/
			animation:'line',
			
		}
		self.options;

		
		return new Carousel.prototype.init(elem,options);

	}


	Carousel.prototype.self = this;


	Carousel.prototype.init = function(elem,options){
	
		
		//初始化(因为他们是根据options改变的)
		self.options = {};
		//self.parent = null;
		self.container = null;
		self.slides = null;
		self.nav = null;
		self.arrows = {};
		self.index = 1;
		self.total = 0;
		self.currentTotal = 0;
		self.animation = '';
		self.speed = 0;
		self.prefix = self._ + '-';
		//self.eventSuffix = self.prefix + ~~(Math.random()*2e3);

		self.interval = null;


		self.options = Carousel.extend(self.defaults,options);
		
		self.container = elem.getElementsByTagName("ul")[0];
		self.container.className = self.prefix + "wrap";
		self.slides = self.container.getElementsByTagName("li");
		console.log(self.slides.length);
		self.total = self.slides.length;
		Carousel.setup(elem);//初始化容器

		self.options.nav && Carousel.initNav(elem);
		self.options.arrows && Carousel.initArrows(elem);

		
		//一直无限循环
		Carousel.calculateSlides();
		//自动播放
		self.options.autoplay && Carousel.start();

		return this;
	}
	/*？？？？？？？？？？？？？？？？？？？？？？？、作用域问题？？？？？？*/

	Carousel.setup = function(elem){
		//self.className += self.prefix + self.options.animation;
		console.log(self.total);
		var lastNode = self.slides[self.total-1].cloneNode(true);
		var firstNode = self.slides[0].cloneNode(true);
		self.container.appendChild(firstNode);
		self.container.insertBefore(lastNode,self.slides[0]);
		//检查是否为相对或者绝对定位
		var position = document.defaultView.getComputedStyle(elem,null).position||elem.currentStyle.position;
		if(position === 'static') {
			elem.style.position = relative;
		}
		elem.style.overflow = "hidden";

	}

	Carousel.calculateSlides = function(){
		self.slides = self.container.getElementsByTagName("li");
		self.currentTotal = self.slides.length;
		self.container.style.width = (self.total *100) + '%';
		for(var k = 0; k < self.currentTotal; k++){
			self.slides[k].style.width = (100/self.total) + '%';
			console.log(self.slides[k].style.width);
		}

		self.container.style.left = "-100%";
		console.log(self.container.style.left);
		
	}
	//初始化小按钮
	Carousel.initNav = function(elem){
		self.nav = document.createElement("nav");
		self.nav.className = self.prefix + 'nav';
		
		for (var i = 0; i < self.total; i++) {
			var span = document.createElement('span');
			span.setAttribute("index",i+1);
			self.nav.appendChild(span);
		}
		self.nav.getElementsByTagName("span")[0].className = "on";
		elem.appendChild(nav);

		self.nav.onclick = function(e){
			//点击span元素时 出现相应的图片 并改变相应span的背景色
			var target = e.target;
			if ((target.tagName).toLowerCase()=="span") {
				self.index = target.getAttribute("index");
				Carousel.navStyle();

				console.log(100*parseInt(self.index));

				Carousel.animate(self.container, parseInt(100*parseInt(self.index))+"%");
				}
		}
		
	}
	//初始化前后按钮
	Carousel.initArrows = function(elem){
		
		self.arrows.prevButton = document.createElement('a');
		self.arrows.prevButton.href = 'javascript:;';
		self.arrows.prevButton.setAttribute("class","arrow");
		self.arrows.prevButton.className = 'arrow prev';
		self.arrows.prevButton.innerHTML = "&lt;";
		elem.appendChild(self.arrows.prevButton);

		self.arrows.nextButton = document.createElement('a');
		self.arrows.nextButton.href = 'javascript:;';
		self.arrows.nextButton.className = 'arrow next';
		self.arrows.nextButton.innerHTML = "&gt;";
		elem.appendChild(self.arrows.nextButton);

		self.arrows.prevButton.onclick = function(){
			
			if (index == 1) {
				index = self.total;
			}else{
				index-=1;
			}
			
			Carousel.navStyle();
			Carousel.animate(self.container,parseInt("-" + self.index)*100+"%");
		}

		self.arrows.nextButton.onclick = function(){
			if(self.index == self.total){
				self.index = 1
			}else{
				self.index+=1;
			}
			console.log(self.index);
			Carousel.animate(self.container,parseInt("-" + self.index) * 100+"%");
			Carousel.navStyle();
		}
	}
	
	Carousel.navStyle = function(){
	

		for (var i = 0; i < self.nav.getElementsByTagName("span").length; i++) {
			if(self.nav.getElementsByTagName("span")[i].className=="on"){
				self.nav.getElementsByTagName("span")[i].className="";
				break;
			}
		}
		self.nav.getElementsByTagName("span")[self.index-1].className='on';
		
	}

	Carousel.animate = function(elem, end){
		console.log("end"+ end);
		var aniStyle = self.options.animation;
		//var end = self.container.offsetLeft - parseInt(document.defaultView.getComputedStyle(elem).width||elem.currentStyle.width)
		
		var timer=null;
			clearInterval(timer);
			timer=setInterval(function(){
				//速度随着现有偏移量和目标偏移量的距离的改变而改变
				self.options.speed = ((parseFloat(end)-parseFloat(self.container.style.left))/1.1)+"%" ;
				console.log("speed"+self.options.speed);
					/*if(end < self.container.left){
						self.options.speed = "-"+self.options.speed;
					}
					*/
		
				console.log("left"+self.container.style.left);

				/*console.log(parseFloat(self.options.speed)<0);
				console.log(self.container.style.left < end);*/
		
				if ((parseFloat(self.options.speed)> 0 && parseFloat(self.container.style.left)< parseFloat(end))||(parseFloat(self.options.speed) < 0 && parseFloat(self.container.style.left) > parseFloat(end))){
					console.log("zheng");
					console.log("left");
					console.log(((parseFloat(end)-parseFloat(self.container.style.left))*parseFloat(self.options.speed))/100);
					self.container.style.left = (parseFloat(self.container.style.left)-((parseFloat(end)-parseFloat(self.container.style.left))*parseFloat(self.options.speed))/100)+"%" ;
					console.log("left"+self.container.style.left );
				}else{
					console.log("fu");
					//当偏移量大于-600或小于-3000时的处理方式
					clearInterval(timer);

					console.log(self.container.style.left);
					console.log(self.container.style.left >= "-100%");
					//console.log(parseFloat("-"+parseFloat(self.slides[0].width)));
					//self.container.style.left = self.container.offsetLeft ;
          if(parseFloat(self.container.style.left) >= parseFloat("-100%")){
          	console.log("ifififf");
              self.container.style.left = (-100) * self.total+"%";
              console.log(self.container.style.left);
          }
          if(parseFloat(self.container.style.left)<=parseFloat('-'+self.slides[0] * self.total)) {
          	console.log(self.container.style.left);
             self.container.style.left = -self.slides[0].width;
          }
				}
			},50);
	}	
		//自动播放
	Carousel.start = function(){
		time=setInterval(function(){
				self.arrows.nextButton.onclick();
			},self.options.delay);
		return this;
	}

	Carousel.stop = function(){
		clearTimeout(self.interval);
		return this;
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
	}

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

 	Carousel.prototype.init.prototype = Carousel.prototype;

  window.Carousel = Carousel;

})(window,document);


var carousel = Carousel(document.getElementById("banner"),{});