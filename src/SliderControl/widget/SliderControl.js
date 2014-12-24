/*jslint white: true nomen: true plusplus: true */
/*global mx, mendix, require, console, define, module, logger */
/**

	SliderControl
	========================

	@file      : SliderControl.js
	@version   : 1.0
	@author    : Roeland Salij
	@date      : 22-08-2014
	@copyright : Mendix Technology BV
	@license   : Apache License, Version 2.0, January 2004

	Documentation
    ========================
	Describe your widget here.

*/

(function() {
    'use strict';

    // Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
    require([

        'dojo/_base/declare', 'mxui/widget/_WidgetBase', 'dijit/_Widget', 'dijit/_TemplatedMixin',
        'mxui/dom', 'dojo/dom', 'dojo/query', 'dojo/dom-prop', 'dojo/dom-geometry', 'dojo/dom-class', 'dojo/dom-style', 'dojo/dom-construct','dojo/dom-attr', 'dojo/window', 'dojo/on', 'dojo/_base/lang', 'dojo/text'


    ], function (declare, _WidgetBase, _Widget, _Templated, domMx, dom, domQuery, domProp, domGeom, domClass, domStyle, domConstruct, domAttr, win, on, lang, text) {

        // Declare widget.
        return declare('SliderControl.widget.SliderControl', [ _WidgetBase, _Widget, _Templated], {

            /**
             * Internal variables.
             * ======================
             */
            _wgtNode: null,
            _contextGuid: null,
            _contextObj: null,
            _handle: null,

            // Extra variables
            _sliderProperties: null,
            _minRange: null,
            _maxRange: null,
            _stepRange: null,
            

            // Template path
            templatePath: require.toUrl('SliderControl/widget/templates/SliderControl.html'),

            /**
             * Mendix Widget methods.
             * ======================
             */

            // DOJO.WidgetBase -> PostCreate is fired after the properties of the widget are set.
            postCreate: function () {

                // postCreate
                console.log('SliderControl - postCreate');
                
                this._sliderProperties = {
                    minRange : 0,
                    maxRange : 0,
                    stepRange : 0,
                };

                // Load CSS ... automaticly from ui directory

                // Setup widgets
                this._setupWidget();

                // Setup events
                this._setupEvents();
            },

            // DOJO.WidgetBase -> Startup is fired after the properties of the widget are set.
            startup: function () {

                // postCreate
                console.log('SliderControl - startup');
                
            },

            /**
             * What to do when data is loaded?
             */

            update: function (obj, callback) {

                // startup
                console.log('SliderControl - update');

                // Release handle on previous object, if any.
                if (this._handle) {
                    mx.data.unsubscribe(this._handle);
                }

                if (typeof obj === 'string') {
                    this._contextGuid = obj;
                    mx.data.get({
                        guids: [this._contextGuid],
                        callback: lang.hitch(this, function (objs) {

                            // Set the object as background.
                            this._contextObj = objs;

                            // Load data again.
                            this._loadData();

                        })
                    });
                } else {
                    this._contextObj = obj;
                }

                if (obj === null) {

                    // Sorry no data no show!
                    console.log('SliderControl  - update - We did not get any context object!');

                } else {

                    // Load data
                    this._loadData();

                    // Subscribe to object updates.
                    this._handle = mx.data.subscribe({
                        guid: this._contextObj.getGuid(),
                        callback: lang.hitch(this, function(obj){

                            mx.data.get({
                                guids: [obj],
                                callback: lang.hitch(this, function (objs) {

                                    // Set the object as background.
                                    this._contextObj = objs;

                                    // Load data again.
                                    this._loadData();

                                })
                            });

                        })
                    });
                }

                // Execute callback.
                if(typeof callback !== 'undefined'){
                    callback();
                }
            },

           
            /**
             * Extra setup widget methods.
             * ======================
             */
            _setupWidget: function () {

                this._wgtNode = this.domNode;

                domAttr.set(this._wgtNode, 'list', this._wgtNode.id +'_optionlist');
                
            },

            // Attach events to newly created nodes.
            _setupEvents: function () {

                console.log('SliderControl - setup events');

                on(this.domNode, 'change', lang.hitch(this, function () {
                    
                    
                    console.log(this._contextObj.getGuid());
                    this._contextObj.set(this.targetAttr,domAttr.get(this._wgtNode,'value'));
                    
                    mx.data.action({
                        params: {
                            applyto: 'selection',
                            actionname: this.mfToExecute,
                            guids: [this._contextObj.getGuid()]
                        },
                        callback: lang.hitch(this, function (obj) {
                            //TODO what to do when all is ok!
                        }),
                        error: function (error) {
                            console.log(error.description);
                        }
                    }, this);

                }));

            },


            /**
             * Interaction widget methods.
             * ======================
             */
            _loadData: function () {

                var parentNode = null,
                    i= null,
                    dl = null;
                
                this._sliderProperty('minRange', 'min',this.minRangeAttr);
                this._sliderProperty('maxRange', 'max',this.maxRangeAttr);
                this._sliderProperty('stepRange', 'step',this.stepRangeAttr);
                
                domAttr.set(this._wgtNode,'min', this._sliderProperties.minRange);
                domAttr.set(this._wgtNode,'max', this._sliderProperties.maxRange);
                domAttr.set(this._wgtNode,'step', this._sliderProperties.stepRange);
                domAttr.set(this._wgtNode,'value', this._contextObj.get(this.targetAttr));
                
                if(this.sliderMarks)
                {
                    dl = dom.byId(this._wgtNode.id +'_optionlist');
                    if(dl === null) {
                        dl = domConstruct.create('datalist', {id : this._wgtNode.id +'_optionlist'});
                    }
                    domConstruct.empty(dl);
                    
                    parentNode = this._wgtNode.parentNode;
                    for(i = this._sliderProperties.minRange; i <= this._sliderProperties.maxRange; i = i + this._sliderProperties.stepRange)
                    {
                        dl.appendChild(domConstruct.create('option', { innerHTML : i }));

                    }
                    parentNode.appendChild(dl);
                }
                
            },
            
            _sliderProperty : function (widgetAttr, property, contextAttr) {

                this._contextObj.fetch(contextAttr, lang.hitch(this, function(value) {
                     this._sliderProperties[widgetAttr] = parseInt(value);
                 }));
                
            }
            
        });
    });

}());


