;(function($, undefined) {
    'use strict';
    var $v = window.$v = window.$v || {};
    if ($v.version) {
        return;
    }

    function Widget() {};
    Widget.fn = Widget.prototype = {
        constructor: Widget,
        init: function(element, options) {
            var that = this;
            that.options = $.extend(true, {}, that.options, options);
            that.host = $(element);
        },

        events: [],

        setOptions: function(options) {
            $.extend(this.options, options);
            this.bind(this.events, options);
        }
    };

    $v.ui = {};
    $.extend($v.ui, {
        Widget: Widget,
        plugin: function(widget, register) {
            var name = widget.prototype.name,
                getter;
            register = register || $v.ui;
            register[name] = widget;
            $.fn[name] = function(options) {
                var value = this,
                    args;

                if (typeof options === "string") {
                    args = Array.prototype.slice.call(arguments, 1);

                    this.each(function() {
                        var widget = $.data(this, name),
                            method,
                            result;

                        if (!widget) {
                            throw new Error("Cannot call method '{0}' of {1} before it is initialized".format(options, name));
                        }

                        method = widget[options];

                        if (typeof method !== "function") {
                            throw new Error("Cannot find method '{0}' of {1}".format(options, name));
                        }

                        result = method.apply(widget, args);

                        if (result !== undefined) {
                            value = result;
                            return false;
                        }
                    });
                }
                else {
                    this.each(function() {
                        var wi = $.data(this, name, new widget());
                        Widget.fn.init.call(wi, this, options);
                        wi.init();
                    });
                }

                return value;
            };
        },
        createPlugin: function(options, register) {
            function CustomPlugin() {}
            CustomPlugin.prototype = $.extend({
                constructor: CustomPlugin
            }, (register && register.prototype) || this.Widget.fn, options);
            this.plugin(CustomPlugin, register);
        }
    })
}(jQuery));

;(function($, undefined) {
    var Event ={
        add:function(action,callback){
            Event[action] || (Event[action] = $.Callbacks("once,memory")) &&(Event[action].add(callback));
            return Event;
        },
        fire:function(action,data){
            Event[action] && Event[action].fire(data);
        }
    };

    var LayoutBase = React.createClass({displayName: "LayoutBase",
        getInitialState: function() {
            return {
                list: layout.source,
            };
        },
        componentDidMount: function() {
            var that = this;
            var $dom = $(this.getDOMNode());
            $dom.on("click", function(event) {
                event.stopPropagation();
                $dom.toggleClass("open");
                if ($dom.hasClass('open')) {
                   that.setState(layout.source);
                }
            });
            
            $dom.on("click", "a", function(event) {
                event.stopPropagation();
                $dom.removeClass("open");
                var $this = $(event.currentTarget);
                var action = $this.data("action");
                if (action) {
                    switch (action) {
                        case "saveLayout":
                        default:
                            Event.fire(action);
                        break;
                    }
                    return;
                }
                $.each(layout.source, function() {
                    if (this.LayoutName == $this.text()) {
                        layout.currentLayoutData = this;
                        return false;
                    }
                });
                layout.onSelectedLayout();
            });
        },
        render:function() {
            return   React.createElement("div", {className: "filter_item columnLayout", style: {position: "relative",float: "right", height:30,display: "inline-block"}}, 
                React.createElement("div", {style: {cursor: "pointer"}}, 
                    React.createElement("span", {id: "columnLayoutBtn", className: "layoutsetting"})
                ), 
                React.createElement("ul", {className: "dropdown-menu pull-left"}, 
                    
                        this.state.list.map(function(item){
                            return React.createElement("li", null, React.createElement("a", null, 
                                React.createElement("span", {"data-check": true, className: "check", style: {visibility:layout.currentLayoutData.LayoutName == item.LayoutName ? "visible" : "hidden"}}
                                ), 
                                React.createElement("span", null, item.LayoutName)
                            ));
                        }), 
                    
                    React.createElement("li", {className: "divider"}), 
                    React.createElement("li", null, React.createElement("a", {"data-action": "addOrRemoveColumn"}, React.createElement("span", {className: "iconcolumn"}), "Add/Remove Columns")), 
                    React.createElement("li", null, React.createElement("a", {"data-action": "saveLayout"}, React.createElement("span", {className: "iconsave"}), "Save Layout")), 
                    React.createElement("li", null, React.createElement("a", {"data-action": "deleteLayout"}, React.createElement("span", {className: "icondelete"}), "Delete Layout")), 
                    React.createElement("li", null, React.createElement("a", {"data-action": "resetLayout"}, React.createElement("span", {className: "iconreset"}), "Reset Layout"))
                ), ";"
            )
        }
    });
    
    var PopContainer = React.createClass({displayName: "PopContainer",
         componentDidMount: function() {
            $(this.getDOMNode()).jqxWindow({
                autoOpen: false,
                isModal: true,
                height: this.props.height || 'auto',
                width: 300
            });
         },
         render:function() {
             return React.createElement("div", {id: this.props.popId}, 
                   React.createElement("div", {className: "popWindowheader"}, 
                       React.createElement("span", null, this.props.popTitle)
                   ), 
                   React.createElement("div", {id: this.props.popId+ "_content", style: {overflow: 'hidden'}, className: "popWindowContent"}
                   )
               );
         }
    });
    var AddContent = React.createClass({displayName: "AddContent",
        componentDidMount: function() {
            RemoveCon.ele = $(this.getDOMNode());
            RemoveCon.container = RemoveCon.ele.parents('div.jqx-window');
        },
        addLayout:function(){
            var layoutName = $.trim($("#layout_name",RemoveCon.ele).val());
                if (layoutName == "") {
                    $("#ErrorInput").html("Layout Name can not be Empty.").show();
                    return;
                }
                var existsLayout = false;
                $.each(this.props.source,function(){
                    if (layoutName.toLowerCase() == this.layoutName.toLowerCase()) {
                        existsLayout = true;
                    }
                });
               
                if (existsLayout && !confirm("The layout '" + layoutName + "' already exists.\nDo you want to replace?")) {
                    return;
                }
                var isDefault = $("#layoutDefaultCheck",RemoveCon.ele)[0].checked == true ? 1 : 0;
                layout.saveLayout(layoutName, isDefault, existsLayout);
                RemoveCon.container.jqxWindow('close');
        },
        componentWillReceiveProps: function(nextProps) {
            $("#layout_name", RemoveCon.ele).val("").focus();
        },
        render:function() {
            return React.createElement("div", null, 
                React.createElement("div", {style: {fontWeight : 'bold', height: 18, padding: 2, fontFamily: 'Arial', fontSize: 12,width: '100%'}}, 
                    "You can save your layout."), 
                React.createElement("table", {cellpadding: "0", cellspacing: "0", style: {height: 12, padding: 2, fontFamily: 'Arial',fontSize: 11, width: '100%'}}, 
                    React.createElement("tbody", null, 
                        React.createElement("tr", null, 
                            React.createElement("td", {style: {width: 35, fontWeight: 'bold'}}, 
                                "Layout:"
                            ), 
                            React.createElement("td", null, 
                                React.createElement("input", {id: "layout_name", style: {height: 15, border: '1px solid'}})
                            )
                        )
                    )
                ), 
                React.createElement("div", {style: {height: 12, padding: 2, fontFamily: 'Arial', fontSize: 11, width: '100%',color: 'Red'}}, 
                    React.createElement("span", {id: "ErrorInput", style: {fontWeight: 'bold', display: 'none'}})
                ), 
                React.createElement("div", {style: {height: 18, padding: 2, textAlign: 'center', fontFamily: 'Arial', fontSize: 13, width: '100%'}}, 
                    React.createElement("input", {type: "button", id: "btnSaveLayout", onClick: this.addLayout, value: "Save", className: "popWindowButton"}), 
                    React.createElement("input", {type: "checkbox", id: "layoutDefaultCheck"}), 
                    React.createElement("span", {style: {fontSize: 13}}, "Set as Default")
                )
            )
                
        }
    });
    var RemoveContent = React.createClass({displayName: "RemoveContent",
        componentDidMount: function() {
            RemoveCon.ele = $(this.getDOMNode());
            RemoveCon.container = RemoveCon.ele.parents('div.jqx-window');
        },
        deleteLayout:function(){
             var checkedLayoutList = $("#tbl_layoutList").find("input[type='checkbox']:checked");
                if (checkedLayoutList.length == 0) {
                    return;
                }
                var layoutNames = [];
                checkedLayoutList.each(function() {
                    layoutNames.push($.trim(this.value));
                });
                layout.deleteLayout(layoutNames);
                RemoveCon.container.jqxWindow('close');
            
        },
        closePop:function(){
            RemoveCon.container.jqxWindow('close');
        },
        render:function() {
            return React.createElement("div", null, 
                 React.createElement("div", {style: {padding: 2, fontFamily: 'Arial', fontSize: '12px', width: '100%'}}, 
                    React.createElement("table", {id: "tbl_layoutList", border: "0"}, 
                            React.createElement("tbody", null, 
                            
                                this.props.list.map(function(item,index){
                                    var id = 'chk_filter_' + index;
                                    return React.createElement("tr", null, React.createElement("td", null, 
                                        React.createElement("input", {id: id, value: item.LayoutName, type: "checkbox"}), 
                                        React.createElement("label", {htmlFor: id},  item.LayoutName)
                                    ))
                                })
                            
                        )
                    )
                ), 
                React.createElement("div", {style: {height: 20,padding: 2,fontFamily: 'Arial', textAlign: 'center',fontSize: '11px', width: '100%'}}, 
                    React.createElement("span", null, 
                        React.createElement("button", {className: "popWindowButton", onClick: this.deleteLayout}, "Delete"), 
                        React.createElement("span", null, "  "), 
                        React.createElement("button", {className: "popWindowButton", onClick: this.closePop}, "Cancel")
                    )
                )
            )
                
        }
    });
    
     var layout = {
        source:[],
        currentLayoutData:{},
        initDom:function(dom){
            React.render(
                React.createElement("div", null, 
                   React.createElement(PopContainer, {popId: "removeLayoutPop", popTitle: "Delete Layouts"}), 
                   React.createElement(PopContainer, {popId: "addLaypoutPop", popTitle: "Save Layouts", height: "125"})
                ),
               $('<div>').appendTo(document.body)[0]
            ); 
            React.render(
                    React.createElement(LayoutBase, null),
                    dom
            );
         },
        initEvent:function(dom,source){
            Event.add("addOrRemoveColumn",function(){
            }).add("saveLayout",function(){
                React.render(
                    React.createElement(AddContent, {source: source}),
                    document.getElementById('addLaypoutPop' +'_content')
                );
                $("#addLaypoutPop").jqxWindow('open');
            }).add("deleteLayout",function(){
                React.render(
                    React.createElement(RemoveCon, {list: variables.layoutData}),
                    document.getElementById('removeLayoutPop' +'_content')
                );
                $("#removeLayoutPop").jqxWindow({height:80 + variables.layoutData.length * 21}).jqxWindow('open');
            }).add("resetLayout",function(){
                layout.resetLayout();
            });
            $("#btnSaveLayout").on("click", function(event) {
                var layoutName = $.trim($("#layout_name").val());
                if (layoutName == "") {
                    $("#ErrorInput").html("Layout Name can not be Empty.").show();
                    return;
                }
                var existsLayout = false;
                $(".divider").prevAll().each(function(index) {
                    if (layoutName.toLowerCase() == $.trim($(this).find("a").text()).toLowerCase()) {
                        existsLayout = true;
                    }
                });

                if (existsLayout && !confirm("The layout '" + layoutName + "' already exists.\nDo you want to replace?")) {
                    return;
                }
                var isDefault = $("#layoutDefaultCheck")[0].checked == true ? 1 : 0;
                layout.saveLayout(layoutName, isDefault, existsLayout);
                $(variables.ids.windowSaveLayoutID).jqxWindow('close');
            });
        },
        init: function() {
            layout.initDom(this);
            layout.initEvent(this,layout.source);
        },
        onSelectedLayout:function(){
        },
        deleteLayout: function(layoutNames, callback) {
           
        },
        saveLayout: function(layoutName, isDefault, existsLayout) {
        },
        resetLayout: function() {
        }
    };
        $v.ui.createPlugin({
            name: "Layout",
                options: {
                    source: [],
                    currentLayoutData:{},
                    onSelectedLayout:function(){},
                    deleteLayout: function(layoutNames, callback) {},
                    saveLayout: function(layoutName, isDefault, existsLayout) {},
                    resetLayout: function() {}
                },
                init: function() {
                    $.extend(layout,this.options);
                    layout.init.call(this.host[0]);
            },
        });
}(jQuery));