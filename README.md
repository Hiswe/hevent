# hevent

[demo](http://hiswe.github.io/hevent/)

##### Depends on

- [Jquery](http://jquery.com/)
- [Modernizr](http://modernizr.com/)

see [bower.json](https://github.com/Hiswe/hevent/blob/master/bower.json) for more details


## Easy transitionend/animationend

In your jQuery code you just have to do

```
$('selector').on('transitionend' , callback)
```
And the event will be aliased to whatever browser event is.

## AddClass, removeClass & toggleClass

Here is one example:

```
$('selector').on('transitionend' , callback);  
$('selector').toggleClass('animatedClass');
```

The callback may not be called if another css rule remove a CSS transition or animation (like in responsive)… So you have to handle this in your JS.

Or you can use this:

```
$('selector').on('transitionend' , callback);
$('selector').heventToggleClass('animatedClass');
```

The callback will fire after the transition/animation end
**or**
if no animation/transition is detected just fire quite immediatly.

Here is the list of all additional method

- heventAddClass
- heventRemoveClass
- heventToggleClass

## Build

You can build the library by running ```gulp build``` after the necessary ```npm install && bower install```

## Todo

- Automatically remove logs on build 
- test with [gulp-qunit](https://www.npmjs.org/package/gulp-qunit)

## Release History

- **0.4.8** – [UMD](https://github.com/umdjs/umd) support
- **0.4.7** – Fix Firefox issue with hevent firing even when a transitionend/animationed was active. 
- **0.4.6**  
  - Fix of event aliases
  - point to the right element when determining if there is an animation
- **0.4.5**  — Fix transition not happening on Firefox after an addClass.  
  see [this stackoverflow post](http://stackoverflow.com/questions/7069167/css-transition-not-firing) fore more details
- **0.4.4**  — Remove plugin logs
- **0.4.3**
  - Fix behavior with non w3c events
  - Always send an ```event.originalEvent```  
  ```event.originalEvent.type``` is ```hevent``` when it's using the fallback
- **0.4.2** — Fix event.propertyName & event.elapsedTime disappearance on transitionend
- **0.4.1** — small refactor
- **0.4.0**
  - Use Modernizr for browser sniffing
  - Add custom class method: *heventAddClass, heventRemoveClass, heventToggleClass*
- **0.3.0** — Remove pointerEvents support. You should instead use:
  - [Polymer pointer events](http://www.polymer-project.org/platform/pointer-events.html) ([repo](https://github.com/polymer/PointerEvents))
  - [Polymer pointer gestures](https://github.com/Polymer/PointerGestures)
  - [jquery pointer events](https://github.com/jquery/jquery-pointer-events)
- **0.2.1** — Fix issue on [Opera](http://ianlunn.co.uk/articles/opera-12-otransitionend-bugs-and-workarounds/)
- **0.2.0** — Fix issue when the browser use w3c event name
- **0.1.0** — Initial commit
