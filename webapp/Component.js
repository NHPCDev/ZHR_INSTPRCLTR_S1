sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/nhpc/zhrinstprcltrs1/model/models",
    "com/nhpc/zhrinstprcltrs1/util/messenger",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (UIComponent, models, messenger, Filter, FilterOperator) => {
    "use strict";

    return UIComponent.extend("com.nhpc.zhrinstprcltrs1.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            // this.getRouter().initialize();
            this.setModel(models.createViewModel(), "viewModel");
            this.setModel(models.createFilterModel(), "filterModel");
            messenger.init(this);


            this._checkEligibility();


        },
        _checkEligibility: function () {

            var oModel = this.getModel();
            var oViewModel = this.getModel("viewModel");

            var aFilters = [
                new Filter("ApprovalFlag", FilterOperator.EQ, "R"),
            ];

            oModel.read("/CheckAuthSet", {
                filters: aFilters,

                success: function (oResponse) {
                    console.log("Authorization check response:", oResponse);

                    var bAuthorized = true;

                    if (oResponse.results && oResponse.results.length > 0 && oResponse.results[0].AuthResponse === "No") {
                        bAuthorized = false;
                    }

                    // Store authorization result globally
                    oViewModel.setProperty("/isAuthorized", bAuthorized);

                    // Initialize router only after authorization check
                    this.getRouter().initialize();

                    if (!bAuthorized) {
                        this.getRouter().navTo("RouteErrorPage", {}, true);
                    }

                    // Check Form 8 only if user is authorized
                    if (bAuthorized && oResponse.results && oResponse.results.length > 0) {
                        if (oResponse.results[0].Form8Fill === "No") {
                            oViewModel.setProperty("/Form8Fill", false);
                        } else {
                            oViewModel.setProperty("/Form8Fill", true);
                        }
                    }
                }.bind(this),

                error: function () {

                    oViewModel.setProperty("/isAuthorized", false);
                    this.getRouter().initialize();

                    this.getRouter().navTo("RouteErrorPage", {}, true);

                }.bind(this)
            });

        }

    });
});