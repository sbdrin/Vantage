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

                        method = widget.options[options];

                        if (typeof method !== "function") {
                            if(!method){
                                throw new Error("Cannot find method '{0}' of {1}".format(options, name));
                            }
                            return (value = method);
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
    var Event = {
        add: function(action, callback) {
            (Event[action] || (Event[action] = $.Callbacks("once,memory"))) && (Event[action].add(callback));
            return Event;
        },
        remove: function(action, callback) {
            (Event[action] || (Event[action] = $.Callbacks("once,memory"))) && (Event[action].remove(callback));
            return Event;
        },
        fire: function(action) {
            Event[action] && Event[action].fire.apply(null,Array.prototype.slice.call(arguments,1));
        }
    };
    var Store ={
        _models:[],
        models:function(models){
            if(models){
                Store._models = models;
                Event.fire("ModelsChange",Store._models);
            }
            return Store._models;
        },
        addListener: function(callback){
            Event.add("ModelsChange",callback);
        },
        removeListener: function(callback){
            Event.remove("ModelsChange",callback);
        },
        remove: function(names) {
            var newModels = [];
            $.each(Store._models, function(i, val) {
                if (names.indexOf(val.LayoutName) < 0) {
                    newModels.push(val);
                }
            });
            Store._models = newModels;
            Event.fire("ModelsChange",Store._models);
        },
        add:function(model){
             Store._models.push(model);
             Event.fire("ModelsChange",Store._models);
        }
    };
    
    var LayoutBase = React.createClass({displayName: "LayoutBase",
        getInitialState: function() {
            return {
                list: Store.models()
            };
        },
        _onChange: function(model) {
            this.setState({
                list: Store.models()
            });
        },
        componentDidMount: function() {
            var that = this;
            Store.addListener(this._onChange);
            var $dom = $(this.getDOMNode());
            $dom.on("click", function(event) {
                event.stopPropagation();
                $dom.toggleClass("open");
            });

            $dom.on("click", "a", function(event) {
                event.stopPropagation();
                $dom.removeClass("open");
                var $this = $(event.currentTarget);
                var action = $this.data("action");
                if (action) {
                    switch (action) {
                        default: Event.fire(action);
                        break;
                    }
                    return;
                }
                $.each(that.state.list, function() {
                    if (this.LayoutName == $this.text()) {
                        action.currentLayout = this;
                        return false;
                    }
                });
                Event.fire("selected",action.currentLayout);
            });
        },
        componentWillUnmount: function() {
             Store.removeListener(this._onChange);
        },
        render: function() {
            var that = this;
            return React.createElement("div", {style: {position: "relative"}}, 
                React.createElement("div", {style: {cursor: "pointer"}}, 
                    React.createElement("span", {className: this.props.iconCalss})
                ), 
                React.createElement("ul", {className: "dropdown-menu pull-left"}, 
                    
                        that.state.list.map(function(item){
                            return React.createElement("li", null, React.createElement("a", null, 
                                React.createElement("span", {"data-check": true, className: "check", style: {visibility:action.currentLayout.LayoutName == item.LayoutName ? "visible" : "hidden"}}
                                ), 
                                React.createElement("span", null, item.LayoutName)
                            ));
                        }), 
                    
                    React.createElement("li", {className: "divider"}), 
                   
                     
                        this.props.actions.map(function(item){
                            return React.createElement("li", null, React.createElement("a", {"data-action": item.action}, 
                                React.createElement("span", {className: item.className + ' icon'}), item.text
                            ));
                        })
                    
                )
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
        render: function() {
            return React.createElement("div", {id: this.props.popId}, 
                   React.createElement("div", {className: "popWindowheader"}, 
                       React.createElement("span", null, this.props.popTitle)
                   ), 
                   React.createElement("div", {id: this.props.popId+ "_content", style: {overflow: 'hidden'}, className: "popWindowContent"}
                   )
               );
        }
    });
    var AddPopContent = React.createClass({displayName: "AddPopContent",
        componentDidMount: function() {
            AddPopContent.ele = $(this.getDOMNode());
            AddPopContent.container = AddPopContent.ele.parents('div.jqx-window');
            setTimeout(function() {
                $("#layout_name", AddPopContent.ele).focus();
            })
        },
        addLayout: function() {
            var layoutName = $.trim($("#layout_name", AddPopContent.ele).val());
            if (layoutName == "") {
                $("#ErrorInput").html("Layout Name can not be Empty.").show();
                return;
            }
            var existsLayout = false;
            $.each(Store.models(), function(i, item) {
                if (layoutName.toLowerCase() == item.LayoutName.toLowerCase()) {
                    existsLayout = true;
                }
            });

            if (existsLayout && !confirm("The layout '" + layoutName + "' already exists.\nDo you want to replace?")) {
                return;
            }
            var isDefault = $("#layoutDefaultCheck", AddPopContent.ele)[0].checked == true ? 1 : 0;
            Event.fire('saving',layoutName, isDefault, existsLayout);
            AddPopContent.container.jqxWindow('close');
        },
        componentWillReceiveProps: function(nextProps) {
            setTimeout(function() {
                $("#layout_name", AddPopContent.ele).val("").focus();
            })
        },
        render: function() {
            return React.createElement("div", null, 
                React.createElement("div", {style: {fontWeight : 'bold', height: 18, padding: 2, fontFamily: 'Arial', fontSize: 12,width: '100%'}}, 
                    "You can save your action."), 
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
    var RemovePopContent = React.createClass({displayName: "RemovePopContent",
        getInitialState: function() {
            return {
                list: Store.models()
            };
        },
        _onChange: function() {
            this.setState({
                list: Store.models()
            });
        },
        componentDidMount: function() {
            RemovePopContent.container = $(this.getDOMNode()).parents('div.jqx-window');
            Store.addListener(this._onChange);
        },
        componentWillUnmount: function() {
             Store.removeListener(this._onChange);
        },
        deleteLayout: function() {
            var checkedLayoutList = $("#tbl_layoutList").find("input[type='checkbox']:checked");
            if (checkedLayoutList.length == 0) {
                return;
            }
            var layoutNames = [];
            checkedLayoutList.each(function() {
                layoutNames.push($.trim(this.value));
            });
            Event.fire('deleting',layoutNames);
            RemovePopContent.container.jqxWindow('close');

        },
        closePop: function() {
            RemovePopContent.container.jqxWindow('close');
        },
        render: function() {
            return React.createElement("div", null, 
                 React.createElement("div", {style: {padding: 2, fontFamily: 'Arial', fontSize: '12px', width: '100%'}}, 
                    React.createElement("table", {id: "tbl_layoutList", border: "0"}, 
                            React.createElement("tbody", null, 
                            
                                this.state.list.map(function(item,index){
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

    var action = {
        module: '',
        maskId: '',
        source: [],
        encode:true,
        currentLayout: {},
        iconCalss: 'layout_icon',
        urls: {save: '/Common/SaveLayout',remove: '/Common/DeleteLayout'},
        actions: [{action: 'addOrRemoveColumn',className: 'iconcolumn',text: 'Add\Remove Columns'}, {action: 'save',className: 'iconsave',text: 'Save Layout'}, {action: 'delete',className: 'icondelete',text: 'Delete Layout'}, {action: 'reset', className: 'iconreset',text: 'Reset Layout'}],
        initDom: function(dom) {
            React.render(
                React.createElement(LayoutBase, {actions: action.actions, iconCalss: action.iconCalss}),
                dom
            );
            React.render(
                React.createElement("div", null, 
                   React.createElement(PopContainer, {popId: "removeLayoutPop", popTitle: "Delete Layouts"}), 
                   React.createElement(PopContainer, {popId: "addLaypoutPop", popTitle: "Save Layouts", height: "125"}), 
                   React.createElement(PopContainer, {popId: "msgPop", popTitle: "Message", height: "80"})
                ),
                $('<div>').appendTo(document.body)[0]
            );
            React.render(
                React.createElement(AddPopContent, null),
                document.getElementById('addLaypoutPop' + '_content')
            );
            React.render(
                 React.createElement(RemovePopContent, null),
                 document.getElementById('removeLayoutPop' + '_content')
            );
        },
        initEvent: function(dom,actions) {
            $("body").on("click", function(event) {
                $(dom).find("div:first").removeClass("open");
            });
            $.each(actions, function(i, item) {
                item.callback && Event.add(item.action, function() {
                    item.callback();
                });
            });
            Event.add("selected", function(item) {
                action.onSelected(item);
            }).add("addOrRemoveColumn", function() {
                action.onColumn();
            }).add("save", function() {
                setTimeout(function() {
                     $("#layout_name").val("").focus();
                });
                $("#addLaypoutPop").jqxWindow('open');
            }).add("saving", function(layoutName, isDefault, existsLayout) {
                action.saveLayout(layoutName, isDefault, existsLayout);
            }).add("delete", function() {
                $("#removeLayoutPop").jqxWindow({
                    height: 80 + Store.models().length * 21
                }).jqxWindow('open');
            }).add("deleting", function(layoutNames) {
                 action.deleteLayout(layoutNames);
            }).add("reset", function() {
                action.onReset && action.onReset();
            });
        },
        init: function() {
            Store.models(action.source);
            $.each(action.actions, function(i, item) {
                if (typeof this.action == 'function') {
                    this.callback = this.action;
                    this.action = 'custom' + i;
                }
            });
            action.initDom(this);
            action.initEvent(this,action.actions);
        },
        showMsg:function(message){
             if (message.length > 53) {
                height = 80 + (message.length / 53 - 1) * 15;
            }
            else {
                message = "<p style='text-align: center; white-space: pre-line;'>" + message + "</p>";
            }
            $("#msgPop_content").html(message);
            $("#msgPop").jqxWindow('open');
        },
        deleteLayout: function(layoutNames) {
            var source = {
                module: action.module,
                layoutNames: layoutNames
            };
            $.ajax({
                type: "post",
                url: action.urls.remove,
                dataType: "text",
                data: {
                    LayOutEntity:action.encode ? Base64.encode(JSON.stringify(source)):JSON.stringify(source)
                },
                cache: false,
                timeout: 1000 * 60,
                beforeSend: function() {
                    action.maskId && $(action.maskId).mask("Deleting layout data...");
                },
                complete: function() {
                    action.maskId && $(action.maskId).unmask();
                },
                success: function(response) {
                    var isDeleted = response.indexOf("true") < 0 ? false : true;
                    if (isDeleted) {
                        Store.remove(layoutNames);
                    }
                    action.onDeleted && action.onDeleted(source, isDeleted);
                    var message = "Delete layout ";
                    if (!isDeleted) {
                        message += " failed, Please try again!";
                    }
                    else {
                        message += " successfully!";
                    }
                    action.showMsg(message);
                }
            });
        },
        saveLayout: function(layoutName, isDefault, existsLayout) {
            var source = {
                isDefault: isDefault,
                layoutName: layoutName,
                module: action.module,
                layoutCriteria: action.queryLayoutForSave()
            };
            $.ajax({
                type: "post",
                url: action.urls.save,
                dataType: "text",
                data: {
                    LayOutEntity: action.encode?Base64.encode(JSON.stringify(source)):JSON.stringify(source)
                },
                cache: false,
                timeout: 1000 * 60,
                beforeSend: function() {
                    action.maskId && $(action.maskId).mask("Saving layout data...");
                },
                complete: function() {
                    action.maskId && $(action.maskId).unmask();
                },
                success: function(response) {
                    action.currentLayout = source;
                    action.currentLayout.LayoutName = source.layoutName;
                    action.currentLayout.LayoutCriteria = source.layoutCriteria;
                    existsLayout || Store.add(action.currentLayout);
                    var isSaved = response.indexOf("true") < 0 ? false : true;
                    action.onSaved && action.onSaved(source, isSaved);
                    var message = "Save layout ";
                    if (!isSaved) {
                        message += " failed, Please try again!";
                    }
                    else {
                        message += " successfully!";
                    }
                    action.showMsg(message);
                }
            });
        }
    };
    $v.ui.createPlugin({
        name: "Layout",
        options: {
            module: 'VantageSearch',
            maskId: '',
            source: [],
            encode:true,
            currentLayout: {},
            onSelected: function(item) {
            },
            onColumn: function() {},
            queryLayoutForSave: function() {
                return {};
            },
            onSaved: function(item, isSaved) {
            },
            onDeleted: function(item, isRemoved) {
            },
            onReset: function() {}
        },
        init: function() {
            $.extend(action, this.options);
            action.init.call(this.host[0]);
        },
    });
}(jQuery));