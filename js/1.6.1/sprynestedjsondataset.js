// SpryNestedJSONDataSet.js - version 0.5 - Spry Pre-Release 1.6.1
//
// Copyright (c) 2007. Adobe Systems Incorporated.
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

Spry.Data.NestedJSONDataSet = function(parentDataSet, jpath, options)
{
	this.parentDataSet = parentDataSet;
	this.jpath = jpath;
	this.nestedDataSets = [];
	this.nestedDataSetsHash = {};
	this.currentDS = null;
	this.currentDSAncestor = null;
	this.options = options;
	this.ignoreOnDataChanged = false;

	Spry.Data.DataSet.call(this, options);

	parentDataSet.addObserver(this);
};

Spry.Data.NestedJSONDataSet.prototype = new Spry.Data.DataSet();
Spry.Data.NestedJSONDataSet.prototype.constructor = Spry.Data.NestedJSONDataSet.prototype;

Spry.Data.NestedJSONDataSet.prototype.getParentDataSet = function()
{
	return this.parentDataSet;
};

Spry.Data.NestedJSONDataSet.prototype.getNestedDataSetForParentRow = function(parentRow)
{
	// Return the internal nested data set associated with the parent's
	// specified row object.
	
	var jsonNode = parentRow.ds_JSONObject;
	if (jsonNode && this.nestedDataSets)
	{
		// Before we go through all of the trouble of looking up the data set
		// we want, check to see if it is already our current data set!
		
		if (this.currentDSAncestor && this.currentDSAncestor == jsonNode)
			return this.currentDS;

		// The caller is asking for a data set that isn't our current one.
		// Manually walk through all of the data sets we have, and return the
		// one that is associated with jsonNode.

		var nDSArr = this.nestedDataSets;
		var nDSArrLen = nDSArr.length;
		for (var i = 0; i < nDSArrLen; i++)
		{
			var dsObj = nDSArr[i];
			if (dsObj && jsonNode == dsObj.ancestor)
				return dsObj.dataSet;
		}
	}
	return null;
};

Spry.Data.NestedJSONDataSet.prototype.getNestedJSONDataSetsArray = function()
{
	// Return an array of all of our internal nested data sets.

	var resultsArray = [];
	if (this.nestedDataSets)
	{
		var arrDS = this.nestedDataSets;
		var numDS = this.nestedDataSets.length;
		for (var i = 0; i < numDS; i++)
			resultsArray.push(arrDS[i].dataSet);
	}
	return resultsArray;
};

Spry.Data.NestedJSONDataSet.prototype.onDataChanged = function(notifier, data)
{
	// This function gets called any time the *parent* data set gets changed.

	if (!this.ignoreOnDataChanged)
		this.loadData();
};

Spry.Data.NestedJSONDataSet.prototype.onCurrentRowChanged = function(notifier, data)
{
	// The current row for our parent data set changed. We need to sync
	// our internal state so that our current data set is the nested data
	// for the parent's current row.
	//
	// From the outside, this appears as if the *entire* data inside this
	// data set changes. We don't want any of our nested child data sets
	// to recalculate their internal nested data structures, we simply want
	// them to select the correct one from the set they already have. To do
	// this, we dispatch a pre and post context change message that allows
	// them to figure out what is going on, and that they can safely ignore
	// any onDataChanged message they get from their parent.

	this.notifyObservers("onPreParentContextChange");
	this.currentDS = null;
	this.currentDSAncestor = null;
	var pCurRow = this.parentDataSet.getCurrentRow();
	if (pCurRow)
	{
		var nestedDS = this.getNestedDataSetForParentRow(pCurRow);
		if (nestedDS)
		{
			this.currentDS = nestedDS;
			this.currentDSAncestor = pCurRow.ds_JSONObject;
		}
	}
	this.notifyObservers("onDataChanged");
	this.notifyObservers("onPostParentContextChange");
	this.ignoreOnDataChanged = false;
};

// If we get an onPostParentContextChange, we want to treat it as if we got an
// onCurrentRowChanged message from our parent, that way, we don't have to recalculate
// any of our internal data, we just have to select the correct data set
// that matches our parent's current row.

Spry.Data.NestedJSONDataSet.prototype.onPostParentContextChange = Spry.Data.NestedJSONDataSet.prototype.onCurrentRowChanged;
Spry.Data.NestedJSONDataSet.prototype.onPreParentContextChange = function(notifier, data)
{
	this.ignoreOnDataChanged = true;
};

Spry.Data.NestedJSONDataSet.prototype.filterAndSortData = function()
{
	// This method is almost identical to the one from the
	// DataSet base class, except that it does not set the
	// current row id.

	// If there is a data filter installed, run it.

	if (this.filterDataFunc)
		this.filterData(this.filterDataFunc, true);

	// If the distinct flag was set, run through all the records in the recordset
	// and toss out any that are duplicates.

	if (this.distinctOnLoad)
		this.distinct(this.distinctFieldsOnLoad);

	// If sortOnLoad was set, sort the data based on the columns
	// specified in sortOnLoad.

	if (this.keepSorted && this.getSortColumn())
		this.sort(this.lastSortColumns, this.lastSortOrder);
	else if (this.sortOnLoad)
		this.sort(this.sortOnLoad, this.sortOrderOnLoad);

	// If there is a view filter installed, run it.

	if (this.filterFunc)
		this.filter(this.filterFunc, true);
};

Spry.Data.NestedJSONDataSet.prototype.loadData = function()
{
	var parentDS = this.parentDataSet;

	if (!parentDS || parentDS.getLoadDataRequestIsPending() || !this.jpath)
		return;

	if (!parentDS.getDataWasLoaded())
	{
		// Someone is asking us to load our data, but our parent
		// hasn't even initiated a load yet. Tell our parent to
		// load its data, so we can get our data!

		parentDS.loadData();
		return;
	}

	this.notifyObservers("onPreLoad");

	this.nestedDataSets = [];
	this.currentDS = null;
	this.currentDSAncestor = null;

	this.data = [];
	this.dataHash = {};

	var self = this;

	var ancestorDS = [ parentDS ];
	if (parentDS.getNestedJSONDataSetsArray)
		ancestorDS = parentDS.getNestedJSONDataSetsArray();

	var currentAncestor = null;
	var currentAncestorRow = parentDS.getCurrentRow();
	if (currentAncestorRow)
		currentAncestor = currentAncestorRow.ds_JSONObject;

	var numAncestors = ancestorDS.length;
	for (var i = 0; i < numAncestors; i++)
	{
		// Run through each row of *every* ancestor data set and create
		// a nested data set.

		var aDS = ancestorDS[i];
		var aData = aDS.getData(true);
		if (aData)
		{
			var aDataLen = aData.length;
			for (var j = 0; j < aDataLen; j++)
			{
				var row = aData[j];
				if (row && row.ds_JSONObject)
				{
					// Create an internal nested data set for this row.

					var ds = new Spry.Data.DataSet(this.options);

					// Make sure the internal nested data set has the same set
					// of columnTypes as the nested data set itself.

					for (var cname in this.columnTypes)
						ds.setColumnType(cname, this.columnTypes[cname]);

					// Flatten any data that matches our XPath and stuff it into
					// our new nested data set.

					var dataArr = Spry.Data.JSONDataSet.flattenDataIntoRecordSet(row.ds_JSONObject, this.jpath);
					ds.setDataFromArray(dataArr.data, true);

					// Create an object that stores the relationship between our
					// internal nested data set, and the ancestor node that was used
					// extract the data for the data set.

					var dsObj = new Object;
					dsObj.ancestor = row.ds_JSONObject;
					dsObj.dataSet = ds;

					this.nestedDataSets.push(dsObj);

					// If this ancestor is the one for our parent's current row,
					// make the current data set our current data set.

					if (row.ds_JSONObject == currentAncestor)
					{
						this.currentDS = ds;
						this.currentDSAncestor = this.ds_JSONObject;
					}
		
					// Add an observer on the nested data set so that whenever it dispatches
					// a notifications, we forward it on as if we generated the notification.
		
					ds.addObserver(function(notificationType, notifier, data){ if (notifier == self.currentDS) setTimeout(function() { self.notifyObservers(notificationType, data); }, 0); });
				}
			}
		}
	}

	this.pendingRequest = new Object;
	this.dataWasLoaded = false;

	this.pendingRequest.timer = setTimeout(function() {
		self.pendingRequest = null;
		self.dataWasLoaded = true;

		self.disableNotifications();
		self.filterAndSortData();
		self.enableNotifications();

		self.notifyObservers("onPostLoad");
		self.notifyObservers("onDataChanged");
	}, 0);
};

Spry.Data.NestedJSONDataSet.prototype.getData = function(unfiltered)
{
	if (this.currentDS)
		return this.currentDS.getData(unfiltered);
	return [];
};

Spry.Data.NestedJSONDataSet.prototype.getRowCount = function(unfiltered)
{
	if (this.currentDS)
		return this.currentDS.getRowCount(unfiltered);
	return 0;
};

Spry.Data.NestedJSONDataSet.prototype.getRowByID = function(rowID)
{
	if (this.currentDS)
		return this.currentDS.getRowByID(rowID);
	return undefined;
};

Spry.Data.NestedJSONDataSet.prototype.getRowByRowNumber = function(rowNumber, unfiltered)
{
	if (this.currentDS)
		return this.currentDS.getRowByRowNumber(rowNumber, unfiltered);
	return null;
};

Spry.Data.NestedJSONDataSet.prototype.getCurrentRow = function()
{
	if (this.currentDS)
		return this.currentDS.getCurrentRow();
	return null;
};

Spry.Data.NestedJSONDataSet.prototype.setCurrentRow = function(rowID)
{
	if (this.currentDS)
		return this.currentDS.setCurrentRow(rowID);
};

Spry.Data.NestedJSONDataSet.prototype.getRowNumber = function(row)
{
	if (this.currentDS)
		return this.currentDS.getRowNumber(row);
	return 0;
};

Spry.Data.NestedJSONDataSet.prototype.getCurrentRowNumber = function()
{
	if (this.currentDS)
		return this.currentDS.getCurrentRowNumber();
	return 0;
};

Spry.Data.NestedJSONDataSet.prototype.getCurrentRowID = function()
{
	if (this.currentDS)
		return this.currentDS.getCurrentRowID();
	return 0;
};

Spry.Data.NestedJSONDataSet.prototype.setCurrentRowNumber = function(rowNumber)
{
	if (this.currentDS)
		return this.currentDS.setCurrentRowNumber(rowNumber);
};

Spry.Data.NestedJSONDataSet.prototype.findRowsWithColumnValues = function(valueObj, firstMatchOnly, unfiltered)
{
	if (this.currentDS)
		return this.currentDS.findRowsWithColumnValues(valueObj, firstMatchOnly, unfiltered);
	return firstMatchOnly ? null : [];
};

Spry.Data.NestedJSONDataSet.prototype.setColumnType = function(columnNames, columnType)
{
	if (columnNames)
	{
		// Make sure the nested JSON data set tracks the column types
		// that the user sets so that if our data changes, we can re-apply
		// the column types.

		Spry.Data.DataSet.prototype.setColumnType.call(this, columnNames, columnType);

		// Now apply the column types to any internal nested data sets
		// that exist.

		var dsArr = this.nestedDataSets;
		var dsArrLen = dsArr.length;
		for (var i = 0; i < dsArrLen; i++)
			dsArr[i].dataSet.setColumnType(columnNames, columnType);
	}
};

Spry.Data.NestedJSONDataSet.prototype.getColumnType = function(columnName)
{
	if (this.currentDS)
		return this.currentDS.getColumnType(columnName);
	return "string";
};

Spry.Data.NestedJSONDataSet.prototype.distinct = function(columnNames)
{
	if (columnNames)
	{
		var dsArr = this.nestedDataSets;
		var dsArrLen = dsArr.length;
		for (var i = 0; i < dsArrLen; i++)
			dsArr[i].dataSet.distinct(columnNames);
	}
};

Spry.Data.NestedJSONDataSet.prototype.sort = function(columnNames, sortOrder)
{
	if (columnNames)
	{
		// Forward the sort request to all internal data sets.

		var dsArr = this.nestedDataSets;
		var dsArrLen = dsArr.length;
		for (var i = 0; i < dsArrLen; i++)
			dsArr[i].dataSet.sort(columnNames, sortOrder);

		// Make sure we store a local copy of the last sort order
		// column so we can restore it if new data is loaded.

		if (dsArrLen > 0)
		{
			var ds = dsArr[0].dataSet;
			this.lastSortColumns = ds.lastSortColumns.slice(0); // Copy the array.
			this.lastSortOrder = ds.lastSortOrder;
		}
	}
};

Spry.Data.NestedJSONDataSet.prototype.filterData = function(filterFunc, filterOnly)
{
	// Store a copy of the filterFunc so we can apply it
	// if the data set loads new data.

	this.filterDataFunc = filterFunc;

	// Now set the filterFunc on all of the internal
	// data sets.

	var dsArr = this.nestedDataSets;
	var dsArrLen = dsArr.length;
	for (var i = 0; i < dsArrLen; i++)
		dsArr[i].dataSet.filterData(filterFunc, filterOnly);
};

Spry.Data.NestedJSONDataSet.prototype.filter = function(filterFunc, filterOnly)
{
	// Store a copy of the filterFunc so we can apply it
	// if the data set loads new data.

	this.filterFunc = filterFunc;

	// Now set the filterFunc on all of the internal
	// data sets.

	var dsArr = this.nestedDataSets;
	var dsArrLen = dsArr.length;
	for (var i = 0; i < dsArrLen; i++)
		dsArr[i].dataSet.filter(filterFunc, filterOnly);
};
