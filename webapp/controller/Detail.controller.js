
sap.ui.define([
    "com/nhpc/zhrinstprcltrs1/controller/BaseController",
    "sap/m/MessageToast",
    "com/nhpc/zhrinstprcltrs1/util/messenger",
    "sap/ui/core/Fragment",
    "sap/ui/core/ValueState",
    "sap/ui/export/Spreadsheet",
    "com/nhpc/zhrinstprcltrs1/util/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/SearchField",
    "sap/ui/export/library",
    "sap/ui/core/BusyIndicator",
    "sap/ui/table/Column",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/Label",
    "sap/m/Text",
    "sap/ui/core/Item",
    "sap/m/MessageBox"
], function (
    BaseController,
    MessageToast,
    messenger,
    Fragment,
    ValueState,
    Spreadsheet,
    formatter,
    Filter,
    FilterOperator,
    JSONModel,
    SearchField,
    exportLibrary,
    BusyIndicator,
    Column,
    MColumn,
    ColumnListItem,
    Label,
    Text,
    Item,
    MessageBox
) {
    "use strict";

    return BaseController.extend("com.nhpc.zhrinstprcltrs1.controller.Detail", {
        formatter: formatter,

        onInit: function () {
            var oVM = this.getModel("viewModel");
            oVM.setProperty("/CurrentDate", new Date());
            oVM.setProperty("/DOJValueState", ValueState.None);
            oVM.setProperty("/DOJValueStateText", "");

            this.getRouter().getRoute("RouteDetail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var oVM = this.getModel("viewModel");

            if (oArgs.ApplicationNo) {
                oVM.setProperty("/isCreateMode", false);
                this._getPreClearDetails(oArgs.ApplicationNo, oArgs.Pernr);
                this._getHistoryWithRemarksData(oArgs.ApplicationNo, oArgs.Pernr)
            } else {
                var bIsCreateMode = oVM.getProperty("/isCreateMode");
                if (!bIsCreateMode) {
                    this.getRouter().navTo("RouteDashboard", {}, true);
                    return;
                }
                oVM.setProperty("/partyDetails", []);
                oVM.setProperty("/PreClearData", {});
                oVM.setProperty("/SelectedStatus", "New");
                oVM.setProperty("/HeaderTitle", this.getText("createPreClearanceTitle"));
                oVM.setProperty("/editable", true);
                oVM.setProperty("/tableSelectionMode", "Single");
                oVM.setProperty("/showAddButton", true);
            }

            this._getEmployeeDetails(oArgs.UserName);
        },

        onAfterRendering: function () {
            this.getView().addStyleClass("sapUiSizeCompact");
        },

        _getPreClearDetails: function (sApplicationNo, sPernr) {
            var oModel = this.getOwnerComponent().getModel();
            var oVM = this.getModel("viewModel");

            var aFilters = [
                new Filter("ApplicationNo", FilterOperator.EQ, sApplicationNo),
                new Filter("ApprovalFlag", FilterOperator.EQ, "R")
            ];

            oModel.read("/PreClearSet", {
                filters: aFilters,
                success: function (oData) {
                    oVM.setProperty("/PreClearDetails", oData.results[0]);
                    oVM.setProperty("/empDesignation", oData.results[0].Designation);
                    console.log('ReadData', oData.results[0])

                    var oPreClearData = {
                        Natureofsecurity: oData.results[0].Natureofsecurity,  // need proper property name from backend
                        NoOfSecurities: oData.results[0].NoOfSecuritiesHeld,
                        FolioNo: oData.results[0].FolioNoDPClientID,
                        NatureOfApproval: oData.results[0].NatureOfNewTransaction,
                        EstimatedNo: oData.results[0].EstimatedNoOfSecurities,
                        EstimatedValue: oData.results[0].EstimatedConsiderationValue,
                        WhetherProposed: oData.results[0].SelfOrRelative,
                        ImmediateRelativeName: oData.results[0].ImmediateRelativeName,
                        // DateOfPurchase: oData.results[0].DateOfPurchaseAllotment,
                        // PreviousApprovalNumber: oData.results[0].PreviousApprovalNumber,
                        PreviousApprovalDate: oData.results[0].DateOfPurchasePreviousApproval,
                        // OfficialAddress: oData.results[0].OfficialAddress,
                        // Telephone: oData.results[0].Telephone,
                        Email: oData.results[0].Email,
                        InterCom: oData.results[0].Intercom,
                        Mobile: oData.results[0].Mobile,
                        NameOfImmediateRelatives: oData.results[0].ImmediateRelativeName,
                        NaturePrevTxn: oData.results[0].NaturePrevTxn
                    };
                    console.log("preclearData", oPreClearData)
                    oVM.setProperty("/PreClearData", oPreClearData);
                    oVM.setProperty("/partyDetails", [oPreClearData]);
                    this._updateAddButtonVisibility();
                    oVM.setProperty("/SelectedStatus", oData.results[0].Status);
                    oVM.setProperty("/HeaderTitle", this.getText("preClearanceTradeWithNo", [oData.results[0].ApplicationNo]));

                    var bEditable = oData.results[0].Status === "Draft" ||
                        oData.results[0].Status === "New" ||
                        oData.results[0].Status === "SAVE" ||
                        oData.results[0].Status === "Returned";

                    oVM.setProperty("/editable", bEditable);
                    oVM.setProperty(
                        "/tableSelectionMode",
                        oData.results[0].Status === "Confirmed" || oData.results[0].Status === "Submitted"
                            ? "None"
                            : "Single"
                    );

                    console.log("viewModel", oVM);
                }.bind(this),

                error: function () {
                    MessageBox.error(this.getText("unableToFetchApplicationDetails"));
                }
            });
        },

        // onAddTransaction: function () {


        //     var aData = this.getModel("viewModel").getProperty("/partyDetails") || [];

        //     if (aData.length > 0) {
        //         MessageBox.information("Only one Application Request entry is allowed.");
        //         return;
        //     }


        //     this._editIndex = undefined;
        //     this.getModel("viewModel").setProperty("/PreClearData", {});

        //     this.getModel("viewModel").setProperty("/isRelativeMandatory", false);

        //     this._resetPreClearDialog();

        //     // Get relative data before opening dialog
        //     // this._getRelativeMasterData();


        //     if (!this._pPreClearDialog) {
        //         this._pPreClearDialog = Fragment.load({
        //             id: this.getView().getId(),
        //             name: "com.nhpc.zhrinstprcltrs1.fragments.ApplicationForPreClearance",
        //             controller: this
        //         }).then(function (oDialog) {
        //             this.getView().addDependent(oDialog);
        //             oDialog.addStyleClass("sapUiSizeCompact");

        //             return oDialog;
        //         }.bind(this));
        //     }

        //     this._pPreClearDialog.then(function (oDialog) {
        //         oDialog.open();
        //           this._filterRelativeMaster();
        //     });
        // },

        onAddTransaction: function () {

            var aData = this.getModel("viewModel").getProperty("/partyDetails") || [];

            if (aData.length > 0) {
                MessageBox.information("Only one Application Request entry is allowed.");
                return;
            }

            this._editIndex = undefined;

            this.getModel("viewModel").setProperty("/PreClearData", {});
            this.getModel("viewModel").setProperty("/isRelativeMandatory", false);

            if (!this._pPreClearDialog) {
                this._pPreClearDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "com.nhpc.zhrinstprcltrs1.fragments.ApplicationForPreClearance",
                    controller: this
                }).then(function (oDialog) {

                    this.getView().addDependent(oDialog);
                    oDialog.addStyleClass("sapUiSizeCompact");

                    return oDialog;

                }.bind(this));
            }

            this._pPreClearDialog.then(function (oDialog) {

                this._resetPreClearDialog();

                // Fragment is loaded now, so ComboBox can be found
                this._filterRelativeMaster();

                oDialog.open();

            }.bind(this));
        },
        _resetPreClearDialog: function () {
            var aControls = [
                "idNatureofsecurity",
                "idNoOfSecurities",
                "idFolioNo",
                "idNatureOfApproval",
                "idEstimatedNo",
                "idEstimatedValue",
                "idWhetherProposed",
                "idImmediateRelativeName",
                // "idDateOfPurchase",
                "idPreviousApprovalDate1",
                // "idOfficialAddress",
                // "idEmail",
                // "idInterCom",
                // "idTelephone"
            ];

            aControls.forEach(function (sId) {
                var oControl = this.byId(sId);

                if (oControl) {
                    oControl.setValueState("None");
                    oControl.setValueStateText("");
                }
            }.bind(this));
        },

        onSubmitPreClearDialog: function () {
            var oBundle = this.getResourceBundle();

            if (!this._validatePreClearDialog()) {
                MessageBox.error(this.getText("fillMandatoryFields"));
                return;
            }

            var oModel = this.getModel("viewModel");
            var oData = Object.assign({}, oModel.getProperty("/PreClearData"));
            var oMobileInput = this.byId("idTelephone");
            var oEmailInput = this.byId("idEmail");


            // if (oData.Telephone && oData.Telephone.toString().length !== 10) {
            //     oMobileInput.setValueState("Error");
            //     oMobileInput.setValueStateText(oBundle.getText("invalidMobile"));
            //     return;
            // }

            var aData = oModel.getProperty("/partyDetails") || [];
            console.log("aData", aData);

            if (this._editIndex !== undefined) {
                oData.Counter = aData[this._editIndex].Counter;
                aData[this._editIndex] = oData;
                this._editIndex = undefined;
            } else {
                oData.Counter = aData.length + 1;
                aData.push(oData);
            }

            oModel.setProperty("/partyDetails", aData);
            this._updateAddButtonVisibility();
            oModel.refresh(true);
            this.onClosePreClearDialog();
        },

        onEditTransaction: function () {

            var aData = this.getModel("viewModel").getProperty("/partyDetails") || [];

            if (!aData.length) {
                MessageBox.error("No record available.");
                return;
            }

            this._editIndex = 0;

            this.getModel("viewModel").setProperty(
                "/PreClearData",
                Object.assign({}, aData[0])
            );
            this.getModel("viewModel").setProperty(
                "/isRelativeMandatory",
                aData[0].WhetherProposed === "RELATIVE"
            );

            // Get relative data before opening dialog
            // this._getRelativeMasterData();

            if (!this._pPreClearDialog) {
                this._pPreClearDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "com.nhpc.zhrinstprcltrs1.fragments.ApplicationForPreClearance",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }

            this._pPreClearDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onClosePreClearDialog: function () {
            this._editIndex = undefined;
            this.getModel("viewModel").setProperty("/PreClearData", {});
            this._resetPreClearDialog();

            if (this._pPreClearDialog) {
                this._pPreClearDialog.then(function (oDialog) {
                    oDialog.close();
                });
            }
        },



        onDeleteTransaction: function () {
            var oBundle = this.getResourceBundle();

            var aData = this.getModel("viewModel").getProperty("/partyDetails") || [];

            if (aData.length === 0) {
                MessageBox.error(oBundle.getText("selectRecord"));
                return;
            }
            var confirmBtn = this.getText("confirmBtn");
            MessageBox.confirm(oBundle.getText("confirmDelete"), {
                title: oBundle.getText("delete"),
                actions: [confirmBtn, MessageBox.Action.CANCEL],
                emphasizedAction: confirmBtn,

                onClose: function (sAction) {
                    if (sAction === confirmBtn) {

                        var oModel = this.getModel("viewModel");

                        // Clear the only record
                        oModel.setProperty("/partyDetails", []);

                        // Clear dialog model as well
                        oModel.setProperty("/PreClearData", {});


                        this._updateAddButtonVisibility();

                        oModel.refresh(true);

                        MessageToast.show(
                            oBundle.getText("recordDeleted")
                        );
                    }
                }.bind(this)
            });
        },
        handleSaveBtnPress: function () {
            var oBundle = this.getResourceBundle();

            var oVM = this.getModel("viewModel");
            var oPreClear = oVM.getProperty("/PreClearDetails") || {};

            if (!oPreClear.DateOfJoiningDP || oPreClear.DateOfJoiningDP === "00000000") {
                oVM.setProperty("/DOJValueState", ValueState.Error);
                oVM.setProperty("/DOJValueStateText", this.getText("dojMandatoryMsg"));

                MessageBox.error(this.getText("dojMandatoryMsg"))
                return;

            }

            var confirmBtn = this.getText("confirmBtn");

            MessageBox.confirm(oBundle.getText("saveConfirm"), {
                title: oBundle.getText("confirmation"),
                actions: [confirmBtn, MessageBox.Action.CANCEL],
                emphasizedAction: confirmBtn,

                onClose: function (sAction) {
                    if (sAction === confirmBtn) {
                        this._savePreClearance("Draft");
                    }
                }.bind(this)
            });
        },

        handleSubmitBtnPress: function () {
            var oBundle = this.getResourceBundle();

            var oVM = this.getModel("viewModel");
            var oPreClear = oVM.getProperty("/PreClearDetails") || {};
            var aTransactions = oVM.getProperty("/partyDetails") || [];

            if (!oPreClear.DateOfJoiningDP || oPreClear.DateOfJoiningDP === "00000000") {
                oVM.setProperty("/DOJValueState", ValueState.Error);
                oVM.setProperty("/DOJValueStateText", this.getText("dojMandatoryMsg"));

                MessageBox.error(this.getText("dojMandatoryMsg"))
                return;
            }

            if (aTransactions.length === 0) {
                MessageBox.error(oBundle.getText("addAtLeastOneRecord"));
                return;
            }
            var confirmBtn = this.getText("confirmBtn");
            MessageBox.confirm(oBundle.getText("submitConfirm"), {
                title: oBundle.getText("confirmation"),
                actions: [confirmBtn, MessageBox.Action.CANCEL],
                emphasizedAction: confirmBtn,

                onClose: function (sAction) {
                    if (sAction === confirmBtn) {
                        this._savePreClearance("Confirmed");
                    }
                }.bind(this)
            });
        },

        _savePreClearance: function (sStatus) {
            var oModel = this.getOwnerComponent().getModel();
            var oVM = this.getModel("viewModel");
            var oBundle = this.getResourceBundle();

            var oEmp = oVM.getProperty("/EmpDetails") || {};
            var oPreClear = oVM.getProperty("/PreClearDetails") || {};
            var aTransactions = oVM.getProperty("/partyDetails") || [];
            var designation = oVM.getProperty("/empDesignation") || "";


            var oPayload = {
                ApplicationNo: "",
                Pernr: oEmp.PERNR || "",
                Version: "1",
                EmployeeName: oEmp.ENAME || "",
                Designation: designation,
                Department: oEmp.Department || "",
                DateOfJoiningDP: oPreClear.DateOfJoiningDP || "",
                Status: sStatus
            };
            // Generate Notification ID only when submitting
            if (sStatus === "Confirmed") {
                oPayload.BTPNotification = crypto.randomUUID();
            }

            // if (sStatus === "CONFIRM" && oPreClear.ApplicationNo) {
            //     oPayload.ApplicationNo = oPreClear.ApplicationNo;
            //     oPayload.Pernr = oPreClear.Pernr;
            // }

            if (oPreClear.ApplicationNo) {
                oPayload.ApplicationNo = oPreClear.ApplicationNo;
                oPayload.Pernr = oPreClear.Pernr;
            }


            if (aTransactions.length > 0) {
                var oTran = aTransactions[0];

                oPayload.Natureofsecurity = oTran.Natureofsecurity || ""; //need proper property name from backend
                oPayload.NoOfSecuritiesHeld = oTran.NoOfSecurities || "";
                oPayload.FolioNoDPClientID = oTran.FolioNo || "";
                oPayload.NatureOfNewTransaction = oTran.NatureOfApproval || "";
                oPayload.EstimatedNoOfSecurities = oTran.EstimatedNo || "";
                oPayload.EstimatedConsiderationValue = oTran.EstimatedValue || "";
                oPayload.SelfOrRelative = oTran.WhetherProposed || "";
                oPayload.ImmediateRelativeName = oTran.ImmediateRelativeName || "";
                oPayload.PAN = oTran.PAN || "";
                // oPayload.DateOfPurchaseAllotment = oTran.DateOfPurchase || "";
                // oPayload.PreviousApprovalNumber = oTran.PreviousApprovalNumber || "";
                oPayload.DateOfPurchasePreviousApproval = oTran.PreviousApprovalDate || "";
                // oPayload.OfficialAddress = oTran.OfficialAddress || "";
                // oPayload.Telephone = oTran.Telephone || "";
                oPayload.Email = oEmp.EMAIL || "";
                // oPayload.Intercom = oTran.InterCom || "";
                oPayload.Mobile = oEmp.MOBILE || "";
                oPayload.NaturePrevTxn = oTran.NaturePrevTxn || "";
            }

            BusyIndicator.show();
            console.log("oPayload", oPayload)

            oModel.create("/PreClearSet", oPayload, {

                success: function (oData) {
                    console.log("Save Success response", oData);
                    BusyIndicator.hide();

                    // Clear create mode
                    oVM.setProperty("/isCreateMode", false);

                    var sApplicationNo = oData.ApplicationNo;

                    // Send BTP notification only for Submit
                    if (sStatus === "Confirmed") {

                        var sNotificationId = oData.BTPNotification;
                        var sApproverMail = oData.ApproverMailId;

                        if (sNotificationId && sApproverMail) {

                            var aApproverMail = sApproverMail.split(",").map(function (sMail) {
                                    return sMail.trim();
                                }).filter(Boolean);

                            this.NotificationID = sNotificationId;
                            this.ApproverID = aApproverMail;
                            this.sRequestNumber = sApplicationNo;
                            this.RequesterName = sap.ushell.Container.getUser().getFullName();

                            var oNotifyPayload = this.createNotificationPayload(
                                this.NotificationID,
                                this.ApproverID,
                                this.sRequestNumber,
                                this.RequesterName
                            );

                            this.sendNotification(oNotifyPayload);
                        }
                    }

                    var sMessage = sStatus === "Draft"
                        ? oBundle.getText("savedSuccess", [sApplicationNo])
                        : oBundle.getText("submittedSuccess", [sApplicationNo]);

                    MessageBox.success(sMessage, {
                        onClose: function () {
                            this.getRouter().navTo("RouteDashboard");
                        }.bind(this)
                    });
                }.bind(this),

                error: function (oError) {
                    BusyIndicator.hide();
                    this.showError(oError, true);
                }.bind(this)
            });
        },

        onPhoneNumberChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue().replace(/\D/g, "");

            if (sValue.length > 10) {
                sValue = sValue.substring(0, 10);
            }

            oInput.setValue(sValue);
        },

        onEmailChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var sEmail = oInput.getValue();
            var oBundle = this.getResourceBundle();

            var bValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sEmail);

            if (sEmail && !bValid) {
                oInput.setValueState("Error");
                oInput.setValueStateText(oBundle.getText("invalidEmail"));
            } else {
                oInput.setValueState("None");
            }
        },

        onTelephoneLiveChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();

            // Allow only digits
            sValue = sValue.replace(/\D/g, "");

            // Limit to 10 digits
            if (sValue.length > 10) {
                sValue = sValue.substring(0, 10);
            }

            oInput.setValue(sValue);
        },
        _updateAddButtonVisibility: function () {
            var aData = this.getModel("viewModel").getProperty("/partyDetails") || [];

            this.getModel("viewModel").setProperty(
                "/showAddButton",
                aData.length === 0
            );
        },
        _getHistoryWithRemarksData: function (ApplicationNo, Pernr) {
            var oModel = this.getOwnerComponent().getModel();
            var oVM = this.getModel("viewModel");

            var aFilters = [
                new Filter("Pernr", FilterOperator.EQ, Pernr),
                new Filter("FormNo", FilterOperator.EQ, "FORM3"),
                new Filter("ApplicationNo", FilterOperator.EQ, ApplicationNo)
            ];

            oModel.read("/RemarkHistorySet", {
                filters: aFilters,
                success: function (oData) {
                    oVM.setProperty("/History", oData.results);
                    console.log("History Data", oData.results);
                }.bind(this),

                error: function () {
                    MessageBox.error(this.getText("unableToFetchApplicationDetails"));
                }
            });
        },
        // _getRelativeMasterData: function () {
        //     var oModel = this.getOwnerComponent().getModel();
        //     var oVM = this.getModel("viewModel");

        //     var sPernr = oVM.getProperty("/EmpDetails/PERNR");

        //     BusyIndicator.show();

        //     oModel.read("/RelativeMasterSet", {
        //         filters: [
        //             new Filter("Pernr", FilterOperator.EQ, sPernr)
        //         ],

        //         success: function (oData) {
        //             BusyIndicator.hide();
        //             console.log("Relative Master Data:", oData.results);
        //             oVM.setProperty("/RelativeMasterData", oData.results || []);
        //         },

        //         error: function (oError) {
        //             BusyIndicator.hide();
        //             console.error("Error fetching Relative Master Data:", oError);
        //             oVM.setProperty("/RelativeMasterData", []);
        //         }
        //     });
        // },
        _filterRelativeMaster: function () {
            var oVM = this.getModel("viewModel");

            var sPernr = oVM.getProperty("/EmpDetails/PERNR");

            var oComboBox = this.byId("idImmediateRelativeName");

            var oBinding = oComboBox.getBinding("items");

            if (oBinding && sPernr) {
                oBinding.filter([
                    new Filter("Pernr", FilterOperator.EQ, sPernr)
                    // new Filter("ReltStatus", FilterOperator.EQ, "Active")
                ]);
            } else if (oBinding) {
                oBinding.filter([]);
            }
        }
    });
});