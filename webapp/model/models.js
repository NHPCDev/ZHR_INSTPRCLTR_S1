sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/ui/core/ValueState"
], function (JSONModel, Device, ValueState) {
    "use strict";

    return {

        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        createViewModel: function () {
            return new JSONModel({

                SelectedStatus: "",
                HeaderTitle: "",
                Status: "NEW",
                editable: true,
                tableSelectionMode: "Single",
                
                isCreateMode: false,

                partyDetails: [],

                PreClearData: {},

                PreClearDetails: {
                    ApplicationNo: "",
                    Status: ""
                },

                EmpDetails: {
                    PERNR: "",
                    ENAME: "",
                    BUKRS: "",
                    GRADE: "",
                    SUB_GROUP: "",
                    WERKS: "",
                    PLANT: "",
                    DEP: "",
                    DESIG: "",
                    EMAIL: "",
                    MOBILE: ""
                },

                valueState: {},
                valueStateText: {},

               
            });
        },

        createFilterModel: function () {
            return new JSONModel({
                Year: "",
                ApplicationNo: "",
                Pernr: "",
                Status: "",

                StatusList: [],

                valueState: {
                    Year: ValueState.None,
                    ApplicationNo: ValueState.None,
                    Pernr: ValueState.None,
                    Status: ValueState.None
                },

                valueStateText: {
                    Year: "",
                    ApplicationNo: "",
                    Pernr: "",
                    Status: ""
                }
            });
        }
    };
});