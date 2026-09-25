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
    "sap/m/MessageBox",
    "sap/m/PDFViewer"
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
    MessageBox,
    PDFViewer
) {
    "use strict";

    const EdmType = exportLibrary.EdmType;


    return BaseController.extend("com.nhpc.zhrinstprcltrs1.controller.Dashboard", {
        formatter: formatter,
        onInit: function () {
            var oModel = this.getOwnerComponent().getModel();

            this._pdfViewer = new PDFViewer({ isTrustedSource: true });

            this.getRouter().getRoute("RouteDashboard").attachPatternMatched(this._onRoutePatternMatched, this);
        },
        _onRoutePatternMatched: function () {
            var oViewModel = this.getModel("viewModel");
            var bAuthorized = oViewModel.getProperty("/isAuthorized");

            // Block unauthorized users from loading Dashboard
            if (bAuthorized !== true) {
                this.getRouter().navTo("RouteErrorPage", {}, true);
                return;
            }

            this.getModel().refresh();
            this.checkEligibilityToCreate();

            // var oFilterModel = this.getModel("filterModel");
            // var oDate = new Date();
            // var iYear = oDate.getFullYear();
            // var iMonth = oDate.getMonth() + 1;
            // var sFinancialYear;

            // if (iMonth >= 4) {
            //     sFinancialYear =
            //         iYear + "-" +
            //         String(iYear + 1).slice(-2);
            // } else {
            //     sFinancialYear =
            //         (iYear - 1) + "-" +
            //         String(iYear).slice(-2);
            // }

            // oFilterModel.setProperty("/Year", sFinancialYear);
            // this._getDashboardData();
            // this.onDashboardFilterSearch();
        },
        onAfterRendering: function () {
            this.getView().addStyleClass("sapUiSizeCompact");
        },
        _getDashboardData: function () {

            var oModel = this.getOwnerComponent().getModel();

            oModel.read("/PreClearSet", {
                success: function (oData) {

                    console.log("Dashboard PreClearSet Response:", oData);

                },
                error: function (oError) {
                    console.log("Error:", oError);
                }
            });

        },
        // handleCreatePress: function () {

        //     var oModel = this.getOwnerComponent().getModel();
        //     var oVM = this.getModel("viewModel");
        //     var oFilter = new Filter("Preview", FilterOperator.EQ, "X");

        //     oVM.setProperty("/partyDetails", []);
        //     oVM.setProperty("/PreClearData", {});
        //     BusyIndicator.show();

        //     oModel.read("/PreClearSet", {
        //         filters: [oFilter],
        //         success: function (oData) {

        //             BusyIndicator.hide();

        //             var oPreClear = {};

        //             if (oData.results.length > 0) {
        //                 oPreClear = oData.results[0];
        //             }

        //             oPreClear.ApplicationNo = "";
        //             oPreClear.Pernr = "";
        //             oPreClear.Status = "New";

        //             oVM.setProperty("/PreClearDetails", oPreClear);
        //             oVM.setProperty("/SelectedStatus", "New");
        //             oVM.setProperty("/HeaderTitle", this.getText("createPreClearanceTitle"));
        //             oVM.setProperty("/editable", true);

        //             this.navTo("RouteDetail");

        //         }.bind(this),

        //         error: function (oError) {

        //             BusyIndicator.hide();
        //             this.showError(oError, true);

        //         }.bind(this)
        //     });
        // },
        handleCreatePress: function () {

            var oModel = this.getOwnerComponent().getModel();
            var oVM = this.getModel("viewModel");

            if (oVM.getProperty("/Form8Fill") === false) {
                MessageBox.error(this.getText("form8FillError"));
                return;
            }


            var aFilters = [
                new Filter("Preview", FilterOperator.EQ, "X"),
                new Filter("ApprovalFlag", FilterOperator.EQ, "R")
            ];

            oVM.setProperty("/partyDetails", []);
            oVM.setProperty("/PreClearData", {});
            BusyIndicator.show();

            oModel.read("/PreClearSet", {
                filters: aFilters,
                success: function (oData) {

                    BusyIndicator.hide();

                    var oPreClear = {};

                    if (oData.results.length > 0) {
                        oPreClear = oData.results[0];
                    }

                    oPreClear.ApplicationNo = "";
                    oPreClear.Pernr = "";
                    oPreClear.Status = "New";

                    oVM.setProperty("/PreClearDetails", oPreClear);
                    oVM.setProperty("/SelectedStatus", "New");
                    oVM.setProperty("/HeaderTitle", this.getText("createPreClearanceTitle"));
                    oVM.setProperty("/editable", true);
                    oVM.setProperty("/isCreateMode", true);

                    this.navTo("RouteDetail");

                }.bind(this),

                error: function (oError) {

                    BusyIndicator.hide();
                    this.showError(oError, true);

                }.bind(this)
            });
        },
        onTableUpdateFinished: function (oEvent) {

            var iCount = oEvent.getParameter("total");

            this.byId("idDashboardTitle").setText(this.getText("compliancedashboardTitle") + " (" + iCount + ")");

        },
        // onRowsUpdated: function () {
        //     var oTable = this.byId("idDashboardTable");
        //     var oBinding = oTable.getBinding("rows");
        //     if (!oBinding) {
        //         return;
        //     }

        //     var aRows = oTable.getRows();
        //     aRows.forEach(function (oRow, iIndex) {

        //     });

        //     var iCount = oBinding.getLength();
        //     var oRowMode = oTable.getRowMode();

        //     if (oRowMode) {
        //         if (iCount >= 5) {
        //             oRowMode.setRowCount(5);
        //         } else {
        //             oRowMode.setRowCount(iCount > 0 ? iCount : 1);
        //         }
        //     }

        //     var oResourceBundle = this.getResourceBundle();
        //     this.byId("idDashboardTitle").setText(
        //         oResourceBundle.getText("compliancedashboardTitle") + " (" + iCount + ")"
        //     );
        // },
        // onRowSelectionChange: function (oEvent) {

        //     var iIndex = oEvent.getParameter("rowIndex");
        //     var oTable = this.byId("idDashboardTable");
        //     var oContext = oTable.getContextByIndex(iIndex);

        //     if (!oContext) {
        //         return;
        //     }

        //     var oData = oContext.getObject();

        //     var oVM = this.getOwnerComponent()
        //         .getModel("viewModel");

        //     oVM.setProperty(
        //         "/SelectedStatus",
        //         oData.Status
        //     );

        //     this.getRouter().navTo("RouteDetail", {
        //         ApplicationNo: oData.ApplicationNo,
        //         Pernr: oData.Pernr
        //     });
        //     // this._getEmployeeDetails();
        // },
        onRowSelectionChange: function (oEvent) {

            var oItem = oEvent.getSource();

            if (!oItem) {
                return;
            }

            var oData = oItem.getBindingContext().getObject();

            var oVM = this.getModel("viewModel");

            oVM.setProperty("/SelectedStatus", oData.Status);

            this.navTo("RouteDetail", {
                ApplicationNo: oData.ApplicationNo,
                Pernr: oData.Pernr,
                UserName: oData.UserName
            });

        },
        onDashboardFilterSearch: function () {

            var oFilterModel = this.getModel("filterModel");

            var sFinancialYear = oFilterModel.getProperty("/Year");
            var sStatus = oFilterModel.getProperty("/Status");
            var sApplicationNo = oFilterModel.getProperty("/ApplicationNo");
            // var sPernr = oFilterModel.getProperty("/Pernr");

            var aFilters = [];

            if (sFinancialYear) {
                aFilters.push(
                    new Filter(
                        "Year",
                        FilterOperator.EQ,
                        sFinancialYear
                    )
                );
            }

            if (sStatus) {
                aFilters.push(
                    new Filter(
                        "Status",
                        FilterOperator.EQ,
                        sStatus
                    )
                );
            }

            if (sApplicationNo) {
                aFilters.push(
                    new Filter(
                        "ApplicationNo",
                        FilterOperator.Contains,
                        sApplicationNo
                    )
                );
            }

            // if (sPernr) {
            //     aFilters.push(
            //         new Filter(
            //             "Pernr",
            //             FilterOperator.EQ,
            //             sPernr
            //         )
            //     );
            // }

            var oTable = this.byId("idDashboardTable");
            var oBinding = oTable.getBinding("items");

            if (oBinding) {
                oBinding.filter(aFilters);
            }
        },
        onApplicationNoChange: function (oEvent) {
            this._validateInput(
                oEvent,
                "ApplicationNo",
                "/ApplicationNo"
            );
        },
        onEmployeeNoChange: function (oEvent) {
            this._validateInput(
                oEvent,
                "Pernr",
                "/Pernr"
            );
        },
        onExport: function () {

            var oTable = this.byId("idDashboardTable");

            var oBinding = oTable.getBinding("items");

            if (!oBinding) {
                return;
            }

            var aContexts = oBinding.getContexts(0, oBinding.getLength());

            var aExportData = aContexts.map(function (oContext) {

                var oItem = oContext.getObject();

                return {
                    ApplicationNo: oItem.ApplicationNo,
                    Pernr: oItem.Pernr,
                    EmployeeName: oItem.EmployeeName,
                    wrks: oItem.wrks,
                    LocationId: oItem.LocationId,
                    ConfirmedOn: this.formatter.formatDate(oItem.ConfirmedOn),
                    ApprovedOn: this.formatter.formatDate(oItem.ApprovedOn),
                    RejectedOn: this.formatter.formatDate(oItem.RejectedOn),
                    Status: this.formatter.formatStatusText(oItem.Status)
                };

            }.bind(this));

            var sFileName = this.getResourceBundle().getText("dashboardExcelTitle") + ".xlsx";


            var oSettings = {
                workbook: { columns: this.createDashboardColumnConfig() },
                dataSource: aExportData,
                fileName: sFileName
            };


            var oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });

        },
        createDashboardColumnConfig: function () {

            var oResourceBundle = this.getResourceBundle();

            return [
                {
                    label: oResourceBundle.getText("applicationNo"),
                    property: "ApplicationNo",
                    width: 20
                },
                {
                    label: oResourceBundle.getText("empNo"),
                    property: "Pernr",
                    width: 15
                },
                {
                    label: oResourceBundle.getText("employeeName"),
                    property: "EmployeeName",
                    width: 25
                },
                {
                    label: oResourceBundle.getText("locationId"),
                    property: "wrks",
                    width: 25
                },
                {
                    label: oResourceBundle.getText("locationName"),
                    property: "LocationId",
                    width: 25
                },
                {
                    label: oResourceBundle.getText("confirmedOn"),
                    property: "ConfirmedOn",
                    width: 18
                },
                {
                    label: oResourceBundle.getText("approvedOn"),
                    property: "ApprovedOn",
                    width: 18
                },
                {
                    label: oResourceBundle.getText("rejectedOn"),
                    property: "RejectedOn",
                    width: 18
                },
                {
                    label: oResourceBundle.getText("status"),
                    property: "Status",
                    width: 15
                }
            ];
        },

        onPreviewPdf: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext();

            if (!oContext) {
                return;
            }

            var oData = oContext.getObject();

            // console.log(oData);

            var sApplicationNo = oData.ApplicationNo;
            var sPernr = oData.Pernr;

            var oModel = this.getModel();

            // var sUrl = oModel.sServiceUrl + "/AttachmentEntitySet(ApplicationNo='" + encodeURIComponent(sApplicationNo) + "',Pernr='" + encodeURIComponent(sPernr) + "')/$value";
            var sUrl =
                oModel.sServiceUrl +
                "/AttachmentEntitySet(ApplicationNo='" +
                encodeURIComponent(sApplicationNo) +
                "',Pernr='" +
                encodeURIComponent(sPernr) +
                "',Form='3')/$value";

            // console.log("pdfUrl:", sUrl);

            this._pdfViewer.setSource(sUrl);
            this._pdfViewer.setTitle(this.getText("attachmentTitle"));
            this._pdfViewer.open();
        },
        checkEligibilityToCreate: function () {
            let oViewModel = this.getModel("viewModel");
            var oModel = this.getOwnerComponent().getModel();
            let aFilters = [
                new Filter("ApprovalFlag", FilterOperator.EQ, "R"),
                new Filter("FormNo", FilterOperator.EQ, "3")
            ]
            oModel.read("/CheckAuthSet", {
                filters: aFilters,
                success: function (oData) {
                    let sAuth = oData.results[0].AuthResponse;
                    if (sAuth === "No") {
                        oViewModel.setProperty("/isCreateAllowed", false);
                    } else {
                        oViewModel.setProperty("/isCreateAllowed", true);
                    }
                    // console.log("Create Allowed:", oViewModel.getProperty("/isCreateAllowed"));

                },
                error: function (oError) {
                    MessageBox.error(this.getText("unableToFetchEligibility"));
                }
            });
        }



    });
});