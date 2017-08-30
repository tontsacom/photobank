/*!
 * PhotoBank v1.1 (https://github.com/tontsacom/floortiles)
 * Copyright 2017
 * Licensed under the MIT license
 */
(function($) {

	var optionsDefault = {
/*		tileSize: {
			x: 200,
			y: 150
		},
		tileLimit: {
			x: 6,
			y: 4
		},
		maxWidth: 1000,
		gap: 3,
		minCol: 2,
		maxCol: 6,
		tag: '',
		animate: true,
		animateTime: 500,
		delayResizeTime: 500,
		tiled: function(el, ui) {
			// el - element,
			// ui - object {
				// index: (from 0),
				// tile: {x, y},
				// pos: {x, y},
				// size: {x, y},
				// tileSize: {x, y}
			// }
		},*/
		debug: false // only for debug purpose
	}

	class photobank {
		constructor(element, options) {
			this.$element = $(element);

			var childs = this.$element.children();
			if (childs.length == 0) $.error('No images in jQuery.photobank');
			for (var i = 0; i < childs.length; i++) {
				if (childs.get(i).tagName != 'IMG') $.error('Not the <img> tags in jQuery.photobank');
			}

			$.extend(this, optionsDefault);

			this.reset(options);
 		}

		destructor() {
//			this.$element.html(this.$element.children().html());
//			this.$element.children().removeAttr('style');
		}

		reset(options) {
/*			for (var option in options) {
				if (option in optionsDefault) {
					switch (option) {
						case 'tileSize':
							var size = this.minSize(options[option], '40x30');
							if (!size) $.error('Wrong value ' + options[option] + ' of property ' + option + ' in jQuery.floortiles');
							this[option] = size;
						break;
						case 'tileLimit':
							var size = this.size(options[option]);
							if (!size) $.error('Wrong value ' + options[option] + ' of property ' + option + ' in jQuery.floortiles');
							this[option] = size;
						break;
						default:
							this[option] = options[option];
					}
				} else {
					$.error('Undefined property ' + option + ' in jQuery.floortiles');
				}
			}
			
			this.refresh();*/
		}

	}

	var methods = {
		init: function(options) {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('photobank'),

				if (!data) {
					data = new photobank(this, options);
				} else {
					data.reset(options);
				}

				$this.data('photobank', data);
			});
		},
/*
		refresh: function() {
			return this.each(function() {
				$(this).data('photobank').refresh();
			});
		},
*/
		destroy: function() {
			return this.each(function() {
//				$(this).data('photobank').destructor();
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