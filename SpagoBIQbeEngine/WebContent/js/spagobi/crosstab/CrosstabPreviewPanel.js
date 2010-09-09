/**
 * SpagoBI - The Business Intelligence Free Platform
 *
 * Copyright (C) 2004 - 2008 Engineering Ingegneria Informatica S.p.A.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 * 
 **/
 
/**
  * Object name 
  * 
  * [description]
  * 
  * 
  * Public Properties
  * 
  * [list]
  * 
  * 
  * Public Methods
  * 
  *  [list]
  * 
  * 
  * Public Events
  * 
  *  [list]
  * 
  * Authors
  * 
  * - Davide Zerbetto (davide.zerbetto@eng.it)
  */

Ext.ns("Sbi.crosstab");

Sbi.crosstab.CrosstabPreviewPanel = function(config) {
	
	var defaultSettings = {
		title: LN('sbi.crosstab.crosstabpreviewpanel.title')
  	};
	if(Sbi.settings && Sbi.settings.qbe && Sbi.settings.qbe.crosstabPreviewPanel) {
		defaultSettings = Ext.apply(defaultSettings, Sbi.settings.qbe.crosstabPreviewPanel);
	}
	
	this.services = new Array();
	var params = {};
	this.services['loadCrosstab'] = Sbi.config.serviceRegistry.getServiceUrl({
		serviceName: 'LOAD_CROSSTAB_ACTION'
		, baseParams: params
	});
	

	var c = Ext.apply(defaultSettings, config || {});
	
	c = Ext.apply(c, {
      		layout:'fit',
      		border: false,
      		id: 'CrosstabPreviewPanel'
    	});
	this.calculatedFields = config.crosstabTemplate.calculatedFields;
	
	// constructor
    Sbi.crosstab.CrosstabPreviewPanel.superclass.constructor.call(this, c);
	
};

Ext.extend(Sbi.crosstab.CrosstabPreviewPanel, Ext.Panel, {
	
	services: null
	, crosstab: null
	, calculatedFields: null
	, loadMask: null
	
		, load: function(crosstabDefinition) {
			this.showMask();
			var crosstabDefinitionEncoded = Ext.util.JSON.encode(crosstabDefinition);
			this.loadCrosstabAjaxRequest.defer(100, this,[crosstabDefinitionEncoded]);

		}

		, loadCrosstabAjaxRequest: function(crosstabDefinitionEncoded){
			Ext.Ajax.request({
		        url: this.services['loadCrosstab'],
		        params: {
						crosstabDefinition: crosstabDefinitionEncoded
				},
		        success : function(response, opts) {
	        		this.hideMask();
		  			this.refreshCrossTab(Ext.util.JSON.decode( response.responseText ));
		        },
		        scope: this,
				failure: function(response, options) {
					this.hideMask();
					Sbi.exception.ExceptionHandler.handleFailure(response, options);
				}      
			})
		}
			
	, refreshCrossTab: function(crosstab){
		
		if(this.crosstab!=null){
			this.calculatedFields = this.crosstab.getCalculatedFields();
		}
		
		this.removeAll(true);
	
		var rows = this.fromNodeToArray(crosstab.rows);
		var columns = this.fromNodeToArray(crosstab.columns);
		var data = crosstab.data;
		var config = crosstab.config;
		var measuresMetadata = crosstab.measures_metadata;

		this.crosstab =  new Sbi.crosstab.core.CrossTab( rows,columns, data, config.calculatetotalsonrows=="on", config.calculatetotalsoncolumns=="on", this.calculatedFields, config.measureson=='rows', measuresMetadata);
		this.crosstab.reloadHeadersAndTable();
		this.add(this.crosstab);
		this.doLayout();
		if(config.columnsOverflow){		
			Sbi.exception.ExceptionHandler.showWarningMessage(LN('sbi.crosstab.crosstabpreviewpanel.overflow.warning'), 'Warning');
		}
	}

	, fromNodeToArray: function(node){
		var childs = node.node_childs;
		var array = new Array();
		array.push(node.node_key);
		if(childs!=null && childs.length>0){
			var childsArray = new Array();
			for(var i=0; i<childs.length; i++){
				childsArray.push(this.fromNodeToArray(childs[i]));
			}
			array.push(childsArray);
		}
		return array;
	}
	
	, hideMask: function() {
    	if (this.loadMask != null) {
    		this.loadMask.hide();
    	}
	}
	
    , showMask : function(){
    	
    	if (this.loadMask == null) {
    		this.loadMask = new Ext.LoadMask('CrosstabPreviewPanel', {msg: "Loading.."});
    	}
    	this.loadMask.show();
    }
    
    , serializeCrossTab: function () {
    	if (this.crosstab != null) {
    		return this.crosstab.serializeCrossTab();
    	} else {
    		throw "Crosstab not defined";
    	}
    }
    
    , getCalculatedFields: function () {
    	if (this.crosstab != null) {
    		return this.crosstab.getCalculatedFields();
    	} else {
    		return new Array();
    	}
    }

});