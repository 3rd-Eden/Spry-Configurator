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

var Spry = new Object;

//////////////////////////////////////////////////////////////////////
//
// Spry.Utils
//
//////////////////////////////////////////////////////////////////////

Spry.Utils = new Object;

Spry.Utils.asyncLoadURL = function(url, data, callback)
{
	var req = null;

	if (!url || !callback)
		return;

	try
	{
		if (window.XMLHttpRequest)
		{
			try { req = new XMLHttpRequest(); }
			catch (e)
			{
				alert("Spry.Utils.asyncLoadURL failed to create an XMLHttpRequest object!");
				return;
			}
		}
		else if (window.ActiveXObject)
		{
			try { req = new ActiveXObject("Msxml2.XMLHTTP"); }
			catch (e)
			{
				try { req = new ActiveXObject("Microsoft.XMLHTTP"); }
				catch(e)
				{
					alert("Spry.Utils.asyncLoadURL failed to invoke an MS XMLHTTP ActiveXObject!");
					return;
				}
			}
		}
		else
		{
			alert("Browser does not support the XMLHttpRequest object!");
			return;
		}
	
		req.onreadystatechange = function() { callback(url, data, req); };
		req.open("GET", url, true);
		req.send(null);
	}
	catch(e) { alert("Exception caught in Spry.Utils.asyncLoadURL: " + e); }
};

Spry.Utils.addEventListener = function(element, eventType, handler, capture)
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

Spry.Utils.removeEventListener = function(element, eventType, handler, capture)
{
	try
	{
		if (element.removeEventListener)
			element.removeEventListener(eventType, handler, capture);
		else if (element.detachEvent)
			element.detachEvent("on" + eventType, handler);
	}
	catch (e) {}
};

Spry.Utils.encodeEntities = function(str)
{
	if (str)
	{
		str = str.replace(/&/g, "&amp;");
		str = str.replace(/</g, "&lt;");
		str = str.replace(/>/g, "&gt;");
		str = str.replace(/"/g, "&quot;");
	}
	return str
};

Spry.Utils.decodeEntities = function(str)
{
	var d = Spry.Utils.decodeEntities.div;
	if (!d)
	{
		d = document.createElement('div');
		Spry.Utils.decodeEntities.div = d;
		if (!d) return str;
	}
	d.innerHTML = str;
	if (d.childNodes.length == 1 && d.firstChild.nodeType == 3 /* Node.TEXT_NODE */ && d.firstChild.nextSibling == null)
		str = d.firstChild.data;
	else
	{
		// Hmmm, innerHTML processing of str produced content
		// we weren't expecting, so just replace entities we
		// expect folks will use in node attributes that contain
		// JavaScript.
		str = str.replace(/&lt;/, "<");
		str = str.replace(/&gt;/, ">");
		str = str.replace(/&quot;/, "\"");
		str = str.replace(/&amp;/, "&");
	}
	return str;
};

Spry.Utils.getStyleProperty = function(element, property)
{
	try
	{
		if (element.style[property])
			return element.style[property];
		else if (element.currentStyle)
			return element.currentStyle[property];
		else if (document.defaultView && document.defaultView.getComputedStyle)
		{
			var style = document.defaultView.getComputedStyle(element, null);
			return style.getPropertyValue(property);
		}
	}
	catch (e) {}

	return null;
};

Spry.Utils.stringToXMLDoc = function(str)
{
	var xmlDoc = null;

	try
	{
		// Attempt to parse the string using the IE method.

		var xmlDOMObj = new ActiveXObject("Microsoft.XMLDOM");
		xmlDOMObj.async = false;
		xmlDOMObj.loadXML(str);
		xmlDoc = xmlDOMObj;
	}
	catch (e)
	{
		// The IE method didn't work. Try the Mozilla way.

		try
		{
			var domParser = new DOMParser;
			xmlDoc = domParser.parseFromString(str, 'text/xml');
		}
		catch (e)
		{
			Spry.Debug.reportError("Caught exception in Spry.Utils.stringToXMLDoc(): " + e + "\n");
			xmlDoc = null;
		}
	}

	return xmlDoc;
};

Spry.Utils.getNodesByFunc = function(root, func)
{
	var nodeStack = new Array;
	var resultArr = new Array;
	var node = root;

	while (node)
	{
		if (func(node))
			resultArr.push(node);

		if (node.hasChildNodes())
		{
			nodeStack.push(node);
			node = node.firstChild;
		}
		else
		{
			if (node == root)
				node = null;
			else
				try { node = node.nextSibling; } catch (e) { node = null; };
		}
		
		while (!node && nodeStack.length > 0)
		{
			node = nodeStack.pop();
			if (node == root)
				node = null;
			else
				try { node = node.nextSibling; } catch (e) { node = null; }
		}
	}
	
	if (nodeStack && nodeStack.length > 0)
		Spry.Debug.trace("-- WARNING: Spry.Utils.getNodesByFunc() failed to traverse all nodes!\n");

	return resultArr;
};

Spry.Utils.addClassName = function(ele, className)
{
	if (!ele || !className || (ele.className && ele.className.search(new RegExp("\\b" + className + "\\b")) != -1))
		return;
	ele.className += (ele.className ? " " : "") + className;
};

Spry.Utils.removeClassName = function(ele, className)
{
	if (!ele || !className || (ele.className && ele.className.search(new RegExp("\\b" + className + "\\b")) == -1))
		return;
	ele.className = ele.className.replace(new RegExp("\\s*\\b" + className + "\\b", "g"), "");
};

Spry.Utils.propertyIsEnumerable = function(obj, prop)
{
	// The Prototype library adds functions to Object and its prototype which breaks
	// our loops that iterate over all the keys in an associative array. This is
	// a utlity method that we use to try and figure out if a given key/prop is something
	// we added or something that should be ignored. Unfortunately, propertyIsEnumerable
	// isn't defined in Safari, so we have to check for its presence before calling it.

	if (obj && prop && (!obj.propertyIsEnumerable || obj.propertyIsEnumerable(prop)))
		return true;
	return false;
};

Spry.Utils.removeAllChildren = function(node)
{
	while (node && node.firstChild)
		node.removeChild(node.firstChild);
};

Spry.Utils.getFirstChildWithNodeName = function(node, nodeName)
{
	var child = node.firstChild;

	while (child)
	{
		if (child.nodeName == nodeName)
			return child;
		child = child.nextSibling;
	} 

	return null;
};

Spry.Utils.nodeContainsElementNode = function(node)
{
	if (node)
	{
		node = node.firstChild;

		while (node)
		{
			if (node.nodeType == 1 /* Node.ELEMENT_NODE */)
				return true;

			node = node.nextSibling;
		}
	}
	return false;
};

Spry.Utils.getNodeText = function(node)
{
	var txt = "";
  
	if (!node)
		return;

	try
	{
		var child = node.firstChild;
 
		while (child)
		{
			if (child.nodeType == 3 /* TEXT_NODE */ || child.nodeType == 4 /* CDATA_SECTION_NODE */)
			{
				try { txt += child.data; } catch (e) { Spry.Debug.reportError("Spry.Utils.getNodeText() exception caught: " + e + "\n"); }
			}
			child = child.nextSibling;
		}
	}
	catch (e) { Spry.Debug.reportError("Spry.Utils.getNodeText() exception caught: " + e + "\n"); }
  
	return txt;
};

Spry.Utils.CreateObjectForNode = function(node)
{
	if (!node)
		return null;

	var obj = null;
	var i = 0;
	var attr = null;

	try
	{
		for (i = 0; i < node.attributes.length; i++)
		{
			attr = node.attributes[i];
			if (attr && attr.nodeType == 2 /* Node.ATTRIBUTE_NODE */)
			{
				if (!obj)
				{
					obj = new Object();
					if (!obj)
					{
						Spry.Debug.reportError("Spry.Utils.CreateObjectForNode(): Object creation failed!");
						return null;
					}
				}
		
				obj["@" + attr.name] = attr.value;
			}
		}
	}
	catch (e)
	{
		Spry.Debug.reportError("Spry.Utils.CreateObjectForNode() caught exception while accessing attributes: " + e + "\n");
	}
  
	var child = node.firstChild;
	
	if (child && !child.nextSibling && child.nodeType != 1 /* Node.ELEMENT_NODE */)
	{
		// We have a single child and it's not an element. It must
		// be the text value for this node. Add it to the record set and
		// give it the column the same name as the node.

		if (!obj)
		{
			obj = new Object();
			if (!obj)
			{
				Spry.Debug.reportError("Spry.Utils.CreateObjectForNode(): Object creation failed!");
				return null;
			}

			obj[node.nodeName] = Spry.Utils.getNodeText(node);
		}
	}
  
	while (child)
	{
		// Add the text value for each child element. Note that
		// We skip elements that have element children (sub-elements)
		// because we don't handle multi-level data sets right now.
	
		if (child.nodeType == 1 /* Node.ELEMENT_NODE */)
		{
			if (!Spry.Utils.nodeContainsElementNode(child))
			{
				var txt = Spry.Utils.getNodeText(child);
				if (!obj)
				{
					obj = new Object();
					if (!obj)
					{
						Spry.Debug.reportError("Spry.Utils.CreateObjectForNode(): Object creation failed!");
						return null;
					}
				}
	  
				obj[child.nodeName] = txt;

				// Now add properties for any attributes on the child. The property
				// name will be of the form "<child.nodeName>/@<attr.name>".
				try
				{
					var namePrefix = child.nodeName + "/@";
					
					for (i = 0; i < child.attributes.length; i++)
					{
						attr = child.attributes[i];
						if (attr && attr.nodeType == 2 /* Node.ATTRIBUTE_NODE */)
							obj[namePrefix + attr.name] = attr.value;
					}
				}
				catch (e)
				{
					Spry.Debug.reportError("Spry.Utils.CreateObjectForNode() caught exception while accessing attributes: " + e + "\n");
				}
        
			}
			// else Spry.Debug.trace("WARNING: Skipping '" + child.nodeName + "' node! Multi-level data sets are not supported right now!\n");
		}

		child = child.nextSibling;
	}
  
	return obj;
};

Spry.Utils.nextRecordSetID = 0;

Spry.Utils.getRecordSetFromXMLDoc = function(xmlDoc, path)
{
	if (!xmlDoc || !path)
		return null;

	var recordSet = new Object();
	recordSet.xmlDoc = xmlDoc;
	recordSet.xmlPath = path;
	recordSet.dataHash = new Array;
	recordSet.data = new Array;
	recordSet.getData = function() { return this.data; };

	// Use the XPath library to find the nodes that will
	// make up our data set. The result should be an array
	// of subtrees that we need to flatten.

	var ctx = new ExprContext(xmlDoc);
	var pathExpr = xpathParse(path);
	var e = pathExpr.evaluate(ctx);

	// XXX: Note that we should check the result type of the evaluation
	// just in case it's a boolean, string, or number value instead of
	// a node set.
  
	var nodeArray = e.nodeSetValue();

	var isDOMNodeArray = true;

	if (nodeArray && nodeArray.length > 0)
		isDOMNodeArray = nodeArray[0].nodeType != 2 /* Node.ATTRIBUTE_NODE */;

	// We now have the set of nodes that make up our data set
	// so process each one.

	for (var i = 0; i < nodeArray.length; i++)
	{
		var rowObj = null;
	
		if (isDOMNodeArray)
			rowObj = Spry.Utils.CreateObjectForNode(nodeArray[i]);
		else // Must be a Node.ATTRIBUTE_NODE array.
		{
			rowObj = new Object;
			rowObj["@" + nodeArray[i].name] = nodeArray[i].value;
		}
	
		if (rowObj)
		{
			// We want to make sure that every row has a unique ID and since we
			// we don't know which column, if any, in this recordSet is a unique
			// identifier, we generate a unique ID ourselves and store it under
			// the ds_RowID column in the row object.

			rowObj['ds_RowID'] = Spry.Utils.nextRecordSetID++;
			recordSet.dataHash[rowObj['ds_RowID']] = rowObj;
			recordSet.data.push(rowObj);
		}
	}
  
	return recordSet;
};

Spry.Utils.setOptions = function(obj, optionsObj)
{
	if (!optionsObj)
		return;

	for (var optionName in optionsObj)
	{
		if (!Spry.Utils.propertyIsEnumerable(optionsObj, optionName))
			continue;
		obj[optionName] = optionsObj[optionName];
	}
};

Spry.Utils.SelectionManager = new Object;
Spry.Utils.SelectionManager.selectionGroups = new Array;

Spry.Utils.SelectionManager.SelectionGroup = function()
{
	this.selectedElements = new Array;
};

Spry.Utils.SelectionManager.SelectionGroup.prototype.select = function(element, className, multiSelect)
{
	var selObj = null;

	if (!multiSelect)
	{
		// Multiple selection is not enabled, so clear any
		// selected elements from our list.

		this.clearSelection();
	}
	else
	{
		// Multiple selection is enabled, so check to see if element
		// is already in the array. If it is, make sure the className
		// is the className that was passed in.

		for (var i = 0; i < this.selectedElements.length; i++)
		{
			selObj = this.selectedElements[i].element;

			if (selObj.element == element)
			{
				if (selObj.className != className)
				{
					Spry.Utils.removeClassName(element, selObj.className);
					Spry.Utils.addClassName(element, className);
				}
				return;
			}
		}
	}

	// Add the element to our list of selected elements.

	selObj = new Object;
	selObj.element = element;
	selObj.className = className;
	this.selectedElements.push(selObj);
	Spry.Utils.addClassName(element, className);
};

Spry.Utils.SelectionManager.SelectionGroup.prototype.unSelect = function(element)
{
	for (var i = 0; i < this.selectedElements.length; i++)
	{
		var selObj = this.selectedElements[i].element;
	
		if (selObj.element == element)
		{
			Spry.Utils.removeClassName(selObj.element, selObj.className);
			return;
		}
	}
};

Spry.Utils.SelectionManager.SelectionGroup.prototype.clearSelection = function()
{
	var selObj = null;

	do
	{
		selObj = this.selectedElements.shift();
		if (selObj)
			Spry.Utils.removeClassName(selObj.element, selObj.className);
	}
	while (selObj);
};

Spry.Utils.SelectionManager.getSelectionGroup = function(selectionGroupName)
{
	if (!selectionGroupName)
		return null;

	var groupObj = Spry.Utils.SelectionManager.selectionGroups[selectionGroupName];

	if (!groupObj)
	{
		groupObj = new Spry.Utils.SelectionManager.SelectionGroup();
		Spry.Utils.SelectionManager.selectionGroups[selectionGroupName] = groupObj;
	}

	return groupObj;
};

Spry.Utils.SelectionManager.select = function(selectionGroupName, element, className, multiSelect)
{
	var groupObj = Spry.Utils.SelectionManager.getSelectionGroup(selectionGroupName);

	if (!groupObj)
		return;

	groupObj.select(element, className, multiSelect);
};

Spry.Utils.SelectionManager.unSelect = function(selectionGroupName, element)
{
	var groupObj = Spry.Utils.SelectionManager.getSelectionGroup(selectionGroupName);

	if (!groupObj)
		return;

	groupObj.unSelect(element, className);
};

Spry.Utils.SelectionManager.clearSelection = function(selectionGroupName)
{
	var groupObj = Spry.Utils.SelectionManager.getSelectionGroup(selectionGroupName);

	if (!groupObj)
		return;

	groupObj.clearSelection();
};

//////////////////////////////////////////////////////////////////////
//
// Spry.Debug
//
//////////////////////////////////////////////////////////////////////

Spry.Debug = new Object;
Spry.Debug.enableTrace = true;
Spry.Debug.debugWindow = null;

Spry.Debug.createDebugWindow = function()
{
	if (!Spry.Debug.enableTrace || Spry.Debug.debugWindow)
		return;
	try
	{
		Spry.Debug.debugWindow = document.createElement("div");
		var div = Spry.Debug.debugWindow;
		div.style.fontSize = "12px";
		div.style.fontFamily = "console";
		div.style.position = "absolute";
		div.style.width = "400px";
		div.style.height = "300px";
		div.style.overflow = "auto";
		div.style.border = "solid 1px black";
		div.style.backgroundColor = "white";
		div.style.color = "black";
		div.style.bottom = "0px";
		div.style.right = "0px";
		// div.style.opacity = "0.5";
		// div.style.filter = "alpha(opacity=50)";
		div.setAttribute("id", "SpryDebugWindow");
		document.body.appendChild(Spry.Debug.debugWindow);
	}
	catch (e) {}
};

Spry.Debug.debugOut = function(str, bgColor)
{
	if (!Spry.Debug.debugWindow)
	{
		Spry.Debug.createDebugWindow();
		if (!Spry.Debug.debugWindow)
			return;
	}

	var d = document.createElement("div");
	if (bgColor)
		d.style.backgroundColor = bgColor;
	d.innerHTML = str;
	Spry.Debug.debugWindow.appendChild(d);	
};

Spry.Debug.trace = function(str)
{
	Spry.Debug.debugOut(str);
};

Spry.Debug.reportError = function(str)
{
	Spry.Debug.debugOut(str, "red");
};

//////////////////////////////////////////////////////////////////////
//
// Spry.Data
//
//////////////////////////////////////////////////////////////////////

Spry.Data = new Object;
Spry.Data.regionsArray = new Array;

Spry.Data.initRegions = function(rootNode)
{
	if (!rootNode)
		rootNode = document.body;

	var regions = Spry.Utils.getNodesByFunc(rootNode, function(node)
	{
		try
		{
			// Region elements must have an spryregion attribute with a
			// non-empty value. An id attribute is also required so we can
			// reference the region by name if necessary.

			var attrName = "spryregion";
			var attr = node.attributes.getNamedItem(attrName);
			if (!attr)
			{
				attrName = "sprydetailregion";
				attr = node.attributes.getNamedItem(attrName);
			}
			if (attr && attr.value)
			{
				attr = node.attributes.getNamedItem("id");
				if (!attr || !attr.value)
				{
					// The node is missing an id attribute so add one.
					node.setAttribute("id", "spryregion" + (++Spry.Data.initRegions.nextUniqueRegionID));
				}

				return true;
			}
		}
		catch(e) {}
		return false;
	});

	var name, dataSets, odcFlags, i;
  
	for (i = 0; i < regions.length; i++)
	{	
		odcFlags = Spry.Data.DataSet.ODC_DataChanged | Spry.Data.DataSet.ODC_SortOrderChanged;

		// Get the region name.
		name = regions[i].attributes.getNamedItem("id").value;

		attr = regions[i].attributes.getNamedItem("spryregion");
		if (!attr)
		{
			attr = regions[i].attributes.getNamedItem("sprydetailregion");
			odcFlags |= Spry.Data.DataSet.ODC_CurrentRowChanged;
		}

		if (!attr.value)
		{
			Spry.Debug.reportError("spryregion and sprydetailregion attributes require one or more data set names as values!");
			continue;
		}
	
		// Get the DataSets that should be bound to the region.
		dataSets = Spry.Data.Region.strToDataSetsArray(attr.value);
	
		if (!dataSets.length)
		{
			Spry.Debug.reportError("spryregion or sprydetailregion attribute has no data set!");
			continue;
		}
	
		// Get the region onDataChanged flags attribute if it exists.
		// The format of the attribute value is a set of flag names that must
		// match the names of the Spry.Data.DataSet.ODC_* constants,
		// separated by commas.
		attr =  regions[i].attributes.getNamedItem("spryregionobserves");
		if (attr)
		{
			odcFlags = 0;
			if (attr.value)
			{
				// Clean up the attribute value before we use it.
				var flagStr = attr.value;
				flagStr = flagStr.replace(/\s/g, "");
				flagStr = flagStr.replace(/^,*|,*$/g, "");
				if (flagStr)
				{
					// Now split the list at the comma separator and build up
					// a string that we can eval to get our flag value.
					var flagNames = flagStr.split(",");
					flagStr = "";
					for (k = 0; k < flagNames.length; k++)
					{
						if (k != 0)
							flagStr += "|";
						flagStr += "Spry.Data.DataSet.ODC_" + flagNames[k];
					}
					if (flagStr)
					{
						try { odcFlags = eval(flagStr); }
						catch(e) { Spry.Debug.reportError("Exception caught while parsing spryregionobserves attribute: " + e + "\n"); }
					}
				}
			}
		}

		var parent = null;
		var hasBehaviorAttributes = false;

		// Find all of the processing instruction regions in the region.
		// Insert comments around the regions we find so we can identify them
		// easily when tokenizing the region html string.

		var piRegions = Spry.Utils.getNodesByFunc(regions[i], function(node)
		{
			try
			{
				if (node.nodeType == 1 /* ELEMENT_NODE */)
				{
					var attributes = node.attributes;
					for (var piName in Spry.Data.Region.processingInstructions)
					{
						if (!Spry.Utils.propertyIsEnumerable(Spry.Data.Region.processingInstructions, piName))
							continue;
	
						var attr = attributes.getNamedItem(piName);
						if (!attr)
							continue;
	
						var piDesc = Spry.Data.Region.processingInstructions[piName];
						var openTag = piDesc.getOpenTag(node, piName);
						var closeTag = piDesc.getCloseTag(node, piName);
	
						if (piDesc.childrenOnly)
						{
							if (node.firstChild)
							{
								node.insertBefore(document.createComment(openTag), node.firstChild);
								node.appendChild(document.createComment(closeTag));
							}
						}
						else
						{
							var parent = node.parentNode;
							parent.insertBefore(document.createComment(openTag), node);
							parent.insertBefore(document.createComment(closeTag), node.nextSibling);
						}
	
						node.removeAttribute(piName);
					}

					if (!hasBehaviorAttributes && Spry.Data.Region.enableBehaviorAttributes)
					{
						for (var behaviorAttrName in Spry.Data.Region.behaviorAttrs)
						{
							if (Spry.Utils.propertyIsEnumerable(Spry.Data.Region.behaviorAttrs, behaviorAttrName) && attributes.getNamedItem(behaviorAttrName))
							{
								hasBehaviorAttributes = true;
								break;
							}
						}
					}
				}
			}
			catch(e) {}
			return false;
		});
	
		// Get the data in the region.
		var dataStr = regions[i].innerHTML;

		// Clear the region.
		Spry.Utils.removeAllChildren(regions[i]);
	
		// Create a Spry.Data.Region object for this region.
		var region = new Spry.Data.Region(regions[i], name, dataStr, dataSets, hasBehaviorAttributes, odcFlags);
		Spry.Data.regionsArray[region.name] = region;
	}

	Spry.Data.updateAllRegions();
};

Spry.Data.initRegions.nextUniqueRegionID = 0;

Spry.Data.updateRegion = function(regionName)
{
	if (!regionName || !Spry.Data.regionsArray || !Spry.Data.regionsArray[regionName])
		return;

	try { Spry.Data.regionsArray[regionName].updateContent(); }
	catch(e) { Spry.Debug.reportError("Spry.Data.updateRegion(" + regionName + ") caught an exception: " + e + "\n"); }
};

Spry.Data.getRegion = function(regionName)
{
	return Spry.Data.regionsArray[regionName];
};


Spry.Data.updateAllRegions = function()
{
	if (!Spry.Data.regionsArray)
		return;

	for (var regionName in Spry.Data.regionsArray)
	{
		if (Spry.Utils.propertyIsEnumerable(Spry.Data.regionsArray, regionName))
			Spry.Data.updateRegion(regionName);
	}
};

//////////////////////////////////////////////////////////////////////
//
// Spry.Data.DataSet
//
//////////////////////////////////////////////////////////////////////

Spry.Data.DataSet = function()
{
	this.name = "";
	this.internalID = Spry.Data.DataSet.nextDataSetID++;
	this.curRowID = 0;
	this.data = null;
	this.dataHash = null;
	this.columnTypes = new Array;
	this.dataChangedObservers = new Array;
	this.filterFunc = null;

	this.distinctOnLoad = false;
	this.sortOnLoad = null;
	
	this.dataWasLoaded = false;
	this.pendingRequest = null;
};

Spry.Data.DataSet.prototype.getData = function()
{
	return this.data;
};

Spry.Data.DataSet.prototype.getLoadDataRequestIsPending = function()
{
	return this.pendingRequest != null;
};

Spry.Data.DataSet.prototype.getDataWasLoaded = function()
{
	return this.dataWasLoaded;
};

Spry.Data.DataSet.prototype.loadData = function()
{
	// The idea here is that folks using the base class DataSet directly
	// would change the data in the DataSet manually and then call loadData()
	// to fire off an async notifications to say that it was ready for consumption.
	//
	// Firing off data changed notificataions synchronously from this method
	// can wreak havoc with complicated master/detail regions that use data sets
	// that have master/detail relationships with other data sets. Our data set
	// logic already handles async data loading nicely so we use a timer to fire
	// off the data changed notification to insure that it happens after this
	// function is finished and the JS stack unwinds.
	//
	// Other classes that derive from this class and load data synchronously
	// inside their loadData() implementation should also fire off an async
	// notification in this same manner to avoid this same problem.

	var selfClosureRef = this;

	this.pendingRequest = new Object;
	this.dataWasLoaded = false;
	this.pendingRequest.timer = setTimeout(function()
	{
		selfClosureRef.pendingRequest = null;
		selfClosureRef.dataWasLoaded = true;

		if (selfClosureRef.filterFunc)
			selfClosureRef.filter(selfClosureRef.filterFunc);

		if (selfClosureRef.distinctOnLoad)
			selfClosureRef.distinct();
	
		if (selfClosureRef.sortOnLoad)
			selfClosureRef.sort(selfClosureRef.sortOnLoad);
	
		selfClosureRef.notifyOnDataChangedObservers(selfClosureRef, Spry.Data.DataSet.ODC_DataChanged);
	}, 0);  
};

Spry.Data.DataSet.prototype.cancelLoadData = function()
{
	if (this.pendingRequest && this.pendingRequest.timer)
		clearTimeout(this.pendingRequest.timer);
	this.pendingRequest = null;
};

Spry.Data.DataSet.prototype.getCurrentRow = function()
{
	if (!this.data)
		return null;
	return this.dataHash[this.curRowID];
};

Spry.Data.DataSet.prototype.setCurrentRow = function(rowID)
{
	if (this.curRowID == rowID)
		return;
	this.curRowID = rowID;

	this.notifyOnDataChangedObservers(Spry.Data.DataSet.ODC_CurrentRowChanged);
};

Spry.Data.DataSet.prototype.setCurrentRowNumber = function(rowNumber)
{
	if (!this.data || rowNumber >= this.data.length)
	{
		Hanzo.Debug.trace("Invalid row number: " + rowNumber + "\n");
		return;
	}

	var rowID = this.data[rowNumber]["ds_RowID"];

	if (rowID == undefined || this.curRowID == rowID)
		return;
	this.curRowID = rowID;

	this.notifyOnDataChangedObservers(Spry.Data.DataSet.ODC_CurrentRowChanged);
};

Spry.Data.DataSet.prototype.addDataChangedObserver = function(id, observer)
{
	this.dataChangedObservers[id] = observer;
};
  
Spry.Data.DataSet.prototype.removeDataChangedObserver = function(id)
{
	// XXX: Find out if there is any way to unset a property when
	// using string indexes.
	this.dataChangedObservers[id] = undefined;
};

Spry.Data.DataSet.prototype.notifyOnDataChangedObservers = function(odcType)
{
	for (var id in this.dataChangedObservers)
	{
		if (Spry.Utils.propertyIsEnumerable(this.dataChangedObservers, id) && this.dataChangedObservers[id])
			this.dataChangedObservers[id].onDataChanged(this, odcType);
	}
};

Spry.Data.DataSet.prototype.setColumnType = function(columnName, columnType)
{
	if (columnName)
		this.columnTypes[columnName] = columnType;
};

Spry.Data.DataSet.prototype.getColumnType = function(columnName)
{
	if (this.columnTypes[columnName])
		return this.columnTypes[columnName];
	return "string";
};

Spry.Data.DataSet.prototype.distinct = function()
{
	if (this.data)
	{
		var oldData = this.data;
		this.data = new Array;
		this.dataHash = new Array;

		var alreadySeenHash = [];
		var i = 0;

		for (var i = 0; i < oldData.length; i++)
		{
			var rec = oldData[i];
			var hashStr = "";
			for (var recField in rec)
			{
				if (Spry.Utils.propertyIsEnumerable(rec, recField) && recField != "ds_RowID")
				{
					if (hashStr)
						hashStr += ",";
					hashStr += recField + ":" + "\"" + rec[recField] + "\"";
				}
			}
			if (!alreadySeenHash[hashStr])
			{
				this.data.push(rec);
				this.dataHash[rec['ds_RowID']] = rec;
				alreadySeenHash[hashStr] = true;
			}
		}
	}
};

Spry.Data.DataSet.prototype.sort = function(columnName)
{
	if (!columnName)
		return;

	var sortfunc = function(a, b){ return (a[columnName] < b[columnName]) ? -1 : ((a[columnName] > b[columnName]) ? 1 : 0) };
	if (this.getColumnType(columnName) == "number")
		sortfunc = function(a, b){ return a[columnName]-b[columnName]; };
	else if (this.getColumnType(columnName) == "date")
		sortfunc = function(a, b)
		{
			var dA = a[columnName];
			var dB = b[columnName];			
			dA = dA ? (new Date(dA)) : 0;
			dB = dB ? (new Date(dB)) : 0;
			return dA - dB;
		};

	this.data.sort(sortfunc);

	this.notifyOnDataChangedObservers(Spry.Data.DataSet.ODC_SortOrderChanged);
};

Spry.Data.DataSet.prototype.filter = function(filterFunc)
{
	if (filterFunc && this.dataWasLoaded && this.data && this.data.length)
	{
		var oldData = this.data;
		this.data = new Array;
		this.dataHash = new Array;

		for (var i = 0; i < oldData.length; i++)
		{
			var row = oldData[i];
			if (filterFunc(row))
			{
				this.data.push(row);
				this.dataHash[row['ds_RowID']] = row;
			}
		}

		if (this.filterFunc != filterFunc)
			this.notifyOnDataChangedObservers(Spry.Data.DataSet.ODC_DataChanged);
	}
};

Spry.Data.DataSet.nextDataSetID = 0;

// onDataChanged callback constants:
Spry.Data.DataSet.ODC_DataChanged			= 0x01;
Spry.Data.DataSet.ODC_CurrentRowChanged		= 0x02;
Spry.Data.DataSet.ODC_SortOrderChanged		= 0x04;
Spry.Data.DataSet.ODC_All					= 0x0F;

//////////////////////////////////////////////////////////////////////
//
// Spry.Data.XMLDataSet
//
//////////////////////////////////////////////////////////////////////

Spry.Data.XMLDataSet = function(dataSetURL, dataSetPath, dataSetOptions)
{
	// Call the constructor for our DataSet base class so that
	// our base class properties get defined. We'll call setOptions
	// manually after we set up our XMLDataSet properties.

	Spry.Data.DataSet.call(this);
	
	// XMLDataSet Properties:

	this.url = dataSetURL;
	this.xpath = dataSetPath;
	this.doc = null;
	this.dataSetsForDataRefStrings = new Array;
	this.hasDataRefStrings = false;
	this.useCache = true;

	Spry.Utils.setOptions(this, dataSetOptions);
	
	this.recalculateDataSetDependencies();
}; // End of Spry.Data.XMLDataSet() constructor.

Spry.Data.XMLDataSet.prototype = new Spry.Data.DataSet();
Spry.Data.XMLDataSet.prototype.constructor = Spry.Data.XMLDataSet;

Spry.Data.XMLDataSet.prototype.recalculateDataSetDependencies = function()
{
	this.hasDataRefStrings = false;

	if (!this.url)
		return;

	// Clear all old callbacks that may have been registered.

	var i = 0;
	for (i = 0; i < this.dataSetsForDataRefStrings.length; i++)
	{
		var ds = this.dataSetsForDataRefStrings[i];
		if (ds)
			ds.removeDataChangedObserver("autoDetailCallback-" + this.internalID);
	}

	// Now run through the strings that may contain data references and figure
	// out what data sets they require. Note that the data references in these
	// strings must be fully qualified with a data set name. (ex: {dsDataSetName::columnName})

	this.dataSetsForDataRefStrings = new Array();

	var regionStrs = [ this.url, this.xpath ];
	var dsCount = 0;

	for (var n = 0; n < regionStrs.length; n++)
	{
		var tokens = Spry.Data.Region.getTokensFromStr(regionStrs[n]);

		for (i = 0; tokens && i < tokens.length; i++)
		{
			if (tokens[i].search(/{[^}:]+::[^}]+}/) != -1)
			{
				var dsName = tokens[i].replace(/^\{|::.*\}/g, "");
				var ds = null;
				if (!this.dataSetsForDataRefStrings[dsName])
				{
					try { ds = eval(dsName); } catch (e) { ds = null; }
	
					if (dsName && ds)
					{
						// The dataSetsForDataRefStrings array serves as both an
						// array of data sets and a hash lookup by name.

						this.dataSetsForDataRefStrings[dsName] = ds;
						this.dataSetsForDataRefStrings[dsCount++] = ds;
						this.hasDataRefStrings = true;
					}
				}
			}
		}
	}

	// Set up observers on any data sets our URL depends on.

	for (i = 0; i < this.dataSetsForDataRefStrings.length; i++)
	{
		var ds = this.dataSetsForDataRefStrings[i];
		var selfClosureRef = this;
		ds.addDataChangedObserver("autoDetailCallback-" + this.internalID,
		{
			onDataChanged: function(ds, changeType)
			{
				if (changeType != Spry.Data.DataSet.ODC_CurrentRowChanged && changeType != Spry.Data.DataSet.ODC_DataChanged)
					return;

				// We only want to trigger a load when all of our data sets have data!

				var haveAllData = true;
				for (var i = 0; i < selfClosureRef.dataSetsForDataRefStrings.length; i++)
				{
					var ds = selfClosureRef.dataSetsForDataRefStrings[i];
					if (ds.getLoadDataRequestIsPending() || !ds.getDataWasLoaded())
						return;
				}

				selfClosureRef.loadData();
			}
		});
	}
};

Spry.Data.XMLDataSet.prototype.loadData = function()
{
	if (!this.url || !this.xpath)
		return;

	this.cancelLoadData();

	var url = this.url;
	if (this.hasDataRefStrings)
	{
		var allDataSetsReady = true;

		for (var i = 0; i < this.dataSetsForDataRefStrings.length; i++)
		{
			var ds = this.dataSetsForDataRefStrings[i];
			if (ds.getLoadDataRequestIsPending())
				allDataSetsReady = false;
			else if (!ds.getDataWasLoaded())
			{
				// Kick off the load of this data set!
				ds.loadData();
				allDataSetsReady = false;
			}
		}

		// If our data sets aren't ready, just return. We'll
		// get called back to load our data when they are all
		// done.

		if (!allDataSetsReady)
			return;

		url = Spry.Data.Region.processDataRefString(null, this.url, this.dataSetsForDataRefStrings);
		if (!url)
			return;
	}

	this.data = null;
	this.dataHash = null;
	this.curRowID = 0;

	this.pendingRequest = new Object;
	this.pendingRequest.data = Spry.Data.XMLDataSet.LoadManager.loadData(url, this, this.useCache);
};

Spry.Data.XMLDataSet.prototype.cancelLoadData()
{
	if (this.pendingRequest)
	{
		Spry.Data.XMLDataSet.LoadManager.cancelLoadData(this.url, this);
		this.pendingRequest = null;
	}
}

Spry.Data.XMLDataSet.prototype.getURL = function() { return this.url; };
Spry.Data.XMLDataSet.prototype.setURL = function(url)
{
	if (this.url == url)
		return;
	this.url = url;
	this.cancelLoadData();
	this.recalculateDataSetDependencies();
	this.dataWasLoaded = false;
};
Spry.Data.XMLDataSet.prototype.getDocument = function() { return this.doc; };
Spry.Data.XMLDataSet.prototype.getXPath = function() { return this.xpath; };
Spry.Data.XMLDataSet.prototype.setXPath = function(path)
{
	if (this.xpath != path)
	{
		this.xpath = path;
		if (this.dataWasLoaded && this.doc)
			this.setDataFromDoc(this.doc);
	}
};

Spry.Data.XMLDataSet.prototype.setDataFromDoc = function(doc)
{
	this.pendingRequest = null;

	var rs = null;

	rs = Spry.Utils.getRecordSetFromXMLDoc(doc, Spry.Data.Region.processDataRefString(null, this.xpath, this.dataSetsForDataRefStrings));

	if (!rs)
	{
		Spry.Debug.reportError("Spry.Data.XMLDataSet.setDataFromDoc() failed to create dataSet '" + this.name + "'for '" + this.xpath + "' - " + this.url + "\n");
		return;
	}

	this.doc = rs.xmlDoc;
	this.data = rs.data;
	this.dataHash = rs.dataHash;
	this.dataWasLoaded = (this.doc != null);

	// If the distinct flag was set, run through all the records in the recordset
	// and toss out any that are duplicates.

	if (this.distinctOnLoad)
		this.distinct();

	// If sortOnLoad was set, sort the data based on the columns
	// specified in sortOnLoad.

	if (this.sortOnLoad)
		this.sort(this.sortOnLoad);

	// The default "current" row is the first row of the data set.
	if (this.data && this.data.length > 0)
		this.curRowID = this.data[0]['ds_RowID'];
	else
		this.curRowID = 0;

	this.notifyOnDataChangedObservers(Spry.Data.DataSet.ODC_DataChanged);
};

Spry.Data.XMLDataSet.LoadManager = new Object;
Spry.Data.XMLDataSet.LoadManager.cache = [];

Spry.Data.XMLDataSet.LoadManager.CachedRequest = function(url)
{
	this.url = url;
	this.doc = null;
	this.observers = [];
	this.timer = null;
	this.state = Spry.Data.XMLDataSet.LoadManager.CachedRequest.NOT_LOADED;
};

Spry.Data.XMLDataSet.LoadManager.CachedRequest.NOT_LOADED      = 1;
Spry.Data.XMLDataSet.LoadManager.CachedRequest.LOAD_REQUESTED  = 2;
Spry.Data.XMLDataSet.LoadManager.CachedRequest.LOAD_FAILED     = 3;
Spry.Data.XMLDataSet.LoadManager.CachedRequest.LOAD_SUCCESSFUL = 4;

Spry.Data.XMLDataSet.LoadManager.CachedRequest.prototype.addObserver = function(ds)
{
	// Check if the data set is already registered.
	for (var i = 0; i < this.observers.length; i++)
	{
		if (this.observers[i] == ds)
			return;
	}

	// It isn't, so add it.
	this.observers.push(ds);
};

Spry.Data.XMLDataSet.LoadManager.CachedRequest.prototype.removeObserver = function(ds)
{
	// Check if the data set is registered. If it is,
	// remove it from the observer array.
	for (var i = 0; i < this.observers.length; i++)
	{
		if (this.observers[i] == ds)
		{
			this.observers.splice(i, 1);
			return;
		}
	}
};

Spry.Data.XMLDataSet.LoadManager.CachedRequest.prototype.loadDataCallback = function(url, data, req)
{
	if (req.readyState != 4)
		return;

	var xmlDoc = req.responseXML;

	if (req.status != 200)
	{
		if (req.status == 0)
		{
			// The page that is attempting to load data was probably loaded with
			// a file:// url. Mozilla based browsers will actually provide the complete DOM
			// tree for the data, but IE provides an empty document node so try to parse
			// the xml text manually to create a dom tree we can use.

			if (req.responseText && (!xmlDoc || !xmlDoc.firstChild))
				xmlDoc = Spry.Utils.stringToXMLDoc(req.responseText);
		}

		if (!xmlDoc)
		{
			this.state = Spry.Data.XMLDataSet.LoadManager.CachedRequest.LOAD_FAILED;
			Spry.Debug.reportError("Spry.Data.XMLDataSet.LoadManager.CachedRequest.loadDataCallback(" + req.status + ") failed to load: " + url + "\n");
			return;
		}
	}

	this.doc = xmlDoc;
	this.state = Spry.Data.XMLDataSet.LoadManager.CachedRequest.LOAD_SUCCESSFUL;

	// Notify all of the cached request's observers!
	for (var i = 0; i < this.observers.length; i++)
		this.observers[i].setDataFromDoc(this.doc);

	// Clear the observers list.
	this.observers.length = 0;
};

Spry.Data.XMLDataSet.LoadManager.CachedRequest.prototype.loadData = function()
{
	// IE will synchronously fire our loadDataCallback() during the call
	// to Spry.Utils.asyncLoadURL() if the data for the url is already
	// in the browser's local cache. This can wreak havoc with complicated master/detail
	// regions that use data sets that have master/detail relationships with other
	// data sets. Our data set logic already handles async data loading nicely so we
	// use a timer to fire off the Spry.Utils.asyncLoadURL() call to insure that any
	// data loading happens asynchronously after this function is finished.

	var self = this;
	this.cancelLoadData();
	this.doc = null;
	this.state = Spry.Data.XMLDataSet.LoadManager.CachedRequest.LOAD_REQUESTED;
	this.timer = setTimeout(function()
	{
		self.timer = null;
		Spry.Utils.asyncLoadURL(self.url, null, function(url, data, callback) { self.loadDataCallback(url, data, callback); });
	}, 0);  
};

Spry.Data.XMLDataSet.LoadManager.CachedRequest.prototype.cancelLoadData = function()
{
	if (this.state == Spry.Data.XMLDataSet.LoadManager.CachedRequest.LOAD_REQUESTED)
	{
		if (this.timer)
		{
			this.timer.clearTimeout();
			this.timer = null;
		}

		this.doc = null;
		this.state = Spry.Data.XMLDataSet.LoadManager.CachedRequest.NOT_LOADED;
	}
};

Spry.Data.XMLDataSet.LoadManager.loadData = function(url, ds, useCache)
{
	if (!url)
		return null;

	var cacheObj = null;

	if (useCache)
		cacheObj = Spry.Data.XMLDataSet.LoadManager.cache[url];

	if (cacheObj)
	{
		if (cacheObj.state == Spry.Data.XMLDataSet.LoadManager.CachedRequest.LOAD_REQUESTED)
		{
			if (ds)
				cacheObj.addObserver(ds);
			return cacheObj;
		}
		else if (cacheObj.state == Spry.Data.XMLDataSet.LoadManager.CachedRequest.LOAD_SUCCESSFUL)
		{
			// Data is already cached so if we have a data set, trigger an async call
			// that tells it to load its data.
			if (ds)
				setTimeout(function() { ds.setDataFromDoc(cacheObj.doc); }, 0);
			return cacheObj;
		}
	}

	// We're either loading this url for the first time, or an error occurred when
	// we last tried to load it, or the caller requested a forced load.

	if (!cacheObj)
	{
		cacheObj = new Spry.Data.XMLDataSet.LoadManager.CachedRequest(url);
		if (useCache)
			Spry.Data.XMLDataSet.LoadManager.cache[url] = cacheObj;
	}

	if (ds)
		cacheObj.addObserver(ds);
	cacheObj.loadData();

	return cacheObj;
};

Spry.Data.XMLDataSet.LoadManager.cancelLoadData = function(url, ds)
{
	var cacheObj = Spry.Data.XMLDataSet.LoadManager.cache[url];
	if (cacheObj)
	{
		if (ds)
			cacheObj.removeListener(ds);
		else
			cacheObj.cancelLoadData();
	}
};

//////////////////////////////////////////////////////////////////////
//
// Spry.Data.Region
//
//////////////////////////////////////////////////////////////////////
 
Spry.Data.Region = function(regionNode, name, data, dataSets, hasBehaviorAttributes, odcFlags)
{
	this.regionNode = regionNode;
	this.name = name;
	this.data = data;
	this.dataSets = dataSets;
	this.odcFlags = odcFlags;
	this.hasBehaviorAttributes = hasBehaviorAttributes;
	this.tokens = null;

	// Add the region as an observer to the dataSet!
	for (var i = 0; i < this.dataSets.length; i++)
	{
		var ds = this.dataSets[i];

		try 
		{
			if (ds)
				ds.addDataChangedObserver(this.name, this);
		}
		catch(e) { Spry.Debug.reportError("Failed to add '" + this.name + "' as a dataSet observer!\n"); }
	}
}; // End of Spry.Data.Region() constructor.

Spry.Data.Region.prototype.getDataSets = function()
{
	return this.dataSets;
};

Spry.Data.Region.prototype.addDataSet = function(aDataSet)
{
	if (!aDataSet)
		return;

	if (!this.dataSets)
		this.dataSets = new Array;

	// Check to see if the data set is already in our list.

	for (var i = 0; i < this.dataSets.length; i++)
	{
		if (this.dataSets[i] == aDataSet)
			return; // It's already in our list!
	}

	this.dataSets.push(aDataSet);
	aDataSet.addDataChangedObserver(this.name, this);
};

Spry.Data.Region.prototype.removeDataSet = function(aDataSet)
{
	if (!aDataSet || this.dataSets)
		return;

	for (var i = 0; i < this.dataSets.length; i++)
	{
		if (this.dataSets[i] == aDataSet)
		{
			this.dataSets.splice(i, 1);
			aDataSet.removeDataChangedObserver(this.name);
			return;
		}
	}
};

Spry.Data.Region.prototype.onDataChanged = function(dataSet, odcType)
{
	if (this.odcFlags & odcType)
		this.updateContent();
};

Spry.Data.Region.enableBehaviorAttributes = true;
Spry.Data.Region.behaviorAttrs = new Array;

Spry.Data.Region.behaviorAttrs["spryselect"] =
{
	attach: function(node, value)
	{
		var selectGroupName = null;
		try { selectGroupName = node.attributes.getNamedItem("spryselectgroup").value; } catch (e) {}
		if (!selectGroupName)
			selectGroupName = "default";

		Spry.Utils.addEventListener(node, "click", function(event) { Spry.Utils.SelectionManager.select(selectGroupName, node, value); }, false);
	}
};

Spry.Data.Region.behaviorAttrs["spryhover"] =
{
	attach: function(node, value)
	{
		Spry.Utils.addEventListener(node, "mouseover", function(event){ Spry.Utils.addClassName(node, value); }, false);
		Spry.Utils.addEventListener(node, "mouseout", function(event){ Spry.Utils.removeClassName(node, value); }, false);
	}
};

Spry.Data.Region.prototype.attachBehaviors = function()
{
	Spry.Utils.getNodesByFunc(this.regionNode, function(node)
	{
		if (!node)
			return false;
		try
		{
			var attrs = node.attributes;
			for (var i = 0; i < attrs.length; i++)
			{
				var attr = attrs[i];
				var behavior = Spry.Data.Region.behaviorAttrs[attr.nodeName.toLowerCase()];
				if (behavior)
					behavior.attach(node, attr.value);
			}
		}
		catch(e)
		{
		}

		return false;
	});
};

Spry.Data.Region.prototype.updateContent = function()
{
	var allDataSetsReady = true;

	var dsArray = this.getDataSets();

	if (!dsArray || dsArray.length < 1)
	{
		Spry.Debug.reportError("updateContent(): Region '" + this.name + "' has no data set!\n");
		return;
	}

	for (var i = 0; i < dsArray.length; i++)
	{
		var ds = dsArray[i];

		if (ds)
		{
			if (ds.getLoadDataRequestIsPending())
				allDataSetsReady = false;
			else if (!ds.getDataWasLoaded())
			{
				// Kick off the loading of the data if it hasn't happened yet.
				ds.loadData();
				allDataSetsReady = false;
			}
		}
	}

	if (!allDataSetsReady)
	{
		// Just return, this method will get called again automatically
		// as each data set load completes!
		return;
	}

	// Make the region transform the xml data. The result is
	// a string that we need to parse and insert into the document.
	var str = this.transform();

	// Clear out any previous transformed content.
	this.clearContent();

	// Now insert the new transformed content into the document.
	this.regionNode.innerHTML = str;

	// Now run through the content looking for attributes
	// that tell us what behaviors to attach to each element.
	if (this.hasBehaviorAttributes)
		this.attachBehaviors();
};

Spry.Data.Region.prototype.clearContent = function()
{
	Spry.Utils.removeAllChildren(this.regionNode);
};

Spry.Data.Region.prototype.tokenizeData = function()
{
	// If there is no data, there's nothing to do.
	if (!this.data)
		return null;

	// If we've already tokenized the data, return the tokens.
	if (this.tokens)
		return this.tokens;

	var rootToken = new Spry.Data.Region.Token(Spry.Data.Region.Token.LIST_TOKEN, null, null, null);
	var tokenStack = new Array;
	var parseStr = this.data;

	tokenStack.push(rootToken);

	// Create a regular expression that will match one of the following:
	//
	//   <spry:repeat select="regionName" test="true">
	//   </spry:repeat>
	//   {valueReference}
	var regexp = /((<!--\s*){0,1}<\/{0,1}spry:[^>]+>(\s*-->){0,1})|((\{|%7[bB])[^\}\s%]+(\}|%7[dD]))/mg;
	var searchStartIndex = 0;

	while(parseStr.length)
	{
		var results = regexp.exec(parseStr);
		var token = null;
		
		if (!results || !results[0])
		{
			// If we get here, the rest of the parseStr should be
			// just a plain string. Create a token for it and then
			// break out of the list.
			var str = parseStr.substr(searchStartIndex, parseStr.length - searchStartIndex);
			token = new Spry.Data.Region.Token(Spry.Data.Region.Token.STRING_TOKEN, null, str, str);
			tokenStack[tokenStack.length - 1].addChild(token);
			break;
		}

		if (results.index != searchStartIndex)
		{
			// We found a match but it's not at the start of the parseStr.
			// Create a string token for everything that precedes the match.
			var str = parseStr.substr(searchStartIndex, results.index - searchStartIndex);
			token = new Spry.Data.Region.Token(Spry.Data.Region.Token.STRING_TOKEN, null, str, str);
			tokenStack[tokenStack.length - 1].addChild(token);
		}

		// We found a string that needs to be turned into a token. Create a token
		// for it and then update parseStr for the next iteration.
		if (results[0].search(/^({|%7[bB])/) != -1 /* results[0].charAt(0) == '{' */)
		{
			var valueName = results[0];
			var regionStr = results[0];
			
			// Strip off brace and url encode brace chars inside the valueName.

			valueName = valueName.replace(/^({|%7[bB])/, "");
			valueName = valueName.replace(/(}|%7[dD])$/, "");

			// Check to see if our value begins with the name of a data set.
			// For example: {dataSet:tokenValue}. If it is, we need to save
			// the data set name so we know which data set to use to get the
			// value for the token during the region transform.

			var dataSetName = null;
			var splitArray = valueName.split(/::/);

			if (splitArray.length > 1)
			{
				dataSetName = splitArray[0];
				valueName = splitArray[1];
			}

			// Convert any url encoded braces to regular brace chars.

			regionStr = regionStr.replace(/^%7[bB]/, "{");
			regionStr = regionStr.replace(/%7[dD]$/, "}");

			// Now create a token for the placeholder.

			token = new Spry.Data.Region.Token(Spry.Data.Region.Token.VALUE_TOKEN, dataSetName, valueName, new String(regionStr));
			tokenStack[tokenStack.length - 1].addChild(token);
		}
		else if (results[0].charAt(0) == '<')
		{
			if (results[0].search(/<\//) != -1 /* results[0].charAt(1) == '/' */)
			{
				// We found a processing instruction close tag. Pop the top of the
				// token stack!
				//
				// XXX: We need to make sure that the close tag name matches the one
				//      on the top of the token stack!
				if (tokenStack[tokenStack.length - 1].tokenType != Spry.Data.Region.Token.PROCESSING_INSTRUCTION_TOKEN)
				{
					Spry.Debug.reportError("Invalid processing instruction close tag: " + results[0] + "\n");
					return null;
				}

				tokenStack.pop();
			}
			else
			{
				// Create the processing instruction token, add it as a child of the token
				// at the top of the token stack, and then push it on the stack so that it
				// becomes the parent of any tokens between it and its close tag.

				// Extract out the name of the processing instruction and data it contains.
				var piName = results[0].replace(/^(<!--\s*){0,1}</, "");
				piName = piName.replace(/>(\s*-->){0,1}|\s.*$/, "");

				var piDesc = Spry.Data.Region.processingInstructions[piName.replace(/:/, "")];

				if (piDesc)
				{
					var dataSet = null;

					var selectedDataSetName = "";
					if (results[0].search(/^.*\bselect=\"/) != -1)
					{
						selectedDataSetName = results[0].replace(/^.*\bselect=\"/, "");
						selectedDataSetName = selectedDataSetName.replace(/".*$/, "");
	
						if (selectedDataSetName)
						{
							try
							{
								dataSet = eval(selectedDataSetName);
							}
							catch (e)
							{
								Spry.Debug.reportError("Caught exception in tokenizeData() while trying to retrieve data set (" + selectedDataSetName + "): " + e + "\n");
								dataSet = null;
								selectedDataSetName = "";
							}
						}
					}

					// Check if the repeat has an sprytest attribute.
					var jsExpr = null;
					if (results[0].search(/^.*\btest=\"/) != -1)
					{
						jsExpr = results[0].replace(/^.*\btest=\"/, "");
						jsExpr = jsExpr.replace(/".*$/, "");
						jsExpr = Spry.Utils.decodeEntities(jsExpr);
					}

					var piData = new Spry.Data.Region.Token.PIData(piName, selectedDataSetName, jsExpr);

					token = new Spry.Data.Region.Token(Spry.Data.Region.Token.PROCESSING_INSTRUCTION_TOKEN, dataSet, piData, new String(results[0]));

					tokenStack[tokenStack.length - 1].addChild(token);
					tokenStack.push(token);
				}
				else
				{
					Spry.Debug.reportError("Unsupported region processing instruction: " + results[0] + "\n");
					return null;
				}
			}
		}
		else
		{
			Spry.Debug.reportError("Invalid region token: " + results[0] + "\n");
			return null;
		}

		searchStartIndex = regexp.lastIndex;
	}

	return rootToken;
};

Spry.Data.Region.prototype.processTokenChildren = function(token, processContext)
{
	// The use of an array to gather the strings returned from processing
	// the child tokens is actually a performance enhancement for IE.
	// The original code:
	//
	//     for (var i = 0; i < token.children.length; i++)
	//       outputStr += this.processTokens(token.children[i], processContext);
	//
	// seemed to cause an n-square problem in IE. Using an array with
	// a final join reduced one of our test cases (SelectExample.html) from over
	// a minute to about 15 seconds.
	
	var strArr = [ "" ];
	var len = token.children.length;
	var children = token.children;
	
	for (var i = 0; i < len; i++)
		strArr.push(this.processTokens(children[i], processContext));

	return strArr.join("");
};

Spry.Data.Region.prototype.processTokens = function(token, processContext)
{
	if (!processContext)
	{
		processContext = new Spry.Data.Region.ProcessingContext(this);
		if (!processContext)
			return "";
	}

	var outputStr = "";
	var i = 0;

	switch(token.tokenType)
	{
		case Spry.Data.Region.Token.LIST_TOKEN:
			outputStr += this.processTokenChildren(token, processContext);
			break;
		case Spry.Data.Region.Token.STRING_TOKEN:
			outputStr += token.data;
			break;
		case Spry.Data.Region.Token.PROCESSING_INSTRUCTION_TOKEN:
			if (token.data.name == "spry:repeat")
			{
				var dataSet = null;

				if (token.dataSet)
					dataSet = token.dataSet;
				else
					dataSet = this.dataSets[0];

				if (dataSet)
				{
					var dsContext = processContext.getDataSetContext(dataSet);
					if (!dsContext)
					{
						Spry.Debug.reportError("processTokens() failed to get a data set context!\n");
						break;
					}

					var numRows = dsContext.getNumRows();
					var dataSetRows = dataSet.getData();
					dsContext.pushState();

					for (i = 0; i < numRows; i++)
					{
						dsContext.setRowIndex(i);
						var testVal = true;
						if (token.data.jsExpr)
						{
							var jsExpr = Spry.Data.Region.processDataRefString(processContext, token.data.jsExpr);
							try { testVal = eval(jsExpr); }
							catch(e)
							{
								Spry.Debug.trace("Caught exception in Spry.Data.Region.prototype.processTokens while evaluating: " + jsExpr + "\n    Exception:" + e + "\n");
								testVal = true;
							}
						}

						if (testVal)
							outputStr += this.processTokenChildren(token, processContext);
					}

					dsContext.popState();
				}
			}
			else if (token.data.name == "spry:if")
			{
				var testVal = true;
				
				if (token.data.jsExpr)
				{
					var jsExpr = Spry.Data.Region.processDataRefString(processContext, token.data.jsExpr);
					try { testVal = eval(jsExpr); }
					catch(e)
					{
						Spry.Debug.trace("Caught exception in Spry.Data.Region.prototype.processTokens while evaluating: " + jsExpr + "\n    Exception:" + e + "\n");
						testVal = true;
					}
				}
	
				if (testVal)
					outputStr += this.processTokenChildren(token, processContext);
			}
			else if (token.data.name == "spry:choose")
			{
				var defaultChild = null;
				var childToProcess = null;
				var testVal = false;
				var j = 0;

				// All of the children of the spry:choose token should be of the type spry:when or spry:default.
				// Run through all of the spry:when children and see if any of their test expressions return true.
				// If one does, then process its children tokens. If none of the test expressions return true,
				// process the spry:default token's children, if it exists.

				for (j = 0; j < token.children.length; j++)
				{
					var child = token.children[j];
					if (child.tokenType == Spry.Data.Region.Token.PROCESSING_INSTRUCTION_TOKEN)
					{
						if (child.data.name == "spry:when")
						{
							if (child.data.jsExpr)
							{
								var jsExpr = Spry.Data.Region.processDataRefString(processContext, child.data.jsExpr);
								try { testVal = eval(jsExpr); }
								catch(e)
								{
									Spry.Debug.trace("Caught exception in Spry.Data.Region.prototype.processTokens while evaluating: " + jsExpr + "\n    Exception:" + e + "\n");
									testVal = false;
								}

								if (testVal)
								{
									childToProcess = child;
									break;
								}
							}
						}
						else if (child.data.name == "spry:default")
							defaultChild = child;
					}
				}

				// If we didn't find a match, use the token for the default case.

				if (!childToProcess && defaultChild)
					childToProcess = defaultChild;

				if (childToProcess)
					outputStr += this.processTokenChildren(childToProcess, processContext);
			}
			else
			{
				Spry.Debug.reportError("processTokens(): Unknown processing instruction: " + token.regionStr + "\n");
				return "";
			}
			break;
		case Spry.Data.Region.Token.VALUE_TOKEN:

			var dataSet = token.dataSet;
			if (!dataSet && this.dataSets && this.dataSets.length > 0 && this.dataSets[0])
			{
				// No dataSet was specified by the token, so use whatever the first
				// data set specified in the region.

				dataSet = this.dataSets[0];
			}
			if (!dataSet)
			{
				Spry.Debug.reportError("processTokens(): Value reference has no data set specified: " + token.regionStr + "\n");
				return "";
			}

			var dsContext = processContext.getDataSetContext(dataSet);
			if (!dsContext)
			{
				Spry.Debug.reportError("processTokens: Failed to get a data set context!\n");
				return "";
			}

			if (token.data == "ds_RowNumber")
				outputStr += dsContext.getRowIndex();
			else if (token.data == "ds_RowCount")
				outputStr += dsContext.getNumRows();
			else
			{
				var curDataSetRow = dsContext.getCurrentRow();
				if (curDataSetRow)
					outputStr += curDataSetRow[token.data];
			}
			break;
		default:
			Spry.Debug.reportError("processTokens(): Invalid token type: " + token.regionStr + "\n");
			break;
	}

	return outputStr;
};

Spry.Data.Region.prototype.transform = function()
{
	var tokens = this.tokenizeData();

	if (!tokens)
		return "";

	return this.processTokens(tokens, null);
};

Spry.Data.Region.processingInstructions = new Array;

Spry.Data.Region.processingInstructions.buildOpenTagForTest = function(ele, piName)
{
	if (!ele || !piName)
		return "";

	var jsExpr = "";

	try
	{
		var testAttr = ele.attributes.getNamedItem(piName);
		if (testAttr && testAttr.value)
			jsExpr = Spry.Utils.encodeEntities(testAttr.value);
	}
	catch (e) { jsExpr = ""; }

	if (!jsExpr)
	{
		Spry.Debug.reportError(piName + " attribute requires a JavaScript expression that returns true or false!\n");
		return "";
	}

	return "<" + Spry.Data.Region.processingInstructions[piName].tagName + " test=\"" + jsExpr + "\">";
};

Spry.Data.Region.processingInstructions.buildOpenTagForRepeat = function(ele, piName)
{
	if (!ele || !piName)
		return "";

	var selectAttrStr = "";

	try
	{
		var selectAttr = ele.attributes.getNamedItem(piName);
		if (selectAttr && selectAttr.value)
		{
			selectAttrStr = selectAttr.value;
			selectAttrStr = selectAttrStr.replace(/\s/g, "");
		}
	}
	catch (e) { selectAttrStr = ""; }

	if (!selectAttrStr)
	{
		Spry.Debug.reportError(piName + " attribute requires a data set name!\n");
		return "";
	}

	var testAttrStr = "";

	try
	{
		var testAttr = ele.attributes.getNamedItem("sprytest");
		if (testAttr && testAttr.value)
			testAttrStr = " test=\"" + Spry.Utils.encodeEntities(testAttr.value) + "\"";
	}
	catch (e) { testAttrStr = ""; }

	return "<" + Spry.Data.Region.processingInstructions[piName].tagName + " select=\"" + selectAttrStr + "\"" + testAttrStr + ">";
};

Spry.Data.Region.processingInstructions.buildOpenTag = function(ele, piName)
{
	return "<" + Spry.Data.Region.processingInstructions[piName].tagName + ">";
};

Spry.Data.Region.processingInstructions.buildCloseTag = function(ele, piName)
{
	return "</" + Spry.Data.Region.processingInstructions[piName].tagName + ">";
};

Spry.Data.Region.processingInstructions["spryrepeat"] = { tagName: "spry:repeat", childrenOnly: false, getOpenTag: Spry.Data.Region.processingInstructions.buildOpenTagForRepeat, getCloseTag: Spry.Data.Region.processingInstructions.buildCloseTag };
Spry.Data.Region.processingInstructions["spryrepeatchildren"] = { tagName: "spry:repeat", childrenOnly: true, getOpenTag: Spry.Data.Region.processingInstructions.buildOpenTagForRepeat, getCloseTag: Spry.Data.Region.processingInstructions.buildCloseTag };
Spry.Data.Region.processingInstructions["spryif"] = { tagName: "spry:if", childrenOnly: false, getOpenTag: Spry.Data.Region.processingInstructions.buildOpenTagForTest, getCloseTag: Spry.Data.Region.processingInstructions.buildCloseTag };
Spry.Data.Region.processingInstructions["sprychoose"] = { tagName: "spry:choose", childrenOnly: false, getOpenTag: Spry.Data.Region.processingInstructions.buildOpenTag, getCloseTag: Spry.Data.Region.processingInstructions.buildCloseTag };
Spry.Data.Region.processingInstructions["sprywhen"] = { tagName: "spry:when", childrenOnly: false, getOpenTag: Spry.Data.Region.processingInstructions.buildOpenTagForTest, getCloseTag: Spry.Data.Region.processingInstructions.buildCloseTag };
Spry.Data.Region.processingInstructions["sprydefault"] = { tagName: "spry:default", childrenOnly: false, getOpenTag: Spry.Data.Region.processingInstructions.buildOpenTag, getCloseTag: Spry.Data.Region.processingInstructions.buildCloseTag };

Spry.Data.Region.getTokensFromStr = function(str)
{
	// XXX: This will need to be modified if we support
	// tokens that use javascript between the braces!
	if (!str)
		return null;
	return str.match(/{[^}]+}/g);
};

Spry.Data.Region.processDataRefString = function(processingContext, regionStr, dataSetsToUse)
{
	if (!regionStr)
		return "";

	if (!processingContext && !dataSetsToUse)
		return regionStr;

	var resultStr = "";
	var re = new RegExp("\\{([^\\}:]+::)?[^\\}]+\\}", "g");
	var startSearchIndex = 0;

	while (startSearchIndex < regionStr.length)
	{
		var reArray = re.exec(regionStr);
		var offset =  regionStr.search(re);
		if (!reArray || !reArray[0])
		{
			resultStr += regionStr.substr(startSearchIndex, regionStr.length - startSearchIndex);
			return resultStr;
		}

		if (reArray.index != startSearchIndex)
			resultStr += regionStr.substr(startSearchIndex, reArray.index - startSearchIndex);

		var dsName = "";
		if (reArray[0].search(/^\{[^}:]+::/) != -1)
			dsName = reArray[0].replace(/^\{|::.*/g, "");

		var fieldName = reArray[0].replace(/^\{|.*::|\}/g, "");
		var row = null;

		if (processingContext)
		{
			if (fieldName == "ds_RowNumber")
			{
				resultStr += processingContext.getDataSetContext(dsName).getRowIndex();
				row = null;
			}
			else if (fieldName == "ds_RowCount")
			{
				resultStr += processingContext.getDataSetContext(dsName).getNumRows();
				row = null;
			}
			else
				row = processingContext.getCurrentRowForDataSet(dsName);
		}
		else
		{
			var ds = dsName ? dataSetsToUse[dsName] : dataSetsToUse[0];
			if (ds)
				row = ds.getCurrentRow();
		}
		
		if (row)
			resultStr += row[fieldName];

		if (startSearchIndex == re.lastIndex)
		{
			// On IE if there was a match near the end of the string, it sometimes
			// leaves re.lastIndex pointing to the value it had before the last time
			// we called re.exec. We check for this case to prevent an infinite loop!
			// We need to write out any text in regionStr that comes after the last
			// match.

			var leftOverIndex = reArray.index + reArray[0].length;
			if (leftOverIndex < regionStr.length)
				resultStr += regionStr.substr(leftOverIndex);

			break;
		}

		startSearchIndex = re.lastIndex;
	}

	return resultStr;
};

Spry.Data.Region.strToDataSetsArray = function(str, returnRegionNames)
{
	var dataSetsArr = new Array;
	var foundHash = [];

	if (!str)
		return dataSetsArr;

	str = str.replace(/\s+/g, " ");
	str = str.replace(/^\s|\s$/g, "");
	var arr = str.split(/ /);

	for (var i = 0; i < arr.length; i++)
	{
		if (arr[i] && !Spry.Data.Region.processingInstructions[arr[i]])
		{
			try {
				var dataSet = eval(arr[i]);
				if (!foundHash[arr[i]])
				{
					if (returnRegionNames)
						dataSetsArr.push(arr[i]);
					else
						dataSetsArr.push(dataSet);
					foundHash[arr[i]] = true;
				}
			}
			catch (e) { /* Spry.Debug.trace("Caught exception: " + e + "\n"); */ }
		}
	}

	return dataSetsArr;
};

Spry.Data.Region.DSContext = function(dataSet)
{
	var m_self = this;
	var m_dataSet = dataSet;
	var m_curRowIndexArray = [ -1 ]; // -1 means return whatever the current row is inside the data set.

	// Private Methods:

	function getInternalRowIndex() { return m_curRowIndexArray[m_curRowIndexArray.length - 1]; }

	// Public Methods:
	this.resetAll = function() { m_curRowIndexArray = [ m_dataSet.getCurrentRow() ] };
	this.getDataSet = function() { return m_dataSet; };
	this.getNumRows = function() { return m_dataSet.getData().length; };
	this.getCurrentRow = function()
	{
		if (m_curRowIndexArray.length < 2 || getInternalRowIndex() < 0)
			return m_dataSet.getCurrentRow();
	
		var data = m_dataSet.getData();
		var curRowIndex = getInternalRowIndex();
	
		if (curRowIndex < 0 || curRowIndex > data.length)
		{
			Spry.Debug.reportError("Invalid index used in Spry.Data.Region.DSContext.getCurrentRow()!\n");
			return null;
		}
	
		return data[curRowIndex];
	};
	this.getRowIndex = function()
	{
		var curRowIndex = getInternalRowIndex();
		if (curRowIndex >= 0)
			return curRowIndex;

		var data = m_dataSet.getData();
		var row = m_dataSet.getCurrentRow();
		
		for (var i = 0; i < data.length; i++)
		{
			if (data[i] == row)
				return i;
		}

		return 0;
	}
	this.setRowIndex = function(rowIndex) { m_curRowIndexArray[m_curRowIndexArray.length - 1] = rowIndex; };
	this.pushState = function() { m_curRowIndexArray.push( getInternalRowIndex()); };
	this.popState = function()
	{
		if (m_curRowIndexArray.length < 2)
		{
			// Our array should always have at least one element in it!
			Spry.Debug.reportError("Stack underflow in Spry.Data.Region.DSContext.popState()!\n");
			return;
		}
		m_curRowIndexArray.pop();
	};
};

Spry.Data.Region.ProcessingContext = function(region)
{
	var m_self = this;
	var m_region = region;
	var m_dataSetContexts = [];
	
	if (region && region.dataSets)
	{
		for (var i = 0; i < region.dataSets.length; i++)
			m_dataSetContexts.push(new Spry.Data.Region.DSContext(region.dataSets[i]));
	}

	this.getDataSetContext = function(dataSet)
	{
		if (!dataSet)
		{
			// We were called without a specified data set or
			// data set name. Assume the caller wants the first
			// data set in the processing context.

			if (m_dataSetContexts.length > 0)
				return m_dataSetContexts[0];
			return null;
		}

		if (typeof dataSet == 'string')
		{
			try { dataSet = eval(dataSet); } catch (e) { dataSet = null; }
			if (!dataSet)
				return null;
		}
	
		for (var i = 0; i < m_dataSetContexts.length; i++)
		{
			var dsc = m_dataSetContexts[i];
			if (dsc.getDataSet() == dataSet)
				return dsc;
		}
	
		return null;
	};

	this.getCurrentRowForDataSet = function(dataSet)
	{
		var dsc = m_self.getDataSetContext(dataSet);
		if (dsc)
			return dsc.getCurrentRow();
		return null;
	};
};

Spry.Data.Region.Token = function(tokenType, dataSet, data, regionStr)
{
	var self = this;
	this.tokenType = tokenType;
	this.dataSet = dataSet;
	this.data = data;
	this.regionStr = regionStr;
	this.parent = null;
	this.children = null;
};

Spry.Data.Region.Token.prototype.addChild = function(child)
{
	if (!child)
		return;
	
	if (!this.children)
		this.children = new Array;
	
	this.children.push(child);
	child.parent = this;
};

Spry.Data.Region.Token.LIST_TOKEN                   = 0;
Spry.Data.Region.Token.STRING_TOKEN                 = 1;
Spry.Data.Region.Token.PROCESSING_INSTRUCTION_TOKEN = 2;
Spry.Data.Region.Token.VALUE_TOKEN                  = 3;

Spry.Data.Region.Token.PIData = function(piName, data, jsExpr)
{
	var self = this;
	this.name = piName;
	this.data = data;
	this.jsExpr = jsExpr;
};

Spry.Data.loadHandler = function()
{
	setTimeout(function() { Spry.Data.initRegions(); }, 0);
};

if (typeof window.addEventListener != 'undefined')
	window.addEventListener('load', Spry.Data.loadHandler, false);
else if (typeof document.addEventListener != 'undefined')
	document.addEventListener('load', Spry.Data.loadHandler, false);
else if (typeof window.attachEvent != 'undefined')
	window.attachEvent('onload', Spry.Data.loadHandler);
