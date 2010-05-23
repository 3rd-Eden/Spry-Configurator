/* Spry.Effect.js - Revision: Spry Preview Release 1.3 */

// Copyright (c) 2006. Adobe Systems Incorporated.
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//   * Redistributions of source code must retain the above copyright notice,
//     this list of conditions and the following disclaimer.
//   * Redistributions in binary form must reproduce the above copyright notice,
//     this list of conditions and the following disclaimer in the documentation
//     and/or other materials provided with the distribution.
//   * Neither the name of Adobe Systems Incorporated nor the names of its
//     contributors may be used to endorse or promote products derived from this
//     software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.



var Spry;

if (!Spry) Spry = {};

Spry.forwards = 1; // const
Spry.backwards = 2; // const

Spry.linearTransition = 1; // const
Spry.sinusoidalTransition = 2; // const

if (!Spry.Effect) Spry.Effect = {};

//////////////////////////////////////////////////////////////////////
//
// Spry.Effect.Registry
//
//////////////////////////////////////////////////////////////////////

Spry.Effect.Registry = function()
{
	this.elements = new Array();
};
 
Spry.Effect.Registry.prototype.getRegisteredEffect = function(element, effect) 
{
	var eleIdx = this.getIndexOfElement(element);

	if (eleIdx == -1)
	{
		var addedElement = new Spry.Effect.AnimatedElement(element);
		this.elements[this.elements.length] = addedElement;
		eleIdx = this.elements.length - 1;
	}

	var foundEffectArrayIdx = -1;
	for (var i = 0; i < this.elements[eleIdx].effectArray.length; i++) 
	{
		if (this.elements[eleIdx].effectArray[i])
		{
			if (this.effectsAreTheSame(this.elements[eleIdx].effectArray[i], effect))
			{
				foundEffectArrayIdx = i;
				this.elements[eleIdx].effectArray[i].reset(); // bb
				this.elements[eleIdx].currentEffect = i;
				if (this.elements[eleIdx].effectArray[i].options && (this.elements[eleIdx].effectArray[i].options.toggle != null)) {
					if (this.elements[eleIdx].effectArray[i].options.toggle == true)
						this.elements[eleIdx].effectArray[i].doToggle();
				} else { // same effect name (but no options or options.toggle field)
					this.elements[eleIdx].effectArray[i] = effect;
				}

				break;
			}
		}
	}

	if (foundEffectArrayIdx == -1) 
	{
		var currEffectIdx = this.elements[eleIdx].effectArray.length;
		this.elements[eleIdx].effectArray[currEffectIdx] = effect;
		this.elements[eleIdx].currentEffect = currEffectIdx;
	}

	var idx = this.elements[eleIdx].currentEffect;
	return this.elements[eleIdx].effectArray[idx];
}

Spry.Effect.Registry.prototype.getIndexOfElement = function(element)
{
	var registryIndex = -1;
	for (var i = 0; i < this.elements.length; i++)
	{
		if (this.elements[i]) {
			if (this.elements[i].element == element)
				registryIndex = i;
		}
	}
	return registryIndex;
}

Spry.Effect.Registry.prototype.effectsAreTheSame = function(effectA, effectB)
{
	if (effectA.name != effectB.name) 
		return false;

	//if(effectA.queue != null) xxx

	if(effectA.effectsArray != null) // cluster effect
	{
		for (var i = 0; i < effectA.effectsArray.length; i++)
		{
			if(!Spry.Effect.Utils.optionsAreIdentical(effectA.effectsArray[i].effect.options, effectB.effectsArray[i].effect.options))
				return false;
		}
	}
	else // single effect
	{
		if(!Spry.Effect.Utils.optionsAreIdentical(effectA.options, effectB.options))
			return false;
	}

	return true;
}


SpryRegistry = new Spry.Effect.Registry;

//////////////////////////////////////////////////////////////////////
//
// Spry.Effect.Utils
//
//////////////////////////////////////////////////////////////////////

if (!Spry.Effect.Utils) Spry.Effect.Utils = {};

Spry.Effect.Utils.Position = function()
{
	this.x = 0; // left
	this.y = 0; // top
}

Spry.Effect.Utils.Rectangle = function()
{
	this.width = 0;
	this.height = 0;
}

Spry.Effect.Utils.PositionedRectangle = function()
{
	this.position = new Spry.Effect.Utils.Position;
	this.rectangle = new Spry.Effect.Utils.Rectangle;
}

Spry.Effect.Utils.intToHex = function(integerNum) 
{
	var result = integerNum.toString(16);
	if (result.length == 1) 
		result = "0" + result;
	return result;
}

Spry.Effect.Utils.hexToInt = function(hexStr) 
{
	return parseInt(hexStr, 16); 
}

Spry.Effect.Utils.rgb = function(redInt, greenInt, blueInt) 
{
	
	var redHex = Spry.Effect.Utils.intToHex(redInt);
	var greenHex = Spry.Effect.Utils.intToHex(greenInt);
	var blueHex = Spry.Effect.Utils.intToHex(blueInt);
	compositeColorHex = redHex.concat(greenHex, blueHex);
	compositeColorHex = '#' + compositeColorHex;
	return compositeColorHex;
}

Spry.Effect.Utils.camelize = function(stringToCamelize)
{
    var oStringList = stringToCamelize.split('-');
    if (oStringList.length == 1) 
		return oStringList[0];

    var camelizedString = stringToCamelize.indexOf('-') == 0
      ? oStringList[0].charAt(0).toUpperCase() + oStringList[0].substring(1)
      : oStringList[0];

    for (var i = 1, len = oStringList.length; i < len; i++) {
      var s = oStringList[i];
      camelizedString += s.charAt(0).toUpperCase() + s.substring(1);
    }

    return camelizedString;
}

Spry.Effect.Utils.isPercentValue = function(value) 
{
	var result = false;
	try
	{
		if (value.lastIndexOf("%") > 0)
			result = true;
	}
	catch (e) {}
	return result;
}

Spry.Effect.Utils.getPercentValue = function(value) 
{
	var result = 0;
	try
	{
		result = value.substring(0, value.lastIndexOf("%"));
	}
	catch (e) {alert('ERR: Spry.Effect.Utils.getPercentValue: ' + e);}
	return result;
}

Spry.Effect.Utils.getPixelValue = function(value) 
{
	var result = 0;
	try
	{
		result = value.substring(0, value.lastIndexOf("px"));
	}
	catch (e) {}
	return result;
}

Spry.Effect.Utils.getFirstChildElement = function(node)
{
	if (node)
	{
		var childCurr = node.firstChild;

		while (childCurr)
		{
			if (childCurr.nodeType == 1) // Node.ELEMENT_NODE
				return childCurr;

			childCurr = childCurr.nextSibling;
		}
	}

	return null;
};

Spry.Effect.Utils.optionsAreIdentical = function(optionsA, optionsB)
{
	if(optionsA == null && optionsB == null)
		return true;

	if(optionsA != null && optionsB != null)
	{
		var objectCountA = 0;
		var objectCountB = 0;

		for (var propA in optionsA) objectCountA++;
		for (var propB in optionsB) objectCountB++;

		if(objectCountA != objectCountB)
			return false;

		for (var prop in optionsA)
			if((optionsB[prop] === undefined) || (optionsA[prop] != optionsB[prop]))
				return false;

		return true;
	}

	return false;
}


//////////////////////////////////////////////////////////////////////
//
// DHTML manipulation
//
//////////////////////////////////////////////////////////////////////

Spry.Effect.getElement = function(ele)
{
	var element = null;
	if (ele && typeof ele == "string")
		element = document.getElementById(ele);
	else
		element = ele;
	if (element == null) alert('ERROR in Spry.Effect.js: Element "' + ele + '" not found.');
	return element;
	
}

Spry.Effect.getStyleProp = function(element, prop)
{
	var value;

	try
	{
		value = element.style[Spry.Effect.Utils.camelize(prop)];
		if (!value)
		{
			if (document.defaultView && document.defaultView.getComputedStyle) {
				var css = document.defaultView.getComputedStyle(element, null);
				value = css ? css.getPropertyValue(prop) : null;
			} else if (element.currentStyle) {
				value = element.currentStyle[Spry.Effect.Utils.camelize(prop)];
			}
		}
	}
	catch (e) {alert('ERR: Spry.Effect.getStyleProp: ' + e);}

	return value == 'auto' ? null : value;
};

Spry.Effect.setStyleProp = function(element, prop, value)
{
	try
	{
		element.style[Spry.Effect.Utils.camelize(prop)] = value;
	}
	catch (e) {alert('ERR: Spry.Effect.setStyleProp: ' + e);}

	return null;
};

Spry.Effect.makePositioned = function(element)
{
	var pos = Spry.Effect.getStyleProp(element, 'position');
	if (!pos || pos == 'static') {
		element.style.position = 'relative';
		// Opera returns the offset relative to the positioning context, when an
		// element is position relative but top and left have not been defined
		/*
		if (window.opera) {
			element.style.top = 0;
			element.style.left = 0;
		}
		*/
	}
}

Spry.Effect.enforceVisible = function(element)
{
	var propDisplay = Spry.Effect.getStyleProp(element, 'display');
	if (propDisplay && propDisplay.toLowerCase() == 'none')
		Spry.Effect.setStyleProp(element, 'display', '');

	var propVisible = Spry.Effect.getStyleProp(element, 'visibility');
	if (propVisible && propVisible.toLowerCase() == 'hidden')
		Spry.Effect.setStyleProp(element, 'visibility', 'visible');
}

Spry.Effect.makeClipping = function(element) 
{
	var overflow = Spry.Effect.getStyleProp(element, 'overflow');
	if (overflow != 'hidden')
		element.style.overflow = 'hidden';
}

Spry.Effect.cleanWhitespace = function(element) 
{
    for (var i = 0; i < element.childNodes.length; i++) {
      var node = element.childNodes[i];
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
	  {
		  try
		  {
		 	element.parentNode.removeChild(element);
		  }
		  catch (e) {alert('ERR: Spry.Effect.cleanWhitespace: ' + e);}
	  }
    }
}

Spry.Effect.getDimensions = function(element) 
{
	dimensions = new Spry.Effect.Utils.Rectangle;
	if (Spry.Effect.getStyleProp(element, 'display') != 'none')
	{
		dimensions.width = element.offsetWidth;
		dimensions.height = element.offsetHeight;
	}
	return dimensions;

    // All *Width and *Height properties give 0 on elements with display none,
    // so enable the element temporarily
	/*
    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = '';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = 'none';
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
	*/
}

Spry.Effect.getOffsetPosition = function(element)
{
	var position = new Spry.Effect.Utils.Position;
	if (element.offsetTop != null)
	{
		position.y = element.offsetTop;
	}
	if (element.offsetLeft != null)
	{
		position.x = element.offsetLeft;
	}
	return position;
}


//////////////////////////////////////////////////////////////////////
//
// Spry.Effect.Animator
// (super type)
//
//////////////////////////////////////////////////////////////////////

Spry.Effect.Animator = function(options)
{
	
	this.timer = null;
	this.interval = 42; //33; // ca. 30 fps
	this.direction = Spry.forwards;
	this.startMilliseconds = 0;
	this.repeat = 'none';
	this.nextEffect = null;
	this.isFinished = false;
	
	this.options = {
		duration: 500,
		toggle: false,
		transition: Spry.linearTransition
	};
	
	this.setOptions(options);
	
};

Spry.Effect.Animator.prototype.setOptions = function(options)
{
	if (!options)
		return;
	for (var prop in options)
		this.options[prop] = options[prop];
};

Spry.Effect.Animator.prototype.start = function(queue)
{
	this.isFinished = false;
	this.queue = queue;
	var self = this;

	if (this.options.setup)
	{
		try
		{
			this.options.setup(this.element, this);
		}
		catch (e) {alert('ERR: Spry.Effect.Animator.prototype.start: ' + e);}
	}
	
	var currDate = new Date();
	this.startMilliseconds = currDate.getTime();
	this.timer = setInterval(function() { self.drawEffect(); }, this.interval);
};

Spry.Effect.Animator.prototype.stop = function()
{
	
	if (this.timer) {
		clearInterval(this.timer);
		this.timer = null;
	}

	this.startMilliseconds = 0;

	if (this.queue != null)
	{
		this.queue.startNextEffect();
	}
	else 
	{
		if (this.options.finish)
		{
			try
			{
				this.options.finish(this.element, this);
			}
			catch (e) {alert('ERR: Spry.Effect.Animator.prototype.stop: ' + e);}
		}
		this.isFinished = true;
	}
	/*
	Spry.Debug.trace('after stop:' + this.name);
	Spry.Debug.trace('this.element.style.top: ' + this.element.style.top);
	Spry.Debug.trace('this.element.style.left: ' + this.element.style.left);
	Spry.Debug.trace('this.element.style.width: ' + this.element.style.width);
	Spry.Debug.trace('this.element.style.height: ' + this.element.style.height);
	*/
};

Spry.Effect.Animator.prototype.cancel = function()
{
	if (this.timer) {
		clearInterval(this.timer);
		this.timer = null;
	}
	this.isFinished = true;
}

Spry.Effect.Animator.prototype.drawEffect = function()
{
	// default: linear transition
	var position = this.getElapsedMilliseconds() / this.options.duration;
	if (this.getElapsedMilliseconds() > this.options.duration) {
		position = 1.0;
	} else {
		if (this.options.transition == Spry.sinusoidalTransition)
		{
			position = (-Math.cos(position*Math.PI)/2) + 0.5;
		}
		else if (this.options.transition == Spry.linearTransition)
		{
			// default: linear
		}
		else
		{
			alert('unknown transition');
		}
		
	}
	//Spry.Debug.trace('animate: ' + position + ' : ' + this.name);
	this.animate(position);
	
	if (this.getElapsedMilliseconds() > this.options.duration) {
		this.stop();
	}
};

Spry.Effect.Animator.prototype.getElapsedMilliseconds = function()
{
	if (this.startMilliseconds > 0) {
		var currDate = new Date();
		return (currDate.getTime() - this.startMilliseconds);
	} else {
		return 0;
	}
};

Spry.Effect.Animator.prototype.doToggle = function()
{
	if (this.options.toggle == true) {
		if (this.direction == Spry.forwards) {
			this.direction = Spry.backwards;
		} else if (this.direction == Spry.backwards) {
			this.direction = Spry.forwards;
		}
	}
}

Spry.Effect.Animator.prototype.animate = function(position) {};

//////////////////////////////////////////////////////////////////////
//
// Spry.Effect.Move
//
//////////////////////////////////////////////////////////////////////

Spry.Effect.Move = function(element, fromPos, toPos, options)
{
	this.name = 'Move';
	
	Spry.Effect.Animator.call(this, options);

	this.element = Spry.Effect.getElement(element);

	this.startX = fromPos.x;
	this.stopX = toPos.x;
	this.startY = fromPos.y;
	this.stopY = toPos.y;
	
	this.rangeMoveX = this.startX - this.stopX;
	this.rangeMoveY= this.startY - this.stopY;
	
};

Spry.Effect.Move.prototype = new Spry.Effect.Animator();
Spry.Effect.Move.prototype.constructor = Spry.Effect.Move;

Spry.Effect.Move.prototype.animate = function(position)
{
	var left = 0;
	var top = 0;
	
	if (this.direction == Spry.forwards) {
		left = this.startX - (this.rangeMoveX * position);
		top = this.startY - (this.rangeMoveY * position);
	} else if (this.direction == Spry.backwards) {
		left = this.rangeMoveX * position + this.stopX;
		top = this.rangeMoveY * position + this.stopY;
	}

	//Spry.Debug.trace(top);
	
	this.element.style.left = left + "px";
	this.element.style.top = top + "px";
};

Spry.Effect.Move.prototype.reset = function()
{
	if(!this.isFinished)
	{
		this.cancel();
		this.startX = this.startX;
		this.startY = this.startY;
	}
}

//////////////////////////////////////////////////////////////////////
//
// Spry.Effect.MoveSlide
//
//////////////////////////////////////////////////////////////////////

Spry.Effect.MoveSlide = function(element, fromPos, toPos, options)
{
	this.name = 'MoveSlide';

	Spry.Effect.Animator.call(this, options);

	this.element = Spry.Effect.getElement(element);
	this.firstChildElement = Spry.Effect.Utils.getFirstChildElement(element);

	var originalRect = Spry.Effect.getDimensions(element);
	this.startHeight = originalRect.height;

	this.startX = Number(fromPos.x);
	this.stopX = Number(toPos.x);
	this.startY = Number(fromPos.y);
	this.stopY = Number(toPos.y);

	this.rangeMoveX = this.startX - this.stopX;
	this.rangeMoveY = this.startY - this.stopY;
};

Spry.Effect.MoveSlide.prototype = new Spry.Effect.Animator();
Spry.Effect.MoveSlide.prototype.constructor = Spry.Effect.MoveSlide;

Spry.Effect.MoveSlide.prototype.animate = function(position)
{
	var yStart      = (this.direction == Spry.forwards) ? this.startY : this.stopY;
	var yStop       = (this.direction == Spry.forwards) ? this.stopY : this.startY;
	var top         = (yStart > yStop) ? position * (yStop - yStart) : (1 - position) * (yStart - yStop);
	var eltHeight   = yStart + position * (yStop - yStart);

	if(eltHeight<0) eltHeight = 0;

	this.firstChildElement.style.top = top + 'px';
	this.element.style.height = eltHeight + 'px';
};

Spry.Effect.MoveSlide.prototype.reset = function()
{
	if(!this.isFinished)
	{
		this.cancel();
		this.startX = this.startX;
		this.startY = this.startY;
	}
}

//////////////////////////////////////////////////////////////////////
//
// Spry.Effect.Size
//
//////////////////////////////////////////////////////////////////////

Spry.Effect.Size = function(element, fromRect, toRect, options)
{
	this.name = 'Size';
	
	Spry.Effect.Animator.call(this, options);

	this.element = Spry.Effect.getElement(element);

	var originalRect = Spry.Effect.getDimensions(element);
	this.originalWidth = originalRect.width;

	this.startWidth = fromRect.width;
	this.startHeight = fromRect.height;
	this.stopWidth = toRect.width;
	this.stopHeight = toRect.height;

	if (Spry.Effect.Utils.isPercentValue(this.startWidth))
	{
		var startWidthPercent = Spry.Effect.Utils.getPercentValue(this.startWidth);
		//var originalRect = Spry.Effect.getDimensions(element);
		this.startWidth = originalRect.width * (startWidthPercent / 100);
	}

	if (Spry.Effect.Utils.isPercentValue(this.startHeight))
	{
		var startHeightPercent = Spry.Effect.Utils.getPercentValue(this.startHeight);
		//var originalRect = Spry.Effect.getDimensions(element);
		this.startHeight = originalRect.height * (startHeightPercent / 100);
	}

	if (Spry.Effect.Utils.isPercentValue(this.stopWidth))
	{
		var stopWidthPercent = Spry.Effect.Utils.getPercentValue(this.stopWidth);
		var originalRect = Spry.Effect.getDimensions(element);
		this.stopWidth = originalRect.width * (stopWidthPercent / 100);
	}

	if (Spry.Effect.Utils.isPercentValue(this.stopHeight))
	{
		var stopHeightPercent = Spry.Effect.Utils.getPercentValue(this.stopHeight);
		var originalRect = Spry.Effect.getDimensions(element);
		this.stopHeight = originalRect.height * (stopHeightPercent / 100);
	}
		
	this.widthRange = this.startWidth - this.stopWidth;
	this.heightRange = this.startHeight - this.stopHeight;
	
};

Spry.Effect.Size.prototype = new Spry.Effect.Animator();
Spry.Effect.Size.prototype.constructor = Spry.Effect.Size;

Spry.Effect.Size.prototype.animate = function(position)
{
	var width = 0;
	var height = 0;
	var fontSize = 0;

	if (this.direction == Spry.forwards) {
		width = this.startWidth - (this.widthRange * position);
		height = this.startHeight - (this.heightRange * position);
		fontSize = (this.startWidth + position*(this.stopWidth - this.startWidth))/this.originalWidth;
	} else if (this.direction == Spry.backwards) {
		width = this.widthRange * position + this.stopWidth;
		height = this.heightRange * position + this.stopHeight;
		fontSize = (this.stopWidth + position*(this.startWidth - this.stopWidth))/this.originalWidth;
	}
	if (this.options.scaleContent == true)
		this.element.style.fontSize = fontSize + 'em';

	//Spry.Debug.trace(fontSize);

	this.element.style.width = width + "px";
	this.element.style.height = height + "px";
};

Spry.Effect.Size.prototype.reset = function()
{
	if(!this.isFinished)
	{
		this.cancel();
		this.startWidth = this.startWidth;
		this.startHeight = this.startHeight;
	}
}

//////////////////////////////////////////////////////////////////////
//
// Spry.Effect.Opacity
//
//////////////////////////////////////////////////////////////////////

Spry.Effect.Opacity = function(element, startOpacity, stopOpacity, options)
{
	this.name = 'Opacity';
	
	Spry.Effect.Animator.call(this, options);

	this.element = Spry.Effect.getElement(element);

	this.startOpacity = startOpacity;
	this.stopOpacity = stopOpacity;
	this.opacityRange = this.startOpacity - this.stopOpacity;

};

Spry.Effect.Opacity.prototype = new Spry.Effect.Animator();
Spry.Effect.Opacity.prototype.constructor = Spry.Effect.Opacity;

Spry.Effect.Opacity.prototype.animate = function(position)
{
	var opacity = 0;

	if (this.direction == Spry.forwards) {
		opacity = this.startOpacity - (this.opacityRange * position);
	} else if (this.direction == Spry.backwards) {
		opacity = this.opacityRange * position + this.stopOpacity;
	}
	
	this.element.style.opacity = opacity;
	this.element.style.filter = "alpha(opacity=" + Math.floor(opacity * 100) + ")";
};

Spry.Effect.Opacity.prototype.reset = function()
{
	if(!this.isFinished)
	{
		this.cancel();
		this.startOpacity = this.startOpacity;
	}
}


//////////////////////////////////////////////////////////////////////
//
// Spry.Effect.Color
//
//////////////////////////////////////////////////////////////////////

Spry.Effect.Color = function(element, startColor, stopColor, options)
{
	this.name = 'Color';
	
	Spry.Effect.Animator.call(this, options);

	this.element = Spry.Effect.getElement(element);
	
	this.startColor = startColor;
	this.stopColor = stopColor;
	this.startRedColor = Spry.Effect.Utils.hexToInt(startColor.substr(1,2));
	this.startGreenColor = Spry.Effect.Utils.hexToInt(startColor.substr(3,2));
	this.startBlueColor = Spry.Effect.Utils.hexToInt(startColor.substr(5,2));
	this.stopRedColor = Spry.Effect.Utils.hexToInt(stopColor.substr(1,2));
	this.stopGreenColor = Spry.Effect.Utils.hexToInt(stopColor.substr(3,2));
	this.stopBlueColor = Spry.Effect.Utils.hexToInt(stopColor.substr(5,2));
	this.redColorRange = this.startRedColor - this.stopRedColor;
	this.greenColorRange = this.startGreenColor - this.stopGreenColor;
	this.blueColorRange = this.startBlueColor - this.stopBlueColor;
};

Spry.Effect.Color.prototype = new Spry.Effect.Animator();
Spry.Effect.Color.prototype.constructor = Spry.Effect.Color;

Spry.Effect.Color.prototype.animate = function(position)
{
	var redColor = 0;
	var greenColor = 0;
	var blueColor = 0;
	
	if (this.direction == Spry.forwards) {
		redColor = parseInt(this.startRedColor - (this.redColorRange * position));
		greenColor = parseInt(this.startGreenColor - (this.greenColorRange * position));
		blueColor = parseInt(this.startBlueColor - (this.blueColorRange * position));
	} else if (this.direction == Spry.backwards) {
		redColor = parseInt(this.redColorRange * position) + this.stopRedColor;
		greenColor = parseInt(this.greenColorRange * position) + this.stopGreenColor;
		blueColor = parseInt(this.blueColorRange * position) + this.stopBlueColor;
	}

	this.element.style.backgroundColor = Spry.Effect.Utils.rgb(redColor, greenColor, blueColor);
};

Spry.Effect.Color.prototype.reset = function()
{
	if(!this.isFinished)
	{
		this.cancel();
		this.startColor = this.startColor;
		this.startRedColor = Spry.Effect.Utils.hexToInt(startColor.substr(1,2));
		this.startGreenColor = Spry.Effect.Utils.hexToInt(startColor.substr(3,2));
		this.startBlueColor = Spry.Effect.Utils.hexToInt(startColor.substr(5,2));
	}
}

//////////////////////////////////////////////////////////////////////
//
// Spry.Effect.ClusteredEffect
//
//////////////////////////////////////////////////////////////////////

Spry.Effect.ClusteredEffect = function(effect, kind)
{
	this.effect = effect;
	this.kind = kind;
}

//////////////////////////////////////////////////////////////////////
//
// Spry.Effect.Cluster
//
//////////////////////////////////////////////////////////////////////

Spry.Effect.Cluster = function()
{
	this.name = 'Cluster';
	this.effectsArray = new Array();
	this.currIdx = -1;
	this.direction = Spry.forwards;
	this.options = {toggle: false};
	this.clusterIsFinished = false;
}

Spry.Effect.Cluster.prototype.addNextEffect = function(effect)
{
	this.effectsArray[this.effectsArray.length] = new Spry.Effect.ClusteredEffect(effect, "queue");
}

Spry.Effect.Cluster.prototype.addParallelEffect = function(effect)
{
	this.effectsArray[this.effectsArray.length] = new Spry.Effect.ClusteredEffect(effect, "parallel");
}

Spry.Effect.Cluster.prototype.getNextEffect = function()
{
	if ((this.currIdx + 1) < (this.effectsArray.length))
	{
		this.currIdx = this.currIdx + 1;
		return this.effectsArray[this.currIdx].effect;
	}
	else
	{
		return null;
	}
}

Spry.Effect.Cluster.prototype.resetIndex = function()
{
	this.currIdx = -1;
}

Spry.Effect.Cluster.prototype.start = function()
{
	// before queue starts possible setup callback action is executed
	if (this.setup) 
	{
		try
		{
			this.setup(this.effectsArray[0].effect.element, this.effectsArray);
		}
		catch (e) {alert('ERR: Spry.Effect.Cluster.prototype.start: ' + e);}
	}
	this.currIdx = 0;
	var quit = false;
	while (quit == false)
	{
		this.effectsArray[this.currIdx].effect.start(this);
		if ((this.currIdx + 1) < (this.effectsArray.length))
		{
			if (this.effectsArray[this.currIdx].kind == "queue")
			{
				quit = true;
			}
		}
		else
		{
			quit = true;
		}
		if (quit == false) 
		{
			this.currIdx++;
		}
	}
}

Spry.Effect.Cluster.prototype.startNextEffect = function()
{
	if ((this.currIdx + 1) < (this.effectsArray.length))
	{
		this.currIdx++;
		this.effectsArray[this.currIdx].effect.start(this);
	} else {
		// time for finish callback
		if (this.finish) 
		{
			try
			{
				this.finish(this.effectsArray[0].effect.element, this.effectsArray);
			}
			catch (e) {alert('ERR: Spry.Effect.Cluster.prototype.startNextEffect: ' + e);}
		}
		this.clusterIsFinished = true;
	}
}

Spry.Effect.Cluster.prototype.setToggle = function(doToggle)
{
	this.options.toggle = doToggle;
}

Spry.Effect.Cluster.prototype.doToggle = function()
{
	if (this.options.toggle == true) {
		if (this.direction == Spry.forwards) {
			this.direction = Spry.backwards;
		} else if (this.direction == Spry.backwards) {
			this.direction = Spry.forwards;
		}
	
		// toggle all effects of the cluster, too
		for (var i = 0; i < this.effectsArray.length; i++) 
		{
			if (this.effectsArray[i].effect.options && (this.effectsArray[i].effect.options.toggle != null)) {
				if (this.effectsArray[i].effect.options.toggle == true)
				{
					this.effectsArray[i].effect.doToggle();
				}
			}
		}
	}
}

Spry.Effect.Cluster.prototype.reset = function()
{
	if (this.currIdx == -1) return;
	for (var i = 0; i < this.effectsArray.length; i++) 
	{	
		if (!this.effectsArray[i].effect.isFinished)
			this.effectsArray[i].effect.reset();
	}
}

Spry.Effect.Cluster.prototype.cancel = function()
{
	for (var i = 0; i < this.effectsArray.length; i++)
	{
		if (this.effectsArray[i].effect.timer != null) 
			this.effectsArray[i].effect.cancel();
	}
}

//////////////////////////////////////////////////////////////////////
//
// Spry.Effect.AnimatedElement
//
//////////////////////////////////////////////////////////////////////


Spry.Effect.AnimatedElement = function (element) 
{
	this.element = element;
	this.currentEffect = -1;
	this.effectArray = new Array();
}


//////////////////////////////////////////////////////////////////////
//
// Combination effects
// Custom effects can be build by combining basic effect bahaviour
// like Move, Size, Color, Opacity
//
//////////////////////////////////////////////////////////////////////


Spry.Effect.AppearFade = function (element, options) 
{
	//this.opacity = Spry.Effect.getStyleProp(element, "opacity");
	/*
	if (!this.opacity) {
		this.opacity = 1.0; // Argh, just assume it is fully visible.
	} else {
		this.opacity = parseFloat(this.opacity);
	}
	*/

	var element = Spry.Effect.getElement(element);

	var durationInMilliseconds = 1000;
	var fromOpacity = 0.0;
	var toOpacity = 100.0;
	var doToggle = false;
	var kindOfTransition = Spry.sinusoidalTransition;
	var setupCallback = null;
	var finishCallback = null;

	

	if (options)
	{
		if (options.duration != null) durationInMilliseconds = options.duration;
		if (options.from != null) fromOpacity = options.from;
		if (options.to != null) toOpacity = options.to;
		if (options.toggle != null) doToggle = options.toggle;
		if (options.transition != null) kindOfTransition = options.transition;
		if (options.setup != null) setupCallback = options.setup;
		if (options.finish != null) finishCallback = options.finish;
	}
	options = {duration: durationInMilliseconds, toggle: doToggle, transition: kindOfTransition, setup: setupCallback, finish: finishCallback, from: fromOpacity, to: toOpacity};

	fromOpacity = fromOpacity/ 100.0;
	toOpacity = toOpacity / 100.0;

	var appearFadeEffect = new Spry.Effect.Opacity(element, fromOpacity, toOpacity, options);

	appearFadeEffect.name = 'AppearFade';
	var registeredEffect = SpryRegistry.getRegisteredEffect(element, appearFadeEffect);
	registeredEffect.start();
	return registeredEffect;
};


Spry.Effect.Blind = function (element, options) 
{
	var element = Spry.Effect.getElement(element);

	element.style.overflow = 'hidden';

	var durationInMilliseconds = 1000;
	var fromHeight = 100;
	var toHeight = 0;
	var doToggle = false;
	var kindOfTransition = Spry.sinusoidalTransition;
	var doScaleContent = false;
	var setupCallback = null;
	var finishCallback = null;

	var originalRect = Spry.Effect.getDimensions(element);
	
	var startWidthPx = originalRect.width;
	var startHeightPx = originalRect.height;

	var optionFrom = options.from;
	var optionTo   = options.to;

	

	if (options)
	{
		if (options.duration != null) durationInMilliseconds = options.duration;
		if (options.from != null)
		{
			if (Spry.Effect.Utils.isPercentValue(options.from))
			{
				fromHeight = Spry.Effect.Utils.getPercentValue(options.from);
			}
			else
			{
				fromHeight = (Spry.Effect.Utils.getPixelValue(options.from) / startHeightPx) * 100;
			}
		}
		if (options.to != null)
		{
			if (Spry.Effect.Utils.isPercentValue(options.to))
			{
				toHeight = Spry.Effect.Utils.getPercentValue(options.to);
			}
			else
			{
				toHeight = (Spry.Effect.Utils.getPixelValue(options.to) / startHeightPx) * 100;
			}
		}
		if (options.toggle != null) doToggle = options.toggle;
		if (options.transition != null) kindOfTransition = options.transition;
		if (options.setup != null) setupCallback = options.setup;
		if (options.finish != null) finishCallback = options.finish;
	}
	
	var stopWidthPx = startWidthPx;
	var stopHeightPx = startHeightPx;
	
	var fromRect = new Spry.Effect.Utils.Rectangle;
	fromRect.width = startWidthPx;
	fromRect.height = startHeightPx * (fromHeight / 100);
	
	var toRect = new Spry.Effect.Utils.Rectangle;
	toRect.width = stopWidthPx;
	toRect.height = stopHeightPx * (toHeight / 100);

	options = {duration:durationInMilliseconds, toggle:doToggle, transition:kindOfTransition, scaleContent:doScaleContent, setup: setupCallback, finish: finishCallback, from: optionFrom, to: optionTo};

	var blindEffect = new Spry.Effect.Size(element, fromRect, toRect, options);
	blindEffect.name = 'Blind';
	var registeredEffect = SpryRegistry.getRegisteredEffect(element, blindEffect);
	registeredEffect.start();
	return registeredEffect;
};


function setupHighlight(element, effect) 
{
	Spry.Effect.setStyleProp(element, 'background-image', 'none');
};

function finishHighlight(element, effect) 
{
	Spry.Effect.setStyleProp(element, 'background-image', effect.options.restoreBackgroundImage);

	if (effect.direction == Spry.forwards)
		Spry.Effect.setStyleProp(element, 'background-color', effect.options.restoreColor);
};

Spry.Effect.Highlight = function (element, options) 
{	
	var durationInMilliseconds = 1000;
	var toColor = "#ffffff";
	var doToggle = false;
	var kindOfTransition = Spry.sinusoidalTransition;
	var setupCallback = setupHighlight;
	var finishCallback = finishHighlight;
	var element = Spry.Effect.getElement(element);
	var fromColor = Spry.Effect.getStyleProp(element, "background-color");
	var restoreColor = fromColor;
	if (fromColor == "transparent") fromColor = "#ffff99";

	var optionFrom = options.from;
	var optionTo   = options.to;


	

	if (options)
	{
		if (options.duration != null) durationInMilliseconds = options.duration;
		if (options.from != null) fromColor = options.from;
		if (options.to != null) toColor = options.to;
		if (options.restoreColor) restoreColor = options.restoreColor;
		if (options.toggle != null) doToggle = options.toggle;
		if (options.transition != null) kindOfTransition = options.transition;
		if (options.setup != null) setupCallback = options.setup;
		if (options.finish != null) finishCallback = options.finish;
	}

	var restoreBackgroundImage = Spry.Effect.getStyleProp(element, 'background-image');
	
	options = {duration: durationInMilliseconds, toggle: doToggle, transition: kindOfTransition, setup: setupCallback, finish: finishCallback, restoreColor: restoreColor, restoreBackgroundImage: restoreBackgroundImage, from: optionFrom, to: optionTo};

	var highlightEffect = new Spry.Effect.Color(element, fromColor, toColor, options);
	highlightEffect.name = 'Highlight';
	var registeredEffect = SpryRegistry.getRegisteredEffect(element, highlightEffect);
	registeredEffect.start();
	return registeredEffect;	
};

Spry.Effect.Slide = function (element, options) 
{
	var element = Spry.Effect.getElement(element);

	var durationInMilliseconds = 2000;
	var doToggle = false;
	var kindOfTransition = Spry.sinusoidalTransition;
	var setupCallback = null;
	var finishCallback = null;
	var firstChildElt = Spry.Effect.Utils.getFirstChildElement(element);

	
	Spry.Effect.makeClipping(element);

	// for IE 6 on win: check if position is static or fixed -> not supported and would cause trouble
	if(/MSIE 6.0/.test(navigator.userAgent) && /Windows NT 5.1/.test(navigator.userAgent))
	{
		var pos = Spry.Effect.getStyleProp(element, 'position');
		if(pos && (pos == 'static' || pos == 'fixed'))
		{
			Spry.Effect.setStyleProp(element, 'position', 'relative');
			Spry.Effect.setStyleProp(element, 'top', '');
			Spry.Effect.setStyleProp(element, 'left', '');
		}
	}

	if(firstChildElt)
	{
		Spry.Effect.makePositioned(firstChildElt);
		Spry.Effect.makeClipping(firstChildElt);
	}

	var elementRect = Spry.Effect.getDimensions(element);
	var startOffsetPosition = new Spry.Effect.Utils.Position();
	startOffsetPosition.x = parseInt(Spry.Effect.getStyleProp(firstChildElt, "left"));
	startOffsetPosition.y = parseInt(Spry.Effect.getStyleProp(firstChildElt, "top"));
	if (!startOffsetPosition.x) startOffsetPosition.x = 0;
	if (!startOffsetPosition.y) startOffsetPosition.y = 0;

	var verticalMovePx = elementRect.height;

	var fromPos = new Spry.Effect.Utils.Position;
	fromPos.x = startOffsetPosition.x;
	fromPos.y = startOffsetPosition.y;

	var toPos = new Spry.Effect.Utils.Position;
	toPos.x = startOffsetPosition.x;
	toPos.y = startOffsetPosition.y - verticalMovePx;

	var optionFrom = options.from;
	var optionTo   = options.to;

	if (options)
	{
		if (options.duration != null) durationInMilliseconds = options.duration;

		if (options.from != null)
		{
			if (Spry.Effect.Utils.isPercentValue(options.from))
				fromPos.y = verticalMovePx * Spry.Effect.Utils.getPercentValue(options.from) / 100;
			else
				fromPos.y = Spry.Effect.Utils.getPixelValue(options.from);
		}

		if (options.to != null)
		{
			if (Spry.Effect.Utils.isPercentValue(options.to))
				toPos.y = verticalMovePx * Spry.Effect.Utils.getPercentValue(options.to) / 100;
			else
				toPos.y = Spry.Effect.Utils.getPixelValue(options.to);
		}

		if (options.toggle != null) doToggle = options.toggle;
		if (options.transition != null) kindOfTransition = options.transition;
		if (options.setup != null) setupCallback = options.setup;
		if (options.finish != null) finishCallback = options.finish;
	}

	options = {duration:durationInMilliseconds, toggle:doToggle, transition:kindOfTransition, setup: setupCallback, finish: finishCallback, from: optionFrom, to: optionTo};

	var slideEffect = new Spry.Effect.MoveSlide(element, fromPos, toPos, options);
	slideEffect.name = 'Slide';
	var registeredEffect = SpryRegistry.getRegisteredEffect(element, slideEffect);
	registeredEffect.start();
	return registeredEffect;
};


Spry.Effect.GrowShrink = function (element, options) 
{
	var element = Spry.Effect.getElement(element);
	
	Spry.Effect.makePositioned(element); // for move
	Spry.Effect.makeClipping(element);

	var startOffsetPosition = new Spry.Effect.Utils.Position();
	startOffsetPosition.x = parseInt(Spry.Effect.getStyleProp(element, "left"));
	startOffsetPosition.y = parseInt(Spry.Effect.getStyleProp(element, "top"));	
	if (!startOffsetPosition.x) startOffsetPosition.x = 0;
	if (!startOffsetPosition.y) startOffsetPosition.y = 0;
	
	var effectCluster = new Spry.Effect.Cluster;

	var dimRect = Spry.Effect.getDimensions(element);
	var originalWidth = dimRect.width;
	var originalHeight = dimRect.height;

	var durationInMilliseconds = 500;
	var doToggle = false;
	var kindOfTransition = Spry.sinusoidalTransition;

	var fromRect = new Spry.Effect.Utils.Rectangle;
	fromRect.width = 0;
	fromRect.height = 0;
	
	var toRect = new Spry.Effect.Utils.Rectangle;
	toRect.width = originalWidth;
	toRect.height = originalHeight;

	var setupCallback = null;
	var finishCallback = null;

	var doScaleContent = true;
	var optionFrom = options.from;
	var optionTo   = options.to;

	

	if (options)
	{
		if (options.duration != null) durationInMilliseconds = options.duration;
		if (options.from != null) 
		{
		if (Spry.Effect.Utils.isPercentValue(options.from))
			{
				fromRect.width = originalWidth * (Spry.Effect.Utils.getPercentValue(options.from) / 100);
				fromRect.height = originalHeight * (Spry.Effect.Utils.getPercentValue(options.from) / 100);
			}
			else
			{
				fromRect.width = Spry.Effect.Utils.getPixelValue(options.from);
				fromRect.height = Spry.Effect.Utils.getPixelValue(options.from);
			}
		}
		if (options.to != null) 
		{
			if (Spry.Effect.Utils.isPercentValue(options.to))
			{
				toRect.width = originalWidth * (Spry.Effect.Utils.getPercentValue(options.to) / 100);
				toRect.height = originalHeight * (Spry.Effect.Utils.getPercentValue(options.to) / 100);
			}
			else
			{
				toRect.width = Spry.Effect.Utils.getPixelValue(options.to);
				toRect.height = Spry.Effect.Utils.getPixelValue(options.to);
			}
		}
		if (options.toggle != null) doToggle = options.toggle;
		if (options.transition != null) kindOfTransition = options.transition;
		if (options.setup != null) setupCallback = options.setup;
		if (options.finish != null) finishCallback = options.finish;
	}

	options = {duration:durationInMilliseconds, toggle:doToggle, transition:kindOfTransition, scaleContent:doScaleContent, from: optionFrom, to: optionTo};
	var sizeEffect = new Spry.Effect.Size(element, fromRect, toRect, options);
	effectCluster.addParallelEffect(sizeEffect);

	options = {duration:durationInMilliseconds, toggle:doToggle, transition:kindOfTransition, from: optionFrom, to: optionTo};
	var fromPos = new Spry.Effect.Utils.Position;
	fromPos.x = startOffsetPosition.x + (originalWidth - fromRect.width) / 2.0;
	fromPos.y = startOffsetPosition.y + (originalHeight -fromRect.height) / 2.0;

	var toPos = new Spry.Effect.Utils.Position;
	toPos.x = startOffsetPosition.x + (originalWidth - toRect.width) / 2.0;
	toPos.y = startOffsetPosition.y + (originalHeight -toRect.height) / 2.0;

	var initialProps2 = {top: fromPos.y, left: fromPos.x};

	var moveEffect = new Spry.Effect.Move(element, fromPos, toPos, options, initialProps2);
	effectCluster.addParallelEffect(moveEffect);

	effectCluster.setup = setupCallback;
	effectCluster.finish = finishCallback;
	
	effectCluster.setToggle(doToggle);
	effectCluster.name = 'GrowShrink';

	var registeredEffect = SpryRegistry.getRegisteredEffect(element, effectCluster);
	registeredEffect.start();
	return registeredEffect;
};


Spry.Effect.Shake = function (element, options) 
{
	var element = Spry.Effect.getElement(element);

	Spry.Effect.makePositioned(element);
	

	var setupCallback = null;
	var finishCallback = null;

	if (options)
	{
		if (options.setup != null) setupCallback = options.setup;
		if (options.finish != null) finishCallback = options.finish;
	}

	var startOffsetPosition = new Spry.Effect.Utils.Position();
	startOffsetPosition.x = parseInt(Spry.Effect.getStyleProp(element, "left"));
	startOffsetPosition.y = parseInt(Spry.Effect.getStyleProp(element, "top"));	
	if (!startOffsetPosition.x) startOffsetPosition.x = 0;
	if (!startOffsetPosition.y) startOffsetPosition.y = 0;	

	var shakeEffectCluster = new Spry.Effect.Cluster();

	var fromPos = new Spry.Effect.Utils.Position;
	fromPos.x = startOffsetPosition.x + 0;
	fromPos.y = startOffsetPosition.y + 0;

	var toPos = new Spry.Effect.Utils.Position;
	toPos.x = startOffsetPosition.x + 20;
	toPos.y = startOffsetPosition.y + 0;

	options = {duration:50, toggle:false};
	var effect = new Spry.Effect.Move(element, fromPos, toPos, options);
	shakeEffectCluster.addNextEffect(effect);
	
	var fromPos = new Spry.Effect.Utils.Position;
	fromPos.x = startOffsetPosition.x + 20;
	fromPos.y = startOffsetPosition.y + 0;

	var toPos = new Spry.Effect.Utils.Position;
	toPos.x = startOffsetPosition.x + -20;
	toPos.y = startOffsetPosition.y + 0;

	options = {duration:100, toggle:false};
	var effect = new Spry.Effect.Move(element, fromPos, toPos, options);
	shakeEffectCluster.addNextEffect(effect);

	var fromPos = new Spry.Effect.Utils.Position;
	fromPos.x = startOffsetPosition.x + -20;
	fromPos.y = startOffsetPosition.y + 0;

	var toPos = new Spry.Effect.Utils.Position;
	toPos.x = startOffsetPosition.x + 20;
	toPos.y = startOffsetPosition.y + 0;

	options = {duration:100, toggle:false};
	var effect = new Spry.Effect.Move(element, fromPos, toPos, options);
	shakeEffectCluster.addNextEffect(effect);

	var fromPos = new Spry.Effect.Utils.Position;
	fromPos.x = startOffsetPosition.x + 20;
	fromPos.y = startOffsetPosition.y + 0;

	var toPos = new Spry.Effect.Utils.Position;
	toPos.x = startOffsetPosition.x + -20;
	toPos.y = startOffsetPosition.y + 0;

	options = {duration:100, toggle:false};
	var effect = new Spry.Effect.Move(element, fromPos, toPos, options);
	shakeEffectCluster.addNextEffect(effect);

	var fromPos = new Spry.Effect.Utils.Position;
	fromPos.x = startOffsetPosition.x + -20;
	fromPos.y = startOffsetPosition.y + 0;

	var toPos = new Spry.Effect.Utils.Position;
	toPos.x = startOffsetPosition.x + 20;
	toPos.y = startOffsetPosition.y + 0;

	options = {duration:100, toggle:false};
	var effect = new Spry.Effect.Move(element, fromPos, toPos, options);
	shakeEffectCluster.addNextEffect(effect);

	var fromPos = new Spry.Effect.Utils.Position;
	fromPos.x = startOffsetPosition.x + 20;
	fromPos.y = startOffsetPosition.y + 0;

	var toPos = new Spry.Effect.Utils.Position;
	toPos.x = startOffsetPosition.x + 0;
	toPos.y = startOffsetPosition.y + 0;

	options = {duration:50, toggle:false};
	var effect = new Spry.Effect.Move(element, fromPos, toPos, options);
	shakeEffectCluster.addNextEffect(effect);

	shakeEffectCluster.setup = setupCallback;
	shakeEffectCluster.finish = finishCallback;
	shakeEffectCluster.name = 'Shake';
	
	var registeredEffect = SpryRegistry.getRegisteredEffect(element, shakeEffectCluster);
	registeredEffect.start();
	return registeredEffect;
}

Spry.Effect.Squish = function (element, options) 
{
	var element = Spry.Effect.getElement(element);
	
	var durationInMilliseconds = 500;
	var doToggle = true;

	var setupCallback = null;
	var finishCallback = null;

	

	if (options)
	{
		if (options.duration != null) durationInMilliseconds = options.duration;
		if (options.toggle != null) doToggle = options.toggle;
		if (options.setup != null) setupCallback = options.setup;
		if (options.finish != null) finishCallback = options.finish;
	}

	Spry.Effect.makePositioned(element); // for move
	
	var originalRect = Spry.Effect.getDimensions(element);

	var startWidth = originalRect.width;
	var startHeight = originalRect.height;
		
	var stopWidth = 0;
	var stopHeight = 0;
	
	var fromRect = new Spry.Effect.Utils.Rectangle;
	fromRect.width = startWidth;
	fromRect.height = startHeight;
	
	var toRect = new Spry.Effect.Utils.Rectangle;
	toRect.width = stopWidth;
	toRect.height = stopHeight;
	
	var doScaleContent = true;

	options = {duration:durationInMilliseconds, toggle:doToggle, scaleContent:doScaleContent, setup: setupCallback, finish: finishCallback};

	var squishEffect = new Spry.Effect.Size(element, fromRect, toRect, options);
	squishEffect.name = 'Squish';

	var registeredEffect = SpryRegistry.getRegisteredEffect(element, squishEffect);
	registeredEffect.start();
	return registeredEffect;
};

Spry.Effect.Pulsate = function (element, options) 
{
	var element = Spry.Effect.getElement(element);
	
	var durationInMilliseconds = 400;
	var fromOpacity = 100.0;
	var toOpacity = 0.0;
	var doToggle = false;
	var kindOfTransition = Spry.linearTransition;
	var setupCallback = null;
	var finishCallback = null;

	if (options)
	{
		if (options.duration != null) durationInMilliseconds = options.duration;
		if (options.from != null) fromOpacity = options.from;
		if (options.to != null) toOpacity = options.to;
		if (options.toggle != null) doToggle = options.toggle;
		if (options.transition != null) kindOfTransition = options.transition;
		if (options.setup != null) setupCallback = options.setup;
		if (options.finish != null) finishCallback = options.finish;
	}
	options = {duration:durationInMilliseconds, toggle:doToggle, transition:kindOfTransition, setup: setupCallback, finish: finishCallback};
	fromOpacity = fromOpacity / 100.0;
	toOpacity = toOpacity / 100.0;
	
	var pulsateEffectCluster = new Spry.Effect.Cluster();
	
	var fadeEffect = new Spry.Effect.Opacity(element, fromOpacity, toOpacity, options);
	var appearEffect = new Spry.Effect.Opacity(element, toOpacity, fromOpacity, options);
	
	pulsateEffectCluster.addNextEffect(fadeEffect);
	pulsateEffectCluster.addNextEffect(appearEffect);
	pulsateEffectCluster.addNextEffect(fadeEffect);
	pulsateEffectCluster.addNextEffect(appearEffect);
	pulsateEffectCluster.addNextEffect(fadeEffect);
	pulsateEffectCluster.addNextEffect(appearEffect);
	
	pulsateEffectCluster.name = 'Pulsate';

	var registeredEffect = SpryRegistry.getRegisteredEffect(element, pulsateEffectCluster);
	registeredEffect.start();
	return registeredEffect;
};

Spry.Effect.Puff = function (element, options) 
{
	var element = Spry.Effect.getElement(element);
	
	Spry.Effect.makePositioned(element); // for move

	var setupCallback = null;
	var finishCallback = null;

	if (options)
	{
		if (options.setup != null) setupCallback = options.setup;
		if (options.finish != null) finishCallback = options.finish;
	}

	var puffEffectCluster = new Spry.Effect.Cluster;
	var durationInMilliseconds = 500;

	var originalRect = Spry.Effect.getDimensions(element);
	
	var startWidth = originalRect.width;
	var startHeight = originalRect.height;
		
	var stopWidth = startWidth * 2;
	var stopHeight = startHeight * 2;
	
	var fromRect = new Spry.Effect.Utils.Rectangle;
	fromRect.width = startWidth;
	fromRect.height = startHeight;
	
	var toRect = new Spry.Effect.Utils.Rectangle;
	toRect.width = stopWidth;
	toRect.height = stopHeight;
	
	var doScaleContent = false;
	
	options = {duration:durationInMilliseconds, toggle:false, scaleContent:doScaleContent};
	var sizeEffect = new Spry.Effect.Size(element, fromRect, toRect, options);
	puffEffectCluster.addParallelEffect(sizeEffect);

	options = {duration:durationInMilliseconds, toggle:false};
	var fromOpacity = 1.0;
	var toOpacity = 0.0;
	var opacityEffect = new Spry.Effect.Opacity(element, fromOpacity, toOpacity, options);
	puffEffectCluster.addParallelEffect(opacityEffect);

	options = {duration:durationInMilliseconds, toggle:false};
	var fromPos = new Spry.Effect.Utils.Position;
	fromPos.x = 0;
	fromPos.y = 0;
	var toPos = new Spry.Effect.Utils.Position;
	toPos.x = startWidth / 2.0 * -1.0;
	toPos.y = startHeight / 2.0 * -1.0;
	var moveEffect = new Spry.Effect.Move(element, fromPos, toPos, options);
	puffEffectCluster.addParallelEffect(moveEffect);

	puffEffectCluster.setup = setupCallback;
	puffEffectCluster.finish = finishCallback;
	puffEffectCluster.name = 'Puff';
	
	var registeredEffect = SpryRegistry.getRegisteredEffect(element, puffEffectCluster);
	registeredEffect.start();
	return registeredEffect;
};

Spry.Effect.DropOut = function (element, options) 
{
	var element = Spry.Effect.getElement(element);
	
	var dropoutEffectCluster = new Spry.Effect.Cluster;
	
	var durationInMilliseconds = 500;

	Spry.Effect.makePositioned(element);

	var setupCallback = null;
	var finishCallback = null;

	if (options)
	{
		if (options.setup != null) setupCallback = options.setup;
		if (options.finish != null) finishCallback = options.finish;
	}

	var startOffsetPosition = new Spry.Effect.Utils.Position();
	startOffsetPosition.x = parseInt(Spry.Effect.getStyleProp(element, "left"));
	startOffsetPosition.y = parseInt(Spry.Effect.getStyleProp(element, "top"));	
	if (!startOffsetPosition.x) startOffsetPosition.x = 0;
	if (!startOffsetPosition.y) startOffsetPosition.y = 0;	
	
	var fromPos = new Spry.Effect.Utils.Position;
	fromPos.x = startOffsetPosition.x + 0;
	fromPos.y = startOffsetPosition.y + 0;

	var toPos = new Spry.Effect.Utils.Position;
	toPos.x = startOffsetPosition.x + 0;
	toPos.y = startOffsetPosition.y + 160;

	options = {from:fromPos, to:toPos, duration:durationInMilliseconds, toggle:true};
	var moveEffect = new Spry.Effect.Move(element, options.from, options.to, options);
	dropoutEffectCluster.addParallelEffect(moveEffect);

	options = {duration:durationInMilliseconds, toggle:true};
	var fromOpacity = 1.0;
	var toOpacity = 0.0;
	var opacityEffect = new Spry.Effect.Opacity(element, fromOpacity, toOpacity, options);
	dropoutEffectCluster.addParallelEffect(opacityEffect);

	dropoutEffectCluster.setup = setupCallback;
	dropoutEffectCluster.finish = finishCallback;
	dropoutEffectCluster.name = 'DropOut';
	
	var registeredEffect = SpryRegistry.getRegisteredEffect(element, dropoutEffectCluster);
	registeredEffect.start();
	return registeredEffect;
};

Spry.Effect.Fold = function (element, options) 
{
	var element = Spry.Effect.getElement(element);
	
	var durationInMilliseconds = 1000;
	var doToggle = false;
	var doScaleContent = true;
	
	var foldEffectCluster = new Spry.Effect.Cluster();

	var originalRect = Spry.Effect.getDimensions(element);

	var startWidth = originalRect.width;
	var startHeight = originalRect.height;
		
	var stopWidth = startWidth;
	var stopHeight = startHeight / 5;
	
	var fromRect = new Spry.Effect.Utils.Rectangle;
	fromRect.width = startWidth;
	fromRect.height = startHeight;
	
	var toRect = new Spry.Effect.Utils.Rectangle;
	toRect.width = stopWidth;
	toRect.height = stopHeight;
	
	options = {duration:durationInMilliseconds, toggle:doToggle, scaleContent:doScaleContent};
	var sizeEffect = new Spry.Effect.Size(element, fromRect, toRect, options);
	foldEffectCluster.addNextEffect(sizeEffect);
	
	durationInMilliseconds = 500;
	options = {duration:durationInMilliseconds, toggle:doToggle, scaleContent:doScaleContent};
	fromRect.width = "100%";
	fromRect.height = "20%";
	toRect.width = "10%";
	toRect.height = "20%";
	var sizeEffect = new Spry.Effect.Size(element, fromRect, toRect, options);
	foldEffectCluster.addNextEffect(sizeEffect);
	foldEffectCluster.name = 'Fold';
	
	var registeredEffect = SpryRegistry.getRegisteredEffect(element, foldEffectCluster);
	registeredEffect.start();
	return registeredEffect;
};
