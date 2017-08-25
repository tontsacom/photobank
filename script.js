$.noConflict();
jQuery(document).ready(function($) {

	$(window).load(
		function() {

			$('.photobank img').each(function(){
				if (!$(this).data('photobank')) {
					$(this).data('photobank', {
						width: this.naturalWidth,
						height: this.naturalHeight
					});
				}
			});

			var photobankArray = [],
				phbRatioArray = [],
				scaleRatioArray = [],
				logScaleMin = Math.log(1 / 6),
				logScaleMax = Math.log(4 / 1),
				logScaleRange = logScaleMax - logScaleMin;

			$("#result").append('<div class="floortiles" style="width: 100%;"></div>');
			$('.photobank img').each(function(){
				var size = $(this).data('photobank'),
					ratio = size.height / size.width,
					logRatio = Math.log(ratio);
				photobankArray.push({
					width: size.width,
					height: size.height,
					ratio: ratio
				});
				phbRatioArray.push(logRatio);
				$(this).clone().appendTo(".floortiles").wrap('<div />');
			});

			$('.photobank img').each(function(){
				$(this)
					.attr('data-toggle', 'tooltip')
					.attr('title', this.naturalWidth + 'x' + this.naturalHeight);
			});

			var scaleMask = [
				[1, 1],
				[1, 2],
				[1, 3],
				[1, 4],
				[2, 1],
				[2, 3],
				[3, 1],
				[3, 2]
			];
			scaleMask.sort(function(a, b) {
				if (a[1] / a[0] > b[1] / b[0]) return 1;
				return -1;
			});

			for (var i = 0; i < scaleMask.length; i++) {
				var logRatio = Math.log(scaleMask[i][1] / scaleMask[i][0]);
				scaleRatioArray.push(logRatio);
			}

			var time = performance.now();

			var place = Math.round(findPlaceMin(Math.round(logScaleMin * 10) * .1, Math.round(logScaleMax * 10) * .1, .1, delta) * 10) * .1;
			place = findPlaceMin(place - .1,  place + .1, .01, delta);
			var ratio = Math.pow(Math.E, place),
				x = findPlaceMin(140, 170, 1, closer),
				y = Math.round(x * ratio);

			time = performance.now() - time;
			console.log('Время выполнения = ', time);

			console.log(ratio);console.log(x + 'x' + y);console.log(y / x);console.log(Math.abs(y / x / ratio - 1) / ratio * 100 + '%');

			$('.floortiles > div').each(function(){
				var tile = $('.photobank img').eq($(this).index()).data('photobank'),
					tileRatio = scaleMask[findRatio(Math.log(tile.height / tile.width / ratio))];
//				$(this).attr('data-tile', tileRatio[0] + 'x' + tileRatio[1]);
				$(this).data('tile', tileRatio[0] + 'x' + tileRatio[1]);
			});
			$('.floortiles').floortiles({
				maxWidth: Infinity,
				tileSize: x + 'x' + y
			});
			console.log($('.floortiles').data('floortiles'));
			$('.photobank img').each(function(){
				var crop = $('.floortiles-wrapper > div').eq($(this).index()),
					width = crop.width(),
					height = crop.height(),
					widthOrigin = $(this).data('photobank').width,
					heightOrigin = $(this).data('photobank').height,
					left = (width - height * widthOrigin / heightOrigin) / 2,
					top = (height - width * heightOrigin / widthOrigin) / 2;console.log(crop, crop.find('img'));
				if (height / width > heightOrigin / widthOrigin) {
					crop.find('img').css({
						height: '100%',
						'margin-left': left + 'px'
					});
					crop
						.css({
							'background-size': '' + ((width - left) / width * 100) + '% 100%'
						})
						.attr('data-toggle', 'tooltip')
						.attr('title', 'horizont crop ' + Math.round(width + left * 2) + 'x' + height + ' from ' + widthOrigin + 'x' + heightOrigin + ' (' + (-left / width * 100).toFixed(2) + '%)');
				} else {
					crop.find('img').css({
						width: '100%',
						'margin-top': top + 'px'
					});
					crop
						.css({
							'background-size': '100% ' + ((height - top) / height * 100) + '%'
						})
						.attr('data-toggle', 'tooltip')
						.attr('title', 'vertical crop ' + width + 'x' + Math.round(height + top * 2) + ' from ' + widthOrigin + 'x' + heightOrigin + ' (' + (-top / height * 100).toFixed(2) + '%)');
				}
			});

			$('[data-toggle="tooltip"]').tooltip();

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

				var i = phbRatioArray.length,
					s = 0;
				while (i--) {
					var j = scaleRatioArray.length - 1,
						min = Math.abs(phbRatioArray[i] - scaleRatioArray[j] - shift);
					while (j--) {
						min = Math.min(min, Math.abs(phbRatioArray[i] - scaleRatioArray[j] - shift));
					}
					s += min;
				}
				return s;
			}

			function closer(x) {

				var y = Math.round(x * ratio);
				return Math.abs(y / x / ratio - 1);
			}

			function findRatio(ratio) {

				var i = scaleRatioArray.length - 1,
					min = Math.abs(ratio - scaleRatioArray[i]);
				while (i--) {
					if (min <= Math.abs(ratio - scaleRatioArray[i])) return i + 1;
					min = Math.abs(ratio - scaleRatioArray[i]);
				}
				return i + 1;
			}
		}
	);

})