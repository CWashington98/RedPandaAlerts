import {
  formatDate,
  AWSFormatDate,
  AWSFormatDateTime,
  formatUSStandardDateTime,
  formatExtendedUSDate,
  getEventFormatDate,
  getDayofWeek,
  getMonth,
  getDayOfMonth,
  getTimeIn12HourFormat,
  formatBusinessHours,
} from "../formatDateTime"; // Adjust the import path to your file location

describe("dateUtils", () => {
  const sampleDate = new Date("2022-05-15T12:34:56Z"); // May 15, 2022, 12:34:56 PM UTC
  const sampleDateString = "2022-05-15T12:34:56Z";

  // Edge Case: Invalid Dates
  const invalidDate = new Date("Invalid Date");
  const invalidDateString = "Invalid-Date-String";

  describe("formatDate", () => {
    it("should format date correctly", () => {
      expect(formatDate(sampleDate)).toBe("05/15/2022");
      expect(formatDate(sampleDateString)).toBe("05/15/2022");
    });
    it("should return 'Invalid Date' for invalid dates", () => {
      expect(formatDate(invalidDate)).toBe("Invalid Date");
      expect(formatDate(invalidDateString)).toBe("Invalid Date");
    });
  });

  describe("AWSFormatDate", () => {
    it("should format AWS date correctly", () => {
      expect(AWSFormatDate(sampleDate)).toBe("2022-05-15");
      // Below does not work because it's an ISO time stamp
      expect(AWSFormatDate(sampleDateString)).toBe("Invalid Date");
    });
    it("should return 'Invalid Date' for invalid dates", () => {
      expect(AWSFormatDate(invalidDate)).toBe("Invalid Date");
      expect(AWSFormatDate(invalidDateString)).toBe("Invalid Date");
    });
  });

  describe("AWSFormatDateTime", () => {
    it("should format AWS date-time correctly", () => {
      expect(AWSFormatDateTime(sampleDate)).toBe("2022-05-15T12:34:56.000Z");
      expect(AWSFormatDateTime(sampleDateString)).toBe("2022-05-15T12:34:56.000Z");
    });
  });

  describe("formatUSStandardDateTime", () => {
    it("should format US standard date-time correctly for various time zones", () => {
      // EST
      expect(formatUSStandardDateTime(sampleDate, "America/New_York")).toBe("05/15/2022, 08:34 AM");
      // EDT (Daylight Saving Time)
      expect(formatUSStandardDateTime(new Date("2022-05-15T12:34:56Z"), "America/New_York")).toBe("05/15/2022, 08:34 AM");
      // Central Time
      expect(formatUSStandardDateTime(sampleDate, "America/Chicago")).toBe("05/15/2022, 07:34 AM");
      // Mountain Time
      expect(formatUSStandardDateTime(sampleDate, "America/Denver")).toBe("05/15/2022, 06:34 AM");
      // Pacific Time
      expect(formatUSStandardDateTime(sampleDate, "America/Los_Angeles")).toBe("05/15/2022, 05:34 AM");
      // Alaska Time
      expect(formatUSStandardDateTime(sampleDate, "America/Anchorage")).toBe("05/15/2022, 04:34 AM");
      // Hawaii-Aleutian Time
      expect(formatUSStandardDateTime(sampleDate, "Pacific/Honolulu")).toBe("05/15/2022, 02:34 AM");
    });
  });

  describe("formatExtendedUSDate", () => {
    it("should format extended US date correctly", () => {
      expect(formatExtendedUSDate(sampleDate)).toBe("Sun, May 15, 2022");
      expect(formatExtendedUSDate(sampleDateString)).toBe("Sun, May 15, 2022");
      expect(formatExtendedUSDate(sampleDate, true)).toBe("Sun, May 15, 2022, 12:34 PM");
      expect(formatExtendedUSDate(sampleDateString, true)).toBe("Sun, May 15, 2022, 12:34 PM");
    });
  });

  describe("getEventFormatDate", () => {
    it("should get event format date correctly", () => {
      const result = getEventFormatDate("2022-05-15");
      expect(result).toEqual({
        dayOfWeek: "Sunday",
        month: "May",
        dayOfMonth: "15",
        year: "2022",
      });
    });
  });

  describe("getDayofWeek", () => {
    it("should get day of week correctly", () => {
      expect(getDayofWeek("2022-05-15")).toBe("Sunday");
    });
  });

  describe("getMonth", () => {
    it("should get month correctly", () => {
      expect(getMonth("2022-05-15")).toBe("May");
    });
  });

  describe("getDayOfMonth", () => {
    it("should get day of month correctly", () => {
      expect(getDayOfMonth("2022-05-15")).toBe("15");
    });
  });

  describe("getTimeIn12HourFormat", () => {
    it("should get time in 12-hour format correctly", () => {
      expect(getTimeIn12HourFormat("00:00")).toBe("12:00 AM");
      expect(getTimeIn12HourFormat("12:00")).toBe("12:00 PM");
      expect(getTimeIn12HourFormat("12:34")).toBe("12:34 PM");
      expect(getTimeIn12HourFormat("23:59")).toBe("11:59 PM");
    });
  });

  describe("formatBusinessHours", () => {
    it("should format business hours correctly", () => {
      expect(formatBusinessHours("09:00-17:00")).toBe("9:00AM-5:00PM");
      expect(formatBusinessHours("00:00-12:00")).toBe("12:00AM-12:00PM");
      expect(formatBusinessHours("15:30-23:45")).toBe("3:30PM-11:45PM");
      expect(formatBusinessHours("Closed")).toBe("Closed");
    });
  });

  describe("Edge Cases", () => {
    it("should handle invalid dates gracefully", () => {
      expect(formatDate(invalidDate)).toBe("Invalid Date");
      expect(formatDate(invalidDateString)).toBe("Invalid Date");

      expect(AWSFormatDate(invalidDate)).toBe("Invalid Date");
      expect(AWSFormatDate(invalidDateString)).toBe("Invalid Date");
      expect(AWSFormatDateTime(invalidDate)).toBe("Invalid Date");
      expect(AWSFormatDateTime(invalidDateString)).toBe("Invalid Date");
      expect(formatUSStandardDateTime(invalidDate)).toBe("Invalid Date");
      expect(formatUSStandardDateTime(invalidDateString)).toBe("Invalid Date");
    });

    it("should handle boundary values", () => {
      const startOfDay = new Date("2022-05-15T00:00:00Z");
      const endOfDay = new Date("2022-05-15T23:59:59Z");
      // Adjusting for New York timezone (EST)
      expect(formatUSStandardDateTime(startOfDay, "America/New_York")).toBe("05/14/2022, 08:00 PM");
      expect(formatUSStandardDateTime(endOfDay, "America/New_York")).toBe("05/15/2022, 07:59 PM");
    });

    it("should handle different date string formats", () => {
      const differentFormat = "15 May 2022 12:34:56 UTC";
      expect(formatDate(differentFormat)).toBe("05/15/2022");
    });
  });
});
