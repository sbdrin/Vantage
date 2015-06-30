$.jqx._jqxGrid.prototype._updatefilterpanelBak || $.extend($.jqx._jqxGrid.prototype, {
    _updatefilterpanelBak: $.jqx._jqxGrid.prototype._updatefilterpanel,
    _updatefilterpanel: function(r, o, D) {
        this._updatefilterpanelBak(r, o, D);
        var g = $(o);
        var K = g.find("#filterclearbutton" + r.element.id);
        var k = g.find("#filterbutton" + r.element.id);
        var N = r._getcolumntypebydatafield(D);
        var y = D.filter;
        var j = g.find(".filtertext1" + r.element.id);
        var f = g.find("#filter1" + r.element.id);
        if (this.filtermode === "default") {
            j.on("keydown", function(event) {
                if (event.keyCode == 13) {
                    setTimeout(function() {
                        k.click();
                    });
                }
            });
            if (N == "number" || N == "date") {
                var J = new $.jqx.filter();
                var n = J.getoperatorsbyfiltertype(N = "number" ? "numericfilter" : "datefilter");
                f.jqxDropDownList({
                    autoDropDownHeight: true,
                    selectedIndex: 0
                });
                if (y != null) {
                    var e = y.getfilterat(0);
                    if (r.updatefilterconditions) {
                        n = [];
                        var q = r.updatefilterconditions(w, n);
                        if (q != undefined) {
                            for (var L = 0; L < q.length; L++) {
                                q[L] = q[L].toUpperCase();
                            }
                            y.setoperatorsbyfiltertype(w, q);
                            n = q;
                        }
                    }
                    if (e != null) {
                        var C = n.indexOf(e.comparisonoperator);
                        f.jqxDropDownList({
                            selectedIndex: C
                        });
                    }
                }
            }
        }
        // g.find("#filter1" + r.element.id).jqxDropDownList("selectItem", "equal");
        g.find("#filter2" + r.element.id).hide();
        g.find("#filter3" + r.element.id).hide();
        g.find(".filtertext2" + r.element.id).hide();
        setTimeout(function() {
            g.parent().parent().height(190);
        }, 0);
        window[o.id + D.datafield] = window[o.id + D.datafield] || {};
        j.val(window[o.id + D.datafield].old_text1 || "");

        this.removeHandler(k, "click");
        this.addHandler(k, "click", function() {

            window[o.id + D.datafield].old_text1 = j.val();
            if (D.cellsformat && !D.cellsformat.indexOf("f")) {
                j.val() && j.val(j.val().replace(/,/g, ""));
            }
            r._buildfilter(r, o, D);
            r._closemenu();
        });
        this.removeHandler(K, "click");
        this.addHandler(K, "click", function() {
            r._clearfilter(r, o, D);
            r._closemenu();
            window[o.id + D.datafield] = undefined;
        });
    }
});

String.prototype.format = function() {
    var str = this;
    if (arguments.length === 0) {
        return str;
    }

    for (var i = 0; i < arguments.length; i++) {
        var re = new RegExp('\\{' + i + '\\}', 'gm');
        if (arguments[i] !== undefined || arguments[i] !== null) {
            str = str.replace(re, arguments[i]);
        }
        else {
            str = str.replace(re, '');
        }
    }
    return str;
};

(function(undefined) {
    //strict model . must have ';' every row end. must have keyword 'var' when declare new variables.
    'use strict';
    //define namespace. OptionChart is js file name.
    window.CV_CREDIT = window.CV_CREDIT || {};

    //to avoid reload.
    if (CV_CREDIT.VantageSearch) {
        return;
    }

    var variables = {
        tier: 1,
        gridTables: [],
        userInfo: {
            GP_NUM: "",
            LOGIN_ID: "",
            USER_TYPE: ""
        },
        ticker: undefined,
        rootID: "#VantageSearch_divMain",
        exportType: 'xls',
        currentTabID: "AxesDataTable",
        currentLayoutData: {},
        tabNames: {
            Axes: "AXE",
            Inventory: "Inventory",
            BondTrades: "Trading Activity",
            RFQ: "RFQ",
            Inquiry: "Inquiry"
        },
        ids: {
            windowSaveLayoutID: "#VantageSearch_Save_Layout_Window",
            windowDeleteLayoutID: "#VantageSearch_Delete_Layout_Window"
        },
        tabIDs: {
            UnfilledInquiry: "#VantageSearch_Tabs_UnfilledInquiry",
            Axes: "#VantageSearch_Tabs_Axes",
            Inventory: "#VantageSearch_Tabs_Inventory",
            BondTrades: "#VantageSearch_Tabs_BondTrades",
            RFQ: "#VantageSearch_Tabs_RFQ",
            Inquiry: "#VantageSearch_Tabs_Inquiry"
        },
        urls: {
            exportUrl: '/Common/ExportGridData',
            getQuickSearchFilterData: "/CreditWeb/VantageSearch/GetQuickSearchFilterData",
            vantageSearchUrl: "/CreditWeb/VantageSearch/RetrieveDataFromVantageSearch",
            getInventoryData: "/CreditWeb/VantageSearch/GetInventoryData",
            getBondTradesData: "/CreditWeb/VantageSearch/GetBondTradesData",
            getRFQData: "/CreditWeb/VantageSearch/GetRFQData",
            getInquiryData: "/CreditWeb/VantageSearch/GetInquiryData",
            getAxesData: "/CreditWeb/VantageSearch/GetAxesData",
            saveLayout: '/Common/SaveLayout',
            deleteLayout: '/Common/DeleteLayout'
        }
    };
    
    var Event ={
        add:function(action,callback){
            Event[action] || (Event[action] = $.Callbacks("once,memory")) &&(Event[action].add(callback));
            return Event;
        },
        fire:function(action,data){
            Event[action] && Event[action].fire(data);
        }
    };

    var VantageSearchTabs = {
        init: function() {
            VantageSearchTabs.ids = {
                tabsdiv: $("#VantageSearch_Tabs").show()
            };
            if (variables.tier == 1) {
                VantageSearchTabs.ids.tabsdiv.find(".Banner").remove().end().jqxTabs({
                    position: 'top',
                    theme: "summer",
                    selectedItem: 0
                }).on('selected', function(event) {
                    //				var list = document.getElementById(grid[variables.currentTabID].ele.slice(1));
                    //                while(list.firstChild){
                    //                    list.removeChild(list.firstChild);
                    //                }
                    $("#columnLayoutList").jqxWindow('close');
                    $("#VantageSearch_divAdvancedSearchPopup").jqxWindow("close");
                    variables.currentTabID = VantageSearchTabs.ids.tabsdiv.jqxTabs('getContentAt', event.args.item).data("action");
                    BaseGrid.initGrid([variables.currentTabID]);
                });
            }
            else {
                $("body").height("auto");
                VantageSearchTabs.ids.tabsdiv.find("ul").remove();
            }
        }
    };

    var VantageSearchCalendar = {
        isCalendarFirstLoad: true,
        strIDs: {
            datepickerDropDownFrom: "VantageSearch_filter_divDatepickerSelect_from",
            datepickerFrom: "VantageSearch_filter_datepicker_from",
            datepickerValueFrom: "VantageSearch_filter_datepickerValue_from",
            datepickerDropDownTo: "VantageSearch_filter_divDatepickerSelect_to",
            datepickerTo: "VantageSearch_filter_datepicker_to",
            datepickerValueTo: "VantageSearch_filter_datepickerValue_to"
        },
        objIDs: {
            datepickerDropDownFrom: null,
            datepickerFrom: null,
            datepickerValueFrom: null,
            datepickerDropDownTo: null,
            datepickerTo: null,
            datepickerValueTo: null
        },
        settings: {
            jqxDatepickerDropDownFrom: {
                source: null,
                width: 85,
                height: 15,
                theme: "summer",
                autoDropDownHeight: true,
                selectionRenderer: null
            },
            jqxDatepickerDropDownTo: {
                source: null,
                width: 85,
                height: 15,
                theme: "summer",
                autoDropDownHeight: true,
                selectionRenderer: null
            }
        },
        loadCalendar: function(id) {
            var currDate = new Date();
            var fromDate = new Date();
            switch (id) {
                case "filter_btn_time_period_Today":
                    fromDate.addDays(0);
                    break;
                case "filter_btn_time_period_2D":
                    fromDate.addDays(-1);
                    break;
                case "filter_btn_time_period_3D":
                    fromDate.addDays(-2);
                    break;
                case "filter_btn_time_period_1W":
                    fromDate.addWeeks(-1);
                    break;
                case "filter_btn_time_period_2W":
                    fromDate.addWeeks(-2);
                    break;
                case "filter_btn_time_period_1M":
                    fromDate.addMonths(-1);
                    break;
                case "filter_btn_time_period_3M":
                    fromDate.addMonths(-3);
                    break;
                case "filter_btn_time_period_6M":
                    fromDate.addMonths(-6);
                    break;
                case "filter_btn_time_period_12M":
                    fromDate.addMonths(-12);
                    break;
                case "filter_btn_time_period_18M":
                    fromDate.addMonths(-18);
                    break;
                default:
                    break;
            }
            VantageSearchCalendar.objIDs.datepickerValueFrom.html(fromDate.toString("MM/dd/yyyy"));
            VantageSearchCalendar.objIDs.datepickerFrom.val(fromDate.toString("MM/dd/yyyy"));
            VantageSearchCalendar.objIDs.datepickerValueTo.html(currDate.toString("MM/dd/yyyy"));
            VantageSearchCalendar.objIDs.datepickerTo.val(currDate.toString("MM/dd/yyyy"));
        },
        initCalendar: function(strIDs_datepicker, strIDs_datepickerValue) {
            if (window.ActiveXObject && navigator.appVersion.indexOf("MSIE 8.0") > 0) {
                return "<input type='text' id='" + strIDs_datepicker + "' class='datepicker' readonly='readonly' style='width:0px!important; padding: 0px 0px!important;border-width:0px;margin-left:-6px;margin-right:3px;float: left;' /><span id='" + strIDs_datepickerValue + "' style='font-size:11px;font-family:Tahoma;float: left;'></span>";
            }
            return "<input type='text' id='" + strIDs_datepicker + "' class='datepicker' readonly='readonly' style='width:0px!important; padding: 0px 0px!important;border-width:0px;margin-left:-7px;margin-right:4px' /><span id='" + strIDs_datepickerValue + "' style='font-size:11px;font-family:Arial;'></span>";
        },
        initObjIDs: function() {
            VantageSearchCalendar.objIDs.datepickerFrom = $("#" + VantageSearchCalendar.strIDs.datepickerFrom);
            VantageSearchCalendar.objIDs.datepickerValueFrom = $("#" + VantageSearchCalendar.strIDs.datepickerValueFrom);
            VantageSearchCalendar.objIDs.datepickerTo = $("#" + VantageSearchCalendar.strIDs.datepickerTo);
            VantageSearchCalendar.objIDs.datepickerValueTo = $("#" + VantageSearchCalendar.strIDs.datepickerValueTo);
        },
        initDatepickerEvent: function(datepickerDropDown, datepicker, datepickerValue) {
            datepickerDropDown.on("open", function(event) {
                setTimeout(function() {
                    datepicker.datepicker("show");
                }, 0);
            });
            datepicker.datepicker({
                changeMonth: true
            });
            datepicker.bind("change", function() {
                VantageSearchPopup.uncheckAllChildButton("filter_btn_time_period_");
                datepickerValue.html($(this).val());
            });
        },
        initDatepicker: function(datepickerDropDown, datepicker, datepickerValue) {
            VantageSearchCalendar.initDatepickerEvent(datepickerDropDown, datepicker, datepickerValue);
            if (navigator.userAgent.indexOf("Firefox") > 0) {
                datepickerValue.css("padding-left", "5px");
            }
        },
        initDatepickerSetting: function() {
            VantageSearchCalendar.settings.jqxDatepickerDropDownFrom.selectionRenderer = function(htmlString) {
                return VantageSearchCalendar.initCalendar(VantageSearchCalendar.strIDs.datepickerFrom, VantageSearchCalendar.strIDs.datepickerValueFrom);
            };
            VantageSearchCalendar.objIDs.datepickerDropDownFrom.jqxDropDownList(VantageSearchCalendar.settings.jqxDatepickerDropDownFrom);

            VantageSearchCalendar.settings.jqxDatepickerDropDownTo.selectionRenderer = function(htmlString) {
                return VantageSearchCalendar.initCalendar(VantageSearchCalendar.strIDs.datepickerTo, VantageSearchCalendar.strIDs.datepickerValueTo);
            };
            VantageSearchCalendar.objIDs.datepickerDropDownTo.jqxDropDownList(VantageSearchCalendar.settings.jqxDatepickerDropDownTo);
        },
        init: function() {
            if (VantageSearchCalendar.isCalendarFirstLoad) {
                VantageSearchCalendar.objIDs.datepickerDropDownFrom = $("#" + VantageSearchCalendar.strIDs.datepickerDropDownFrom);
                VantageSearchCalendar.objIDs.datepickerDropDownTo = $("#" + VantageSearchCalendar.strIDs.datepickerDropDownTo);
                VantageSearchCalendar.initDatepickerSetting();
                VantageSearchCalendar.initObjIDs();
                VantageSearchCalendar.initDatepicker(VantageSearchCalendar.objIDs.datepickerDropDownFrom, VantageSearchCalendar.objIDs.datepickerFrom, VantageSearchCalendar.objIDs.datepickerValueFrom);
                VantageSearchCalendar.initDatepicker(VantageSearchCalendar.objIDs.datepickerDropDownTo, VantageSearchCalendar.objIDs.datepickerTo, VantageSearchCalendar.objIDs.datepickerValueTo);
                VantageSearchCalendar.objIDs.datepickerFrom.on("change", function() {
                    VantageSearchCalendar.objIDs.datepickerTo.datepicker('option', 'minDate', VantageSearchCalendar.objIDs.datepickerFrom.datepicker('getDate'));
                });
                VantageSearchCalendar.objIDs.datepickerTo.on("change", function() {
                    VantageSearchCalendar.objIDs.datepickerFrom.datepicker('option', 'maxDate', VantageSearchCalendar.objIDs.datepickerTo.datepicker('getDate'));
                });
                VantageSearchCalendar.isCalendarFirstLoad = false;
            }
        }
    };

    var VantageSearchPopup = {
        isSwitchUserPopupFirstLoad: true,
        isMessagePopupFirstLoad: true,
        isAdvancedSearchPopupFirstLoad: true,
        strIDs: {
            switchUserPopup: "VantageSearch_divSwitchUserPopup",
            btnCloseSwitchUserPopup: "VantageSearch_divSwitchUserPopup_btnClose",
            divSwitchUser: "VantageSearch_divSwitchUserPopup_Message",
            btnSwitchUserSearch: "VantageSearch_divSwitchUserhPopup_btnSubmit",
            btnSwitchUserReset: "VantageSearch_divSwitchUserPopup_btnReset",
            messagePopup: "VantageSearch_divMessagePopup",
            btnCloseMessagePopup: "VantageSearch_divMessagePopup_btnClose",
            divMessage: "VantageSearch_divMessagePopup_Message",
            advancedSearchPopup: "VantageSearch_divAdvancedSearchPopup",
            btnSearch: "VantageSearch_divAdvancedSearchPopup_btnSearch",
            btnReset: "VantageSearch_divAdvancedSearchPopup_btnReset",
            btnCloseAdvancedSearchPopup: "VantageSearch_divAdvancedSearchPopup_btnClose"
        },
        ids: {
            switchUserPopup: null,
            btnCloseSwitchUserPopup: null,
            divSwitchUser: null,
            btnSwitchUserSearch: null,
            btnSwitchUserReset: null,
            messagePopup: null,
            btnCloseMessagePopup: null,
            divMessage: null,
            advancedSearchPopup: null,
            btnSearch: null,
            btnReset: null,
            btnCloseAdvancedSearchPopup: null
        },
        settings: {
            switchUserPopup: {
                width: 350,
                height: 200,
                title: "Switch User",
                autoOpen: false,
                resizable: false,
                isModal: true,
                modalOpacity: 0.1,
                position: "center"
            },
            messagePopup: {
                width: 350,
                height: 100,
                title: "Message",
                autoOpen: false,
                resizable: false,
                isModal: true,
                modalOpacity: 0.1,
                position: "center"
            },
            advancedSearchPopup: {
                width: 580,
                height: 380,
                autoOpen: false,
                resizable: false,
                zIndex: 6000,
                position: "center"
            }
        },
        messages: {
            noDataMsg: "There is no data to export!",
            retrieveDataFailedMsg: "Retrieve data from server failed, please try again!"
        },
        openMessagePopup: function(message) {
            if (VantageSearchPopup.isMessagePopupFirstLoad) {
                VantageSearchPopup.initMessagePopup();
                VantageSearchPopup.isMessagePopupFirstLoad = false;
            }
            var width = VantageSearchPopup.settings.messagePopup.width;
            var height = VantageSearchPopup.settings.messagePopup.height;
            if (message.length > 53) {
                height += (message.length / 53 - 1) * 15;
            }
            else {
                message = "<p style='text-align: center; white-space: pre-line;'>" + message + "</p>";
            }
            VantageSearchPopup.ids.divMessage.html(message);
            //            VantageSearchPopup.ids.messagePopup.jqxWindow("open");
            VantageSearchPopup.showMessagePopup(width, height);
        },
        openSwitchUserPopup: function(message) {
            if (VantageSearchPopup.isSwitchUserPopupFirstLoad) {
                VantageSearchPopup.initSwitchUserPopup();
                VantageSearchPopup.isSwitchUserPopupFirstLoad = false;
            }
            VantageSearchPopup.ids.switchUserPopup.jqxWindow("open");
        },
        openAdvancedSearchPopup: function() {
            if (!VantageSearchPopup.ids.advancedSearchPopup.data("jqxWindow")) {
                VantageSearchPopup.initAdvancedSearchPopup();
                VantageSearchPopup.loadDefaultValue();
            }
            VantageSearchPopup.ids.advancedSearchPopup.jqxWindow("open");
        },
        showMessagePopup: function(width, height) {
            var position = VantageSearchPopup.setPopupPositionCenter(variables.rootID, width, height);
            VantageSearchPopup.ids.messagePopup.jqxWindow({
                width: width,
                height: height,
                position: position
            });
            VantageSearchPopup.ids.messagePopup.jqxWindow("refresh");
            VantageSearchPopup.ids.messagePopup.jqxWindow("open");
        },
        setPopupPosition: function(rootObj, popupWidth, offsetY) {
            var width = rootObj.width();
            //var height = rootObj.height();
            var left = rootObj.position().left;
            var top = rootObj.position().top;
            var positionX = left + (width - popupWidth) / 2;
            var positionY = top + offsetY;

            var position = {
                x: positionX,
                y: positionY
            };
            return position;
        },
        setPopupPositionCenter: function(rootObj, popupWidth, popupHeight) {
            var width = rootObj.width();
            var height = rootObj.height();
            var left = rootObj.position().left;
            var top = rootObj.position().top;
            var positionX = left + (width - popupWidth) / 2;
            var positionY = top + (height - popupHeight) / 2;

            var position = {
                x: positionX,
                y: positionY
            };
            return position;
        },
        initMessagePopupEvent: function() {
            VantageSearchPopup.ids.btnCloseMessagePopup.bind("click", function() {
                VantageSearchPopup.ids.messagePopup.jqxWindow("close");
            });
        },
        initSwitchUserPopupEvent: function() {
            VantageSearchPopup.ids.btnCloseSwitchUserPopup.bind("click", function() {
                VantageSearchPopup.ids.switchUserPopup.jqxWindow("close");
            });
            VantageSearchPopup.ids.btnSwitchUserSearch.bind("click", function() {
                VantageSearchPopup.switchUser();
            });
            VantageSearchPopup.ids.btnSwitchUserReset.bind("click", function() {
                $.each(VantageSearchPopup.ids.switchUserPopup.find('input[id^=switchuser_][type=text]'), function() {
                    $(this).val("");
                });
            });
        },
        switchUser: function() {
            variables.userInfo.USER_TYPE = $("#switchuser_USER_TYPE").val();
            variables.userInfo.LOGIN_ID = $("#switchuser_LOGIN_ID").val();
            variables.userInfo.GP_NUM = $("#switchuser_GP_NUM").val();
            VantageSearchPopup.ids.switchUserPopup.jqxWindow("close");
        },
        changeButtonStyle: function(obj) {
            $(obj).toggleClass("checked");
        },
        uncheckAllChildButton: function(buttonPerfix, excludeID) {
            $.each($('input[id^=' + buttonPerfix + '][type=button]').not("#" + excludeID), function() {
                $(this).removeClass("checked");
            });
        },
        clearFilter: function() {
            $.each(VantageSearchPopup.ids.advancedSearchPopup.find('textarea'), function() {
                $(this).val("");
            });
            $.each(VantageSearchPopup.ids.advancedSearchPopup.find('input[id^=filter_][type=text]'), function() {
                $(this).val("");
            });
            $.each(VantageSearchPopup.ids.advancedSearchPopup.find('input[id^=filter_][type=button]'), function() {
                $(this).removeClass("checked");
            });
            if (VantageSearchCalendar.objIDs.datepickerValueFrom) {
                VantageSearchCalendar.objIDs.datepickerValueFrom.html("");
                VantageSearchCalendar.objIDs.datepickerFrom.val("");
                VantageSearchCalendar.objIDs.datepickerValueTo.html("");
                VantageSearchCalendar.objIDs.datepickerTo.val("");
            }
        },
        buildFilterCriteria: function() {
            var filterCriteria = {
                UserSearchType: "AdvanceSearch",
                paging: true,
                currPage: 1,
                pageSize: 400,
                Time: "",
                SearchStartDate: "",
                endDate: "",
                Sector: "",
                Currency: "",
                CITI_BUYSELL: "",
                Rating: "",
                MaturityFromTo: "",
                CouponFromTo: "",
                Ticker: "",
                Cusip: ""
            };

            if (variables.userInfo.USER_TYPE) {
                filterCriteria.USER_TYPE = variables.userInfo.USER_TYPE;
            }
            if (variables.userInfo.LOGIN_ID) {
                filterCriteria.LOGIN_ID = variables.userInfo.LOGIN_ID;
            }
            if (variables.userInfo.GP_NUM) {
                filterCriteria.GP_NUM = variables.userInfo.GP_NUM;
            }

            if (VantageSearchCalendar.objIDs.datepickerValueFrom.html()) {
                filterCriteria.SearchStartDate = (new Date(VantageSearchCalendar.objIDs.datepickerValueFrom.html())).toString("yyyyMMdd");
            }
            if (VantageSearchCalendar.objIDs.datepickerValueTo.html()) {
                filterCriteria.endDate = (new Date(VantageSearchCalendar.objIDs.datepickerValueTo.html())).toString("yyyyMMdd");
            }

            filterCriteria.Sector = [];
            $.each($('input[id^=filter_btn_sector_][type=button]'), function() {
                if ($(this).hasClass("checked")) {
                    filterCriteria.Sector.push(this.value);
                }
            });
            filterCriteria.Sector = filterCriteria.Sector.join("#");
            filterCriteria.Currency = [];
            $.each($('input[id^=filter_btn_ccy_][type=button]'), function() {
                if ($(this).hasClass("checked")) {
                    filterCriteria.Currency.push(this.value);
                }
            });
            filterCriteria.Currency = filterCriteria.Currency.join(",");
            filterCriteria.CITI_BUYSELL = [];
            $.each($('input[id^=filter_btn_citiBS_][type=button]'), function() {
                if ($(this).hasClass("checked")) {
                    filterCriteria.CITI_BUYSELL.push(this.value);
                }
            });
            filterCriteria.CITI_BUYSELL = filterCriteria.CITI_BUYSELL.join(",");
            filterCriteria.Rating = [];
            $.each($('input[id^=filter_btn_rating_][type=button]'), function() {
                if ($(this).hasClass("checked")) {
                    filterCriteria.Rating.push($(this).data("rating"));
                }
            });
            filterCriteria.Rating = filterCriteria.Rating.join(",");

            var minMaturity = $("#filter_txt_maturity_min").val();
            var maxMaturity = $("#filter_txt_maturity_max").val();
            if (minMaturity != "" && maxMaturity != "") {
                filterCriteria.MaturityFromTo = minMaturity + "-" + maxMaturity;
            }
            else if (minMaturity != "") {
                filterCriteria.Maturity = minMaturity;
            }
            else if (maxMaturity != "") {
                filterCriteria.Maturity = maxMaturity;
            }
            var minCoupon = $("#filter_txt_coupon_min").val();
            var maxCoupon = $("#filter_txt_coupon_max").val();
            if (minCoupon != "" && maxCoupon != "") {
                filterCriteria.CouponFromTo = minCoupon + "-" + maxCoupon;
            }
            else if (minCoupon != "") {
                filterCriteria.Coupon = minCoupon;
            }
            else if (maxCoupon != "") {
                filterCriteria.Coupon = maxCoupon;
            }
            filterCriteria.Ticker = $("#filter_txt_ticker").val();
            var cusipOrisin = $("#filter_txt_cusip_isin").val();
            if (cusipOrisin.length > 9) {
                filterCriteria.ISIN = cusipOrisin;
            }
            else {
                filterCriteria.Cusip = cusipOrisin;
            }

            return filterCriteria;
        },
        findFlash: function() {
            if (VantageSearchPopup.ids.btnSearch.css('color').toString().toUpperCase().replace(/ /g, "") == "RGB(255,0,0)") {
                VantageSearchPopup.ids.btnSearch.css('color', 'black').css('font-weight', '');
            }
            else {
                VantageSearchPopup.ids.btnSearch.css('color', 'Red').css('font-weight', 'bold');
            }
            VantageSearchPopup.flashTimer = setTimeout("CV_CREDIT.VantageSearch.findFlash()", 600);
        },
        refreshFindButton: function() {
            var filterStr = VantageSearchPopup.getFilterString();
            if (VantageSearchPopup.advanceSearchFilterValue != filterStr && VantageSearchPopup.flashTimer == null) {
                VantageSearchPopup.findFlash();
            }
            else {
                if (VantageSearchPopup.advanceSearchFilterValue == filterStr && VantageSearchPopup.flashTimer != null) {
                    clearTimeout(VantageSearchPopup.flashTimer);
                    VantageSearchPopup.flashTimer = null;
                    VantageSearchPopup.ids.btnSearch.css('color', 'black').css('fontWeight', '');
                }
            }
            setTimeout("CV_CREDIT.VantageSearch.refreshFindButton()", 400);
        },
        getFilterString: function() {
            return $.toJSON(VantageSearchPopup.buildFilterCriteria());
        },
        resetFilter: function() {
            VantageSearchPopup.clearFilter();
            VantageSearchPopup.loadDefaultValue();
        },
        search: function() {
            variables.currentDate = $("input[id^=filter_btn_time_period][class=checked]").val();
            if (variables.currentDate) {
                if (variables.currentDate != "Today") {
                    variables.currentDate = "In the last " + variables.currentDate;
                }
            }
            else {
                variables.currentDate = " From ";
                if (VantageSearchCalendar.objIDs.datepickerValueFrom.html()) {
                    variables.currentDate += (new Date(VantageSearchCalendar.objIDs.datepickerValueFrom.html())).toString("MM/dd/yyyy");
                }
                variables.currentDate += " to ";
                if (VantageSearchCalendar.objIDs.datepickerValueTo.html()) {
                    variables.currentDate += (new Date(VantageSearchCalendar.objIDs.datepickerValueTo.html())).toString("MM/dd/yyyy");
                }
            }
            VantageSearchPopup.ids.advancedSearchPopup.jqxWindow("close");
            $("#columnLayoutList").jqxWindow('close');
            VantageSearchFilter.filterValue = VantageSearchPopup.getFilterString();
            VantageSearchPopup.advanceSearchFilterValue = VantageSearchFilter.filterValue;
            VantageSearchFilter.getDataFromServer();
            VantageSearchFilter.resetFilter();
        },
        _change_rating_HG: function() {
            VantageSearchPopup.changeButtonStyle(document.getElementById("filter_btn_rating_AAA"));
            VantageSearchPopup.changeButtonStyle(document.getElementById("filter_btn_rating_AA"));
            VantageSearchPopup.changeButtonStyle(document.getElementById("filter_btn_rating_A"));
            VantageSearchPopup.changeButtonStyle(document.getElementById("filter_btn_rating_BBB"));
        },
        _change_rating_HY: function() {
            VantageSearchPopup.changeButtonStyle(document.getElementById("filter_btn_rating_BB"));
            VantageSearchPopup.changeButtonStyle(document.getElementById("filter_btn_rating_B"));
            VantageSearchPopup.changeButtonStyle(document.getElementById("filter_btn_rating_CCC"));
            VantageSearchPopup.changeButtonStyle(document.getElementById("filter_btn_rating_CC"));
            VantageSearchPopup.changeButtonStyle(document.getElementById("filter_btn_rating_C"));

        },
        loadDefaultValue: function() {
            $("#filter_btn_time_period_6M").click();
        },
        initAdvancedSearchPopupEvent: function() {
            var $popup = $("#VantageSearch_divAdvancedSearchPopup_Content");
            VantageSearchPopup.ids.btnCloseAdvancedSearchPopup.bind("click", function() {
                VantageSearchPopup.ids.advancedSearchPopup.jqxWindow("close");
            });
            $popup.find('#maturity_filter').on("mouseenter", function() {
                $(this).prev().show();
            }).on("mouseleave", function() {
                $(this).prev().hide();
            });
            $popup.find("p>input[changestyle]").on("click", function(event) {
                VantageSearchPopup.changeButtonStyle(this);
                if (this.id.indexOf("filter_btn_time_period_") != -1) {
                    VantageSearchPopup.uncheckAllChildButton("filter_btn_time_period_", this.id);
                    VantageSearchCalendar.loadCalendar(this.id);
                    VantageSearchCalendar.objIDs.datepickerFrom.datepicker('option', 'maxDate', VantageSearchCalendar.objIDs.datepickerTo.val());
                    VantageSearchCalendar.objIDs.datepickerTo.datepicker('option', 'minDate', VantageSearchCalendar.objIDs.datepickerFrom.val());
                }
                else if (this.id.indexOf("filter_btn_rating_") != -1) {
                    VantageSearchPopup.uncheckAllChildButton("filter_btn_markets_", null);
                    var $filter_btn_rating = $('input[id^="filter_btn_rating_"].checked');
                    var ratingArr = [];
                    $filter_btn_rating.each(function() {
                        ratingArr.push($(this).data("rating"));
                    });
                    switch ($filter_btn_rating.length) {
                        case 4:
                            if (ratingArr.join(",") == VantageSearchFilter.rating_HG_selected) {
                                $("#filter_btn_markets_HG").addClass("checked");
                            }
                            break;
                        case 5:
                            if (ratingArr.join(",") == VantageSearchFilter.rating_HY_selected) {
                                $("#filter_btn_markets_HY").addClass("checked");
                            }
                            break;
                        case 9:
                            if (ratingArr.join(",") == VantageSearchFilter.rating_HG_selected.concat(VantageSearchFilter.rating_HY_selected).join(",")) {
                                $("#filter_btn_markets_HG").addClass("checked");
                                $("#filter_btn_markets_HY").addClass("checked");
                            }
                            break;
                        default:
                            $("#filter_btn_markets_HG").removeClass("checked");
                            $("#filter_btn_markets_HY").removeClass("checked");
                            break;
                    }

                }
                else if (this.id == "filter_btn_markets_HG") {
                    VantageSearchPopup.uncheckAllChildButton("filter_btn_rating_", null);

                    if ($(this).hasClass("checked")) {
                        VantageSearchPopup._change_rating_HG();
                    }
                    if ($("#filter_btn_markets_HY").hasClass("checked")) {
                        VantageSearchPopup._change_rating_HY();
                    }
                }
                else if (this.id == "filter_btn_markets_HY") {
                    VantageSearchPopup.uncheckAllChildButton("filter_btn_rating_", null);
                    if ($(this).hasClass("checked")) {
                        VantageSearchPopup._change_rating_HY();
                    }
                    if ($("#filter_btn_markets_HG").hasClass("checked")) {
                        VantageSearchPopup._change_rating_HG();
                    }
                }
            });
            $popup.find("p>input[keypress]").keypress(function(event) {
                var reg = /^(-?\d*)(\.\d*)?$/;
                var key = 0;
                var value = $(this).val();

                if (window.event) //IE
                {
                    key = event.keyCode;
                }
                else if (event.which) // Netscape/Firefox/Opera
                {
                    key = event.which;
                }
                if (key >= 32 && key <= 128) {
                    var keyChar = String.fromCharCode(key);

                    value += keyChar;
                    return reg.test(value);
                }

                return true;
            });
            VantageSearchPopup.ids.btnSearch.bind("click", function() {
                VantageSearchPopup.search();
            });
            VantageSearchPopup.ids.btnReset.bind("click", function() {
                VantageSearchPopup.resetFilter();
            });
            VantageSearchPopup.advanceSearchFilterValue = VantageSearchPopup.getFilterString();
            VantageSearchPopup.refreshFindButton();
        },
        initMessagePopup: function() {
            VantageSearchPopup.settings.messagePopup.position = VantageSearchPopup.setPopupPositionCenter(variables.rootID, VantageSearchPopup.settings.messagePopup.width, VantageSearchPopup.settings.messagePopup.height);
            VantageSearchPopup.ids.messagePopup.jqxWindow(VantageSearchPopup.settings.messagePopup);
            VantageSearchPopup.initMessagePopupEvent();
        },
        initSwitchUserPopup: function() {
            VantageSearchPopup.settings.switchUserPopup.position = VantageSearchPopup.setPopupPositionCenter(variables.rootID, VantageSearchPopup.settings.switchUserPopup.width, VantageSearchPopup.settings.switchUserPopup.height);
            VantageSearchPopup.ids.switchUserPopup.jqxWindow(VantageSearchPopup.settings.switchUserPopup);
            VantageSearchPopup.initSwitchUserPopupEvent();
        },
        initAdvancedSearchPopup: function() {
            VantageSearchPopup.settings.advancedSearchPopup.position = VantageSearchPopup.setPopupPositionCenter(variables.rootID, VantageSearchPopup.settings.advancedSearchPopup.width, VantageSearchPopup.settings.advancedSearchPopup.height);
            VantageSearchPopup.ids.advancedSearchPopup.jqxWindow(VantageSearchPopup.settings.advancedSearchPopup);
            VantageSearchCalendar.init();
            VantageSearchPopup.initAdvancedSearchPopupEvent();
        },
        initObjIDs: function() {
            VantageSearchPopup.ids.switchUserPopup = $("#" + VantageSearchPopup.strIDs.switchUserPopup);
            VantageSearchPopup.ids.btnCloseSwitchUserPopup = $("#" + VantageSearchPopup.strIDs.btnCloseSwitchUserPopup);
            VantageSearchPopup.ids.divSwitchUser = $("#" + VantageSearchPopup.strIDs.divSwitchUser);
            VantageSearchPopup.ids.btnSwitchUserSearch = $("#" + VantageSearchPopup.strIDs.btnSwitchUserSearch);
            VantageSearchPopup.ids.btnSwitchUserReset = $("#" + VantageSearchPopup.strIDs.btnSwitchUserReset);
            VantageSearchPopup.ids.messagePopup = $("#" + VantageSearchPopup.strIDs.messagePopup);
            VantageSearchPopup.ids.btnCloseMessagePopup = $("#" + VantageSearchPopup.strIDs.btnCloseMessagePopup);
            VantageSearchPopup.ids.divMessage = $("#" + VantageSearchPopup.strIDs.divMessage);
            VantageSearchPopup.ids.advancedSearchPopup = $("#" + VantageSearchPopup.strIDs.advancedSearchPopup);
            VantageSearchPopup.ids.btnSearch = $("#" + VantageSearchPopup.strIDs.btnSearch);
            VantageSearchPopup.ids.btnReset = $("#" + VantageSearchPopup.strIDs.btnReset);
            VantageSearchPopup.ids.btnCloseAdvancedSearchPopup = $("#" + VantageSearchPopup.strIDs.btnCloseAdvancedSearchPopup);
        },
        init: function() {
            VantageSearchPopup.initObjIDs();
        }
    };

    var VantageSearchFilter = {
        quickSearch: {
            filterValue: "",
            searchObj: {},
            dataAdapter: null,
            search: function() {
                VantageSearchPopup.resetFilter();
                $("#columnLayoutList").jqxWindow('close');
                $("#VantageSearch_divAdvancedSearchPopup").jqxWindow("close");
                var textVal = VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.val();

                var filterCriteria = {
                    UserSearchType: "QuickSearch"
                };
                if (variables.userInfo.USER_TYPE) {
                    filterCriteria.USER_TYPE = variables.userInfo.USER_TYPE;
                }
                if (variables.userInfo.LOGIN_ID) {
                    filterCriteria.LOGIN_ID = variables.userInfo.LOGIN_ID;
                }
                if (variables.userInfo.GP_NUM) {
                    filterCriteria.GP_NUM = variables.userInfo.GP_NUM;
                }

                var currDate = new Date();
                var fromDate = new Date();
                fromDate.addMonths(-6);
                variables.currentDate = "In the last 6 months";
                filterCriteria.SearchStartDate = fromDate.toString("yyyyMMdd");
                filterCriteria.endDate = currDate.toString("yyyyMMdd");
                if (textVal.indexOf(':') >= 0) {
                    $.each(textVal.replace(', ', ',').split(' '), function() {
                        var item = this.split(":");
                        filterCriteria[item[0]] = item[1].replace(',', ', ');
                    });
                }
                else {
                    filterCriteria.rawtext = textVal;
                }
                VantageSearchFilter.quickSearch.filterValue = $.toJSON(filterCriteria);
                VantageSearchFilter.filterValue = VantageSearchFilter.quickSearch.filterValue;
                //                if (!VantageSearchFilter.isFilterFirstLoad) {
                //                    VantageSearchFilter.advanceSearchFilterValue = VantageSearchFilter.getFilterString();
                //                }
                VantageSearchFilter.getDataFromServer();
            },
            init: function() {
                VantageSearchFilter.quickSearch.$VantageSearch_quickSearch = $("#VantageSearch_quickSearch");
                var source = {
                    datatype: "json",
                    data: {},
                    beforeprocessing: function(data) {
                        return data.Rows;
                    }
                };
                var dataAdapter = VantageSearchFilter.quickSearch.dataAdapter = new $.jqx.dataAdapter(source);
                var oldValue;
                var timeout;
                VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.jqxComboBox({
                    source: dataAdapter,
                    width: '410px',
                    height: '21px',
                    minLength: 1,
                    dropDownWidth: 410,
                    remoteAutoCompleteDelay: 50,
                    remoteAutoComplete: true,
                    autoDropDownHeight: true,
                    displayMember: "Value",
                    valueMember: "Key",
                    search: function(searchString) {
                        clearTimeout(timeout);
                        timeout = setTimeout(function() {
                            dataAdapter._source.url || (dataAdapter._source.url = variables.urls.getQuickSearchFilterData);
                            dataAdapter._source.data.condition = Base64.encode($.toJSON({
                                searchKey: searchString
                            }));
                            dataAdapter.dataBind();
                        }, 400);
                    }
                }).on('open', function(event) {
                    oldValue = VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.val();
                }).on('close', function(event) {
                    if (!VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.val()) {
                        return VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.jqxComboBox('clear');
                    }
                    ////                    if(VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.val() != oldValue){
                    VantageSearchFilter.quickSearch.search();
                    VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.data("jqxComboBox").instance.searchString = "";

                    ////                    }
                });
                VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.find("input").on('focus', function() {
                    var that = this;
                    setTimeout(function() {
                        that.select();
                    }, 0);
                });
                if (variables.ticker && variables.ticker != null && variables.ticker != undefined && variables.ticker.toUpperCase() != "NULL") {
                    VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.val("Ticker:" + variables.ticker);
                }
                else {
                    VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.val("Ticker:C");
                }
                VantageSearchFilter.quickSearch.search();
                VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.data("jqxComboBox").instance.searchString = "";
                VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.on("paste", function() {
                    setTimeout(function() {
                        VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.jqxComboBox('search', VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.val());
                    }, 0);
                }).on("keydown", function(event) {
                    if (event.keyCode == 13) {
                        VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.jqxComboBox('close');
                        ////                        VantageSearchFilter.quickSearch.search();
                    }
                });
            }
        },
        filterValue: "",
        sector_ref: {
            //            "Consumer, Cyclical": "Con, Cydical",
            //            "Consumer, Non-cyclical": "Con, NonCyc"
        },
        searchStartDate: "",
        endDate: "",
        rating_HG_selected: ["AAA,Aaa", "AA+,AA,AA-,Aa1,Aa2,Aa3", "A+,A,A-,A1,A2,A3", "BBB+,BBB,BBB-,Baa1,Baa2,Baa3"],
        rating_HY_selected: ["BB+,BB,BB-,Ba1,Ba2,Ba3", "B+,B,B-,B1,B2,B3", "CCC+,CCC,CCC-,Caa1,Caa2,Caa3", "CC,Ca", "C"],
        init: function() {
            VantageSearchFilter.initSearch();
            if (variables.tier == 1) {
               // layout.init();
              $("#columnLayout").Layout({
                  source:variables.layoutData
              });
            }
            else {
                $("#columnLayout").remove();
            }
            VantageSearchFilter.initFilterEvent();
        },
        resetFilter: function() {
            VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.val("");
            VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.data("jqxComboBox").instance.searchString = "";
            VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.jqxComboBox('clearSelection');
        },
        reset: function() {
            VantageSearchFilter.resetFilter();
            //            $("#VantageSearch_Tabs").parent().empty().append(variables.tabsCache.clone());
            //            VantageSearchTabs.init();
            //            VantageSearchPage.resetDataTable();
            //            VantageSearchPage.init();
            VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.val("Ticker:C");
            VantageSearchFilter.stopSearchResult = false;
        },
        initSearch: function() {
            VantageSearchFilter.quickSearch.init();
        },
        buildFilterCriteria: function() {
            var filterCriteria = {
                UserSearchType: "QuickSearch",
                paging: true,
                currPage: 1,
                pageSize: 400,
                Time: "",
                SearchStartDate: "",
                endDate: "",
                Sector: "",
                Currency: "",
                CITI_BUYSELL: "",
                Rating: "",
                MaturityFromTo: "",
                CouponFromTo: "",
                Ticker: "",
                Cusip: ""
            };

            if (variables.userInfo.USER_TYPE) {
                filterCriteria.USER_TYPE = variables.userInfo.USER_TYPE;
            }
            if (variables.userInfo.LOGIN_ID) {
                filterCriteria.LOGIN_ID = variables.userInfo.LOGIN_ID;
            }
            if (variables.userInfo.GP_NUM) {
                filterCriteria.GP_NUM = variables.userInfo.GP_NUM;
            }

            //var textVal = $("#VantageSearch_quickSearch input").val();
            var textVal = VantageSearchFilter.quickSearch.$VantageSearch_quickSearch.val();
            if (textVal.indexOf(':') >= 0) {
                $.each(textVal.replace(', ', ',').split(' '), function() {
                    var item = this.split(":");
                    filterCriteria[item[0]] = item[1].replace(',', ', ');
                });
            }
            else {
                filterCriteria.rawtext = textVal;
            }
            var currDate = new Date();
            var fromDate = new Date();
            fromDate.addMonths(-6);
            filterCriteria.SearchStartDate = fromDate.toString("yyyyMMdd");
            filterCriteria.endDate = currDate.toString("yyyyMMdd");

            //            var searchTimes = $("#filter_item_time_period").data("range");
            //            if (searchTimes) {
            //                VantageSearchFilter.searchStartDate = new Date(searchTimes[0]);
            //                VantageSearchFilter.endDate = new Date(searchTimes[1] || searchTimes[0]);
            //                filterCriteria.SearchStartDate = VantageSearchFilter.searchStartDate.toString("yyyyMMdd");
            //                filterCriteria.endDate = VantageSearchFilter.endDate.toString("yyyyMMdd");
            //            }
            return filterCriteria;
        },
        getFilterString: function() {
            return $.toJSON(VantageSearchFilter.buildFilterCriteria());
        },
        getDataFromServer: function() {
            if (VantageSearchFilter.filterValue != "") {
                var allResolved = true;
                variables.deffereds && $.each(variables.deffereds, function() {
                    // this.abort();
                    if (this.state() != "resolved") {
                        return allResolved = false;
                    }
                });
                if (!allResolved) {
                    return;
                }
                variables.rootID.mask("Loading...");
                $("#VantageSearch_quickSearch input").blur();
                $("#externalUserMsg").hide();
                if (variables.tier != 1) {
                    $(".bg_banner_center", "#VantageSearch_Tabs").text("Loading..");
                    variables.deffereds = BaseGrid.initGrid(variables.gridTables, true);
                    return;
                }
                $.when($.ajax({
                    type: "POST",
                    url: variables.urls.vantageSearchUrl,
                    data: {
                        condition: Base64.encode(VantageSearchFilter.filterValue)
                    },
                    dataType: "json",
                    beforeSend: function(xhr) {
                        //xhr.setRequestHeader("Content-length", queryStr.length);
                    },
                    success: function(datas, textStatus) {
                        $.each(variables.gridTables, function() {
                            var key = this.replace("DataTable", "");
                            var size = datas[key].size + (datas[key].size == datas[key].totalNumberOfHits ? "" : "/" + datas[key].totalNumberOfHits);
                            $(variables.tabIDs[key]).text(variables.tabNames[key] + " (" + size + ")");
                        });
                        VantageSearchPage.resetDataTable();
                        grid[variables.currentTabID].isDataTableFirstLoad = false;
                    },
                    complete: function(XMLHttpRequest, textStatus) {},
                    error: function(jqxhr, textStatus, error) {
                        VantageSearchPopup.openMessagePopup(VantageSearchPopup.messages.retrieveDataFailedMsg);
                    }
                }), BaseGrid.initGrid([variables.currentTabID], true)[0]).then(function(data1, data2) {
                    variables.rootID.unmask();
                });
            }
        },
        search: function() {
            VantageSearchFilter.filterValue = VantageSearchFilter.getFilterString();
            VantageSearchFilter.advanceSearchFilterValue = VantageSearchFilter.filterValue;
            variables.currentDate = "In the last 6 months";
            VantageSearchFilter.getDataFromServer();
            VantageSearchPopup.resetFilter();
            $("#columnLayoutList").jqxWindow('close');
            $("#VantageSearch_divAdvancedSearchPopup").jqxWindow("close");
        },
        initFilterEvent: function() {
            $("#filter_item_submit").bind("click", function() {
                //VantageSearchFilter.search();
                VantageSearchFilter.quickSearch.search();
            });
        }
    };
    var gridSetting = {
        width: 1162,
        height: 428
    };
    var _sortForMoodys = VantageSearchFilter.rating_HG_selected.concat(VantageSearchFilter.rating_HY_selected).concat(["D", "NR,WR"]).join(",").split(",");
    var _customsortfunc = function(column, direction, that) {
        var $currentGrid = $(that.ele);
        if (!$currentGrid.jqxGrid("source")._source.localdata) {
            return;
        }
        var sortData = $currentGrid.jqxGrid("source")._source.localdata.Rows;
        if (direction == 'ascending') {
            direction = true;
        }
        else if (direction == 'descending') {
            direction = false;

        }
        var tmpToString = Object.prototype.toString;
        Object.prototype.toString = (typeof column == "function") ? column : function() {
            return this[column];
        };
        if (direction != null) {
            // Todo Strike Price sort due to (8,000 -> 8000) as number sort
            if (column == "MD" || column == "SP") {
                sortData.sort(function(value1, value2) {
                    var index1 = _sortForMoodys.indexOf(value1.toString());
                    var index2 = _sortForMoodys.indexOf(value2.toString());
                    if (index1 < 0 && index2 < 0) {
                        if (value1 == value2) {
                            return 0;
                        }
                        return value1 > value2 ? 1 : -1;
                    }
                    if (index1 < 0) {
                        return -1;
                    }
                    if (index2 < 0) {
                        return 1;
                    }
                    return index2 - index1;

                });
            }
            else if (column == "TD" || column == "RFQCreateDate" || column == "INQUIRYDATE") {
                sortData.sort(function(value1, value2) {
                    value1 = +/\d+/.exec(value1.toString());
                    value2 = +/\d+/.exec(value2.toString());
                    return value1 - value2;
                });
            }
            else {
                sortData.sort(function(value1, value2) {
                    value1 = String(value1).toLowerCase();
                    value2 = String(value2).toLowerCase();
                    var tmpvalue1 = Number(value1);
                    var tmpvalue2 = Number(value2);
                    if (isNaN(tmpvalue1) && !isNaN(tmpvalue2)) {
                        return -1;
                    }
                    else if (!isNaN(tmpvalue1) && isNaN(tmpvalue2)) {
                        return 1;
                    }
                    else if (isNaN(tmpvalue1) && isNaN(tmpvalue2)) {
                        if (value1 == value2) {
                            return 0;
                        }
                        return value1 > value2 ? 1 : -1;
                    }
                    else {
                        return tmpvalue1 - tmpvalue2;
                    }
                });
            }
            if (!direction) {
                sortData.reverse();
            }
        }
        else {
            $currentGrid.jqxGrid("source")._source.localdata = $.extend(true, {}, that.source);;
        }
        //$currentGrid.jqxGrid("source")._source.localdata.Rows = sortData;
        $currentGrid.jqxGrid('updatebounddata', 'sort');
        Object.prototype.toString = tmpToString;
    };

    
    var BaseGrid = function(ele, opts) {
        var that = this;
        this.ele = ele || "";
        this.url = "";
        this.isDataTableFirstLoad = true;
        this.isFilterDataFirstLoad = true;
        this.data = {};
        this.source = {
            datatype: "json",
            localdata: null,
            sort: function(column, direction) {
                _customsortfunc(column, direction, that)
            },
            id: "id",
            datafields: (function() {
                var columns = [{
                    name: "id",
                    type: "string"
                }];
                var filterType;
                $.each(opts.setting.columns, function() {
                    if (this.cellsformat) {
                        filterType = "number";
                    }
                    else {
                        filterType = "string";
                    }
                    columns.push({
                        name: this.datafield,
                        type: this.filtertype == "date" ? this.filtertype : filterType
                    });
                });
                return columns;
            }())
        };
        this.setting = {
            width: gridSetting.width,
            height: gridSetting.height,
            autoshowloadelement: false,
            sortable: true,
            altrows: true,
            enablebrowserselection: true,
            columnsresize: true,
            columnsreorder: true,
            editable: false,
            filterable: true,
            selectionmode: 'singlerow',
            source: {},
            ready: function() {},
            columns: []
        };
        $.extend(true, this, opts);
    };
    $.extend(BaseGrid, {
        ids: [],
        layouts: [],
        initGrid: function(tabids, refresh) {
            var currentTabIDs = tabids || [tabids];
            var deffereds = [];
            $.each(currentTabIDs, function(i, currentTabID) {
                if (grid[currentTabID].isDataTableFirstLoad || grid[currentTabID].isDataTableFirstLoad != false) {
                    grid[currentTabID] = grid[currentTabID].create();
                    grid[currentTabID].init();
                    grid[currentTabID].isDataTableFirstLoad = false;
                    deffereds.push(grid[currentTabID].refresh());
                }
                else {
                    if (refresh) {
                        grid[currentTabID].isDataTableFirstLoad = false;
                        deffereds.push(grid[currentTabID].refresh());
                    }
                    else {
                        grid[currentTabID].loadLayout();
                    }
                }
            });
            return deffereds;
        },
        loadInstruments: function(containerId, count) {
            var $banner = variables.tabsCache.find(containerId).find(".bg_banner_center");
            var bannerText = $banner.text();
            var match = "match";
            var instruments = " instruments";
            if (!count) {
                instruments = "";
            }
            if (count == 1) {
                instruments = " instrument";
                match = "matches"
            }
            var noDataMsg = "";
            if (containerId.indexOf('Axes') > -1) {
                noDataMsg = "No axes found that match your search criteria";
            }
            else if (containerId.indexOf('Inventory') > -1) {
                noDataMsg = "No positions found that match your search criteria";
            }
            else if (containerId.indexOf('BondTrades') > -1) {
                noDataMsg = "No trades found that match your search criteria";
            }
            else if (containerId.indexOf('RFQ') > -1) {
                noDataMsg = "No electronic inquiries found that match your search criteria";
            }
            else if (containerId.indexOf('Inquiry') > -1) {
                noDataMsg = "No orders or inquiries found that match your search criteria";
            }

            $(containerId).find(".bg_banner_center").text(instruments ? bannerText.format(count + instruments, match, variables.currentDate) : noDataMsg);
        },
        exportAllToExcel: function() {
            var allResolved = true;
            $.each(variables.deffereds, function() {
                // this.abort();
                if (this.state() != "resolved") {
                    return allResolved = false;
                }
            });
            if (!allResolved) {
                setTimeout(BaseGrid.exportAllToExcel, 500);
                return;
            }
            var dataset = {};
            $.each(variables.gridTables, function() {
                var source = $(grid[this].ele).jqxGrid("source")._source.localdata;
                var sheetName = variables.tabNames[this.replace("DataTable", "")];
                source && (dataset[sheetName] = source.Rows);
            });
            $.exportExcel({
                rowsid: "rows",
                filename: "VantageSearch",
                fields: ["De", "CUSIP", "ISIN"],
                dataset: dataset
            });
        }
    });
    BaseGrid.prototype = {
        buildGridData: function(callback) {
            variables.rootID.mask("Loading...");
            var that = this;
            return $.ajax({
                type: "POST",
                url: this.url,
                data: {
                    condition: Base64.encode(VantageSearchFilter.filterValue)
                },
                dataType: "json",
                success: function(datas, textStatus) {
                    var cusips = {};
                    that.count = 0;
                    //var result ={Rows:[]};
                    var result = $.extend(true, {}, datas);
                    result.Rows = [];
                    if (variables.tier != 1) {
                        $.each(datas.Rows, function(i, v) {
                            v.id = v.De;
                            if (!cusips[v.id]) {
                                cusips[v.id] = true;
                                that.count++;
                                result.Rows.push(v);
                            }
                        });
                    }
                    else {
                        $.each(datas.Rows, function(i, item) {
                            $.each(item, function(p, val) {
                                if (typeof val == "number") {
                                    item[p] = val.toFixed(2);
                                }
                            });
                            result.Rows.push(item);
                        });
                    }
                    that.source = $.extend(true, {}, result);
                    callback && callback(result);
                },
                complete: function(XMLHttpRequest, textStatus) {
                    variables.rootID.unmask();
                },
                error: function(jqxhr, textStatus, error) {
                    if (error != "abort") {
                        VantageSearchPopup.openMessagePopup(VantageSearchPopup.messages.retrieveDataFailedMsg);
                    }
                }
            });
        },
        init: function() {
            var that = this;
            this.hasLoadLayout = false;
            var $ele = $(that.ele);
            BaseGrid.ids.push(that.ele);
            variables[that.ele] = {};
            if ($ele.data("jqxGrid")) {
                return;
            }
            that.setting.source = new $.jqx.dataAdapter($.extend({}, this.source));
            if (variables.tier != 1) {
                gridSetting.width = 1040;
                $(".tab_container").addClass("center").width(gridSetting.width);
                that.setting.width = gridSetting.width;
                that.setting.height = gridSetting.height - 67;
                $(".bg_banner_left").width(gridSetting.width - 18);
                var columnsWidth = (gridSetting.width - 18) / 3;
                var columns = [{
                    text: 'Description',
                    datafield: 'De',
                    align: 'left',
                    cellsalign: 'left',
                    width: columnsWidth
                }, {
                    text: 'CUSIP',
                    datafield: 'CUSIP',
                    align: 'left',
                    cellsalign: 'left',
                    width: columnsWidth
                }, {
                    text: 'ISIN',
                    datafield: 'ISIN',
                    align: 'left',
                    cellsalign: 'left',
                    width: columnsWidth
                }];
                that.setting.columns = columns;
                $ele.parent().on("click", ".Banner", function() {
                    var $expd = $ele.parent().find(".Banner").find(".collape");
                    var height = $("#VantageSearch_divMain").height();
                    if ($expd.hasClass("expanded")) {
                        $expd.removeClass("expanded");
                        $ele.slideDown(500);
                    }
                    else {
                        $expd.addClass("expanded");
                        $ele.slideUp(500);
                    }
                    setTimeout(function() {
                        parent.PORTAL.UI.Controller.resizeHeight($("#VantageSearch_divMain").height() + 100);
                        PORTAL.UI.CP.autoAdjust();
                    }, 500);
                    $ele.parent().find(".Banner").attr("banner", true);
                });
                setTimeout(function() {
                    $ele.append('<div style="text-align: right;margin-right:5px;line-height:20px;">For further details please call the Credit Sales desk</div>');
                }, 0);
            }
            $ele.css({
                "margin-left": -1500,
                "position": "absolute"
            }).jqxGrid(that.setting).one("bindingcomplete", function() {
                $ele.css({
                    "margin-left": 0,
                    "position": "relative"
                });
                if (variables.tier == 1) {
                    BaseGrid.layouts[that.ele] = BaseGrid.layouts[that.ele] || $ele.jqxGrid('getstate');
                    that.loadLayout();
                }
            });
            that.isDataTableFirstLoad = false;
        },
        refresh: function() {
            if (VantageSearchFilter.filterValue == "") {
                return;
            }
            var that = this;
            var $ele = $(this.ele);
            return this.buildGridData(function(gridData) {
                if (gridData != null) {
                    gridData.Rows = gridData.Rows || [];
                    $ele.jqxGrid("source")._source.localdata = gridData;
                    $ele.jqxGrid("updatebounddata", "data");
                    var tabId = that.ele.replace("_DataTable", "");
                    var $tab = $(tabId);
                    if (variables.tier == 1) {
                        var size = gridData.size + (gridData.size == gridData.totalNumberOfHits ? "" : "/" + gridData.totalNumberOfHits);
                        $tab.text(variables.tabNames[tabId.split("_").pop()] + " (" + size + ")");
                    }
                    else {
                        $ele.hide().parent().find(".collape").addClass("expanded");
                        BaseGrid.loadInstruments("#" + $ele.parent()[0].id, that.count);
                    }
                }
                else {
                    $ele.jqxGrid("clear");
                }
            });
        },
        initColumnControlPanel: function() {
            var that = this;
            if (variables.tier != 1) {
                return;
            }
            var $ele = $(this.ele);
            var $columnLayoutCheckbox = $("#columnLayoutCheckbox");
            var $pop = $("#columnLayoutList");
            var columns = $ele.jqxGrid("columns").records;
            var columnsLength = columns.length;
            var listSource = [];
            var item;
            for (var i = 3; i < columnsLength; i++) {
                item = columns[i];
                listSource.push({
                    label: item.text,
                    value: item.datafield,
                    checked: !item.hidden
                });
            }
            if ($columnLayoutCheckbox.data("jqxListBox")) {
                $columnLayoutCheckbox.jqxListBox({
                    source: listSource.sort(function(a, b) {
                        return a.label > b.label;
                    })
                });
                return;
            }
            var pos = $ele.offset();
            var width = $ele.width() - 215;
            $columnLayoutCheckbox.jqxListBox({
                source: listSource,
                width: 202,
                height: 232,
                checkboxes: true
            });
            $pop.jqxWindow({
                height: 270,
                width: 215,
                showCloseButton: true,
                animationType: "none",
                isModal: false,
                theme: self.theme,
                position: {
                    x: pos.left + width,
                    y: $ele.offset().top + 158
                }
            });
            $pop.jqxWindow('setTitle', 'Columns Control');
            $columnLayoutCheckbox.on('checkChange', function(event) {
                var $grid = $(grid[variables.currentTabID].ele);
                $grid.jqxGrid('scrolloffset', 0, 0);
                if (event.args.checked) {
                    $grid.jqxGrid('showcolumn', event.args.value);
                }
                else {
                    $grid.jqxGrid('hidecolumn', event.args.value);
                }
            });
        },
        loadLayout: function() {
            var $grid = $(this.ele);
            var layout = variables.currentLayoutData.LayoutCriteria && variables.currentLayoutData.LayoutCriteria[this.ele];
            if (layout && layout != this.prevLayout) {
                this.prevLayout = layout;
                $grid.jqxGrid("loadstate", layout);
            }
            this.initColumnControlPanel();
        },
        exportToExcel: function() {
            var rowData = $(this.ele).jqxGrid('getRows');
            if (rowData.length <= 0) {
                VantageSearchPopup.openMessagePopup(VantageSearchPopup.messages.noDataMsg);
            }
            else {
                var fileName = variables.tabNames[variables.currentTabID.replace("DataTable", "")]
                if (!$(this.ele).data("jqxGrid")) {
                    $(this.ele).data("jqxTreeGrid").instance.base.exportSettings = {
                        columnsHeader: true,
                        hiddenColumns: false,
                        serverURL: variables.urls.exportUrl,
                        collapsedRecords: true,
                        recordsInView: true,
                        fileName: fileName
                    };
                }
                $(this.ele).jqxGrid('exportdata', variables.exportType, fileName, true, null, false, variables.urls.exportUrl);
            }
        }
    };
    var grid = {
        AxesDataTable: {
            url: variables.urls.getAxesData,
            setting: {
                columns: [{
                        text: 'Description',
                        datafield: 'De',
                        align: 'center',
                        cellsalign: 'left',
                        width: 150
                    }, {
                        text: 'CUSIP',
                        datafield: 'CUSIP',
                        align: 'center',
                        cellsalign: 'left',
                        width: 100
                    }, {
                        text: 'ISIN',
                        datafield: 'ISIN',
                        align: 'center',
                        cellsalign: 'left',
                        width: 100
                    }, {
                        text: 'Citi B/S',
                        datafield: 'DUMMY',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Size',
                        datafield: 'SIZE',
                        cellsformat: 'f0',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Price',
                        datafield: 'PRICE',
                        cellsformat: 'f2',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Spread',
                        datafield: 'SPREAD',
                        cellsformat: 'f2',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Ccy',
                        datafield: 'CURRENCY',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Desk',
                        datafield: 'DESK',
                        align: 'center',
                        cellsalign: 'right',
                        width: 140
                    }, {
                        text: 'Sector',
                        datafield: 'SECTOR',
                        align: 'center',
                        cellsalign: 'right',
                        width: 120
                    }, {
                        text: 'Moodys',
                        datafield: 'MD',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'S&amp;P',
                        datafield: 'SP',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    } //,
                ]
            },
            create: function() {
                return new BaseGrid("#VantageSearch_Tabs_Axes_DataTable", grid.AxesDataTable);
            }
        },
        InventoryDataTable: {
            url: variables.urls.getInventoryData,
            setting: {
                columns: [{
                        text: 'Description',
                        datafield: 'De',
                        align: 'center',
                        cellsalign: 'left',
                        width: 190
                    }, {
                        text: 'CUSIP',
                        datafield: 'CUSIP',
                        align: 'center',
                        cellsalign: 'left',
                        width: 100
                    }, {
                        text: 'ISIN',
                        datafield: 'ISIN',
                        align: 'center',
                        cellsalign: 'left',
                        width: 120
                    }, {
                        text: 'Offer Spread',
                        datafield: 'ASKSPREAD',
                        cellsformat: 'f2',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Offer Price',
                        datafield: 'ASKPRICE',
                        cellsformat: 'f2',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Offer Size',
                        datafield: 'ASKCAPSIZE',
                        cellsformat: 'f0',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Bid Spread',
                        datafield: 'BIDSPREAD',
                        cellsformat: 'f2',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Bid Price',
                        datafield: 'BIDPRICE',
                        cellsformat: 'f2',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Bid Size',
                        datafield: 'BIDCAPSIZE',
                        cellsformat: 'f0',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    },
                    //                    { text: 'Coupon', datafield: 'COUPONRATE',  cellsformat: 'f2', align: 'center',  cellsalign: 'right', width: 100 },
                    //                    { text: 'Maturity', datafield: 'MATURITYDATE', filtertype: 'date', cellsformat: 'MM/dd/yyyy', align: 'center', cellsalign: 'right', width: 100 },
                    {
                        text: 'Ccy',
                        datafield: 'CURRENCY',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Sector',
                        datafield: 'SECTORDESC',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    },
                    //                    { text: 'Industry Sub Group', datafield: 'SECTORID',  align: 'center', cellsalign: 'right', width: 190 },
                    {
                        text: 'Moodys',
                        datafield: 'MD',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'S&amp;P',
                        datafield: 'SP',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    } //,
                    //                    { text: 'Trader', datafield: 'TRADERNAME',  align: 'center', cellsalign: 'right', width: 160 },
                    //                    { text: 'Last Update', datafield: 'LASTUPDATE', filtertype: 'date', cellsformat: 'MM/dd/yyyy', align: 'center', cellsalign: 'right', width: 100 },
                    //                    { text: 'Issuer Name', datafield: 'ISSUERNAME',  align: 'center', cellsalign: 'right', width: 190 },
                    //                    { text: 'Firm Account', datafield: 'FIRMACCOUNT',  align: 'center', cellsalign: 'right', width: 100 }
                ]
            },
            create: function() {
                return new BaseGrid("#VantageSearch_Tabs_Inventory_DataTable", grid.InventoryDataTable);
            }
        },
        BondTradesDataTable: {
            url: variables.urls.getBondTradesData,
            setting: {
                columns: [{
                        text: 'Description',
                        datafield: 'De',
                        align: 'center',
                        cellsalign: 'left',
                        width: 150
                    }, {
                        text: 'CUSIP',
                        datafield: 'CUSIP',
                        align: 'center',
                        cellsalign: 'left',
                        width: 100
                    }, {
                        text: 'ISIN',
                        datafield: 'ISIN',
                        align: 'center',
                        cellsalign: 'left',
                        width: 120
                    }, {
                        text: 'Trade Date',
                        datafield: 'TD',
                        filtertype: 'date',
                        cellsformat: 'MM/dd/yyyy',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Citi B/S',
                        datafield: 'BS',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Price',
                        datafield: 'PR',
                        cellsformat: 'f2',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Spread',
                        datafield: 'SA',
                        cellsformat: 'f2',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Notional',
                        datafield: 'TQ',
                        cellsformat: 'f0',
                        align: 'center',
                        cellsalign: 'right',
                        width: 120
                    }, {
                        text: 'Sales',
                        datafield: 'SPN',
                        align: 'center',
                        cellsalign: 'right',
                        width: 150
                    },
                    //                { text: 'Customer', datafield: 'GP_NAME',  align: 'center', cellsalign: 'right', width: 150 },
                    //                { text: 'Contact', datafield: 'CONTACT',  align: 'center', cellsalign: 'right', width: 100 },
                    {
                        text: 'Trader',
                        datafield: 'TN',
                        align: 'center',
                        cellsalign: 'right',
                        width: 120
                    },
                    //                { text: 'Sub-business', datafield: 'SUB_BUSINESS',  align: 'center', cellsalign: 'right', width: 150 },
                    //                { text: 'Client B/S', datafield: 'DUMMY',  align: 'center', cellsalign: 'right', width: 100 },
                    {
                        text: 'Currency',
                        datafield: 'CCY',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    },
                    //                { text: 'Maturity', datafield: 'MATURITY_DATE', filtertype: 'date', cellsformat: 'MM/dd/yyyy', align: 'center', cellsalign: 'right', width: 100 },
                    //                { text: 'Industry', datafield: 'INDUSTRY_GROUP',  align: 'center', cellsalign: 'right', width: 100 },
                    {
                        text: 'Sector',
                        datafield: 'IS',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Moodys',
                        datafield: 'MD',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'S&amp;P',
                        datafield: 'SP',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }
                    //                { text: 'IssuerName', datafield: 'ISSUERNAME',  align: 'center', cellsalign: 'right', width: 190 },
                    //                { text: 'TPSTradeID', datafield: 'TRADEID',  align: 'center', cellsalign: 'right', width: 100 }
                ]
            },
            create: function() {
                return new BaseGrid("#VantageSearch_Tabs_BondTrades_DataTable", grid.BondTradesDataTable);
            }
        },
        RFQDataTable: {
            url: variables.urls.getRFQData,
            setting: {
                columns: [{
                        text: 'Description',
                        datafield: 'De',
                        align: 'center',
                        cellsalign: 'left',
                        width: 150
                    }, {
                        text: 'CUSIP',
                        datafield: 'CUSIP',
                        align: 'center',
                        cellsalign: 'left',
                        width: 100
                    }, {
                        text: 'ISIN',
                        datafield: 'ISIN',
                        align: 'center',
                        cellsalign: 'left',
                        width: 120
                    }, {
                        text: 'OrderType',
                        datafield: 'RFQOrderTypeStr',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    },
                    //                { text: 'Customer', datafield: 'CustFirm',  align: 'center', cellsalign: 'right', width: 150 },
                    //                { text: 'Party Name', datafield: 'CustUserName',  align: 'center', cellsalign: 'right', width: 120 },
                    {
                        text: 'Citi B/S',
                        datafield: 'RFQVerbStr',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Deal Value',
                        datafield: 'RFQDealValue',
                        cellsformat: 'f2',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Quantity',
                        datafield: 'RFQQty',
                        cellsformat: 'f0',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Inquiry Date',
                        datafield: 'RFQCreateDate',
                        filtertype: 'date',
                        cellsformat: 'MM/dd/yyyy',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Status',
                        datafield: 'StatusStr',
                        align: 'center',
                        cellsalign: 'right',
                        width: 120
                    }, {
                        text: 'ECN Market',
                        datafield: 'ecnMarket',
                        align: 'center',
                        cellsalign: 'right',
                        width: 120
                    }, {
                        text: 'Currency',
                        datafield: 'CurrencyStr',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    },
                    //                { text: 'Maturity', datafield: 'MaturityDate', filtertype: 'date', cellsformat: 'MM/dd/yyyy', align: 'center', cellsalign: 'right', width: 100 },
                    //                { text: 'Industry', datafield: 'INDUSTRY',  align: 'center', cellsalign: 'right', width: 150 },
                    {
                        text: 'Sector',
                        datafield: 'SECTOR',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Moodys',
                        datafield: 'MD',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'S&amp;P',
                        datafield: 'SP',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    },
                    //                { text: 'IssuerName', datafield: 'ISSUERNAME',  align: 'center', cellsalign: 'right', width: 190 },
                    //                { text: 'Product Type', datafield: 'PRODTYPE',  align: 'center', cellsalign: 'right', width: 100 },
                    {
                        text: 'Sales',
                        datafield: 'SALESPERSONNAME',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Trader',
                        datafield: 'TRADERNAME',
                        align: 'center',
                        cellsalign: 'right',
                        width: 150
                    }
                ]
            },
            create: function() {
                return new BaseGrid("#VantageSearch_Tabs_RFQ_DataTable", grid.RFQDataTable);
            }
        },
        InquiryDataTable: {
            url: variables.urls.getInquiryData,
            setting: {
                columns: [
                    //                { text: 'Product Type', datafield: 'PRODUCT_TYPE',  align: 'center', cellsalign: 'right', width: 100 },
                    //                { text: 'Client', datafield: 'ACCOUNT',  align: 'center', cellsalign: 'right', width: 190 },
                    {
                        text: 'Description',
                        datafield: 'De',
                        align: 'center',
                        cellsalign: 'left',
                        width: 150
                    }, {
                        text: 'Cusip',
                        datafield: 'CUSIP',
                        align: 'center',
                        cellsalign: 'left',
                        width: 100
                    }, {
                        text: 'ISIN',
                        datafield: 'ISIN',
                        align: 'center',
                        cellsalign: 'left',
                        width: 120
                    }, {
                        text: 'Client B/S',
                        datafield: 'BUYSELL',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Price',
                        datafield: 'PRICE',
                        cellsformat: 'f2',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Spread',
                        datafield: 'SPREAD',
                        cellsformat: 'f2',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    },
                    //                { text: 'Comment', datafield: 'NOTE',  align: 'center', cellsalign: 'right', width: 100 },
                    {
                        text: 'Status',
                        datafield: 'STATUS',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'Sales',
                        datafield: 'SALESPERSONNAME',
                        align: 'center',
                        cellsalign: 'right',
                        width: 150
                    }, {
                        text: 'Trader',
                        datafield: 'IOI_TRADER_NAME',
                        align: 'center',
                        cellsalign: 'right',
                        width: 150
                    }, {
                        text: 'Inquiry Date',
                        datafield: 'INQUIRYDATE',
                        filtertype: 'date',
                        cellsformat: 'MM/dd/yyyy',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    },
                    //                { text: 'EntryTime', datafield: 'ADD_TS', filtertype: 'date', cellsformat: 'yyyy-MM-dd HH:mm:ss', align: 'center', cellsalign: 'right', width: 160 },
                    //                { text: 'Contact', datafield: 'CONTACT',  align: 'center', cellsalign: 'right', width: 100 },
                    //                { text: 'Inquiry', datafield: 'USERINPUT',  align: 'center', cellsalign: 'right', width: 200 },
                    //                { text: 'EntryUser', datafield: 'ENTRYUSER',  align: 'center', cellsalign: 'right', width: 150 },
                    //                { text: 'EntryUserRole', datafield: 'ENTRYUSERROLE',  align: 'center', cellsalign: 'right', width: 120 },
                    //                { text: 'UpdateTime', datafield: 'MOD_TS', filtertype: 'date', cellsformat: 'yyyy-MM-dd HH:mm:ss', align: 'center', cellsalign: 'right', width: 160 },
                    //                { text: 'Firm Inquiry', datafield: 'FIRMFLAG',  align: 'center', cellsalign: 'right', width: 100 },
                    //                { text: 'Expiration Time', datafield: 'EXPIRATION_TS', filtertype: 'date', cellsformat: 'yyyy-MM-dd HH:mm:ss', align: 'center', cellsalign: 'right', width: 160 },
                    {
                        text: 'Ticker',
                        datafield: 'TICKER',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    },
                    //                { text: 'Industry', datafield: 'INDUSTRY',  align: 'center', cellsalign: 'right', width: 170 },
                    {
                        text: 'Sector',
                        datafield: 'SECTOR',
                        align: 'center',
                        cellsalign: 'right',
                        width: 130
                    }, {
                        text: 'Moodys',
                        datafield: 'MD',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }, {
                        text: 'S&amp;P',
                        datafield: 'SP',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    },
                    //                { text: 'Coupon', datafield: 'COUPON',  cellsformat: 'f2', align: 'center',  cellsalign: 'right', width: 100 },
                    {
                        text: 'Size',
                        datafield: 'SIZE',
                        cellsformat: 'f0',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    },
                    //                { text: 'Maturity', datafield: 'MATURITYDATESTR',  cellsformat: 'MM/dd/yyyy', align: 'center', cellsalign: 'right', width: 100 },
                    //                { text: 'AON', datafield: 'ALLORNONE',  align: 'center', cellsalign: 'right', width: 100 },
                    {
                        text: 'Ccy',
                        datafield: 'CURRENCY',
                        align: 'center',
                        cellsalign: 'right',
                        width: 100
                    }
                    //                { text: 'Booking Status', datafield: 'EXECUTION_STATUS',  align: 'center', cellsalign: 'right', width: 120 },
                    //                { text: 'TPS Trade', datafield: 'TPSTRADEID',  align: 'center', cellsalign: 'right', width: 100 },
                    //                { text: 'Last Action', datafield: 'LASTACTION',  align: 'center', cellsalign: 'right', width: 170 },
                    //                { text: 'Last Action User', datafield: 'LASTACTIONUSER',  align: 'center', cellsalign: 'right', width: 170 },
                    //                { text: 'Last Action Role', datafield: 'LASTACTIONUSERROLE',  align: 'center', cellsalign: 'right', width: 120 },
                    //                { text: 'Last Action Time', datafield: 'LASTACTIONTIME', filtertype: 'date', cellsformat: 'yyyy-MM-dd HH:mm:ss', align: 'center', cellsalign: 'right', width: 160 },
                    //                { text: 'Inquiry Id', datafield: 'IOI_ID',  align: 'center', cellsalign: 'right', width: 100 },
                    //                { text: 'Citi B/S', datafield: 'DUMMY',  align: 'center', cellsalign: 'right', width: 100 },
                    //                { text: 'Published Size', datafield: 'PUBLIC_SIZE',  cellsformat: 'f0', align: 'center',  cellsalign: 'right', width: 130 },
                    //                { text: 'Published Price', datafield: 'PUBLIC_PRICE',  cellsformat: 'f2', align: 'center',  cellsalign: 'right', width: 130 },
                    //                { text: 'Published Spread', datafield: 'PUBLIC_SPREAD',  cellsformat: 'f2', align: 'center',  cellsalign: 'right', width: 130 },
                    //                { text: 'Published Points', datafield: 'PUBLIC_POINT',  cellsformat: 'f2', align: 'center',  cellsalign: 'right', width: 130 }
                ]
            },
            create: function() {
                return new BaseGrid("#VantageSearch_Tabs_Inquiry_DataTable", grid.InquiryDataTable);
            }
        },
    };

    var JPlaceHolder = {
        _check: function() {
            return 'placeholder' in document.createElement('input');
        },
        init: function() {
            if (!this._check()) {
                $.valHooks.text = {
                    get: function(n) {
                        var m = $(n);
                        return m.data('show-placeholder') ? "" : n.value;
                    }
                };
                this.fix();
            }
        },
        fix: function() {
            jQuery(':input[placeholder]').each(function(index, element) {
                var self = $(this),
                    txt = self.attr('placeholder');
                self.data("show-placeholder", true).val(txt);
                self.focusin(function(e) {
                    if (self[0].value == txt) {
                        self.data("show-placeholder", false).val("");
                    }
                }).focusout(function(e) {
                    if (!self[0].value) {
                        self.data("show-placeholder", true).val(txt);
                    }
                });
                self.click(function(e) {
                    self.focus();
                });
            });
        }
    };

    var VantageSearchPage = {
        init: function() {
            if (variables.tier == 1) {
                variables.currentTabID = VantageSearchTabs.ids.tabsdiv.jqxTabs('getContentAt', VantageSearchTabs.ids.tabsdiv.jqxTabs('val')).data("action");
            }
        },
        exportToExcel: function() {
            variables.rootID.mask("Exporting...");
            if (variables.tier == 1) {
                grid[variables.currentTabID].exportToExcel();
            }
            else {
                BaseGrid.exportAllToExcel();
            }
            variables.rootID.unmask();
        },
        resetDataTable: function() {
            //grid.UnfilledInquiryDataTable.isDataTableFirstLoad = true;
            grid.InventoryDataTable.isDataTableFirstLoad = true;
            grid.BondTradesDataTable.isDataTableFirstLoad = true;
            grid.InquiryDataTable.isDataTableFirstLoad = true;
            grid.AxesDataTable.isDataTableFirstLoad = true;
            grid.RFQDataTable.isDataTableFirstLoad = true;
        }
    };

    /* Resize GidView height according the avaiable height */
    var ResizeGridViewHieght = function() {
        try {
            parent.document.domain;
        }
        catch (E) {
            document.domain = document.domain;
        }
        if (top != self) {
            var backupportal = parent.PORTAL.UI.Controller.resizeFrame;
            parent.PORTAL.UI.Controller.resizeFrame = function(a, b) {
                b = b > 600 ? 600 : b;
                backupportal(a, b);
            };
        }
    };

    var getURLParameter = function(name) {
        return decodeURIComponent((location.search.match(RegExp("[?|&]" + name + '=(.+?)(&|$)')) || [, null])[1]);
    };

    CV_CREDIT.VantageSearch = {
        // Public Api interface.VantageSearch  is js file name.
        init: function(options) {
            variables.tier = 1; //$("#dataForTier").val();
            variables.gridTables = $.map(grid, function(val, i) {
                return i
            });
            var src = getURLParameter("src") || "";
            variables.ticker = getURLParameter("ticker");
            if (variables.tier == 1 && src.toUpperCase() == "EXTERNAL") {
                variables.tier = 2;
                variables.userInfo.USER_TYPE = "EXTERNAL";
                variables.userInfo.LOGIN_ID = "Credit_CV_External1";
                variables.userInfo.GP_NUM = "05101";
            }
            variables.tabsCache = $("#VantageSearch_Tabs").clone();
            $(".bg_banner_center", "#VantageSearch_Tabs").text("Loading..");
            variables.layoutData = JSON.parse($("#dataForLayout").val() || "[]");
            $.each(variables.layoutData, function() {
                this.LayoutCriteria = JSON.parse(this.LayoutCriteria);
                if (this.IsDefault) {
                    variables.currentLayoutData = this;
                }
                if ("SW51853,AS77202,LX57085,ZS37599,YL27264,WL07377,YY76089,YW56643,LS74865,JY42928".indexOf(this.UserID.toUpperCase()) >= 0) {
                    $("#VantageSearch_Switch_User").css('display', 'block');
                }
            });
            variables.rootID = $("#VantageSearch_divMain");
            VantageSearchTabs.init();
            VantageSearchPage.init();
            VantageSearchPopup.init();
            VantageSearchFilter.init();
            $("body").XSSValidator({
                selector: "#filter_item_QuickSearch_search_input,#filter_item_search_input",
                numOnly: "#filter_txt_coupon_min #filter_txt_coupon_max",
                allowChars: ['/', ',', '.']
            });
            $("body").XSSValidator({
                selector: "#filter_txt_ticker,#filter_txt_cusip_isin",
                numOnly: "#filter_txt_maturity_min, #filter_txt_maturity_max",
                allowCharsForNum: [],
                allowChars: []
            });
            $("body").XSSValidator({
                selector: "#switchuser_USER_TYPE,#switchuser_LOGIN_ID,#layout_name",
                numOnly: "#switchuser_GP_NUM"
            });
            (variables.tier == 1) && $(document).ready(function() {
                ResizeGridViewHieght();
            });
            $("body").on("click", function(event) {
                $("#columnLayout").find("div:first").removeClass("open");
            });
        },
        findFlash: function() {
            VantageSearchPopup.findFlash();
        },
        reset: function() {
            VantageSearchPopup.resetFilter();
            VantageSearchFilter.reset();
            $("#filter_item_submit").click();
        },
        refreshFindButton: function() {
            VantageSearchPopup.refreshFindButton();
        },
        openAdvancedSearchPopup: function(options) {
            VantageSearchPopup.openAdvancedSearchPopup();
        },
        openSwitchUserPopup: function(options) {
            VantageSearchPopup.openSwitchUserPopup();
        },
        exportToExcel: function(options) {
            VantageSearchPage.exportToExcel();
        },
        doNothing: function(evt) {
            //resolve autu submit in firefox
            if (window.event) {
                evt = window.event;
            }
            if (evt.keyCode == 13) {
                return false;
            }
        }
    };
})();

  $(document).ready(function () {
 $("#columnLayout").Layout({
                  source:JSON.parse($("#dataForLayout").val() || "[]"),
                  currentLayout:{LayoutName:'dfgj3462'}
              });
            // CV_CREDIT.VantageSearch.init();
});
