/* SpryAccordion.js - Revision: Spry Preview Release 1.1 */

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
if (!Spry.Widget) Spry.Widget = {};

Spry.Widget.Accordion = function(element)
{
	this.hoverClass = "AccordionPanelLabelHover";
	this.openClass = "";
	this.closedClass = "AccordionPanelClosed";
	this.useAnimation = true;
	this.element = this.getElement(element);
	this.currentPanel = null;
	this.attachBehaviors();
	this.panelHeight = 200;

	/* var children = this.getElementChildren(this.element);
	if (children && children.length > 0)
	{
		var panelContent = this.getPanelContent(children[0]);
		if (panelContent)
			this.panelHeight = parseInt(Spry.Utils.getStyleProperty(panelContent, "height"));
		alert(this.panelHeight);
	}*/
}

Spry.Widget.Accordion.prototype.getElement = function(ele)
{
	if (ele && typeof ele == "string")
		return document.getElementById(ele);
	return ele;
}

Spry.Widget.Accordion.prototype.addClassName = function(ele, className)
{
	if (!ele || !className || (ele.className && ele.className.search(new RegExp("\\b" + className + "\\b")) != -1))
		return;
	ele.className += (ele.className ? " " : "") + className;
};

Spry.Widget.Accordion.prototype.removeClassName = function(ele, className)
{
	if (!ele || !className || (ele.className && ele.className.search(new RegExp("\\b" + className + "\\b")) == -1))
		return;
	ele.className = ele.className.replace(new RegExp("\\s*\\b" + className + "\\b", "g"), "");
};

Spry.Widget.Accordion.prototype.onPanelLabelMouseOver = function(panel)
{
	if (panel)
		this.addClassName(this.getPanelLabel(panel), this.hoverClass);
};

Spry.Widget.Accordion.prototype.onPanelLabelMouseOut = function(panel)
{
	if (panel)
		this.removeClassName(this.getPanelLabel(panel), this.hoverClass);
};

Spry.Widget.Accordion.prototype.openPanel = function(panel)
{
	var panelA = this.currentPanel;
	var panelB = panel;

	if (!panelA || ! panelB)
		return;

	var contentA = this.getPanelContent(panelA);
	var contentB = this.getPanelContent(panelB);

	if (!contentA || ! contentB)
		return;

	if (this.useAnimation)
	{
		var self = this;
		var closedClass = this.closedClass;

		new Spry.Widget.Accordion.PanelAnimator(contentA, contentB, this.panelHeight);
	}
	else
	{
		contentA.style.display = "none";
		contentB.style.display = "block";
	}

	this.addClassName(panelA, this.closedClass);
	this.removeClassName(panelB, this.closedClass);
	this.currentPanel = panelB;
}

Spry.Widget.Accordion.prototype.onPanelClick = function(panel)
{
	if (panel == this.currentPanel)
		return;

	this.openPanel(panel);
};

Spry.Widget.Accordion.prototype.attachPanelHandlers = function(panel)
{
	if (!panel)
		return;

	var label = this.getPanelLabel(panel);

	if (label)
	{
		var self = this;
		Spry.Widget.Accordion.addEventListener(label, "click", function(e) { self.onPanelClick(panel); }, false);
		Spry.Widget.Accordion.addEventListener(label, "mouseover", function(e) { self.onPanelLabelMouseOver(panel); }, false);
		Spry.Widget.Accordion.addEventListener(label, "mouseout", function(e) { self.onPanelLabelMouseOut(panel); }, false);
	}
};

Spry.Widget.Accordion.addEventListener = function(element, eventType, handler, capture)
{
	try
	{
		if (element.addEventListener)
			element.addEventListener(eventType, handler, capture);
		else if (element.attachEvent)
			element.attachEvent("on" + eventType, handler);
	}
	catch (e) {}
};

Spry.Widget.Accordion.prototype.attachBehaviors = function()
{
	var panels = this.getElementChildren(this.element);
	for (var i = 0; i < panels.length; i++)
	{
		var content = this.getPanelContent(panels[i]);
		if (i == 0)
		{
			this.currentPanel = panels[i];
			content.style.display = "block";
		}
		else
		{
			this.addClassName(panels[i], this.closedClass);
			content.style.display = "none";
		}
		
		this.attachPanelHandlers(panels[i]);
	}
};

Spry.Widget.Accordion.prototype.getPanelLabel = function(panel)
{
	if (!panel)
		return null;
	return this.getElementChildren(panel)[0];
};

Spry.Widget.Accordion.prototype.getPanelContent = function(panel)
{
	if (!panel)
		return null;
	return this.getElementChildren(panel)[1];
};

Spry.Widget.Accordion.prototype.getElementChildren = function(element)
{
	var children = [];
	var child = element.firstChild;
	while (child)
	{
		if (child.nodeType == 1 /* Node.ELEMENT_NODE */)
			children.push(child);
		child = child.nextSibling;
	}
	return children;
};

/////////////////////////////////////////////////////

Spry.Widget.Accordion.PanelAnimator = function(elementA, elementB, h, options)
{
	Spry.Effects.Animator.call(this, options);

	this.elementA = Spry.Effects.getElement(elementA);
	this.elementB = Spry.Effects.getElement(elementB);
	this.overflowA = elementA.style.overflow;
	this.overflowB = elementB.style.overflow;

	this.elementA.style.overflow = "hidden";
	this.elementA.style.height = h + "px";
	this.elementB.style.height = "0px";
	this.elementB.style.display = "block";
	this.elementB.style.overflow = "hidden";

	this.htStop = h;
	this.htA = h;
	this.htB = 0;

	this.incrH = this.htStop / this.options.steps;
	
	this.start();
};

Spry.Widget.Accordion.PanelAnimator.prototype = new Spry.Effects.Animator();
Spry.Widget.Accordion.PanelAnimator.constructor = Spry.Widget.Accordion.PanelAnimator;

Spry.Widget.Accordion.PanelAnimator.prototype.animate = function()
{
	if (this.stepCount >= this.options.steps)
	{
		this.htA = 0;
		this.htB = this.htStop;

		this.elementA.style.display = "none";
		this.elementA.style.overflow = this.overflowA;
		this.elementB.style.overflow = this.overflowB;
	}
	else
	{
		this.htA -= this.incrH;
		this.htB += this.incrH;
	}

	this.elementA.style.height = this.htA + "px";
	this.elementB.style.height = this.htB + "px";
};

