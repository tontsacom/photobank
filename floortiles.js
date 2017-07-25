(function($) {

	var optionsDefault = {
		tileSize: {
			x: 200,
			y: 150
		},
		tileLimit: {
			x: 6,
			y: 4
		},
		maxWidth: 800,
		gap: 3,
		minCol: 2,
		maxCol: 6,
		animate: true,
		animateTime: 500,
		delayResizeTime: 500,
		tiled: function(el, ui) {
// el - element, ui - {index: (from 0), tile: {x, y}, pos: {x, y}, size: {x, y}}
		}
	}

	class floortiles {

		constructor(element, options) {

			this.nextStatus = false;
			this.$element = $(element);

			var childs = this.$element.children();
			if (childs.length == 0) throw new Error('Плитки отсутствуют in jQuery.floortiles');
			if (!childs.eq(0).data('tile')) throw new Error('Не указан размер плитки в элементе 1 in jQuery.floortiles');

			var tag = childs.get(0).tagName;
			for (var i = 1; i < childs.length; i++) {
				if (!childs.eq(i).data('tile')) throw new Error('Не указан размер плитки в элементе ' + (i + 1) + ' in jQuery.floortiles');
				if (childs.get(i).tagName != tag) throw new Error('Не однородный по тегу состав плиток in jQuery.floortiles');
			}

			this.$element.wrapInner('<div class="floortiles-wrapper" />');
			this.spaces = [];
			this.holes = [];
			for (var option in optionsDefault) {
				this[option] = optionsDefault[option];
			}

			this.reset(options)

		}

		reset(options) {

			for (var option in options) {

				if (option in optionsDefault) {

					switch (option) {

						case 'tileSize':
							var size = this.minSize(options[option], '40x30');
							if (!size) throw new Error('Wrong value ' + options[option] + ' of property ' + option + ' in jQuery.floortiles');
							this[option] = size;
						break;

						case 'tileLimit':
							var size = this.size(options[option]);
							if (!size) throw new Error('Wrong value ' + options[option] + ' of property ' + option + ' in jQuery.floortiles');
							this[option] = size;
						break;

						default:
							this[option] = options[option];

					}

				} else {
					throw new Error('Undefined property ' + option + ' in jQuery.floortiles');
				}
			}
			
			this.refresh();
			this.nextStatus = true;

		}

		refresh() {

			this.width = Math.min(this.$element.width(), this.maxWidth);
			var c = Math.ceil((this.width + this.gap) / this.tileSize.x);
			this.columns = Math.max(Math.min(c, this.maxCol), this.minCol);
			this.holes.length = 0;
			this.spaces.length = 0;
			for (var i = 0; i < this.columns; i++) {
				this.spaces[i] = {
					x: i,
					y: 0,
					v: 0
				};
			}

			var wrapper = this.$element.find('.floortiles-wrapper'),
				childs = wrapper.children(),
				step = this.step(),
				tile,
				tileR,
				pos,
				posR,
				sizeR;
			for (var i = 0; i < childs.length; i++) {
				tile = childs.eq(i).data('tile');
				pos = this.sit(tile);
				tile = this.boundSize(tile);
				tileR = this.boundSizeR(tile);
				posR = {
					x: step.x * pos.x,
					y: step.y * pos.v
				};
				sizeR = {
					x: step.x * tileR.x - this.gap,
					y: step.y * tileR.v - this.gap
				};
				this.tiled(childs.eq(i), {
					index: i, 
					tile: tile, 
					pos: posR,
					size: sizeR,
					tileSize: this.tileSize
				});
				if (this.animate && this.nextStatus) {
					childs.eq(i).animate(
						{
							width: sizeR.x + 'px',
							height: sizeR.y +'px',
							left: posR.x + 'px',
							top: posR.y + 'px'
							},
						this.animateTime
					);
				} else {
					childs.eq(i).css({
						position: 'absolute',
						width: sizeR.x + 'px',
						height: sizeR.y +'px',
						left: posR.x + 'px',
						top: posR.y + 'px'
					});
				}
			}
			wrapper.css({
				width: (step.x * this.columns - this.gap) + 'px',
				height: (step.y * this.maxSpacesV(0, this.columns) - this.gap) + 'px'
			});
		}

		sit(tile) {
			var sitTile = this.boundSize(tile),
				findTile;

			if (sitTile.x >= this.columns) {

				sitTile = this.boundSizeR(sitTile);
				findTile = {
					x: 0,
					y: this.maxSpaces(0, this.spaces.length),
					v: this.maxSpacesV(0, this.spaces.length)
				};

				for (var i = 0; i < this.spaces.length; i++) {
					for (var j = this.spaces[i].y; j < findTile.y; j++) {
						this.holes.push({
							x: this.spaces[i].x,
							y: j,
							v: j - this.spaces[i].y + this.spaces[i].v
						});
					};
					this.spaces[i] = {
						x: i,
						y: findTile.y + sitTile.y,
						v: findTile.v + sitTile.v
					};
				};

				this.holes.sort(this.compareH);
				return findTile;

			}

			sitTile = this.boundSizeR(sitTile);
			var spacesM = [];
			for (var i = 0; i < this.spaces.length - sitTile.x + 1; i++) {
				spacesM[i] = {
					x: i,
					y: this.maxSpaces(i, i + sitTile.x),
					v: this.maxSpacesV(i, i + sitTile.x)
				};
			}

			spacesM.sort(this.compareH);
			var holesM = [];
			for (var i = 0; i < this.holes.length; i++) {
				var base = this.holes[i];
				for (var j = 1; j < sitTile.x; j++) {
					if ((i + j >= this.holes.length || this.holes[i + j].x != base.x + j || this.holes[i + j].y != base.y) &&
						(this.holes[i].x + j >= this.spaces.length || this.spaces[this.holes[i].x + j].y > base.y)) break;
				}
				if (j == sitTile.x) holesM.push(base);
			}

			var l = holesM.length;
			if (l > 0 && sitTile.y > 1) {
				holesM.sort(this.compareV);
				for (var i = 0; i < l - sitTile.y + 1; i++) {
					var base = holesM[i];
					for (var j = 1; j < sitTile.y; j++) {
						if (holesM[i + j].x != base.x || holesM[i + j].y != base.y + j) break;
					}
					if (j == sitTile.y) holesM.push(base);
				}
				holesM.splice(0, l);
				holesM.sort(this.compareH);
			}

			if (holesM.length > 0 && this.compareH(holesM[0], spacesM[0]) < 0) {

				findTile = holesM[0];
				for (var i = 0; i < this.holes.length; i++) {
					if (this.holes[i].x == findTile.x && this.holes[i].y == findTile.y) break;
				}
				for (var j = 1; j < sitTile.x && i + j < this.holes.length; j++) {
					if (this.holes[i + j].x != findTile.x + j || this.holes[i + j].y != findTile.y) break;
				}
				this.holes.splice(i, j);
				for (; j < sitTile.x; j++) {
					for (var k = this.spaces[findTile.x + j].y; k < findTile.y; k++) {
						this.holes.push({x: this.spaces[findTile.x + j].x, y: k});
					}
					this.spaces[findTile.x + j] = {
						x: this.spaces[findTile.x + j].x,
						y: findTile.y + sitTile.y,
						v: findTile.v + sitTile.v
					};
				}
				for (var k = 1; k < sitTile.y; k++) {
					for (; i < this.holes.length; i++) {
						if (this.holes[i].x == findTile.x && this.holes[i].y == findTile.y + k) break;
					}
					for (var j = 1; j < sitTile.x; j++) {
						if (this.holes[i + j].x != findTile.x + j || this.holes[i + j].y != findTile.y + k) break;
					}
					this.holes.splice(i, j);
				}
				this.holes.sort(this.compareH);
				return findTile;

			}

			findTile = spacesM[0];
			for (var i = findTile.x; i < findTile.x + sitTile.x; i++) {
				for (var j = this.spaces[i].y; j < findTile.y; j++) {
					this.holes.push({
						x: this.spaces[i].x,
						y: j,
						v: j + this.spaces[i].v - this.spaces[i].y
					});
				};
				this.spaces[i] = {
					x: i,
					y: findTile.y + sitTile.y,
					v: findTile.v + sitTile.v};
			};
			this.holes.sort(this.compareH);
			spacesM.length = 0;
			return findTile;

		}

		step(){
			var w = Math.min(Math.round(((this.width + this.gap) / this.columns) - this.gap), this.tileSize.x);
			return {
				x: w + this.gap,
				y: Math.round(w / this.tileSize.x * this.tileSize.y) + this.gap
			};
		}

		size(tile) {
			var couple = tile.split('x');
			if (couple.length != 2) return false;
			return {
				x: parseInt(couple[0]),
				y: parseInt(couple[1])
			};
		}

		minSize(tile, minTile) {
			var size = this.size(tile);
			if (!size) return false;
			var sizeM = this.size(minTile);
			return {
				x: Math.max(size.x, sizeM.x),
				y: Math.max(size.y, sizeM.y)
			};
		}

		boundSize(tile){
			var size = this.minSize(tile, '1x1');
			if (!size) return {
				x: 1,
				y: 1
			};
			var sizeM = this.tileLimit;
			return {
				x: Math.min(size.x, sizeM.x),
				y: Math.min(size.y, sizeM.y)
			};
		}

		boundSizeR(tile){
			if (tile.x > this.columns) return {
				x: this.columns,
				y: 1,
				v: tile.y / tile.x * this.columns
			};
			if (tile.x == this.columns) return {
				x: this.columns,
				y: 1,
				v: tile.y
			};
			return {
				x: tile.x,
				y: tile.y,
				v: tile.y
			};
		}

		maxSpaces(start, end){
			var m = this.spaces[start].y;
			for (var i = start + 1; i < end; i++) {
				m = Math.max(m, this.spaces[i].y);
			};
			return m;
		}

		maxSpacesV(start, end){
			var m = this.spaces[start].v;
			for (var i = start + 1; i < end; i++) {
				m = Math.max(m, this.spaces[i].v);
			};
			return m;
		}

		compareH(a, b){
			if (a.y > b.y) {
				return 1;
			} else if (a.y < b.y) {
				return -1;
			} else if (a.x > b.x) {
				return 1;
			} else {
				return -1;
			};
		}

		compareV(a, b){
			if (a.x > b.x) {
				return 1;
			} else if (a.x < b.x) {
				return -1;
			} else if (a.y > b.y) {
				return 1;
			} else {
				return -1;
			};
		}

	}

	$.fn.floortiles = function(options) {

		return this.each(function() {

			var $this = $(this),
				data = $this.data('floortiles'),
				timeout;

			if (!data) {

				data = new floortiles(this, options);
				$(window).on('resize.floortiles', function () {
					if (timeout) clearTimeout(timeout);
					timeout = setTimeout(function() {
							data.refresh();
						},
						data.delayResizeTime);
				});

			} else {

				data.reset(options);

			}

			$this.data('floortiles', data);

		})

	};

})(jQuery);