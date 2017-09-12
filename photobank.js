/*!
 * PhotoBank v1.1 (https://github.com/tontsacom/floortiles)
 * Copyright 2017
 * Licensed under the MIT license
 */
(function($) {

	var optionsDefault = {
		layout: '1x1 1x2 1x3 1x4 2x1 2x3 3x1 3x2',
		debug: false // only for debug purpose
	}

	class photobank {
		constructor(element, options) {
			this.$element = $(element);
			this.images = [];
			this.ratio = [];

			var that = this;
			this.$element.children().each(function(){
				if (this.tagName != 'IMG') $.error('Not the <img> tags in jQuery.photobank');
				that.images.push({
					width: this.naturalWidth,
					height: this.naturalHeight
				});
				that.ratio.push(Math.log(this.naturalHeight / this.naturalWidth));
				$(this).wrap('<div />');
			});

			$.extend(this, optionsDefault);

			this.reset(options);
 		}

		destructor() {console.log(this.$element, this.$element.children());
			//this.$element.html(this.$element.children().html());
			//this.$element.children().removeAttr('style');
			this.$element.children().each(function() {
				$(this).children().removeAttr('style').unwrap();
			});
		}

		reset(options) {
			for (var option in options) {
				if (!(option in optionsDefault)) $.error('Undefined property \'' + option + '\' in jQuery.photobank');
				this[option] = options[option];
			}
			var items = this.layout.split(' '),
				couple,
				x,
				y;
			if (items.length < 1) $.error('Wrong value of property \'layout\' in jQuery.photobank');
			this.layoutArr = [];
			for (var i = 0; i < items.length; i++) {
				couple = items[i].split('x');
				if (couple.length != 2 ) $.error('Wrong element \'' + items[i] + '\' of property \'layout\' in jQuery.photobank');
				x = parseInt(couple[0]);
				y = parseInt(couple[1]);
				if (x < 1 || y < 1) $.error('Wrong element \'' + items[i] + '\' of property \'layout\' in jQuery.photobank');
				this.layoutArr.push({
					x: x,
					y: y,
					r: Math.log(y / x)
				});
			}
			this.layoutArr.sort(function(a, b) {return a.y / a.x - b.y / b.x;});

			var that = this,
				logScaleMin = Math.floor(this.ratio.reduce(function(t, v) {return Math.min(t, v);}) * 10) * .1,
				logScaleMax = Math.ceil(this.ratio.reduce(function(t, v) {return Math.max(t, v);}) * 10) * .1,
				place = Math.round(findPlaceMin(
						Math.min(logScaleMin, Math.ceil(((logScaleMin + logScaleMax) / 2 - .5) * 10) * .1),
						Math.max(logScaleMax, Math.floor(((logScaleMin + logScaleMax) / 2 + .5) * 10) * .1),
						.1,
						delta
					) * 10) * .1,
				ratio = Math.pow(Math.E, findPlaceMin(place - .1,  place + .1, .01, delta));
			x = findPlaceMin(140, 170, 1, closer);
			y = Math.round(x * ratio);

			this.$element.find('img').each(function(){
				var index = $(this).parent().index(),
					image = that.layoutArr[findRatio(Math.log(that.images[index].height / that.images[index].width / ratio))];
				$(this).parent().data('tile', image.x + 'x' + image.y);
			});

			this.$element.floortiles({
				maxWidth: Infinity,
				tileSize: x + 'x' + y
			});

			this.$element.find('img').each(function(){
				var crop = $(this).parent(),
					image = that.images[$(this).parent().index()],
					width = crop.width(),
					height = crop.height(),
					widthOrigin = image.width,
					heightOrigin = image.height,
					left = (width - height * widthOrigin / heightOrigin) / 2,
					top = (height - width * heightOrigin / widthOrigin) / 2;
				if (height / width > heightOrigin / widthOrigin) {
					$(this).css({
						height: '100%',
						'margin-left': left + 'px'
					});
				} else {
					$(this).css({
						width: '100%',
						'margin-top': top + 'px'
					});
				}
			});
	
			function findPlaceMin(start, end, step, func) {
				var min = func(start),
					find = start,
					place = start + step,
					bound = end + step / 2,
					value;
				while (place < bound) {
					value = func(place);
					if (value < min) {
						min = value;
						find = place;
					}
					place += step;
				}
				return find;
			}

			function delta(shift) {
				var i = that.ratio.length,
					s = 0;
				while (i--) {
					var j = that.layoutArr.length - 1,
						min = Math.abs(that.ratio[i] - that.layoutArr[j].r - shift);
					while (j--) {
						min = Math.min(min, Math.abs(that.ratio[i] - that.layoutArr[j].r - shift));
					}
					s += min;
				}
				return s;
			}

			function closer(x) {
				return Math.abs(Math.round(x * ratio) / x / ratio - 1);
			}

			function findRatio(ratio) {
				var i = that.layoutArr.length - 1,
					min = Math.abs(ratio - that.layoutArr[i].r);
				while (i--) {
					if (min <= Math.abs(ratio - that.layoutArr[i].r)) return ++i;
					min = Math.abs(ratio - that.layoutArr[i].r);
				}
				return ++i;
			}
		}

	}

	var methods = {
		init: function(options) {
			return this.each(function() {
				var data = $(this).data('photobank');
				if (!data) {
					$(this).data('photobank', new photobank(this, options));
				} else {
					data.reset(options);
				}console.log($(this).data('photobank'));
			});
		},

		/*refresh: function() {
			return this.each(function() {
				$(this).data('photobank').refresh();
			});
		},*/

		destroy: function() {
			return this.each(function() {console.log('destroy', this);
				$(this).floortiles('destroy');
				$(this).data('photobank').destructor();
				$(this).removeData('photobank');
			});
		}
	};

	$.fn.photobank = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('The method named ' + method + ' does not exist in jQuery.photobank' );
		}
	};

})(jQuery);