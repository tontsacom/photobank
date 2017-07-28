# PhotoBank

PhotoBank is a jQuery plugin for laying out images using the native algorithm from [FloorTiles](https://github.com/tontsacom/floortiles/).

#Usage

```html    
<div class="photobank">
	<img src="img/berries.jpg">
	<img src="img/bread.jpg">
	<img src="img/camera.jpg">
	<img src="img/dancer.jpg">
	<img src="img/greylag-goose.jpg">
	<img src="img/o2-tower.jpg">
</div>
...
<script src="floortiles.min.js" type="text/javascript"></script>
<script src="photobank.js" type="text/javascript"></script>
<script type="text/javascript">
	$.noConflict();
	jQuery(document).ready(function($) {
		$('.photobank').photobank();
	})
</script>
```

#[Demo](https://tontsacom.github.io/photobank/)
