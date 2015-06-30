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
    var Event = {
        add: function(action, callback) {
            Event[action] || (Event[action] = $.Callbacks("once,memory")) && (Event[action].add(callback));
            return Event;
        },
        fire: function(action) {
            Event[action] && Event[action].fire.apply(null,Array.prototype.slice.call(arguments,1));
        }
    };

    var LayoutBase = React.createClass({
        getInitialState: function() {
            return {
                list: layout.source
            };
        },
        componentDidMount: function() {
            var that = this;
            var $dom = $(this.getDOMNode());
            $dom.on("click", function(event) {
                event.stopPropagation();
                $dom.toggleClass("open");
                if ($dom.hasClass('open')) {
                    that.setState({
                        list: layout.source
                    });
                }
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
                        layout.currentLayout = this;
                        return false;
                    }
                });
                Event.fire("selected",layout.currentLayout);
            });
        },
        render: function() {
            var that = this;
            return <div style={{position: "relative"}}>
                <div style={{cursor: "pointer"}}>
                    <span className={this.props.iconCalss}></span>
                </div>
                <ul  className="dropdown-menu pull-left">
                    {
                        that.state.list.map(function(item){
                            return <li><a>
                                <span data-check className="check" style={{visibility:layout.currentLayout.LayoutName == item.LayoutName ? "visible" : "hidden"}}>
                                </span>
                                <span>{item.LayoutName}</span>
                            </a></li>;
                        })
                    }
                    <li className="divider"></li>
                   
                     {
                        this.props.actions.map(function(item){
                            return <li><a data-action={item.action}>
                                <span className={item.className + ' icon'}></span>{item.text}
                            </a></li>;
                        })
                    }
                </ul>
            </div>
        }
    });

    var PopContainer = React.createClass({
        componentDidMount: function() {
            $(this.getDOMNode()).jqxWindow({
                autoOpen: false,
                isModal: true,
                height: this.props.height || 'auto',
                width: 300
            });
        },
        render: function() {
            return <div id={this.props.popId}>
                   <div className="popWindowheader">
                       <span>{this.props.popTitle}</span>
                   </div>
                   <div id= {this.props.popId+ "_content"} style={{overflow: 'hidden'}} className="popWindowContent">
                   </div>
               </div>;
        }
    });
    var AddContent = React.createClass({
        componentDidMount: function() {
            AddContent.ele = $(this.getDOMNode());
            AddContent.container = AddContent.ele.parents('div.jqx-window');
            setTimeout(function() {
                $("#layout_name", AddContent.ele).focus();
            })
        },
        addLayout: function() {
            var layoutName = $.trim($("#layout_name", AddContent.ele).val());
            if (layoutName == "") {
                $("#ErrorInput").html("Layout Name can not be Empty.").show();
                return;
            }
            var existsLayout = false;
            $.each(this.props.source, function(i, item) {
                if (layoutName.toLowerCase() == item.LayoutName.toLowerCase()) {
                    existsLayout = true;
                }
            });

            if (existsLayout && !confirm("The layout '" + layoutName + "' already exists.\nDo you want to replace?")) {
                return;
            }
            var isDefault = $("#layoutDefaultCheck", AddContent.ele)[0].checked == true ? 1 : 0;
            Event.fire('saving',layoutName, isDefault, existsLayout);
            AddContent.container.jqxWindow('close');
        },
        componentWillReceiveProps: function(nextProps) {
            setTimeout(function() {
                $("#layout_name", AddContent.ele).val("").focus();
            })
        },
        render: function() {
            return <div>
                <div style={{fontWeight : 'bold', height: 18, padding: 2, fontFamily: 'Arial', fontSize: 12,width: '100%'}}>
                    You can save your layout.</div>
                <table cellpadding="0" cellspacing="0" style={{height: 12, padding: 2, fontFamily: 'Arial',fontSize: 11, width: '100%'}}>
                    <tbody>
                        <tr>
                            <td style={{width: 35, fontWeight: 'bold'}}>
                                Layout:
                            </td>
                            <td>
                                <input id="layout_name" style={{height: 15, border: '1px solid'}} />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div style={{height: 12, padding: 2, fontFamily: 'Arial', fontSize: 11, width: '100%',color: 'Red'}}>
                    <span id="ErrorInput" style={{fontWeight: 'bold', display: 'none'}}></span>
                </div>
                <div style={{height: 18, padding: 2, textAlign: 'center', fontFamily: 'Arial', fontSize: 13, width: '100%'}}>
                    <input type="button" id="btnSaveLayout" onClick={this.addLayout} value="Save" className="popWindowButton" />
                    <input type="checkbox" id="layoutDefaultCheck" />
                    <span style={{fontSize: 13}}>Set as Default</span>
                </div>
            </div>

        }
    });
    var RemoveContent = React.createClass({
        componentDidMount: function() {
            RemoveContent.ele = $(this.getDOMNode());
            RemoveContent.container = RemoveContent.ele.parents('div.jqx-window');
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
            RemoveContent.container.jqxWindow('close');

        },
        closePop: function() {
            RemoveContent.container.jqxWindow('close');
        },
        render: function() {
            return <div>
                 <div style={{padding: 2, fontFamily: 'Arial', fontSize: '12px', width: '100%'}}>
                    <table id="tbl_layoutList" border="0">
                            <tbody>
                            {
                                this.props.list.map(function(item,index){
                                    var id = 'chk_filter_' + index;
                                    return <tr><td>
                                        <input id={id} value={item.LayoutName} type='checkbox' />
                                        <label htmlFor={id}>{ item.LayoutName }</label>
                                    </td></tr>
                                })
                            }
                        </tbody>
                    </table>
                </div>
                <div style={{height: 20,padding: 2,fontFamily: 'Arial', textAlign: 'center',fontSize: '11px', width: '100%'}}>
                    <span>
                        <button className="popWindowButton" onClick={this.deleteLayout}>Delete</button>
                        <span>&nbsp;&nbsp;</span>
                        <button className="popWindowButton" onClick={this.closePop}>Cancel</button>
                    </span>
                </div>
            </div>

        }
    });

    var layout = {
        source: [],
        maskId: '',
        iconCalss: 'layout_icon',
        urls: {save: '/Common/SaveLayout',remove: '/Common/DeleteLayout'},
        actions: [{action: 'addOrRemoveColumn',className: 'iconcolumn',text: 'Add\Remove Columns'}, {action: 'save',className: 'iconsave',text: 'Save Layout'}, {action: 'delete',className: 'icondelete',text: 'Delete Layout'}, {action: 'reset', className: 'iconreset',text: 'Reset Layout'}],
        currentLayout: {},
        initDom: function(dom) {
            React.render(
                <LayoutBase actions={layout.actions} iconCalss ={layout.iconCalss}/>,
                dom
            );
            React.render(
                <div>
               <PopContainer popId='removeLayoutPop'  popTitle='Delete Layouts'/>
               <PopContainer popId='addLaypoutPop'  popTitle='Save Layouts' height='125'/>
               <PopContainer popId='msgPop'  popTitle='Message' height='80'/>
            </div>,
                $('<div>').appendTo(document.body)[0]
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
                layout.onSelected(item);
            }).add("addOrRemoveColumn", function() {
                layout.onColumn();
            }).add("save", function() {
                React.render(
                    <AddContent  source={layout.source} />,
                    document.getElementById('addLaypoutPop' + '_content')
                );
                $("#addLaypoutPop").jqxWindow('open');
            }).add("saving", function(layoutName, isDefault, existsLayout) {
                layout.saveLayout(layoutName, isDefault, existsLayout);
            }).add("delete", function() {
                React.render(
                    <RemoveContent list={layout.source}  />,
                    document.getElementById('removeLayoutPop' + '_content')
                );
                $("#removeLayoutPop").jqxWindow({
                    height: 80 + layout.source.length * 21
                }).jqxWindow('open');
            }).add("deleting", function(layoutNames) {
                 layout.deleteLayout(layoutNames);
            }).add("reset", function() {
                layout.onReset && layout.onReset();
            });
        },
        init: function() {
            $.each(layout.actions, function(i, item) {
                if (typeof this.action == 'function') {
                    this.callback = this.action;
                    this.action = 'custom' + i;
                }
            });
            layout.initDom(this);
            layout.initEvent(this,layout.actions);
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
                module: layout.module,
                layoutNames: layoutNames
            };
            $.ajax({
                type: "post",
                url: layout.urls.remove,
                dataType: "text",
                data: {
                    LayOutEntity:layout.encode ? Base64.encode(JSON.stringify(source)):JSON.stringify(source)
                },
                cache: false,
                timeout: 1000 * 60,
                beforeSend: function() {
                    layout.maskId && $(layout.maskId).mask("Deleting layout data...");
                },
                complete: function() {
                    layout.maskId && $(layout.maskId).unmask();
                },
                success: function(response) {
                    var isDeleted = response.indexOf("true") < 0 ? false : true;
                    if (isDeleted) {
                        var newLayout = [];
                        $.each(layout.source, function(i, val) {
                            if (layoutNames.indexOf(val.LayoutName) < 0) {
                                newLayout.push(val);
                            }
                        });
                        layout.source = newLayout;
                    }
                    layout.onDeleted && layout.onDeleted(source, isDeleted);
                    var message = "Delete layout ";
                    if (!isDeleted) {
                        message += " failed, Please try again!";
                    }
                    else {
                        message += " successfully!";
                    }
                    layout.showMsg(message);
                }
            });
        },
        saveLayout: function(layoutName, isDefault, existsLayout) {
            var source = {
                isDefault: isDefault,
                layoutName: layoutName,
                module: layout.module,
                layoutCriteria: layout.queryLayoutForSave()
            };
            $.ajax({
                type: "post",
                url: layout.urls.save,
                dataType: "text",
                data: {
                    LayOutEntity: layout.encode?Base64.encode(JSON.stringify(source)):JSON.stringify(source)
                },
                cache: false,
                timeout: 1000 * 60,
                beforeSend: function() {
                    layout.maskId && $(layout.maskId).mask("Saving layout data...");
                },
                complete: function() {
                    layout.maskId && $(layout.maskId).unmask();
                },
                success: function(response) {
                    layout.currentLayout = source;
                    layout.currentLayout.LayoutName = source.layoutName;
                    layout.currentLayout.LayoutCriteria = source.layoutCriteria;
                    existsLayout || layout.source.push(layout.currentLayout);
                    var isSaved = response.indexOf("true") < 0 ? false : true;
                    layout.onSaved && layout.onSaved(source, isSaved);
                    var message = "Save layout ";
                    if (!isSaved) {
                        message += " failed, Please try again!";
                    }
                    else {
                        message += " successfully!";
                    }
                    layout.showMsg(message);
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
            $.extend(layout, this.options);
            layout.init.call(this.host[0]);
        },
    });
}(jQuery));