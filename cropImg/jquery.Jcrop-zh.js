/**
 * jquery.Jcrop.js v0.9.8
 * jQuery Image Cropping Plugin
 * @author Kelly Hallman <khallman@gmail.com>
 * Copyright (c) 2008-2009 Kelly Hallman - released under MIT License {{{
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:

 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.

 * }}}
 */

(function($) {

$.Jcrop = function(obj,opt)
{
	// Initialization {{{

	// Sanitize some options {{{
	var obj = obj, opt = opt;

	if (typeof(obj) !== 'object') obj = $(obj)[0];
	if (typeof(opt) !== 'object') opt = { };

	// Some on-the-fly fixes for MSIE...sigh
	if (!('trackDocument' in opt))
	{
		opt.trackDocument = $.browser.msie ? false : true;
		if ($.browser.msie && $.browser.version.split('.')[0] == '8')
			opt.trackDocument = true;
	}

	if (!('keySupport' in opt))
			opt.keySupport = $.browser.msie ? false : true;
		
	// }}}
	// Extend the default options {{{
	var defaults = {

		// Basic Settings
		trackDocument:		false,
		baseClass:			'jcrop',
		addClass:			null,//添加的样式

		// Styling Options
		bgColor:			'black',
		bgOpacity:			.6,
		borderOpacity:		.4,
		handleOpacity:		.5,

		handlePad:			5,
		handleSize:			9,//缩放按钮的大小
		handleOffset:		5,//缩放按钮的偏移量
		edgeMargin:			14,

		aspectRatio:		0,//选框宽高比 width/height
		keySupport:			true,
		cornerHandles:		true,
		sideHandles:		true,
		drawBorders:		true,
		dragEdges:			true,

		boxWidth:			0,//图片实际显示的宽度
		boxHeight:			0,//图片实际显示的高度

		boundary:			8, //可以从边界开始拖动鼠标选择裁剪区域
		animationDelay:		20,
		swingSpeed:			3,

		allowSelect:		true,
		allowMove:			true,
		allowResize:		true,

		minSelect:			[ 0, 0 ],
		maxSize:			[ 0, 0 ],
		minSize:			[ 0, 0 ],//选框最小尺寸 若小于该尺寸 选框不出现

		// Callbacks / Event Handlers
		onChange: function() { },
		onSelect: function() { }

	};
	var options = defaults;
	setOptions(opt);

	// }}}
	// Initialize some jQuery objects {{{

	var $origimg = $(obj);
	var $img = $origimg.clone().removeAttr('id').css({ position: 'absolute' });

	$img.width($origimg.width());
	$img.height($origimg.height());
	$origimg.after($img).hide();

	//改变图片的宽高
	presize($img,options.boxWidth,options.boxHeight);

	var boundx = $img.width(),
		boundy = $img.height(),

		//创建div 设置宽高 增加类 "jcrop-holder" 将其插入原图像的后面 并在div中添加克隆后的img
		$div = $('<div />')
			.width(boundx).height(boundy)
			.addClass(cssClass('holder'))
			.css({
				position: 'relative',
				backgroundColor: options.bgColor
			}).insertAfter($origimg).append($img);
	;

	
	if (options.addClass) $div.addClass(options.addClass);
	//$img.wrap($div);

	//创建img 设置为绝对定位  宽高同img
	var $img2 = $('<img />')/*{{{*/
			.attr('src',$img.attr('src'))
			.css('position','absolute')
			.width(boundx).height(boundy)
	;/*}}}*/

	//创建div 宽和高为100px; 并设置绝对定位 并将img2放入div中
	var $img_holder = $('<div />')/*{{{*/
		.width(pct(100)).height(pct(100))
		.css({
			zIndex: 310,
			position: 'absolute',
			overflow: 'hidden'
		})
		.append($img2)
	;/*}}}*/

	//创建div 将该div放入$img_holder定义的div前面
	var $hdl_holder = $('<div />')/*{{{*/
		.width(pct(100)).height(pct(100))
		.css('zIndex',320);
	/*}}}*/
	//创建div 将该div放在img标签的前面 里面包裹$img_holder,$hdl_holder
	var $sel = $('<div />')/*{{{*/
		.css({
			position: 'absolute',
			zIndex: 300
		})
		.insertBefore($img)
		.append($img_holder,$hdl_holder)
	;/*}}}*/

	/*html结构
	<img></img> $origimg
	<div class="jsrop-holder">  $div
		<div>   $sel
			<div> $img-holder
				<img></img> $img2
			</div>
			<div> $hdl-holder
			</div>
		</div>
		<img></img> $img
	</div>


	*/

	var bound = options.boundary;
	//newTracker创建了一个div 设置透明度为0  背景为白色 绝对定位 
	var $trk = newTracker().width(boundx+(bound*2)).height(boundy+(bound*2))
		.css({ position: 'absolute', top: px(-bound), left: px(-bound), zIndex: 290 })
		.mousedown(newSelection);	
	
	/* }}} */
	// Set more variables {{{
	// 

	var xlimit, ylimit, xmin, ymin;
	var xscale, yscale, enabled = true;
	//getPos返回offset值
	var docOffset = getPos($img),
		// Internal states
		btndown, lastcurs, dimmed, animating,
		shift_down;

	// }}}
		

		// }}}
	// Internal Modules {{{

	var Coords = function()/*{{{*/
	{
		//x1、y1为左上角的x、y坐标  x2、y2为右下角的x、y坐标
		var x1 = 0, y1 = 0, x2 = 0, y2 = 0, ox, oy;



		function setPressed(pos)/*{{{*/
		{
			var pos = rebound(pos);
			x2 = x1 = pos[0];
			y2 = y1 = pos[1];
		};
		/*}}}*/
		function setCurrent(pos)/*{{{*/
		{
			var pos = rebound(pos);
			ox = pos[0] - x2;
			oy = pos[1] - y2;
			x2 = pos[0];
			y2 = pos[1];
		};
		/*}}}*/
		function getOffset()/*{{{*/
		{
			return [ ox, oy ];
		};
		/*}}}*/

		function moveOffset(offset)/*{{{*/
		{
			var ox = offset[0], oy = offset[1];

			if (0 > x1 + ox) ox -= ox + x1;
			if (0 > y1 + oy) oy -= oy + y1;

			if (boundy < y2 + oy) oy += boundy - (y2 + oy);
			if (boundx < x2 + ox) ox += boundx - (x2 + ox);

			x1 += ox;
			x2 += ox;
			y1 += oy;
			y2 += oy;
		};
		/*}}}*/

		//返回相应角的坐标
		function getCorner(ord)/*{{{*/
		{
			var c = getFixed();
			switch(ord)
			{
				case 'ne': return [ c.x2, c.y ];
				case 'nw': return [ c.x, c.y ];
				case 'se': return [ c.x2, c.y2 ];
				case 'sw': return [ c.x, c.y2 ];
			}
		};
		/*}}}*/
		function getFixed()/*{{{*/
		{
			if (!options.aspectRatio) return getRect();
			// This function could use some optimization I think...
			var aspect = options.aspectRatio,
			//options.minSize选框最小尺寸
			//xscale=图片原来的宽度/图片现在的高度
				min_x = options.minSize[0]/xscale, 
				min_y = options.minSize[1]/yscale,
				max_x = options.maxSize[0]/xscale, 
				max_y = options.maxSize[1]/yscale,
				rw = x2 - x1, //选框宽度
				rh = y2 - y1, //选框高度
				rwa = Math.abs(rw),
				rha = Math.abs(rh),
				real_ratio = rwa / rha, //实际选框宽高比
				xx, yy
			;
			if (max_x == 0) { max_x = boundx * 10 }//如果没有设置 默认为图片宽度的十倍
			if (max_y == 0) { max_y = boundy * 10 }
			//选框宽高比小于图片原来宽高比 xx为根据原来的宽高比和高度计算出的宽度值(选区宽度+选区左上角的横坐标)
			if (real_ratio < aspect)
			{
				yy = y2;
				w = rha * aspect;
				xx = rw < 0 ? x1 - w : w + x1;

				if (xx < 0)
				{
					xx = 0;
					h = Math.abs((xx - x1) / aspect);
					yy = rh < 0 ? y1 - h: h + y1;
				}
				else if (xx > boundx)
				{
					xx = boundx;
					h = Math.abs((xx - x1) / aspect);
					yy = rh < 0 ? y1 - h : h + y1;
				}
			}
			else
			{//选框宽高比大于原来的宽高比 yy为根据原来宽高比计算的高度值
				xx = x2;
				h = rwa / aspect;
				yy = rh < 0 ? y1 - h : y1 + h;
				if (yy < 0)
				{
					yy = 0;
					w = Math.abs((yy - y1) * aspect);
					xx = rw < 0 ? x1 - w : w + x1;
				}
				else if (yy > boundy)
				{
					yy = boundy;
					w = Math.abs(yy - y1) * aspect;
					xx = rw < 0 ? x1 - w : w + x1;
				}
			}

			// Magic %-)
			// x2>x1情形
			if(xx > x1) { 
				/*若xx-选区左上角的坐标<最小宽度 令xx=选区左上角的坐标值+选区的最小宽度*/
			  if(xx - x1 < min_x) {
				xx = x1 + min_x;
			  } else if (xx - x1 > max_x) {
			  	/*若选区的宽度-选区左上角的坐标>最大宽度 令选区的宽度=选区左上角的坐标值+选区的最大宽度*/
				xx = x1 + max_x;
			  }
			  if(yy > y1) {
				yy = y1 + (xx - x1)/aspect;
			  } else {
				yy = y1 - (xx - x1)/aspect;
			  }
			} else if (xx < x1) { // left side

			  if(x1 - xx < min_x) {
				xx = x1 - min_x
			  } else if (x1 - xx > max_x) {
				xx = x1 - max_x;
			  }
			  if(yy > y1) {
				yy = y1 + (x1 - xx)/aspect;
			  } else {
				yy = y1 - (x1 - xx)/aspect;
			  }
			}

			if(xx < 0) {
				x1 -= xx;
				xx = 0;
			} else  if (xx > boundx) {
				x1 -= xx - boundx;
				xx = boundx;
			}

			if(yy < 0) {
				y1 -= yy;
				yy = 0;
			} else  if (yy > boundy) {
				y1 -= yy - boundy;
				yy = boundy;
			}

			return last = makeObj(flipCoords(x1,y1,xx,yy));
		};
		/*}}}*/

		//规范化p值
		function rebound(p)/*{{{*/
		{
			if (p[0] < 0) p[0] = 0;
			if (p[1] < 0) p[1] = 0;

			if (p[0] > boundx) p[0] = boundx;
			if (p[1] > boundy) p[1] = boundy;

			return [ p[0], p[1] ];
		};
		/*}}}*/
		//如果左上角坐标大于右下角坐标 将两坐标值互换
		function flipCoords(x1,y1,x2,y2)/*{{{*/
		{
			var xa = x1, xb = x2, ya = y1, yb = y2;
			if (x2 < x1)
			{
				xa = x2;
				xb = x1;
			}
			if (y2 < y1)
			{
				ya = y2;
				yb = y1;
			}
			return [ Math.round(xa), Math.round(ya), Math.round(xb), Math.round(yb) ];
		};
		/*}}}*/
		function getRect()/*{{{*/
		{
			var xsize = x2 - x1;
			var ysize = y2 - y1;

			if (xlimit && (Math.abs(xsize) > xlimit))
				x2 = (xsize > 0) ? (x1 + xlimit) : (x1 - xlimit);
			if (ylimit && (Math.abs(ysize) > ylimit))
				y2 = (ysize > 0) ? (y1 + ylimit) : (y1 - ylimit);

			if (ymin && (Math.abs(ysize) < ymin))
				y2 = (ysize > 0) ? (y1 + ymin) : (y1 - ymin);
			if (xmin && (Math.abs(xsize) < xmin))
				x2 = (xsize > 0) ? (x1 + xmin) : (x1 - xmin);

			if (x1 < 0) { x2 -= x1; x1 -= x1; }
			if (y1 < 0) { y2 -= y1; y1 -= y1; }
			if (x2 < 0) { x1 -= x2; x2 -= x2; }
			if (y2 < 0) { y1 -= y2; y2 -= y2; }
			if (x2 > boundx) { var delta = x2 - boundx; x1 -= delta; x2 -= delta; }
			if (y2 > boundy) { var delta = y2 - boundy; y1 -= delta; y2 -= delta; }
			if (x1 > boundx) { var delta = x1 - boundy; y2 -= delta; y1 -= delta; }
			if (y1 > boundy) { var delta = y1 - boundy; y2 -= delta; y1 -= delta; }

			return makeObj(flipCoords(x1,y1,x2,y2));
		};
		/*}}}*/
		//a为选择框的左上角坐标和右下角坐标
		function makeObj(a)/*{{{*/
		{
			return { x: a[0], y: a[1], x2: a[2], y2: a[3],
				w: a[2] - a[0], h: a[3] - a[1] };
		};
		/*}}}*/

		return {
			flipCoords: flipCoords,
			setPressed: setPressed,
			setCurrent: setCurrent,
			getOffset: getOffset,
			moveOffset: moveOffset,
			getCorner: getCorner,
			getFixed: getFixed
		};
	}();

	/*}}}*/
	//选择框
	var Selection = function()/*{{{*/
	{
		var start, end, dragmode, awake, hdep = 370;
		var borders = { };
		var handle = { };
		var seehandles = false;
		var hhs = options.handleOffset;

		/* Insert draggable elements {{{*/

		// Insert border divs for outline
		// 绘制边框 四个div构成
		if (options.drawBorders) {
			borders = {
					top: insertBorder('hline')
						.css('top',$.browser.msie?px(-1):px(0)),
					bottom: insertBorder('hline'),
					left: insertBorder('vline'),
					right: insertBorder('vline')
			};
		}

		// Insert handles on edges
		// 允许拖动边框
		if (options.dragEdges) {
			handle.t = insertDragbar('n');
			handle.b = insertDragbar('s');
			handle.r = insertDragbar('e');
			handle.l = insertDragbar('w');
		}

		// Insert side handles
		// 绘制边框的缩放控制按钮  上下左右的控制按钮
		options.sideHandles &&
			createHandles(['n','s','e','w']);

		// Insert corner handles
		// 绘制四个角的位置
		options.cornerHandles &&
			createHandles(['sw','nw','ne','se']);

		/*}}}*/
		// Private Methods
		// 插入边框 并将边框加入$img_holder后
		function insertBorder(type)/*{{{*/
		{
			var jq = $('<div />')
				.css({position: 'absolute', opacity: options.borderOpacity })
				.addClass(cssClass(type));
			$img_holder.append(jq);
			return jq;
		};
		/*}}}*/

		//创建拖放的div
		function dragDiv(ord,zi)/*{{{*/
		{
			/*cursor的属性值
			move:此光标指示某对象可被移动
			e-resize:此光标指示矩形框的边缘可被向右（东）移动
			ne-resize；此光标指示矩形框的边缘可被向上及向右移动（北/东）
			nw-resize	此光标指示矩形框的边缘可被向上及向左移动（北/西）。
			n-resize	此光标指示矩形框的边缘可被向上（北）移动*/
			var jq = $('<div />')
				.mousedown(createDragger(ord))
				.css({
					cursor: ord+'-resize',
					position: 'absolute',
					zIndex: zi 
				})
			;
			$hdl_holder.append(jq);
			return jq;
		};
		/*}}}*/
		//绘制拖放的按钮
		function insertHandle(ord)/*{{{*/
		{
			return dragDiv(ord,hdep++)
				.css({ top: px(-hhs+1), left: px(-hhs+1), opacity: options.handleOpacity })
				.addClass(cssClass('handle'));
		};
		/*}}}*/
		/*插入可拖动的边框*/
		function insertDragbar(ord)/*{{{*/
		{
			var s = options.handleSize,//按钮的尺寸
				o = hhs,//控制按钮偏移量
				h = s, w = s,
				t = o, l = o;

			switch(ord)
			{
				case 'n': case 's': w = pct(100); break;
				case 'e': case 'w': h = pct(100); break;
			}

			return dragDiv(ord,hdep++).width(w).height(h)
				.css({ top: px(-t+1), left: px(-l+1)});
		};
		/*}}}*/
		//['n','s','e','w']绘制拖放的按钮
		function createHandles(li)/*{{{*/
		{
			for(i in li) handle[li[i]] = insertHandle(li[i]);
		};
		/*}}}*/

		// ？？？？？？？？？？？？？？？？？？？？？？？看到这里
		// 
		// 控制handle的位置变化
		function moveHandles(c)/*{{{*/
		{
			//hhs:控制按钮的偏移量
			var midvert  = Math.round((c.h / 2) - hhs),
				midhoriz = Math.round((c.w / 2) - hhs),
				north = west = -hhs+1,
				east = c.w - hhs,//东侧控制按钮的位置
				south = c.h - hhs,//南侧控制按钮的位置
				x, y;


			'e' in handle &&
				handle.e.css({ top: px(midvert), left: px(east) }) &&
				handle.w.css({ top: px(midvert) }) &&
				handle.s.css({ top: px(south), left: px(midhoriz) }) &&
				handle.n.css({ left: px(midhoriz) });

			'ne' in handle &&
				handle.ne.css({ left: px(east) }) &&
				handle.se.css({ top: px(south), left: px(east) }) &&
				handle.sw.css({ top: px(south) });

			'b' in handle &&
				handle.b.css({ top: px(south) }) &&
				handle.r.css({ left: px(east) });
		};
		/*}}}*/
		//x y为左上角坐标
		function moveto(x,y)/*{{{*/
		{
			$img2.css({ top: px(-y), left: px(-x) });
			$sel.css({ top: px(y), left: px(x) });
		};
		/*}}}*/

		//重置选框的宽度和高度
		function resize(w,h)/*{{{*/
		{
			$sel.width(w).height(h);
		};
		/*}}}*/

		function refresh()/*{{{*/
		{
			var c = Coords.getFixed();
			//重置选区 宽高为0
			Coords.setPressed([c.x,c.y]);
			//设置当前选区
			Coords.setCurrent([c.x2,c.y2]);

			updateVisible();
		};
		/*}}}*/

		// Internal Methods
		// 当选择框存在时 awake设为true
		function updateVisible()/*{{{*/
			{ if (awake) return update(); };
		/*}}}*/
		//更新选框 并触发选框改变时的事件
		function update()/*{{{*/
		{
			var c = Coords.getFixed();

			resize(c.w,c.h);
			moveto(c.x,c.y);

			options.drawBorders &&
				borders['right'].css({ left: px(c.w-1) }) &&
					borders['bottom'].css({ top: px(c.h-1) });

			seehandles && moveHandles(c);
			awake || show();
			//选框改变时的事件
			options.onChange(unscale(c));
		};
		/*}}}*/
		//显示选框 img增加透明度样式 
		function show()/*{{{*/
		{
			$sel.show();
			$img.css('opacity',options.bgOpacity);
			awake = true;
		};
		/*}}}*/

		//删除选择框 删除控制按钮 将div隐藏 img透明度重新设为1 
		function release()/*{{{*/
		{
			disableHandles();
			$sel.hide();
			$img.css('opacity',1);
			awake = false;
		};
		/*}}}*/
		//显示控制按钮
		function showHandles()//{{{
		{
			if (seehandles)
			{
				moveHandles(Coords.getFixed());
				$hdl_holder.show();
			}
		};
		//}}}
		/**
		 * 初始化handle
		 * @return {[type]} [description]
		 */
		function enableHandles()/*{{{*/
		{ 
			seehandles = true;
			//允许选框缩放
			if (options.allowResize)
			{
				moveHandles(Coords.getFixed());
				$hdl_holder.show();
				return true;
			}
		};
		/*}}}*/
		/**
		 * 当拖动选框时 handles不可见
		 * @return {[type]} [description]
		 */
		function disableHandles()/*{{{*/
		{
			seehandles = false;
			$hdl_holder.hide();
		};
		/*}}}*/
		/**
		 * 确定handle的状态
		 * @param  {boolean} v 是否存在handle
		 * @return {[type]}   [description]
		 */
		function animMode(v)/*{{{*/
		{
			(animating = v) ? disableHandles(): enableHandles();
		};
		/*}}}*/
		/**
		 * 当选择框选择完成后 添加handle 
		 * @return {Function} handle的样式
		 */
		function done()/*{{{*/
		{
			animMode(false);
			refresh();
		};
		/*}}}*/

		//剪切部分
		var $track = newTracker().mousedown(createDragger('move'))
				.css({ cursor: 'move', position: 'absolute', zIndex: 360 })
		//将该部分加入到$img_holder中
		$img_holder.append($track);
		disableHandles();

		return {
			updateVisible: updateVisible,
			update: update,
			release: release,
			refresh: refresh,
			setCursor: function (cursor) { $track.css('cursor',cursor); },
			enableHandles: enableHandles,
			enableOnly: function() { seehandles = true; },
			showHandles: showHandles,
			disableHandles: disableHandles,
			animMode: animMode,
			done: done
		};
	}();
	/*}}}*/
	//
	var Tracker = function()/*{{{*/
	{
		var onMove		= function() { },
			onDone		= function() { },
			trackDoc	= options.trackDocument;//拖动选框时，允许超出图像以外的地方时继续拖动

		if (!trackDoc)
		{
			$trk
				.mousemove(trackMove)
				.mouseup(trackUp)
				.mouseout(trackUp)
			;
		}
		//当调整选框高度时 $trk的z-index增加到450 
		function toFront()/*{{{*/
		{
			$trk.css({zIndex:450});
			if (trackDoc)
			{
				//当选框宽高可以超过图片的宽高时 对document添加mousemove和mouseup事件
				$(document)
					.mousemove(trackMove)
					.mouseup(trackUp)
				;
			}
		}
		/*}}}*/
		//删除绑定的事件
		function toBack()/*{{{*/
		{
			$trk.css({zIndex:290});
			if (trackDoc)
			{
				$(document)
					.unbind('mousemove',trackMove)
					.unbind('mouseup',trackUp)
				;
			}
		}
		/*}}}*/
		function trackMove(e)/*{{{*/
		{
			onMove(mouseAbs(e));
		};
		/*}}}*/
		//当放开鼠标按键时触发的操作
		function trackUp(e)/*{{{*/
		{
			e.preventDefault();
			e.stopPropagation();

			if (btndown)
			{
				btndown = false;

				onDone(mouseAbs(e));
				options.onSelect(unscale(Coords.getFixed()));
				toBack();
				onMove = function() { };
				onDone = function() { };
			}

			return false;
		};
		/*}}}*/
		//拖动控制按钮时的操作 添加事件 
		/**
		 * 拖动控制按钮时触发的操作 添加移动事件 和完成事件 
		 * @param  {function}   move 控制按钮移动时的事件
		 * @param  {Function} done 完成拖动时的事件
		 * @return {boolean}        [description]
		 */
		function activateHandlers(move,done)/* {{{ */
		{
			btndown = true;
			onMove = move;
			onDone = done;
			toFront();
			return false;
		};
		/* }}} */


		function setCursor(t) { $trk.css('cursor',t); };

		$img.before($trk);
		return {
			activateHandlers: activateHandlers,
			setCursor: setCursor
		};
	}();
	/*}}}*/
	var KeyManager = function()/*{{{*/
	{
		var $keymgr = $('<input type="radio" />')
				.css({ position: 'absolute', left: '-30px' })
				.keypress(parseKey)
				.blur(onBlur),

			$keywrap = $('<div />')
				.css({
					position: 'absolute',
					overflow: 'hidden'
				})
				.append($keymgr)
		;

		function watchKeys()/*{{{*/
		{
			if (options.keySupport)
			{
				$keymgr.show();
				$keymgr.focus();
			}
		};
		/*}}}*/
		function onBlur(e)/*{{{*/
		{
			$keymgr.hide();
		};
		/*}}}*/
		function doNudge(e,x,y)/*{{{*/
		{
			if (options.allowMove) {
				Coords.moveOffset([x,y]);
				Selection.updateVisible();
			};
			e.preventDefault();
			e.stopPropagation();
		};
		/*}}}*/
		function parseKey(e)/*{{{*/
		{
			if (e.ctrlKey) return true;
			shift_down = e.shiftKey ? true : false;
			var nudge = shift_down ? 10 : 1;
			switch(e.keyCode)
			{
				case 37: doNudge(e,-nudge,0); break;
				case 39: doNudge(e,nudge,0); break;
				case 38: doNudge(e,0,-nudge); break;
				case 40: doNudge(e,0,nudge); break;

				case 27: Selection.release(); break;

				case 9: return true;
			}

			return nothing(e);
		};
		/*}}}*/
		
		if (options.keySupport) $keywrap.insertBefore($img);
		return {
			watchKeys: watchKeys
		};
	}();
	/*}}}*/

	// }}}
	// Internal Methods {{{

	function px(n) { return '' + parseInt(n) + 'px'; };
	function pct(n) { return '' + parseInt(n) + '%'; };
	function cssClass(cl) { return options.baseClass + '-' + cl; };
	//offset() 方法返回或设置匹配元素相对于文档的偏移（位置）。
	function getPos(obj)/*{{{*/
	{
		// Updated in v0.9.4 to use built-in dimensions plugin
		var pos = $(obj).offset();
		return [ pos.left, pos.top ];
	};
	/*}}}*/
	//返回鼠标点击处距离图片左上角的位置
	function mouseAbs(e)/*{{{*/
	{//pageX() 属性是鼠标指针的位置，相对于文档的左边缘
		//docOffset为img相对于文档的偏移量
		return [ (e.pageX - docOffset[0]), (e.pageY - docOffset[1]) ];
	};
	/*}}}*/
	function myCursor(type)/*{{{*/
	{
		if (type != lastcurs)
		{
			Tracker.setCursor(type);
			//Handles.xsetCursor(type);
			lastcurs = type;
		}
	};
	/*}}}*/
	//pos为鼠标位置距离左上角的偏移量
	/**
	 * 根据不同的拖动模式 重新设置固定位置与可拖动位置  并触发拖动时的操作
	 * @param  {string} mode mode 拖放的类型(e w n s ne nw se sw move)		
	 * @param  {Array} pos  鼠标位置距离左上角的偏移量
	 * @return {[type]}      不同拖动模式的选框变化
	 */
	function startDragMode(mode,pos)/*{{{*/
	{
		docOffset = getPos($img);
		Tracker.setCursor(mode=='move'?mode:mode+'-resize');

		if (mode == 'move')
			return Tracker.activateHandlers(createMover(pos), doneSelect);

		var fc = Coords.getFixed();
		var opp = oppLockCorner(mode);//返回固定的角
		var opc = Coords.getCorner(oppLockCorner(opp));//返回固定角的对角的坐标

		Coords.setPressed(Coords.getCorner(opp));//将x1 x2 y1 y2重置为固定角的位置
		Coords.setCurrent(opc);//将x2 y2重设为固定角对角的位置

		Tracker.activateHandlers(dragmodeHandler(mode,fc),doneSelect);
	};
	/*}}}*/
	/**
	 * 拖放模式的控制
	 * @param  {string} mode 拖放的类型(e w n s ne nw se sw move)
	 * @param  {Array} f    选框的信息（w h x y x2,y2)
	 * @return {[type]}      拖放控制按钮后选框区的更新
	 */
	function dragmodeHandler(mode,f)/*{{{*/
	{
		return function(pos) {
			if (!options.aspectRatio) switch(mode)
			{//如果设置宽高比 当以东西南北调整选框大小时 将pos设置为x2 y2
				case 'e': pos[1] = f.y2; break;
				case 'w': pos[1] = f.y2; break;
				case 'n': pos[0] = f.x2; break;
				case 's': pos[0] = f.x2; break;
			}
			else switch(mode)
			{//如果未设置宽高比 根据选框宽高设置
				case 'e': pos[1] = f.y+1; break;
				case 'w': pos[1] = f.y+1; break;
				case 'n': pos[0] = f.x+1; break;
				case 's': pos[0] = f.x+1; break;
			}
			Coords.setCurrent(pos); //将x2 y2设置为对角
			Selection.update();//更新选区
		};
	};
	/*}}}*/
	/**
	 * [createMover description]
	 * @param  {[type]} pos [description]
	 * @return {[type]}     [description]
	 */
	function createMover(pos)/*{{{*/
	{
		var lloc = pos;
		KeyManager.watchKeys();

		return function(pos)
		{
			Coords.moveOffset([pos[0] - lloc[0], pos[1] - lloc[1]]);
			lloc = pos;
			
			Selection.update();
		};
	};
	/*}}}*/
	//如果是固定比例的拖放 不同的方向拖动确定需要固定的角
	function oppLockCorner(ord)/*{{{*/
	{
		switch(ord)
		{
			case 'n': return 'sw';
			case 's': return 'nw';
			case 'e': return 'nw';
			case 'w': return 'ne';
			case 'ne': return 'sw';
			case 'nw': return 'se';
			case 'se': return 'nw';
			case 'sw': return 'ne';
		};
	};
	/*}}}*/

	//
	function createDragger(ord)/*{{{*/
	{
		return function(e) {
			if (options.disabled) return false;
			if ((ord == 'move') && !options.allowMove) return false;
			btndown = true;
			startDragMode(ord,mouseAbs(e));
			e.stopPropagation();
			e.preventDefault();
			return false;
		};
	};
	/*}}}*/
	/*如何图片的宽度或高度大于给定值 将图片的宽度和高度缩放一定比例*/
	function presize($obj,w,h)/*{{{*/
	{
		var nw = $obj.width(), nh = $obj.height();
		if ((nw > w) && w > 0)
		{
			nw = w;
			nh = (w/$obj.width()) * $obj.height();
		}
		if ((nh > h) && h > 0)
		{
			nh = h;
			nw = (h/$obj.height()) * $obj.width();
		}
		xscale = $obj.width() / nw;
		yscale = $obj.height() / nh;
		$obj.width(nw).height(nh);
	};
	/*}}}*/
	function unscale(c)/*{{{*/
	{
		return {
			x: parseInt(c.x * xscale), y: parseInt(c.y * yscale), 
			x2: parseInt(c.x2 * xscale), y2: parseInt(c.y2 * yscale), 
			w: parseInt(c.w * xscale), h: parseInt(c.h * yscale)
		};
	};
	/*}}}*/
	/**
	 * 选框完成选择后触发的操作
	 * @param  {[type]} pos [description]
	 * @return {[type]}     handle的位置
	 */
	function doneSelect(pos)/*{{{*/
	{
		var c = Coords.getFixed();
		//options.minSelect选框最小选择尺寸
		if (c.w > options.minSelect[0] && c.h > options.minSelect[1])
		{
			Selection.enableHandles();
			Selection.done();
		}
		else
		{
			Selection.release();
		}
		//options.allowSelect 是否允许新选框 crosshair表示光标呈现十字线
		Tracker.setCursor( options.allowSelect?'crosshair':'default' );
	};
	/*}}}*/

	function newSelection(e)/*{{{*/
	{//允许有新选框时触发
		if (options.disabled) return false;
		if (!options.allowSelect) return false;
		btndown = true;
		docOffset = getPos($img);//img的offset
		Selection.disableHandles();//删除handle
		myCursor('crosshair');
		var pos = mouseAbs(e);
		Coords.setPressed(pos);
		Tracker.activateHandlers(selectDrag,doneSelect);
		KeyManager.watchKeys();
		Selection.update();

		e.stopPropagation();
		e.preventDefault();
		return false;
	};
	/*}}}*/
	function selectDrag(pos)/*{{{*/
	{
		Coords.setCurrent(pos);
		Selection.update();
	};
	/*}}}*/

	function newTracker()
	{
		var trk = $('<div></div>').addClass(cssClass('tracker'));
		$.browser.msie && trk.css({ opacity: 0, backgroundColor: 'white' });
		return trk;
	};

	// }}}
	// API methods {{{
		
	function animateTo(a)/*{{{*/
	{
		var x1 = a[0] / xscale,
			y1 = a[1] / yscale,
			x2 = a[2] / xscale,
			y2 = a[3] / yscale;

		if (animating) return;

		var animto = Coords.flipCoords(x1,y1,x2,y2);//保证x1>x2
		var c = Coords.getFixed();
		var animat = initcr = [ c.x, c.y, c.x2, c.y2 ];
		var interv = options.animationDelay;//动画延迟

		var x = animat[0];
		var y = animat[1];
		var x2 = animat[2];
		var y2 = animat[3];
		var ix1 = animto[0] - initcr[0];
		var iy1 = animto[1] - initcr[1];
		var ix2 = animto[2] - initcr[2];
		var iy2 = animto[3] - initcr[3];
		var pcent = 0;
		var velocity = options.swingSpeed;//过渡速度

		Selection.animMode(true);

		var animator = function()
		{
			return function()
			{
				pcent += (100 - pcent) / velocity;

				animat[0] = x + ((pcent / 100) * ix1);
				animat[1] = y + ((pcent / 100) * iy1);
				animat[2] = x2 + ((pcent / 100) * ix2);
				animat[3] = y2 + ((pcent / 100) * iy2);

				if (pcent < 100) animateStart();
					else Selection.done();

				if (pcent >= 99.8) pcent = 100;

				setSelectRaw(animat);
			};
		}();

		function animateStart()
			{ window.setTimeout(animator,interv); };

		animateStart();
	};
	/*}}}*/
	//创建选框
	function setSelect(rect)//{{{
	{
		setSelectRaw([rect[0]/xscale,rect[1]/yscale,rect[2]/xscale,rect[3]/yscale]);
	};
	//}}}
	function setSelectRaw(l) /*{{{*/
	{
		Coords.setPressed([l[0],l[1]]); 
		Coords.setCurrent([l[2],l[3]]);
		Selection.update();
	};
	/*}}}*/
	//设定（或改变）参数，格式与初始化设置参数一样
	function setOptions(opt)/*{{{*/
	{
		if (typeof(opt) != 'object') opt = { };
		options = $.extend(options,opt);

		if (typeof(options.onChange)!=='function')
			options.onChange = function() { };

		if (typeof(options.onSelect)!=='function')
			options.onSelect = function() { };

	};
	/*}}}*/
	//获取选框的值（实际尺寸）
	function tellSelect()/*{{{*/
	{
		return unscale(Coords.getFixed());
	};
	console.log(tellSelect());
	/*}}}*/
	//获取选框的值（界面尺寸）
	function tellScaled()/*{{{*/
	{
		return Coords.getFixed();
	};
	console.log(tellScaled());
	/*}}}*/
	function setOptionsNew(opt)/*{{{*/
	{
		setOptions(opt);
		interfaceUpdate();
	};
	/*}}}*/
	function disableCrop()//{{{
	{
		options.disabled = true;
		Selection.disableHandles();
		Selection.setCursor('default');
		Tracker.setCursor('default');
	};
	//}}}
	function enableCrop()//{{{
	{
		options.disabled = false;
		interfaceUpdate();
	};
	//}}}
	function cancelCrop()//{{{
	{
		Selection.done();
		Tracker.activateHandlers(null,null);
	};
	//}}}
	function destroy()//{{{
	{
		$div.remove();
		$origimg.show();
	};
	//}}}

	function interfaceUpdate(alt)//{{{
	// This method tweaks the interface based on options object.
	// Called when options are changed and at end of initialization.
	{
		options.allowResize ?
			alt?Selection.enableOnly():Selection.enableHandles():
			Selection.disableHandles();

		Tracker.setCursor( options.allowSelect? 'crosshair': 'default' );
		Selection.setCursor( options.allowMove? 'move': 'default' );

		$div.css('backgroundColor',options.bgColor);

		if ('setSelect' in options) {
			setSelect(opt.setSelect);
			Selection.done();
			delete(options.setSelect);
		}

		if ('trueSize' in options) {
			xscale = options.trueSize[0] / boundx;
			yscale = options.trueSize[1] / boundy;
		}

		xlimit = options.maxSize[0] || 0;
		ylimit = options.maxSize[1] || 0;
		xmin = options.minSize[0] || 0;
		ymin = options.minSize[1] || 0;

		if ('outerImage' in options)
		{
			$img.attr('src',options.outerImage);
			delete(options.outerImage);
		}

		Selection.refresh();
	};
	//}}}

	// }}}

	$hdl_holder.hide();
	interfaceUpdate(true);
	
	var api = {
		animateTo: animateTo,
		setSelect: setSelect,
		setOptions: setOptionsNew,
		tellSelect: tellSelect,
		tellScaled: tellScaled,

		disable: disableCrop,
		enable: enableCrop,
		cancel: cancelCrop,

		focus: KeyManager.watchKeys,

		getBounds: function() { return [ boundx * xscale, boundy * yscale ]; },
		getWidgetSize: function() { return [ boundx, boundy ]; },

		release: Selection.release,
		destroy: destroy

	};

	$origimg.data('Jcrop',api);
	return api;
};

$.fn.Jcrop = function(options)/*{{{*/
{
	function attachWhenDone(from)/*{{{*/
	{
		var loadsrc = options.useImg || from.src;
		var img = new Image();
		img.onload = function() { $.Jcrop(from,options); };
		img.src = loadsrc;
	};
	/*}}}*/
	if (typeof(options) !== 'object') options = { };

	// Iterate over each object, attach Jcrop
	this.each(function()
	{
		// If we've already attached to this object
		if ($(this).data('Jcrop'))
		{
			// The API can be requested this way (undocumented)
			if (options == 'api') return $(this).data('Jcrop');
			// Otherwise, we just reset the options...
			else $(this).data('Jcrop').setOptions(options);
		}
		// If we haven't been attached, preload and attach
		else attachWhenDone(this);
	});

	// Return "this" so we're chainable a la jQuery plugin-style!
	return this;
};
/*}}}*/

})(jQuery);
