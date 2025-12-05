"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ERROR_TYPE = exports.VALIDATION_TEMPLATE_ERRORS = void 0;
/**
 * Predefined validation template error messages
 */
exports.VALIDATION_TEMPLATE_ERRORS = {
    WrongFile: "The system has recognized that you have uploaded the wrong file. Please try again, or if you need additional help, please reach out to your system administrator.",
    DifferentReportingLevel: "The system has recognized an error regarding the reporting level. Please check the reporting level in the file and try again. If you need additional help, please reach out to your system administrator.",
    DifferentYear: "The system has recognized an error regarding the fiscal year. Please make sure the fiscal year entered matches the year specified in the file and try again. If you need additional help, please reach out to your system administrator.",
    NumberOfRecords: "The system has encountered an error regarding the number of records in this file. The file did not have the same number of records as specified in the header. Please try again, or if you need additional help, please reach out to your system administrator.",
    FileHeader: "The system has detected that one or more columns in the header record exceed the maximum allowed character length. Please review the header values and ensure no column exceeds the character limit and try again. If you need additional help, please contact your system administrator.",
    Unknown: "The system has encountered an unknown error while loading your data. Please try again, or if you need additional help, please reach out to your system administrator.",
    Connection: "The system has encountered an error connecting to “data source name”. Please try again, or if you need additional help, please reach out to your system administrator.",
    Timeout: "The system has identified that you have been idle for an extended period of time, and you have been timed out of your session. Please try again, or if you need additional help, please reach out to your system administrator."
};
exports.DEFAULT_ERROR_TYPE = "Unknown";
//# sourceMappingURL=core.js.map