sap.ui.define([
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/format/NumberFormat"

], function (DateFormat, NumberFormat) {
    "use strict";

    return {

        formatDate: function (sValue) {

            if (!sValue) {
                return "";
            }

            // YYYYMMDD
            if (typeof sValue === "string" &&
                sValue.length === 8 &&
                /^\d+$/.test(sValue)) {

                if (sValue !== "00000000") {
                    return sValue.substring(6, 8) + "." +
                        sValue.substring(4, 6) + "." +
                        sValue.substring(0, 4);
                }
                return "";
            }

            // MM/DD/YY or M/D/YY (7/13/26)
            if (typeof sValue === "string" &&
                sValue.indexOf("/") > -1) {

                var oDate = new Date(sValue);

                if (!isNaN(oDate.getTime())) {
                    var dd = String(oDate.getDate()).padStart(2, "0");
                    var mm = String(oDate.getMonth() + 1).padStart(2, "0");
                    var yyyy = oDate.getFullYear();

                    return dd + "." + mm + "." + yyyy;
                }
            }

            // Date object
            if (sValue instanceof Date) {
                var dd = String(sValue.getDate()).padStart(2, "0");
                var mm = String(sValue.getMonth() + 1).padStart(2, "0");
                var yyyy = sValue.getFullYear();

                return dd + "." + mm + "." + yyyy;
            }

            return sValue;
        },
        formatBlankValue: function (value) {
            if (!value) {
                return "-";
            } else {
                return value;
            }
        },



        formatObjectPageTitle: function (sAppNo) {
            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            const sText = oResourceBundle.getText("ObjectPageTitle")
            return sAppNo
                ? `${sText} - ${sAppNo}`
                : `Create ${sText}`;
        },

        formatObjectPageSubTitle: function (sAppNo) {
            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            const sText = oResourceBundle.getText("ObjectPageSubTitle")
            return sAppNo
                ? `${sText} - ${sAppNo}`
                : `Create ${sText}`;
        },

        formatStatusText: function (sStatus) {

            if (!sStatus) {
                return "";
            }

            switch (sStatus.toUpperCase()) {

                case "NEW":
                    return "New";

                case "DRAFT":
                    return "Draft";

                case "SAVED":
                    return "Saved";

                case "SUBMIT":
                case "SUBMITTED":
                    return "Submitted";

                case "CONFIRM":
                case "CONFIRMED":
                    return "Confirmed"

                case "APPROVE":
                case "APPROVED":
                    return "Approved"

                case "RETURN":
                case "RETURNED":
                    return "Returned"

                default:
                    return sStatus;
            }
        },

        formatStatusState: function (sStatus) {

            if (!sStatus) {
                return "None";
            }

            switch (sStatus.toUpperCase()) {

                case "NEW":
                case "CONFIRM":
                case "CONFIRMED":
                    return "Information";

                case "DRAFT":
                case "PENDING":
                    return "Warning";

                case "SUBMIT":
                case "SUBMITTED":
                case "APPROVE":
                case "APPROVED":
                    return "Success";

                case "REJECT":
                case "REJECTED":
                    return "Error";

                case "RETURN":
                case "RETURNED":
                    return "Warning";

                default:
                    return "Information";
            }
        },
        formatHeaderTitle: function (sTitle) {
            return sTitle || "";
        },
        formatTextWithBreaks: function (sText) {

            if (!sText) {
                return "";
            }

            return sText.replace(/\n/g, "<br/>");
        },
        formatUndertakingText: function (sText) {
            if (!sText) {
                return "";
            }

            sText = sText.replace(/^UNDERTAKING\s*\n?/i, "");


            sText = sText.replace(

                /In this connection I solemnly confirm and declare:/g,
                "<strong><u>In this connection I solemnly confirm and declare:</u></strong>"
            );



            return sText.replace(/\n/g, "<br/>");
        },
        formatNatureOfTransaction: function (sValue) {
            switch (sValue) {
                case "S":
                    return "Sell";
                case "P":
                    return "Buy";
                default:
                    return sValue || "";
            }
        },
        formatHistoryDateTime: function (oDate, oTime) {

            if (!oDate || !oTime) {
                return "";
            }

            var year = oDate.substring(0, 4);
            var month = oDate.substring(4, 6);
            var day = oDate.substring(6, 8);

            var sDate = day + "." + month + "." + year;

            var iHours = 0,
                iMinutes = 0,
                iSeconds = 0;

            if (typeof oTime === "string") {

                if (/^\d{6}$/.test(oTime)) {
                    iHours = parseInt(oTime.substring(0, 2), 10);
                    iMinutes = parseInt(oTime.substring(2, 4), 10);
                    iSeconds = parseInt(oTime.substring(4, 6), 10);
                }

                else {
                    var match = oTime.match(/PT(\d+)H(\d+)M(\d+)S/);

                    if (match) {
                        iHours = parseInt(match[1], 10);
                        iMinutes = parseInt(match[2], 10);
                        iSeconds = parseInt(match[3], 10);
                    }
                }
            }

            var sTime =
                String(iHours).padStart(2, "0") + ":" +
                String(iMinutes).padStart(2, "0") + ":" +
                String(iSeconds).padStart(2, "0");

            return sDate + " " + sTime;
        },
        formatAmountToINR: function (sValue) {
            if (!sValue) {
                return "";
            }

            var oLocale = new sap.ui.core.Locale("en-IN");
            var oCurrencyFormat = NumberFormat.getCurrencyInstance({
                decimals: 2
            }, oLocale);

            return oCurrencyFormat.format(parseFloat(sValue), "INR");
        }

    };
});